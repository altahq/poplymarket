import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "./supabase";

// ─── GOOGLE FONT ────────────────────────────────────────────────────────────────
const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href =
  "https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap";
document.head.appendChild(fontLink);

// ─── CONFIG ─────────────────────────────────────────────────────────────────────
const ADMINS = ["Stav Levi", "Stav", "Tom Hoffen"];
const SEED = 100;
const INITIAL_TOKENS = 1000;
const ALLOWED_DOMAIN = "altahq.com";

function extractName(email) {
  const local = email.split("@")[0];
  return local
    .split(/[._-]/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

function isValidEmail(email) {
  return (
    email &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
    email.trim().toLowerCase().endsWith(`@${ALLOWED_DOMAIN}`)
  );
}

// ─── MARKETS ────────────────────────────────────────────────────────────────────
const MARKETS = [
  // Sales + Strategic
  { id: "s1", dept: "Sales", emoji: "💰", label: "$800K Closed Amount", description: "$800K total closed — EMEA +$250K, US +$450K" },
  { id: "s2", dept: "Sales", emoji: "🤝", label: "53 New Clients", description: "53 new clients signed by end of March" },
  { id: "s3", dept: "Sales", emoji: "📊", label: "30% Deal-to-Close Rate", description: "March cohort hits 30% deal-to-close" },
  { id: "s4", dept: "Sales", emoji: "🌍", label: "2 Strategic Logos", description: "2 known worldwide logos signed (Strategic)" },
  { id: "s5", dept: "Sales", emoji: "☎️", label: "Hebrew Call Center", description: "Hebrew Call Center strategic deal closes" },
  { id: "s6", dept: "Sales", emoji: "🎯", label: "$100K ARR Strategic", description: "$100K ARR from strategic accounts" },
  // Marketing
  { id: "m1", dept: "Marketing", emoji: "📣", label: "1,100 MQAs by EOM", description: "Marketing Qualified Accounts hit 1,100 by end of March" },
  { id: "m2", dept: "Marketing", emoji: "📅", label: "466 Booked Meetings", description: "466 booked meetings achieved by EOM" },
  { id: "m3", dept: "Marketing", emoji: "📰", label: "5 PR Articles by EOM", description: "5 PR articles published by end of March" },
  { id: "m4", dept: "Marketing", emoji: "🎬", label: "Brand Video", description: "Brand video completed and launched" },
  { id: "m5", dept: "Marketing", emoji: "💬", label: "New Messaging Everywhere", description: "New messaging presence everywhere!" },
  // CX
  { id: "c1", dept: "CX", emoji: "🛡️", label: "Less Than 7 Churns", description: "Churn stays below 7 customers in March" },
  { id: "c2", dept: "CX", emoji: "⚡", label: "<20 Min Response Time", description: "Median response time under 20 minutes" },
  { id: "c3", dept: "CX", emoji: "👥", label: "Hire & Ramp 2 Reps", description: "Hiring and ramping 2 CX reps" },
  { id: "c4", dept: "CX", emoji: "🎓", label: "Katie Academy Launched", description: '"Katie Academy" — CS onboarding project goes live' },
  { id: "c5", dept: "CX", emoji: "🎤", label: "CX Webinar", description: "CX Webinar hosted and delivered" },
  // Operations & Bizops
  { id: "o1", dept: "Operations", emoji: "👥", label: "Key Hires Done", description: "Hiring: People Ops, CS US & IL, Sales IL" },
  { id: "o2", dept: "Operations", emoji: "💳", label: "100% March Collections", description: "100% collection from March customers" },
  { id: "o3", dept: "Operations", emoji: "📋", label: "Regulation Project", description: "Regulation project completed" },
  { id: "o4", dept: "Operations", emoji: "🏢", label: "New Office Secured", description: "New office / extra space confirmed" },
  { id: "o5", dept: "Operations", emoji: "📑", label: "DD for New Investors", description: "Due diligence for new investors completed" },
  { id: "o6", dept: "Operations", emoji: "💻", label: "20% Software Cost Cut", description: "Software costs reduced by 20%" },
  // Builders
  { id: "b1", dept: "Builders", emoji: "🏗️", label: "Alta 2.0 Chat Live", description: "Alta 2.0 chat — Advise & Build shipped" },
  { id: "b2", dept: "Builders", emoji: "⚙️", label: "Trigger-Based Actions", description: "Trigger based action system complete" },
  { id: "b3", dept: "Builders", emoji: "👤", label: "Audience — Lista", description: "Audience — Lista, preview and filter shipped" },
  { id: "b4", dept: "Builders", emoji: "📥", label: "Inbound Flow", description: "Inbound flow system shipped" },
  { id: "b5", dept: "Builders", emoji: "🌱", label: "Katie the Gardener", description: "Katie the Gardener feature shipped" },
  { id: "b6", dept: "Builders", emoji: "🔗", label: "LinkedIn Comment+InMail", description: "LinkedIn actions — comment + inmail shipped" },
  { id: "b7", dept: "Builders", emoji: "🐦", label: "Twitter / Dialer Node", description: "Twitter / Dialer node shipped" },
  // AI Engineers
  { id: "a1", dept: "AI Engineers", emoji: "🤖", label: "Vetric: 40% Call Coverage", description: "Vetric replacement handles 40% of calls" },
  { id: "a2", dept: "AI Engineers", emoji: "📆", label: "Alta Calendar: 5 Customers", description: "Alta calendar adopted by 5 customers" },
  { id: "a3", dept: "AI Engineers", emoji: "🎙️", label: "Alta Recorder Used by Alta", description: "Alta recorder used internally by Alta" },
  { id: "a4", dept: "AI Engineers", emoji: "❓", label: "Ask-Alta in the System", description: "Ask-Alta integrated in the system" },
  { id: "a5", dept: "AI Engineers", emoji: "🎓", label: "Alta Academy", description: "Alta academy — sales and CS lessons only" },
  { id: "a6", dept: "AI Engineers", emoji: "📊", label: "All CS Meeting Presentations", description: "All CS meetings presentations automated" },
  { id: "a7", dept: "AI Engineers", emoji: "📈", label: "Alta Dashboards", description: "Alta dashboards shipped" },
  { id: "a8", dept: "AI Engineers", emoji: "💼", label: "CS First Customer — Revenue", description: "CS as the first customer — Revenue Planning" },
  { id: "a9", dept: "AI Engineers", emoji: "🗃️", label: "Knowledge-Desk Live", description: "Knowledge-desk — all Alta knowledge launched" },
  // Design
  { id: "d1", dept: "Design", emoji: "🎥", label: "Social Media & Brand Videos", description: "Creating social media assets and short-form brand videos" },
  { id: "d2", dept: "Design", emoji: "🤖", label: "AI Tools in Design", description: "AI tools into the process and research" },
  { id: "d3", dept: "Design", emoji: "🤝", label: "Hiring Freelancers", description: "Design freelancers hired and onboarded" },
  { id: "d4", dept: "Design", emoji: "🎨", label: "2.0 Brand Efforts", description: "Advancing 2.0 brand efforts — website, LPs, video" },
  // Partnership & General
  { id: "p1", dept: "Partnership", emoji: "🚀", label: "Anthropic Partner Launch", description: "1 partner launch (Anthropic) with joint GTM plan" },
  { id: "p2", dept: "Partnership", emoji: "💵", label: "Interest Income >$20K", description: "Interest income exceeds $20K" },
  { id: "p3", dept: "Partnership", emoji: "🇮🇱", label: "Iran Nuclear & Missiles", description: "Iran nuclear & 90% missiles interceptions" },
];

const DEPT_META = {
  Sales:          { color: "#1d4ed8", bg: "#eff6ff" },
  Marketing:      { color: "#be123c", bg: "#fff1f2" },
  CX:             { color: "#be185d", bg: "#fdf2f8" },
  Operations:     { color: "#b45309", bg: "#fffbeb" },
  Builders:       { color: "#b91c1c", bg: "#fef2f2" },
  "AI Engineers": { color: "#15803d", bg: "#f0fdf4" },
  Design:         { color: "#6d28d9", bg: "#f5f3ff" },
  Partnership:    { color: "#0369a1", bg: "#f0f9ff" },
};
const DEPT_ORDER = ["Sales", "Marketing", "CX", "Operations", "Builders", "AI Engineers", "Design", "Partnership"];

// ─── AMM PRICING ENGINE ─────────────────────────────────────────────────────────
function getPrice(bets, marketId, direction) {
  const active = bets.filter(b => b.market_id === marketId && b.status !== "sold");
  const yesAmt = SEED + active.filter(b => b.direction === "YES").reduce((s, b) => s + b.amount, 0);
  const noAmt  = SEED + active.filter(b => b.direction === "NO").reduce((s, b) => s + b.amount, 0);
  const total = yesAmt + noAmt;
  return direction === "YES" ? yesAmt / total : noAmt / total;
}

function getProb(bets, marketId) {
  return Math.round(getPrice(bets, marketId, "YES") * 100);
}

function getMarketStats(bets, marketId) {
  const active = bets.filter(b => b.market_id === marketId && b.status !== "sold");
  const traders = new Set(active.map(b => b.user_name)).size;
  const totalVol = active.reduce((s, b) => s + b.amount, 0);
  const timestamps = active.map(b => new Date(b.created_at).getTime()).filter(Boolean);
  const lastTs = timestamps.length ? Math.max(...timestamps) : null;
  let state;
  if (traders === 0) state = "no_liquidity";
  else if (traders < 3 || totalVol < 100) state = "low_liquidity";
  else state = "healthy";
  const sorted = [...active].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  let yA = SEED, nA = SEED;
  const hist = [50];
  sorted.forEach(b => { if (b.direction === "YES") yA += b.amount; else nA += b.amount; hist.push(Math.round(yA / (yA + nA) * 100)); });
  return { traders, totalVol, lastTs, state, hist };
}

function formatAgo(ts) {
  if (!ts) return null;
  const d = Date.now() - ts, m = Math.floor(d / 60000), h = Math.floor(d / 3600000), dy = Math.floor(d / 86400000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  return `${dy}d ago`;
}

function getMyPosition(bets, marketId, userName) {
  const my = bets.filter(b => b.user_name === userName && b.market_id === marketId && b.status !== "sold");
  if (my.length === 0) return null;
  const yesBets = my.filter(b => b.direction === "YES");
  const noBets  = my.filter(b => b.direction === "NO");
  const yesShares = yesBets.reduce((s, b) => s + (b.shares || 0), 0);
  const noShares  = noBets.reduce((s, b) => s + (b.shares || 0), 0);
  const yesCost   = yesBets.reduce((s, b) => s + b.amount, 0);
  const noCost    = noBets.reduce((s, b) => s + b.amount, 0);
  return { yesBets, noBets, yesShares, noShares, yesCost, noCost, totalCost: yesCost + noCost, totalBets: my.length };
}

// ─── CONFETTI ───────────────────────────────────────────────────────────────────
function fireConfetti() {
  const colors = ["#6366f1", "#16a34a", "#f59e0b", "#dc2626", "#8b5cf6", "#06b6d4"];
  const container = document.createElement("div");
  container.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:99999;overflow:hidden";
  document.body.appendChild(container);
  for (let i = 0; i < 60; i++) {
    const p = document.createElement("div");
    const size = 6 + Math.random() * 6;
    p.style.cssText = `position:absolute;width:${size}px;height:${size}px;background:${colors[Math.floor(Math.random()*colors.length)]};border-radius:${Math.random()>0.5?"50%":"2px"};left:${Math.random()*100}%;top:-10px;opacity:1;`;
    container.appendChild(p);
    const duration = 1200 + Math.random() * 1000;
    const drift = (Math.random() - 0.5) * 200;
    p.animate([
      { transform: "translateY(0) rotate(0deg)", opacity: 1 },
      { transform: `translateY(${window.innerHeight + 50}px) translateX(${drift}px) rotate(${360 + Math.random()*360}deg)`, opacity: 0 },
    ], { duration, easing: "cubic-bezier(0.25, 0.46, 0.45, 0.94)" });
  }
  setTimeout(() => container.remove(), 2500);
}

// ─── SPARKLINE ──────────────────────────────────────────────────────────────────
function Sparkline({ data, width = 72, height = 24 }) {
  if (!data || data.length < 2) return (
    <span style={{ display: "inline-block", width, height, fontSize: 10, color: "#94a3b8", lineHeight: `${height}px` }}>—</span>
  );
  const mn = Math.min(...data), mx = Math.max(...data), rng = mx - mn || 1;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * width},${height - ((v - mn) / rng * (height - 4) + 2)}`).join(" ");
  const last = data[data.length - 1];
  const strokeColor = last >= 50 ? "#16a34a" : "#dc2626";
  return (
    <svg width={width} height={height} style={{ display: "block", overflow: "visible" }}>
      <polyline fill="none" stroke={strokeColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" points={pts} />
    </svg>
  );
}

// ─── STATS LINE ─────────────────────────────────────────────────────────────────
function StatsLine({ stats, prob }) {
  const { state, traders, totalVol, lastTs, hist } = stats;
  const ago = formatAgo(lastTs);
  if (state === "no_liquidity") return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
      <Sparkline data={hist} />
      <span style={{ fontSize: 11, color: "#94a3b8" }}>Opening price 50% · No trades yet · 0 ◈ vol · 0 traders</span>
    </div>
  );
  if (state === "low_liquidity") return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
      <Sparkline data={hist} />
      <span style={{ fontSize: 11, color: "#f59e0b", fontWeight: 500 }}>⚠ Thin market</span>
      <span style={{ fontSize: 11, color: "#94a3b8" }}>YES {prob}% · {traders} trader{traders !== 1 ? "s" : ""} · {totalVol} ◈ vol · Prices may shift a lot</span>
    </div>
  );
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
      <Sparkline data={hist} />
      <span style={{ fontSize: 11, color: "#64748b" }}>
        YES {prob}%
        {totalVol > 0 && ` · ${totalVol.toLocaleString()} ◈ vol`}
        {traders > 0 && ` · ${traders} traders`}
        {ago && ` · ${ago}`}
      </span>
    </div>
  );
}

// ─── MARKET CARD ────────────────────────────────────────────────────────────────
function MarketCard({ market, bets, currentUser, onBet, onSell, resolution }) {
  const prob = getProb(bets, market.id);
  const stats = getMarketStats(bets, market.id);
  const pos = currentUser ? getMyPosition(bets, market.id, currentUser.name) : null;
  const meta = DEPT_META[market.dept];
  const isResolved = !!resolution;

  // Calculate position P&L
  let posDisplay = null;
  if (pos) {
    const yesPrice = getPrice(bets, market.id, "YES");
    const noPrice  = getPrice(bets, market.id, "NO");
    const yesValue = Math.round(pos.yesShares * yesPrice);
    const noValue  = Math.round(pos.noShares * noPrice);
    const totalValue = yesValue + noValue;
    const pnl = totalValue - pos.totalCost;
    const pnlPct = pos.totalCost > 0 ? Math.round(pnl / pos.totalCost * 100) : 0;
    const dominantDir = pos.yesShares >= pos.noShares ? "YES" : "NO";
    const dominantShares = dominantDir === "YES" ? pos.yesShares : pos.noShares;
    posDisplay = { dominantDir, dominantShares, totalValue, pnl, pnlPct, totalCost: pos.totalCost };
  }

  // Resolution payout calculation
  let resPayout = null;
  if (isResolved && pos) {
    const active = bets.filter(b => b.market_id === market.id && b.status !== "sold");
    const totalPool = active.reduce((s, b) => s + b.amount, 0);
    const winnerShares = active.filter(b => b.direction === resolution.outcome).reduce((s, b) => s + (b.shares || 0), 0);
    const payoutPerShare = winnerShares > 0 ? totalPool / winnerShares : 0;
    const myWinShares = pos[resolution.outcome === "YES" ? "yesShares" : "noShares"];
    resPayout = myWinShares > 0 ? Math.round(myWinShares * payoutPerShare) : 0;
  }

  return (
    <div
      onClick={() => !isResolved && onBet(market)}
      style={{
        background: isResolved ? (resolution.outcome === "YES" ? "#f0fdf4" : "#fef2f2") : "#fff",
        border: `1px solid ${isResolved ? (resolution.outcome === "YES" ? "#bbf7d0" : "#fecaca") : "#e2e8f0"}`,
        borderRadius: 14, padding: "18px 20px",
        cursor: isResolved ? "default" : "pointer",
        transition: "box-shadow 0.15s, border-color 0.15s",
        display: "flex", flexDirection: "column", gap: 12,
        opacity: isResolved ? 0.9 : 1,
      }}
      onMouseEnter={e => { if (!isResolved) { e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)"; e.currentTarget.style.borderColor = "#c7d2fe"; } }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = isResolved ? (resolution.outcome === "YES" ? "#bbf7d0" : "#fecaca") : "#e2e8f0"; }}
    >
      {/* Resolved banner */}
      {isResolved && (
        <div style={{
          background: resolution.outcome === "YES" ? "#16a34a" : "#dc2626",
          color: "#fff", fontSize: 11, fontWeight: 700, padding: "4px 12px",
          borderRadius: 8, textAlign: "center", letterSpacing: 0.5,
        }}>
          RESOLVED: {resolution.outcome}
          {resPayout > 0 ? ` — YOU WON ${resPayout} ◈! 🎉` : pos ? " — Better luck next time" : ""}
        </div>
      )}
      {/* Header row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 20 }}>{market.emoji}</span>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#0f172a", lineHeight: 1.3 }}>{market.label}</div>
            <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{market.description}</div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
          <span style={{ fontSize: 10, fontWeight: 600, color: meta.color, background: meta.bg, padding: "2px 8px", borderRadius: 20, letterSpacing: 0.5, whiteSpace: "nowrap" }}>
            {market.dept.toUpperCase()}
          </span>
        </div>
      </div>
      {/* Position badge */}
      {posDisplay && !isResolved && (
        <div style={{
          background: posDisplay.pnl >= 0 ? "#f0fdf4" : "#fef2f2",
          border: `1px solid ${posDisplay.pnl >= 0 ? "#bbf7d0" : "#fecaca"}`,
          borderRadius: 10, padding: "8px 12px",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <div>
            <span style={{ fontSize: 11, fontWeight: 600, color: "#475569" }}>YOUR POSITION </span>
            <span style={{ fontSize: 11, fontWeight: 700, color: posDisplay.dominantDir === "YES" ? "#16a34a" : "#dc2626" }}>
              {Math.round(posDisplay.dominantShares)} {posDisplay.dominantDir} shares
            </span>
          </div>
          <div style={{ textAlign: "right" }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: posDisplay.pnl >= 0 ? "#16a34a" : "#dc2626" }}>
              {posDisplay.pnl >= 0 ? "+" : ""}{posDisplay.pnl} ◈
            </span>
            <span style={{ fontSize: 10, color: "#94a3b8", marginLeft: 4 }}>
              ({posDisplay.pnlPct >= 0 ? "+" : ""}{posDisplay.pnlPct}%)
            </span>
          </div>
        </div>
      )}
      {/* Probability bar */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#16a34a" }}>YES {prob}%</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#dc2626" }}>NO {100 - prob}%</span>
        </div>
        <div style={{ height: 6, background: "#f1f5f9", borderRadius: 99, overflow: "hidden" }}>
          <div style={{
            height: "100%", width: `${prob}%`,
            background: prob > 60 ? "linear-gradient(90deg, #16a34a, #22c55e)" : prob < 40 ? "linear-gradient(90deg, #ef4444, #f87171)" : "linear-gradient(90deg, #f59e0b, #fbbf24)",
            borderRadius: 99, transition: "width 0.4s ease",
          }} />
        </div>
      </div>
      {/* Stats line */}
      <StatsLine stats={stats} prob={prob} />
      {/* CTA buttons */}
      {!isResolved && (
        <div style={{ display: "flex", gap: 8, marginTop: 2 }}>
          <button onClick={e => { e.stopPropagation(); onBet(market, "YES"); }} style={{ flex: 1, padding: "8px 0", borderRadius: 8, border: "1px solid #bbf7d0", background: "#f0fdf4", color: "#16a34a", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
            Buy YES ↑
          </button>
          <button onClick={e => { e.stopPropagation(); onBet(market, "NO"); }} style={{ flex: 1, padding: "8px 0", borderRadius: 8, border: "1px solid #fecaca", background: "#fef2f2", color: "#dc2626", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
            Buy NO ↓
          </button>
        </div>
      )}
    </div>
  );
}

// ─── BET MODAL (AMM) ────────────────────────────────────────────────────────────
function BetModal({ market, initialDir, currentUser, bets, onConfirm, onClose }) {
  const [dir, setDir] = useState(initialDir || "YES");
  const [amount, setAmount] = useState(50);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const price = getPrice(bets, market.id, dir);
  const shares = amount / price;
  const prob = getProb(bets, market.id);
  const isValid = amount > 0 && amount <= currentUser.tokens;

  // Simulate price after your bet
  const simActive = bets.filter(b => b.market_id === market.id && b.status !== "sold");
  const simYes = SEED + simActive.filter(b => b.direction === "YES").reduce((s, b) => s + b.amount, 0) + (dir === "YES" ? amount : 0);
  const simNo  = SEED + simActive.filter(b => b.direction === "NO").reduce((s, b) => s + b.amount, 0) + (dir === "NO" ? amount : 0);
  const newProb = Math.round(simYes / (simYes + simNo) * 100);

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 20 }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: 20, padding: 28, maxWidth: 440, width: "100%", boxShadow: "0 24px 48px rgba(0,0,0,0.15)" }} onClick={e => e.stopPropagation()}>
        {/* Market title */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <span style={{ fontSize: 28 }}>{market.emoji}</span>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#0f172a" }}>{market.label}</div>
            <div style={{ fontSize: 11, color: "#94a3b8" }}>{market.description}</div>
          </div>
        </div>
        {/* Current odds */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          <div style={{ flex: 1, background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: "10px 12px", textAlign: "center" }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#16a34a" }}>{prob}%</div>
            <div style={{ fontSize: 10, color: "#4ade80", marginTop: 1 }}>YES price</div>
          </div>
          <div style={{ flex: 1, background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "10px 12px", textAlign: "center" }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#dc2626" }}>{100 - prob}%</div>
            <div style={{ fontSize: 10, color: "#f87171", marginTop: 1 }}>NO price</div>
          </div>
        </div>
        {/* Direction */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#64748b", letterSpacing: 0.8, marginBottom: 8 }}>YOUR PREDICTION</div>
          <div style={{ display: "flex", gap: 8 }}>
            {["YES", "NO"].map(d => (
              <button key={d} onClick={() => setDir(d)} style={{
                flex: 1, padding: "11px", borderRadius: 10,
                border: `2px solid ${dir === d ? (d === "YES" ? "#16a34a" : "#dc2626") : "#e2e8f0"}`,
                background: dir === d ? (d === "YES" ? "#f0fdf4" : "#fef2f2") : "#fff",
                color: dir === d ? (d === "YES" ? "#16a34a" : "#dc2626") : "#64748b",
                fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
              }}>{d === "YES" ? "✅ YES" : "❌ NO"}</button>
            ))}
          </div>
        </div>
        {/* Amount */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#64748b", letterSpacing: 0.8 }}>AMOUNT (◈)</div>
            <div style={{ fontSize: 11, color: "#94a3b8" }}>Balance: {currentUser.tokens.toLocaleString()} ◈</div>
          </div>
          <input
            type="number"
            value={amount}
            onChange={e => setAmount(Math.max(0, Math.min(parseInt(e.target.value) || 0, currentUser.tokens)))}
            onKeyDown={e => { if (e.key === "Enter" && isValid && !submitting) { e.preventDefault(); document.getElementById("confirm-bet-btn")?.click(); } }}
            min={1} max={currentUser.tokens}
            style={{
              width: "100%", padding: "12px 14px", borderRadius: 10,
              border: `1.5px solid ${!isValid && amount !== 0 ? "#fecaca" : "#e2e8f0"}`,
              fontSize: 18, fontWeight: 700, color: "#0f172a", fontFamily: "inherit",
              outline: "none", boxSizing: "border-box", background: "#f8fafc",
            }}
            onFocus={e => e.target.style.borderColor = "#6366f1"}
            onBlur={e => e.target.style.borderColor = !isValid && amount !== 0 ? "#fecaca" : "#e2e8f0"}
          />
          {!isValid && amount !== 0 && (
            <div style={{ fontSize: 11, color: "#dc2626", marginTop: 4 }}>Amount must be between 1 and {currentUser.tokens.toLocaleString()} ◈</div>
          )}
          <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
            {[50, 100, 250, 500].map(v => (
              <button key={v} onClick={() => setAmount(Math.min(v, currentUser.tokens))} style={{
                flex: 1, padding: "6px 0", borderRadius: 8, border: "1px solid #e2e8f0",
                background: amount === v ? "#eff6ff" : "#f8fafc", color: "#64748b",
                fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
              }}>{v}</button>
            ))}
            <button onClick={() => setAmount(currentUser.tokens)} style={{
              flex: 1, padding: "6px 0", borderRadius: 8, border: "1px solid #e2e8f0",
              background: amount === currentUser.tokens ? "#eff6ff" : "#f8fafc", color: "#64748b",
              fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
            }}>MAX</button>
          </div>
        </div>
        {/* Trade summary */}
        <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: "12px 16px", marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: "#64748b" }}>You buy</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#0f172a" }}>{Math.round(shares)} {dir} shares @ {Math.round(price * 100)}%</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: "#64748b" }}>Price after trade</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#6366f1" }}>YES {newProb}% / NO {100 - newProb}%</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 12, color: "#64748b" }}>If {dir} wins, shares worth</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#16a34a" }}>up to {Math.round(shares)} ◈ ({amount > 0 ? `${Math.round((shares / amount - 1) * 100)}% profit` : ""})</span>
          </div>
        </div>
        {/* Actions */}
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: "13px", borderRadius: 10, border: "1.5px solid #e2e8f0", background: "#fff", color: "#64748b", fontWeight: 600, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
          <button
            id="confirm-bet-btn"
            disabled={!isValid || submitting}
            onClick={async () => {
              if (!isValid || submitting) return;
              setSubmitting(true);
              await onConfirm({ dir, amount, shares, entryPrice: price });
              setSubmitting(false);
            }}
            style={{
              flex: 2, padding: "13px", borderRadius: 10, border: "none",
              cursor: !isValid || submitting ? "not-allowed" : "pointer", fontFamily: "inherit",
              fontWeight: 700, fontSize: 14, opacity: !isValid || submitting ? 0.5 : 1,
              background: dir === "YES" ? "#16a34a" : "#dc2626", color: "#fff",
            }}
          >
            {submitting ? "Buying..." : `Buy ${Math.round(shares)} ${dir} shares for ${amount} ◈`}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── SELL MODAL ─────────────────────────────────────────────────────────────────
function SellModal({ bet, bets, onConfirm, onClose }) {
  const [submitting, setSubmitting] = useState(false);
  const market = MARKETS.find(m => m.id === bet.market_id);
  if (!market) return null;

  const currentPrice = getPrice(bets, bet.market_id, bet.direction);
  const payout = Math.round((bet.shares || 0) * currentPrice);
  const pnl = payout - bet.amount;
  const pnlPct = bet.amount > 0 ? Math.round(pnl / bet.amount * 100) : 0;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 20 }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: 20, padding: 28, maxWidth: 400, width: "100%", boxShadow: "0 24px 48px rgba(0,0,0,0.15)" }} onClick={e => e.stopPropagation()}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 36 }}>💸</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", marginTop: 8 }}>Sell Position</div>
          <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>{market.emoji} {market.label}</div>
        </div>
        <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 12, padding: 16, marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: "#64748b" }}>Shares</span>
            <span style={{ fontSize: 12, fontWeight: 700 }}>{Math.round(bet.shares || 0)} {bet.direction}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: "#64748b" }}>Entry price</span>
            <span style={{ fontSize: 12, fontWeight: 600 }}>{Math.round((bet.entry_price || 0.5) * 100)}%</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: "#64748b" }}>Current price</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#6366f1" }}>{Math.round(currentPrice * 100)}%</span>
          </div>
          <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: 8, marginTop: 4 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontSize: 12, color: "#64748b" }}>You paid</span>
              <span style={{ fontSize: 12, fontWeight: 600 }}>{bet.amount} ◈</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontSize: 12, color: "#64748b" }}>You receive</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>{payout} ◈</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 12, color: "#64748b" }}>P&L</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: pnl >= 0 ? "#16a34a" : "#dc2626" }}>
                {pnl >= 0 ? "+" : ""}{pnl} ◈ ({pnlPct >= 0 ? "+" : ""}{pnlPct}%)
              </span>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: "13px", borderRadius: 10, border: "1.5px solid #e2e8f0", background: "#fff", color: "#64748b", fontWeight: 600, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>Keep</button>
          <button
            disabled={submitting}
            onClick={async () => {
              setSubmitting(true);
              await onConfirm(bet, payout);
              setSubmitting(false);
            }}
            style={{
              flex: 2, padding: "13px", borderRadius: 10, border: "none",
              background: pnl >= 0 ? "#16a34a" : "#dc2626", color: "#fff",
              fontWeight: 700, fontSize: 14, cursor: submitting ? "not-allowed" : "pointer",
              fontFamily: "inherit", opacity: submitting ? 0.5 : 1,
            }}
          >
            {submitting ? "Selling..." : `Sell for ${payout} ◈`}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── ADMIN PANEL ────────────────────────────────────────────────────────────────
function AdminPanel({ bets, resolutions, onResolve }) {
  const [resolving, setResolving] = useState(null);

  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div style={{ fontSize: 40 }}>⚙️</div>
        <div style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", marginTop: 6 }}>Admin Panel</div>
        <div style={{ color: "#64748b", fontSize: 13, marginTop: 4 }}>Resolve markets — winners split the total pool by shares</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 10 }}>
        {MARKETS.map(m => {
          const res = resolutions.find(r => r.market_id === m.id);
          const active = bets.filter(b => b.market_id === m.id && b.status !== "sold");
          const pool = active.reduce((s, b) => s + b.amount, 0);
          const prob = getProb(bets, m.id);
          return (
            <div key={m.id} style={{
              background: res ? (res.outcome === "YES" ? "#f0fdf4" : "#fef2f2") : "#fff",
              border: `1px solid ${res ? (res.outcome === "YES" ? "#bbf7d0" : "#fecaca") : "#e2e8f0"}`,
              borderRadius: 12, padding: "14px 18px",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 18 }}>{m.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>{m.label}</div>
                  <div style={{ fontSize: 10, color: "#94a3b8" }}>{m.dept} · Pool: {pool} ◈ · YES {prob}%</div>
                </div>
              </div>
              {res ? (
                <div style={{
                  fontSize: 12, fontWeight: 700, textAlign: "center", padding: "6px",
                  borderRadius: 8,
                  color: res.outcome === "YES" ? "#16a34a" : "#dc2626",
                  background: res.outcome === "YES" ? "#dcfce7" : "#fee2e2",
                }}>
                  Resolved: {res.outcome}
                </div>
              ) : (
                <div style={{ display: "flex", gap: 6 }}>
                  <button
                    disabled={resolving === m.id}
                    onClick={async () => { setResolving(m.id); await onResolve(m.id, "YES"); setResolving(null); }}
                    style={{ flex: 1, padding: "8px", borderRadius: 8, border: "1px solid #bbf7d0", background: "#f0fdf4", color: "#16a34a", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
                  >
                    {resolving === m.id ? "..." : "✅ YES"}
                  </button>
                  <button
                    disabled={resolving === m.id}
                    onClick={async () => { setResolving(m.id); await onResolve(m.id, "NO"); setResolving(null); }}
                    style={{ flex: 1, padding: "8px", borderRadius: 8, border: "1px solid #fecaca", background: "#fef2f2", color: "#dc2626", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
                  >
                    {resolving === m.id ? "..." : "❌ NO"}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── MAIN APP ───────────────────────────────────────────────────────────────────
export default function Poplymarket() {
  const [users, setUsers] = useState([]);
  const [bets, setBets] = useState([]);
  const [resolutions, setResolutions] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [emailInput, setEmailInput] = useState("");
  const [otpStep, setOtpStep] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [betMarket, setBetMarket] = useState(null);
  const [betInitialDir, setBetInitialDir] = useState("YES");
  const [sellBet, setSellBet] = useState(null);
  const [tab, setTab] = useState("markets");
  const [filterDept, setFilterDept] = useState("All");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const emailInputRef = useRef(null);

  const showToast = useCallback((msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // ── LOAD DATA FROM SUPABASE ──
  const loadData = useCallback(async () => {
    try {
      const [usersRes, betsRes, resRes] = await Promise.all([
        supabase.from("users").select("*"),
        supabase.from("bets").select("*"),
        supabase.from("market_resolutions").select("*"),
      ]);
      if (usersRes.data) setUsers(usersRes.data);
      if (betsRes.data) setBets(betsRes.data);
      if (resRes.data) setResolutions(resRes.data);

      // Restore session
      const saved = localStorage.getItem("pm3-user");
      if (saved && usersRes.data) {
        const found = usersRes.data.find(u => u.name === saved);
        if (found) setCurrentUser(found);
      }
    } catch (e) {
      console.error("Failed to load data:", e);
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Safety: never stay stuck on loading spinner
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 6000);
    return () => clearTimeout(t);
  }, []);

  // ── REALTIME SUBSCRIPTIONS ──
  useEffect(() => {
    const channel = supabase
      .channel("poplymarket-v3")
      .on("postgres_changes", { event: "*", schema: "public", table: "bets" }, (payload) => {
        if (payload.eventType === "INSERT") {
          setBets(prev => [...prev, payload.new]);
        } else if (payload.eventType === "UPDATE") {
          setBets(prev => prev.map(b => b.id === payload.new.id ? payload.new : b));
        }
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "market_resolutions" }, (payload) => {
        if (payload.eventType === "INSERT") {
          setResolutions(prev => [...prev, payload.new]);
        }
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "users" }, (payload) => {
        if (payload.eventType === "INSERT") {
          setUsers(prev => prev.find(u => u.name === payload.new.name) ? prev : [...prev, payload.new]);
        } else if (payload.eventType === "UPDATE") {
          setUsers(prev => prev.map(u => u.name === payload.new.name ? payload.new : u));
          // Keep currentUser in sync
          setCurrentUser(cu => cu && cu.name === payload.new.name ? payload.new : cu);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // ── AUTH CALLBACK (handles email link clicks) ──
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if ((event === "SIGNED_IN" || event === "PASSWORD_RECOVERY") && session?.user?.email) {
        const email = session.user.email.toLowerCase();
        if (!email.endsWith(`@${ALLOWED_DOMAIN}`)) return;
        // Clean URL hash
        if (window.location.hash) window.history.replaceState(null, "", window.location.pathname);
        // Find or create user in our table
        const name = extractName(email);
        const freshUsers = (await supabase.from("users").select("*")).data || users;
        let existing = freshUsers.find(u => u.email && u.email.toLowerCase() === email);
        if (!existing) existing = freshUsers.find(u => u.name.toLowerCase() === name.toLowerCase());
        if (existing) {
          if (!existing.email) {
            await supabase.from("users").update({ email }).eq("name", existing.name);
            existing = { ...existing, email };
          }
          setCurrentUser(existing);
          localStorage.setItem("pm3-user", existing.name);
          showToast(`Welcome back, ${existing.name}! 👋`);
        } else {
          const { data } = await supabase.from("users").insert({ name, email, tokens: INITIAL_TOKENS }).select().single();
          if (data) {
            setUsers(prev => [...prev, data]);
            setCurrentUser(data);
            localStorage.setItem("pm3-user", data.name);
            fireConfetti();
            showToast(`Welcome, ${name}! 🎯 1,000 tokens loaded`);
          }
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [users, showToast]);

  useEffect(() => {
    if (!currentUser && emailInputRef.current) {
      setTimeout(() => emailInputRef.current?.focus(), 100);
    }
  }, [currentUser]);

  // ── STEP 1: SEND OTP CODE ──
  const handleSendOtp = async () => {
    const email = emailInput.trim().toLowerCase();
    if (!isValidEmail(email)) {
      showToast("Please enter a valid @altahq.com email", "error");
      return;
    }
    setOtpLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ email });
    setOtpLoading(false);
    if (error) {
      showToast(`Error sending code: ${error.message}`, "error");
      return;
    }
    setOtpStep(true);
    showToast("Code sent! Check your email 📧");
  };

  // ── STEP 2: VERIFY OTP & LOGIN ──
  const handleVerifyOtp = async () => {
    const email = emailInput.trim().toLowerCase();
    const token = otpCode.trim();
    if (!token || token.length < 6) {
      showToast("Enter the 6-digit code from your email", "error");
      return;
    }
    setOtpLoading(true);
    const { error: verifyErr } = await supabase.auth.verifyOtp({ email, token, type: "email" });
    setOtpLoading(false);
    if (verifyErr) {
      showToast("Invalid or expired code. Try again.", "error");
      return;
    }

    // OTP verified — now find or create user in our users table
    const name = extractName(email);
    let existing = users.find(u => u.email && u.email.toLowerCase() === email);
    if (!existing) {
      existing = users.find(u => u.name.toLowerCase() === name.toLowerCase());
    }

    if (existing) {
      if (!existing.email) {
        await supabase.from("users").update({ email }).eq("name", existing.name);
        existing = { ...existing, email };
      }
      setCurrentUser(existing);
      localStorage.setItem("pm3-user", existing.name);
      setOtpStep(false);
      setOtpCode("");
      showToast(`Welcome back, ${existing.name}! 👋`);
      return;
    }

    // Create new user
    const { data, error } = await supabase
      .from("users")
      .insert({ name, email, tokens: INITIAL_TOKENS })
      .select()
      .single();
    if (error) {
      showToast(`Error: ${error.message}`, "error");
      return;
    }
    setUsers(prev => [...prev, data]);
    setCurrentUser(data);
    localStorage.setItem("pm3-user", data.name);
    setOtpStep(false);
    setOtpCode("");
    fireConfetti();
    showToast(`Welcome, ${name}! 🎯 1,000 tokens loaded`);
  };

  // ── PLACE BET (AMM) ──
  const handleBet = async ({ dir, amount, shares, entryPrice }) => {
    const { data: betData, error: betError } = await supabase
      .from("bets")
      .insert({
        user_name: currentUser.name,
        market_id: betMarket.id,
        direction: dir,
        amount,
        shares,
        entry_price: entryPrice,
        status: "active",
      })
      .select()
      .single();

    if (betError) {
      showToast(`Error: ${betError.message}`, "error");
      return;
    }

    const newTokens = currentUser.tokens - amount;
    const { error: userError } = await supabase
      .from("users")
      .update({ tokens: newTokens })
      .eq("name", currentUser.name);

    if (userError) {
      showToast(`Error: ${userError.message}`, "error");
      return;
    }

    const updatedUser = { ...currentUser, tokens: newTokens };
    setBets(prev => [...prev, betData]);
    setUsers(prev => prev.map(u => u.name === currentUser.name ? updatedUser : u));
    setCurrentUser(updatedUser);
    setBetMarket(null);
    fireConfetti();
    showToast(`Bought ${Math.round(shares)} ${dir} shares @ ${Math.round(entryPrice * 100)}% for ${amount} ◈ 🎯`);
  };

  // ── SELL POSITION ──
  const handleSell = async (bet, payout) => {
    // Mark bet as sold
    const { error: sellError } = await supabase
      .from("bets")
      .update({ status: "sold" })
      .eq("id", bet.id);

    if (sellError) {
      showToast(`Error: ${sellError.message}`, "error");
      return;
    }

    // Credit payout to user
    const newTokens = currentUser.tokens + payout;
    const { error: userError } = await supabase
      .from("users")
      .update({ tokens: newTokens })
      .eq("name", currentUser.name);

    if (userError) {
      showToast(`Error: ${userError.message}`, "error");
      return;
    }

    const updatedUser = { ...currentUser, tokens: newTokens };
    setBets(prev => prev.map(b => b.id === bet.id ? { ...b, status: "sold" } : b));
    setUsers(prev => prev.map(u => u.name === currentUser.name ? updatedUser : u));
    setCurrentUser(updatedUser);
    setSellBet(null);

    const pnl = payout - bet.amount;
    showToast(`Sold for ${payout} ◈ (${pnl >= 0 ? "+" : ""}${pnl} ◈ P&L) 💸`);
  };

  // ── RESOLVE MARKET (admin) ──
  const handleResolve = async (marketId, outcome) => {
    const { data, error } = await supabase
      .from("market_resolutions")
      .insert({ market_id: marketId, outcome, resolved_by: currentUser.name })
      .select()
      .single();

    if (error) {
      showToast(`Error: ${error.message}`, "error");
      return;
    }

    setResolutions(prev => [...prev, data]);

    // Pro-rata payout: winners split the total active pool by shares
    const active = bets.filter(b => b.market_id === marketId && b.status !== "sold");
    const totalPool = active.reduce((s, b) => s + b.amount, 0);
    const winners = active.filter(b => b.direction === outcome);
    const totalWinShares = winners.reduce((s, b) => s + (b.shares || 0), 0);
    const payoutPerShare = totalWinShares > 0 ? totalPool / totalWinShares : 0;

    for (const bet of winners) {
      const payout = Math.round((bet.shares || 0) * payoutPerShare);
      const user = users.find(u => u.name === bet.user_name);
      if (user && payout > 0) {
        await supabase
          .from("users")
          .update({ tokens: user.tokens + payout })
          .eq("name", user.name);
      }
    }

    await loadData();
    showToast(`Market resolved: ${outcome}! ${winners.length} winner(s) split ${totalPool} ◈ pool.`);
  };

  const isAdmin = currentUser && ADMINS.some(a => a.toLowerCase() === currentUser.name.toLowerCase());
  const filteredMarkets = filterDept === "All" ? MARKETS : MARKETS.filter(m => m.dept === filterDept);
  const activeBets = bets.filter(b => b.status !== "sold");
  const totalStaked = activeBets.reduce((s, b) => s + b.amount, 0);

  // Leaderboard with unrealized P&L
  const leaderboard = [...users].sort((a, b) => {
    const aActive = activeBets.filter(x => x.user_name === a.name);
    const aValue = aActive.reduce((s, x) => {
      const price = getPrice(bets, x.market_id, x.direction);
      return s + Math.round((x.shares || 0) * price);
    }, 0);
    const bActive = activeBets.filter(x => x.user_name === b.name);
    const bValue = bActive.reduce((s, x) => {
      const price = getPrice(bets, x.market_id, x.direction);
      return s + Math.round((x.shares || 0) * price);
    }, 0);
    return (b.tokens + bValue) - (a.tokens + aValue);
  }).map((u, i) => {
    const uActive = activeBets.filter(b => b.user_name === u.name);
    const posValue = uActive.reduce((s, x) => s + Math.round((x.shares || 0) * getPrice(bets, x.market_id, x.direction)), 0);
    const staked = uActive.reduce((s, b) => s + b.amount, 0);
    return {
      ...u, rank: i + 1,
      betCount: uActive.length, staked, posValue,
      portfolio: u.tokens + posValue,
    };
  });

  // My bets data
  const myActiveBets = bets.filter(b => b.user_name === currentUser?.name && b.status !== "sold");
  const mySoldBets   = bets.filter(b => b.user_name === currentUser?.name && b.status === "sold");
  const myPosValue = myActiveBets.reduce((s, b) => s + Math.round((b.shares || 0) * getPrice(bets, b.market_id, b.direction)), 0);
  const myStaked = myActiveBets.reduce((s, b) => s + b.amount, 0);
  const myUnrealizedPnL = myPosValue - myStaked;

  if (loading) return (
    <div style={{ background: "#f8fafc", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "DM Sans, sans-serif" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 12, animation: "pulse 1.5s infinite" }}>🎯</div>
        <div style={{ color: "#6366f1", fontSize: 16, fontWeight: 500 }}>Loading Poplymarket...</div>
        <style>{`@keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.15); } }`}</style>
      </div>
    </div>
  );

  // ── LOGIN SCREEN ──
  if (!currentUser) return (
    <div style={{ background: "linear-gradient(135deg, #f8fafc 0%, #eff6ff 50%, #f5f3ff 100%)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "DM Sans, sans-serif", padding: "20px" }}>
      <div style={{ maxWidth: 420, width: "100%", textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>🎯</div>
        <div style={{ fontSize: 40, fontWeight: 800, letterSpacing: "-1.5px", color: "#0f172a", marginBottom: 4 }}>
          Poply<span style={{ color: "#6366f1" }}>market</span>
        </div>
        <div style={{ color: "#64748b", fontSize: 14, marginBottom: 40 }}>Alta's March 2026 Prediction Market</div>
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 20, padding: 32, boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
          {!otpStep ? (
            <>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#64748b", letterSpacing: 0.8, marginBottom: 8, textAlign: "left" }}>YOUR ALTA EMAIL</div>
              <input
                ref={emailInputRef}
                value={emailInput}
                onChange={e => setEmailInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSendOtp()}
                placeholder="yourname@altahq.com"
                type="email"
                style={{
                  width: "100%", padding: "13px 16px", borderRadius: 12,
                  border: "1.5px solid #e2e8f0", fontSize: 15, fontFamily: "inherit",
                  outline: "none", boxSizing: "border-box", marginBottom: 16, color: "#0f172a", background: "#f8fafc",
                }}
                onFocus={e => e.target.style.borderColor = "#6366f1"}
                onBlur={e => e.target.style.borderColor = "#e2e8f0"}
              />
              <button onClick={handleSendOtp} disabled={otpLoading} style={{
                width: "100%", padding: "14px", borderRadius: 12, border: "none",
                background: otpLoading ? "#94a3b8" : "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "#fff",
                fontSize: 15, fontWeight: 700, cursor: otpLoading ? "wait" : "pointer", fontFamily: "inherit",
              }}>{otpLoading ? "Sending..." : "Send Verification Code →"}</button>
            </>
          ) : (
            <>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#16a34a", letterSpacing: 0.8, marginBottom: 4, textAlign: "left" }}>✓ CODE SENT TO</div>
              <div style={{ fontSize: 14, color: "#0f172a", fontWeight: 600, marginBottom: 16, textAlign: "left" }}>{emailInput.trim().toLowerCase()}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#64748b", letterSpacing: 0.8, marginBottom: 8, textAlign: "left" }}>ENTER 6-DIGIT CODE</div>
              <input
                value={otpCode}
                onChange={e => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                onKeyDown={e => e.key === "Enter" && handleVerifyOtp()}
                placeholder="000000"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                autoFocus
                style={{
                  width: "100%", padding: "13px 16px", borderRadius: 12,
                  border: "1.5px solid #e2e8f0", fontSize: 24, fontFamily: "inherit",
                  outline: "none", boxSizing: "border-box", marginBottom: 16, color: "#0f172a",
                  background: "#f8fafc", textAlign: "center", letterSpacing: 8, fontWeight: 700,
                }}
                onFocus={e => e.target.style.borderColor = "#6366f1"}
                onBlur={e => e.target.style.borderColor = "#e2e8f0"}
              />
              <button onClick={handleVerifyOtp} disabled={otpLoading} style={{
                width: "100%", padding: "14px", borderRadius: 12, border: "none",
                background: otpLoading ? "#94a3b8" : "linear-gradient(135deg, #16a34a, #15803d)", color: "#fff",
                fontSize: 15, fontWeight: 700, cursor: otpLoading ? "wait" : "pointer", fontFamily: "inherit",
              }}>{otpLoading ? "Verifying..." : "Verify & Enter the Market →"}</button>
              <button onClick={() => { setOtpStep(false); setOtpCode(""); }} style={{
                width: "100%", padding: "10px", borderRadius: 12, border: "none",
                background: "transparent", color: "#64748b",
                fontSize: 13, cursor: "pointer", fontFamily: "inherit", marginTop: 8,
              }}>← Use a different email</button>
            </>
          )}
          <div style={{ color: "#94a3b8", fontSize: 12, marginTop: 14 }}>
            Alta employees only · <strong style={{ color: "#6366f1" }}>1,000 ◈</strong> starting tokens · Shares go up when others agree with you
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: 24, marginTop: 24 }}>
          {[["🏦", `${MARKETS.length}`, "Markets"], ["👥", `${users.length}`, "Players"], ["◈", `${totalStaked.toLocaleString()}`, "Staked"]].map(([icon, val, label]) => (
            <div key={label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 11, color: "#94a3b8" }}>{icon}</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#0f172a" }}>{val}</div>
              <div style={{ fontSize: 10, color: "#94a3b8" }}>{label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ── MAIN APP ──
  const tabs = [["markets", "📊 Markets"], ["leaderboard", "🏆 Leaderboard"], ["my bets", "🎲 My Bets"]];
  if (isAdmin) tabs.push(["admin", "⚙️ Admin"]);

  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh", fontFamily: "DM Sans, sans-serif" }}>
      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", top: 16, right: 16, zIndex: 9999,
          background: "#fff", border: `1px solid ${toast.type === "error" ? "#fecaca" : "#bbf7d0"}`,
          borderLeft: `4px solid ${toast.type === "error" ? "#dc2626" : "#16a34a"}`,
          boxShadow: "0 8px 24px rgba(0,0,0,0.1)", padding: "12px 16px", borderRadius: 10,
          fontSize: 13, fontWeight: 500, color: "#0f172a", maxWidth: 360,
          animation: "slideIn 0.3s ease",
        }}>{toast.msg}</div>
      )}
      <style>{`@keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`}</style>

      {/* Header */}
      <div style={{
        background: "#fff", borderBottom: "1px solid #e2e8f0", padding: "0 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        height: 56, position: "sticky", top: 0, zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 18 }}>🎯</span>
          <span style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.5px" }}>
            Poply<span style={{ color: "#6366f1" }}>market</span>
          </span>
          <span style={{ fontSize: 11, color: "#94a3b8", marginLeft: 4 }}>Alta · Mar 2026</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 10, color: "#94a3b8", letterSpacing: 0.5 }}>BALANCE</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#16a34a" }}>{currentUser.tokens.toLocaleString()} ◈</div>
          </div>
          <div style={{ background: "#f1f5f9", borderRadius: 20, padding: "5px 12px", fontSize: 13, fontWeight: 500, color: "#475569" }}>
            {currentUser.name} {isAdmin && <span style={{ fontSize: 10, color: "#6366f1" }}>★</span>}
          </div>
          <button onClick={() => { setCurrentUser(null); localStorage.removeItem("pm3-user"); }} style={{
            background: "transparent", border: "1px solid #e2e8f0", borderRadius: 8,
            padding: "5px 10px", color: "#94a3b8", fontSize: 12, cursor: "pointer", fontFamily: "inherit",
          }}>← Out</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e2e8f0", padding: "0 24px", display: "flex", gap: 0, overflowX: "auto" }}>
        {tabs.map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} style={{
            background: "transparent", border: "none",
            borderBottom: tab === key ? "2px solid #6366f1" : "2px solid transparent",
            color: tab === key ? "#6366f1" : "#64748b",
            padding: "14px 16px", fontSize: 13, fontWeight: tab === key ? 700 : 500,
            cursor: "pointer", fontFamily: "inherit", marginBottom: -1, whiteSpace: "nowrap",
          }}>{label}</button>
        ))}
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", alignItems: "center", fontSize: 11, color: "#94a3b8" }}>
          🔄 Live — updates in real-time
        </div>
      </div>

      <div style={{ maxWidth: 1120, margin: "0 auto", padding: "24px 20px" }}>
        {/* ── MARKETS TAB ── */}
        {tab === "markets" && (
          <>
            <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
              {[
                { label: "Markets", val: MARKETS.length, icon: "📊" },
                { label: "Bets placed", val: activeBets.length, icon: "🎯" },
                { label: "Players", val: users.length, icon: "👥" },
                { label: "Tokens staked", val: `${totalStaked.toLocaleString()} ◈`, icon: "💰" },
              ].map(s => (
                <div key={s.label} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "12px 18px", flex: 1, minWidth: 120 }}>
                  <div style={{ fontSize: 10, color: "#94a3b8", letterSpacing: 0.5, marginBottom: 3 }}>{s.icon} {s.label.toUpperCase()}</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: "#0f172a" }}>{s.val}</div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
              {["All", ...DEPT_ORDER].map(d => (
                <button key={d} onClick={() => setFilterDept(d)} style={{
                  padding: "5px 14px", borderRadius: 20,
                  border: `1.5px solid ${filterDept === d ? DEPT_META[d]?.color || "#6366f1" : "#e2e8f0"}`,
                  background: filterDept === d ? (DEPT_META[d]?.bg || "#eff6ff") : "#fff",
                  color: filterDept === d ? (DEPT_META[d]?.color || "#6366f1") : "#64748b",
                  fontSize: 12, fontWeight: filterDept === d ? 700 : 400, cursor: "pointer", fontFamily: "inherit",
                }}>{d}</button>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(340px, 100%), 1fr))", gap: 12 }}>
              {filteredMarkets.map(m => (
                <MarketCard
                  key={m.id} market={m} bets={bets} currentUser={currentUser}
                  onBet={(market, dir) => { setBetMarket(market); setBetInitialDir(dir || "YES"); }}
                  onSell={setSellBet}
                  resolution={resolutions.find(r => r.market_id === m.id)}
                />
              ))}
            </div>
          </>
        )}

        {/* ── LEADERBOARD TAB ── */}
        {tab === "leaderboard" && (
          <div style={{ maxWidth: 640, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <div style={{ fontSize: 40 }}>🏆</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", marginTop: 6 }}>Leaderboard</div>
              <div style={{ color: "#64748b", fontSize: 13, marginTop: 4 }}>Rankings by portfolio value (balance + position value)</div>
            </div>
            {leaderboard.length === 0 ? (
              <div style={{ textAlign: "center", color: "#94a3b8", padding: 40 }}>No players yet!</div>
            ) : leaderboard.map((u, i) => (
              <div key={u.name} style={{
                background: i === 0 ? "linear-gradient(135deg, #fefce8, #f0fdf4)" : "#fff",
                border: `1px solid ${i === 0 ? "#fde047" : "#e2e8f0"}`,
                borderRadius: 14, padding: "16px 20px", marginBottom: 8,
                display: "flex", alignItems: "center", gap: 14,
                boxShadow: i === 0 ? "0 4px 16px rgba(234,179,8,0.1)" : "none",
              }}>
                <div style={{ fontSize: 22, width: 32, textAlign: "center", flexShrink: 0 }}>
                  {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : <span style={{ fontSize: 14, color: "#94a3b8", fontWeight: 600 }}>{i + 1}</span>}
                </div>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: u.name === currentUser.name ? "#6366f1" : "#0f172a" }}>
                    {u.name} {u.name === currentUser.name && <span style={{ fontSize: 11, color: "#6366f1" }}>(you)</span>}
                  </span>
                  <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 3 }}>
                    {u.betCount} positions · {u.staked.toLocaleString()} ◈ staked
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 20, fontWeight: 700, color: "#16a34a" }}>{u.portfolio.toLocaleString()}</div>
                  <div style={{ fontSize: 10, color: "#94a3b8" }}>◈ portfolio</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── MY BETS TAB ── */}
        {tab === "my bets" && (
          <div style={{ maxWidth: 700, margin: "0 auto" }}>
            {/* Portfolio summary */}
            <div style={{ display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap" }}>
              {[
                { label: "Balance", val: `${currentUser.tokens.toLocaleString()} ◈`, color: "#16a34a" },
                { label: "Positions value", val: `${myPosValue.toLocaleString()} ◈`, color: "#6366f1" },
                { label: "Unrealized P&L", val: `${myUnrealizedPnL >= 0 ? "+" : ""}${myUnrealizedPnL} ◈`, color: myUnrealizedPnL >= 0 ? "#16a34a" : "#dc2626" },
                { label: "Active bets", val: myActiveBets.length, color: "#0f172a" },
              ].map(s => (
                <div key={s.label} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "12px 18px", flex: 1, minWidth: 110 }}>
                  <div style={{ fontSize: 10, color: "#94a3b8", letterSpacing: 0.5 }}>{s.label.toUpperCase()}</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: s.color, marginTop: 2 }}>{s.val}</div>
                </div>
              ))}
            </div>

            {/* Active positions */}
            {myActiveBets.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#0f172a", marginBottom: 10, letterSpacing: 0.5 }}>ACTIVE POSITIONS</div>
                {myActiveBets.map((bet, i) => {
                  const market = MARKETS.find(m => m.id === bet.market_id);
                  if (!market) return null;
                  const currentPrice = getPrice(bets, bet.market_id, bet.direction);
                  const value = Math.round((bet.shares || 0) * currentPrice);
                  const pnl = value - bet.amount;
                  const pnlPct = bet.amount > 0 ? Math.round(pnl / bet.amount * 100) : 0;
                  const res = resolutions.find(r => r.market_id === bet.market_id);
                  return (
                    <div key={bet.id || i} style={{
                      background: "#fff", border: "1px solid #e2e8f0",
                      borderRadius: 12, padding: "14px 18px", marginBottom: 8,
                      display: "flex", alignItems: "center", gap: 14,
                    }}>
                      <span style={{ fontSize: 22, flexShrink: 0 }}>{market.emoji}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{market.label}</div>
                        <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
                          {Math.round(bet.shares || 0)} {bet.direction} shares @ {Math.round((bet.entry_price || 0.5) * 100)}% → now {Math.round(currentPrice * 100)}%
                        </div>
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: pnl >= 0 ? "#16a34a" : "#dc2626" }}>
                          {pnl >= 0 ? "+" : ""}{pnl} ◈ ({pnlPct >= 0 ? "+" : ""}{pnlPct}%)
                        </div>
                        <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>
                          {value} ◈ value
                        </div>
                      </div>
                      {!res && (
                        <button
                          onClick={() => setSellBet(bet)}
                          style={{
                            padding: "6px 14px", borderRadius: 8, border: "1px solid #e2e8f0",
                            background: "#f8fafc", color: "#64748b", fontSize: 11, fontWeight: 600,
                            cursor: "pointer", fontFamily: "inherit", flexShrink: 0,
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = "#fef2f2"; e.currentTarget.style.color = "#dc2626"; e.currentTarget.style.borderColor = "#fecaca"; }}
                          onMouseLeave={e => { e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.color = "#64748b"; e.currentTarget.style.borderColor = "#e2e8f0"; }}
                        >SELL</button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Sold positions */}
            {mySoldBets.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8", marginBottom: 10, letterSpacing: 0.5 }}>SOLD</div>
                {mySoldBets.map((bet, i) => {
                  const market = MARKETS.find(m => m.id === bet.market_id);
                  if (!market) return null;
                  return (
                    <div key={bet.id || i} style={{
                      background: "#f8fafc", border: "1px solid #e2e8f0",
                      borderRadius: 12, padding: "14px 18px", marginBottom: 8,
                      display: "flex", alignItems: "center", gap: 14, opacity: 0.7,
                    }}>
                      <span style={{ fontSize: 22, flexShrink: 0 }}>{market.emoji}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#64748b" }}>{market.label}</div>
                        <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
                          {Math.round(bet.shares || 0)} {bet.direction} shares @ {Math.round((bet.entry_price || 0.5) * 100)}%
                        </div>
                      </div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8" }}>SOLD</div>
                    </div>
                  );
                })}
              </div>
            )}

            {myActiveBets.length === 0 && mySoldBets.length === 0 && (
              <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, padding: 48, textAlign: "center", color: "#94a3b8" }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>🎲</div>
                No positions yet — go to Markets to start trading!
              </div>
            )}
          </div>
        )}

        {/* ── ADMIN TAB ── */}
        {tab === "admin" && isAdmin && (
          <AdminPanel bets={bets} resolutions={resolutions} onResolve={handleResolve} />
        )}
      </div>

      {/* Bet Modal */}
      {betMarket && (
        <BetModal
          market={betMarket} initialDir={betInitialDir} currentUser={currentUser} bets={bets}
          onConfirm={handleBet} onClose={() => setBetMarket(null)}
        />
      )}

      {/* Sell Modal */}
      {sellBet && (
        <SellModal
          bet={sellBet} bets={bets}
          onConfirm={handleSell} onClose={() => setSellBet(null)}
        />
      )}
    </div>
  );
}
