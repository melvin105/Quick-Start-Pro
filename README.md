# Quick Start Pro

Driving school management system for **Quick Start Driving School, Ayeduase Gate, Kumasi**.
Built by **Team Xenon — COE 454, KNUST**.

---

## What it does

Quick Start Pro replaces the school's paper-based process with a single system that handles student registration, lesson scheduling, attendance tracking, payments, licence pipeline management, and management reporting — with role-based access for the Manager and Secretary.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS |
| Backend | Node.js, Express.js, TypeScript |
| Database | PostgreSQL (hosted on Supabase) |
| Auth | JWT + bcrypt, Role-Based Access Control |

---

## Prerequisites

- Node.js **v20 or higher**
- npm

---

## Local Setup

### 1. Clone the repo

```bash
git clone https://github.com/melvin105/Quick-Start-Pro.git
cd Quick-Start-Pro
```

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Runs at `http://localhost:5173`

### 3. Backend

```bash
cd backend
npm install
cp .env.example .env
# Fill in your .env values (see below)
npm run dev
```

Runs at `http://localhost:5000`

Health check: `GET http://localhost:5000/api/health` → `{ "status": "ok" }`

### 4. Environment variables

See `backend/.env.example` and `frontend/.env.example` for the full, documented list — copy each to `.env` (backend) / `.env` or `.env.local` (frontend) and fill in the values. At minimum, the backend needs `DATABASE_URL`, `JWT_SECRET` (32+ chars), and `PUBLIC_FLOW_SECRET`; the frontend needs `VITE_API_URL` pointing at the backend **including the `/api/v1` prefix** (e.g. `http://localhost:5000/api/v1` locally).

---

## Deployment (testing)

**Frontend → Vercel.** Import the repo, set the project's **Root Directory to `frontend`** (Vercel doesn't auto-detect the subfolder in this monorepo layout). Build command and output directory are auto-detected from `package.json` (`npm run build` → `dist`); `frontend/vercel.json` handles the SPA rewrite so client-side routes don't 404 on refresh. Set one environment variable in the Vercel project settings:

```
VITE_API_URL=https://<your-backend-host>/api/v1
```

**Backend → not Vercel.** The API is a persistent Express server with an open Postgres pool — it needs a host built for long-running Node processes (Render, Railway, Fly.io all work and have free tiers), not Vercel's serverless model. Deploy `backend/` with build command `npm run build` and start command `npm start`, and set the env vars from `backend/.env.example` in that host's dashboard — most importantly `DATABASE_URL`, `JWT_SECRET`, `PUBLIC_FLOW_SECRET`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and **`CORS_ORIGINS`** (comma-separated, set to your Vercel URL once you have it — without it the API reflects all origins, which is fine for testing but must be locked down before anything real goes through it).

---

## Branch & Contribution Workflow

We use a **feature branch workflow**. No one pushes directly to `main` or `develop`.

```
main        ← production-ready releases only
develop     ← integration branch; all features merge here first
feature/*   ← your working branch
```

### Step-by-step for every piece of work

```bash
# 1. Start from an up-to-date develop
git checkout develop
git pull origin develop

# 2. Create a branch named after the module you're working on
git checkout -b feature/auth
# or: feature/student-registration, feature/payments, feature/attendance, etc.

# 3. Work, commit often
git add .
git commit -m "feat: add POST /api/auth/login endpoint"

# 4. Push your branch
git push origin feature/auth

# 5. Open a Pull Request on GitHub: feature/auth → develop
#    Get at least one teammate to review before merging
```

### Commit message format

```
feat: short description      ← new feature
fix: short description       ← bug fix
chore: short description     ← config, tooling, deps
docs: short description      ← documentation only
```

---

## Project Structure

```
Quick-Start-Pro/
├── frontend/          # React + Vite app
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   └── lib/
│   └── .env.example
├── backend/           # Express + TypeScript API
│   ├── src/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   └── index.ts
│   └── .env.example
└── README.md
```

---

## Team — Team Xenon

| Name | Role |
|---|---|
| Adwoa Animah Odame | Project Manager |
| Ibrahim Salma Niina | Business Analyst / Client Liaison |
| Yawlui Melvin Kwaku | UX / Design Lead |
| Adjapong Clement | Frontend Engineer |
| Asuako Reginald | Backend Engineer |
| Mawulikplim Komla Kutani | Backend Engineer |
| Aidoo Edward Wiafe | QA / Documentation Lead |

---

> COE 454 — Software Engineering Project · KNUST · 2026
