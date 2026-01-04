import { GoogleGenAI, GenerateContentResponse, Modality, Type } from "@google/genai";
import { AssessmentQuestion, Language, LearningModule, MindsetAnalysis, GroundingSource, PresentationSlide, ProjectIdea, StudentQuizQuestion, Course, InterviewQuestion, Story, StoryScene, TravelItinerary, VegaLiteSpec, WordDefinition, SoftwareCompanyProfile, WebsiteFile, BranchGuide, FreeCourseResource, BusinessIdea, TaskPlan } from "../types";

export const isGeminiConfigured = !!process.env.API_KEY;

if (!isGeminiConfigured) {
  console.error("Google Gemini API key not configured. It must be provided via the process.env.API_KEY variable.");
}

export const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

// Helper to safely parse JSON from AI, tries to find JSON within backticks
const parseJsonResponse = <T>(text: string, errorMessage: string): T => {
    try {
        const match = text.match(/```json\n([\s\S]*?)\n```/);
        if (match && match[1]) {
            return JSON.parse(match[1]) as T;
        }
        return JSON.parse(text) as T;
    } catch (e) {
        console.error("JSON parsing error:", e);
        throw new Error(errorMessage);
    }
};

export const getWordDefinition = async (word: string, language: Language): Promise<WordDefinition> => {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `${language === 'English' ? `Provide a detailed definition for the English word "${word}".` : `"${word}" అనే ఆంగ్ల పదానికి తెలుగులో వివరణాత్మక నిర్వచనం అందించండి.`} Include phonetic spelling, part of speech, definition, and an example.`,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    word: { type: Type.STRING }, phonetic: { type: Type.STRING }, partOfSpeech: { type: Type.STRING },
                    definition: { type: Type.STRING }, example: { type: Type.STRING }
                },
                required: ['word', 'phonetic', 'partOfSpeech', 'definition', 'example']
            },
        },
    });
    return parseJsonResponse(response.text, "The AI did not return a valid definition.");
};

export const generateLogos = async (prompt: string): Promise<string[]> => {
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: { numberOfImages: 4, outputMimeType: 'image/png', aspectRatio: '1:1' },
    });
    return response.generatedImages.map(img => `data:image/png;base64,${img.image.imageBytes}`);
};

export const generateLearningContent = async (topic: string): Promise<LearningModule[]> => {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Create a structured, easy-to-understand learning module on "${topic}". Break it into 3-4 sections.`,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY, items: {
                    type: Type.OBJECT, properties: { title: { type: Type.STRING }, content: { type: Type.STRING } },
                    required: ['title', 'content']
                }
            },
        },
    });
    return parseJsonResponse(response.text, "The AI did not return valid learning content.");
};

export const analyzeMindset = async (answers: string, branch: string): Promise<MindsetAnalysis> => {
    const response = await ai.models.generateContent(npm run dev++pe: "application/json",
            responseSchema: {
                type: Type.OBJECT, properties: {
                    mindsetProfile: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, description: { type: Type.STRING } }, required: ['title', 'description'] },
                    skillUpPlan: { type: Type.OBJECT, properties: { focusAreas: { type: Type.ARRAY, items: { type: Type.STRING } }, recommendedResources: { type: Type.ARRAY, items: { type: Type.STRING } }, nextProject: { type: Type.STRING } }, required: ['focusAreas', 'recommendedResources', 'nextProject'] }
                }, required: ['mindsetProfile', 'skillUpPlan']
            },
        },
    });
    return parseJsonResponse(response.text, "The AI did not return a valid mindset analysis.")

export const generateBranchGuide = async (branch: string): Promise<BranchGuide> => {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Create a concise career guide for the "${branch}" field.`,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT, properties: {
                    title: { type: Type.STRING }, introduction: { type: Type.STRING },
                    sections: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, content: { type: Type.STRING } }, required: ['title', 'content'] } }
                }, required: ['title', 'introduction', 'sections']
            },
        },
    });
    return parseJsonResponse(response.text, "The AI did not return a valid branch guide.");
};

