import React, { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { GET_ALERTS, RESOLVE_ALERT } from "../graphql/queries";
import { timeAgo, SERVICES } from "../utils/helpers";

export default function Alerts() {
  const [filter, setFilter] = useState("");
  const { data, loading, refetch } = useQuery(GET_ALERTS, {
    variables: { status: filter || undefined },
    pollInterval: 15000,
  });
  const [resolveAlert] = useMutation(RESOLVE_ALERT, { onCompleted: () => refetch() });

  const alerts = data?.alerts || [];

  function statusColor(status) {
    if (status === "ACTIVE") return "var(--accent-red)";
    if (status === "RESOLVED") return "var(--accent-green)";
    return "var(--text-muted)";
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 26, margin: 0 }}>Alerts</h1>
          <p style={{ color: "var(--text-secondary)", margin: "4px 0 0", fontSize: 12 }}>
            Sentry-integrated • {alerts.filter(a => a.status === "ACTIVE").length} active
          </p>
        </div>
        <select className="form-select form-select-sm" style={{ width: 140 }} value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="RESOLVED">Resolved</option>
          <option value="SILENCED">Silenced</option>
        </select>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 48, color: "var(--text-muted)" }}>Loading alerts...</div>
      ) : alerts.length === 0 ? (
        <div className="card" style={{ padding: 48, textAlign: "center", color: "var(--text-muted)" }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>✅</div>
          <div>No alerts found for this filter</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {alerts.map(alert => (
            <div key={alert.id} className="card fade-in" style={{ padding: "18px 20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <div style={{
                      width: 8, height: 8, borderRadius: "50%",
                      background: statusColor(alert.status),
                      boxShadow: alert.status === "ACTIVE" ? `0 0 8px ${statusColor(alert.status)}` : "none"
                    }} />
                    <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14 }}>{alert.name}</span>
                    <span style={{ fontSize: 10, color: statusColor(alert.status), background: `${statusColor(alert.status)}18`, padding: "2px 8px", borderRadius: 4, border: `1px solid ${statusColor(alert.status)}30` }}>
                      {alert.status}
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                    {[
                      ["Condition", alert.condition],
                      ["Threshold", alert.threshold],
                      ["Service", alert.service],
                      ["Triggered", timeAgo(alert.triggeredAt)],
                    ].map(([k, v]) => (
                      <div key={k} style={{ fontSize: 11 }}>
                        <span style={{ color: "var(--text-muted)" }}>{k}: </span>
                        <span style={{ color: "var(--text-secondary)" }}>{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {alert.status === "ACTIVE" && (
                  <button className="btn btn-sm" style={{ fontSize: 10, padding: "4px 12px", background: "rgba(0,230,118,0.1)", color: "var(--accent-green)", border: "1px solid rgba(0,230,118,0.2)", flexShrink: 0 }}
                    onClick={() => resolveAlert({ variables: { id: alert.id } })}>
                    Resolve
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
