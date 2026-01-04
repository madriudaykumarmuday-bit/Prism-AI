import { useState, useCallback, useEffect, useRef } from 'react';
import { ChatMessage, MessageRole, Language, GroundingChunk, UserProfile, Conversation } from '../types';
import { saveConversation } from '../services/apiService';
import { ai } from '../services/geminiService';

const readAsBase64 = (file: File): Promise<string> => {
    return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

const convertAvifToJpeg = async (file: File): Promise<{ base64Data: string, mimeType: string }> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                reject(new Error('Failed to get canvas context'));
                return;
            }
            ctx.drawImage(img, 0, 0);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
            const base64Data = dataUrl.split(',')[1];
            resolve({ base64Data, mimeType: 'image/jpeg' });
            URL.revokeObjectURL(img.src); // Clean up
        };
        img.onerror = (e) => {
            URL.revokeObjectURL(img.src);
            reject(new Error('Failed to load AVIF image for conversion'));
        };
        img.src = URL.createObjectURL(file);
    });
};

const getRealTimeResponse = (text: string, language: Language): string | null => {
    const lowerText = text.toLowerCase().trim().replace(/[?.]/g, '');
    const now = new Date();

    const createModifiedDate = () => {
        const modifiedDate = new Date();
        modifiedDate.setFullYear(2025);
        return modifiedDate;
    };

    if (language === 'English') {
        if (/\b(time|date|year|day)\b/.test(lowerText)) {
            const modifiedDate = createModifiedDate();
            return `The current date and time is ${modifiedDate.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}, ${now.toLocaleTimeString()}.`;
        }
    } else if (language === 'Telugu') {
        if (lowerText.includes('సమయం') || lowerText.includes('తేది') || lowerText.includes('సంవత్సరం') || lowerText.includes('రోజు')) {
            const modifiedDate = createModifiedDate();
            const teluguLocale = 'te-IN';
            return `ప్రస్తుత తేది మరియు సమయం ${modifiedDate.toLocaleDateString(teluguLocale, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}, ${now.toLocaleTimeString(teluguLocale)}.`;
        }
    }
    return null;
};

interface UseChatProps {
    language: Language;
    user: UserProfile;
    activeConversation: Conversation | null;
    onConversationUpdate: (updatedConversation: Conversation) => void;
}

