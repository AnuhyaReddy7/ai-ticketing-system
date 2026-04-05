import React, { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Card,
  Typography,
  Chip,
  Avatar,
  CircularProgress,
} from "@mui/material";
import { getEmployees } from "../api";

// ─── STATUS COLORS (analytics style) ─────────────
const statusColor = (avail) => {
  if (avail === "Available") return { bg: "#10b981", color: "#ffffff" };
  if (avail === "Busy") return { bg: "#f59e0b", color: "#ffffff" };
  if (avail === "On Leave") return { bg: "#ef4444", color: "#ffffff" };
  return { bg: "#64748b", color: "#ffffff" };
};

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getEmployees()
      .then((data) => setEmployees(Array.isArray(data) ? data : []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        p: 3,

        // 🔥 SAME ANALYTICS BACKGROUND STYLE
        background:
          "linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #0b1220 100%)",
      }}
    >
      {/* HEADER */}
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h5"
          fontWeight={700}
          sx={{ color: "white" }}
        >
          Employees Analytics
        </Typography>
        <Typography sx={{ color: "#94a3b8" }}>
          Team performance & workload distribution
        </Typography>
      </Box>

      {/* ERROR */}
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      {/* LOADING */}
      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
          <CircularProgress />
        </Box>
      )}

      {/* GRID */}
      <Grid container spacing={2}>
        {employees.map((emp) => {
          const style = statusColor(emp.availability || "Unknown");

          return (
            <Grid item xs={12} md={4} key={emp.id}>
              <Card
                sx={{
                  p: 2,
                  borderRadius: 4,

                  // 🔥 ANALYTICS GLASS CARD STYLE
                  background:
                    "rgba(255,255,255,0.06)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid rgba(255,255,255,0.08)",

                  color: "white",
                  transition: "0.25s",
                  "&:hover": {
                    transform: "translateY(-6px)",
                    background: "rgba(255,255,255,0.09)",
                  },
                }}
              >
                {/* TOP SECTION */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Avatar
                    sx={{
                      bgcolor: "#6366f1",
                      width: 45,
                      height: 45,
                      fontWeight: "bold",
                    }}
                  >
                    {emp.name?.charAt(0) || "?"}
                  </Avatar>

                  <Box>
                    <Typography fontWeight={600}>
                      {emp.name || "Unknown"}
                    </Typography>
                    <Typography sx={{ fontSize: 13, color: "#94a3b8" }}>
                      {emp.role || "No role"}
                    </Typography>
                  </Box>
                </Box>

                {/* STATUS ROW */}
                <Box
                  sx={{
                    mt: 2,
                    display: "flex",
                    gap: 1,
                    flexWrap: "wrap",
                  }}
                >
                  <Chip
                    label={emp.availability || "Unknown"}
                    size="small"
                    sx={{
                      background: style.bg,
                      color: style.color,
                      fontWeight: 600,
                    }}
                  />

                  <Chip
                    label={`Load: ${emp.load ?? 0}`}
                    size="small"
                    sx={{
                      background: "rgba(99,102,241,0.2)",
                      color: "#a5b4fc",
                      fontWeight: 600,
                    }}
                  />
                </Box>

                {/* FOOTER INFO */}
                <Typography
                  sx={{
                    fontSize: 12,
                    color: "#94a3b8",
                    mt: 1.5,
                  }}
                >
                  ⏱ Avg: {emp.avg_resolution_time || "N/A"} ·{" "}
                  {emp.department || "No dept"}
                </Typography>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default Employees;