# ⚡ Aether - AI-Powered Business Copilot

<div align="center">
  <img src="Aether logo/Logo_with_text.png" alt="Aether Logo" width="300" />
  
  <p align="center">
    <strong>Your intelligent business companion for modern entrepreneurs</strong>
  </p>
  
  <p align="center">
    <a href="#features">Features</a> •
    <a href="#quick-start">Quick Start</a> •
    <a href="#tech-stack">Tech Stack</a> •
    <a href="#deployment">Deployment</a>
  </p>
</div>

---

## 🎯 Overview

Aether is a premium SaaS platform that transforms how entrepreneurs run their businesses. Built with React, TypeScript, Firebase, and powered by Google's Gemini AI, Aether provides intelligent insights, workflow automation, and comprehensive business management tools.

### ✨ Key Highlights

- 🤖 **AI-Powered Insights** - Gemini AI integration for smart recommendations
- 📊 **Real-time Dashboard** - Track KPIs, sales, and business metrics
- 💼 **Lead Management** - Capture, nurture, and convert leads efficiently
- ✅ **Task & Project Management** - Organize work with drag-and-drop boards
- 👥 **Team Collaboration** - Built-in chat and notifications
- 📱 **Social Media Tools** - Schedule posts and analyze engagement
- 🎨 **Premium UI/UX** - Glassmorphism design with smooth animations

---

## 🚀 Features

### Core Modules

1. **Dashboard**
   - Real-time KPI tracking
   - Monthly sales analytics with charts
   - AI-powered business insights
   - Data upload capability for custom metrics

2. **Lead Management**
   - Contact capture and tracking
   - Status pipeline (New → Contacted → Qualified → Converted)
   - AI-generated personalized messages
   - Lead scoring and analytics

3. **Tasks & Projects**
   - Kanban-style task boards
   - Project workspaces with team collaboration
   - Task assignment and tracking
   - Due date management

4. **Team Chat**
   - Real-time messaging
   - Channel-based communication
   - Team member directory
   - Notification system

5. **Social Analytics**
   - Multi-platform analytics (Instagram, LinkedIn, Twitter, Facebook)
   - Post scheduling
   - AI-powered content generation
   - Engagement tracking

6. **Settings & Profile**
   - User profile with photo upload
   - Business information management
   - Team member invitations
   - Integration settings

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript
- **Styling**: Tailwind CSS, Custom CSS animations
- **Backend**: Firebase (Auth, Firestore, Storage)
- **AI**: Google Gemini API
- **Charts**: Recharts
- **Build Tool**: Vite
- **State Management**: React Context API

---

## 🏃 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- Firebase project with:
  - Authentication enabled (Email/Password & Google)
  - Firestore Database
  - Storage bucket
- Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd aether-business-copilot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env.local` file in the project root:
   ```env
   VITE_FIREBASE_API_KEY=your-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   VITE_FIREBASE_APP_ID=your-app-id
   VITE_FIREBASE_MEASUREMENT_ID=optional-measurement-id
   VITE_GEMINI_API_KEY=your-gemini-key
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

---

## 🔐 Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable **Authentication**:
   - Email/Password provider
   - Google provider
4. Enable **Firestore Database** (Start in test mode for development)
5. Enable **Storage** for profile photo uploads
6. Copy your config from Project Settings → General → Your apps

---

## 📱 User Flow

### New Users
1. **Landing Page** → Beautiful hero with features and pricing
2. **Sign Up** → Create account with email or Google
3. **Onboarding** → 3-step setup (business name, industry, goals)
4. **Dashboard** → Full app access with seeded demo data

### Returning Users
1. **Landing Page** → Welcome back
2. **Sign In** → Email or Google login
3. **Dashboard** → Direct access (skips onboarding)

---

## 📂 Project Structure

```
aether-business-copilot/
├── components/
│   ├── auth/           # Authentication components
│   ├── onboarding/     # User onboarding flow
│   ├── shared/         # Reusable components (Card, Icons)
│   ├── Dashboard.tsx   # Main dashboard
│   ├── Landing.tsx     # Landing page
│   ├── Leads.tsx       # Lead management
│   ├── Tasks.tsx       # Task management
│   ├── Projects.tsx    # Project management
│   ├── Settings.tsx    # User settings
│   ├── TeamChat.tsx    # Team collaboration
│   └── ...
├── contexts/
│   └── AuthContext.tsx # Firebase auth provider
├── hooks/              # Custom React hooks for data
├── services/
│   ├── firebase.ts     # Firebase configuration
│   ├── geminiService.ts # AI integration
│   └── seedService.ts  # Initial data seeding
├── Aether logo/        # Official branding assets
├── types.ts            # TypeScript interfaces
├── constants.tsx       # App constants
├── index.css           # Global styles & animations
├── App.tsx             # Main app component
└── index.html          # HTML entry point
```

---

## 🎨 Design System

### Colors
- **Primary**: `#0D1B2A` - Deep navy background
- **Secondary**: `#1B263B` - Card backgrounds
- **Accent**: `#415A77` - Borders and subtle elements
- **Brand**: `#3b82f6` - Primary brand blue
- **Highlight**: `#778DA9` - Secondary text

### Animations
- Glassmorphism effects with `backdrop-blur`
- Smooth transitions (200-300ms)
- Hover scale effects
- Gradient animations
- Custom loading states

---

## 🚢 Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Netlify
```bash
npm run build
# Drag & drop the 'dist' folder to Netlify
```

### Firebase Hosting
```bash
npm install -g firebase-tools
firebase init hosting
firebase deploy
```

**Important**: Add all environment variables to your hosting platform's settings!

---

## 🤝 Contributing

We welcome contributions! Here's how:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 💬 Feedback & Support

- **Feature Requests**: Use the feedback form on the landing page
- **Bug Reports**: Open an issue on GitHub
- **Questions**: Contact us at support@aether.ai

---

## 🌟 Acknowledgments

- Built with [React](https://react.dev/)
- Powered by [Firebase](https://firebase.google.com/)
- AI by [Google Gemini](https://deepmind.google/technologies/gemini/)
- Icons from [Heroicons](https://heroicons.com/)
- Fonts from [Google Fonts](https://fonts.google.com/)

---

## 👨‍💻 Developed By

**Byte&Berry**  
🔗 [impeldown.dev](https://impeldown.dev)

---

<div align="center">
  <p><strong>Made with ❤️ for modern entrepreneurs</strong></p>
  <p>© 2024 Aether. All rights reserved.</p>
  <p style="font-size: 11px; opacity: 0.7;">Developed by Byte&Berry</p>
</div>
