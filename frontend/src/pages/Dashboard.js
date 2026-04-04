import React, { useEffect, useState } from "react";
import { Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { getAnalytics } from "../api";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

// ─── INJECT FONTS + KEYFRAMES ──────────────────────────────────────────────
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@400;500&family=DM+Sans:wght@300;400;500&display=swap');

    * { box-sizing: border-box; }

    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(18px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes shimmer {
      0%   { background-position: -200% center; }
      100% { background-position: 200% center; }
    }
    @keyframes pulse-ring {
      0%   { box-shadow: 0 0 0 0 rgba(245,158,11,0.35); }
      70%  { box-shadow: 0 0 0 10px rgba(245,158,11,0); }
      100% { box-shadow: 0 0 0 0 rgba(245,158,11,0); }
    }
    @keyframes spin {
      from { transform: rotate(0deg); }
      to   { transform: rotate(360deg); }
    }
    @keyframes barGrow {
      from { width: 0%; }
      to   { width: var(--bar-w); }
    }

    .dash-kpi-card { animation: fadeUp 0.5s ease both; }
    .dash-kpi-card:hover .kpi-icon { animation: pulse-ring 1.2s ease-out infinite; }
    .dash-kpi-card:hover { transform: translateY(-4px) !important; }
    .dash-chart-card { animation: fadeUp 0.6s ease both; }
    .dash-section { animation: fadeUp 0.7s ease both; }

    .bar-fill {
      width: 0%;
      animation: barGrow 0.9s cubic-bezier(0.22,1,0.36,1) forwards;
      animation-delay: 0.4s;
    }

    .shimmer-text {
      background: linear-gradient(90deg, #f59e0b 0%, #fcd34d 40%, #f59e0b 60%, #d97706 100%);
      background-size: 200% auto;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      animation: shimmer 3s linear infinite;
    }

    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: #0f1117; }
    ::-webkit-scrollbar-thumb { background: #2a2d3a; border-radius: 3px; }
  `}</style>
);

// ─── TOKENS ──────────────────────────────────────────────────────────────────
const T = {
  bg:          "#0b0d14",
  surface:     "#10131e",
  surfaceHigh: "#181c2c",
  border:      "rgba(255,255,255,0.07)",
  borderHover: "rgba(245,158,11,0.4)",
  amber:       "#f59e0b",
  amberLight:  "#fcd34d",
  amberDim:    "rgba(245,158,11,0.12)",
  teal:        "#2dd4bf",
  tealDim:     "rgba(45,212,191,0.12)",
  red:         "#f87171",
  redDim:      "rgba(248,113,113,0.12)",
  green:       "#4ade80",
  greenDim:    "rgba(74,222,128,0.12)",
  text:        "#f1f5f9",
  textMuted:   "#64748b",
  textSub:     "#94a3b8",
  fontHead:    "'Syne', sans-serif",
  fontBody:    "'DM Sans', sans-serif",
  fontMono:    "'DM Mono', monospace",
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const card = (extra = {}) => ({
  background: T.surface,
  border: `1px solid ${T.border}`,
  borderRadius: 16,
  padding: "24px",
  transition: "transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease",
  ...extra,
});

const StatusDot = ({ color }) => (
  <span style={{
    display: "inline-block", width: 8, height: 8, borderRadius: "50%",
    background: color, boxShadow: `0 0 8px ${color}`, marginRight: 6,
  }} />
);

// ─── KPI CARD ──────────────────────────────────────────────────────────────
const KpiCard = ({ label, value, sub, accent, icon, delay = 0 }) => {
  const [hover, setHover] = useState(false);
  return (
    <div
      className="dash-kpi-card"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        ...card(),
        animationDelay: `${delay}s`,
        transform: hover ? "translateY(-4px)" : "none",
        borderColor: hover ? accent + "66" : T.border,
        boxShadow: hover ? `0 20px 40px rgba(0,0,0,0.4), 0 0 0 1px ${accent}33` : "none",
        cursor: "default",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* accent glow blob */}
      <div style={{
        position: "absolute", top: -30, right: -30, width: 100, height: 100,
        borderRadius: "50%", background: accent, opacity: 0.06, filter: "blur(30px)",
        transition: "opacity 0.3s", ...(hover && { opacity: 0.15 }),
      }} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <p style={{
            fontFamily: T.fontBody, fontSize: 12, fontWeight: 500,
            color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.1em",
            margin: "0 0 10px",
          }}>{label}</p>
          <p style={{
            fontFamily: T.fontMono, fontSize: 36, fontWeight: 500,
            color: T.text, margin: "0 0 6px", lineHeight: 1,
          }}>{value}</p>
          {sub && (
            <p style={{ fontFamily: T.fontBody, fontSize: 12, color: T.textMuted, margin: 0 }}>
              {sub}
            </p>
          )}
        </div>
        <div
          className="kpi-icon"
          style={{
            width: 44, height: 44, borderRadius: 12,
            background: accent + "1a",
            border: `1px solid ${accent}33`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 20, flexShrink: 0,
          }}
        >
          {icon}
        </div>
      </div>

      {/* bottom accent line */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg, transparent, ${accent}66, transparent)`,
        opacity: hover ? 1 : 0, transition: "opacity 0.3s",
      }} />
    </div>
  );
};

