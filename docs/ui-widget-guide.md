# UI Widget Guide — tradingagents_DD

## Panel Map

Every panel receives `currentRun` (full state object from `/api/run/{ticker}/{date}`).

---

## 📊 Analysts Panel

**Data source:** `currentRun.market_report`, `.sentiment_report`, `.news_report`, `.fundamentals_report`

**Layout:** 4 tabs (Market / Sentiment / News / Fundamentals). Active tab highlighted in cyan.

**Content type:** Long-form markdown. Agent reports are prose + bullet points.

**Interactions:**
- Click tab → switch active analyst
- Scroll within panel body (fixed height)

**Empty state:** "No analyst reports found." (if fields are absent from log)

---

## 🔍 Research Panel

**Data source:** `currentRun.investment_debate_state.bull_history`, `.bear_history`, `.judge_decision`

**Layout:** 3 tabs (Bull / Bear / Research Manager)

**Content type:** Debate reasoning chains. Bull/Bear show each side's argument. Manager tab shows synthesis.

**Interactions:** Same tab pattern as Analysts.

---

## 🎯 Trading Decision Panel

**Data source:** `currentRun.trader_investment_decision`

**Layout:** Action badge (BUY/SELL/HOLD) at top, markdown content below.

**Action detection:** Scan `currentRun.final_trade_decision` for keywords "buy" / "sell". Default: HOLD.

**Badge colors:**
- BUY → green (`--color-green`)
- SELL → red (`--color-red`)
- HOLD → amber (`--color-amber`)

---

## 🛡️ Risk Management Panel

**Data source:** `currentRun.risk_debate_state.*_history` (aggressive, conservative, neutral) + `.judge_decision`

**Layout:** Up to 4 tabs (3 risk profiles + Risk Manager decision)

**Content type:** Risk analysis prose, typically shorter than analyst reports.

---

## 📋 Portfolio Manager Panel

**Data source:** `currentRun.investment_plan` (preferred) or `currentRun.final_trade_decision`

**Layout:** Full-width panel. Markdown content. Highlighted header.

**Note:** This panel may show the same content as Trading Decision in some runs. Show both for transparency.

---

## 📈 Backtest Chart Panel

**Data source:** Trade execution records (not always present in current JSON schema)

**Layout:** TradingView Lightweight Charts candlestick series. Full-width, 12-column.

**Placeholder:** If no backtest data: "No backtest data available. Run a backtest to see the equity curve."

**Future (Phase 5):** ECharts for fundamentals bar charts + pie charts.

---

## Run Selector (Header Component)

**Data source:** `GET /api/runs` (list all runs)

**Layout:** Ticker dropdown + Date dropdown + "Load" button.

**Behavior:**
- On ticker change → date dropdown re-populates with runs for that ticker
- On load → fetch `GET /api/run/{ticker}/{date}` → set `currentRun` state
- All 6 panels re-render with new data

**Live indicator:** SSE `run` event → if new run matches selected ticker, show "New run available" badge.