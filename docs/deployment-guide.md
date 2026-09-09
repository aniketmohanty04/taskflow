# Deployment Guide — TaskFlow

## Step-by-Step Cloud Deployment

---

## Step 1: Setup MongoDB Atlas (Cloud Database)

1. Visit [https://www.mongodb.com/atlas](https://www.mongodb.com/atlas)
2. **Sign Up** with Google or email (free)
3. Click **"Build a Database"** → Choose **M0 Free Tier** (512MB)
4. Select **Cloud Provider: AWS** → **Region: Mumbai (ap-south-1)**
5. Name your cluster: `taskflow-cluster`
6. Click **"Create Cluster"** (takes ~2 mins)

### Create Database User:
- Go to **Database Access** → **Add New Database User**
- Username: `taskflow_user`
- Password: (auto-generate a strong password — **save this!**)
- Role: **Read and Write to Any Database**
- Click **Add User**

### Whitelist IP:
- Go to **Network Access** → **Add IP Address**
- Click **"Allow Access from Anywhere"** (0.0.0.0/0)
- Click **Confirm**

### Get Connection String:
- Go to **Database** → **Connect** → **Drivers**
- Copy: `mongodb+srv://taskflow_user:<password>@taskflow-cluster.xxxxx.mongodb.net/taskflowdb?retryWrites=true&w=majority`
- Replace `<password>` with your actual password

---

## Step 2: Push Code to GitHub

```bash
# In the project root folder (sfdgfh/)
git init
git add .
git commit -m "feat: TaskFlow cloud-based task management system"

# Create a new repo on github.com, then:
git remote add origin https://github.com/YOUR_USERNAME/taskflow.git
git branch -M main
git push -u origin main
```

---

## Step 3: Deploy Backend on Render.com

1. Visit [https://render.com](https://render.com) → **Sign Up with GitHub**
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `taskflow-backend`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
5. Under **Environment Variables**, add:
   ```
   MONGODB_URI = mongodb+srv://...  (your Atlas URI)
   NODE_ENV    = production
   PORT        = 5000
   ```
6. Click **"Create Web Service"**
7. Wait for deployment (2-3 mins)
8. Note your backend URL: `https://taskflow-backend-xxxx.onrender.com`

### Test Backend:
```
https://taskflow-backend-xxxx.onrender.com/api/health
```
Should return: `{ "success": true, "status": "healthy", "database": "connected" }`

---

## Step 4: Deploy Frontend on Vercel

1. Visit [https://vercel.com](https://vercel.com) → **Sign Up with GitHub**
2. Click **"New Project"** → Import your GitHub repo
3. Configure:
   - **Framework Preset**: Create React App
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
4. Under **Environment Variables**, add:
   ```
   REACT_APP_API_URL = https://taskflow-backend-xxxx.onrender.com/api
   ```
5. Click **"Deploy"**
6. Wait for build (1-2 mins)
7. Note your frontend URL: `https://taskflow.vercel.app`

---

## Step 5: Update Backend CORS

Go back to Render → Environment Variables → Add:
```
FRONTEND_URL = https://taskflow.vercel.app
```
Click **"Save Changes"** — Render will auto-redeploy.

---

## Step 6: Verify Full Deployment

Open `https://taskflow.vercel.app` in browser and:
- ✅ App loads with the dashboard
- ✅ Create a task → appears in board
- ✅ Edit a task → changes saved
- ✅ Change status → updates instantly
- ✅ Delete a task → removed from list
- ✅ Stats dashboard shows correct numbers

---

## Deployed URLs

| Service   | URL |
|-----------|-----|
| Frontend  | https://taskflow.vercel.app |
| Backend   | https://taskflow-backend-xxxx.onrender.com |
| API Base  | https://taskflow-backend-xxxx.onrender.com/api |
| DB (Atlas)| MongoDB Atlas Dashboard |

---

## Auto-Deployment (CI/CD)

Once deployed, every `git push` to the `main` branch will:
- **Vercel** → Auto-rebuild and redeploy frontend in ~1 minute
- **Render** → Auto-rebuild and redeploy backend in ~2 minutes

This demonstrates **CI/CD in the cloud** — a key cloud computing concept.
