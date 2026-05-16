backend/
├── app/
│   ├── main.py
│   ├── core/
│   │   ├── config.py
│   │   ├── security.py
│   │   └── database.py
│   ├── models/
│   │   ├── user.py
│   │   ├── resume.py
│   │   ├── application.py
│   │   ├── ai_result.py
│   │   └── admin_log.py
│   ├── schemas/
│   │   ├── auth.py
│   │   ├── resume.py
│   │   ├── application.py
│   │   ├── ai_result.py
│   │   └── admin.py
│   ├── routers/
│   │   ├── auth.py
│   │   ├── resume.py
│   │   ├── applications.py
│   │   ├── ai.py
│   │   ├── analytics.py
│   │   └── admin.py
│   ├── services/
│   │   ├── ai_service.py      ← all Groq logic here
│   │   ├── resume_service.py  ← PDF text extraction
│   │   └── admin_service.py
│   ├── dependencies.py
│   └── middleware.py
├── alembic/
├── uploads/
├── .env
└── requirements.txt