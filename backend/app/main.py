"""
main.py — FastAPI application entry point.

Mounts all routers and configures CORS for the frontend origin.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import entries, stats, auth
from app.routers import settings as settings_router

app = FastAPI(
    title="CheckIn API",
    description="Private family drinking check-in tracker — calm, non-judgmental, always honest.",
    version="1.0.0",
)

# Allow the frontend origin (and localhost variants during dev)
origins = [
    settings.frontend_url,
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(entries.router)
app.include_router(stats.router)
app.include_router(settings_router.router)


@app.get("/health", tags=["health"])
def health():
    return {"status": "ok"}
