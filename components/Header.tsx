import React, { useState, useEffect, useRef } from 'react';
import { Icon } from './Icon';
import { Language, UserProfile } from '../types';
import AssessmentCreator from './AssessmentCreator';
import CodeRunner from './CodeRunner';
import ImageGenerator from './ImageGenerator';
import LearningHub from './LearningHub';
import LogoCreator from './LogoCreator';
import MindsetAnalyzer from './MindsetAnalyzer';
import PresentationGenerator from './PresentationGenerator';
import ProjectIdeaGenerator from './ProjectIdeaGenerator';
import ResumeBuilder from './ResumeBuilder';
import StudentSuccessHub from './StudentSuccessHub';
import WebSearchPanel from './WebSearchPanel';
import CourseCreator from './CourseCreator';
import InterviewPrepHub from './InterviewPrepHub';
import Clock from './Clock';
import Calendar from './Calendar';
import StoryWeaver from './StoryWeaver';
import ImageEditor from './ImageEditor';
import DataVisualizer from './DataVisualizer';
import SoftwareCompanyFinder from './SoftwareCompanyFinder';
import WebsiteCreator from './WebsiteCreator';
import TripPlanner from './TripPlanner';
import VideoGenerator from './VideoGenerator';
import UserProfileModal from './UserProfileModal';
import BlueprintModal from './BlueprintModal';
import FreeCoursesFinder from './FreeCoursesFinder';
import BusinessIdeaSketch from './BusinessIdeaSketch';
import TaskReacher from './TaskReacher';
import LiveCommunicator from './LiveCommunicator';
import ProgrammingVisualizer from './ProgrammingVisualizer';

export interface AITool {
  name: string;
  description: string;
  icon: 'book-open' | 'academic-cap' | 'chart-pie' | 'code-bracket' | 'photo' | 'swatch' | 'presentation-chart-bar' | 'light-bulb' | 'identification' | 'school' | 'search' | 'collection' | 'puzzle-piece' | 'calendar' | 'beaker' | 'wand' | 'chart-bar' | 'building-office' | 'window' | 'map-pin' | 'video-camera' | 'gift' | 'sparkles' | 'chat-bubble-left-right';
}

export const aiTools: AITool[] = [
    // Productivity & Planning
    { name: 'Business Idea Sketch', icon: 'sparkles', description: 'Flesh out a business idea into a structured one-page plan.' },
    { name: 'Calendar', icon: 'calendar', description: 'View an interactive monthly calendar for quick date lookups.' },
    { name: 'Web Search', icon: 'search', description: 'Perform a deep-dive web search with sourced, downloadable results.' },
    { name: 'AI Trip Planner', icon: 'map-pin', description: 'Plan a detailed day-by-day travel itinerary for any destination.' },
    { name: 'Project Idea Generator', icon: 'light-bulb', description: 'Brainstorm creative project ideas for any topic or technology.' },
    { name: 'Presentation Generator', icon: 'presentation-chart-bar', description: 'Create a slide-by-slide presentation outline, exportable to PowerPoint.' },
    { name: 'Software Companies', icon: 'building-office', description: 'Research software companies with AI-generated profiles and resources.' },
    
    // Learning & Career
    { name: 'Live Communicator', icon: 'chat-bubble-left-right', description: 'Practice your English by having a real-time spoken conversation with an AI.' },
    { name: 'Task Reacher', icon: 'puzzle-piece', description: 'Get step-by-step guidance on any task, from homework to complex projects.' },
    { name: 'Free Courses Finder', icon: 'gift', description: 'Discover the best free courses and learning resources on any subject.' },
    { name: 'Course Creator', icon: 'collection', description: 'Generate a full course outline with curated YouTube video resources.' },
    { name: 'Learning Hub', icon: 'book-open', description: 'Generate a structured learning module on any topic to study.' },
    { name: 'Student Success Hub', icon: 'school', description: 'Practice for exams with AI-generated quizzes for grades 1-10.' },
    { name: 'Interview Prep Hub', icon: 'puzzle-piece', description: 'Prepare for job interviews with aptitude and reasoning assessments.' },
    { name: 'Resume Builder', icon: 'identification', description: 'Build a professional resume with multiple templates and AI enhancement.' },
    { name: 'Mindset Analyzer', icon: 'chart-pie', description: 'Discover your professional strengths with a personalized career quiz.' },
    { name: 'Create Assessment', icon: 'academic-cap', description: 'Generate a quiz from your current conversation or learning content.' },

    // Creative & Content
    { name: 'AI Story Weaver', icon: 'beaker', description: 'Write and illustrate a short story from a simple idea.' },
    { name: 'Image Editor', icon: 'wand', description: 'Magically edit your images using a simple text description.' },
    { name: 'Generate Image', icon: 'photo', description: 'Create high-quality, original images from a text prompt.' },
    { name: 'Logo Creator', icon: 'swatch', description: 'Design four unique logo concepts for your brand or project.' },
    { name: 'AI Video Generator', icon: 'video-camera', description: 'Create short videos from a text prompt or by animating an image.' },

    // Development & Data
    { name: 'Code Runner', icon: 'code-bracket', description: 'Write, execute, debug, and explain code in multiple languages.' },
    { name: 'Data Visualizer', icon: 'chart-bar', description: 'Generate interactive charts and graphs from your raw data.' },
    { name: 'Programming Visualizer', icon: 'code-bracket', description: 'Visualize algorithms and data structures with interactive animations.' },
    { name: 'Website Creator', icon: 'window', description: 'Describe a website and get the complete HTML, CSS, and JS files in a zip.' },
];


