# ⚡ AgenXNodes - AI Automation Platform

**AgenXNodes** is an open-source, enterprise-grade workflow automation tool similar to n8n. It allows users to visually connect APIs, AI models, and productivity tools using a drag-and-drop interface.

> **Key Feature:** Includes an **AI Architect** that generates entire workflows from simple English text prompts.

---

## 🚀 Features

- **🎨 Visual Editor:** Drag-and-drop canvas built with React Flow.
- **🔐 Secure Auth:** User Login/Signup with JWT & MongoDB.
- **🤖 AI Workflow Generation:** Prompt "Send email when form submitted" -> Auto-builds graph.
- **🔌 28+ Integrations:** Google Gemini, OpenAI, Hugging Face, Slack, Discord, Google Sheets, etc.
- **🔀 Logic:** Conditionals (If/Else), Loops, and Delays.
- **☁️ Cloud Ready:** Built for MongoDB Atlas and Node.js.

---

## 🛠️ Tech Stack

- **Frontend:** React + Vite, React Flow, React Router DOM.
- **Backend:** Node.js, Express.js.
- **Database:** MongoDB (Mongoose).
- **AI Engine:** Google Gemini API, Hugging Face Inference.

---

## ⚙️ Prerequisites

1. **Node.js** (v16+)
2. **MongoDB** (Local or Atlas Connection String)

---

## 📦 Installation

### 1. Backend (Server)
```bash
cd server
npm install

Create a .env file in server/:

PORT=5005
MONGO_URI=mongodb://127.0.0.1:27017/agenxnodes
JWT_SECRET=your_super_secure_secret
GEMINI_API_KEY=your_google_ai_key

Start Server:
node index.js


Frontend (Client)
cd client
npm install
npm run dev

Access at: http://localhost:5173


