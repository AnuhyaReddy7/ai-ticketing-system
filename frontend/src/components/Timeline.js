import React, { useEffect, useState } from "react";
import { Box, Typography, Card, CircularProgress } from "@mui/material";
import { getHistory } from "../api";

const Timeline = ({ ticketId }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ticketId) return;

    getHistory(ticketId)
      .then((data) => {
        setHistory(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [ticketId]);

  if (loading) {
    return (
      <Box sx={{ p: 2 }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  if (!history.length) {
    return <Typography>No history available</Typography>;
  }

  return (
    <Box sx={{ mt: 2 }}>
      {history.map((h, index) => (
        <Box
          key={index}
          sx={{
            display: "flex",
            alignItems: "flex-start",
            mb: 2,
          }}
        >
          {/* Timeline line */}
          <Box
            sx={{
              width: 2,
              bgcolor: "#e5e7eb",
              mx: 2,
              position: "relative",
            }}
          >
            <Box
              sx={{
                width: 10,
                height: 10,
                bgcolor: "#4f46e5",
                borderRadius: "50%",
                position: "absolute",
                top: 0,
                left: "-4px",
              }}
            />
          </Box>

          {/* Content */}
          <Card
            sx={{
              p: 2,
              borderRadius: 3,
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              width: "100%",
            }}
          >
            <Typography fontWeight={600}>
              {h.action.replace("_", " ").toUpperCase()}
            </Typography>

            {h.old_value && (
              <Typography fontSize={13}>
                From: <b>{h.old_value}</b>
              </Typography>
            )}

            {h.new_value && (
              <Typography fontSize={13}>
                To: <b>{h.new_value}</b>
              </Typography>
            )}

            <Typography fontSize={12} sx={{ color: "#6b7280", mt: 1 }}>
              By: {h.performed_by}
            </Typography>

            <Typography fontSize={12} sx={{ color: "#9ca3af" }}>
              {new Date(h.timestamp).toLocaleString()}
            </Typography>
          </Card>
        </Box>
      ))}
    </Box>
  );
};

export default Timeline;