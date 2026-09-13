# RESTful API Reference — TO-DO-TRACKER
## BACSE344 — Cloud Infrastructure and Architecture | Digital Assignment

| Submission Details | Information |
|---|---|
| **Student Name** | **ANIKET MOHANTY** |
| **Registration Number** | **25BCE5816** |
| **Course Code & Slot** | BACSE344 — Slot C1 |
| **Faculty In-Charge** | Dr. P. Anandan |
| **Production Base URL** | `https://taskflow-backend-9huw.onrender.com/api` |
| **Local Development URL** | `http://localhost:5000/api` |

---

## 1. Global API Standards & Conventions

### 1.1 Communication Protocol
* **Format:** JSON (`application/json`)
* **Transport:** HTTPS with TLS 1.3 encryption
* **Authentication Scheme:** HTTP Bearer Authentication via JSON Web Tokens (JWT)
  ```http
  Authorization: Bearer <jwt_token_here>
  ```

### 1.2 Standard HTTP Status Codes
| Code | Meaning | Usage |
|---|---|---|
| `200 OK` | Request succeeded | Standard response for successful `GET`, `PUT`, `PATCH`, `DELETE`. |
| `201 Created` | Resource created | Returned by `POST` operations when a document is saved. |
| `400 Bad Request` | Validation failure | Missing required fields, invalid format, or constraint errors. |
| `401 Unauthorized` | Authentication error | Missing, invalid, or expired JWT token in `Authorization` header. |
| `404 Not Found` | Resource not found | Document with the requested ID does not exist or belongs to another user. |
| `500 Server Error` | Unhandled error | Unexpected backend runtime or database exception. |

### 1.3 Uniform JSON Response Envelope
All API endpoints return responses structured in the following standard envelope:
```json
{
  "success": true,
  "message": "Descriptive message (optional)",
  "data": {},           // Object or Array containing the payload
  "pagination": {}      // Present only on paginated listing endpoints
}
```

---

## 2. System Health Check API

### `GET /api/health`
Monitors backend runtime status and live MongoDB Atlas database connection.
* **Auth Required:** No (Public)
* **Response (200 OK):**
```json
{
  "success": true,
  "status": "healthy",
  "database": "connected",
  "uptime": 4512.87,
  "timestamp": "2026-09-13T06:15:00.000Z"
}
```

---

## 3. Authentication & User Management API (`/api/auth`)

### 3.1 `POST /api/auth/register`
Creates a new user account with bcrypt password hashing (12 salt rounds) and returns a signed 7-day JWT.
* **Auth Required:** No
* **Request Body:**
```json
{
  "name": "Aniket Mohanty",
  "email": "aniket@example.com",
  "password": "SecurePassword123"
}
```
* **Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Account created successfully!",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "6aa44de754b6ef26c89ed5c4",
    "name": "Aniket Mohanty",
    "email": "aniket@example.com"
  }
}
```

### 3.2 `POST /api/auth/login`
Authenticates user credentials against the database and returns a signed JWT.
* **Auth Required:** No
* **Request Body:**
```json
{
  "email": "aniket@example.com",
  "password": "SecurePassword123"
}
```
* **Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful!",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "6aa44de754b6ef26c89ed5c4",
    "name": "Aniket Mohanty",
    "email": "aniket@example.com"
  }
}
```

### 3.3 `GET /api/auth/me`
Retrieves current user profile information from the bearer token.
* **Auth Required:** Yes (`Bearer <token>`)
* **Success Response (200 OK):**
```json
{
  "success": true,
  "user": {
    "id": "6aa44de754b6ef26c89ed5c4",
    "name": "Aniket Mohanty",
    "email": "aniket@example.com"
  }
}
```

---

## 4. Habit Tasks API (`/api/habits`)

All routes in this module are strictly isolated to the authenticated user's ID (`req.user.id`).

