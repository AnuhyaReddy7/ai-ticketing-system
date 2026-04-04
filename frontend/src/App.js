import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Tickets from "./pages/Tickets";
import Employees from "./pages/Employees";
import Analytics from "./pages/Analytics";

const App = () => {
  const [page, setPage] = useState("dashboard");

  return (
    <div style={{ display: "flex" }}>
      <Sidebar page={page} setPage={setPage} />

      <div style={{ flex: 1 }}>
        {page === "dashboard" && <Dashboard />}
        {page === "tickets" && <Tickets />}
        {page === "employees" && <Employees />}
        {page === "analytics" && <Analytics />}
      </div>
    </div>
  );
};

export default App;