export const generateImage = async (prompt: string, aspectRatio: '1:1' | '16:9' | '9:16' | '4:3' | '3:4'): Promise<string> => {
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: { numberOfImages: 1, outputMimeType: 'image/png', aspectRatio: aspectRatio },
    });
    return `data:image/png;base64,${response.generatedImages[0].image.imageBytes}`;
};

export const editImage = async (base64ImageData: string, mimeType: string, prompt: string): Promise<string> => {
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ inlineData: { data: base64ImageData, mimeType } }, { text: prompt }] },
        config: { responseModalities: [Modality.IMAGE, Modality.TEXT] },
    });

    const imagePart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData?.mimeType.startsWith('image/'));
    const imageData = imagePart?.inlineData?.data;
    const imageMimeType = imagePart?.inlineData?.mimeType;

    if (imageData && imageMimeType) {
        return `data:${imageMimeType};base64,${imageData}`;
    }

    throw new Error("The AI did not return an edited image.");
};

export const generateAssessment = async (context: string): Promise<AssessmentQuestion[]> => {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Analyze the following text and generate a multiple-choice quiz with 4-5 questions based on it.\n\nContext:\n---\n${context}\n---`,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY, items: {
                    type: Type.OBJECT, properties: {
                        question: { type: Type.STRING }, options: { type: Type.ARRAY, items: { type: Type.STRING } },
                        answer: { type: Type.STRING }
                    }, required: ['question', 'options', 'answer']
                }
            },
        },
    });
    return parseJsonResponse(response.text, "The AI did not return a valid assessment.");
};

export const executePythonCode = async (code: string): Promise<string> => {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `You are a Python interpreter. Execute the following Python code and return ONLY the raw stdout output.\n\nCode:\n---\n${code}\n---`,
    });
    return response.text;
};

export const debugCode = async (code: string, language: string): Promise<string> => {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `You are an expert code debugger. Analyze the following ${language} code for bugs, errors, or potential issues. Provide a corrected version and a step-by-step explanation.\n\nCode:\n---\n${code}\n---`,
    });
    return response.text;
};

export const explainCode = async (code: string, language: string): Promise<string> => {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `You are an expert code explainer. Provide a detailed, step-by-step explanation of what the following ${language} code does.\n\nCode:\n---\n${code}\n---`,
    });
    return response.text;
};

export const generatePresentationContent = async (topic: string): Promise<PresentationSlide[]> => {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Create a presentation outline with 5-7 slides for the topic: "${topic}". For each slide, provide a title and 3-5 bullet points.`,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY, items: {
                    type: Type.OBJECT, properties: { title: { type: Type.STRING }, content: { type: Type.ARRAY, items: { type: Type.STRING } } },
                    required: ['title', 'content']
                }
            },
        },
    });
    return parseJsonResponse(response.text, "The AI did not return a valid presentation outline.");
};

export const generateProjectIdeas = async (topic: string): Promise<ProjectIdea[]> => {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Generate 4 creative and distinct project ideas related to the topic of "${topic}".`,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY, items: {
                    type: Type.OBJECT, properties: { title: { type: Type.STRING }, description: { type: Type.STRING } },
                    required: ['title', 'description']
                }
            },
        },
    });
    return parseJsonResponse(response.text, "The AI did not return valid project ideas.");
};

export const enhanceResumeText = async (text: string): Promise<string> => {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Rewrite the following resume bullet points to be more impactful, using strong action verbs and quantifying achievements where possible. Return ONLY the rewritten bullet points.\n\nOriginal text:\n---\n${text}\n---`,
    });
    return response.text;
};