### 4.1 `GET /api/habits`
Retrieves all active habit tasks for the logged-in user, ordered sequentially.
* **Auth Required:** Yes (`Bearer <token>`)
* **Success Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "6aa4534aaf80b1f1f0e0df42",
      "name": "Morning Workout",
      "type": "fixed",
      "scheduledDays": [],
      "color": "#818cf8",
      "order": 0,
      "userId": "6aa44de754b6ef26c89ed5c4",
      "isActive": true,
      "createdAt": "2026-09-12T10:00:00.000Z"
    },
    {
      "_id": "6aa4534aaf80b1f1f0e0df46",
      "name": "Cloud Lab Practice",
      "type": "variable",
      "scheduledDays": [1, 3, 5],
      "color": "#34d399",
      "order": 1,
      "userId": "6aa44de754b6ef26c89ed5c4",
      "isActive": true,
      "createdAt": "2026-09-12T10:05:00.000Z"
    }
  ]
}
```

### 4.2 `POST /api/habits`
Creates a new fixed or variable recurring habit task.
* **Auth Required:** Yes (`Bearer <token>`)
* **Request Body:**
```json
{
  "name": "Read 20 Pages",
  "type": "fixed",
  "scheduledDays": [],
  "color": "#60a5fa"
}
```
* **Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Habit task created",
  "data": {
    "_id": "6aa4534aaf80b1f1f0e0df50",
    "name": "Read 20 Pages",
    "type": "fixed",
    "scheduledDays": [],
    "color": "#60a5fa",
    "order": 2,
    "userId": "6aa44de754b6ef26c89ed5c4",
    "isActive": true
  }
}
```

### 4.3 `PUT /api/habits/:id`
Updates habit attributes (name, type, scheduled days, color).
* **Auth Required:** Yes (`Bearer <token>`)
* **Request Body:**
```json
{
  "name": "Read 30 Pages",
  "color": "#f472b6"
}
```
* **Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Habit task updated",
  "data": {
    "_id": "6aa4534aaf80b1f1f0e0df50",
    "name": "Read 30 Pages",
    "color": "#f472b6"
  }
}
```

### 4.4 `PATCH /api/habits/:id/order`
Updates custom drag/display sequence order.
* **Auth Required:** Yes (`Bearer <token>`)
* **Request Body:** `{ "order": 3 }`
* **Success Response (200 OK):** `{ "success": true, "data": { ... } }`

### 4.5 `DELETE /api/habits/:id`
Executes a soft-delete (`isActive: false`) to preserve historical analytics.
* **Auth Required:** Yes (`Bearer <token>`)
* **Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Habit task deleted",
  "data": { "deletedId": "6aa4534aaf80b1f1f0e0df50" }
}
```

---

## 5. Daily Completions & Analytics API (`/api/completions`)

### 5.1 `GET /api/completions?month=YYYY-MM`
Retrieves all completed checkmarks for the user's habits in a given month.
* **Auth Required:** Yes (`Bearer <token>`)
* **Query Parameters:** `month` (e.g., `2026-09`)
* **Success Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "6aa5001a...",
      "taskId": "6aa4534aaf80b1f1f0e0df42",
      "date": "2026-09-12",
      "completed": true,
      "userId": "6aa44de754b6ef26c89ed5c4"
    }
  ]
}
```

### 5.2 `GET /api/completions/chart?days=30`
Computes the daily completion percentage time-series used by the frontend SVG Bezier curve.
* **Auth Required:** Yes (`Bearer <token>`)
* **Query Parameters:** `days` (integer, default: 30, max: 90)
* **Success Response (200 OK):**
```json
{
  "success": true,
  "data": [
    { "date": "2026-09-10", "pct": 100, "completed": 3, "total": 3 },
    { "date": "2026-09-11", "pct": 67, "completed": 2, "total": 3 },
    { "date": "2026-09-12", "pct": 100, "completed": 4, "total": 4 }
  ]
}
```

### 5.3 `POST /api/completions/toggle`
Atomically inverts or creates the completion status for a habit task on a specific calendar date.
* **Auth Required:** Yes (`Bearer <token>`)
* **Request Body:**
```json
{
  "taskId": "6aa4534aaf80b1f1f0e0df42",
  "date": "2026-09-13"
}
```
* **Success Response (200 OK / 201 Created):**
```json
{
  "success": true,
  "data": {
    "_id": "6aa511bc...",
    "taskId": "6aa4534aaf80b1f1f0e0df42",
    "date": "2026-09-13",
    "completed": true,
    "userId": "6aa44de754b6ef26c89ed5c4"
  }
}
```

### 5.4 `GET /api/completions/streak/:taskId`
Calculates the consecutive daily completion streak count for a given habit.
* **Auth Required:** Yes (`Bearer <token>`)
* **Success Response (200 OK):**
```json
{
  "success": true,
  "data": { "streak": 7 }
}
```

---

## 6. Kanban Tasks API (`/api/tasks`)

### 6.1 `GET /api/tasks`
Lists tasks with server-side filtering, sorting, regex search, and pagination.
* **Auth Required:** Yes (`Bearer <token>`)
* **Query Parameters:**
  - `status` (`todo` | `in-progress` | `completed`)
  - `priority` (`low` | `medium` | `high`)
  - `search` (searches across `title`, `description`, `tags`)
  - `page` (integer, default: 1)
  - `limit` (integer, default: 20)
  - `sortBy` (`createdAt`, `dueDate`, `priority`)
  - `order` (`asc` | `desc`)
* **Success Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "6aa6011...",
      "title": "Prepare Cloud PPT Slides",
      "description": "Create 3-Tier architecture diagrams",
      "status": "in-progress",
      "priority": "high",
      "category": "Academics",
      "dueDate": "2026-09-20T00:00:00.000Z",
      "isOverdue": false,
      "userId": "6aa44de754b6ef26c89ed5c4",
      "createdAt": "2026-09-13T02:00:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalCount": 1,
    "limit": 20,
    "hasNextPage": false,
    "hasPrevPage": false
  }
}
```

