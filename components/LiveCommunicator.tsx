import React, { useState, useEffect, useRef } from 'react';
import Modal from './Modal';
import { Icon } from './Icon';
import Loader from './Loader';
import { ai } from '../services/geminiService';
import { encode, decode, decodeAudioData } from '../utils/audioUtils';
import { LiveServerMessage, Modality, Blob as GenaiBlob } from '@google/genai';

type SessionStatus = 'idle' | 'connecting' | 'active' | 'error' | 'ended';
type AvatarStatus = 'idle' | 'connecting' | 'listening' | 'speaking';

const LiveCommunicator: React.FC<{ isOpen: boolean; onClose: () => void; }> = ({ isOpen, onClose }) => {
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>('idle');
  const [avatarStatus, setAvatarStatus] = useState<AvatarStatus>('idle');
  const [transcriptions, setTranscriptions] = useState<{ user: string, model: string }[]>([]);
  const [currentTranscription, setCurrentTranscription] = useState<{ user: string, model: string }>({ user: '', model: '' });

  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const sessionRef = useRef<any>(null); // To hold the resolved session object
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const nextStartTimeRef = useRef(0);
  const outputSourcesRef = useRef(new Set<AudioBufferSourceNode>());
  const isSpeakingRef = useRef(false);

  const cleanup = () => {
    if (sessionRef.current) {
        try {
            sessionRef.current.close();
        } catch (e) {
            console.error("Error closing session:", e);
        }
        sessionRef.current = null;
    }
    
    if (scriptProcessorRef.current) {
        scriptProcessorRef.current.disconnect();
        scriptProcessorRef.current = null;
    }
    if (mediaStreamSourceRef.current) {
        mediaStreamSourceRef.current.disconnect();
        mediaStreamSourceRef.current = null;
    }
    if (inputAudioContextRef.current && inputAudioContextRef.current.state !== 'closed') {
        inputAudioContextRef.current.close();
        inputAudioContextRef.current = null;
    }
    if (outputAudioContextRef.current && outputAudioContextRef.current.state !== 'closed') {
        outputAudioContextRef.current.close();
        outputAudioContextRef.current = null;
    }
    outputSourcesRef.current.forEach(source => source.stop());
    outputSourcesRef.current.clear();
    nextStartTimeRef.current = 0;
    isSpeakingRef.current = false;
  };

  const startSession = async () => {
    setSessionStatus('connecting');
    setAvatarStatus('connecting');
    setTranscriptions([]);
    setCurrentTranscription({ user: '', model: '' });

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

        // FIX: Cast `window` to `any` to access `webkitAudioContext` for broader browser compatibility.
        inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        // FIX: Cast `window` to `any` to access `webkitAudioContext` for broader browser compatibility.
        outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        
        sessionPromiseRef.current = ai.live.connect({
            model: 'gemini-2.5-flash-native-audio-preview-09-2025',
            callbacks: {
                onopen: () => {
                    setSessionStatus('active');
                    setAvatarStatus('listening');
                },
                onmessage: async (message: LiveServerMessage) => {
                    // Handle Transcription
                    if (message.serverContent?.inputTranscription) {
                        setCurrentTranscription(prev => ({...prev, user: prev.user + message.serverContent!.inputTranscription!.text}));
                    }
                    if (message.serverContent?.outputTranscription) {
                        setCurrentTranscription(prev => ({...prev, model: prev.model + message.serverContent!.outputTranscription!.text}));
                    }
                    if (message.serverContent?.turnComplete) {
                        setTranscriptions(prev => [...prev, currentTranscription]);
                        setCurrentTranscription({user: '', model: ''});
                    }

                    // Handle Audio Output
                    const audioPart = message.serverContent?.modelTurn?.parts.find(p => p.inlineData?.mimeType.startsWith('audio/'));
                    const audioData = audioPart?.inlineData?.data;
                    if (audioData && outputAudioContextRef.current) {
                        isSpeakingRef.current = true;
                        setAvatarStatus('speaking');
                        
                        const ctx = outputAudioContextRef.current;
                        nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
                        
                        const audioBuffer = await decodeAudioData(decode(audioData), ctx, 24000, 1);
                        const source = ctx.createBufferSource();
                        source.buffer = audioBuffer;
                        source.connect(ctx.destination);
                        
                        source.onended = () => {
                            outputSourcesRef.current.delete(source);
                            if (outputSourcesRef.current.size === 0) {
                                isSpeakingRef.current = false;
                                setAvatarStatus('listening');
                            }
                        };

                        source.start(nextStartTimeRef.current);
                        nextStartTimeRef.current += audioBuffer.duration;
                        outputSourcesRef.current.add(source);
                    }
                },
                onerror: (e: ErrorEvent) => {
                    console.error('Session Error:', e);
                    setSessionStatus('error');
                    setAvatarStatus('idle');
                    cleanup();
                },
                onclose: () => {
                    setSessionStatus('ended');
                    setAvatarStatus('idle');
                    cleanup();
                },
            },
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
                systemInstruction: "You are a friendly and helpful English communication coach. Your name is Prism. Keep your responses concise and encourage the user to speak more.",
                inputAudioTranscription: {},
                outputAudioTranscription: {},
            },
        });
        
        sessionRef.current = await sessionPromiseRef.current;

        // Setup audio input streaming
        const source = inputAudioContextRef.current.createMediaStreamSource(stream);
        mediaStreamSourceRef.current = source;

        const processor = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);
        scriptProcessorRef.current = processor;
        
        processor.onaudioprocess = (audioProcessingEvent) => {
            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
            const pcmBlob: GenaiBlob = {
                data: encode(new Uint8Array(new Int16Array(inputData.map(x => x * 32768)).buffer)),
                mimeType: 'audio/pcm;rate=16000',
            };
            if (sessionRef.current) {
                 sessionRef.current.sendRealtimeInput({ media: pcmBlob });
            }
        };

        source.connect(processor);
        processor.connect(inputAudioContextRef.current.destination);

    } catch (e) {
        console.error("Failed to start session:", e);
        setSessionStatus('error');
        setAvatarStatus('idle');
        cleanup();
    }
  };

  const endSession = () => {
    cleanup();
    setSessionStatus('idle');
    setAvatarStatus('idle');
  };

  useEffect(() => {
    if (!isOpen) {
        endSession();
    }
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Live English Communicator" maxWidth="max-w-xl">
      <div className="p-6 flex flex-col h-[70vh]">
        <div className="flex-grow flex flex-col items-center justify-center text-center">
            <div className="relative mb-6">
                <div className={`w-32 h-32 rounded-full bg-gray-700/50 border-4 border-gray-600 transition-all duration-300 flex items-center justify-center
                    ${avatarStatus === 'listening' && 'animate-[pulse-glow_3s_ease-in-out_infinite] border-cyan-400'}
                    ${avatarStatus === 'speaking' && 'animate-[speaking-pulse_1s_ease-in-out_infinite] border-green-400 scale-105'}`}
                >
                    {avatarStatus === 'connecting' && <Loader />}
                    {(avatarStatus === 'listening' || avatarStatus === 'speaking') && <Icon as="microphone" className="w-12 h-12 text-gray-400" />}
                    {(avatarStatus === 'idle' && sessionStatus !== 'error') && <Icon as="bot" className="w-16 h-16 text-gray-500" />}
                </div>
            </div>
            <p className="font-semibold text-white h-5 mb-2">
                {sessionStatus === 'connecting' && "Connecting..."}
                {sessionStatus === 'active' && avatarStatus === 'listening' && "Listening..."}
                {sessionStatus === 'active' && avatarStatus === 'speaking' && "Prism is speaking..."}
                {sessionStatus === 'error' && "Connection Error"}
                {sessionStatus === 'ended' && "Session Ended"}
                {sessionStatus === 'idle' && "Ready to start"}
            </p>
            <p className="text-sm text-gray-400 min-h-[40px]">
                {sessionStatus === 'active' ? "Start speaking to practice your English." : "Click 'Start Session' to begin your conversation with Prism."}
            </p>
        </div>

        <div className="h-40 bg-black/20 rounded-lg p-3 overflow-y-auto border border-white/10 text-sm">
            {transcriptions.map((t, i) => (
                <div key={i} className="mb-2">
                    <p><strong className="text-cyan-400">You:</strong> {t.user}</p>
                    <p><strong className="text-purple-400">Prism:</strong> {t.model}</p>
                </div>
            ))}
            {sessionStatus === 'active' && (
                <div>
                     <p><strong className="text-cyan-400">You:</strong> {currentTranscription.user}<span className="animate-pulse">|</span></p>
                     <p><strong className="text-purple-400">Prism:</strong> {currentTranscription.model}{isSpeakingRef.current && <span className="animate-pulse">|</span>}</p>
                </div>
            )}
        </div>
        
        <div className="mt-4">
            {sessionStatus === 'idle' || sessionStatus === 'error' || sessionStatus === 'ended' ? (
                <button 
                    onClick={startSession}
                    className="w-full bg-green-600 text-white rounded-md px-6 py-2.5 font-semibold hover:bg-green-700 transition-colors"
                >
                    Start Session
                </button>
            ) : (
                <button 
                    onClick={endSession}
                    className="w-full bg-red-600 text-white rounded-md px-6 py-2.5 font-semibold hover:bg-red-700 transition-colors"
                >
                    End Session
                </button>
            )}
        </div>
      </div>
    </Modal>
  );
};

export default LiveCommunicator;