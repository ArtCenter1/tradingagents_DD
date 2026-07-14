"""
Smoke tests — run against live servers on :5000 (Flask) and :8000 (FastAPI).

Requires NO third-party packages — uses stdlib urllib only.
Run with: python3 -m pytest tests/smoke_test.py -v
"""

import json
import urllib.request
import urllib.error
import os
import sys

# Use the sample JSON directly as test fixture — no network needed for validation
SAMPLE_PATH = os.path.join(os.path.dirname(__file__), "..", "results", "AAPL",
                           "TradingAgentsStrategy_logs", "full_states_log_2024-05-01.json")

FLASK_URL = "http://localhost:5000"
FASTAPI_URL = "http://localhost:8000"

os.chdir(os.path.join(os.path.dirname(__file__), ".."))


def http_get(url: str) -> tuple[int, str]:
    """Return (status_code, body) — raises on network error."""
    req = urllib.request.Request(url, headers={"Accept": "application/json"})
    with urllib.request.urlopen(req, timeout=10) as resp:
        return resp.status, resp.read().decode("utf-8")


def assert_status(body: str, expected_fields: list[str]):
    """Assert all expected JSON fields exist in body."""
    data = json.loads(body)
    for field in expected_fields:
        assert field in data, f"Missing field: {field}"
    return data


# ──────────────────────────────────────────────────────────
# Phase 1 — Flask smoke tests
# ──────────────────────────────────────────────────────────

def test_flask_index_returns_html():
    status, body = http_get(f"{FLASK_URL}/")
    assert status == 200, f"Expected 200, got {status}"
    assert "TradingAgents_DD" in body
    assert "AAPL" in body


def test_flask_run_detail_shows_analyst_team():
    status, body = http_get(f"{FLASK_URL}/run/AAPL/2024-05-01")
    assert status == 200, f"Expected 200, got {status}"
    assert "Analyst Team" in body
    assert "Market Analysis" in body
    assert "Trading Plan" in body        # trader_investment_decision renders here


def test_flask_404_on_missing_run():
    try:
        status, _ = http_get(f"{FLASK_URL}/run/AAPL/9999-01-01")
        assert status == 404, f"Expected 404, got {status}"
    except urllib.error.HTTPError as e:
        assert e.code == 404, f"Expected 404, got {e.code}"


# ──────────────────────────────────────────────────────────
# Phase 2 — FastAPI smoke tests
# ──────────────────────────────────────────────────────────

def test_fastapi_tickers_returns_list():
    status, body = http_get(f"{FASTAPI_URL}/api/tickers")
    assert status == 200
    data = json.loads(body)
    assert isinstance(data, list)
    assert "AAPL" in data


def test_fastapi_runs_returns_list():
    status, body = http_get(f"{FASTAPI_URL}/api/runs")
    assert status == 200
    data = json.loads(body)
    assert isinstance(data, list)
    assert len(data) > 0
    run = data[0]
    assert "ticker" in run and "date" in run and "path" in run


def test_fastapi_run_detail_returns_full_state():
    status, body = http_get(f"{FASTAPI_URL}/api/run/AAPL/2024-05-01")
    assert status == 200
    data = json.loads(body)

    # Schema fields that MUST be present per run-report-schema.md
    required = [
        "company_of_interest",
        "market_report",
        "sentiment_report",
        "news_report",
        "fundamentals_report",
        "investment_debate_state",
        "trader_investment_decision",   # ← NOTE: NOT trader_investment_plan
        "risk_debate_state",
        "investment_plan",
        "final_trade_decision",
    ]
    for f in required:
        assert f in data, f"Missing upstream field: {f}"


def test_fastapi_run_404_on_missing_ticker():
    try:
        http_get(f"{FASTAPI_URL}/api/run/BOGUS/9999-01-01")
        assert False, "Expected HTTPError 404"
    except urllib.error.HTTPError as e:
        assert e.code == 404
        body = e.read().decode()
        data = json.loads(body)
        assert "detail" in data


