# Prism AI - All-in-One AI Toolkit

[![Prism AI Logo](https://raw.githubusercontent.com/madriudaykumar/Prism-AI/main/public/logo.png)](https://github.com/madriudaykumar/Prism-AI)

**Prism AI** is a powerful and feature-rich web application that serves as a comprehensive AI-powered toolkit. Built with a sleek, modern interface, it goes far beyond a simple chatbot by integrating a full suite of specialized tools for creativity, productivity, education, and career development. The entire platform is powered by Google's advanced Gemini API.

This project was developed by **MADRI UDAY KUMAR**.

---

## ✨ Features

Prism AI combines a core conversational chat experience with a powerful, modal-based **AI Tool Kit**.

### Core Chat Functionality
- **Simulated Login:** Features simulated Google Sign-In, a traditional email form, and a "Continue as Guest" option for a persistent session without requiring real accounts.
- **Conversational AI:** Engage in natural, human-like conversations on any topic.
- **Real-time Streaming:** Responses from the AI are streamed word-by-word for a dynamic experience.
- **Markdown & Code Rendering:** Full support for markdown formatting, including tables, lists, and syntax-highlighted code blocks with a "copy" button.
- **Multimodal Input:** Users can upload images to ask questions or provide context.
- **Voice Input:** A microphone button allows for voice-to-text transcription directly into the message input.
- **Web-Enhanced Search:** A toggle in the message bar allows the AI to access Google Search for up-to-date information, complete with source citations.
- **Multilingual Support:** Seamlessly switch between English and Telugu for AI responses.

### 🧰 The AI Tool Kit

A suite of powerful, single-purpose tools accessible from the main header:

#### Content & Creativity
- **Image Generator:** Create high-quality images from detailed text descriptions with various aspect ratios.
- **Image Editor:** Magically edit your images using a simple text description.
- **AI Story Weaver:** Write and illustrate a short story from a simple idea.
- **Logo Creator:** Generate four unique logo concepts based on a brand description, style, and color palette.
- **Presentation Generator:** Instantly create a structured, slide-by-slide presentation outline on any topic and download it as a **PowerPoint (.pptx)** or PDF file.
- **AI Video Generator:** Create short videos from text or by animating an image.

#### Career & Education
- **Live Communicator:** Practice your English by having a real-time spoken conversation with an AI.
- **Course Creator:** Generates a complete course outline on any topic by browsing domains and branches. It uses web search to find relevant YouTube tutorials and allows for instant assessment creation.
- **Resume Builder:** A powerful two-pane resume editor with multiple templates ("Modern," "Classic," "Creative"). Features an "AI Enhance" button to rewrite job descriptions and exports to a print-ready PDF.
- **Interview Prep Hub:** Practice for job interviews with AI-generated quizzes on topics like Quantitative Aptitude and Logical Reasoning, complete with detailed explanations.
- **Student Success Hub:** Provides grade-level (1-10) and subject-specific quizzes for students, with answer reviews and a tool to find online learning resources.
- **Mindset Analyzer:** A flexible career tool where users can browse domains, select a specific branch, and take a focused quiz to get an immediate, personalized "Mindset Profile" and "Skill-Up Plan" with an integrated option to find learning resources.
- **Learning Hub:** Generates a structured learning module on any topic.
- **Assessment Creator:** Creates a multiple-choice quiz from the chat context or content from the Learning Hub.

#### Development & Productivity
- **AI Code Runner:** An interactive IDE to write, **execute**, **debug**, and get AI-powered explanations for code in JavaScript, Python, and HTML.
- **Web Search Panel:** A dedicated side-panel for performing deep-dive web searches with sourced, clickable links and downloadable results.
- **Project Idea Generator:** Brainstorms a list of creative project ideas for any given topic or technology.
- **Data Visualizer:** Generate interactive charts and graphs from your raw data.
- **Software Company Finder:** Research software companies with AI-generated profiles and resources.
- **Website Creator:** Describe a website and get the HTML, CSS, and JS in a zip file.
- **AI Trip Planner:** Plan a detailed day-by-day travel itinerary.
- **Calendar:** View an interactive monthly calendar.
- **Dictionary:** A side-panel dictionary for instant word definitions in English or Telugu.

---

## 🛠️ Tech Stack

- **Core Framework:** [React](https://react.dev/) 19 & TypeScript
- **AI Engine:** [Google Gemini API](https://ai.google.dev/) via `@google/genai` SDK
  - Models: `gemini-2.5-flash`, `imagen-4.0-generate-001`, `veo-2.0-generate-001`, `gemini-2.5-flash-native-audio-preview-09-2025`
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **UI Components & Rendering:**
  - `react-markdown` & `remark-gfm` for rendering markdown content.
  - `react-syntax-highlighter` for beautiful code block syntax highlighting.
- **Browser APIs:** Web Speech API (voice input), Web Audio API (live communication).
- **External Libraries (CDN):**
  - `pptxgenjs` for PowerPoint generation.
  - `jspdf` for PDF generation.
  - `vega`, `vega-lite`, `vega-embed` for data visualization.
  - `jszip` for creating .zip files.

---

## 🏛️ Scaling the Architecture

The current project is a powerful client-side application. To evolve it into a scalable, enterprise-grade SaaS platform capable of supporting millions of users, a robust backend architecture is required.

A detailed architectural guide, outlining the use of technologies like **Microservices, PostgreSQL, MongoDB, and Redis**, has been prepared to map out this transition.

**➡️ [Read the full Architecture Guide here](./ARCHITECTURE.md)**

---

## 🚀 Getting Started

Follow these instructions to set up and run the project locally.

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari).
- A valid **Google Gemini API Key**. You can get one from [Google AI Studio](https://aistudio.google.com/app/apikey).

### Installation
1.  **Clone the repository:**
    ```bash
    git clone https://github.com/madriudaykumar/Prism-AI.git
    cd Prism-AI
    ```

2.  **Set up your Gemini API Key:**
    - The application requires a Google Gemini API key to be provided as an environment variable named `API_KEY`.
    - How you set this variable depends on your development environment. For example, if you are using a development server like Vite or this project's environment, you would create a `.env` file in the root of the project.
    - **Create a file named `.env`** in the project's root directory.
    - **Add your API key** to the `.env` file like this:
      ```
      API_KEY=your_gemini_api_key_here
      ```
    - The application code will automatically pick up `process.env.API_KEY`. You do not need to edit the source code to add your key.

      > **Important:** Never hardcode your API key in the client-side code or commit it to version control. The `.env` file is typically ignored by Git.

3.  **Run the project:**
    - Since this project is set up with static HTML and ES modules, you don't need a complex build step. You can serve it using any simple local server. If you have Python installed, you can run:
      ```bash
      # For Python 3
      python -m http.server
      ```
    - Then, open your browser and navigate to `http://localhost:8000`.

---
## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.