### 6.2 `POST /api/tasks`
Creates a new task tied to `req.user.id`.
* **Auth Required:** Yes (`Bearer <token>`)
* **Request Body:**
```json
{
  "title": "Deploy to Vercel",
  "description": "Configure vercel.json SPA rewrites",
  "status": "completed",
  "priority": "high",
  "category": "DevOps",
  "dueDate": "2026-09-15"
}
```
* **Success Response (201 Created):** `{ "success": true, "message": "Task created successfully", "data": { ... } }`

### 6.3 `GET /api/tasks/:id`
Retrieves a single task by its MongoDB Object ID (ownership verified).
* **Auth Required:** Yes (`Bearer <token>`)
* **Success Response (200 OK):** `{ "success": true, "data": { ... } }`

### 6.4 `PUT /api/tasks/:id`
Full update of task fields.
* **Auth Required:** Yes (`Bearer <token>`)

### 6.5 `PATCH /api/tasks/:id`
Partial update (e.g. dragging a task card to *completed* column).
* **Auth Required:** Yes (`Bearer <token>`)
* **Request Body:** `{ "status": "completed" }`
* **Success Response (200 OK):** `{ "success": true, "message": "Task patched successfully", "data": { ... } }`

### 6.6 `DELETE /api/tasks/:id`
Permanently deletes a specific task.
* **Auth Required:** Yes (`Bearer <token>`)
* **Success Response (200 OK):** `{ "success": true, "message": "Task deleted successfully", "data": { "deletedId": "..." } }`

### 6.7 `GET /api/tasks/stats`
Executes an aggregation pipeline calculating total tasks, overdue tasks, status counts, and completion percentage.
* **Auth Required:** Yes (`Bearer <token>`)
* **Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "total": 12,
    "overdue": 1,
    "byStatus": {
      "todo": 4,
      "in-progress": 3,
      "completed": 5
    },
    "byPriority": {
      "low": 2,
      "medium": 6,
      "high": 4
    },
    "completionRate": "41.7"
  }
}
```

---

## 7. Endpoint Summary Cheat Sheet

| # | HTTP Method | Endpoint Path | Module | Access Level |
|---|---|---|---|---|
| 1 | `GET` | `/api/health` | System | Public |
| 2 | `POST` | `/api/auth/register` | Authentication | Public |
| 3 | `POST` | `/api/auth/login` | Authentication | Public |
| 4 | `GET` | `/api/auth/me` | Authentication | Bearer JWT |
| 5 | `GET` | `/api/habits` | Habit Tracker | Bearer JWT |
| 6 | `POST` | `/api/habits` | Habit Tracker | Bearer JWT |
| 7 | `PUT` | `/api/habits/:id` | Habit Tracker | Bearer JWT |
| 8 | `PATCH` | `/api/habits/:id/order` | Habit Tracker | Bearer JWT |
| 9 | `DELETE` | `/api/habits/:id` | Habit Tracker | Bearer JWT |
| 10 | `GET` | `/api/completions` | Completions | Bearer JWT |
| 11 | `GET` | `/api/completions/chart` | Analytics | Bearer JWT |
| 12 | `POST` | `/api/completions/toggle` | Completions | Bearer JWT |
| 13 | `GET` | `/api/completions/streak/:taskId`| Analytics | Bearer JWT |
| 14 | `GET` | `/api/tasks` | Kanban Tasks | Bearer JWT |
| 15 | `POST` | `/api/tasks` | Kanban Tasks | Bearer JWT |
| 16 | `GET` | `/api/tasks/:id` | Kanban Tasks | Bearer JWT |
| 17 | `PUT` | `/api/tasks/:id` | Kanban Tasks | Bearer JWT |
| 18 | `PATCH` | `/api/tasks/:id` | Kanban Tasks | Bearer JWT |
| 19 | `DELETE` | `/api/tasks/:id` | Kanban Tasks | Bearer JWT |
| 20 | `GET` | `/api/tasks/stats` | Dashboard Stats | Bearer JWT |
