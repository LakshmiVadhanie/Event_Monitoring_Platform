import React from "react";
import { useQuery } from "@apollo/client";
import { GET_SERVICE_HEALTH } from "../graphql/queries";

export default function Services() {
  const { data, loading } = useQuery(GET_SERVICE_HEALTH, { pollInterval: 20000 });
  const services = data?.serviceHealth || [];

  function statusColor(status) {
    return status === "healthy" ? "var(--accent-green)" : "var(--accent-orange)";
  }

  function uptimeColor(uptime) {
    if (uptime >= 99.5) return "var(--accent-green)";
    if (uptime >= 99) return "var(--accent-yellow)";
    return "var(--accent-red)";
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 26, margin: 0 }}>Services</h1>
        <p style={{ color: "var(--text-secondary)", margin: "4px 0 0", fontSize: 12 }}>
          Kubernetes microservices • Grafana monitored • Docker containerized
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 48, color: "var(--text-muted)" }}>Checking service health...</div>
      ) : (
        <div className="row g-3">
          {services.map(svc => (
            <div key={svc.service} className="col-12 col-md-6 col-xl-4">
              <div className="card metric-card fade-in" style={{ padding: "20px 22px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15 }}>{svc.service}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: statusColor(svc.status), boxShadow: `0 0 8px ${statusColor(svc.status)}` }} />
                    <span style={{ fontSize: 10, color: statusColor(svc.status) }}>{svc.status}</span>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {[
                    { label: "Uptime", value: `${svc.uptime}%`, color: uptimeColor(svc.uptime) },
                    { label: "Error Rate", value: `${svc.errorRate}%`, color: svc.errorRate > 2 ? "var(--accent-red)" : "var(--accent-green)" },
                    { label: "Latency (P99)", value: `${svc.latencyMs}ms`, color: svc.latencyMs > 100 ? "var(--accent-orange)" : "var(--accent-cyan)" },
                  ].map(({ label, value, color }) => (
                    <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{label}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color }}>{value}</span>
                    </div>
                  ))}

                  {/* Uptime bar */}
                  <div style={{ marginTop: 4 }}>
                    <div style={{ height: 4, background: "var(--border)", borderRadius: 2, overflow: "hidden" }}>
                      <div style={{
                        height: "100%", borderRadius: 2,
                        width: `${svc.uptime}%`,
                        background: `linear-gradient(90deg, ${uptimeColor(svc.uptime)}, ${uptimeColor(svc.uptime)}aa)`,
                        transition: "width 0.5s ease"
                      }} />
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: 12, fontSize: 10, color: "var(--text-muted)" }}>
                  Last checked: {new Date(svc.lastChecked).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Docker/K8s info cards */}
      <div className="row g-3 mt-2">
        {[
          { icon: "🐳", title: "Docker", desc: "All services containerized with multi-stage builds. Images pushed to Docker Hub / ECR.", tags: ["node:20-alpine", "nginx:alpine", "postgres:15", "redis:7"] },
          { icon: "☸️", title: "Kubernetes", desc: "Deployed on K8s with HPA, health checks, resource limits, and rolling updates.", tags: ["Deployment", "Service", "HPA", "ConfigMap"] },
          { icon: "📊", title: "Grafana", desc: "Dashboards for request rate, error rate, latency, and MTTR. Prometheus data source.", tags: ["Prometheus", "Alerts", "Panels", "Variables"] },
          { icon: "🔴", title: "Sentry", desc: "Error tracking with stack traces, breadcrumbs, performance monitoring, and release tracking.", tags: ["Tracing", "Profiling", "Replays", "Alerts"] },
        ].map(({ icon, title, desc, tags }) => (
          <div key={title} className="col-12 col-md-6">
            <div className="card" style={{ padding: "18px 20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <span style={{ fontSize: 20 }}>{icon}</span>
                <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15 }}>{title}</span>
              </div>
              <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: "0 0 12px" }}>{desc}</p>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {tags.map(t => (
                  <span key={t} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 4, background: "rgba(79,142,247,0.1)", color: "var(--accent-blue)", border: "1px solid rgba(79,142,247,0.2)" }}>{t}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
