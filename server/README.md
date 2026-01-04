# Prism AI - Backend Server

This directory contains the Node.js backend server for Prism AI. The server acts as a secure proxy to the Google Gemini API, protecting your API key and enabling more complex, server-side logic.

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or later recommended)
- [npm](https://www.npmjs.com/) (usually comes with Node.js)

### Installation & Setup

1.  **Navigate to the `server` directory:**
    ```bash
    cd server
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up your Gemini API Key:**
    - Create a file named `.env` in the `server` directory.
    - Add your Gemini API key to this file:
      ```
      API_KEY=your_gemini_api_key_here
      ```
    - The server uses the `dotenv` package to load this variable automatically.

### Running the Server

- To run the server in development mode (with auto-restarting on file changes), use:
  ```bash
  npm start
  ```
- The server will start on `http://localhost:3001` by default. The frontend application is configured to communicate with this address.

**Important:** You must have this server running for the Prism AI web application to function correctly.
