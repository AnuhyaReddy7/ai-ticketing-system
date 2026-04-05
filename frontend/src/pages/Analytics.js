import React, { useEffect, useState } from "react";
import { Bar, Line, Doughnut } from "react-chartjs-2";

// ─── CHART.JS REGISTRATION ─────────────────────────────
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);

// ─── THEME ─────────────────────────────────────────────
const T = {
  bg: "#0e192f",
  card: "#111a2e",
  border: "rgba(255,255,255,0.06)",
  text: "#f1f5f9",
  muted: "#94a3b8",
};

// ─── CARD ──────────────────────────────────────────────
const Card = ({ children }) => (
  <div
    style={{
      background: T.card,
      border: `1px solid ${T.border}`,
      borderRadius: 14,
      padding: 16,
      boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
    }}
  >
    {children}
  </div>
);

// ─── MAIN COMPONENT ────────────────────────────────────
export default function Analytics() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("http://localhost:8000/analytics")
      .then((res) => res.json())
      .then((res) => setData(res))
      .catch((err) => console.error("Fetch error:", err));
  }, []);

  if (!data) {
    return (
      <div style={{ color: "white", padding: 20 }}>
        Loading analytics...
      </div>
    );
  }

  // ─── CHART DATA ─────────────────────────────────────

  const barData = {
    labels: data.department_load.map((d) => d.department),
    datasets: [
      {
        label: "Tickets",
        data: data.department_load.map((d) => d.tickets),
        backgroundColor: ["#f59e0b", "#4ade80", "#f87171", "#60a5fa"],
        borderRadius: 6,
      },
    ],
  };

  const doughnutData = {
    labels: ["Open", "Resolved", "Pending", "Escalated"],
    datasets: [
      {
        data: [
        data.status?.open ?? 0,
        data.status?.resolved ?? 0,
        data.status?.pending ?? 0,
        data.status?.escalated ?? 0
        ],
        backgroundColor: ["#f59e0b", "#4ade80", "#f87171", "#60a5fa"],
        borderWidth: 0,
      },
    ],
  };

  const lineData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "Tickets Created",
        data: [50, 80, 60, 90, 120, 70, 100],
        borderColor: "#4ade80",
        tension: 0.4,
      },
    ],
  };

  return (
    <div
      style={{
        padding: 20,
        background: T.bg,
        minHeight: "100vh",
        fontFamily: "DM Sans, sans-serif",
      }}
    >
      {/* HEADER */}
      <h2 style={{ color: T.text }}>📊 Analytics Overview</h2>

      {/* KPI CARDS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: 12,
          marginBottom: 20,
        }}
      >
        <Card>
          <div style={{ color: T.muted }}>Total Tickets</div>
          <h2 style={{ color: "#f59e0b" }}>{data.total_tickets}</h2>
        </Card>

        <Card>
          <div style={{ color: T.muted }}>Open</div>
          <h2 style={{ color: "#f59e0b" }}>{data.status?.open ?? 0}</h2>
        </Card>

        <Card>
          <div style={{ color: T.muted }}>Resolved</div>
          <h2 style={{ color: "#4ade80" }}>{data.status?.resolved ?? 0}</h2>
        </Card>

        <Card>
          <div style={{ color: T.muted }}>Pending</div>
          <h2 style={{ color: "#f87171" }}>{data.status?.pending ?? 0}</h2>
        </Card>

        <Card>
          <div style={{ color: T.muted }}>Escalated</div>
          <h2 style={{ color: "#71cdf8" }}>{data.status?.escalated ?? 0}</h2>
        </Card>
      </div>

      {/* CHARTS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: 12,
          marginBottom: 12,
        }}
      >
        <Card>
          <h4 style={{ color: T.text }}>Weekly Trend</h4>
          <Line data={lineData} />
        </Card>

        <Card>
          <h4 style={{ color: T.text }}>Status Breakdown</h4>
          <Doughnut data={doughnutData} />
        </Card>
      </div>

      <Card>
        <h4 style={{ color: T.text }}>Department Load</h4>
        <Bar data={barData} />
      </Card>
    </div>
  );
}