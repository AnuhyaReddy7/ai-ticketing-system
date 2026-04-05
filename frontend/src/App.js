import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Tickets from "./pages/Tickets";
import Employees from "./pages/Employees";
import Analytics from "./pages/Analytics";
import CreateTicket from "./pages/CreateTicket"; 

const App = () => {
  const [page, setPage] = useState("dashboard");

  return (
    <div style={{ display: "flex", background: "#0b0d14", minHeight: "100vh" }}>
      
      <div style={{ position: "sticky", top: 0, height: "100vh", flexShrink: 0 }}>
        <Sidebar page={page} setPage={setPage} />
      </div>

      <div style={{ flex: 1, overflowY: "auto" }}>
        {page === "dashboard"     && <Dashboard />}
        {page === "tickets"       && <Tickets />}
        {page === "employees"     && <Employees />}
        {page === "analytics"     && <Analytics />}
        {page === "create-ticket" && <CreateTicket />}
      </div>
    </div>
  );
};

export default App;