def test_fastapi_docs_returns_html():
    status, body = http_get(f"{FASTAPI_URL}/docs")
    assert status == 200
    assert "Swagger" in body or "swagger" in body.lower()


# ──────────────────────────────────────────────────────────
# Shared log_reader unit tests
# ──────────────────────────────────────────────────────────

def test_log_reader_schema_matches_upstream():
    """Verify our sample data uses the correct upstream field names."""
    assert os.path.exists(SAMPLE_PATH), f"Sample not found: {SAMPLE_PATH}"
    with open(SAMPLE_PATH, encoding="utf-8") as f:
        data = json.load(f)

    # Critical fix: upstream uses trader_investment_decision, NOT trader_investment_plan
    assert "trader_investment_decision" in data, (
        "Sample data uses wrong field name — must be 'trader_investment_decision'"
    )
    assert "trader_investment_plan" not in data, (
        "Sample data must not contain the old 'trader_investment_plan' field"
    )

    # Verify all debate sub-fields match upstream _log_state()
    debate = data["investment_debate_state"]
    for field in ["bull_history", "bear_history", "history",
                  "current_response", "judge_decision"]:
        assert field in debate, f"Missing investment_debate_state.{field}"

    risk = data["risk_debate_state"]
    for field in ["aggressive_history", "conservative_history", "neutral_history",
                  "history", "judge_decision"]:
        assert field in risk, f"Missing risk_debate_state.{field}"

    # Neutral history is valid (upstream does include it)
    assert isinstance(risk["neutral_history"], str)


def test_no_empty_ticker_dirs_in_list_tickers():
    """Ensure list_tickers() doesn't return tickers with no actual JSON files."""
    import sys
    sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "shared"))
    from log_reader import list_tickers, list_runs

    tickers = list_tickers()
    for t in tickers:
        runs = list_runs(ticker=t)
        assert len(runs) > 0, f"Ticker '{t}' has no runs but still appears in list"


# ──────────────────────────────────────────────────────────
# Trading Decision badge logic test
# ──────────────────────────────────────────────────────────

def test_trading_decision_action_detection():
    """Reproduce the action detection logic from TradingDecisionPanel.jsx."""

    def detect_action(text: str) -> str:
        if not text:
            return "HOLD"
        t = text.lower()
        if "buy" in t:
            return "BUY"
        if "sell" in t:
            return "SELL"
        return "HOLD"

    status, body = http_get(f"{FASTAPI_URL}/api/run/AAPL/2024-05-01")
    data = json.loads(body)
    decision = data.get("final_trade_decision", "")

    action = detect_action(decision)
    assert action in ("BUY", "SELL", "HOLD"), f"Invalid action: {action}"

    # Our mock data says HOLD
    assert action == "HOLD", f"Expected HOLD for mock data, got {action}"


if __name__ == "__main__":
    # Run with python3 directly (no pytest needed for quick check)
    failures = []
    tests = [
        ("Flask index", test_flask_index_returns_html),
        ("Flask run detail", test_flask_run_detail_shows_analyst_team),
        ("Flask 404", test_flask_404_on_missing_run),
        ("FastAPI tickers", test_fastapi_tickers_returns_list),
        ("FastAPI runs", test_fastapi_runs_returns_list),
        ("FastAPI run detail", test_fastapi_run_detail_returns_full_state),
        ("FastAPI 404", test_fastapi_run_404_on_missing_ticker),
        ("FastAPI docs", test_fastapi_docs_returns_html),
        ("Schema match upstream", test_log_reader_schema_matches_upstream),
        ("No empty ticker dirs", test_no_empty_ticker_dirs_in_list_tickers),
        ("Trading action detection", test_trading_decision_action_detection),
    ]

    for name, fn in tests:
        try:
            fn()
            print(f"  ✅ {name}")
        except Exception as e:
            print(f"  ❌ {name}: {e}")
            failures.append(name)

    print()
    if failures:
        print(f"FAILED: {len(failures)}/{len(tests)}")
        for f in failures:
            print(f"  - {f}")
        sys.exit(1)
    else:
        print(f"ALL PASSED: {len(tests)}/{len(tests)}")