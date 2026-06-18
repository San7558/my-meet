# 🌐 AI Translation Room

> Professional SaaS-style web application for real-time multilingual speech translation with AI-powered gesture safety monitoring.

---

## 📋 Overview

AI Translation Room lets users join a live session, speak in any language, and instantly see translated captions in their chosen target language. The app uses **Deepgram** for real-time speech-to-text, **LibreTranslate** for auto language detection and translation, **MediaPipe** for hand gesture detection, and **Firebase** for authentication.

---

## ✨ Features

| Category | Feature |
|---|---|
| **Auth** | Google Sign-In via Firebase |
| **Speech** | Real-time speech-to-text using Deepgram Nova-2 |
| **Translation** | Auto language detection + translation via LibreTranslate |
| **Gesture AI** | Middle-finger detection using MediaPipe Hands |
| **Warning System** | 3-strike system — auto session termination |
| **PDF Export** | Download session transcript as PDF |
| **Violation Log** | Gesture violations saved to MongoDB |
| **Design** | Dark premium SaaS UI, glassmorphism, Framer Motion animations |
| **3D Hero** | React Three Fiber rotating globe on landing page |

### Supported Languages

English, Tamil, Hindi, Telugu, Malayalam, Kannada

---

## 🛠️ Tech Stack

### Frontend

| Technology | Purpose |
|---|---|
| React 18 | UI framework |
| Vite | Build tool |
| Tailwind CSS | Styling |
| Framer Motion | Animations |
| React Three Fiber / Three.js | 3D hero section |
| Firebase Auth | Google login |
| Deepgram SDK | Real-time STT |
| MediaPipe Hands (CDN) | Gesture detection |
| jsPDF | PDF export |
| Axios | HTTP client |
| React Router DOM | Routing |

### Backend

| Technology | Purpose |
|---|---|
| Node.js + Express | API server |
| MongoDB Atlas + Mongoose | Database |
| Firebase Admin SDK | Token verification |
| LibreTranslate | Translation engine |
| Helmet, Morgan, CORS | Security & logging |

---

## 📂 Folder Structure

```
my-meet/
├── client/                          # Frontend (React + Vite)
│   ├── index.html                   # HTML entry + MediaPipe CDN
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.cjs
│   ├── postcss.config.cjs
│   ├── .env.example
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── index.css
│       ├── router.jsx
│       ├── pages/
│       │   ├── LandingPage.jsx
│       │   ├── LoginPage.jsx
│       │   ├── DashboardPage.jsx
│       │   └── SessionPage.jsx
│       ├── components/
│       │   ├── layout/
│       │   ├── landing/
│       │   ├── session/
│       │   │   ├── CameraPreview.jsx
│       │   │   ├── VideoAudioControls.jsx
│       │   │   ├── DescriptionBox.jsx
│       │   │   ├── GestureCounter.jsx
│       │   │   └── LanguageDropdown.jsx
│       │   └── ui/
│       ├── context/
│       │   ├── AuthContext.jsx
│       │   └── SessionContext.jsx
│       ├── hooks/
│       │   ├── useDeepgram.js
│       │   ├── useMediaPipe.js
│       │   └── useGestureAlert.js
│       ├── services/
│       │   ├── firebase.js
│       │   ├── api.js
│       │   └── pdf.js
│       ├── constants/
│       │   └── languages.js
│       ├── utils/
│       │   ├── cn.js
│       │   └── formatDate.js
│       └── routes/
│           └── ProtectedRoute.jsx
│
└── server/                          # Backend (Node.js + Express)
    ├── index.js
    ├── package.json
    ├── .env.example
    ├── config/
    │   ├── db.js
    │   └── firebaseAdmin.js
    ├── routes/
    │   ├── auth.routes.js
    │   ├── translate.routes.js
    │   └── violation.routes.js
    ├── controllers/
    │   ├── auth.controller.js
    │   ├── translate.controller.js
    │   └── violation.controller.js
    ├── models/
    │   ├── User.model.js
    │   └── Violation.model.js
    ├── middleware/
    │   ├── verifyToken.js
    │   ├── errorHandler.js
    │   └── notFound.js
    ├── services/
    │   └── libreTranslate.service.js
    └── utils/
        └── languageMap.js
```

---

## 🚀 Local Setup

### Prerequisites

- Node.js 18+
- Docker Desktop (for LibreTranslate)
- Firebase project with Google Sign-In enabled
- MongoDB Atlas cluster
- Deepgram API key

---

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd my-meet
```

### 2. LibreTranslate (Docker)

```bash
docker run -it -p 5001:5000 libretranslate/libretranslate
```

Wait until it outputs `Running on http://0.0.0.0:5000`. It will be accessible at `http://localhost:5001`.

### 3. Backend Setup

```bash
cd server
cp .env.example .env
# Fill in your values in .env
npm install
npm run dev
```

Server starts at `http://localhost:5000`.

#### Server `.env` Variables

