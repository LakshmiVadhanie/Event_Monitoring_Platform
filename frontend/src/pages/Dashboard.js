import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@apollo/client";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler
} from "chart.js";
import { GET_METRIC_SUMMARY, GET_EVENTS, GET_SERVICE_HEALTH } from "../graphql/queries";
import { timeAgo, severityBadge, statusBadge, formatDuration } from "../utils/helpers";

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler);

const chartDefaults = {
  plugins: { legend: { labels: { color: "#7b82a0", font: { family: "JetBrains Mono", size: 11 } } } },
  scales: {
    x: { ticks: { color: "#4a5070", font: { family: "JetBrains Mono", size: 10 } }, grid: { color: "#1e2235" } },
    y: { ticks: { color: "#4a5070", font: { family: "JetBrains Mono", size: 10 } }, grid: { color: "#1e2235" } },
  },
};

function StatCard({ label, value, sub, color, icon, animClass, onClick }) {
  return (
    <div className={`card metric-card ${animClass || 'fade-in'}`} 
         style={{ padding: "20px 22px", cursor: onClick ? "pointer" : "default" }}
         onClick={onClick}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 10, color: "var(--text-muted)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>
            {label}
          </div>
          <div className="stat-number" style={{ color }}>{value}</div>
          {sub && <div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 4 }}>{sub}</div>}
        </div>
        <div style={{ fontSize: 24, opacity: 0.5 }}>{icon}</div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { data: summaryData, loading: sumLoading } = useQuery(GET_METRIC_SUMMARY, { pollInterval: 15000 });
  const { data: eventsData } = useQuery(GET_EVENTS, { variables: { pageSize: 6 }, pollInterval: 10000 });
  const { data: healthData } = useQuery(GET_SERVICE_HEALTH, { pollInterval: 20000 });

  // Simulated time-series for sparkline
  const [requestSeries] = useState(() =>
    Array.from({ length: 12 }, () => Math.floor(Math.random() * 300 + 700))
  );

  const summary = summaryData?.metricSummary || {};
  const events = eventsData?.events?.events || [];
  const services = healthData?.serviceHealth || [];

  const doughnutData = {
    labels: ["Critical", "High", "Medium", "Low"],
    datasets: [{
      data: [
        events.filter(e => e.severity === "CRITICAL").length,
        events.filter(e => e.severity === "HIGH").length,
        events.filter(e => e.severity === "MEDIUM").length,
        events.filter(e => e.severity === "LOW").length,
      ],
      backgroundColor: ["rgba(255,61,113,0.8)", "rgba(255,145,0,0.8)", "rgba(255,215,64,0.8)", "rgba(0,230,118,0.8)"],
      borderWidth: 0,
    }],
  };

  const lineData = {
    labels: Array.from({ length: 12 }, (_, i) => `${i * 5}m`),
    datasets: [{
      label: "Requests/min",
      data: requestSeries,
      fill: true,
      borderColor: "#4f8ef7",
      backgroundColor: "rgba(79,142,247,0.08)",
      tension: 0.4,
      pointRadius: 2,
      borderWidth: 2,
    }],
  };

  const barData = {
    labels: services.map(s => s.service.replace("-service","").replace("-","·")),
    datasets: [
      { label: "Uptime %", data: services.map(s => s.uptime), backgroundColor: "rgba(0,230,118,0.7)", borderRadius: 4 },
      { label: "Latency ms", data: services.map(s => s.latencyMs), backgroundColor: "rgba(79,142,247,0.7)", borderRadius: 4 },
    ],
  };

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 26, margin: 0, color: "var(--text-primary)" }}>
          System Overview
        </h1>
        <p style={{ color: "var(--text-secondary)", margin: "4px 0 0", fontSize: 12 }}>
          Real-time platform health • Kubernetes cluster • {services.length} services
        </p>
      </div>

      {/* Stat cards */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-xl-3">
          <StatCard label="Total Events" value={sumLoading ? "—" : summary.totalEvents || 0}
            sub="all time" color="var(--text-primary)" icon="⚡" animClass="fade-in-1"
            onClick={() => navigate("/events")} />
        </div>
        <div className="col-6 col-xl-3">
          <StatCard label="Open Events" value={sumLoading ? "—" : summary.openEvents || 0}
            sub="need attention" color="var(--accent-red)" icon="🔴" animClass="fade-in-2"
            onClick={() => navigate("/events?status=OPEN")} />
        </div>
        <div className="col-6 col-xl-3">
          <StatCard label="Uptime" value={sumLoading ? "—" : `${summary.uptimePercent || 99.5}%`}
            sub="last 30 days" color="var(--accent-green)" icon="✅" animClass="fade-in-3"
            onClick={() => navigate("/services")} />
        </div>
        <div className="col-6 col-xl-3">
          <StatCard label="MTTR" value={sumLoading ? "—" : formatDuration(summary.mttr)}
            sub="mean time to resolve" color="var(--accent-cyan)" icon="⏱" animClass="fade-in-4" />
        </div>
      </div>

      {/* Charts row */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-lg-8 fade-in-5">
          <div className="card" style={{ padding: 20 }}>
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 12, letterSpacing: "0.1em", textTransform: "uppercase" }}>
              Request Throughput
            </div>
            <Line data={lineData} options={{ ...chartDefaults, plugins: { ...chartDefaults.plugins, legend: { display: false } }, responsive: true, maintainAspectRatio: true }} height={80} />
          </div>
        </div>
        <div className="col-12 col-lg-4 fade-in-6">
          <div className="card" style={{ padding: 20 }}>
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 12, letterSpacing: "0.1em", textTransform: "uppercase" }}>
              Events by Severity
            </div>
            <Doughnut data={doughnutData} options={{
              plugins: { legend: { position: "bottom", labels: { color: "#7b82a0", font: { family: "JetBrains Mono", size: 10 }, padding: 10 } } },
              cutout: "70%", responsive: true
            }} />
          </div>
        </div>
      </div>

      {/* Service health + recent events */}
      <div className="row g-3">
        <div className="col-12 col-lg-6">
          <div className="card" style={{ padding: 20 }}>
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 16, letterSpacing: "0.1em", textTransform: "uppercase" }}>
              Service Health
            </div>
            {services.length === 0 ? (
              <div style={{ color: "var(--text-muted)", textAlign: "center", padding: 20 }}>Loading...</div>
            ) : (
              <Bar data={barData} options={{ ...chartDefaults, responsive: true, maintainAspectRatio: true }} height={120} />
            )}
          </div>
        </div>
        <div className="col-12 col-lg-6">
          <div className="card" style={{ padding: 20 }}>
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 16, letterSpacing: "0.1em", textTransform: "uppercase" }}>
              Recent Events
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {events.slice(0, 5).map((ev, idx) => (
                <div key={ev.id} className={`event-item fade-in-${(idx % 6) + 1}`} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "8px 10px", borderRadius: 8, background: "var(--bg-secondary)", gap: 10
                }}>
                  <span className={severityBadge(ev.severity)} style={{ fontSize: 9, flexShrink: 0 }}>
                    {ev.severity}
                  </span>
                  <span style={{ flex: 1, fontSize: 11, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {ev.title}
                  </span>
                  <span style={{ fontSize: 10, color: "var(--text-muted)", flexShrink: 0 }}>{timeAgo(ev.createdAt)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