export const generateStudentQuiz = async (grade: string, subject: string): Promise<StudentQuizQuestion[]> => {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Create a 5-question multiple-choice quiz for a ${grade} student on the topic of ${subject}.`,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY, items: {
                    type: Type.OBJECT, properties: {
                        question: { type: Type.STRING }, options: { type: Type.ARRAY, items: { type: Type.STRING } },
                        answer: { type: Type.STRING }, explanation: { type: Type.STRING }
                    }, required: ['question', 'options', 'answer', 'explanation']
                }
            },
        },
    });
    return parseJsonResponse(response.text, "The AI did not return a valid quiz.");
};

export const groundedSearch = async (prompt: string): Promise<{ text: string; sources: GroundingSource[] }> => {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { tools: [{ googleSearch: {} }] },
    });
    
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
    const sources: GroundingSource[] = groundingChunks
        .map(chunk => ({ uri: chunk.web.uri, title: chunk.web.title }))
        .filter((source, index, self) => index === self.findIndex(s => s.uri === source.uri)); // Unique sources

    return { text: response.text, sources };
};

export const generateCourseContent = async (topic: string): Promise<Course> => {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Create a JSON object for a course outline on "${topic}". It should have a "title" (string), and "modules" (an array of objects). Each module object should have a "title" (string), "description" (string), and "youtubeLinks" (an array of objects). Each link object should have a "title" (string) and "url" (string). Use your web search tool to find 2-3 real, relevant YouTube tutorial URLs for each module. Wrap the final JSON in a markdown code block.`,
        config: { tools: [{ googleSearch: {} }] },
    });
    return parseJsonResponse(response.text, "AI did not return valid JSON for the course outline.");
};

export const findFreeCourses = async (topic: string): Promise<FreeCourseResource[]> => {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Find 3-5 high-quality, free online courses for the topic "${topic}". For each course, provide a title, the platform (e.g., Coursera, YouTube, freeCodeCamp), a direct URL, and a brief description. Format the response as a JSON array inside a markdown code block.`,
        config: { tools: [{ googleSearch: {} }] }
    });
    return parseJsonResponse(response.text, "AI did not return a valid list of courses.");
};

export const generateInterviewQuiz = async (topic: string): Promise<InterviewQuestion[]> => {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Create a 5-question multiple-choice quiz on the interview topic of "${topic}" with detailed explanations.`,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY, items: {
                    type: Type.OBJECT, properties: {
                        question: { type: Type.STRING }, options: { type: Type.ARRAY, items: { type: Type.STRING } },
                        answer: { type: Type.STRING }, explanation: { type: Type.STRING }
                    }, required: ['question', 'options', 'answer', 'explanation']
                }
            },
        },
    });
    return parseJsonResponse(response.text, "The AI did not return a valid interview quiz.");
};

export const generateStory = async (prompt: string): Promise<Story> => {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Write a short children's story based on: "${prompt}". Provide a title and 3-4 paragraphs. For each paragraph, also create a detailed image prompt.`,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT, properties: {
                    title: { type: Type.STRING }, scenes: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { paragraph: { type: Type.STRING }, imagePrompt: { type: Type.STRING } }, required: ["paragraph", "imagePrompt"] } }
                }, required: ["title", "scenes"]
            },
        },
    });
    const storyData = parseJsonResponse<{ title: string; scenes: { paragraph: string, imagePrompt: string }[] }>(response.text, "The AI did not return a valid story structure.");
    
    const illustratedScenes: StoryScene[] = [];
    for (const scene of storyData.scenes) {
        const imageUrl = await generateImage(`A beautiful, whimsical children's book illustration of: ${scene.imagePrompt}`, '1:1');
        illustratedScenes.push({ paragraph: scene.paragraph, imageUrl });
    }
    return { title: storyData.title, scenes: illustratedScenes };
};

export const generateVideo = async (prompt: string, imagePayload?: { data: string, mimeType: string }): Promise<any> => {
    return await ai.models.generateVideos({
        model: 'veo-2.0-generate-001',
        prompt,
        image: imagePayload ? { imageBytes: imagePayload.data, mimeType: imagePayload.mimeType } : undefined,
        config: { numberOfVideos: 1 },
    });
};

export const pollVideoOperation = async (operation: any): Promise<any> => {
    return await ai.operations.getVideosOperation({ operation });
};

