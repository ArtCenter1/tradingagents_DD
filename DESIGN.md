---
title: Design Tokens — tradingagents_DD
version: alpha
name: tradingagents_DD
description: Dark trading dashboard. Cyan accent, JetBrains Mono, financial data panels.
---

## Overview

TradingView-inspired dark dashboard for TradingAgents output. Cyan accent communicates tech/intelligence; deep slate backgrounds provide contrast for financial data; monospace font ensures alignment in agent reasoning chains and numeric data.

## Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-bg` | `#0f1117` | Page background |
| `--color-surface` | `#1a1d27` | Panel backgrounds |
| `--color-border` | `#2d3142` | Panel / section borders |
| `--color-accent` | `#22d3ee` | Primary accent (cyan) — drag handles, active tabs, links |
| `--color-green` | `#34d399` | Bullish / positive / BUY actions |
| `--color-red` | `#f87171` | Bearish / negative / SELL actions |
| `--color-amber` | `#fbbf24` | Warnings / HOLD actions |
| `--color-text` | `#e2e8f0` | Primary text |
| `--color-text-muted` | `#94a3b8` | Secondary text, labels |
| `--color-text-dim` | `#475569` | Tertiary text, annotations |

## Typography

| Token | Value |
|-------|-------|
| `font-mono` | `'JetBrains Mono', 'Fira Code', monospace` |
| `font-ui` | `'Inter', system-ui, sans-serif` |
| `--text-xs` | 11px |
| `--text-sm` | 13px |
| `--text-base` | 15px |
| `--text-lg` | 18px |

## Spacing & Radius

| Token | Value |
|-------|-------|
| `--panel-radius` | 8px |
| `--panel-header-h` | 36px |
| `--gap-sm` | 8px |
| `--gap-md` | 16px |
| `--gap-lg` | 24px |

## Components

### Panel

```css
.panel {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--panel-radius);
  overflow: hidden;
  height: 100%;
  display: flex;
  flex-direction: column;
}
```

### Panel Header (Drag Handle)

```css
.panel-header {
  background: rgba(255,255,255,0.03);
  border-bottom: 1px solid var(--color-border);
  height: var(--panel-header-h);
  padding: 0 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--color-text-muted);
  font-size: var(--text-sm);
  font-weight: 600;
  cursor: grab;
}
.panel-header:active { cursor: grabbing; }
.grip-icon { color: var(--color-text-muted); opacity: 0.5; }
.panel-header:hover .grip-icon { opacity: 1; }
```

### Action Badge

```css
.badge-buy   { background: rgba(52,211,153,0.15); color: var(--color-green); border: 1px solid var(--color-green); }
.badge-sell  { background: rgba(248,113,113,0.15); color: var(--color-red);   border: 1px solid var(--color-red); }
.badge-hold  { background: rgba(251,191,36,0.15);  color: var(--color-amber); border: 1px solid var(--color-amber); }
```

## Do's and Don'ts

- **DO** use `--color-accent` (cyan) for interactive elements and active states only
- **DO** use monospace font (`JetBrains Mono`) for all agent report content and numbers
- **DO** use `--color-green/red` only for BUY/SELL/HOLD indicators
- **DON'T** use cyan for decorative purposes — it signals interactivity
- **DON'T** use white (`#ffffff`) for text — use `--color-text` (`#e2e8f0`)