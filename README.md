# ChatGPT Notes Hub 🎓
> **AI-Powered College Notes Sharing & Exam Preparation Platform**

ChatGPT Notes Hub is a responsive, modern full-stack web application designed for university and diploma students to organize study materials, access branch-specific lecture notes, generate structured exam notes using AI, and download formatted PDF study guides.

---

## 🚀 Key Features

### 1. Home Page
- **Brand Identity**: Modern blue and white aesthetic with dark accents and glassmorphic navigation.
- **Instant Search**: Search through subjects, topics, and verified notes in real time.
- **Branch Grid**: Dedicated portals for **CSE, IT, EEE, ECE, Mechanical, Civil, and Diploma**.
- **Recently Added Notes**: Quick overview of newly uploaded community lecture notes.
- **Popular Subjects**: Fast tags for trending semester subjects like Data Structures, DBMS, AI & ML, Thermodynamics, and VLSI.

### 2. Student Notes Library
- **Multi-Level Filtering**: Filter notes by **Course, Branch, Academic Year, Semester, Subject, and Unit**.
- **Search & Sort**: Real-time keyword search with sorting by newest uploads, download count, or view count.
- **Note Cards**: Display subject, unit, branch badge, description, and PDF availability.
- **PDF Preview & Download**: Instant in-browser preview modal and one-click PDF downloading.

### 3. AI Notes Generator
- **Customized Exam Inputs**:
  - Course and Branch
  - Year and Semester
  - Subject Name & Unit / Topic
  - **Exam Marks**: 2 Marks (concise definitions), 5 Marks (theory & examples), 8 Marks, or 10 Marks (full derivations & model answers)
  - **Difficulty**: Beginner, Intermediate, or Advanced
  - **Language**: English or Telugu (తెలుగు)
- **Structured Output**: Clear conceptual explanation, formal definitions, step-by-step mechanisms, practical examples, and expected university exam questions.
- **One-Click Export to PDF**: Generates formatted PDFs with title, subject, topic, page numbers, and official disclaimer.
- **Add to Library**: Directly save AI-generated study notes into the Student Notes Library.
- **Transparent Fallback**: If an AI key is not configured, displays an informative banner and generates curriculum-aligned sample notes without pretending live AI is active.

### 4. PDF Upload System
- **Secure File Upload**: Drag-and-drop or file picker with real-time validation.
- **Validation**: Enforces `.pdf` format and a **15MB** file size limit.
- **Metadata Management**: Captures title, branch, course, year, semester, subject, unit, and description.
- **Storage**: PDF files are stored on the server filesystem (`server/uploads/`) and recorded in the database.

### 5. User Accounts & Bookmarks
- **Authentication**: JWT-based sign-in and registration with hashed passwords (`bcryptjs`).
- **One-Click Demo Accounts**: Test immediately with pre-configured **Demo Student** and **Demo Admin** buttons.
- **Saved Favorites**: Students can bookmark important notes for exam revision.
- **Upload History**: Track uploaded notes, approval statuses, and download statistics.

### 6. Admin Dashboard
- **Review Queue**: Review student-uploaded notes before publishing (Approve or Reject).
- **File Management**: Remove duplicate or inappropriate uploads.
- **Curriculum Management**: Add or delete subjects across branches and semesters.
- **System Metrics**: Real-time stats on total uploads, pending moderation, downloads, and registered users.

### 7. PDF Export Engine
- High-speed vector layout engine with page numbering (`Page X of Y`).
- High-fidelity canvas rendering for complex fonts and Telugu script (`Noto Sans Telugu`).
- **Mandatory Syllabus Disclaimer**:
  > *"Disclaimer: AI-generated material should be checked against the official syllabus and textbooks."*

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite 6, Modern Vanilla CSS Design System |
| **Icons** | Lucide React |
| **PDF Generation** | jsPDF, html2canvas |
| **Backend** | Node.js, Express.js |
| **Database & Storage** | Structured JSON Database (ACID-safe atomic writes), Multer filesystem storage |
| **Authentication** | JSON Web Tokens (JWT), bcryptjs |
| **AI Integration** | Google Gemini API (1.5 Flash) / OpenAI GPT, with curriculum fallback engine |

---

## 📦 Installation & Setup Instructions

### Prerequisites
- Node.js (v18 or higher) and npm installed.

### 1. Clone or Open Workspace
```bash
cd "c:\Users\user\New folder"
```

### 2. Configure Environment Variables
Copy `.env.example` to `server/.env`:
```bash
cp server/.env.example server/.env
```
*(The default `server/.env` is already created and pre-configured for immediate use).*

### 3. Install Dependencies
```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 4. Start the Application

#### Run Backend Server (Port 5000)
```bash
cd server
node server.js
```

#### Run Frontend Dev Server (Port 5173)
```bash
cd client
npm run dev
```

Open your browser at **`http://localhost:5173/`**.

---

## 🔑 Pre-Seeded Demo Accounts

You can test user roles immediately using the quick-fill buttons on the Sign In page, or with these credentials:

| Role | Email | Password | Permissions |
|---|---|---|---|
| **Administrator** | `admin@noteshub.com` | `admin123` | Full access, moderation queue, delete notes, manage subjects |
| **Student** | `student@college.edu` | `student123` | Upload notes, save favorites, generate AI notes |

---

## ⚡ Feature Status: Out-of-the-Box vs. API Keys

| Feature | Status | Requirement |
|---|---|---|
| **Home Page, Search & Branch Portals** | ✅ Working Immediately | Pre-seeded with 10+ college notes across 7 branches |
| **Notes Library, Multi-Filter & Search** | ✅ Working Immediately | No setup required |
| **PDF Preview & Physical PDF Download** | ✅ Working Immediately | Sample PDFs included in `server/uploads/` |
| **AI Generator (Sample Educational Engine)** | ✅ Working Immediately | Generates 2, 5, 8, 10 mark notes in English & Telugu |
| **PDF Export (with Page Numbers & Disclaimer)** | ✅ Working Immediately | Client & server generation |
| **PDF File Upload & Size Validation** | ✅ Working Immediately | Files stored in `server/uploads/` |
| **User Sign Up, Login & Favorites** | ✅ Working Immediately | Stored in database |
| **Admin Moderation & Subject Management** | ✅ Working Immediately | Log in with demo admin credentials |
| **Live Generative AI (Real-time Gemini / GPT)** | ⚙️ Requires API Key | Add `GEMINI_API_KEY` to `server/.env` (Get free from [Google AI Studio](https://aistudio.google.com/app/apikey)) |

---

## 🛡️ Security Highlights
- **No Client Secrets**: API keys are only kept in `server/.env` and are never exposed to client-side code.
- **File Upload Validation**: Multer checks mime types and extension for `.pdf`, and enforces a 15MB limit.
- **Password Security**: Passwords are encrypted using salted `bcryptjs` rounds before persistence.
- **Admin RBAC**: Admin endpoints are protected with role-based JWT validation middleware.
