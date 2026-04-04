import React, { useEffect, useState } from "react";
import { Drawer } from "@mui/material";
import { getTickets, updateStatus, addNote, requestInfo } from "../api";
import Timeline from "../components/Timeline";

// ─── INJECT FONTS + KEYFRAMES ──────────────────────────────────────────────
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@400;500&family=DM+Sans:wght@300;400;500&display=swap');
    * { box-sizing: border-box; }

    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(16px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes slideIn {
      from { opacity: 0; transform: translateX(24px); }
      to   { opacity: 1; transform: translateX(0); }
    }
    @keyframes shimmer {
      0%   { background-position: -200% center; }
      100% { background-position: 200% center; }
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50%       { opacity: 0.4; }
    }

    .tk-card {
      animation: fadeUp 0.4s ease both;
      cursor: pointer;
      position: relative;
      overflow: hidden;
    }
    .tk-card::before {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: 14px;
      opacity: 0;
      transition: opacity 0.25s;
      background: radial-gradient(circle at top right, rgba(245,158,11,0.06), transparent 70%);
    }
    .tk-card:hover::before { opacity: 1; }
    .tk-card:hover { transform: translateY(-4px) !important; border-color: rgba(245,158,11,0.35) !important; }

    .drawer-section { animation: slideIn 0.35s ease both; }

    .tk-btn {
      font-family: 'DM Sans', sans-serif;
      font-size: 12px;
      font-weight: 500;
      padding: 8px 18px;
      border-radius: 9px;
      cursor: pointer;
      transition: all 0.2s;
      border: 1px solid;
    }
    .tk-btn-primary {
      background: rgba(245,158,11,0.12);
      border-color: rgba(245,158,11,0.4);
      color: #f59e0b;
    }
    .tk-btn-primary:hover:not(:disabled) {
      background: rgba(245,158,11,0.2);
      box-shadow: 0 0 16px rgba(245,158,11,0.2);
    }
    .tk-btn-primary:disabled { opacity: 0.35; cursor: not-allowed; }

    .tk-btn-ghost {
      background: transparent;
      border-color: rgba(255,255,255,0.08);
      color: #64748b;
    }
    .tk-btn-ghost:hover { background: rgba(255,255,255,0.04); color: #94a3b8; }

    .tk-input {
      width: 100%;
      background: #0d1020;
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 10px;
      padding: 10px 14px;
      color: #f1f5f9;
      font-family: 'DM Sans', sans-serif;
      font-size: 13px;
      outline: none;
      transition: border-color 0.2s, box-shadow 0.2s;
      resize: none;
    }
    .tk-input::placeholder { color: #334155; }
    .tk-input:focus {
      border-color: rgba(245,158,11,0.4);
      box-shadow: 0 0 0 3px rgba(245,158,11,0.08);
    }

    .tk-select {
      width: 100%;
      background: #0d1020;
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 10px;
      padding: 10px 14px;
      color: #f1f5f9;
      font-family: 'DM Sans', sans-serif;
      font-size: 13px;
      outline: none;
      cursor: pointer;
      appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24'%3E%3Cpath fill='%2364748b' d='M7 10l5 5 5-5z'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 14px center;
      transition: border-color 0.2s;
    }
    .tk-select:focus { border-color: rgba(245,158,11,0.4); }
    .tk-select option { background: #10131e; }

    .severity-badge {
      font-family: 'DM Mono', monospace;
      font-size: 10px;
      font-weight: 500;
      padding: 2px 8px;
      border-radius: 5px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }

    .shimmer-text {
      background: linear-gradient(90deg, #f59e0b 0%, #fcd34d 40%, #f59e0b 70%, #d97706 100%);
      background-size: 200% auto;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      animation: shimmer 3s linear infinite;
    }

    .live-pulse {
      animation: pulse 2s ease-in-out infinite;
    }

    ::-webkit-scrollbar { width: 5px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: #1e2235; border-radius: 3px; }
  `}</style>
);

// ─── TOKENS ──────────────────────────────────────────────────────────────────
const T = {
  bg:        "#0b0d14",
  surface:   "#10131e",
  surfaceHi: "#181c2c",
  border:    "rgba(255,255,255,0.07)",
  amber:     "#f59e0b",
  teal:      "#2dd4bf",
  red:       "#f87171",
  green:     "#4ade80",
  purple:    "#a78bfa",
  blue:      "#60a5fa",
  text:      "#f1f5f9",
  textSub:   "#94a3b8",
  textMuted: "#64748b",
  fontHead:  "'Syne', sans-serif",
  fontBody:  "'DM Sans', sans-serif",
  fontMono:  "'DM Mono', monospace",
};

// ─── STATUS CONFIG ────────────────────────────────────────────────────────────
const STATUS = {
  "New":          { color: T.blue,   bg: "rgba(96,165,250,0.12)",  glow: "rgba(96,165,250,0.3)"   },
  "Assigned":     { color: T.purple, bg: "rgba(167,139,250,0.12)", glow: "rgba(167,139,250,0.3)"  },
  "In Progress":  { color: T.amber,  bg: "rgba(245,158,11,0.12)",  glow: "rgba(245,158,11,0.3)"   },
  "Pending Info": { color: T.red,    bg: "rgba(248,113,113,0.12)", glow: "rgba(248,113,113,0.3)"  },
  "Resolved":     { color: T.green,  bg: "rgba(74,222,128,0.12)",  glow: "rgba(74,222,128,0.3)"   },
  "Closed":       { color: "#64748b",bg: "rgba(100,116,139,0.12)", glow: "rgba(100,116,139,0.3)"  },
};
const getStatus = (s) => STATUS[s] || STATUS["New"];

const SEVERITY = {
  "Critical": { color: T.red,    bg: "rgba(248,113,113,0.15)"  },
  "High":     { color: T.amber,  bg: "rgba(245,158,11,0.15)"   },
  "Medium":   { color: T.blue,   bg: "rgba(96,165,250,0.15)"   },
  "Low":      { color: T.green,  bg: "rgba(74,222,128,0.15)"   },
};
const getSeverity = (s) => SEVERITY[s] || SEVERITY["Low"];

const STATUS_OPTIONS = ["Assigned", "In Progress", "Pending Info", "Resolved", "Closed"];

// ─── SECTION LABEL ────────────────────────────────────────────────────────────
const SectionLabel = ({ children }) => (
  <p style={{
    fontFamily: T.fontBody, fontSize: 10, fontWeight: 500,
    color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.12em",
    margin: "0 0 10px", display: "flex", alignItems: "center", gap: 8,
  }}>
    <span style={{ flex: 1, height: "0.5px", background: T.border }} />
    {children}
    <span style={{ flex: 1, height: "0.5px", background: T.border }} />
  </p>
);

// ─── STATUS BADGE ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const cfg = getStatus(status);
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      fontFamily: T.fontBody, fontSize: 11, fontWeight: 500,
      padding: "3px 10px", borderRadius: 6,
      background: cfg.bg, color: cfg.color,
      border: `1px solid ${cfg.color}33`,
    }}>
      <span style={{
        width: 6, height: 6, borderRadius: "50%",
        background: cfg.color, boxShadow: `0 0 6px ${cfg.color}`,
      }} />
      {status}
    </span>
  );
};

// ─── TICKET CARD ─────────────────────────────────────────────────────────────
const TicketCard = ({ ticket, onClick, delay }) => {
  const sv = getSeverity(ticket.severity);
  const st = getStatus(ticket.status);

  return (
    <div
      className="tk-card"
      onClick={onClick}
      style={{
        animationDelay: `${delay}s`,
        background: T.surface,
        border: `1px solid ${T.border}`,
        borderRadius: 14,
        padding: "18px",
        transition: "transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease",
      }}
    >
      {/* top row: id + severity */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <span style={{
          fontFamily: T.fontMono, fontSize: 11, color: T.amber,
          background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)",
          padding: "2px 8px", borderRadius: 5,
        }}>
          #{ticket.id}
        </span>
        <span className="severity-badge" style={{ background: sv.bg, color: sv.color }}>
          {ticket.severity}
        </span>
      </div>

      {/* description */}
      <p style={{
        fontFamily: T.fontHead, fontSize: 14, fontWeight: 700, color: T.text,
        margin: "0 0 8px", lineHeight: 1.4,
        display: "-webkit-box", WebkitLineClamp: 2,
        WebkitBoxOrient: "vertical", overflow: "hidden",
      }}>
        {ticket.description}
      </p>

      {/* meta */}
      <p style={{ fontFamily: T.fontBody, fontSize: 12, color: T.textMuted, margin: "0 0 14px" }}>
        {ticket.department}
      </p>

      {/* footer */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <StatusBadge status={ticket.status} />
        <div style={{
          width: 28, height: 28, borderRadius: "50%",
          background: T.surfaceHi, border: `1px solid ${T.border}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: T.fontMono, fontSize: 10, color: T.textMuted,
        }}>
          {(ticket.assignee || "?").charAt(0).toUpperCase()}
        </div>
      </div>

      {/* accent bar */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: 2, borderRadius: "0 0 14px 14px",
        background: `linear-gradient(90deg, transparent, ${st.color}55, transparent)`,
      }} />
    </div>
  );
};

// ─── DRAWER FIELD GROUP ───────────────────────────────────────────────────────
const FieldRow = ({ label, value }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: `1px solid ${T.border}` }}>
    <span style={{ fontFamily: T.fontBody, fontSize: 12, color: T.textMuted }}>{label}</span>
    <span style={{ fontFamily: T.fontBody, fontSize: 12, color: T.textSub, fontWeight: 500 }}>{value}</span>
  </div>
);

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
const Tickets = () => {
  const [tickets, setTickets]   = useState([]);
  const [selected, setSelected] = useState(null);
  const [note, setNote]         = useState("");
  const [status, setStatus]     = useState("");
  const [infoMsg, setInfoMsg]   = useState("");
  const [filter, setFilter]     = useState("All");
  const [search, setSearch]     = useState("");
  const [loading, setLoading]   = useState(false);

  const fetchTickets = () => {
    getTickets().then(setTickets);
  };

  useEffect(() => { fetchTickets(); }, []);

  const filtered = tickets.filter((t) => {
    const matchStatus = filter === "All" || t.status === filter;
    const matchSearch = !search || t.description.toLowerCase().includes(search.toLowerCase()) || String(t.id).includes(search);
    return matchStatus && matchSearch;
  });

  const statusCounts = tickets.reduce((acc, t) => {
    acc[t.status] = (acc[t.status] || 0) + 1;
    return acc;
  }, {});

  const filters = ["All", "New", "In Progress", "Pending Info", "Resolved", "Closed"];

  return (
    <div style={{ background: T.bg, minHeight: "100vh", fontFamily: T.fontBody }}>
      <GlobalStyles />

      {/* ── HEADER ──────────────────────────────────────────────────────── */}
      <div style={{
        position: "relative", overflow: "hidden",
        background: "linear-gradient(135deg, #0f1320 0%, #131829 60%, #0d1020 100%)",
        borderBottom: `1px solid ${T.border}`,
        padding: "24px 32px 20px",
      }}>
        <div style={{
          position: "absolute", inset: 0, opacity: 0.07,
          backgroundImage: "linear-gradient(rgba(245,158,11,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(245,158,11,0.4) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }} />
        <div style={{ position: "absolute", top: -50, right: 60, width: 180, height: 180, borderRadius: "50%", background: T.amber, opacity: 0.04, filter: "blur(60px)" }} />

        <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span className="live-pulse" style={{ width: 8, height: 8, borderRadius: "50%", background: T.green, boxShadow: `0 0 8px ${T.green}`, display: "inline-block" }} />
              <span style={{ fontFamily: T.fontBody, fontSize: 10, color: T.green, letterSpacing: "0.12em", textTransform: "uppercase" }}>Live Queue</span>
            </div>
            <h1 style={{ fontFamily: T.fontHead, fontWeight: 800, fontSize: 24, margin: "0 0 4px", color: T.text, letterSpacing: "-0.02em" }}>
              Support <span className="shimmer-text">Tickets</span>
            </h1>
            <p style={{ fontFamily: T.fontBody, fontSize: 12, color: T.textMuted, margin: 0 }}>
              {tickets.length} tickets total · {statusCounts["In Progress"] || 0} in progress
            </p>
          </div>

          {/* search */}
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 14, color: T.textMuted }}>🔍</span>
            <input
              className="tk-input"
              placeholder="Search by title or ID…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: 34, width: 240, background: "rgba(13,16,32,0.8)" }}
            />
          </div>
        </div>
      </div>

      <div style={{ padding: "24px 32px", maxWidth: 1400, margin: "0 auto" }}>

        {/* ── STATUS SUMMARY STRIP ──────────────────────────────────────── */}
        <div style={{ display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap" }}>
          {Object.entries(STATUS).map(([s, cfg]) => (
            <div key={s} style={{
              display: "flex", alignItems: "center", gap: 8,
              background: T.surface, border: `1px solid ${T.border}`,
              borderRadius: 10, padding: "8px 14px",
              animation: "fadeUp 0.5s ease both",
            }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: cfg.color, boxShadow: `0 0 6px ${cfg.color}` }} />
              <span style={{ fontFamily: T.fontBody, fontSize: 11, color: T.textSub }}>{s}</span>
              <span style={{ fontFamily: T.fontMono, fontSize: 12, color: cfg.color, fontWeight: 500 }}>{statusCounts[s] || 0}</span>
            </div>
          ))}
        </div>

        {/* ── FILTER TABS ───────────────────────────────────────────────── */}
        <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
          {filters.map((f) => {
            const active = filter === f;
            const cfg = f !== "All" ? getStatus(f) : null;
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  fontFamily: T.fontBody, fontSize: 12, fontWeight: 500,
                  padding: "6px 14px", borderRadius: 8, cursor: "pointer",
                  transition: "all 0.2s",
                  background: active ? (cfg ? cfg.bg : "rgba(245,158,11,0.1)") : "transparent",
                  border: `1px solid ${active ? (cfg ? cfg.color + "55" : T.amber + "55") : T.border}`,
                  color: active ? (cfg ? cfg.color : T.amber) : T.textMuted,
                }}
              >
                {f} {f !== "All" && statusCounts[f] ? `(${statusCounts[f]})` : ""}
              </button>
            );
          })}
        </div>

        {/* ── GRID ──────────────────────────────────────────────────────── */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <p style={{ fontFamily: T.fontHead, fontSize: 18, color: T.textMuted, margin: 0 }}>No tickets found</p>
            <p style={{ fontFamily: T.fontBody, fontSize: 13, color: T.textMuted, marginTop: 6 }}>Try adjusting your filter or search</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14 }}>
            {filtered.map((t, i) => (
              <TicketCard
                key={t.id}
                ticket={t}
                delay={i * 0.05}
                onClick={() => {
                  setSelected(t);
                  setStatus("");
                  setNote("");
                  setInfoMsg("");
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── SIDE DRAWER ───────────────────────────────────────────────── */}
      <Drawer
        anchor="right"
        open={!!selected}
        onClose={() => setSelected(null)}
        PaperProps={{
          sx: {
            width: 440,
            background: "#0d1020",
            borderLeft: `1px solid rgba(255,255,255,0.07)`,
            color: T.text,
            overflowX: "hidden",
          },
        }}
      >
        {selected && (() => {
          const st = getStatus(selected.status);
          const sv = getSeverity(selected.severity);
          return (
            <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>

              {/* DRAWER HEADER */}
              <div style={{
                padding: "20px 22px 18px",
                background: "linear-gradient(135deg, #0f1320, #131829)",
                borderBottom: `1px solid ${T.border}`,
                position: "relative", overflow: "hidden",
              }}>
                <div style={{ position: "absolute", top: -40, right: -20, width: 120, height: 120, borderRadius: "50%", background: st.color, opacity: 0.05, filter: "blur(40px)" }} />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", position: "relative" }}>
                  <div style={{ flex: 1, marginRight: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <span style={{ fontFamily: T.fontMono, fontSize: 11, color: T.amber, background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)", padding: "2px 8px", borderRadius: 5 }}>
                        #{selected.id}
                      </span>
                      <StatusBadge status={selected.status} />
                    </div>
                    <p style={{ fontFamily: T.fontHead, fontSize: 15, fontWeight: 700, color: T.text, margin: 0, lineHeight: 1.4 }}>
                      {selected.description}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelected(null)}
                    style={{
                      width: 32, height: 32, borderRadius: 8,
                      background: "rgba(255,255,255,0.05)", border: `1px solid ${T.border}`,
                      color: T.textMuted, cursor: "pointer", display: "flex",
                      alignItems: "center", justifyContent: "center", flexShrink: 0,
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = T.text; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = T.textMuted; }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
              </div>

              {/* DRAWER CONTENT */}
              <div style={{ flex: 1, overflowY: "auto", padding: "20px 22px" }}>

                {/* Meta fields */}
                <div className="drawer-section" style={{ animationDelay: "0.05s", marginBottom: 22, background: T.surface, borderRadius: 12, border: `1px solid ${T.border}`, padding: "4px 14px" }}>
                  <FieldRow label="Department" value={selected.department} />
                  <FieldRow label="Assignee"   value={selected.assignee || "Unassigned"} />
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0" }}>
                    <span style={{ fontFamily: T.fontBody, fontSize: 12, color: T.textMuted }}>Severity</span>
                    <span className="severity-badge" style={{ background: sv.bg, color: sv.color }}>
                      {selected.severity}
                    </span>
                  </div>
                </div>

                {/* ── UPDATE STATUS ── */}
                <div className="drawer-section" style={{ animationDelay: "0.1s", marginBottom: 20 }}>
                  <SectionLabel>Update Status</SectionLabel>
                  <select
                    className="tk-select"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    style={{ marginBottom: 10 }}
                  >
                    <option value="" disabled>Select new status…</option>
                    {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <button
                    className="tk-btn tk-btn-primary"
                    disabled={!status}
                    style={{ width: "100%" }}
                    onClick={() => {
                      setLoading(true);
                      updateStatus(selected.id, status)
                        .then(() => { fetchTickets(); setSelected({ ...selected, status }); })
                        .catch(err => alert(err.message))
                        .finally(() => setLoading(false));
                    }}
                  >
                    {loading ? "Updating…" : "Apply Status"}
                  </button>
                </div>

                <div style={{ height: 1, background: T.border, margin: "4px 0 20px" }} />

                {/* ── ADD NOTE ── */}
                <div className="drawer-section" style={{ animationDelay: "0.15s", marginBottom: 20 }}>
                  <SectionLabel>Internal Note</SectionLabel>
                  <textarea
                    className="tk-input"
                    rows={3}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Write a private note for your team…"
                    style={{ marginBottom: 10 }}
                  />
                  <button
                    className="tk-btn tk-btn-primary"
                    disabled={!note}
                    style={{ width: "100%" }}
                    onClick={() => {
                      addNote(selected.id, note)
                        .then(() => { setNote(""); fetchTickets(); })
                        .catch(err => alert(err.message));
                    }}
                  >
                    Post Note
                  </button>
                </div>

                <div style={{ height: 1, background: T.border, margin: "4px 0 20px" }} />

                {/* ── REQUEST INFO ── */}
                <div className="drawer-section" style={{ animationDelay: "0.2s", marginBottom: 20 }}>
                  <SectionLabel>Request Info</SectionLabel>
                  <textarea
                    className="tk-input"
                    rows={2}
                    value={infoMsg}
                    onChange={(e) => setInfoMsg(e.target.value)}
                    placeholder="Ask the user for more information…"
                    style={{ marginBottom: 10 }}
                  />
                  <button
                    className="tk-btn"
                    disabled={!infoMsg}
                    style={{
                      width: "100%",
                      background: infoMsg ? "rgba(248,113,113,0.1)" : "transparent",
                      borderColor: infoMsg ? "rgba(248,113,113,0.4)" : T.border,
                      color: infoMsg ? T.red : T.textMuted,
                      opacity: !infoMsg ? 0.4 : 1,
                      cursor: !infoMsg ? "not-allowed" : "pointer",
                    }}
                    onClick={() => {
                      requestInfo(selected.id, infoMsg)
                        .then(() => { setInfoMsg(""); fetchTickets(); setSelected({ ...selected, status: "Pending Info" }); })
                        .catch(err => alert(err.message));
                    }}
                  >
                    Send Request
                  </button>
                </div>

                <div style={{ height: 1, background: T.border, margin: "4px 0 20px" }} />

                {/* ── TIMELINE ── */}
                <div className="drawer-section" style={{ animationDelay: "0.25s" }}>
                  <SectionLabel>Activity Timeline</SectionLabel>
                  <Timeline ticketId={selected.id} />
                </div>
              </div>

              {/* DRAWER FOOTER */}
              <div style={{ padding: "14px 22px", borderTop: `1px solid ${T.border}`, background: T.surface }}>
                <button
                  className="tk-btn tk-btn-ghost"
                  style={{ width: "100%" }}
                  onClick={() => setSelected(null)}
                >
                  Close Panel
                </button>
              </div>
            </div>
          );
        })()}
      </Drawer>
    </div>
  );
};

export default Tickets;