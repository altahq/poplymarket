import { useState, useEffect } from "react";

// ─── GOOGLE FONT ──────────────────────────────────────────────────────────────
const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href = "https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap";
document.head.appendChild(fontLink);

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const SEED = 100;
const INITIAL_TOKENS = 1000;

const BET_DATES = [
  { id: "mar20", label: "By March 20", short: "Mar 20", multiplier: 3.0, color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0", tag: "3× if YES" },
  { id: "mar25", label: "By March 25", short: "Mar 25", multiplier: 2.0, color: "#2563eb", bg: "#eff6ff", border: "#bfdbfe", tag: "2× if YES" },
  { id: "mar31", label: "By March 31", short: "Mar 31", multiplier: 1.5, color: "#7c3aed", bg: "#f5f3ff", border: "#ddd6fe", tag: "1.5× if YES" },
];

const MARKETS = [
  // Sales first, $800K first
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
  { id: "m4", dept: "Marketing", emoji: "🎬", label: "Brand Video by EOM", description: "Brand video launches by end of March" },
  // CX
  { id: "c1", dept: "CX", emoji: "🛡️", label: "Less Than 7 Churns", description: "Churn stays below 7 customers in March" },
  { id: "c2", dept: "CX", emoji: "⚡", label: "<20 Min Response Time", description: "Median response time under 20 minutes" },
  { id: "c3", dept: "CX", emoji: "🎓", label: "Katie Academy Launched", description: "CS onboarding project goes live" },
  // Operations
  { id: "o1", dept: "Operations", emoji: "👥", label: "3 Key Hires Done", description: "People Ops, CS US & IL, Sales IL all hired" },
  { id: "o2", dept: "Operations", emoji: "💳", label: "100% March Collections", description: "100% collection from all March customers" },
  { id: "o3", dept: "Operations", emoji: "🏢", label: "New Office Secured", description: "New office / extra space confirmed" },
  { id: "o4", dept: "Operations", emoji: "💻", label: "20% Software Cost Cut", description: "Software costs reduced by 20%" },
  // Builders
  { id: "b1", dept: "Builders", emoji: "🏗️", label: "Alta 2.0 Chat Live", description: "Alta 2.0 Advise & Build chat shipped" },
  { id: "b2", dept: "Builders", emoji: "⚙️", label: "Trigger-Based Actions", description: "Trigger based action system complete" },
  { id: "b3", dept: "Builders", emoji: "🔗", label: "LinkedIn Comment+InMail", description: "LinkedIn actions (comment + inmail) shipped" },
  // AI Engineers
  { id: "a1", dept: "AI Engineers", emoji: "🤖", label: "Vetric: 40% Call Coverage", description: "Vetric replacement handles 40% of calls" },
  { id: "a2", dept: "AI Engineers", emoji: "📆", label: "Alta Calendar: 5 Customers", description: "Alta calendar adopted by 5 customers" },
  { id: "a3", dept: "AI Engineers", emoji: "🗃️", label: "Knowledge-Desk Live", description: "Knowledge-desk with all Alta knowledge launched" },
  // Design
  { id: "d1", dept: "Design", emoji: "🎨", label: "2.0 Brand Assets Done", description: "Website, LPs, videos all updated for 2.0 brand" },
  { id: "d2", dept: "Design", emoji: "🤝", label: "Freelancers Hired", description: "Freelancers onboarded for design work" },
  // Partnership
  { id: "p1", dept: "Partnership", emoji: "🚀", label: "Anthropic Partner Launch", description: "Partner launch with Anthropic + joint GTM plan" },
  { id: "p2", dept: "Partnership", emoji: "💵", label: "Interest Income >$20K", description: "Interest income exceeds $20K" },
];

const DEPT_META = {
  Sales:       { color: "#1d4ed8", bg: "#eff6ff" },
  Marketing:   { color: "#be123c", bg: "#fff1f2" },
  CX:          { color: "#be185d", bg: "#fdf2f8" },
  Operations:  { color: "#b45309", bg: "#fffbeb" },
  Builders:    { color: "#b91c1c", bg: "#fef2f2" },
  "AI Engineers": { color: "#15803d", bg: "#f0fdf4" },
  Design:      { color: "#6d28d9", bg: "#f5f3ff" },
  Partnership: { color: "#0369a1", bg: "#f0f9ff" },
};

const DEPT_ORDER = ["Sales", "Marketing", "CX", "Operations", "Builders", "AI Engineers", "Design", "Partnership"];

// ─── STATS HELPERS ────────────────────────────────────────────────────────────

function getProb(bets, marketId) {
  const mb = bets.filter(b => b.marketId === marketId);
  const yes = SEED + mb.filter(b => b.dir === "YES").reduce((s, b) => s + b.amount, 0);
  const no  = SEED + mb.filter(b => b.dir === "NO").reduce((s, b) => s + b.amount, 0);
  return Math.round(yes / (yes + no) * 100);
}

function getMarketStats(bets, marketId) {
  const mb = bets.filter(b => b.marketId === marketId);
  const traders = new Set(mb.map(b => b.userId)).size;
  const totalVol = mb.reduce((s, b) => s + b.amount, 0);
  const yesBets  = mb.filter(b => b.dir === "YES");
  const yesVol   = yesBets.reduce((s, b) => s + b.amount, 0);
  const topPct   = yesVol > 0 ? Math.round(Math.max(...yesBets.map(b => b.amount), 0) / yesVol * 100) : null;
  const timestamps = mb.map(b => b.ts).filter(Boolean);
  const lastTs   = timestamps.length ? Math.max(...timestamps) : null;
  let state;
  if (traders === 0) state = "no_liquidity";
  else if (traders < 3 || totalVol < 100) state = "low_liquidity";
  else state = "healthy";
  // sparkline
  const sorted = [...mb].sort((a, b) => (a.ts || 0) - (b.ts || 0));
  let yA = SEED, nA = SEED;
  const hist = [50];
  sorted.forEach(b => { if (b.dir === "YES") yA += b.amount; else nA += b.amount; hist.push(Math.round(yA/(yA+nA)*100)); });
  return { traders, totalVol, topPct, lastTs, state, hist };
}

function formatAgo(ts) {
  if (!ts) return null;
  const d = Date.now() - ts, m = Math.floor(d/60000), h = Math.floor(d/3600000), dy = Math.floor(d/86400000);
  if (m < 1) return "just now"; if (m < 60) return `${m}m ago`; if (h < 24) return `${h}h ago`; return `${dy}d ago`;
}

function getUserStats(bets, users, userName) {
  const ub = bets.filter(b => b.userId === userName);
  const staked = ub.reduce((s, b) => s + b.amount, 0);
  const user = users.find(u => u.name === userName);
  const byDept = {};
  ub.forEach(b => { const m = MARKETS.find(x => x.id === b.marketId); if (m) byDept[m.dept] = (byDept[m.dept] || 0) + b.amount; });
  return { staked, remaining: user?.tokens ?? 0, betCount: ub.length, byDept };
}

// ─── SPARKLINE ────────────────────────────────────────────────────────────────

function Sparkline({ data, width = 72, height = 24 }) {
  if (!data || data.length < 2) return (
    <span style={{ display: "inline-block", width, height, fontSize: 10, color: "#94a3b8", lineHeight: `${height}px` }}>—</span>
  );
  const mn = Math.min(...data), mx = Math.max(...data), rng = mx - mn || 1;
  const pts = data.map((v, i) => `${(i/(data.length-1))*width},${height - ((v-mn)/rng*(height-4)+2)}`).join(" ");
  const last = data[data.length - 1];
  const strokeColor = last >= 50 ? "#16a34a" : "#dc2626";
  return (
    <svg width={width} height={height} style={{ display: "block", overflow: "visible" }}>
      <polyline fill="none" stroke={strokeColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" points={pts} />
    </svg>
  );
}

// ─── STATS LINE ───────────────────────────────────────────────────────────────

function StatsLine({ stats, prob }) {
  const { state, traders, totalVol, topPct, lastTs, hist } = stats;
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
        {topPct !== null && ` · Top pos ${topPct}%`}
        {ago && ` · ${ago}`}
      </span>
    </div>
  );
}

// ─── MARKET CARD ──────────────────────────────────────────────────────────────

function MarketCard({ market, bets, currentUser, onBet }) {
  const prob = getProb(bets, market.id);
  const stats = getMarketStats(bets, market.id);
  const myBet = bets.find(b => b.userId === currentUser?.name && b.marketId === market.id);
  const meta = DEPT_META[market.dept];
  const dateInfo = myBet?.betDate ? BET_DATES.find(d => d.id === myBet.betDate) : null;

  return (
    <div
      onClick={() => !myBet && onBet(market)}
      style={{
        background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14,
        padding: "18px 20px", cursor: myBet ? "default" : "pointer",
        transition: "box-shadow 0.15s, border-color 0.15s",
        display: "flex", flexDirection: "column", gap: 12,
      }}
      onMouseEnter={e => { if (!myBet) { e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)"; e.currentTarget.style.borderColor = "#c7d2fe"; } }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = "#e2e8f0"; }}
    >
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
          {myBet && (
            <span style={{
              fontSize: 10, fontWeight: 600,
              color: myBet.dir === "YES" ? "#16a34a" : "#dc2626",
              background: myBet.dir === "YES" ? "#f0fdf4" : "#fef2f2",
              border: `1px solid ${myBet.dir === "YES" ? "#bbf7d0" : "#fecaca"}`,
              padding: "2px 8px", borderRadius: 20, whiteSpace: "nowrap",
            }}>
              YOUR BET: {myBet.dir} {dateInfo ? `(${dateInfo.short})` : ""} · {myBet.amount} ◈
            </span>
          )}
        </div>
      </div>

      {/* Probability bar */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#16a34a" }}>YES {prob}%</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#dc2626" }}>NO {100-prob}%</span>
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

      {/* CTA */}
      {!myBet && (
        <div style={{ display: "flex", gap: 8, marginTop: 2 }}>
          <button style={{
            flex: 1, padding: "8px 0", borderRadius: 8, border: "1px solid #bbf7d0",
            background: "#f0fdf4", color: "#16a34a", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
          }}>YES ↑</button>
          <button style={{
            flex: 1, padding: "8px 0", borderRadius: 8, border: "1px solid #fecaca",
            background: "#fef2f2", color: "#dc2626", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
          }}>NO ↓</button>
        </div>
      )}
    </div>
  );
}

// ─── BET MODAL ────────────────────────────────────────────────────────────────

function BetModal({ market, currentUser, bets, onConfirm, onClose }) {
  const [dir, setDir] = useState("YES");
  const [betDate, setBetDate] = useState("mar31");
  const [amount, setAmount] = useState(50);
  const [submitting, setSubmitting] = useState(false);

  const prob = getProb(bets, market.id);
  const selectedDate = BET_DATES.find(d => d.id === betDate);
  const multiplier = dir === "YES" ? selectedDate?.multiplier : 1.5;
  const potentialWin = Math.round(amount * multiplier);

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)", backdropFilter: "blur(6px)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 20,
    }} onClick={onClose}>
      <div style={{
        background: "#fff", borderRadius: 20, padding: 28, maxWidth: 440, width: "100%",
        boxShadow: "0 24px 48px rgba(0,0,0,0.15)",
      }} onClick={e => e.stopPropagation()}>

        {/* Market title */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <span style={{ fontSize: 28 }}>{market.emoji}</span>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#0f172a" }}>{market.label}</div>
            <div style={{ fontSize: 11, color: "#94a3b8" }}>{market.description}</div>
          </div>
        </div>

        {/* Odds display */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          <div style={{ flex: 1, background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: "10px 12px", textAlign: "center" }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#16a34a" }}>{prob}%</div>
            <div style={{ fontSize: 10, color: "#4ade80", marginTop: 1 }}>YES (crowd)</div>
          </div>
          <div style={{ flex: 1, background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "10px 12px", textAlign: "center" }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#dc2626" }}>{100-prob}%</div>
            <div style={{ fontSize: 10, color: "#f87171", marginTop: 1 }}>NO (crowd)</div>
          </div>
        </div>

        {/* Direction */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#64748b", letterSpacing: 0.8, marginBottom: 8 }}>YOUR PREDICTION</div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setDir("YES")} style={{
              flex: 1, padding: "11px", borderRadius: 10, border: `2px solid ${dir === "YES" ? "#16a34a" : "#e2e8f0"}`,
              background: dir === "YES" ? "#f0fdf4" : "#fff", color: dir === "YES" ? "#16a34a" : "#64748b",
              fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
            }}>✅ YES</button>
            <button onClick={() => setDir("NO")} style={{
              flex: 1, padding: "11px", borderRadius: 10, border: `2px solid ${dir === "NO" ? "#dc2626" : "#e2e8f0"}`,
              background: dir === "NO" ? "#fef2f2" : "#fff", color: dir === "NO" ? "#dc2626" : "#64748b",
              fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
            }}>❌ NO</button>
          </div>
        </div>

        {/* Date picker (YES only) */}
        {dir === "YES" && (
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#64748b", letterSpacing: 0.8, marginBottom: 8 }}>WHEN? (earlier = higher reward)</div>
            <div style={{ display: "flex", gap: 6 }}>
              {BET_DATES.map(d => (
                <button key={d.id} onClick={() => setBetDate(d.id)} style={{
                  flex: 1, padding: "10px 6px", borderRadius: 10, border: `2px solid ${betDate === d.id ? d.color : "#e2e8f0"}`,
                  background: betDate === d.id ? d.bg : "#fff", cursor: "pointer", fontFamily: "inherit",
                  transition: "all 0.15s",
                }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: betDate === d.id ? d.color : "#64748b" }}>{d.short}</div>
                  <div style={{ fontSize: 10, fontWeight: 600, color: betDate === d.id ? d.color : "#94a3b8", marginTop: 2 }}>{d.tag}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {dir === "NO" && (
          <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: "10px 14px", marginBottom: 18, display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 12, color: "#64748b" }}>NO = goal not hit by Mar 31</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#dc2626" }}>1.5× payout</span>
          </div>
        )}

        {/* Amount */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#64748b", letterSpacing: 0.8 }}>AMOUNT (◈)</div>
            <div style={{ fontSize: 11, color: "#94a3b8" }}>Balance: {currentUser.tokens.toLocaleString()} ◈</div>
          </div>
          <input
            type="number" value={amount} onChange={e => setAmount(Math.min(parseInt(e.target.value)||0, currentUser.tokens))}
            min={1} max={currentUser.tokens}
            style={{
              width: "100%", padding: "12px 14px", borderRadius: 10, border: "1.5px solid #e2e8f0",
              fontSize: 18, fontWeight: 700, color: "#0f172a", fontFamily: "inherit",
              outline: "none", boxSizing: "border-box", background: "#f8fafc",
            }}
            onFocus={e => e.target.style.borderColor = "#6366f1"}
            onBlur={e => e.target.style.borderColor = "#e2e8f0"}
          />
          <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
            {[50, 100, 250, 500].map(v => (
              <button key={v} onClick={() => setAmount(Math.min(v, currentUser.tokens))} style={{
                flex: 1, padding: "6px 0", borderRadius: 8, border: "1px solid #e2e8f0",
                background: "#f8fafc", color: "#64748b", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
              }}>{v}</button>
            ))}
            <button onClick={() => setAmount(currentUser.tokens)} style={{
              flex: 1, padding: "6px 0", borderRadius: 8, border: "1px solid #e2e8f0",
              background: "#f8fafc", color: "#64748b", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
            }}>MAX</button>
          </div>
        </div>

        {/* Potential win */}
        <div style={{
          background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10,
          padding: "10px 16px", marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <span style={{ fontSize: 12, color: "#64748b" }}>If correct you win</span>
          <span style={{ fontSize: 16, fontWeight: 700, color: "#16a34a" }}>+{potentialWin} ◈ <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 400 }}>({multiplier}×)</span></span>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onClose} style={{
            flex: 1, padding: "13px", borderRadius: 10, border: "1.5px solid #e2e8f0",
            background: "#fff", color: "#64748b", fontWeight: 600, fontSize: 14, cursor: "pointer", fontFamily: "inherit",
          }}>Cancel</button>
          <button onClick={async () => {
            if (amount <= 0 || amount > currentUser.tokens || submitting) return;
            setSubmitting(true);
            await onConfirm({ dir, betDate: dir === "YES" ? betDate : null, multiplier, amount });
            setSubmitting(false);
          }} style={{
            flex: 2, padding: "13px", borderRadius: 10, border: "none", cursor: submitting ? "not-allowed" : "pointer",
            fontFamily: "inherit", fontWeight: 700, fontSize: 14, opacity: submitting ? 0.7 : 1,
            background: dir === "YES" ? "#16a34a" : "#dc2626", color: "#fff",
          }}>
            {submitting ? "Placing..." : `Bet ${amount} ◈ on ${dir} ${dir === "YES" && selectedDate ? `(${selectedDate.short})` : ""} →`}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────

export default function Poplymarket() {
  const [users, setUsers] = useState([]);
  const [bets, setBets] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [nameInput, setNameInput] = useState("");
  const [betMarket, setBetMarket] = useState(null);
  const [tab, setTab] = useState("markets");
  const [filterDept, setFilterDept] = useState("All");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => { loadData(); }, []);

  const showToast = (msg, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  const loadData = async () => {
    try {
      const [ur, br] = await Promise.all([window.storage.get("pm2-users"), window.storage.get("pm2-bets")]);
      const loadedUsers = ur ? JSON.parse(ur.value) : [];
      const loadedBets  = br ? JSON.parse(br.value) : [];
      setUsers(loadedUsers);
      setBets(loadedBets);
      const saved = sessionStorage.getItem("pm2-user");
      if (saved) { const found = loadedUsers.find(u => u.name === saved); if (found) setCurrentUser(found); }
    } catch (e) {}
    setLoading(false);
  };

  const save = async (u, b) => {
    try { await Promise.all([window.storage.set("pm2-users", JSON.stringify(u)), window.storage.set("pm2-bets", JSON.stringify(b))]); } catch (e) {}
  };

  const handleJoin = async () => {
    if (!nameInput.trim()) return;
    const name = nameInput.trim();
    const existing = users.find(u => u.name.toLowerCase() === name.toLowerCase());
    if (existing) { setCurrentUser(existing); sessionStorage.setItem("pm2-user", existing.name); showToast(`Welcome back, ${existing.name}! 👋`); return; }
    const nu = { name, tokens: INITIAL_TOKENS, joinedAt: Date.now() };
    const newUsers = [...users, nu];
    setUsers(newUsers); setCurrentUser(nu); sessionStorage.setItem("pm2-user", name);
    await save(newUsers, bets);
    showToast(`Welcome, ${name}! 🎯 1,000 tokens loaded`);
  };

  const handleBet = async ({ dir, betDate, multiplier, amount }) => {
    const newBet = { id: Date.now(), userId: currentUser.name, marketId: betMarket.id, dir, betDate, multiplier, amount, ts: Date.now() };
    const updatedUser = { ...currentUser, tokens: currentUser.tokens - amount };
    const newBets  = [...bets, newBet];
    const newUsers = users.map(u => u.name === currentUser.name ? updatedUser : u);
    setBets(newBets); setUsers(newUsers); setCurrentUser(updatedUser);
    await save(newUsers, newBets);
    setBetMarket(null);
    const dateInfo = betDate ? BET_DATES.find(d => d.id === betDate) : null;
    showToast(`${amount} ◈ on ${dir}${dateInfo ? ` by ${dateInfo.short}` : ""} — potential ${Math.round(amount * multiplier)} ◈ back 🎯`);
  };

  const filteredMarkets = filterDept === "All" ? MARKETS : MARKETS.filter(m => m.dept === filterDept);

  const totalStaked = bets.reduce((s, b) => s + b.amount, 0);

  // Leaderboard
  const leaderboard = [...users].sort((a, b) => b.tokens - a.tokens).map((u, i) => ({
    ...u, rank: i + 1,
    betCount: bets.filter(b => b.userId === u.name).length,
    staked: bets.filter(b => b.userId === u.name).reduce((s, b) => s + b.amount, 0),
    badges: [
      bets.filter(b => b.userId === u.name).length >= 10 ? "🎯 Diversified" : null,
      bets.filter(b => b.userId === u.name && b.betDate === "mar20").length > 0 ? "⚡ Risk Taker" : null,
      bets.filter(b => b.userId === u.name && b.dir === "NO").length > 0 ? "🐻 Bear" : null,
    ].filter(Boolean),
  }));

  const userStats = currentUser ? getUserStats(bets, users, currentUser.name) : null;

  if (loading) return (
    <div style={{ background: "#f8fafc", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "DM Sans, sans-serif" }}>
      <div style={{ color: "#6366f1", fontSize: 16, fontWeight: 500 }}>Loading Poplymarket...</div>
    </div>
  );

  // ── LOGIN ──
  if (!currentUser) return (
    <div style={{
      background: "linear-gradient(135deg, #f8fafc 0%, #eff6ff 50%, #f5f3ff 100%)",
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "DM Sans, sans-serif", padding: "20px",
    }}>
      <div style={{ maxWidth: 420, width: "100%", textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>🎯</div>
        <div style={{ fontSize: 40, fontWeight: 800, letterSpacing: "-1.5px", color: "#0f172a", marginBottom: 4 }}>
          Poply<span style={{ color: "#6366f1" }}>market</span>
        </div>
        <div style={{ color: "#64748b", fontSize: 14, marginBottom: 40 }}>Alta's March 2026 Prediction Market</div>

        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 20, padding: 32, boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#64748b", letterSpacing: 0.8, marginBottom: 8, textAlign: "left" }}>YOUR NAME</div>
          <input
            value={nameInput} onChange={e => setNameInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleJoin()}
            placeholder="Enter your full name..."
            style={{
              width: "100%", padding: "13px 16px", borderRadius: 12, border: "1.5px solid #e2e8f0",
              fontSize: 15, fontFamily: "inherit", outline: "none", boxSizing: "border-box", marginBottom: 16,
              color: "#0f172a", background: "#f8fafc",
            }}
            onFocus={e => e.target.style.borderColor = "#6366f1"}
            onBlur={e => e.target.style.borderColor = "#e2e8f0"}
          />
          <button onClick={handleJoin} style={{
            width: "100%", padding: "14px", borderRadius: 12, border: "none",
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "#fff",
            fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
          }}>Enter the Market →</button>
          <div style={{ color: "#94a3b8", fontSize: 12, marginTop: 14 }}>
            Every employee starts with <strong style={{ color: "#6366f1" }}>1,000 ◈ Alta tokens</strong>
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
  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh", fontFamily: "DM Sans, sans-serif" }}>

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", top: 16, right: 16, zIndex: 9999,
          background: "#fff", border: `1px solid ${toast.type === "error" ? "#fecaca" : "#bbf7d0"}`,
          borderLeft: `4px solid ${toast.type === "error" ? "#dc2626" : "#16a34a"}`,
          boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
          padding: "12px 16px", borderRadius: 10, fontSize: 13, fontWeight: 500, color: "#0f172a", maxWidth: 320,
        }}>{toast.msg}</div>
      )}

      {/* Header */}
      <div style={{
        background: "#fff", borderBottom: "1px solid #e2e8f0", padding: "0 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between", height: 56,
        position: "sticky", top: 0, zIndex: 100,
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
            {currentUser.name}
          </div>
          <button onClick={() => { setCurrentUser(null); sessionStorage.removeItem("pm2-user"); }} style={{
            background: "transparent", border: "1px solid #e2e8f0", borderRadius: 8,
            padding: "5px 10px", color: "#94a3b8", fontSize: 12, cursor: "pointer", fontFamily: "inherit",
          }}>← Out</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e2e8f0", padding: "0 24px", display: "flex", gap: 0 }}>
        {[["markets", "📊 Markets"], ["leaderboard", "🏆 Leaderboard"], ["my bets", "🎲 My Bets"]].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} style={{
            background: "transparent", border: "none",
            borderBottom: tab === key ? "2px solid #6366f1" : "2px solid transparent",
            color: tab === key ? "#6366f1" : "#64748b", padding: "14px 16px", fontSize: 13,
            fontWeight: tab === key ? 700 : 500, cursor: "pointer", fontFamily: "inherit", marginBottom: -1,
          }}>{label}</button>
        ))}
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", alignItems: "center", fontSize: 11, color: "#94a3b8" }}>
          🔄 Updated weekly at All-Hands
        </div>
      </div>

      <div style={{ maxWidth: 1120, margin: "0 auto", padding: "24px 20px" }}>

        {/* ── MARKETS TAB ── */}
        {tab === "markets" && (
          <>
            {/* Stats bar */}
            <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
              {[
                { label: "Markets", val: MARKETS.length, icon: "📊" },
                { label: "Bets placed", val: bets.length, icon: "🎯" },
                { label: "Players", val: users.length, icon: "👥" },
                { label: "Tokens staked", val: `${totalStaked.toLocaleString()} ◈`, icon: "💰" },
              ].map(s => (
                <div key={s.label} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "12px 18px", flex: 1, minWidth: 120 }}>
                  <div style={{ fontSize: 10, color: "#94a3b8", letterSpacing: 0.5, marginBottom: 3 }}>{s.icon} {s.label.toUpperCase()}</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: "#0f172a" }}>{s.val}</div>
                </div>
              ))}
            </div>

            {/* Dept filter */}
            <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
              {["All", ...DEPT_ORDER].map(d => (
                <button key={d} onClick={() => setFilterDept(d)} style={{
                  padding: "5px 14px", borderRadius: 20, border: `1.5px solid ${filterDept === d ? DEPT_META[d]?.color || "#6366f1" : "#e2e8f0"}`,
                  background: filterDept === d ? (DEPT_META[d]?.bg || "#eff6ff") : "#fff",
                  color: filterDept === d ? (DEPT_META[d]?.color || "#6366f1") : "#64748b",
                  fontSize: 12, fontWeight: filterDept === d ? 700 : 400, cursor: "pointer", fontFamily: "inherit",
                }}>{d}</button>
              ))}
            </div>

            {/* Cards grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 12 }}>
              {filteredMarkets.map(m => (
                <MarketCard key={m.id} market={m} bets={bets} currentUser={currentUser} onBet={setBetMarket} />
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
              <div style={{ color: "#64748b", fontSize: 13, marginTop: 4 }}>Rankings reset when markets resolve end of March</div>
            </div>

            {leaderboard.length === 0 ? (
              <div style={{ textAlign: "center", color: "#94a3b8", padding: 40 }}>No players yet</div>
            ) : leaderboard.map((u, i) => (
              <div key={u.name} style={{
                background: i === 0 ? "linear-gradient(135deg, #fefce8, #f0fdf4)" : "#fff",
                border: `1px solid ${i === 0 ? "#fde047" : "#e2e8f0"}`,
                borderRadius: 14, padding: "16px 20px", marginBottom: 8,
                display: "flex", alignItems: "center", gap: 14,
                boxShadow: i === 0 ? "0 4px 16px rgba(234,179,8,0.1)" : "none",
              }}>
                <div style={{ fontSize: 22, width: 32, textAlign: "center", flexShrink: 0 }}>
                  {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : <span style={{ fontSize: 14, color: "#94a3b8", fontWeight: 600 }}>{i+1}</span>}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: u.name === currentUser.name ? "#6366f1" : "#0f172a" }}>
                      {u.name} {u.name === currentUser.name && <span style={{ fontSize: 11, color: "#6366f1" }}>(you)</span>}
                    </span>
                    {u.badges.map(b => <span key={b} style={{ fontSize: 10, background: "#f1f5f9", borderRadius: 20, padding: "2px 8px", color: "#475569" }}>{b}</span>)}
                  </div>
                  <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 3 }}>
                    {u.betCount} bets · {u.staked.toLocaleString()} ◈ staked
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 20, fontWeight: 700, color: "#16a34a" }}>{u.tokens.toLocaleString()}</div>
                  <div style={{ fontSize: 10, color: "#94a3b8" }}>◈ remaining</div>
                </div>
              </div>
            ))}

            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, padding: 20, marginTop: 20, textAlign: "center" }}>
              <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.8 }}>
                🏁 Markets resolve end of March 2026<br/>
                Correct bets pay out their multiplier<br/>
                Best prediction accuracy wins 🎖️
              </div>
            </div>
          </div>
        )}

        {/* ── MY BETS TAB ── */}
        {tab === "my bets" && userStats && (
          <div style={{ maxWidth: 700, margin: "0 auto" }}>
            {/* Personal stats cards */}
            <div style={{ display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap" }}>
              {[
                { label: "Balance", val: `${currentUser.tokens.toLocaleString()} ◈`, color: "#16a34a" },
                { label: "Staked", val: `${userStats.staked.toLocaleString()} ◈`, color: "#6366f1" },
                { label: "Bets", val: userStats.betCount, color: "#0f172a" },
                { label: "Markets left", val: MARKETS.length - userStats.betCount, color: "#f59e0b" },
              ].map(s => (
                <div key={s.label} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "12px 18px", flex: 1, minWidth: 110 }}>
                  <div style={{ fontSize: 10, color: "#94a3b8", letterSpacing: 0.5 }}>{s.label.toUpperCase()}</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: s.color, marginTop: 2 }}>{s.val}</div>
                </div>
              ))}
            </div>

            {/* Exposure by dept */}
            {Object.keys(userStats.byDept).length > 0 && (
              <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, padding: 20, marginBottom: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#0f172a", marginBottom: 14 }}>Exposure by Department</div>
                {Object.entries(userStats.byDept).sort((a,b) => b[1]-a[1]).map(([dept, amt]) => {
                  const meta = DEPT_META[dept];
                  const pct = Math.round(amt / userStats.staked * 100);
                  return (
                    <div key={dept} style={{ marginBottom: 8 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontSize: 12, color: meta?.color || "#64748b", fontWeight: 600 }}>{dept}</span>
                        <span style={{ fontSize: 12, color: "#64748b" }}>{amt} ◈ ({pct}%)</span>
                      </div>
                      <div style={{ height: 4, background: "#f1f5f9", borderRadius: 99 }}>
                        <div style={{ height: "100%", width: `${pct}%`, background: meta?.color || "#6366f1", borderRadius: 99 }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Bet list */}
            {bets.filter(b => b.userId === currentUser.name).length === 0 ? (
              <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, padding: 48, textAlign: "center", color: "#94a3b8" }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>🎲</div>
                No bets yet — go to Markets to start!
              </div>
            ) : (
              bets.filter(b => b.userId === currentUser.name).map((bet, i) => {
                const market = MARKETS.find(m => m.id === bet.marketId);
                if (!market) return null;
                const dateInfo = bet.betDate ? BET_DATES.find(d => d.id === bet.betDate) : null;
                const potWin = Math.round(bet.amount * (bet.multiplier || 1.5));
                return (
                  <div key={i} style={{
                    background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12,
                    padding: "14px 18px", marginBottom: 8,
                    display: "flex", alignItems: "center", gap: 14,
                  }}>
                    <span style={{ fontSize: 22, flexShrink: 0 }}>{market.emoji}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{market.label}</div>
                      <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
                        {market.dept} {dateInfo ? `· ${dateInfo.short}` : ""}
                      </div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{
                        fontSize: 13, fontWeight: 700,
                        color: bet.dir === "YES" ? "#16a34a" : "#dc2626",
                      }}>{bet.dir} {bet.amount} ◈</div>
                      <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>
                        win {potWin} ◈ ({bet.multiplier || 1.5}×)
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Bet Modal */}
      {betMarket && (
        <BetModal
          market={betMarket}
          currentUser={currentUser}
          bets={bets}
          onConfirm={handleBet}
          onClose={() => setBetMarket(null)}
        />
      )}
    </div>
  );
}
