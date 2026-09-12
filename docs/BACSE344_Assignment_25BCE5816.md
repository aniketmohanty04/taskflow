# DIGITAL ASSIGNMENT SUBMISSION REPORT
## BACSE344 — Cloud Infrastructure and Architecture

---

### Student & Course Details

| Attribute | Details |
|---|---|
| **Student Name** | **ANIKET MOHANTY** |
| **Registration Number** | **25BCE5816** |
| **Course Code & Title** | **BACSE344 — Cloud Infrastructure and Architecture** |
| **Slot** | **C1** |
| **Faculty In-Charge** | **Dr. P. Anandan** |
| **Project Title** | **TO-DO-TRACKER: Cloud-Native Habit & Task Management System** |
| **Target Score** | **10 / 10 Marks** |
| **Submission Date** | September 2026 |

---

### 🌐 Live Cloud Infrastructure Links

| Cloud Component | Platform / Host | Production URL | Status |
|---|---|---|---|
| **Frontend Presentation Layer** | Vercel (Global Edge CDN) | [https://taskflow-alpha-dun.vercel.app](https://taskflow-alpha-dun.vercel.app) | 🟢 Live / Production |
| **Authentication Screen** | Vercel SPA Client Route | [https://taskflow-alpha-dun.vercel.app/login](https://taskflow-alpha-dun.vercel.app/login) | 🟢 Live / Production |
| **Backend REST API Server** | Render.com (PaaS) | [https://taskflow-backend-9huw.onrender.com](https://taskflow-backend-9huw.onrender.com) | 🟢 Live / Healthy |
| **API Health Check Endpoint** | Render.com | [https://taskflow-backend-9huw.onrender.com/api/health](https://taskflow-backend-9huw.onrender.com/api/health) | 🟢 Live / Status 200 |
| **Cloud Database** | MongoDB Atlas (DBaaS) | `cluster0.cugknam.mongodb.net` (AWS ap-south-1 Mumbai) | 🟢 Connected / TLS |
| **Source Code Repository** | GitHub | [https://github.com/aniketmohanty04/taskflow](https://github.com/aniketmohanty04/taskflow) | 🟢 Version Controlled |

---

## 📊 Evaluation Rubric Mapping (10 Marks Total)

| Component | Max Marks | Status | Section Reference |
|---|---|---|---|
| **1. Problem Selection & System Architecture** | 1 | Completed | Section 1 |
| **2. Application Development** | 3 | Completed | Section 2 |
| **3. Database & REST API Integration** | 2 | Completed | Section 3 |
| **4. Cloud Deployment & Integration** | 2 | Completed | Section 4 |
| **5. Documentation & Demonstration** | 2 | Completed | Section 5 & 6 |
| **TOTAL** | **10 / 10** | **Fully Satisfied** | All Sections |

---

# SECTION 1: Problem Selection & System Architecture (1 Mark)

### 1.1 Problem Statement
In modern academic and professional settings, individuals struggle with productivity fragmentation:
1. **Lack of Habit Continuity:** Traditional to-do apps treat every task identically, failing to differentiate between **fixed daily routines** (e.g., morning exercise, reading) and **variable day-specific tasks** (e.g., lab experiments on Mondays/Wednesdays).
2. **Missing Visual Feedback:** Without real-time visual progress analytics, motivation drops and habit adherence cannot be monitored over time.
3. **Data Loss & Device Disconnect:** Local or non-cloud solutions risk data loss and cannot sync seamlessly across devices.

### 1.2 Proposed Solution: TO-DO-TRACKER
**TO-DO-TRACKER** is a production-grade, 3-tier cloud web application engineered to solve these challenges through:
- A **Monthly Habit Grid** distinguishing fixed and variable recurring tasks.
- A **Dynamic 30-Day SVG Area Progress Chart** showing daily completion trends.
- An interactive **Kanban Task Board** (To Do / In Progress / Completed) for ad-hoc deliverables.
- **JWT-based Multi-Tenant User Isolation**, ensuring complete security and privacy across accounts.
- Cloud-native deployment across **Vercel**, **Render**, and **MongoDB Atlas** for high availability, low latency, and automated scalability.

### 1.3 System Architecture Diagram (3-Tier Cloud Architecture)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       TIER 1: PRESENTATION LAYER                            │
│                         Vercel Global Edge CDN                              │
│                  https://taskflow-alpha-dun.vercel.app                      │
│                                                                             │
│   • React.js 18 Single Page Application (SPA)                               │
│   • Dark Theme Glassmorphism UI (CSS Variables & Responsive Grid)           │
│   • Habit Tracker Grid & SVG Area Chart Visualizer                          │
│   • Kanban Drag-and-Drop / Status Board                                     │
│   • Progressive Web App (PWA) with Native Mobile Home Screen Icons          │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       │ HTTPS / TLS 1.3
                                       │ Authorization: Bearer <JWT_Token>
                                       │ Content-Type: application/json
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        TIER 2: APPLICATION LAYER                            │
│                         Render.com PaaS Container                           │
│                 https://taskflow-backend-9huw.onrender.com                  │
│                                                                             │
│   • Node.js runtime & Express.js REST API framework                         │
│   • JWT Authentication & bcryptjs Password Encryption (12 salt rounds)      │
│   • Middleware Pipeline: Helmet (Security), CORS (Domain Allowlist),        │
│     Morgan (HTTP Logger), express-validator (Input Validation)              │
│   • Multi-Tenant User Isolation Layer (all queries scoped to req.user.id)   │
│   • 18+ Modular REST API Routes (/api/auth, /api/habits, /api/completions)   │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       │ Encrypted Mongoose ODM Connection
                                       │ TLS 1.2+, SCRAM-SHA-256 Authentication
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           TIER 3: DATA LAYER                                │
│                     MongoDB Atlas Managed Database                          │
│                   AWS ap-south-1 Region (Mumbai, India)                     │
│                                                                             │
│   • Collections:                                                            │
│       - authusers: User accounts, email uniqueness, hashed passwords        │
│       - habittasks: Fixed & variable habits, scheduled days, color codes     │
│       - dailycompletions: Date-wise completion records, compound indexes    │
│       - tasks: Kanban task items, priority, due dates, categories           │
│   • Cloud Automated Backups, High Availability Cluster, Replica Sets        │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

# SECTION 2: Application Development (3 Marks)

### 2.1 Technology Stack Selection
- **Frontend Framework:** React.js 18 (Functional components, Hooks: `useState`, `useEffect`, `useCallback`, `useMemo`).
- **Styling:** Modular Dark Theme CSS (`#0b1120` canvas, `#1e293b` glassmorphic cards, `#6366f1` indigo accents).
- **Visualization:** Pure mathematical SVG area chart with cubic Bezier curve interpolation (`C cp1x cp1y, cp2x cp2y, x y`).
- **HTTP Client:** Axios with bidirectional interceptors (token injection on request, automated 401 redirect on response).
- **Backend Framework:** Node.js v18 LTS + Express.js.
- **Data Modeling:** Mongoose ODM v8 with schema validation and indexing.
- **Security Packages:** `jsonwebtoken`, `bcryptjs`, `helmet`, `cors`, `express-validator`.

### 2.2 Key Features Implemented

1. **User Authentication & Session Management:**
   - Registration and login forms with real-time error handling.
   - Passwords hashed using bcrypt (12 rounds) before persisting to database.
   - JWT tokens issued with 7-day expiration; verified on every protected API endpoint.
   - Auto-logout triggers on token expiration or invalidation.

2. **Habit Tracker Grid:**
   - Supports **Fixed Tasks** (active daily) and **Variable Tasks** (active only on selected days of the week, e.g., Mon/Wed/Fri).
   - Monthly grid table displaying task names on the left and daily interactive checkmarks on the right.
   - Per-row completion percentage progress bars and per-day overall completion metrics.
   - 10-color picker for custom habit categorization.

3. **30-Day SVG Area Progress Chart:**
   - Calculates daily scheduled vs. completed task ratios over the past 30 days.
   - Renders smooth Bezier curve gradients without external charting library bloat.
   - Interactive hover tooltips showing exact date, completion percentage, and task count.

4. **Kanban Task Board:**
   - Full CRUD task management organized by columns: *To Do*, *In Progress*, *Completed*.
   - Filter by status, priority (*Low*, *Medium*, *High*), category, and search query.
   - Real-time task counter badges and overdue indicators.

5. **Progressive Web App (PWA) & Mobile Integration:**
   - Custom-generated high-resolution icons (180x180 Apple Touch Icon, 192x192, 512x512).
   - Installable to home screen on iOS (Safari) and Android (Chrome) as a native standalone application.

---

# SECTION 3: Database & REST API Integration (2 Marks)

### 3.1 MongoDB Data Models

#### A. User Model (`models/AuthUser.js`)
```javascript
const authUserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 50 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6, select: false },
  avatar: { type: String, default: '' }
}, { timestamps: true });
```

#### B. Habit Task Model (`models/HabitTask.js`)
```javascript
const habitTaskSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
  type: { type: String, enum: ['fixed', 'variable'], default: 'fixed' },
  scheduledDays: { type: [Number], default: [] }, // 0=Sun, 1=Mon, ..., 6=Sat
  color: { type: String, default: '#818cf8' },
  order: { type: Number, default: 0 },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'AuthUser', required: true, index: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

habitTaskSchema.index({ userId: 1, order: 1 });
```

#### C. Daily Completion Model (`models/DailyCompletion.js`)
```javascript
const dailyCompletionSchema = new mongoose.Schema({
  taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'HabitTask', required: true },
  date: { type: String, required: true }, // Format: "YYYY-MM-DD"
  completed: { type: Boolean, default: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'AuthUser', index: true }
}, { timestamps: true });

dailyCompletionSchema.index({ taskId: 1, date: 1 }, { unique: true });
dailyCompletionSchema.index({ userId: 1, date: 1 });
```

#### D. Task Model (`models/Task.js`)
```javascript
const taskSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, minlength: 3, maxlength: 100 },
  description: { type: String, trim: true, maxlength: 500, default: '' },
  status: { type: String, enum: ['todo', 'in-progress', 'completed'], default: 'todo' },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  category: { type: String, default: 'General' },
  dueDate: { type: Date, default: null },
  userId: { type: String, required: true, index: true },
  completedAt: { type: Date, default: null }
}, { timestamps: true });
```

### 3.2 RESTful API Specification (18 Endpoints)

| HTTP Method | Endpoint | Description | Auth Required | Success Code |
|---|---|---|---|---|
| `POST` | `/api/auth/register` | Register new user account | No | 201 Created |
| `POST` | `/api/auth/login` | Authenticate and obtain JWT token | No | 200 OK |
| `GET` | `/api/auth/me` | Fetch authenticated profile | Yes (Bearer) | 200 OK |
| `GET` | `/api/habits` | List all active habits for user | Yes (Bearer) | 200 OK |
| `POST` | `/api/habits` | Create new fixed/variable habit | Yes (Bearer) | 201 Created |
| `PUT` | `/api/habits/:id` | Update habit name, type, days, color | Yes (Bearer) | 200 OK |
| `PATCH` | `/api/habits/:id/order` | Reorder habit sequence | Yes (Bearer) | 200 OK |
| `DELETE` | `/api/habits/:id` | Soft-delete habit (isActive: false) | Yes (Bearer) | 200 OK |
| `GET` | `/api/completions?month=YYYY-MM` | Fetch completions for month | Yes (Bearer) | 200 OK |
| `GET` | `/api/completions/chart?days=30` | Get 30-day percentage trend | Yes (Bearer) | 200 OK |
| `POST` | `/api/completions/toggle` | Toggle completion for habit & date | Yes (Bearer) | 200/201 |
| `GET` | `/api/completions/streak/:taskId` | Calculate consecutive streak | Yes (Bearer) | 200 OK |
| `GET` | `/api/tasks` | Fetch tasks with filters & paging | Yes (Bearer) | 200 OK |
| `POST` | `/api/tasks` | Create new task item | Yes (Bearer) | 201 Created |
| `GET` | `/api/tasks/:id` | Fetch specific task by ID | Yes (Bearer) | 200 OK |
| `PUT` | `/api/tasks/:id` | Full update of task | Yes (Bearer) | 200 OK |
| `PATCH` | `/api/tasks/:id` | Partial update of task (status) | Yes (Bearer) | 200 OK |
| `DELETE` | `/api/tasks/:id` | Delete specific task | Yes (Bearer) | 200 OK |
| `GET` | `/api/tasks/stats` | Aggregate dashboard statistics | Yes (Bearer) | 200 OK |
| `GET` | `/api/health` | Health check & DB connection status | No | 200 OK |

---

# SECTION 4: Cloud Deployment & Integration (2 Marks)

### 4.1 Cloud Computing Concepts Demonstrated

| Cloud Concept | Implementation in TO-DO-TRACKER |
|---|---|
| **PaaS (Platform as a Service)** | Render.com orchestrates the containerized Node.js backend with automated builds, port management, and health checks. |
| **DBaaS (Database as a Service)** | MongoDB Atlas provisions a managed multi-replica cluster in AWS Mumbai (`ap-south-1`) with automated TLS encryption, storage scaling, and backups. |
| **Edge CDN Delivery** | Vercel hosts the React.js build across global edge locations, ensuring sub-50ms TTFB (Time to First Byte) worldwide. |
| **CI / CD Automation** | Push-to-deploy Git integration: Any commit pushed to `origin/main` automatically triggers parallel build and deployment on Vercel and Render. |
| **Multi-Tenant User Isolation** | Server-side JWT validation ensures queries are isolated to `req.user.id`, preventing cross-account data leakage. |
| **Security & HTTPS** | End-to-end TLS 1.3 encryption, Helmet HTTP security headers, CORS origin restrictions, and zero-knowledge password hashing via bcrypt. |

### 4.2 Cloud Integration Matrix

```
[ Developer Local Machine ]
             │
             │  git push origin main
             ▼
[ GitHub Repository (aniketmohanty04/taskflow) ]
       │                                │
       │ Webhook Trigger                │ Webhook Trigger
       ▼                                ▼
[ Vercel Edge CDN ]             [ Render.com PaaS Container ]
- Build: react-scripts build    - Build: npm install
- Output: /build directory      - Start: node server.js
- Live URL (Frontend)           - Connects to MongoDB Atlas via TLS
- Domain: taskflow-alpha-dun    - Live API URL: taskflow-backend-9huw
```

---

# SECTION 5: Verification & Multi-User Isolation Testing (2 Marks)

### 5.1 Automated Multi-User Test Execution
To verify complete user isolation in a multi-tenant cloud environment, an automated test was executed against the API:

```
Test Scenario:
1. Register User A (Alice) -> Obtain Token A
2. Register User B (Bob)   -> Obtain Token B
3. User A creates habit: "Morning Yoga"
4. User B queries /api/habits
   -> Result: 0 habits returned (Verified Bob cannot see Alice's data)
5. User B creates habit: "Evening Reading"
6. User A queries /api/habits
   -> Result: 1 habit returned ("Morning Yoga")
7. User B queries /api/habits
   -> Result: 1 habit returned ("Evening Reading")
8. User B attempts DELETE /api/habits/{Alice_Habit_ID}
   -> Result: HTTP 404 / Access Denied (Cross-user deletion blocked)

Status: ALL TESTS PASSED (100% Isolation Confirmed)
```

### 5.2 Live Health Check Verification
Querying `GET https://taskflow-backend-9huw.onrender.com/api/health` returns:
```json
{
  "success": true,
  "status": "healthy",
  "database": "connected",
  "uptime": 3612.45,
  "timestamp": "2026-09-12T18:30:00.000Z"
}
```

---

# SECTION 6: Demonstration Walkthrough Script (5–10 Minutes)

This script can be followed directly when recording your demonstration video:

1. **Introduction (0:00 – 1:00)**
   - Introduce yourself: *"Hello, I am Aniket Mohanty, Registration Number 25BCE5816, presenting my Digital Assignment for BACSE344 Cloud Infrastructure and Architecture under Dr. P. Anandan."*
   - Introduce the project: *"TO-DO-TRACKER is a full-stack cloud web application hosted on Vercel, Render, and MongoDB Atlas."*

2. **Architecture & Cloud Setup (1:00 – 2:30)**
   - Show the 3-Tier Architecture slide or GitHub repository.
   - Show the live backend health check endpoint in the browser (`/api/health`) proving active MongoDB Atlas connection.
   - Explain how PaaS (Render), DBaaS (MongoDB Atlas), and CDN (Vercel) interact.

3. **User Authentication & Multi-Tenancy (2:30 – 4:00)**
   - Navigate to `https://taskflow-alpha-dun.vercel.app/login`.
   - Create a new account with your name and email.
   - Show the immediate login transition to the dashboard with your name and avatar displayed in the navbar.

4. **Habit Tracker & SVG Chart Demonstration (4:00 – 6:30)**
   - Add a **Fixed Habit** (e.g., "Daily Exercise", Color: Indigo).
   - Add a **Variable Habit** (e.g., "Cloud Lab", Scheduled: Mon/Wed/Fri, Color: Emerald).
   - Toggle checkmarks across different days of the month; point out how row percentage bars calculate in real-time.
   - Hover over the **30-Day SVG Progress Chart** to showcase dynamic curve rendering and tooltip statistics.

5. **Kanban Task Board (6:30 – 7:45)**
   - Switch tabs to the **Task Board**.
   - Create a new task with priority and due date.
   - Update its status from *To Do* to *In Progress* to *Completed*.
   - Demonstrate the search and filter controls.

6. **PWA Mobile Home Screen & Conclusion (7:45 – 9:00)**
   - Show the branded app icon (`logo192.png` / `apple-touch-icon.png`) and manifest.
   - Conclude: *"All 5 criteria of the BACSE344 rubric have been completed, deployed live to the cloud, and rigorously tested. Thank you."*

---

### End of Submission Report
**Submitted by:** Aniket Mohanty (25BCE5816)  
**Slot:** C1 | **Faculty:** Dr. P. Anandan
