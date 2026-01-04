// FIX: The previous attempt to fix Express type conflicts was incorrect. 
// This change correctly imports `Request` and `Response` types from Express using aliases (`ExpressRequest`, `ExpressResponse`) 
// to avoid conflicts with global DOM types. This resolves all TypeScript errors related to Express handlers.
import express, { Request as ExpressRequest, Response as ExpressResponse } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI, GenerateContentParameters, Part } from '@google/genai';

dotenv.config();

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' })); // Increase limit for image uploads

const GEMINI_API_KEY = process.env.API_KEY;
if (!GEMINI_API_KEY) {
  console.error("Gemini API key not configured. It must be provided via the .env file.");
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

// Generic error handler
const handleError = (res: ExpressResponse, error: any, context: string) => {
    console.error(`Error in ${context}:`, error);
    res.status(500).json({ message: `An error occurred in ${context}.`, error: error.message });
}

// === CHAT ENDPOINTS ===

app.post('/api/chat/stream', async (req: ExpressRequest, res: ExpressResponse) => {
    try {
        const { contents, config } = req.body as GenerateContentParameters;

        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.flushHeaders();
        
        const stream = await ai.models.generateContentStream({ model: 'gemini-2.5-flash', contents, config });

        for await (const chunk of stream) {
            res.write(`data: ${JSON.stringify(chunk)}\n\n`);
        }
        res.end();

    } catch (error) {
        // This will likely not be sent if headers are already flushed, but it's good practice.
        handleError(res, error, 'chat streaming');
    }
});

app.post('/api/generate/title', async (req: ExpressRequest, res: ExpressResponse) => {
    try {
        const { prompt } = req.body;
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
        res.json({ text: response.text });
    } catch (error) {
        handleError(res, error, 'title generation');
    }
});

// === AI TOOL ENDPOINTS ===

app.post('/api/tools/generic', async (req: ExpressRequest, res: ExpressResponse) => {
    try {
        const { model, contents, config } = req.body;
        const response = await ai.models.generateContent({ model, contents, config });
        res.json({ text: response.text });
    } catch (error) {
        handleError(res, error, 'generic tool');
    }
});

app.post('/api/tools/full-response', async (req: ExpressRequest, res: ExpressResponse) => {
    try {
        const { model, contents, config } = req.body;
        const response = await ai.models.generateContent({ model, contents, config });
        res.json(response);
    } catch (error) {
        handleError(res, error, 'full-response tool');
    }
});

app.post('/api/tools/image-generation', async (req: ExpressRequest, res: ExpressResponse) => {
    try {
        const { model, prompt, config } = req.body;
        const response = await ai.models.generateImages({ model, prompt, config });
        res.json(response);
    } catch (error) {
        handleError(res, error, 'image generation tool');
    }
});

app.post('/api/tools/video-generation', async (req: ExpressRequest, res: ExpressResponse) => {
    try {
        const { model, prompt, image, config } = req.body;
        const operation = await ai.models.generateVideos({ model, prompt, image, config });
        res.json(operation);
    } catch (error) {
        handleError(res, error, 'video generation tool');
    }
});

app.post('/api/tools/poll-video', async (req: ExpressRequest, res: ExpressResponse) => {
    try {
        const { operation } = req.body;
        const updatedOperation = await ai.operations.getVideosOperation({ operation });
        res.json(updatedOperation);
    } catch (error) {
        handleError(res, error, 'video polling');
    }
});

app.get('/api/tools/fetch-video', async (req: ExpressRequest, res: ExpressResponse) => {
    try {
        const downloadLink = req.query.url as string;
        if (!downloadLink) {
            return res.status(400).json({ message: 'Missing video URL' });
        }
        const response = await fetch(`${downloadLink}&key=${GEMINI_API_KEY}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch video: ${response.statusText}`);
        }
        const blob = await response.blob();
        res.setHeader('Content-Type', blob.type);
        const buffer = Buffer.from(await blob.arrayBuffer());
        res.send(buffer);
    } catch (error) {
        handleError(res, error, 'video fetching');
    }
});


app.listen(port, () => {
    console.log(`Prism AI backend server listening at http://localhost:${port}`);
});
