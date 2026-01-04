

export enum MessageRole {
  USER = 'user',
  MODEL = 'model',
}

export interface ChatAttachment {
  url: string; // Object URL for preview
  base64Data: string;
  mimeType: string;
}

export interface GroundingChunk {
  web: {
    uri: string;
    title: string;
  };
}

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  attachment?: ChatAttachment;
  groundingChunks?: GroundingChunk[];
}

export interface Conversation {
  id: string;
  userId: string;
  title: string;
  messages: ChatMessage[];
  lastUpdated: number;
}

export type Language = 'English' | 'Telugu';

export interface AssessmentQuestion {
  question: string;
  options: string[];
  answer: string;
}

export interface LearningModule {
  title: string;
  content: string;
}

export interface MindsetAnalysis {
  mindsetProfile: {
    title: string;
    description: string;
  };
  skillUpPlan: {
    focusAreas: string[];
    recommendedResources: string[];
    nextProject: string;
  };
}

export interface BranchGuide {
  title: string;
  introduction: string;
  sections: {
    title: string;
    content: string;
  }[];
}

export interface GroundingSource {
  uri: string;
  title: string;
}

export interface PresentationSlide {
  title: string;
  content: string[];
}

export interface ProjectIdea {
  title: string;
  description: string;
}

export interface ResumeExperience {
  title: string;
  company: string;
  date: string;
  description: string;
}

export interface ResumeEducation {
    degree: string;
    school: string;
    date: string;
}

export interface ResumeData {
  fullName: string;
  email: string;
  phone: string;
  linkedin: string;
  summary: string;
  experience: ResumeExperience[];
  education: ResumeEducation[];
  skills: string;
}

export interface StudentQuizQuestion {
  question: string;
  options: string[];
  answer: string;
  explanation: string;
}

export interface YouTubeLink {
  title: string;
  url: string;
}

export interface CourseModule {
  title: string;
  description: string;
  youtubeLinks: YouTubeLink[];
}

export interface Course {
  title: string;
  modules: CourseModule[];
}

export interface InterviewQuestion {
  question: string;
  options: string[];
  answer: string;
  explanation: string;
}

export interface StoryScene {
  paragraph: string;
  imageUrl: string;
}

export interface Story {
  title: string;
  scenes: StoryScene[];
}

export interface TravelItinerary {
  destination: string;
  duration: number;
  plan: {
    day: number;
    theme: string;
    activities: string[];
  }[];
}

export interface VegaLiteSpec {
  [key: string]: any;
}

export interface WordDefinition {
  word: string;
  phonetic: string;
  partOfSpeech: string;
  definition: string;
  example: string;
}

export interface CompanyResource {
    name: string;
    url: string;
}

export interface SoftwareCompanyProfile {
  name: string;
  overview: string;
  keyProducts: string[];
  recentNews: string;
  website: string;
  learningResources: CompanyResource[];
  problemSolvingPlatforms: CompanyResource[];
  interviewPracticePlatforms: CompanyResource[];
  sources: GroundingSource[];
}

export interface WebsiteFile {
  html: string;
  css: string;
  js: string;
}

export interface FreeCourseResource {
  title: string;
  platform: string;
  url: string;
  description: string;
}

export interface TaskStep {
  step: number;
  title: string;
  description: string;
  tip?: string;
}

export interface TaskPlan {
  taskTitle: string;
  userLevel: string;
  steps: TaskStep[];
}

export interface BusinessIdea {
  ideaName: string;
  tagline: string;
  summary: string;
  targetAudience: string;
  keyFeatures: string[];
  monetizationStrategy: string;
  marketingPlan: string[];
  potentialRisks: string[];
}

export interface UserSettings {
  language: Language;
  theme: 'system' | 'light' | 'dark';
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  picture: string;
  settings?: UserSettings;
}