export const generateTravelItinerary = async (destination: string, duration: number): Promise<TravelItinerary> => {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Create a detailed ${duration}-day travel itinerary for ${destination}.`,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT, properties: {
                    destination: { type: Type.STRING }, duration: { type: Type.NUMBER }, plan: {
                        type: Type.ARRAY, items: {
                            type: Type.OBJECT, properties: { day: { type: Type.NUMBER }, theme: { type: Type.STRING }, activities: { type: Type.ARRAY, items: { type: Type.STRING } } },
                            required: ['day', 'theme', 'activities']
                        }
                    }
                }, required: ['destination', 'duration', 'plan']
            },
        },
    });
    return parseJsonResponse(response.text, "The AI did not return a valid itinerary.");
};

export const generateVisualizationSpec = async (data: string, prompt: string): Promise<VegaLiteSpec> => {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Generate a valid Vega-Lite JSON spec for a chart. Do not include a "data" property; embed the data directly in "values".\n\nData:\n${data}\n\nPrompt: ${prompt}`,
        config: { responseMimeType: "application/json" },
    });
    return parseJsonResponse(response.text, "The AI did not return a valid Vega-Lite spec.");
};

export const getSoftwareCompanyProfile = async (companyName: string): Promise<SoftwareCompanyProfile> => {
    const prompt = `Generate a profile for the software company: "${companyName}". Use web search to find the latest information. Structure the response as a JSON object with the following keys: "name" (string), "overview" (string), "keyProducts" (array of strings), "recentNews" (string), "website" (string), "learningResources" (array of objects with "name" and "url"), "problemSolvingPlatforms" (array of objects with "name" and "url"), "interviewPracticePlatforms" (array of objects with "name" and "url"). Wrap the entire JSON object in a markdown code block (\`\`\`json ... \`\`\`).`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            tools: [{ googleSearch: {} }],
        },
    });
    
    const profile = parseJsonResponse<Omit<SoftwareCompanyProfile, 'sources'>>(response.text, "The AI did not return a valid company profile.");
    
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
    const sources: GroundingSource[] = groundingChunks
        .map(chunk => ({ uri: chunk.web.uri, title: chunk.web.title }))
        .filter((source, index, self) => index === self.findIndex(s => s.uri === source.uri));

    return { ...profile, sources };
};

export const generateWebsiteFiles = async (prompt: string): Promise<WebsiteFile> => {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Generate a complete, single-page website based on this prompt: "${prompt}". Provide the response as a single JSON object with three keys: "html", "css", and "js". The HTML should reference the CSS as "style.css" and the JS as "script.js". Do not include any explanations.`,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    html: { type: Type.STRING },
                    css: { type: Type.STRING },
                    js: { type: Type.STRING }
                },
                required: ['html', 'css', 'js']
            }
        },
    });
    return parseJsonResponse(response.text, "The AI did not return valid website files.");
};

export const generateBusinessIdea = async (prompt: string): Promise<BusinessIdea> => {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Flesh out the following business idea into a structured one-page business plan sketch: "${prompt}"`,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    ideaName: { type: Type.STRING },
                    tagline: { type: Type.STRING },
                    summary: { type: Type.STRING },
                    targetAudience: { type: Type.STRING },
                    keyFeatures: { type: Type.ARRAY, items: { type: Type.STRING } },
                    monetizationStrategy: { type: Type.STRING },
                    marketingPlan: { type: Type.ARRAY, items: { type: Type.STRING } },
                    potentialRisks: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ['ideaName', 'tagline', 'summary', 'targetAudience', 'keyFeatures', 'monetizationStrategy', 'marketingPlan', 'potentialRisks']
            }
        },
    });
    return parseJsonResponse(response.text, "The AI did not return a valid business idea sketch.");
};

export const generateTaskPlan = async (task: string, level: string): Promise<TaskPlan> => {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Create a step-by-step plan for the task: "${task}". The plan should be tailored for a user who is a "${level}".`,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    taskTitle: { type: Type.STRING },
                    userLevel: { type: Type.STRING },
                    steps: { type: Type.ARRAY, items: { 
                        type: Type.OBJECT, 
                        properties: {
                            step: { type: Type.NUMBER },
                            title: { type: Type.STRING },
                            description: { type: Type.STRING },
                            tip: { type: Type.STRING }
                        },
                        required: ['step', 'title', 'description']
                    }}
                },
                required: ['taskTitle', 'userLevel', 'steps']
            }
        },
    });
    return parseJsonResponse(response.text, "The AI did not return a valid task plan.");
};