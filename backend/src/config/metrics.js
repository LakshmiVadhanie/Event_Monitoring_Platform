const promClient = require("prom-client");

const register = new promClient.Registry();
promClient.collectDefaultMetrics({ register });

const httpRequestCounter = new promClient.Counter({
  name: "http_requests_total",
  help: "Total HTTP requests",
  labelNames: ["method", "route", "status_code"],
  registers: [register],
});

const activeEventsGauge = new promClient.Gauge({
  name: "active_events_total",
  help: "Currently active/open events",
  registers: [register],
});

const eventResolutionHistogram = new promClient.Histogram({
  name: "event_resolution_duration_hours",
  help: "Time to resolve events in hours",
  buckets: [0.5, 1, 2, 4, 8, 24, 48],
  registers: [register],
});

const requestDurationHistogram = new promClient.Histogram({
  name: "http_request_duration_ms",
  help: "HTTP request duration in milliseconds",
  labelNames: ["method", "route"],
  buckets: [5, 10, 25, 50, 100, 250, 500, 1000],
  registers: [register],
});

module.exports = {
  register,
  httpRequestCounter,
  activeEventsGauge,
  eventResolutionHistogram,
  requestDurationHistogram,
};
