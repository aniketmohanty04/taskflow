# TO-DO-TRACKER — Cloud-Based Habit & Task Management System
### BACSE344 — Cloud Infrastructure and Architecture | Digital Assignment

| Submission Metadata | Details |
|---|---|
| **Student Name** | **ANIKET MOHANTY** |
| **Registration Number** | **25BCE5816** |
| **Course Code & Title** | BACSE344 — Cloud Infrastructure and Architecture |
| **Slot** | C1 |
| **Faculty** | Dr. P. Anandan |
| **Frontend Live URL** | [https://taskflow-alpha-dun.vercel.app](https://taskflow-alpha-dun.vercel.app) |
| **Backend Live API** | [https://taskflow-backend-9huw.onrender.com/api/health](https://taskflow-backend-9huw.onrender.com/api/health) |
| **Cloud Database** | MongoDB Atlas (`cluster0.cugknam.mongodb.net` — AWS Mumbai `ap-south-1`) |
| **Source Code** | [https://github.com/aniketmohanty04/taskflow](https://github.com/aniketmohanty04/taskflow) |

---

## 📌 Problem Statement
Managing daily habits and long-term tasks across individuals and teams is fragmented and ineffective when done manually. **TO-DO-TRACKER** is a production cloud-based full-stack web application that allows users to:
1. Track **fixed daily habits** and **variable weekly tasks** on a monthly checkbox grid.
2. Visualize consistency with a dynamic **30-day SVG Area Progress Chart**.
3. Manage ad-hoc tasks using a full **Kanban Board** (To Do / In Progress / Completed).
4. Securely isolate user data with **JWT Authentication** and **bcrypt** password encryption.

---

## 🏗️ 3-Tier Cloud Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│              TIER 1: PRESENTATION LAYER (Vercel CDN)            │
│              https://taskflow-alpha-dun.vercel.app              │
│  React.js 18 SPA • PWA Offline Ready • Dark Theme Glassmorphism │
└─────────────────────┬───────────────────────────────────────────┘
                      │  HTTPS REST API Calls (Axios + JWT Bearer)
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│              TIER 2: APPLICATION LAYER (Render PaaS)            │
│              https://taskflow-backend-9huw.onrender.com         │
│  Node.js + Express • JWT Middleware • Helmet • CORS • Morgan    │
│  18+ REST Endpoints (/api/auth, /api/habits, /api/completions)   │
└─────────────────────┬───────────────────────────────────────────┘
                      │  Mongoose ODM (TLS Encrypted)
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│              TIER 3: DATA LAYER (MongoDB Atlas DBaaS)           │
│              AWS ap-south-1 (Mumbai Region)                     │
│  Collections: authusers, habittasks, dailycompletions, tasks    │
│  Compound Indexes & Multi-Tenant User Isolation                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Tech Stack

| Layer | Technology | Cloud Service / Hosting |
|---|---|---|
| **Frontend** | React.js 18, Axios, SVG Charts, Lucide | Vercel (Global Edge CDN) |
| **Backend** | Node.js 18, Express.js, JWT, bcryptjs | Render.com (PaaS) |
| **Database** | MongoDB Atlas, Mongoose ODM | AWS Mumbai (`ap-south-1`) |
| **CI / CD** | Git, GitHub Actions & Webhooks | GitHub |
| **Security** | Helmet.js, CORS, Express-Validator | Cloud-Managed TLS/HTTPS |

---

## ⚙️ Local Development Setup

### Prerequisites
- Node.js v18+
- npm or yarn
- MongoDB Atlas account (free tier)

### 1. Clone & Setup Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB Atlas URI
npm run dev        # runs on http://localhost:5000
```

### 2. Setup Frontend
```bash
cd frontend
npm install
cp .env.example .env
# Edit .env: REACT_APP_API_URL=http://localhost:5000/api
npm start          # runs on http://localhost:3000
```

---

## ☁️ Cloud Deployment

### MongoDB Atlas (Database)
1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a free cluster (M0 — 512MB free)
3. Create database user and whitelist IPs (0.0.0.0/0 for cloud)
4. Copy the connection string to your backend `.env`

### Backend → Render.com
1. Push code to GitHub
2. Go to [render.com](https://render.com) → New Web Service
3. Connect GitHub repo → select `backend/` as root
4. Set environment variables:
   - `MONGODB_URI` = your Atlas connection string
   - `NODE_ENV` = production
   - `FRONTEND_URL` = your Vercel frontend URL
5. Deploy (auto-deploys on every git push)

### Frontend → Vercel
1. Go to [vercel.com](https://vercel.com) → New Project
2. Connect GitHub repo → select `frontend/` as root
3. Set environment variable:
   - `REACT_APP_API_URL` = your Render backend URL + `/api`
4. Deploy (auto-deploys on every git push)

---

## 📊 Database Design

### Collection: `tasks`
| Field       | Type     | Required | Description                  |
|-------------|----------|----------|------------------------------|
| _id         | ObjectId | Auto     | MongoDB primary key          |
| title       | String   | ✅       | Task title (3–100 chars)     |
| description | String   | ❌       | Details (max 500 chars)      |
| status      | Enum     | ✅       | todo/in-progress/completed   |
| priority    | Enum     | ✅       | low/medium/high              |
| category    | String   | ❌       | Task category                |
| dueDate     | Date     | ❌       | Deadline                     |
| assignedTo  | String   | ❌       | Person assigned              |
| tags        | [String] | ❌       | Tag array                    |
| completedAt | Date     | ❌       | Auto-set when completed      |
| userId      | String   | ❌       | Owner identifier             |
| createdAt   | Date     | Auto     | Timestamp (via mongoose)     |
| updatedAt   | Date     | Auto     | Last modified (via mongoose) |

### Collection: `users`
| Field     | Type     | Required | Description              |
|-----------|----------|----------|--------------------------|
| _id       | ObjectId | Auto     | Primary key              |
| name      | String   | ✅       | Full name                |
| email     | String   | ✅       | Unique email             |
| role      | Enum     | ❌       | admin/member/viewer      |
| isActive  | Boolean  | ❌       | Soft delete flag         |
| createdAt | Date     | Auto     | Created timestamp        |

---

## 📡 REST API Documentation

### Base URL
```
Production: https://taskflow-api.onrender.com/api
Local:      http://localhost:5000/api
```

### Health & Info
| Method | Endpoint     | Description         |
|--------|--------------|---------------------|
| GET    | /            | API status check    |
| GET    | /api/health  | Health + DB status  |

### Tasks Endpoints
| Method | Endpoint          | Description                        |
|--------|-------------------|------------------------------------|
| GET    | /api/tasks        | Get all tasks (with filters)       |
| GET    | /api/tasks/stats  | Dashboard statistics               |
| GET    | /api/tasks/:id    | Get single task by ID              |
| POST   | /api/tasks        | Create a new task                  |
| PUT    | /api/tasks/:id    | Full update a task                 |
| PATCH  | /api/tasks/:id    | Partial update (e.g., status only) |
| DELETE | /api/tasks/:id    | Delete a single task               |
| DELETE | /api/tasks        | Delete all tasks (bulk)            |

### Query Parameters (GET /api/tasks)
| Parameter | Type   | Example         | Description              |
|-----------|--------|-----------------|--------------------------|
| status    | String | `todo`          | Filter by status         |
| priority  | String | `high`          | Filter by priority       |
| search    | String | `homepage`      | Search in title/desc     |
| page      | Number | `1`             | Page number              |
| limit     | Number | `20`            | Items per page (max 100) |
| sortBy    | String | `createdAt`     | Sort field               |
| order     | String | `desc`          | Sort direction           |

### Example API Request & Response

**POST /api/tasks**
```json
Request Body:
{
  "title": "Design landing page",
  "description": "Create wireframes and mockups for the new landing page",
  "status": "todo",
  "priority": "high",
  "category": "Design",
  "dueDate": "2026-09-30",
  "assignedTo": "Aniket Sharma",
  "tags": ["frontend", "design", "urgent"]
}

Response (201 Created):
{
  "success": true,
  "message": "Task created successfully",
  "data": {
    "_id": "64f8a2b3c1234567890abcde",
    "title": "Design landing page",
    "description": "Create wireframes and mockups for the new landing page",
    "status": "todo",
    "priority": "high",
    "category": "Design",
    "dueDate": "2026-09-30T00:00:00.000Z",
    "assignedTo": "Aniket Sharma",
    "tags": ["frontend", "design", "urgent"],
    "isOverdue": false,
    "createdAt": "2026-09-09T01:00:00.000Z",
    "updatedAt": "2026-09-09T01:00:00.000Z"
  }
}
```

**GET /api/tasks/stats**
```json
Response (200 OK):
{
  "success": true,
  "data": {
    "total": 25,
    "overdue": 3,
    "byStatus": { "todo": 10, "in-progress": 8, "completed": 7 },
    "byPriority": { "low": 5, "medium": 14, "high": 6 },
    "completionRate": "28.0"
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "title", "message": "Title must be at least 3 characters" }
  ]
}
```

### Users Endpoints
| Method | Endpoint       | Description            |
|--------|----------------|------------------------|
| GET    | /api/users     | Get all active users   |
| GET    | /api/users/:id | Get single user        |
| POST   | /api/users     | Create user            |
| PUT    | /api/users/:id | Update user            |
| DELETE | /api/users/:id | Deactivate user        |

---

## 🔒 Security Features
- **Helmet.js** — Sets secure HTTP headers
- **CORS** — Restricts cross-origin requests to known frontend URL
- **Input Validation** — express-validator on all POST/PUT endpoints
- **Error Handling** — Centralized error handler, no stack traces in production
- **Rate Limiting** — Can be added via `express-rate-limit` if needed

---

## 📦 Project Structure
```
taskflow/
├── backend/
│   ├── server.js              ← Express app entry point
│   ├── package.json
│   ├── Procfile               ← Render/Heroku deployment
│   ├── .env.example           ← Environment template
│   ├── models/
│   │   ├── Task.js            ← Task MongoDB schema
│   │   └── User.js            ← User MongoDB schema
│   ├── routes/
│   │   ├── tasks.js           ← CRUD routes for tasks
│   │   └── users.js           ← CRUD routes for users
│   └── middleware/
│       └── errorHandler.js    ← Global error handler
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── index.js           ← React entry point
    │   ├── index.css          ← Global styles
    │   ├── App.js             ← Root component + state
    │   ├── App.css            ← Application styles
    │   ├── components/
    │   │   ├── Navbar.js      ← Navigation bar
    │   │   ├── Dashboard.js   ← Stats dashboard
    │   │   ├── TaskForm.js    ← Create/Edit modal form
    │   │   ├── TaskCard.js    ← Individual task card
    │   │   └── TaskList.js    ← Task board/list + filters
    │   └── services/
    │       └── api.js         ← Axios API service layer
    ├── package.json
    └── .env.example
```

---

## 🎯 Features
- ✅ **Full CRUD** — Create, Read, Update, Delete tasks and users
- ✅ **Kanban Board** — Visual task columns (To Do / In Progress / Done)
- ✅ **List View** — Tabular task display
- ✅ **Filter & Search** — Filter by status, priority, text search
- ✅ **Pagination** — Server-side pagination
- ✅ **Stats Dashboard** — Real-time task statistics
- ✅ **Overdue Detection** — Auto-detect and highlight overdue tasks
- ✅ **Inline Status Change** — Update status directly from task card
- ✅ **Responsive Design** — Works on mobile, tablet, desktop
- ✅ **Cloud Deployment** — Backend on Render, Frontend on Vercel, DB on MongoDB Atlas

---

## 👨‍💻 Author
**Student Name:** ANIKET MOHANTY 
**Register No:** 25BCE5816  
**Course:** BACSE344 — Cloud Infrastructure and Architecture  
**Faculty:** Dr. P. Anandan  
**Submitted:** September 2026
=======
"# taskflow" 
"# taskflow" 
>>>>>>> 4c2bef0347b4eabaa35ebbd6be67005ed4882e33
