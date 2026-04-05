import React, { useState } from "react";
import { createTicket } from "../api";

// ─── INJECT FONTS + KEYFRAMES ─────────────────────────────────────────────────
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@400;500&family=DM+Sans:wght@300;400;500&display=swap');
    * { box-sizing: border-box; }

    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(16px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes shimmer {
      0%   { background-position: -200% center; }
      100% { background-position: 200% center; }
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    @keyframes resultSlide {
      from { opacity: 0; transform: translateY(20px) scale(0.98); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }
    @keyframes glowPulse {
      0%, 100% { box-shadow: 0 0 20px rgba(245,158,11,0.1); }
      50%       { box-shadow: 0 0 40px rgba(245,158,11,0.25); }
    }

    .ct-input {
      width: 100%;
      background: #0d1020;
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 12px;
      padding: 14px 16px;
      color: #f1f5f9;
      font-family: 'DM Sans', sans-serif;
      font-size: 14px;
      outline: none;
      transition: border-color 0.2s, box-shadow 0.2s;
      resize: none;
    }
    .ct-input::placeholder { color: #334155; }
    .ct-input:focus {
      border-color: rgba(245,158,11,0.5);
      box-shadow: 0 0 0 3px rgba(245,158,11,0.08);
    }

    .ct-submit {
      font-family: 'DM Sans', sans-serif;
      font-size: 14px;
      font-weight: 600;
      padding: 14px 28px;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.25s;
      border: 1px solid rgba(245,158,11,0.5);
      background: rgba(245,158,11,0.12);
      color: #f59e0b;
      width: 100%;
      letter-spacing: 0.02em;
      position: relative;
      overflow: hidden;
    }
    .ct-submit::before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, rgba(245,158,11,0.15), transparent);
      opacity: 0;
      transition: opacity 0.2s;
    }
    .ct-submit:hover:not(:disabled)::before { opacity: 1; }
    .ct-submit:hover:not(:disabled) {
      border-color: rgba(245,158,11,0.7);
      box-shadow: 0 0 24px rgba(245,158,11,0.2);
      transform: translateY(-1px);
    }
    .ct-submit:active:not(:disabled) { transform: translateY(0); }
    .ct-submit:disabled {
      opacity: 0.35;
      cursor: not-allowed;
    }

    .result-card {
      animation: resultSlide 0.5s cubic-bezier(0.22, 1, 0.36, 1) both, glowPulse 3s ease-in-out 0.5s infinite;
    }

    .shimmer-text {
      background: linear-gradient(90deg, #f59e0b 0%, #fcd34d 40%, #f59e0b 70%, #d97706 100%);
      background-size: 200% auto;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      animation: shimmer 3s linear infinite;
    }

    .severity-badge {
      font-family: 'DM Mono', monospace;
      font-size: 10px;
      font-weight: 500;
      padding: 3px 10px;
      border-radius: 6px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }

    .result-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 0;
      border-bottom: 1px solid rgba(255,255,255,0.06);
    }
    .result-row:last-child { border-bottom: none; }

    .char-counter {
      font-family: 'DM Mono', monospace;
      font-size: 11px;
      color: #334155;
      transition: color 0.2s;
    }
    .char-counter.active { color: #64748b; }
    .char-counter.warn   { color: #f59e0b; }

    ::-webkit-scrollbar { width: 5px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: #1e2235; border-radius: 3px; }
  `}</style>
);

// ─── TOKENS ───────────────────────────────────────────────────────────────────
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

// ─── SEVERITY CONFIG ──────────────────────────────────────────────────────────
const SEVERITY = {
  "Critical": { color: "#f87171", bg: "rgba(248,113,113,0.15)" },
  "High":     { color: "#f59e0b", bg: "rgba(245,158,11,0.15)"  },
  "Medium":   { color: "#60a5fa", bg: "rgba(96,165,250,0.15)"  },
  "Low":      { color: "#4ade80", bg: "rgba(74,222,128,0.15)"  },
};

// ─── SENTIMENT CONFIG ─────────────────────────────────────────────────────────
const SENTIMENT = {
  "Frustrated": { color: "#f87171", icon: "😤" },
  "Neutral":    { color: "#94a3b8", icon: "😐" },
  "Polite":     { color: "#4ade80", icon: "🙂" },
};

// ─── RESOLUTION PATH CONFIG ───────────────────────────────────────────────────
const RESOLUTION = {
  "Auto-resolve": { color: "#4ade80", bg: "rgba(74,222,128,0.12)", label: "✦ Auto-Resolved" },
  "Assign":       { color: "#a78bfa", bg: "rgba(167,139,250,0.12)", label: "→ Routed to Team" },
};

// ─── RESULT ROW ───────────────────────────────────────────────────────────────
const ResultRow = ({ label, children }) => (
  <div className="result-row">
    <span style={{ fontFamily: T.fontBody, fontSize: 12, color: T.textMuted }}>{label}</span>
    <span style={{ fontFamily: T.fontBody, fontSize: 13, color: T.textSub, fontWeight: 500 }}>
      {children}
    </span>
  </div>
);

// ─── SPINNER ──────────────────────────────────────────────────────────────────
const Spinner = () => (
  <span style={{
    display: "inline-block", width: 16, height: 16,
    border: "2px solid rgba(245,158,11,0.2)",
    borderTopColor: "#f59e0b",
    borderRadius: "50%",
    animation: "spin 0.7s linear infinite",
    verticalAlign: "middle", marginRight: 8,
  }} />
);

// ─── EXAMPLE TICKETS ─────────────────────────────────────────────────────────
const EXAMPLES = [
  "How do I reset my password?",
  "Production database is corrupted, users can't log in",
  "I haven't received my reimbursement in 3 weeks — this is unacceptable",
  "Server is down and throwing 502 errors",
  "How do I apply for annual leave?",
];

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
const CreateTicket = () => {
  const [description, setDescription] = useState("");
  const [loading, setLoading]         = useState(false);
  const [result, setResult]           = useState(null);
  const [error, setError]             = useState("");

  const MAX = 500;
  const charCount = description.length;
  const counterClass = charCount === 0 ? "" : charCount > 450 ? "warn active" : "active";

  const handleSubmit = async () => {
    if (!description.trim()) return;
    setLoading(true);
    setResult(null);
    setError("");
    try {
      const data = await createTicket(description.trim());
      setResult(data);
      setDescription("");
    } catch (err) {
      setError(err.message || "Something went wrong. Is your backend running?");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSubmit();
  };

  const sv  = result ? (SEVERITY[result.severity]   || SEVERITY["Low"])     : null;
  const res = result ? (RESOLUTION[result.resolution_path] || RESOLUTION["Assign"]) : null;
  const sen = result ? (SENTIMENT[result.sentiment]  || SENTIMENT["Neutral"]) : null;

  return (
    <div style={{ background: T.bg, minHeight: "100vh", fontFamily: T.fontBody }}>
      <GlobalStyles />

      {/* ── HEADER ───────────────────────────────────────────────────────── */}
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
        <div style={{ position: "absolute", top: -60, right: 80, width: 200, height: 200, borderRadius: "50%", background: T.amber, opacity: 0.04, filter: "blur(70px)" }} />
        <div style={{ position: "relative" }}>
          <h1 style={{ fontFamily: T.fontHead, fontWeight: 800, fontSize: 24, margin: "0 0 4px", color: T.text, letterSpacing: "-0.02em" }}>
            Raise a <span className="shimmer-text">Ticket</span>
          </h1>
          <p style={{ fontFamily: T.fontBody, fontSize: 12, color: T.textMuted, margin: 0 }}>
            Describe your issue — the AI will analyze and route it instantly
          </p>
        </div>
      </div>

      {/* ── MAIN LAYOUT ──────────────────────────────────────────────────── */}
      <div style={{
        maxWidth: 860,
        margin: "0 auto",
        padding: "32px 32px",
        display: "grid",
        gridTemplateColumns: result ? "1fr 1fr" : "1fr",
        gap: 24,
        alignItems: "start",
        transition: "grid-template-columns 0.4s ease",
      }}>

        {/* ── FORM CARD ──────────────────────────────────────────────────── */}
        <div style={{
          background: T.surface,
          border: `1px solid ${T.border}`,
          borderRadius: 16,
          padding: "24px",
          animation: "fadeUp 0.4s ease both",
        }}>

          {/* form label */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: "rgba(245,158,11,0.1)",
              border: "1px solid rgba(245,158,11,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 16,
            }}>
              ✍️
            </div>
            <div>
              <p style={{ fontFamily: T.fontHead, fontWeight: 700, fontSize: 15, color: T.text, margin: 0 }}>
                Describe Your Issue
              </p>
              <p style={{ fontFamily: T.fontBody, fontSize: 11, color: T.textMuted, margin: 0 }}>
                Be as specific as possible for better routing
              </p>
            </div>
          </div>

          {/* textarea */}
          <div style={{ position: "relative", marginBottom: 10 }}>
            <textarea
              className="ct-input"
              rows={6}
              value={description}
              onChange={(e) => setDescription(e.target.value.slice(0, MAX))}
              onKeyDown={handleKeyDown}
              placeholder="e.g. I cannot access my account after the password reset — the login page keeps throwing a 401 error…"
            />
            <span className={`char-counter ${counterClass}`} style={{
              position: "absolute", bottom: 12, right: 14,
            }}>
              {charCount}/{MAX}
            </span>
          </div>

          {/* examples */}
          <div style={{ marginBottom: 20 }}>
            <p style={{
              fontFamily: T.fontBody, fontSize: 11, color: T.textMuted,
              margin: "0 0 8px", textTransform: "uppercase", letterSpacing: "0.1em",
            }}>
              Quick examples
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {EXAMPLES.map((ex, i) => (
                <button
                  key={i}
                  onClick={() => setDescription(ex)}
                  style={{
                    fontFamily: T.fontBody, fontSize: 11, color: T.textMuted,
                    background: T.surfaceHi, border: `1px solid ${T.border}`,
                    borderRadius: 6, padding: "4px 10px", cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(245,158,11,0.3)"; e.currentTarget.style.color = T.amber; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.textMuted; }}
                >
                  {ex.length > 32 ? ex.slice(0, 32) + "…" : ex}
                </button>
              ))}
            </div>
          </div>

          {/* error */}
          {error && (
            <div style={{
              background: "rgba(248,113,113,0.08)",
              border: "1px solid rgba(248,113,113,0.25)",
              borderRadius: 10, padding: "10px 14px",
              marginBottom: 16,
              fontFamily: T.fontBody, fontSize: 12, color: T.red,
            }}>
              ⚠ {error}
            </div>
          )}

          {/* submit */}
          <button
            className="ct-submit"
            disabled={!description.trim() || loading}
            onClick={handleSubmit}
          >
            {loading
              ? <><Spinner />Analyzing ticket…</>
              : "Submit Ticket  ⌘↵"
            }
          </button>

          <p style={{ fontFamily: T.fontBody, fontSize: 11, color: T.textMuted, textAlign: "center", marginTop: 10 }}>
            AI will auto-resolve or route to the right person instantly
          </p>
        </div>

        {/* ── RESULT CARD ──────────────────────────────────────────────── */}
        {result && (
          <div
            className="result-card"
            style={{
              background: T.surface,
              border: `1px solid ${T.border}`,
              borderRadius: 16,
              padding: "24px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* glow accent */}
            <div style={{
              position: "absolute", top: -40, right: -20,
              width: 140, height: 140, borderRadius: "50%",
              background: res?.color || T.amber,
              opacity: 0.04, filter: "blur(50px)",
              pointerEvents: "none",
            }} />

            {/* header */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: res ? res.bg : "rgba(74,222,128,0.12)",
                border: `1px solid ${res?.color || T.green}33`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 16,
              }}>
                {result.resolution_path === "Auto-resolve" ? "✦" : "→"}
              </div>
              <div>
                <p style={{
                  fontFamily: T.fontHead, fontWeight: 700, fontSize: 15,
                  color: res?.color || T.green, margin: 0,
                }}>
                  {res?.label || "Ticket Created"}
                </p>
                <p style={{ fontFamily: T.fontMono, fontSize: 10, color: T.textMuted, margin: 0 }}>
                  Ticket #{result.ticket_id}
                </p>
              </div>
            </div>

            {/* fields */}
            <div style={{
              background: T.surfaceHi,
              border: `1px solid ${T.border}`,
              borderRadius: 12, padding: "4px 14px",
              marginBottom: 18,
            }}>
              <ResultRow label="Category">
                <span style={{
                  fontFamily: T.fontMono, fontSize: 11,
                  color: T.amber, background: "rgba(245,158,11,0.1)",
                  border: "1px solid rgba(245,158,11,0.2)",
                  padding: "2px 8px", borderRadius: 5,
                }}>
                  {result.category}
                </span>
              </ResultRow>

              <ResultRow label="Severity">
                <span className="severity-badge" style={{ background: sv?.bg, color: sv?.color }}>
                  {result.severity}
                </span>
              </ResultRow>

              <ResultRow label="Department">
                {result.department}
              </ResultRow>

              <ResultRow label="Assigned To">
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{
                    width: 22, height: 22, borderRadius: "50%",
                    background: T.surfaceHi, border: `1px solid ${T.border}`,
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    fontFamily: T.fontMono, fontSize: 10, color: T.textMuted,
                  }}>
                    {(result.assignee || "?").charAt(0).toUpperCase()}
                  </span>
                  {result.assignee || "Unassigned"}
                </span>
              </ResultRow>

              <ResultRow label="Sentiment">
                <span style={{ color: sen?.color, display: "flex", alignItems: "center", gap: 5 }}>
                  {sen?.icon} {result.sentiment}
                </span>
              </ResultRow>

              <ResultRow label="Confidence">
                <span style={{ color: T.green, fontFamily: T.fontMono, fontSize: 12 }}>
                  {Math.round((result.confidence || 0) * 100)}%
                </span>
              </ResultRow>

              <ResultRow label="Est. Resolution">
                {result.estimated_resolution_time}
              </ResultRow>
            </div>

            {/* auto-response */}
            {result.auto_response && (
              <div style={{
                background: "rgba(74,222,128,0.06)",
                border: "1px solid rgba(74,222,128,0.2)",
                borderRadius: 12, padding: "14px",
                marginBottom: 16,
              }}>
                <p style={{
                  fontFamily: T.fontBody, fontSize: 10, color: T.green,
                  textTransform: "uppercase", letterSpacing: "0.1em",
                  margin: "0 0 8px", fontWeight: 600,
                }}>
                  ✦ AI Response
                </p>
                <p style={{
                  fontFamily: T.fontBody, fontSize: 13, color: T.textSub,
                  margin: 0, lineHeight: 1.6,
                }}>
                  {result.auto_response}
                </p>
              </div>
            )}

            {/* new ticket button */}
            <button
              onClick={() => { setResult(null); setDescription(""); }}
              style={{
                width: "100%",
                fontFamily: T.fontBody, fontSize: 12, fontWeight: 500,
                padding: "10px", borderRadius: 10, cursor: "pointer",
                background: "transparent",
                border: `1px solid ${T.border}`,
                color: T.textMuted, transition: "all 0.2s",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(245,158,11,0.3)"; e.currentTarget.style.color = T.amber; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.textMuted; }}
            >
              + Raise Another Ticket
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateTicket;
