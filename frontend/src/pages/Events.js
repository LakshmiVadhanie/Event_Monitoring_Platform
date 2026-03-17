import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client";
import { GET_EVENTS, CREATE_EVENT, UPDATE_EVENT_STATUS } from "../graphql/queries";
import { severityBadge, statusBadge, timeAgo, SERVICES, SEVERITIES, STATUSES, ENVIRONMENTS } from "../utils/helpers";

export default function Events() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState({ 
    severity: searchParams.get("severity") || "", 
    status: searchParams.get("status") || "", 
    service: searchParams.get("service") || "" 
  });
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", severity: "MEDIUM", service: "api-gateway", environment: "production", tags: "" });
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Sync state if URL changes directly
  useEffect(() => {
    setFilters({
      severity: searchParams.get("severity") || "",
      status: searchParams.get("status") || "",
      service: searchParams.get("service") || ""
    });
  }, [searchParams]);

  const handleFilterChange = (key, value) => {
    setFilters(f => ({ ...f, [key]: value }));
    setPage(1);
    const newParams = new URLSearchParams(searchParams);
    if (value) newParams.set(key, value);
    else newParams.delete(key);
    setSearchParams(newParams, { replace: true });
  };

  const { data, loading, refetch } = useQuery(GET_EVENTS, {
    variables: {
      page, pageSize: 15,
      severity: filters.severity || undefined,
      status: filters.status || undefined,
      service: filters.service || undefined,
    },
    pollInterval: 10000,
  });

  const [createEvent, { loading: creating }] = useMutation(CREATE_EVENT, {
    onCompleted: () => { setShowModal(false); refetch(); setForm({ title: "", description: "", severity: "MEDIUM", service: "api-gateway", environment: "production", tags: "" }); }
  });

  const [updateStatus] = useMutation(UPDATE_EVENT_STATUS, { onCompleted: () => refetch() });

  const events = data?.events?.events || [];
  const total = data?.events?.total || 0;
  const totalPages = Math.ceil(total / 15);

  function handleCreate(e) {
    e.preventDefault();
    createEvent({ variables: { ...form, tags: form.tags ? form.tags.split(",").map(t => t.trim()) : [] } });
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 26, margin: 0 }}>Events</h1>
          <p style={{ color: "var(--text-secondary)", margin: "4px 0 0", fontSize: 12 }}>
            {total} total events • GraphQL + REST dual API
          </p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
          <i className="bi bi-plus-lg me-1" /> New Event
        </button>
      </div>

      {/* Filters */}
      <div className="card mb-3" style={{ padding: "14px 16px" }}>
        <div className="row g-2">
          {[
            { key: "severity", options: ["", ...SEVERITIES], label: "Severity" },
            { key: "status", options: ["", ...STATUSES], label: "Status" },
            { key: "service", options: ["", ...SERVICES], label: "Service" },
          ].map(({ key, options, label }) => (
            <div className="col-12 col-md-4" key={key}>
              <select className="form-select form-select-sm" value={filters[key]}
                onChange={e => handleFilterChange(key, e.target.value)}>
                <option value="">All {label}s</option>
                {options.filter(Boolean).map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table className="table table-hover mb-0">
            <thead>
              <tr style={{ borderColor: "var(--border)" }}>
                {["Severity", "Status", "Title", "Service", "Env", "Errors", "Created", "Actions"].map(h => (
                  <th key={h} style={{ color: "var(--text-muted)", fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", padding: "12px 14px", background: "var(--bg-secondary)", borderBottom: "1px solid var(--border)", fontWeight: 500 }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} style={{ textAlign: "center", padding: 32, color: "var(--text-muted)" }}>Loading events...</td></tr>
              ) : events.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: "center", padding: 32, color: "var(--text-muted)" }}>No events found</td></tr>
              ) : events.map(ev => (
                <tr key={ev.id} style={{ cursor: "pointer" }} onClick={() => setSelectedEvent(ev)}>
                  <td style={{ padding: "10px 14px" }}>
                    <span className={severityBadge(ev.severity)} style={{ fontSize: 9 }}>{ev.severity}</span>
                  </td>
                  <td style={{ padding: "10px 14px" }}>
                    <span className={statusBadge(ev.status)} style={{ fontSize: 9 }}>{ev.status}</span>
                  </td>
                  <td style={{ padding: "10px 14px", maxWidth: 240 }}>
                    <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: 12 }}>{ev.title}</div>
                  </td>
                  <td style={{ padding: "10px 14px", fontSize: 11, color: "var(--text-secondary)" }}>{ev.service}</td>
                  <td style={{ padding: "10px 14px", fontSize: 11, color: "var(--text-muted)" }}>{ev.environment}</td>
                  <td style={{ padding: "10px 14px", fontSize: 11, color: ev.errorCount > 50 ? "var(--accent-red)" : "var(--text-secondary)" }}>{ev.errorCount}</td>
                  <td style={{ padding: "10px 14px", fontSize: 11, color: "var(--text-muted)", whiteSpace: "nowrap" }}>{timeAgo(ev.createdAt)}</td>
                  <td style={{ padding: "10px 14px" }} onClick={e => e.stopPropagation()}>
                    <div style={{ display: "flex", gap: 4 }}>
                      {ev.status === "OPEN" && (
                        <button className="btn btn-sm" style={{ fontSize: 10, padding: "2px 8px", background: "rgba(255,215,64,0.1)", color: "var(--accent-yellow)", border: "1px solid rgba(255,215,64,0.2)" }}
                          onClick={() => updateStatus({ variables: { id: ev.id, status: "ACKNOWLEDGED" } })}>
                          ACK
                        </button>
                      )}
                      {ev.status !== "RESOLVED" && ev.status !== "CLOSED" && (
                        <button className="btn btn-sm" style={{ fontSize: 10, padding: "2px 8px", background: "rgba(0,230,118,0.1)", color: "var(--accent-green)", border: "1px solid rgba(0,230,118,0.2)" }}
                          onClick={() => updateStatus({ variables: { id: ev.id, status: "RESOLVED" } })}>
                          RESOLVE
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ padding: "12px 16px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Page {page} of {totalPages} • {total} events</span>
            <div style={{ display: "flex", gap: 4 }}>
              <button className="btn btn-sm" style={{ fontSize: 11, background: "var(--bg-secondary)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}
                onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>← Prev</button>
              <button className="btn btn-sm" style={{ fontSize: 11, background: "var(--bg-secondary)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next →</button>
            </div>
          </div>
        )}
      </div>

      {/* Create Event Modal */}
      {showModal && (
        <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.7)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}>Create Event</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)} />
              </div>
              <form onSubmit={handleCreate}>
                <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <input className="form-control" placeholder="Event title *" required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
                  <textarea className="form-control" placeholder="Description" rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                  <div className="row g-2">
                    <div className="col-6">
                      <select className="form-select" value={form.severity} onChange={e => setForm(f => ({ ...f, severity: e.target.value }))}>
                        {SEVERITIES.map(s => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                    <div className="col-6">
                      <select className="form-select" value={form.service} onChange={e => setForm(f => ({ ...f, service: e.target.value }))}>
                        {SERVICES.map(s => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                    <div className="col-6">
                      <select className="form-select" value={form.environment} onChange={e => setForm(f => ({ ...f, environment: e.target.value }))}>
                        {ENVIRONMENTS.map(e => <option key={e}>{e}</option>)}
                      </select>
                    </div>
                    <div className="col-6">
                      <input className="form-control" placeholder="Tags (comma-separated)" value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-sm" style={{ color: "var(--text-secondary)", background: "none", border: "1px solid var(--border)" }} onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={creating}>{creating ? "Creating..." : "Create Event"}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.7)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15 }}>{selectedEvent.title}</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setSelectedEvent(null)} />
              </div>
              <div className="modal-body">
                <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                  <span className={severityBadge(selectedEvent.severity)} style={{ fontSize: 10 }}>{selectedEvent.severity}</span>
                  <span className={statusBadge(selectedEvent.status)} style={{ fontSize: 10 }}>{selectedEvent.status}</span>
                </div>
                {[
                  ["Service", selectedEvent.service], ["Environment", selectedEvent.environment],
                  ["Error Count", selectedEvent.errorCount], ["Created", timeAgo(selectedEvent.createdAt)],
                  ["Resolved", selectedEvent.resolvedAt ? timeAgo(selectedEvent.resolvedAt) : "—"],
                  ["Tags", selectedEvent.tags?.join(", ") || "—"],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid var(--border)", fontSize: 12 }}>
                    <span style={{ color: "var(--text-muted)" }}>{k}</span>
                    <span style={{ color: "var(--text-primary)" }}>{v}</span>
                  </div>
                ))}
                {selectedEvent.description && (
                  <div style={{ marginTop: 12, padding: 12, background: "var(--bg-secondary)", borderRadius: 8, fontSize: 12, color: "var(--text-secondary)" }}>
                    {selectedEvent.description}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
