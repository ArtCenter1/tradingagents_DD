"""
Shared log reader — imports from both phase1/ and backend/.
Reads TradingAgents JSON state logs from the results directory.

Usage:
    from shared.log_reader import list_runs, load_run
    runs = list_runs()
    state = load_run("AAPL", "2025-07-13")
"""

from pathlib import Path
from typing import List, Optional, Dict, Any
import json
import re
import os

# Default: sibling directory to this project root
DEFAULT_RESULTS_DIR = Path(__file__).resolve().parents[1] / "results"


def get_results_dir() -> Path:
    """Return RESULTS_DIR from env var or default sibling path."""
    env_path = os.environ.get("RESULTS_DIR", "")
    if env_path:
        return Path(env_path)
    return DEFAULT_RESULTS_DIR


def list_runs(ticker: Optional[str] = None) -> List[Dict[str, str]]:
    """
    List all available runs, optionally filtered by ticker.

    Returns:
        List of {"ticker": str, "date": str, "path": str}
        Sorted newest-first.
    """
    results_dir = get_results_dir()
    if not results_dir.exists():
        return []

    runs = []
    tickers_to_search = [results_dir / ticker] if ticker else results_dir.iterdir()

    for tdir in tickers_to_search:
        if not tdir.exists() or not tdir.is_dir():
            continue
        log_dir = tdir / "TradingAgentsStrategy_logs"
        if not log_dir.exists():
            continue
        for f in log_dir.glob("full_states_log_*.json"):
            m = re.search(r"(\d{4}-\d{2}-\d{2})", f.name)
            if m:
                runs.append({
                    "ticker": tdir.name,
                    "date": m.group(1),
                    "path": str(f),
                })

    runs.sort(key=lambda r: (r["ticker"], r["date"]), reverse=True)
    return runs


def load_run(ticker: str, date: str) -> Dict[str, Any]:
    """
    Load one run's full state JSON.

    Args:
        ticker: Stock ticker symbol (e.g. "AAPL")
        date: Date string in YYYY-MM-DD format

    Returns:
        Full state dict with all agent reports and decisions

    Raises:
        FileNotFoundError: If the run log file does not exist
    """
    results_dir = get_results_dir()
    path = results_dir / ticker / "TradingAgentsStrategy_logs" / f"full_states_log_{date}.json"
    if not path.exists():
        raise FileNotFoundError(f"Run not found: {ticker} / {date}")
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def list_tickers() -> List[str]:
    """Return all unique ticker symbols with at least one run."""
    results_dir = get_results_dir()
    if not results_dir.exists():
        return []
    return sorted([
        d.name for d in results_dir.iterdir()
        if d.is_dir() and (d / "TradingAgentsStrategy_logs").exists()
    ])


def list_runs_for_ticker(ticker: str) -> List[Dict[str, str]]:
    """Convenience: all runs for one ticker, newest first."""
    return list_runs(ticker=ticker)