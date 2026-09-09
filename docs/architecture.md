# Cloud Architecture — TaskFlow

## Architecture Overview

```
                        ┌───────────────────────────────────────────┐
                        │           INTERNET (Users)                 │
                        └─────────────────┬─────────────────────────┘
                                          │ HTTPS
                        ┌─────────────────▼─────────────────────────┐
                        │         VERCEL CDN (Global Edge)           │
                        │    React.js Single Page Application        │
                        │    - Static file hosting                   │
                        │    - Global CDN distribution               │
                        │    - Auto HTTPS/TLS                        │
                        │    - CI/CD via GitHub integration          │
                        │    URL: https://taskflow.vercel.app        │
                        └─────────────────┬─────────────────────────┘
                                          │ HTTPS REST API (Axios)
                        ┌─────────────────▼─────────────────────────┐
                        │        RENDER.COM (Cloud PaaS)             │
                        │     Node.js + Express REST API Server      │
                        │                                            │
                        │  ┌──────────────────────────────────────┐ │
                        │  │         Express Middleware Stack      │ │
                        │  │  Helmet → CORS → Morgan → Routes     │ │
                        │  └──────────────────────────────────────┘ │
                        │  ┌──────────────────────────────────────┐ │
                        │  │          API Route Handlers          │ │
                        │  │  /api/tasks  (GET,POST,PUT,PATCH,    │ │
                        │  │              DELETE)                  │ │
                        │  │  /api/users  (GET,POST,PUT,DELETE)   │ │
                        │  │  /api/health (GET)                   │ │
                        │  └──────────────────────────────────────┘ │
                        │                                            │
                        │  Auto-scales · Free tier · CI/CD          │
                        │  URL: https://taskflow-api.onrender.com   │
                        └─────────────────┬─────────────────────────┘
                                          │ Mongoose ODM (TCP/TLS)
                        ┌─────────────────▼─────────────────────────┐
                        │       MONGODB ATLAS (DBaaS - AWS)          │
                        │    Cluster Region: ap-south-1 (Mumbai)     │
                        │                                            │
                        │  ┌──────────────────────────────────────┐ │
                        │  │   Database: taskflowdb               │ │
                        │  │   ├── Collection: tasks              │ │
                        │  │   │   ├── Indexes: status, priority  │ │
                        │  │   │   ├── Indexes: userId, createdAt │ │
                        │  │   │   └── Schema Validation          │ │
                        │  │   └── Collection: users              │ │
                        │  │       └── Index: email (unique)      │ │
                        │  └──────────────────────────────────────┘ │
                        │                                            │
                        │  Free M0 Tier · Automated Backups         │
                        │  Connection Pooling · IP Whitelist         │
                        └───────────────────────────────────────────┘
```

## Cloud Services Used

| Service | Provider | Purpose | Tier |
|---------|----------|---------|------|
| Frontend Hosting | Vercel | Static React app + CDN | Free |
| Backend Hosting | Render.com | Node.js API server | Free |
| Database | MongoDB Atlas | Cloud NoSQL database | Free M0 |
| Source Control | GitHub | Code repository + CI/CD | Free |

## Cloud Computing Concepts Demonstrated

1. **IaaS → PaaS → SaaS Model**: Render (PaaS), MongoDB Atlas (DBaaS)
2. **Elasticity**: Render auto-scales based on traffic
3. **Global Distribution**: Vercel's CDN delivers assets from nearest edge
4. **Managed Database**: MongoDB Atlas handles backups, patches, scaling
5. **CI/CD Pipeline**: Auto-deploy on every `git push` to main branch
6. **Environment Segregation**: `.env` variables separate dev from prod
7. **RESTful Microservices**: API server decoupled from frontend
8. **HTTPS/TLS**: All traffic encrypted end-to-end (auto by Vercel/Render)

## Data Flow

```
User Action → React Component
    → Axios HTTP Request
        → Render (Express Server)
            → Validation Middleware
                → Mongoose ODM
                    → MongoDB Atlas
                        ← JSON Response
                    ← JSON Response
                ← Express Response
            ← Axios Response
        ← State Update (useState)
    ← UI Re-render
```
