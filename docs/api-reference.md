# API Reference — TaskFlow REST API

## Base URL
- **Production**: `https://taskflow-api.onrender.com/api`
- **Development**: `http://localhost:5000/api`

## Response Format
All responses follow this structure:
```json
{
  "success": true | false,
  "message": "Human-readable message",
  "data": { } | [ ],
  "pagination": { }     // only for list endpoints
}
```

---

## 📋 Tasks API

### GET /api/tasks
Retrieve all tasks with optional filtering, searching, sorting and pagination.

**Query Parameters:**
| Parameter | Type   | Default    | Description |
|-----------|--------|------------|-------------|
| status    | string | -          | Filter: `todo`, `in-progress`, `completed` |
| priority  | string | -          | Filter: `low`, `medium`, `high` |
| category  | string | -          | Filter by category name |
| search    | string | -          | Search in title, description, tags |
| page      | number | 1          | Page number |
| limit     | number | 20         | Items per page (max 100) |
| sortBy    | string | createdAt  | Field to sort by |
| order     | string | desc       | Sort direction: `asc` or `desc` |

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64f8a2b3c1234567890abcde",
      "title": "Design landing page",
      "description": "Create wireframes...",
      "status": "todo",
      "priority": "high",
      "category": "Design",
      "dueDate": "2026-09-30T00:00:00.000Z",
      "assignedTo": "Aniket",
      "tags": ["frontend", "urgent"],
      "isOverdue": false,
      "createdAt": "2026-09-09T01:00:00.000Z",
      "updatedAt": "2026-09-09T01:00:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalCount": 52,
    "limit": 20,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

---

### GET /api/tasks/stats
Get dashboard statistics for all tasks.

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "total": 25,
    "overdue": 3,
    "byStatus": {
      "todo": 10,
      "in-progress": 8,
      "completed": 7
    },
    "byPriority": {
      "low": 5,
      "medium": 14,
      "high": 6
    },
    "completionRate": "28.0"
  }
}
```

---

### GET /api/tasks/:id
Get a single task by MongoDB Object ID.

**Success Response (200):**
```json
{
  "success": true,
  "data": { ...task object... }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "Task not found"
}
```

---

### POST /api/tasks
Create a new task.

**Request Body:**
```json
{
  "title": "string (required, 3-100 chars)",
  "description": "string (optional, max 500 chars)",
  "status": "todo | in-progress | completed (default: todo)",
  "priority": "low | medium | high (default: medium)",
  "category": "string (optional, max 50 chars)",
  "dueDate": "ISO 8601 date string (optional)",
  "assignedTo": "string (optional, max 50 chars)",
  "tags": ["array", "of", "strings"],
  "userId": "string (optional)"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Task created successfully",
  "data": { ...created task... }
}
```

**Validation Error (400):**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "title", "message": "Title must be at least 3 characters" }
  ]
}
```

---

### PUT /api/tasks/:id
Full update — replace all task fields.

**Request Body:** Same as POST (all fields)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Task updated successfully",
  "data": { ...updated task... }
}
```

---

### PATCH /api/tasks/:id
Partial update — update only provided fields.

**Request Body (any subset):**
```json
{
  "status": "completed"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Task patched successfully",
  "data": { ...updated task... }
}
```

---

### DELETE /api/tasks/:id
Delete a single task permanently.

**Success Response (200):**
```json
{
  "success": true,
  "message": "Task deleted successfully",
  "data": { "deletedId": "64f8a2b3c1234567890abcde" }
}
```

---

### DELETE /api/tasks
Delete ALL tasks (bulk delete).

**Success Response (200):**
```json
{
  "success": true,
  "message": "25 tasks deleted successfully"
}
```

---

## 👤 Users API

### GET /api/users
```json
{ "success": true, "data": [...users], "count": 5 }
```

### GET /api/users/:id
```json
{ "success": true, "data": { ...user } }
```

### POST /api/users
**Body:** `{ "name": "string*", "email": "string*", "role": "admin|member|viewer" }`

### PUT /api/users/:id
**Body:** Same as POST

### DELETE /api/users/:id
Soft delete (sets `isActive: false`)
```json
{ "success": true, "message": "User deactivated successfully" }
```

---

## 🏥 Health Check

### GET /api/health
```json
{
  "success": true,
  "status": "healthy",
  "database": "connected",
  "uptime": 3842.5,
  "timestamp": "2026-09-09T01:23:00.000Z"
}
```

---

## HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200  | Success |
| 201  | Created |
| 400  | Bad Request / Validation Error |
| 404  | Resource Not Found |
| 409  | Conflict (duplicate email) |
| 500  | Internal Server Error |