// ─── SECTION HEADER ────────────────────────────────────────────────────────
// ─── ANIMATED CATEGORY BAR ──────────────────────────────────────────────────
const CategoryBar = ({ label, count, max, color, delay }) => {
  const pct = Math.round((count / max) * 100);
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
        <span style={{ fontFamily: T.fontBody, fontSize: 13, color: T.textSub }}>{label}</span>
        <span style={{ fontFamily: T.fontMono, fontSize: 12, color }}>
          {count} tickets
        </span>
      </div>
      <div style={{ height: 5, borderRadius: 99, background: T.surfaceHigh, overflow: "hidden" }}>
        <div
          className="bar-fill"
          style={{
            "--bar-w": `${pct}%`,
            height: "100%", borderRadius: 99,
            background: `linear-gradient(90deg, ${color}, ${color}aa)`,
            animationDelay: `${delay}s`,
          }}
        />
      </div>
    </div>
  );
};

// ─── ACTIVITY ITEM ──────────────────────────────────────────────────────────
const ActivityItem = ({ id, action, time, index }) => (
  <div style={{
    display: "flex", gap: 14, padding: "12px 0",
    borderBottom: `1px solid ${T.border}`,
    animation: `fadeUp 0.4s ease both`, animationDelay: `${0.05 * index}s`,
  }}>
    <div style={{
      width: 36, height: 36, borderRadius: 10, flexShrink: 0,
      background: T.amberDim, border: `1px solid ${T.amber}22`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: T.fontMono, fontSize: 11, color: T.amber, fontWeight: 500,
    }}>
      #{id}
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <p style={{
        fontFamily: T.fontBody, fontSize: 13, color: T.textSub, margin: "0 0 2px",
        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
      }}>{action}</p>
      <p style={{ fontFamily: T.fontMono, fontSize: 11, color: T.textMuted, margin: 0 }}>{time}</p>
    </div>
    <div style={{
      width: 7, height: 7, borderRadius: "50%", background: T.amber,
      boxShadow: `0 0 6px ${T.amber}`, alignSelf: "center", flexShrink: 0,
    }} />
  </div>
);

// ─── LOADING ──────────────────────────────────────────────────────────────────
const Loader = () => (
  <div style={{
    minHeight: "100vh", background: T.bg, display: "flex",
    alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16,
  }}>
    <div style={{
      width: 48, height: 48, borderRadius: "50%",
      border: `3px solid ${T.border}`,
      borderTop: `3px solid ${T.amber}`,
      animation: "spin 0.9s linear infinite",
    }} />
    <p style={{ fontFamily: T.fontBody, color: T.textMuted, fontSize: 14, margin: 0 }}>
      Loading analytics…
    </p>
  </div>
);

