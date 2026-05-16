┌─────────────────────────────────────────────────────┐
│                   Next.js Frontend                   │
│         (App Router, TypeScript, Tailwind)           │
│                                                      │
│  Public     Auth      User          Admin            │
│  /          /login    /dashboard    /admin           │
│  /register  /register /applications /admin/users    │
│                       /applications/new             │
│                       /resume                       │
│                       /analytics                    │
└──────────────────────┬──────────────────────────────┘
                       │ HTTP (fetch, JWT in header)
                       ▼
┌─────────────────────────────────────────────────────┐
│                  FastAPI Backend                     │
│                                                      │
│  /auth          /users         /applications        │
│  /resume        /ai            /admin               │
│  /analytics                                         │
│                                                      │
│  Middleware: JWT auth, CORS, request logging        │
│  Background Tasks: AI processing queue              │
└──────────┬──────────────────────┬───────────────────┘
           │                      │
           ▼                      ▼
┌──────────────────┐   ┌─────────────────────────────┐
│   PostgreSQL     │   │        Groq API              │
│                  │   │   llama-3.3-70b-versatile    │
│  users           │   │                             │
│  applications    │   │  - JD Analysis              │
│  resumes         │   │  - Resume Scoring           │
│  ai_results      │   │  - Cover Letter Gen         │
│  admin_logs      │   │  - Skill Gap Analysis       │
└──────────────────┘   └─────────────────────────────┘