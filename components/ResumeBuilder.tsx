import React, { useState, useRef, useEffect } from 'react';
import Modal from './Modal';
import { ResumeData } from '../types';
import { enhanceResumeText } from '../services/geminiService';
import Loader from './Loader';

interface ResumeBuilderProps {
  isOpen: boolean;
  onClose: () => void;
}

const initialResumeData: ResumeData = {
  fullName: 'Your Name',
  email: 'your.email@example.com',
  phone: '123-456-7890',
  linkedin: 'linkedin.com/in/yourprofile',
  summary: 'A brief professional summary about you.',
  experience: [
    {
      title: 'Job Title',
      company: 'Company Name',
      date: 'Month Year - Present',
      description: '- Did cool things.\n- Managed a team.\n- Increased profits.',
    },
  ],
  education: [
    {
      degree: 'Degree or Certificate',
      school: 'University or School Name',
      date: 'Month Year - Month Year',
    },
  ],
  skills: 'React, TypeScript, Node.js, UI/UX Design, Figma',
};

const ResumeBuilder: React.FC<ResumeBuilderProps> = ({ isOpen, onClose }) => {
  const [resumeData, setResumeData] = useState<ResumeData>(initialResumeData);
  const [template, setTemplate] = useState<'modern' | 'classic' | 'creative'>('modern');
  const [enhancingIndex, setEnhancingIndex] = useState<number | null>(null);
  const [isDownloadMenuOpen, setIsDownloadMenuOpen] = useState(false);
  const downloadMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (downloadMenuRef.current && !downloadMenuRef.current.contains(event.target as Node)) {
        setIsDownloadMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setResumeData(prev => ({ ...prev, [name]: value }));
  };

  const handleExperienceChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, index: number) => {
    const { name, value } = e.target;
    const newExperience = [...resumeData.experience];
    newExperience[index] = { ...newExperience[index], [name]: value };
    setResumeData(prev => ({ ...prev, experience: newExperience }));
  };
  
  const handleEducationChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const { name, value } = e.target;
    const newEducation = [...resumeData.education];
    newEducation[index] = { ...newEducation[index], [name]: value };
    setResumeData(prev => ({ ...prev, education: newEducation }));
  };


  const handleEnhance = async (index: number) => {
    setEnhancingIndex(index);
    const originalText = resumeData.experience[index].description;
    try {
      const enhancedText = await enhanceResumeText(originalText);
      handleExperienceChange({ target: { name: 'description', value: enhancedText } } as any, index);
    } catch (error) {
      console.error("Failed to enhance text:", error);
      alert("Could not enhance text. Please try again.");
    } finally {
      setEnhancingIndex(null);
    }
  };

  const generateTxtContent = (): string => {
    const { fullName, email, phone, linkedin, summary, experience, education, skills } = resumeData;
    let content = `${fullName}\n${email} | ${phone} | ${linkedin}\n\n`;
    content += `SUMMARY\n${'-'.repeat(20)}\n${summary}\n\n`;
    content += `EXPERIENCE\n${'-'.repeat(20)}\n`;
    experience.forEach(exp => {
      content += `${exp.title.toUpperCase()} | ${exp.company}\n${exp.date}\n`;
      content += `${exp.description}\n\n`;
    });
    content += `EDUCATION\n${'-'.repeat(20)}\n`;
    education.forEach(edu => {
        content += `${edu.degree} | ${edu.school}\n${edu.date}\n\n`;
    });
    content += `SKILLS\n${'-'.repeat(20)}\n${skills}\n`;
    return content;
  };


  const handleDownload = (format: 'pdf' | 'txt') => {
    setIsDownloadMenuOpen(false);
    if (format === 'pdf') {
      window.print();
    } else {
      const content = generateTxtContent();
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `resume_${resumeData.fullName.replace(/\s/g, '_')}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };


  return (
    <Modal isOpen={isOpen} onClose={onClose} title="AI-Powered Resume Builder" maxWidth="max-w-6xl">
      <div className="flex h-[85vh]">
        {/* Form Section */}
        <div className="w-1/2 p-6 border-r border-white/10 overflow-y-auto no-print">
          <h3 className="text-lg font-semibold mb-4 text-cyan-400">Template</h3>
          <div className="flex space-x-4 mb-6">
            <button onClick={() => setTemplate('modern')} className={`px-4 py-2 rounded-md text-sm ${template === 'modern' ? 'bg-cyan-500 text-white' : 'bg-white/10'}`}>Modern</button>
            <button onClick={() => setTemplate('classic')} className={`px-4 py-2 rounded-md text-sm ${template === 'classic' ? 'bg-cyan-500 text-white' : 'bg-white/10'}`}>Classic</button>
            <button onClick={() => setTemplate('creative')} className={`px-4 py-2 rounded-md text-sm ${template === 'creative' ? 'bg-cyan-500 text-white' : 'bg-white/10'}`}>Creative</button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400">Full Name</label>
              <input type="text" name="fullName" value={resumeData.fullName} onChange={handleInputChange} className="w-full bg-black/20 border border-white/10 rounded mt-1 p-2 text-sm" />
            </div>
             <div>
              <label className="text-sm text-gray-400">Email</label>
              <input type="email" name="email" value={resumeData.email} onChange={handleInputChange} className="w-full bg-black/20 border border-white/10 rounded mt-1 p-2 text-sm" />
            </div>
             <div>
              <label className="text-sm text-gray-400">Phone</label>
              <input type="tel" name="phone" value={resumeData.phone} onChange={handleInputChange} className="w-full bg-black/20 border border-white/10 rounded mt-1 p-2 text-sm" />
            </div>
            <div>
              <label className="text-sm text-gray-400">LinkedIn</label>
              <input type="text" name="linkedin" value={resumeData.linkedin} onChange={handleInputChange} className="w-full bg-black/20 border border-white/10 rounded mt-1 p-2 text-sm" />
            </div>
             <div>
              <label className="text-sm text-gray-400">Summary</label>
              <textarea name="summary" value={resumeData.summary} onChange={handleInputChange} rows={3} className="w-full bg-black/20 border border-white/10 rounded mt-1 p-2 text-sm" />
            </div>
             <div>
              <h3 className="text-lg font-semibold my-4 text-cyan-400">Experience</h3>
              {resumeData.experience.map((exp, index) => (
                <div key={index} className="space-y-2 p-3 border border-white/10 rounded-md mb-4">
                  <input type="text" name="title" placeholder="Job Title" value={exp.title} onChange={(e) => handleExperienceChange(e, index)} className="w-full bg-black/20 border border-white/10 rounded p-2 text-sm" />
                  <input type="text" name="company" placeholder="Company" value={exp.company} onChange={(e) => handleExperienceChange(e, index)} className="w-full bg-black/20 border border-white/10 rounded p-2 text-sm" />
                  <input type="text" name="date" placeholder="Date" value={exp.date} onChange={(e) => handleExperienceChange(e, index)} className="w-full bg-black/20 border border-white/10 rounded p-2 text-sm" />
                  <textarea name="description" placeholder="Description" value={exp.description} onChange={(e) => handleExperienceChange(e, index)} rows={4} className="w-full bg-black/20 border border-white/10 rounded p-2 text-sm" />
                   <button onClick={() => handleEnhance(index)} disabled={enhancingIndex === index} className="text-sm bg-white/10 text-cyan-300 px-3 py-1 rounded-md hover:bg-white/20 transition-colors w-full flex items-center justify-center space-x-2 disabled:opacity-50">
                     {enhancingIndex === index ? <Loader/> : (
                       <>
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                         <span>AI Enhance</span>
                       </>
                     )}
                   </button>
                </div>
              ))}
            </div>
            <div>
              <h3 className="text-lg font-semibold my-4 text-cyan-400">Education</h3>
               {resumeData.education.map((edu, index) => (
                <div key={index} className="space-y-2 p-3 border border-white/10 rounded-md mb-4">
                  <input type="text" name="degree" placeholder="Degree" value={edu.degree} onChange={(e) => handleEducationChange(e, index)} className="w-full bg-black/20 border border-white/10 rounded p-2 text-sm" />
                  <input type="text" name="school" placeholder="School/University" value={edu.school} onChange={(e) => handleEducationChange(e, index)} className="w-full bg-black/20 border border-white/10 rounded p-2 text-sm" />
                  <input type="text" name="date" placeholder="Date" value={edu.date} onChange={(e) => handleEducationChange(e, index)} className="w-full bg-black/20 border border-white/10 rounded p-2 text-sm" />
                </div>
              ))}
            </div>
             <div>
              <label className="text-sm text-gray-400">Skills</label>
              <input type="text" name="skills" value={resumeData.skills} onChange={handleInputChange} placeholder="Comma-separated skills" className="w-full bg-black/20 border border-white/10 rounded mt-1 p-2 text-sm" />
            </div>
            <div className="relative mt-4">
                <button
                onClick={() => setIsDownloadMenuOpen(prev => !prev)}
                className="w-full bg-cyan-500 text-white py-2 rounded-md hover:bg-cyan-600 flex items-center justify-center space-x-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    <span>Download</span>
                </button>
                {isDownloadMenuOpen && (
                <div ref={downloadMenuRef} className="absolute bottom-full mb-2 w-full bg-gray-800/80 backdrop-blur-lg border border-white/10 rounded-md shadow-lg z-10">
                    <button onClick={() => handleDownload('pdf')} className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-white/10 transition-colors rounded-t-md">As PDF (.pdf)</button>
                    <button onClick={() => handleDownload('txt')} className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-white/10 transition-colors rounded-b-md">As Plain Text (.txt)</button>
                </div>
                )}
            </div>
          </div>
        </div>
        {/* Preview Section */}
        <div className="w-1/2 p-6 bg-black/20 overflow-y-auto">
          <div id="resume-preview" className={`bg-white text-gray-800 p-8 shadow-lg h-full mx-auto aspect-[8.5/11] max-w-full`}>
            {template === 'modern' ? <ModernTemplate data={resumeData} /> : template === 'classic' ? <ClassicTemplate data={resumeData} /> : <CreativeTemplate data={resumeData} />}
          </div>
        </div>
      </div>
    </Modal>
  );
};

const ModernTemplate: React.FC<{ data: ResumeData }> = ({ data }) => (
    <div>
        <h1 className="text-3xl font-bold text-cyan-700 uppercase tracking-wider">{data.fullName}</h1>
        <div className="flex justify-between text-xs mt-2 border-b-2 border-gray-200 pb-2">
            <span>{data.email}</span>
            <span>{data.phone}</span>
            <span>{data.linkedin}</span>
        </div>
        <div className="mt-4">
            <h2 className="text-sm font-bold uppercase text-cyan-700 tracking-widest">Summary</h2>
            <p className="text-xs mt-1">{data.summary}</p>
        </div>
        <div className="mt-4">
            <h2 className="text-sm font-bold uppercase text-cyan-700 tracking-widest">Experience</h2>
            {data.experience.map((exp, i) => (
                <div key={i} className="mt-2">
                    <div className="flex justify-between items-baseline">
                        <h3 className="font-bold text-sm">{exp.title}</h3>
                        <span className="text-xs font-light">{exp.date}</span>
                    </div>
                    <h4 className="text-xs font-semibold italic">{exp.company}</h4>
                    <ul className="list-disc list-inside text-xs mt-1 space-y-1">
                        {exp.description.split('\n').map((line, j) => line.trim() && <li key={j}>{line.replace(/^-/, '').trim()}</li>)}
                    </ul>
                </div>
            ))}
        </div>
        <div className="mt-4">
            <h2 className="text-sm font-bold uppercase text-cyan-700 tracking-widest">Education</h2>
            {data.education.map((edu, i) => (
                 <div key={i} className="mt-2">
                    <div className="flex justify-between items-baseline">
                        <h3 className="font-bold text-sm">{edu.degree}</h3>
                        <span className="text-xs font-light">{edu.date}</span>
                    </div>
                    <h4 className="text-xs font-semibold italic">{edu.school}</h4>
                </div>
            ))}
        </div>
        <div className="mt-4">
            <h2 className="text-sm font-bold uppercase text-cyan-700 tracking-widest">Skills</h2>
            <p className="text-xs mt-1">{data.skills}</p>
        </div>
    </div>
);

const ClassicTemplate: React.FC<{ data: ResumeData }> = ({ data }) => (
    <div className="font-serif">
        <h1 className="text-4xl text-center font-bold">{data.fullName}</h1>
        <p className="text-center text-sm mt-2">{data.email} | {data.phone} | {data.linkedin}</p>
        <div className="mt-6">
            <h2 className="text-lg font-bold border-b border-gray-800 pb-1">Summary</h2>
            <p className="text-sm mt-2">{data.summary}</p>
        </div>
        <div className="mt-6">
            <h2 className="text-lg font-bold border-b border-gray-800 pb-1">Experience</h2>
            {data.experience.map((exp, i) => (
                <div key={i} className="mt-3">
                    <div className="flex justify-between">
                        <h3 className="font-bold">{exp.title} at {exp.company}</h3>
                        <span className="text-sm">{exp.date}</span>
                    </div>
                    <ul className="list-disc list-inside text-sm mt-1 ml-4 space-y-1">
                        {exp.description.split('\n').map((line, j) => line.trim() && <li key={j}>{line.replace(/^-/, '').trim()}</li>)}
                    </ul>
                </div>
            ))}
        </div>
        <div className="mt-6">
            <h2 className="text-lg font-bold border-b border-gray-800 pb-1">Education</h2>
            {data.education.map((edu, i) => (
                <div key={i} className="mt-3">
                    <div className="flex justify-between">
                        <h3 className="font-bold">{edu.degree} - {edu.school}</h3>
                        <span className="text-sm">{edu.date}</span>
                    </div>
                </div>
            ))}
        </div>
         <div className="mt-6">
            <h2 className="text-lg font-bold border-b border-gray-800 pb-1">Skills</h2>
            <p className="text-sm mt-2">{data.skills}</p>
        </div>
    </div>
);

const CreativeTemplate: React.FC<{ data: ResumeData }> = ({ data }) => (
    <div className="flex font-sans h-full text-xs">
        <div className="w-1/3 bg-gray-100 p-6 flex flex-col">
            <h1 className="text-2xl font-bold text-cyan-800">{data.fullName}</h1>
             <div className="mt-8 space-y-4">
                <div>
                    <h2 className="text-sm font-bold uppercase text-cyan-800 tracking-widest mb-1">Contact</h2>
                    <p>{data.email}</p>
                    <p>{data.phone}</p>
                    <p>{data.linkedin}</p>
                </div>
                <div>
                    <h2 className="text-sm font-bold uppercase text-cyan-800 tracking-widest mb-1">Education</h2>
                    {data.education.map((edu, i) => (
                         <div key={i} className="mt-1">
                            <h3 className="font-bold">{edu.degree}</h3>
                            <h4 className="font-semibold">{edu.school}</h4>
                            <span className="font-light">{edu.date}</span>
                        </div>
                    ))}
                </div>
                 <div>
                    <h2 className="text-sm font-bold uppercase text-cyan-800 tracking-widest mb-1">Skills</h2>
                    <p>{data.skills}</p>
                </div>
            </div>
        </div>
        <div className="w-2/3 p-6">
            <div>
                <h2 className="text-lg font-bold uppercase text-gray-700 tracking-widest">Summary</h2>
                <p className="mt-2 border-l-2 border-cyan-500 pl-3">{data.summary}</p>
            </div>
             <div className="mt-6">
                <h2 className="text-lg font-bold uppercase text-gray-700 tracking-widest">Experience</h2>
                {data.experience.map((exp, i) => (
                    <div key={i} className="mt-4">
                        <div className="flex justify-between items-baseline">
                            <h3 className="font-bold text-base">{exp.title}</h3>
                            <span className="font-light text-gray-600">{exp.date}</span>
                        </div>
                        <h4 className="font-semibold italic text-gray-500">{exp.company}</h4>
                        <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                            {exp.description.split('\n').map((line, j) => line.trim() && <li key={j}>{line.replace(/^-/, '').trim()}</li>)}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

export default ResumeBuilder;