// ─── CHART OPTIONS FACTORY ────────────────────────────────────────────────
const barOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: "#1e2235",
      borderColor: "rgba(245,158,11,0.3)",
      borderWidth: 1,
      titleColor: "#f1f5f9",
      bodyColor: "#94a3b8",
      padding: 12,
      cornerRadius: 8,
    },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { color: "#64748b", font: { family: "'DM Sans'", size: 12 } },
      border: { display: false },
    },
    y: {
      grid: { color: "rgba(255,255,255,0.04)" },
      ticks: { color: "#64748b", font: { family: "'DM Mono'", size: 11 } },
      border: { display: false },
    },
  },
  animation: { duration: 900, easing: "easeOutQuart" },
};

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: "72%",
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: "#1e2235",
      borderColor: "rgba(245,158,11,0.3)",
      borderWidth: 1,
      titleColor: "#f1f5f9",
      bodyColor: "#94a3b8",
      padding: 12,
      cornerRadius: 8,
    },
  },
  animation: { duration: 900, easing: "easeOutQuart" },
};

// ─── MAIN DASHBOARD ───────────────────────────────────────────────────────
const Dashboard = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    getAnalytics().then(setData).catch((e) => setError(e.message));
  }, []);

  if (error) return (
    <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ ...card(), borderColor: T.red + "55", maxWidth: 400, textAlign: "center" }}>
        <p style={{ fontFamily: T.fontHead, color: T.red, fontSize: 18, margin: "0 0 8px" }}>⚠ Error</p>
        <p style={{ fontFamily: T.fontBody, color: T.textMuted, fontSize: 14, margin: 0 }}>{error}</p>
      </div>
    </div>
  );

  if (!data) return <Loader />;

  const maxCategory = Math.max(...(data.top_categories?.map(c => c.count) || [1]));
  const totalStatus = (data.status?.resolved || 0) + (data.status?.open || 0) + (data.status?.pending || 0);

  const barData = {
    labels: data.department_load.map(d => d.department),
    datasets: [{
      data: data.department_load.map(d => d.tickets),
      backgroundColor: data.department_load.map((_, i) =>
        ["#f59e0b", "#2dd4bf", "#818cf8", "#f472b6", "#4ade80"][i % 5] + "cc"
      ),
      borderRadius: 6,
      borderSkipped: false,
    }],
  };

  const pieData = {
    labels: ["Resolved", "Open", "Pending"],
    datasets: [{
      data: [data.status?.resolved || 0, data.status?.open || 0, data.status?.pending || 0],
      backgroundColor: ["#4ade80", "#f87171", "#f59e0b"],
      borderWidth: 0,
      hoverOffset: 8,
    }],
  };

  const statusItems = [
    { label: "Resolved", value: data.status?.resolved || 0, color: T.green },
    { label: "Open",     value: data.status?.open     || 0, color: T.red   },
    { label: "Pending",  value: data.status?.pending  || 0, color: T.amber },
  ];
  const catColors = [T.amber, T.teal, "#818cf8", "#f472b6", "#4ade80"];

  return (
    <div style={{ background: T.bg, minHeight: "100vh", fontFamily: T.fontBody }}>
      <GlobalStyles />

      {/* ── HEADER ──────────────────────────────────────────────────────── */}
      <div style={{
        position: "relative", overflow: "hidden",
        background: "linear-gradient(135deg, #0f1320 0%, #131829 60%, #0d1020 100%)",
        borderBottom: `1px solid ${T.border}`,
        padding: "28px 32px 24px",
      }}>
        {/* decorative grid */}
        <div style={{
          position: "absolute", inset: 0, opacity: 0.08,
          backgroundImage: "linear-gradient(rgba(245,158,11,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(245,158,11,0.4) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }} />
        {/* glow orb */}
        <div style={{
          position: "absolute", top: -60, right: 80, width: 220, height: 220,
          borderRadius: "50%", background: T.amber, opacity: 0.04, filter: "blur(60px)",
        }} />
        <div style={{
          position: "absolute", top: 10, left: "40%", width: 180, height: 100,
          borderRadius: "50%", background: T.teal, opacity: 0.04, filter: "blur(50px)",
        }} />

        <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <div style={{
                width: 8, height: 8, borderRadius: "50%", background: T.green,
                boxShadow: `0 0 8px ${T.green}`, animation: "pulse-ring 2s ease-out infinite",
              }} />
              <span style={{ fontFamily: T.fontBody, fontSize: 11, color: T.green, letterSpacing: "0.12em", textTransform: "uppercase" }}>
                Live
              </span>
            </div>
            <h1 style={{
              fontFamily: T.fontHead, fontWeight: 800, fontSize: 26, margin: "0 0 4px",
              color: T.text, letterSpacing: "-0.02em",
            }}>
              AI Ticketing{" "}
              <span className="shimmer-text">Intelligence</span>
            </h1>
            <p style={{ fontFamily: T.fontBody, fontSize: 13, color: T.textMuted, margin: 0 }}>
              Real-time support operations · {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </p>
          </div>

          <div style={{
            display: "flex", gap: 10, alignItems: "center",
          }}>
            {["All Time", "30 Days", "7 Days"].map((t, i) => (
              <button key={t} style={{
                fontFamily: T.fontBody, fontSize: 12, padding: "6px 14px",
                borderRadius: 8, border: `1px solid ${i === 1 ? T.amber + "66" : T.border}`,
                background: i === 1 ? T.amberDim : "transparent",
                color: i === 1 ? T.amber : T.textMuted,
                cursor: "pointer", transition: "all 0.2s",
              }}>{t}</button>
            ))}
          </div>
        </div>
      </div>

      {/* ── BODY ────────────────────────────────────────────────────────── */}
      <div style={{ padding: "28px 32px", maxWidth: 1400, margin: "0 auto" }}>

        {/* KPI ROW */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
          <KpiCard label="Total Tickets"  value={data.total_tickets}                 icon="🎫" accent={T.amber} delay={0}    sub="All time" />
          <KpiCard label="Resolved"       value={data.status?.resolved}              icon="✅" accent={T.green} delay={0.08} sub={`${Math.round(data.status?.resolved / data.total_tickets * 100)}% rate`} />
          <KpiCard label="Open"           value={data.status?.open}                  icon="🔴" accent={T.red}   delay={0.16} sub="Needs attention" />
          <KpiCard label="Auto Success"   value={`${data.auto_resolution_success_rate}%`} icon="⚡" accent={T.teal}  delay={0.24} sub="AI resolution rate" />
        </div>

        {/* CHARTS ROW */}
        <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 16, marginBottom: 16 }}>

          {/* Bar chart */}
          <div className="dash-chart-card" style={{ ...card(), animationDelay: "0.3s" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div>
                <p style={{ fontFamily: T.fontHead, fontSize: 15, fontWeight: 700, color: T.text, margin: "0 0 2px" }}>
                  Department Load
                </p>
                <p style={{ fontFamily: T.fontBody, fontSize: 12, color: T.textMuted, margin: 0 }}>
                  Ticket volume by team
                </p>
              </div>
              <div style={{
                fontFamily: T.fontMono, fontSize: 11, color: T.amber,
                background: T.amberDim, border: `1px solid ${T.amber}33`,
                padding: "4px 10px", borderRadius: 6,
              }}>
                {data.department_load.length} depts
              </div>
            </div>
            <div style={{ height: 240, position: "relative" }}>
              <Bar data={barData} options={barOptions} />
            </div>
          </div>

          {/* Donut chart */}
          <div className="dash-chart-card" style={{ ...card(), animationDelay: "0.35s" }}>
            <p style={{ fontFamily: T.fontHead, fontSize: 15, fontWeight: 700, color: T.text, margin: "0 0 2px" }}>
              Ticket Status
            </p>
            <p style={{ fontFamily: T.fontBody, fontSize: 12, color: T.textMuted, margin: "0 0 16px" }}>
              Distribution overview
            </p>

            <div style={{ position: "relative", height: 180 }}>
              <Doughnut data={pieData} options={doughnutOptions} />
              {/* center label */}
              <div style={{
                position: "absolute", inset: 0,
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center", pointerEvents: "none",
              }}>
                <p style={{ fontFamily: T.fontMono, fontSize: 26, fontWeight: 500, color: T.text, margin: 0 }}>{totalStatus}</p>
                <p style={{ fontFamily: T.fontBody, fontSize: 11, color: T.textMuted, margin: 0 }}>total</p>
              </div>
            </div>

            {/* custom legend */}
            <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
              {statusItems.map(({ label, value, color }) => (
                <div key={label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <StatusDot color={color} />
                    <span style={{ fontFamily: T.fontBody, fontSize: 13, color: T.textSub }}>{label}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontFamily: T.fontMono, fontSize: 12, color: T.textMuted }}>
                      {Math.round(value / totalStatus * 100)}%
                    </span>
                    <span style={{ fontFamily: T.fontMono, fontSize: 13, color, fontWeight: 500 }}>{value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* BOTTOM ROW */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>

          {/* Top Categories */}
          <div className="dash-section" style={{ ...card(), animationDelay: "0.4s" }}>
            <p style={{ fontFamily: T.fontHead, fontSize: 15, fontWeight: 700, color: T.text, margin: "0 0 4px" }}>
              Top Categories
            </p>
            <p style={{ fontFamily: T.fontBody, fontSize: 12, color: T.textMuted, margin: "0 0 20px" }}>
              Issue type breakdown
            </p>
            {data.top_categories?.map((c, i) => (
              <CategoryBar
                key={i}
                label={c.category}
                count={c.count}
                max={maxCategory}
                color={catColors[i % catColors.length]}
                delay={0.5 + i * 0.07}
              />
            ))}
          </div>

          {/* Avg Resolution Time */}
          <div className="dash-section" style={{ ...card(), animationDelay: "0.45s" }}>
            <p style={{ fontFamily: T.fontHead, fontSize: 15, fontWeight: 700, color: T.text, margin: "0 0 4px" }}>
              Avg Resolution
            </p>
            <p style={{ fontFamily: T.fontBody, fontSize: 12, color: T.textMuted, margin: "0 0 20px" }}>
              Hours per department
            </p>
            {data.avg_resolution_time?.map((d, i) => {
              const maxHrs = Math.max(...data.avg_resolution_time.map(x => x.time));
              const pct = Math.round((d.time / maxHrs) * 100);
              const col = d.time < maxHrs * 0.5 ? T.green : d.time < maxHrs * 0.8 ? T.amber : T.red;
              return (
                <div key={i} style={{ marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontFamily: T.fontBody, fontSize: 13, color: T.textSub }}>{d.department}</span>
                    <span style={{ fontFamily: T.fontMono, fontSize: 13, color: col, fontWeight: 500 }}>
                      {d.time}h
                    </span>
                  </div>
                  <div style={{ height: 4, borderRadius: 99, background: T.surfaceHigh }}>
                    <div style={{
                      width: `${pct}%`, height: "100%", borderRadius: 99,
                      background: col, transition: "width 1s cubic-bezier(0.22,1,0.36,1)",
                    }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Recent Activity */}
          <div className="dash-section" style={{ ...card(), animationDelay: "0.5s" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <p style={{ fontFamily: T.fontHead, fontSize: 15, fontWeight: 700, color: T.text, margin: 0 }}>
                Recent Activity
              </p>
              <div style={{
                width: 8, height: 8, borderRadius: "50%", background: T.green,
                boxShadow: `0 0 6px ${T.green}`,
              }} />
            </div>
            <p style={{ fontFamily: T.fontBody, fontSize: 12, color: T.textMuted, margin: "0 0 16px" }}>
              Live event stream
            </p>
            <div style={{ overflowY: "auto", maxHeight: 260 }}>
              {data.recent_activity?.map((a, i) => (
                <ActivityItem key={i} id={a.id} action={a.action} time={a.time} index={i} />
              ))}
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div style={{
          marginTop: 28, textAlign: "center",
          fontFamily: T.fontBody, fontSize: 11, color: T.textMuted,
          letterSpacing: "0.05em",
        }}>
          AI Ticketing Intelligence · Powered by analytics engine · Auto-refreshes every 30s
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
