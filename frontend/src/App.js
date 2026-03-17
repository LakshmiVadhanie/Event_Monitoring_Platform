import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, NavLink } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Events from "./pages/Events";
import Alerts from "./pages/Alerts";
import Services from "./pages/Services";

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <Router>
      <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg-primary)" }}>
        {/* Sidebar */}
        <aside style={{
          width: sidebarOpen ? 220 : 60,
          background: "var(--bg-secondary)",
          borderRight: "1px solid var(--border)",
          display: "flex", flexDirection: "column",
          transition: "width 0.2s", overflow: "hidden", flexShrink: 0
        }}>
          {/* Logo */}
          <div style={{ padding: "20px 16px", borderBottom: "1px solid var(--border)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: "linear-gradient(135deg, var(--accent-blue), var(--accent-cyan))",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 16, flexShrink: 0
              }}>⚡</div>
              {sidebarOpen && (
                <div>
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "var(--text-primary)" }}>
                    EventPulse
                  </div>
                  <div style={{ fontSize: 10, color: "var(--text-muted)" }}>monitoring v1.0</div>
                </div>
              )}
            </div>
          </div>

          {/* Nav */}
          <nav style={{ flex: 1, padding: "12px 8px" }}>
            {[
              { to: "/", icon: "bi-grid-1x2-fill", label: "Dashboard" },
              { to: "/events", icon: "bi-lightning-charge-fill", label: "Events" },
              { to: "/alerts", icon: "bi-bell-fill", label: "Alerts" },
              { to: "/services", icon: "bi-diagram-3-fill", label: "Services" },
            ].map(({ to, icon, label }) => (
              <NavLink key={to} to={to} end={to === "/"} className={({ isActive }) =>
                `nav-link${isActive ? " active" : ""}`
              } style={{ marginBottom: 4, whiteSpace: "nowrap" }}>
                <i className={`bi ${icon}`} style={{ fontSize: 16, flexShrink: 0 }} />
                {sidebarOpen && <span>{label}</span>}
              </NavLink>
            ))}
          </nav>

          {/* Toggle */}
          <div style={{ padding: "12px 8px", borderTop: "1px solid var(--border)" }}>
            <button onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: "8px 12px", width: "100%" }}>
              <i className={`bi bi-chevron-${sidebarOpen ? "left" : "right"}`} />
            </button>
          </div>
        </aside>

        {/* Main */}
        <main style={{ flex: 1, overflow: "auto", minWidth: 0 }}>
          {/* Topbar */}
          <header style={{
            padding: "14px 24px", borderBottom: "1px solid var(--border)",
            background: "var(--bg-secondary)", display: "flex", alignItems: "center",
            justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span className="pulse-dot" />
              <span style={{ color: "var(--text-secondary)", fontSize: 11 }}>
                LIVE • {new Date().toUTCString().slice(0, 25)}
              </span>
            </div>
            <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
              <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                <i className="bi bi-shield-check me-1 text-accent-green" />
                99.5% uptime
              </span>
              <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                <i className="bi bi-activity me-1 text-accent-blue" />
                1K+ req/min
              </span>
            </div>
          </header>

          <div style={{ padding: "24px" }}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/events" element={<Events />} />
              <Route path="/alerts" element={<Alerts />} />
              <Route path="/services" element={<Services />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}