| Variable | Description |
|---|---|
| `PORT` | Server port (default: 5000) |
| `CLIENT_URL` | Frontend URL for CORS |
| `MONGODB_URI` | MongoDB Atlas connection string |
| `FIREBASE_PROJECT_ID` | Firebase project ID |
| `FIREBASE_CLIENT_EMAIL` | Firebase service account email |
| `FIREBASE_PRIVATE_KEY` | Firebase private key (wrap in quotes) |
| `LIBRETRANSLATE_URL` | LibreTranslate endpoint |
| `LIBRETRANSLATE_API_KEY` | Optional API key |

### 4. Frontend Setup

```bash
cd client
cp .env.example .env
# Fill in your values in .env
npm install
npm run dev
```

Frontend starts at `http://localhost:5173`.

#### Client `.env` Variables

| Variable | Description |
|---|---|
| `VITE_FIREBASE_API_KEY` | Firebase web API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID |
| `VITE_FIREBASE_APP_ID` | Firebase app ID |
| `VITE_BACKEND_URL` | Backend URL (default: http://localhost:5000) |
| `VITE_DEEPGRAM_API_KEY` | Deepgram API key |

---

## 🔗 API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/health` | No | Health check |
| `POST` | `/api/auth/save` | No | Save/upsert user |
| `GET` | `/api/translate/ping` | No | Translation health check |
| `POST` | `/api/translate` | Yes | Translate text via LibreTranslate |
| `POST` | `/api/violations` | Yes | Log gesture violation |

---

## 📄 Pages / Screens

| Route | Page | Auth |
|---|---|---|
| `/` | Landing Page | Public |
| `/login` | Login (Google Sign-In) | Public |
| `/dashboard` | Dashboard + Session Config | Protected |
| `/session` | Live Translation Session | Protected |

---

## 🌍 Deployment

### Frontend → Vercel

| Setting | Value |
|---|---|
| Root Directory | `client` |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Framework | Vite |

**Environment Variables to set on Vercel:**

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_APP_ID=...
VITE_DEEPGRAM_API_KEY=...
VITE_BACKEND_URL=https://your-render-backend.onrender.com
```

### Backend → Render

| Setting | Value |
|---|---|
| Root Directory | `server` |
| Build Command | `npm install` |
| Start Command | `npm start` |
| Environment | Node |

**Environment Variables to set on Render:**

```
PORT=5000
CLIENT_URL=https://your-vercel-app.vercel.app
MONGODB_URI=mongodb+srv://...
FIREBASE_PROJECT_ID=...
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
LIBRETRANSLATE_URL=<your-hosted-libretranslate-url>
LIBRETRANSLATE_API_KEY=
```

### ⚠️ LibreTranslate in Production

`LIBRETRANSLATE_URL=http://localhost:5001` only works **locally**.

For production options:
1. **Hosted endpoint** — Use a public LibreTranslate instance
2. **VPS/Docker** — Deploy LibreTranslate on a separate VPS
3. **Separate service** — Run it alongside your Render backend

---

## ✅ Final Testing Checklist

### Landing Page
- [ ] Landing page loads with animations
- [ ] 3D globe renders
- [ ] All sections visible and responsive
- [ ] "Get Started" navigates to login

### Authentication
- [ ] Google Sign-In works
- [ ] User redirected to dashboard after login
- [ ] Logout works
- [ ] Protected routes redirect unauthenticated users

### Dashboard
- [ ] User profile displayed
- [ ] Language dropdown works
- [ ] "Start Translation Session" navigates to /session

### Session Page
- [ ] Camera permission requested
- [ ] Microphone permission requested
- [ ] Camera preview shows live video
- [ ] Camera On/Off toggle works
- [ ] Mic On/Off toggle starts/stops Deepgram
- [ ] Speech appears as translated text in description box
- [ ] Language selector works (disabled while listening)
- [ ] "Gesture AI" indicator appears
- [ ] "Listening…" indicator shows when mic is on

### Gesture Detection
- [ ] Middle finger detected by MediaPipe
- [ ] Warning 1/3 → yellow badge + red alert line
- [ ] Warning 2/3 → yellow badge + red alert line
- [ ] Warning 3/3 → red badge + session auto-terminates
- [ ] Violations logged to MongoDB

### PDF Export
- [ ] "PDF" button disabled when no lines
- [ ] "PDF" button enabled after transcript exists
- [ ] PDF downloads with correct content
- [ ] PDF includes user name, date, language, all lines

### Session Controls
- [ ] "Stop Session" stops Deepgram + MediaPipe + camera
- [ ] "Back to Dashboard" clears lines and navigates
- [ ] Session ended state disables controls

### Backend
- [ ] `GET /health` returns `{ status: "ok" }`
- [ ] `GET /api/translate/ping` returns ready message
- [ ] `POST /api/translate` translates text correctly
- [ ] `POST /api/violations` logs violation to MongoDB

---

## 📝 License

This project is for educational and demonstration purposes.

---

Built with ❤️ using React, Express, Deepgram, LibreTranslate, MediaPipe, and Firebase.
