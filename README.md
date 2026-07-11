# ⚡ AgenXNodes - AI Automation Platform

**AgenXNodes** is an open-source, enterprise-grade workflow automation tool similar to n8n. It allows users to visually connect APIs, AI models, and productivity tools using a drag-and-drop interface.

> **Key Feature:** Includes an **AI Architect** that generates entire workflows from simple English text prompts.

---

## 🚀 Features

- **🎨 Visual Editor:** Drag-and-drop canvas built with React Flow.
- **🔐 Secure Auth:** User Login/Signup with JWT & MongoDB.
- **🤖 AI Workflow Generation:** Prompt "Send email when form submitted" -> Auto-builds graph.
- **🧠 AI Agent Node:** Multi-step reasoning agent with Gemini integration.
- **🔌 33+ Integrations:** Google Gemini, OpenAI, Hugging Face, Slack, Discord, Google Sheets, etc.
- **🔀 Logic:** Conditionals (If/Else), Loops, and Delays.
- **☁️ Cloud Ready:** Built for MongoDB Atlas and Node.js.

---

## 🛠️ Tech Stack

- **Frontend:** React + Vite, React Flow, React Router DOM, TailwindCSS.
- **Backend:** Node.js, Express.js.
- **Database:** MongoDB (Mongoose).
- **AI Engine:** Google Gemini API, HuggingFace Inference, OpenAI, Anthropic.

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
```

### 2. Environment (.env)
Create a .env file in server/:
```
PORT=5005
HOST=0.0.0.0
MONGO_URI=YOUR_MONGO_URI
JWT_SECRET=JWT_SECRET_KEY
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
SYSTEM_EMAIL=YOUR_EMAIL_ADDRESS
SYSTEM_EMAIL_PASSWORD=YOUR_EMAIL_PASSWORD
```

### 3. Start Server
```bash
node index.js
```

### 4. Frontend (Client)
```bash
npm install
npm run dev
```

### 5. Access
Open: http://localhost:5173

---

