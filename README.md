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

**`backend/.env`**

```
PORT=5000
DATABASE_URL=        # Get from Supabase project → Settings → Database → Connection string
JWT_SECRET=          # Any long random string
JWT_EXPIRES_IN=7d
```

**`frontend/.env`**

```
VITE_API_URL=http://localhost:5000
```

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
