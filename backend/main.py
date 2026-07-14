"""
tradingagents_DD — FastAPI Backend
uvicorn backend.main:app --reload --port 8000
"""

import sys
from pathlib import Path

# Add shared/ to path for log_reader
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "shared"))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from backend.api.routes import router


def create_app() -> FastAPI:
    app = FastAPI(
        title="tradingagents_DD API",
        version="2.0.0",
        description="FastAPI backend for TradingAgents drag-and-drop dashboard",
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(router, prefix="/api")

    # Mount React static build only if dist exists
    dist_path = Path(__file__).resolve().parent.parent / "frontend" / "dist"
    if dist_path.exists():
        app.mount("/", StaticFiles(directory=str(dist_path), html=True), name="static")

    return app


app = create_app()


if __name__ == "__main__":
    import uvicorn

    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    print(f"-> http://localhost:{port}")
    print(f"   API docs: http://localhost:{port}/docs")
    uvicorn.run("backend.main:app", host="0.0.0.0", port=port, reload=False)
