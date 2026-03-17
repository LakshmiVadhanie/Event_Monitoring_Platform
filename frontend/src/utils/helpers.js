export const SEVERITY_ORDER = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };

export function severityBadge(severity) {
  return `badge badge-${severity.toLowerCase()} px-2 py-1 rounded`;
}

export function statusBadge(status) {
  return `badge badge-${status.toLowerCase()} px-2 py-1 rounded`;
}

export function timeAgo(dateStr) {
  if (!dateStr) return "—";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function formatDuration(hours) {
  if (!hours) return "—";
  if (hours < 1) return `${Math.round(hours * 60)}m`;
  if (hours < 24) return `${hours.toFixed(1)}h`;
  return `${(hours / 24).toFixed(1)}d`;
}

export const SERVICES = [
  "api-gateway", "auth-service", "event-processor",
  "notification-service", "frontend", "database-service"
];

export const SEVERITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
export const STATUSES = ["OPEN", "ACKNOWLEDGED", "RESOLVED", "CLOSED"];
export const ENVIRONMENTS = ["production", "staging", "development"];
