from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from app.middleware import log_requests
from app.routers import auth, resume, applications, ai, analytics, admin

import subprocess
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Run migrations on startup
    subprocess.run(["alembic", "upgrade", "head"], check=True)
    yield

app = FastAPI(title="AI Job Tracker API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://your-app.vercel.app",   # add after Vercel deploy
        "https://*.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(BaseHTTPMiddleware, dispatch=log_requests)

app.include_router(auth.router)
app.include_router(resume.router)
app.include_router(applications.router)
app.include_router(ai.router)
app.include_router(analytics.router)
app.include_router(admin.router)


@app.get("/health")
async def health():
    return {"status": "ok", "version": "1.0.0"}