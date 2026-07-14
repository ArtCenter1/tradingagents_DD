"""
API routes — REST + SSE endpoints for TradingAgents data.
"""

import json
import asyncio
import sys
from pathlib import Path
from typing import Optional

sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent / "shared"))
from log_reader import list_runs, list_tickers, load_run, get_results_dir

from fastapi import APIRouter, HTTPException, Query
from sse_starlette.sse import EventSourceResponse

router = APIRouter()


@router.get("/runs")
def get_runs(ticker: Optional[str] = Query(None)):
    """List all available runs, optionally filtered by ticker."""
    return list_runs(ticker=ticker)


@router.get("/run/{ticker}/{date}")
def get_run(ticker: str, date: str):
    """Load a single run's full state JSON."""
    try:
        return load_run(ticker, date)
    except FileNotFoundError:
        raise HTTPException(
            status_code=404,
            detail=f"Run not found: {ticker} / {date}",
        )


@router.get("/tickers")
def get_tickers():
    """List all ticker symbols with at least one run."""
    return list_tickers()


@router.get("/ws/runs")
async def sse_runs():
    """Server-Sent Events stream — emits 'run' events when new runs are detected."""

    async def run_stream():
        seen = set()
        while True:
            try:
                for run_obj in list_runs():
                    if run_obj["path"] not in seen:
                        seen.add(run_obj["path"])
                        yield {"event": "run", "data": json.dumps(run_obj)}
            except Exception:
                pass  # keep stream alive even if read fails
            await asyncio.sleep(5)

    return EventSourceResponse(run_stream())
