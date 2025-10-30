# NoBrokerage AI 🏠

<div align="center">

![NoBrokerage AI](https://img.shields.io/badge/NoBrokerage-AI-blue)
![React](https://img.shields.io/badge/React-18.2.0-61dafb)
![Node.js](https://img.shields.io/badge/Node.js-16+-339933)
![Express](https://img.shields.io/badge/Express-4.18-000000)
![Firebase](https://img.shields.io/badge/Firebase-Auth-ffca28)

**Intelligent Property Search Assistant for Pune & Mumbai**

[Live Demo](https://nobrokerage-ai.vercel.app) • [API Docs](https://propbotai.onrender.com/api-docs/) • [Report Bug](https://github.com/your-username/nobrokerage-ai/issues)

</div>

## 🚀 Overview

NoBrokerage AI is an intelligent property search platform that revolutionizes how users find properties in Pune and Mumbai. Using advanced natural language processing, the application understands conversational queries like "2BHK in Pune under 80 Lakh" and returns precise property matches with comprehensive details.

### ✨ Key Features

| Feature | Description |
|---------|-------------|
| 🤖 **Smart NLP** | Understands conversational property queries |
| 🎯 **Exact Matching** | Precise BHK, budget, and location filtering |
| 💬 **Real-time Chat** | Interactive chat interface with typing indicators |
| 🔒 **Secure Auth** | Firebase authentication with Google Sign-in |
| 📱 **Responsive** | Works seamlessly across all devices |

## 🏗️ Architecture
```bash
NoBrokerage AI/
├── 📱 Frontend (Vercel)
│   ├── React 18 + Vite
│   ├── Tailwind CSS
│   ├── Firebase Auth
│   └── Real-time Chat UI
│
├── 🔧 Backend (Render)
│   ├── Express.js API
│   ├── Intelligent Query Parser (NLP)
│   ├── Property Database
│   └── Swagger API Documentation
│
└── 🔐 Services
    ├── Firebase Authentication
    ├── Vercel Hosting
    └── Render Deployment
```

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern UI framework with hooks
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Firebase Auth** - Secure user authentication
- **Lucide React** - Beautiful icon library
- **Axios** - HTTP client for API calls

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **CORS** - Cross-origin resource sharing
- **Swagger UI** - Interactive API documentation
- **Custom Query Parser** - NLP for property searches

### Deployment & Services
- **Vercel** - Frontend hosting
- **Render** - Backend hosting
- **Firebase** - Authentication service

## 🚀 Quick Start

### Prerequisites

- Node.js 16 or higher
- npm or yarn package manager
- Firebase project setup
- Git for version control

### Folder Structure 
## 🚀 Backend (/backend)
```bash
backend/
├── data/                 # Data storage directory
├── node_modules/         # Node.js dependencies
├── routes/              # API route handlers
├── utils/               # Utility functions
│   ├── csvParser.js     # CSV file parsing utilities
│   ├── queryParser.js   # Query parsing logic
│   └── searchEngine.js  # Search functionality
├── .gitignore          # Git ignore rules
├── package-lock.json   # Dependency lock file
├── package.json        # Backend dependencies and scripts
├── railway.toml        # Railway deployment configuration
└── server.js           # Main server entry point
```
## 🎨 Frontend (/frontend)
```bash
frontend/
├── dist/               
├── node_modules/       # Frontend dependencies
├── public/            
├── src/               # Source code
│   ├── assets/        
│   ├── components/   
│   │   ├── auth/      # Authentication components
│   │   │   ├── Login.jsx
│   │   │   └── SignUp.jsx
│   │   └── chat/      # Chat interface components
│   │       ├── ChatInterface.jsx
│   │       ├── Message.jsx
│   │       ├── PropertyCard.jsx
│   │       └── TypingIndicator.jsx
│   ├── layout/        # Layout components
│   │   ├── Header.jsx
│   │   ├── Sidebar.jsx
│   ├── contexts/      # React contexts
│   │   ├── AuthContext.jsx
│   │   └── ThemeContext.jsx
│   ├── hooks/         # Custom React hooks
│   ├── services/      # External service integrations
│   │   ├── api.js     # API service calls
│   │   └── firebase.js # Firebase configuration
│   ├── utils/         
│   ├── App.css        
│   ├── App.jsx        
│   ├── index.css      
│   └── main.jsx     
├── .env               
├── .gitignore         
├── eslint.config.js   
├── index.html         
├── package-lock.json 
├── package.json       
├── README.md         
├── vercel.json        # Vercel deployment configuration
└── vite.config.js     
```
### Installation

1. **Clone the repository**
```bash
git clone https://github.com/your-username/nobrokerage-ai.git

```
2. **Frontend Setup**
```bash
cd frontend
cd nobrokereageai-frontend
npm run dev
```
3. **Backend Setup**
```bash
cd backend
npm run dev
```

## 🌍 Environment Variables
**Frontend (.env)**
```bash
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_API_BASE_URL=https://propbotai.onrender.com
```
**Backend(.env)**
```bash
PORT=5001
NODE_ENV=production
FIREBASE_SERVICE_ACCOUNT={...}
```

## 🚢 Production Build
```bash
# Frontend
npm run build
npm run preview

# Backend
npm start
```
## 🧾 API Documentation
Access the full API reference here:
https://propbotai.onrender.com/api-docs/

## 🤝 Contributing
Contributions are welcome!
```bash
1.Fork the repository
2.Create a feature branch (git checkout -b feature/your-feature)
3.Commit your changes (git commit -m "Add your feature")
4.Push to the branch (git push origin feature/your-feature)
5.Create a Pull Request
```