interface HeaderProps {
  user: UserProfile;
  onLogout: () => void;
  onUpdateProfile: (updatedProfile: UserProfile) => void;
  currentLanguage: Language;
  onLanguageChange: (lang: Language) => void;
  learningContext: string;
  isSidebarVisible: boolean;
  onToggleSidebar: () => void;
  isDictionaryVisible: boolean;
  onToggleDictionary: () => void;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
    user, 
    onLogout, 
    onUpdateProfile, 
    currentLanguage, 
    onLanguageChange, 
    learningContext,
    isSidebarVisible,
    onToggleSidebar,
    isDictionaryVisible,
    onToggleDictionary,
    onOpenSettings
}) => {
  const [isToolkitOpen, setIsToolkitOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  // Modal states for each tool
  const [isAssessmentOpen, setIsAssessmentOpen] = useState(false);
  const [isCodeRunnerOpen, setIsCodeRunnerOpen] = useState(false);
  const [isImageGeneratorOpen, setIsImageGeneratorOpen] = useState(false);
  const [isLearningHubOpen, setIsLearningHubOpen] = useState(false);
  const [isLogoCreatorOpen, setIsLogoCreatorOpen] = useState(false);
  const [isMindsetAnalyzerOpen, setIsMindsetAnalyzerOpen] = useState(false);
  const [isPresentationGeneratorOpen, setIsPresentationGeneratorOpen] = useState(false);
  const [isProjectIdeaGeneratorOpen, setIsProjectIdeaGeneratorOpen] = useState(false);
  const [isResumeBuilderOpen, setIsResumeBuilderOpen] = useState(false);
  const [isStudentSuccessHubOpen, setIsStudentSuccessHubOpen] = useState(false);
  const [isWebSearchPanelOpen, setIsWebSearchPanelOpen] = useState(false);
  const [isCourseCreatorOpen, setIsCourseCreatorOpen] = useState(false);
  const [isInterviewPrepOpen, setIsInterviewPrepOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isStoryWeaverOpen, setIsStoryWeaverOpen] = useState(false);
  const [isImageEditorOpen, setIsImageEditorOpen] = useState(false);
  const [isDataVisualizerOpen, setIsDataVisualizerOpen] = useState(false);
  const [isSoftwareCompanyFinderOpen, setIsSoftwareCompanyFinderOpen] = useState(false);
  const [isWebsiteCreatorOpen, setIsWebsiteCreatorOpen] = useState(false);
  const [isTripPlannerOpen, setIsTripPlannerOpen] = useState(false);
  const [isVideoGeneratorOpen, setIsVideoGeneratorOpen] = useState(false);
  const [isFreeCoursesFinderOpen, setIsFreeCoursesFinderOpen] = useState(false);
  const [isUserProfileOpen, setIsUserProfileOpen] = useState(false);
  const [isBlueprintOpen, setIsBlueprintOpen] = useState(false);
  const [isBusinessIdeaSketchOpen, setIsBusinessIdeaSketchOpen] = useState(false);
  const [isTaskReacherOpen, setIsTaskReacherOpen] = useState(false);
  const [isLiveCommunicatorOpen, setIsLiveCommunicatorOpen] = useState(false);
  const [isProgrammingVisualizerOpen, setIsProgrammingVisualizerOpen] = useState(false);

  const [modalContext, setModalContext] = useState('');

  
  const toolkitRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (toolkitRef.current && !toolkitRef.current.contains(event.target as Node)) {
        setIsToolkitOpen(false);
      }
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setIsLangOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Listen for global event to open blueprint modal from WelcomeScreen
  useEffect(() => {
    const handleOpen = () => {
        setIsBlueprintOpen(true);
    };
    window.addEventListener('openBlueprint', handleOpen);
    return () => {
        window.removeEventListener('openBlueprint', handleOpen);
    };
  }, []);

  const handleToolLaunch = (toolName: string) => {
    setIsToolkitOpen(false);
    if (toolName === 'Create Assessment') {
        setModalContext(''); // Use context from chat
        setIsAssessmentOpen(true);
    } 
    else if (toolName === 'Code Runner') setIsCodeRunnerOpen(true);
    else if (toolName === 'Generate Image') setIsImageGeneratorOpen(true);
    else if (toolName === 'Image Editor') setIsImageEditorOpen(true);
    else if (toolName === 'Learning Hub') setIsLearningHubOpen(true);
    else if (toolName === 'Logo Creator') setIsLogoCreatorOpen(true);
    else if (toolName === 'Mindset Analyzer') setIsMindsetAnalyzerOpen(true);
    else if (toolName === 'Presentation Generator') setIsPresentationGeneratorOpen(true);
    else if (toolName === 'Project Idea Generator') setIsProjectIdeaGeneratorOpen(true);
    else if (toolName === 'Resume Builder') setIsResumeBuilderOpen(true);
    else if (toolName === 'Student Success Hub') setIsStudentSuccessHubOpen(true);
    else if (toolName === 'Web Search') setIsWebSearchPanelOpen(true);
    else if (toolName === 'Course Creator') setIsCourseCreatorOpen(true);
    else if (toolName === 'Interview Prep Hub') setIsInterviewPrepOpen(true);
    else if (toolName === 'Calendar') setIsCalendarOpen(true);
    else if (toolName === 'AI Story Weaver') setIsStoryWeaverOpen(true);
    else if (toolName === 'Data Visualizer') setIsDataVisualizerOpen(true);
    else if (toolName === 'Software Companies') setIsSoftwareCompanyFinderOpen(true);
    else if (toolName === 'Website Creator') setIsWebsiteCreatorOpen(true);
    else if (toolName === 'AI Trip Planner') setIsTripPlannerOpen(true);
    else if (toolName === 'AI Video Generator') setIsVideoGeneratorOpen(true);
    else if (toolName === 'Free Courses Finder') setIsFreeCoursesFinderOpen(true);
    else if (toolName === 'Business Idea Sketch') setIsBusinessIdeaSketchOpen(true);
    else if (toolName === 'Task Reacher') setIsTaskReacherOpen(true);
    else if (toolName === 'Live Communicator') setIsLiveCommunicatorOpen(true);
    else if (toolName === 'Programming Visualizer') setIsProgrammingVisualizerOpen(true);
  };

  const handleCreateAssessmentFromHub = (context: string) => {
    setModalContext(context);
    setIsLearningHubOpen(false);
    setIsAssessmentOpen(true);
  };

  const handleLangChange = (lang: Language) => {
    onLanguageChange(lang);
    setIsLangOpen(false);
  };

  return (
    <>
      <header className="relative flex items-center justify-between p-4 border-b border-white/10 bg-black/20 backdrop-blur-lg flex-shrink-0 z-30">
        <div className="flex items-center gap-3">
          <button 
            onClick={onToggleSidebar}
            className={`p-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-500 ${isSidebarVisible ? 'bg-white/10 text-white' : 'text-gray-300 hover:text-white hover:bg-white/10'}`}
            aria-label="Toggle new chat sidebar"
          >
            <Icon as="chat-bubble-left-right" className="w-6 h-6" />
          </button>
          <Icon as="prism" className="w-8 h-8 text-cyan-400" />
          <h1 className="text-xl font-semibold text-gray-200">Prism AI</h1>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <Clock />
          {/* AI Tool Kit */}
          <div className="relative" ref={toolkitRef}>
            <button
              onClick={() => setIsToolkitOpen(prev => !prev)}
              className="p-2 rounded-full text-gray-300 hover:text-white hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-500"
              aria-haspopup="true"
              aria-expanded={isToolkitOpen}
              aria-label="Open AI Tool Kit"
            >
              <Icon as="briefcase" className="w-6 h-6" />
            </button>

            {isToolkitOpen && (
              <div className="absolute right-0 mt-2 w-[28rem] origin-top-right bg-gray-900/80 backdrop-blur-lg border border-white/10 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-10 max-h-[70vh] overflow-y-auto">
                <div className="p-2 grid grid-cols-2 gap-2">
                  {aiTools.map((tool) => (
                    <button
                      key={tool.name}
                      onClick={() => handleToolLaunch(tool.name)}
                      className="p-4 bg-black/20 rounded-lg border border-transparent hover:border-cyan-400 hover:bg-cyan-900/30 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-left"
                    >
                      <div className="flex items-start gap-3">
                        <Icon as={tool.icon} className="w-7 h-7 text-cyan-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="text-sm font-semibold text-gray-100">{tool.name}</span>
                          <p className="text-xs text-gray-400 mt-1">{tool.description}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Language Selector */}
          <div className="relative" ref={langRef}>
              <button
                onClick={() => setIsLangOpen(prev => !prev)}
                className="p-2 rounded-full text-gray-300 hover:text-white hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-500"
                aria-haspopup="true"
                aria-expanded={isLangOpen}
                aria-label="Select language"
              >
                <Icon as="globe" className="w-6 h-6" />
              </button>
              {isLangOpen && (
                  <div className="absolute right-0 mt-2 w-40 origin-top-right bg-gray-900/80 backdrop-blur-lg border border-white/10 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-10">
                      <div className="py-1" role="menu" aria-orientation="vertical">
                          {(['English', 'Telugu'] as Language[]).map((lang) => (
                              <button
                                key={lang}
                                onClick={() => handleLangChange(lang)}
                                className="flex items-center justify-between w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white"
                                role="menuitem"
                              >
                                <span>{lang}</span>
                                {currentLanguage === lang && <Icon as="check" className="w-5 h-5 text-cyan-400" />}
                              </button>
                          ))}
                      </div>
                  </div>
              )}
          </div>
          <button 
            onClick={onToggleDictionary}
            className={`p-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-500 ${isDictionaryVisible ? 'bg-white/10 text-white' : 'text-gray-300 hover:text-white hover:bg-white/10'}`}
            aria-label="Toggle dictionary panel"
          >
            <Icon as="book-open" className="w-6 h-6" />
          </button>
          {/* User Profile */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setIsProfileOpen(prev => !prev)}
              className="rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-500"
              aria-haspopup="true"
              aria-expanded={isProfileOpen}
              aria-label="Open user menu"
            >
              <img className="w-9 h-9 rounded-full object-cover" src={user.picture} alt={user.name} />
            </button>
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-56 origin-top-right bg-gray-900/80 backdrop-blur-lg border border-white/10 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-10">
                <div className="py-1" role="menu" aria-orientation="vertical">
                  <div className="px-4 py-3 border-b border-white/10">
                    <p className="text-sm font-semibold text-white truncate" role="none">{user.name}</p>
                    <p className="text-xs text-gray-400 truncate" role="none">{user.email}</p>
                  </div>
                   <button
                    onClick={() => { setIsProfileOpen(false); setIsUserProfileOpen(true); }}
                    className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white"
                    role="menuitem"
                  >
                    <Icon as="user" className="w-5 h-5 mr-2" />
                    <span>View Profile</span>
                  </button>
                  <button
                    onClick={() => { setIsProfileOpen(false); onOpenSettings(); }}
                    className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white"
                    role="menuitem"
                  >
                    <Icon as="cog-6-tooth" className="w-5 h-5 mr-2" />
                    <span>Settings</span>
                  </button>
                  <button
                    onClick={() => { setIsProfileOpen(false); setIsBlueprintOpen(true); }}
                    className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white"
                    role="menuitem"
                  >
                    <Icon as="document-text" className="w-5 h-5 mr-2" />
                    <span>Project Blueprint</span>
                  </button>
                  <button
                    onClick={onLogout}
                    className="flex items-center w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/20 hover:text-red-300"
                    role="menuitem"
                  >
                    <Icon as="logout" className="w-5 h-5 mr-2" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
      
      {/* Tool Modals */}
      <AssessmentCreator 
        isOpen={isAssessmentOpen} 
        onClose={() => setIsAssessmentOpen(false)}
        learningContext={modalContext || learningContext}
      />
      <CodeRunner isOpen={isCodeRunnerOpen} onClose={() => setIsCodeRunnerOpen(false)} />
      <ImageGenerator isOpen={isImageGeneratorOpen} onClose={() => setIsImageGeneratorOpen(false)} />
      <ImageEditor isOpen={isImageEditorOpen} onClose={() => setIsImageEditorOpen(false)} />
      <LearningHub 
        isOpen={isLearningHubOpen}
        onClose={() => setIsLearningHubOpen(false)}
        onCreateAssessment={handleCreateAssessmentFromHub}
      />
      <LogoCreator isOpen={isLogoCreatorOpen} onClose={() => setIsLogoCreatorOpen(false)} />
      <MindsetAnalyzer isOpen={isMindsetAnalyzerOpen} onClose={() => setIsMindsetAnalyzerOpen(false)} />
      <PresentationGenerator isOpen={isPresentationGeneratorOpen} onClose={() => setIsPresentationGeneratorOpen(false)} />
      <ProjectIdeaGenerator isOpen={isProjectIdeaGeneratorOpen} onClose={() => setIsProjectIdeaGeneratorOpen(false)} />
      <ResumeBuilder isOpen={isResumeBuilderOpen} onClose={() => setIsResumeBuilderOpen(false)} />
      <StudentSuccessHub isOpen={isStudentSuccessHubOpen} onClose={() => setIsStudentSuccessHubOpen(false)} />
      <WebSearchPanel isOpen={isWebSearchPanelOpen} onClose={() => setIsWebSearchPanelOpen(false)} />
      <CourseCreator isOpen={isCourseCreatorOpen} onClose={() => setIsCourseCreatorOpen(false)} />
      <InterviewPrepHub isOpen={isInterviewPrepOpen} onClose={() => setIsInterviewPrepOpen(false)} />
      <Calendar isOpen={isCalendarOpen} onClose={() => setIsCalendarOpen(false)} />
      <StoryWeaver isOpen={isStoryWeaverOpen} onClose={() => setIsStoryWeaverOpen(false)} />
      <DataVisualizer isOpen={isDataVisualizerOpen} onClose={() => setIsDataVisualizerOpen(false)} />
      <SoftwareCompanyFinder isOpen={isSoftwareCompanyFinderOpen} onClose={() => setIsSoftwareCompanyFinderOpen(false)} />
      <WebsiteCreator isOpen={isWebsiteCreatorOpen} onClose={() => setIsWebsiteCreatorOpen(false)} />
      <TripPlanner isOpen={isTripPlannerOpen} onClose={() => setIsTripPlannerOpen(false)} />
      <VideoGenerator isOpen={isVideoGeneratorOpen} onClose={() => setIsVideoGeneratorOpen(false)} />
      <FreeCoursesFinder isOpen={isFreeCoursesFinderOpen} onClose={() => setIsFreeCoursesFinderOpen(false)} />
      <BusinessIdeaSketch isOpen={isBusinessIdeaSketchOpen} onClose={() => setIsBusinessIdeaSketchOpen(false)} />
      <TaskReacher isOpen={isTaskReacherOpen} onClose={() => setIsTaskReacherOpen(false)} />
      <LiveCommunicator isOpen={isLiveCommunicatorOpen} onClose={() => setIsLiveCommunicatorOpen(false)} />
      <ProgrammingVisualizer isOpen={isProgrammingVisualizerOpen} onClose={() => setIsProgrammingVisualizerOpen(false)} />
      <UserProfileModal 
        isOpen={isUserProfileOpen}
        onClose={() => setIsUserProfileOpen(false)}
        user={user}
        onUpdateProfile={onUpdateProfile}
      />
      <BlueprintModal 
        isOpen={isBlueprintOpen}
        onClose={() => setIsBlueprintOpen(false)}
      />
    </>
  );
};