export const useChat = ({ language, user, activeConversation, onConversationUpdate }: UseChatProps) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const conversationRef = useRef(activeConversation);
    conversationRef.current = activeConversation;

    useEffect(() => {
        setMessages(activeConversation?.messages || []);
        setError(null);
    }, [activeConversation]);

    const sendMessage = useCallback(async (text: string, attachment: File | null, isWebSearchEnabled: boolean) => {
        if ((!text.trim() && !attachment)) return;

        setIsLoading(true);
        setError(null);

        let attachmentData;
        if (attachment) {
            try {
                if (attachment.type === 'image/avif') {
                    const { base64Data, mimeType } = await convertAvifToJpeg(attachment);
                    attachmentData = {
                        url: URL.createObjectURL(attachment),
                        base64Data,
                        mimeType,
                    };
                } else {
                    const base64Data = await readAsBase64(attachment);
                    attachmentData = {
                        url: URL.createObjectURL(attachment),
                        base64Data,
                        mimeType: attachment.type,
                    };
                }
            } catch (e: any) {
                setError(`Failed to read attachment: ${e.message}`);
                setIsLoading(false);
                return;
            }
        }

        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            role: MessageRole.USER,
            content: text,
            ...(attachmentData && { attachment: attachmentData })
        };

        const updatedMessages = [...messages, userMessage];
        setMessages(updatedMessages);

        const realTimeResponse = getRealTimeResponse(text, language);
        if (realTimeResponse) {
            const modelMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: MessageRole.MODEL,
                content: realTimeResponse,
            };
            const finalMessages = [...updatedMessages, modelMessage];
            setMessages(finalMessages);
            const conversationToSave = conversationRef.current
                ? { ...conversationRef.current, messages: finalMessages, lastUpdated: Date.now() }
                : { id: Date.now().toString(), userId: user.id, title: text.substring(0, 30), messages: finalMessages, lastUpdated: Date.now() };

            const saved = await saveConversation(conversationToSave);
            onConversationUpdate(saved);
            setIsLoading(false);
            return;
        }

        const modelMessageId = (Date.now() + 1).toString();
        const modelMessagePlaceholder: ChatMessage = {
            id: modelMessageId,
            role: MessageRole.MODEL,
            content: '',
        };

        setMessages(prev => [...prev, modelMessagePlaceholder]);

        try {
            const history = updatedMessages.map(msg => {
                const parts = [];
                if (msg.attachment) {
                    parts.push({ inlineData: { data: msg.attachment.base64Data, mimeType: msg.attachment.mimeType } });
                }
                if (msg.content) {
                    parts.push({ text: msg.content });
                }
                return { role: msg.role, parts };
            });

            let systemInstruction = `You are Prism AI, a helpful, friendly, and professional AI assistant. You are speaking with ${user.name}. When asked about your identity, creator, or who trained you, you must state that you were trained by your boss, M Uday Kumar. Format your responses using markdown.

**CRITICAL INSTRUCTION:** If the user asks for a code snippet, algorithm, or a solution to a programming problem (e.g., "how to find a palindrome in python"), you MUST provide the solution in multiple popular programming languages. Please include examples in Python, JavaScript, Java, and C++. Each solution must be in its own separate, clearly labeled markdown code block.`;

            const stream = await ai.models.generateContentStream({
                model: 'gemini-2.5-flash',
                contents: history,
                config: {
                    systemInstruction: systemInstruction,
                    ...(isWebSearchEnabled && { tools: [{ googleSearch: {} }] })
                }
            });

            let accumulatedContent = '';
            let accumulatedChunks: GroundingChunk[] = [];

            for await (const chunk of stream) {
                accumulatedContent += chunk.text;
                const chunkGroundingMetadata = chunk.candidates?.[0]?.groundingMetadata;
                if (chunkGroundingMetadata?.groundingChunks) {
                    accumulatedChunks.push(...(chunkGroundingMetadata.groundingChunks as GroundingChunk[]));
                }
                setMessages(prev =>
                    prev.map(msg =>
                        msg.id === modelMessageId
                            ? { ...msg, content: accumulatedContent, groundingChunks: accumulatedChunks.length > 0 ? [...new Set(accumulatedChunks)] : undefined }
                            : msg
                    )
                );
            }

            const finalModelMessage = {
                id: modelMessageId,
                role: MessageRole.MODEL,
                content: accumulatedContent,
                groundingChunks: accumulatedChunks.length > 0 ? [...new Set(accumulatedChunks)] : undefined
            };

            const finalMessages = [...updatedMessages, finalModelMessage];

            let conversationToSave = conversationRef.current;
            if (conversationToSave) {
                conversationToSave = { ...conversationToSave, messages: finalMessages, lastUpdated: Date.now() };
            } else {
                const titleResponse = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: `Generate a very short, concise title (4-5 words max) for the following user prompt: "${text}"`,
                });
                const title = titleResponse.text.replace(/"/g, '');
                conversationToSave = { id: Date.now().toString(), userId: user.id, title, messages: finalMessages, lastUpdated: Date.now() };
            }

            const saved = await saveConversation(conversationToSave);
            onConversationUpdate(saved);

        } catch (e: any) {
            console.error(e);
            const errorMessage = `Failed to get response. Please check your API key and network connection. Error: ${e.message}`;
            setError(errorMessage);
            setMessages(prev =>
                prev.map(msg =>
                    msg.id === modelMessageId ? { ...msg, content: errorMessage } : msg
                )
            );
        } finally {
            setIsLoading(false);
        }
    }, [messages, language, user, onConversationUpdate]);

    return { messages, setMessages, sendMessage, isLoading, error };
};