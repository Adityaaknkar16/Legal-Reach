# LegalReach — AI-Powered Lawyer Consultation & Real-Time Video Platform

[![GitHub Repository](https://img.shields.io/badge/GitHub-Repository-blue?logo=github)](https://github.com/Adityaaknkar16/Legal-Reach.git)
[![React 19](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-green?logo=nodedotjs)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-brightgreen?logo=mongodb)](https://www.mongodb.com/)
[![WebRTC](https://img.shields.io/badge/WebRTC-ZEGOCLOUD-orange)](https://www.zegocloud.com/)

**LegalReach** is an AI-powered legal consultation platform that connects citizens directly with verified lawyers and advocates. It features high-definition real-time audio/video consultations powered by **ZEGOCLOUD** and WebRTC, instant in-app messaging, automated appointment booking, lawyer profile verification, and document sharing.

---

## 🔗 Repository Information

- **GitHub Repository**: [https://github.com/Adityaaknkar16/Legal-Reach.git](https://github.com/Adityaaknkar16/Legal-Reach.git)

---

## 🌟 Key Features

### ⚖️ For Clients
- **Find Verified Lawyers**: Browse verified attorneys filtered by legal specialization (Criminal, Civil, Corporate, Family, Intellectual Property, Cyber Law), location, experience, and consultation fees.
- **Instant Consultation Booking**: Schedule voice, video, or in-person consultation slots directly from the advocate's availability calendar.
- **HD Audio/Video Calling**: Low-latency 1-on-1 legal consultations powered by **ZEGOCLOUD UIKit** with screen-sharing and microphone/camera toggles.
- **Real-Time Encrypted Chat**: In-app secure text messaging with lawyers, file attachment uploads, and consultation summaries via Socket.io.
- **Case Tracking & History**: Maintain comprehensive records of legal consultations, notes, advice, and billing invoices.

### 💼 For Lawyers / Advocates
- **Professional Practice Profile**: Showcase bar council credentials, experience years, court jurisdictions, bio, and hourly consultation fees.
- **Appointment Management Dashboard**: Accept, reschedule, or decline incoming consultation requests with instant notifications.
- **Virtual Chamber**: Host secure video hearings with clients, review shared documents live, and issue digital legal summaries.

---

## 🛠️ Tech Stack & Architecture

### Backend
- **Framework**: Node.js & Express.js
- **Database**: MongoDB with Mongoose ODM
- **Real-Time Communication**: Socket.io & WebRTC
- **Video/Audio Call Engine**: `@zegocloud/zego-uikit-prebuilt`
- **Authentication**: JWT (JSON Web Tokens) with BCrypt password hashing
- **File Storage**: Multer for legal document and profile image uploads

### Frontend
- **Framework**: React 19 with Vite 7
- **State Management**: React Redux (`@reduxjs/toolkit` / `react-redux`)
- **Routing**: React Router v7 (`react-router-dom`)
- **Styling**: Tailwind CSS v4 & Lucide React icons
- **Real-time Clients**: `socket.io-client`, `simple-peer`, `buffer`, `crypto-js`

---

## 📁 Project Structure

```text
LegalReach/
├── package.json               # Root dependencies (ZEGOCLOUD UIKit)
├── backend/
│   ├── config/                # MongoDB database connection
│   ├── controller/            # Business logic handlers
│   ├── models/                # Mongoose models (User, Lawyer, Appointment, Call, Message)
│   ├── routes/                # API endpoints
│   │   ├── authRoutes.js      # Client & lawyer signup, login, profile
│   │   ├── callRoutes.js      # Call token generation & call logs
│   │   ├── chatRoutes.js      # Message history and conversation endpoints
│   │   ├── newLawyerRoutes.js # Lawyer listings, search, and profile verification
│   │   └── requestRoutes.js   # Appointment requests and approvals
│   ├── index.js               # Express + Socket.io server entrypoint
│   └── .env                   # Server credentials
└── frontend/
    ├── index.html
    ├── vite.config.js
    ├── package.json           # React 19, Redux, Tailwind CSS v4
    └── src/
        ├── components/        # Reusable UI widgets, navigation, call modals
        ├── pages/             # Client dashboard, lawyer search, video chamber, chat
        └── utils/             # API client, ZEGOCLOUD helper, auth context
```

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/legalreach?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key_here
ZEGO_APP_ID=your_zegocloud_app_id
ZEGO_SERVER_SECRET=your_zegocloud_server_secret
CLIENT_URL=http://localhost:5173
```

---

## 🚀 Installation & Setup

### 1. Prerequisites
- Node.js (v18 or higher)
- MongoDB instance (local or MongoDB Atlas)
- ZEGOCLOUD Developer Account (Free AppID & ServerSecret)

### 2. Backend Setup
```bash
cd backend
npm install
npm start
```
The backend server runs on `http://localhost:5000`.

### 3. Frontend Setup
In a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
The client application runs at `http://localhost:5173`.

---

## 📡 Key API Endpoints

| Method | Endpoint | Description |
|:---|:---|:---|
| `POST` | `/api/auth/register` | Register client or lawyer account |
| `POST` | `/api/auth/login` | Authenticate user and issue JWT |
| `GET` | `/api/lawyers` | Search lawyers by practice area & location |
| `GET` | `/api/lawyers/:id` | Get detailed lawyer credentials and availability |
| `POST` | `/api/requests/book` | Submit a consultation appointment request |
| `GET` | `/api/requests/my` | View upcoming and completed consultations |
| `POST` | `/api/call/generate-token` | Generate ZEGOCLOUD room token for video call |
| `GET` | `/api/chat/:conversationId` | Retrieve chat history for consultation |
