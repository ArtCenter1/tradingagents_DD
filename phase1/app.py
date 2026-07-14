"""
Phase 1 — Flask Instant MVP
python app.py → http://localhost:5000

Zero build step. Shows run selector + analyst reports + trading decision.
"""

import os
import sys
from pathlib import Path

# Add shared/ to path for log_reader
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "shared"))
from log_reader import list_runs, list_tickers, load_run, get_results_dir

from flask import (
    Flask,
    render_template,
    redirect,
    url_for,
    request,
    abort,
)

app = Flask(__name__, template_folder="templates")

# Allow overriding RESULTS_DIR from environment
RESULTS_DIR = os.environ.get("RESULTS_DIR", "")


def _tickers():
    return list_tickers()


def _runs(ticker=None):
    return list_runs(ticker=ticker)


@app.route("/")
def index():
    """Run selector — shows all tickers with run counts."""
    tickers = _tickers()
    runs_by_ticker = {}
    for t in tickers:
        runs_by_ticker[t] = list_runs(ticker=t)

    if not tickers:
        return render_template("empty.html", results_dir=str(get_results_dir()))

    # Default to first ticker if only one
    default_ticker = tickers[0] if len(tickers) == 1 else None
    return render_template(
        "run_list.html",
        tickers=tickers,
        runs_by_ticker=runs_by_ticker,
        default_ticker=default_ticker,
    )


@app.route("/run/<ticker>/<date>")
def run_detail(ticker: str, date: str):
    """Render a single run's dashboard."""
    try:
        state = load_run(ticker, date)
    except FileNotFoundError:
        abort(404, description=f"Run not found: {ticker} / {date}")

    # Build analyst tabs
    analysts = []
    if state.get("market_report"):
        analysts.append(("Market", state["market_report"]))
    if state.get("sentiment_report"):
        analysts.append(("Sentiment", state["sentiment_report"]))
    if state.get("news_report"):
        analysts.append(("News", state["news_report"]))
    if state.get("fundamentals_report"):
        analysts.append(("Fundamentals", state["fundamentals_report"]))

    # Research debate
    debate = state.get("investment_debate_state", {})
    research_tabs = []
    if debate.get("bull_history"):
        research_tabs.append(("Bull", debate["bull_history"]))
    if debate.get("bear_history"):
        research_tabs.append(("Bear", debate["bear_history"]))
    if debate.get("judge_decision"):
        research_tabs.append(("Research Manager", debate["judge_decision"]))

    # Risk debate
    risk = state.get("risk_debate_state", {})
    risk_tabs = []
    if risk.get("aggressive_history"):
        risk_tabs.append(("Aggressive", risk["aggressive_history"]))
    if risk.get("conservative_history"):
        risk_tabs.append(("Conservative", risk["conservative_history"]))
    if risk.get("neutral_history"):
        risk_tabs.append(("Neutral", risk["neutral_history"]))
    if risk.get("judge_decision"):
        risk_tabs.append(("Risk Manager", risk["judge_decision"]))

    # Portfolio / final decision
    final_decision = state.get("final_trade_decision", "")
    trader_plan = state.get("trader_investment_plan", "")
    investment_plan = state.get("investment_plan", "")

    # Determine action badge
    action = "HOLD"
    action_class = "badge-hold"
    text_lower = final_decision.lower()
    if "buy" in text_lower:
        action = "BUY"
        action_class = "badge-buy"
    elif "sell" in text_lower:
        action = "SELL"
        action_class = "badge-sell"

    return render_template(
        "dashboard.html",
        ticker=ticker,
        date=date,
        state=state,
        company=state.get("company_of_interest", ticker),
        analysts=analysts,
        research_tabs=research_tabs,
        risk_tabs=risk_tabs,
        trader_plan=trader_plan,
        final_decision=final_decision,
        investment_plan=investment_plan,
        action=action,
        action_class=action_class,
    )


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    debug = os.environ.get("FLASK_DEBUG", "false").lower() == "true"
    print(f"→ http://localhost:{port}")
    print(f"  RESULTS_DIR: {get_results_dir()}")
    app.run(host="0.0.0.0", port=port, debug=debug)