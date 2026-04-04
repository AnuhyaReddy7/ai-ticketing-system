import React, { useState } from "react";

// ─── GLOBAL STYLES ─────────────────────────────────────────────
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Mono:wght@400;500&family=DM+Sans:wght@300;400;500&display=swap');

    @keyframes fadeIn {
      from { opacity: 0; transform: translateX(-10px); }
      to   { opacity: 1; transform: translateX(0); }
    }

    @keyframes glow {
      0%, 100% { box-shadow: 0 0 0 rgba(245,158,11,0); }
      50% { box-shadow: 0 0 18px rgba(245,158,11,0.25); }
    }

    .sidebar-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 12px;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.25s ease;
      position: relative;
      animation: fadeIn 0.4s ease both;
      user-select: none;
    }

    .sidebar-item:hover {
      background: rgba(255,255,255,0.05);
      transform: translateX(2px);
    }

    .sidebar-item.active {
      background: rgba(245,158,11,0.08);
      border: 1px solid rgba(245,158,11,0.25);
    }

    .sidebar-icon {
      width: 38px;
      height: 38px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255,255,255,0.04);
      color: #94a3b8;
      transition: all 0.25s ease;
    }

    .sidebar-item.active .sidebar-icon {
      background: rgba(245,158,11,0.15);
      color: #f59e0b;
      animation: glow 2.5s infinite;
    }

    .sidebar-label {
      font-family: 'DM Sans', sans-serif;
      font-size: 13px;
      color: #94a3b8;
      flex: 1;
    }

    .sidebar-item.active .sidebar-label {
      color: #f1f5f9;
    }

    .active-bar {
      position: absolute;
      left: 0;
      top: 18%;
      bottom: 18%;
      width: 3px;
      border-radius: 0 6px 6px 0;
      background: linear-gradient(180deg, #f59e0b, #fcd34d);
      box-shadow: 0 0 10px rgba(245,158,11,0.5);
    }

    .glass {
      backdrop-filter: blur(18px);
      -webkit-backdrop-filter: blur(18px);
      background: rgba(17, 26, 46, 0.65);
      border-right: 1px solid rgba(255,255,255,0.08);
    }

    .logo {
      font-family: 'Syne', sans-serif;
      font-weight: 800;
      font-size: 15px;
      background: linear-gradient(90deg,#f59e0b,#fcd34d,#f59e0b);
      background-size: 200% auto;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      animation: shimmer 3s linear infinite;
    }

    @keyframes shimmer {
      0% { background-position: 0% center; }
      100% { background-position: 200% center; }
    }
  `}</style>
);

// ─── TOKENS ─────────────────────────────────────────────
const T = {
  bg: "#0b1220",
  text: "#f1f5f9",
  muted: "#94a3b8",
  border: "rgba(255,255,255,0.08)",
  accent: "#f59e0b",
  surface: "rgba(255,255,255,0.04)",
};

// ─── NAV ─────────────────────────────────────────────
const NAV = [
  { id: "dashboard", label: "Dashboard", icon: "▦" },
  { id: "tickets", label: "Tickets", icon: "🎫" },
  { id: "employees", label: "Employees", icon: "👥" },
  { id: "analytics", label: "Analytics", icon: "📊" },
  { id: "settings", label: "Settings", icon: "⚙️" },
];

// ─── SIDEBAR ─────────────────────────────────────────────
  const Sidebar = ({ page = "dashboard", setPage }) => {
  const [mini, setMini] = useState(false);

  return (
    <>
      <GlobalStyles />

      <div
        className="glass"
        style={{
          width: mini ? 72 : 260,
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          transition: "0.35s cubic-bezier(0.22,1,0.36,1)",
          position: "relative",
          overflow: "hidden",
          background:
            "radial-gradient(circle at top, rgba(245,158,11,0.08), transparent 40%), rgba(11,18,32,0.9)",
        }}
      >

        {/* ── LOGO ── */}
        <div
          style={{
            padding: 18,
            display: "flex",
            justifyContent: mini ? "center" : "space-between",
            alignItems: "center",
            borderBottom: `1px solid ${T.border}`,
          }}
        >
          {!mini && <div className="logo">AI Ticketing</div>}

          <button
            onClick={() => setMini(!mini)}
            style={{
              background: T.surface,
              border: `1px solid ${T.border}`,
              color: T.muted,
              borderRadius: 10,
              padding: "6px 8px",
              cursor: "pointer",
            }}
          >
            {mini ? "→" : "←"}
          </button>
        </div>

        {/* ── NAV ── */}
        <div style={{ flex: 1, padding: 12, display: "flex", flexDirection: "column", gap: 6 }}>
          {NAV.map((item, i) => {
            const active = page === item.id;

            return (
              <div
                key={item.id}
                className={`sidebar-item ${active ? "active" : ""}`}
                onClick={() => setPage(item.id)}
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                {active && <div className="active-bar" />}

                <div className="sidebar-icon">{item.icon}</div>

                {!mini && <div className="sidebar-label">{item.label}</div>}
              </div>
            );
          })}
        </div>

        {/* ── FOOTER CARD ── */}
        {!mini && (
          <div style={{ padding: 14 }}>
            <div
              style={{
                background: T.surface,
                border: `1px solid ${T.border}`,
                borderRadius: 14,
                padding: 12,
              }}
            >
              <div style={{ fontSize: 12, color: T.muted }}>
                SLA Health
              </div>
              <div style={{ fontSize: 18, color: "#4ade80", fontWeight: 600 }}>
                92%
              </div>
              <div style={{ height: 4, background: "#1f2937", borderRadius: 99, marginTop: 8 }}>
                <div style={{
                  width: "92%",
                  height: "100%",
                  background: "linear-gradient(90deg,#f59e0b,#fcd34d)",
                  borderRadius: 99
                }} />
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Sidebar;