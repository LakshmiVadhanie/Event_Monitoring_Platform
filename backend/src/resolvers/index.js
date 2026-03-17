const { v4: uuidv4 } = require("uuid");
const { logger } = require("../config/logger");
const {
  httpRequestCounter,
  activeEventsGauge,
  eventResolutionHistogram,
} = require("../config/metrics");

const resolvers = {
  Query: {
    events: async (_, { page = 1, pageSize = 20, severity, status, service }, { db }) => {
      try {
        httpRequestCounter.inc({ method: "QUERY", route: "events", status_code: 200 });

        let query = "SELECT * FROM events WHERE 1=1";
        const params = [];
        let idx = 1;

        if (severity) { query += ` AND severity = $${idx++}`; params.push(severity); }
        if (status) { query += ` AND status = $${idx++}`; params.push(status); }
        if (service) { query += ` AND service = $${idx++}`; params.push(service); }

        const countResult = await db.query(
          query.replace("SELECT *", "SELECT COUNT(*)"), params
        );
        const total = parseInt(countResult.rows[0].count);

        query += ` ORDER BY created_at DESC LIMIT $${idx++} OFFSET $${idx++}`;
        params.push(pageSize, (page - 1) * pageSize);

        const result = await db.query(query, params);
        return {
          events: result.rows.map(mapEvent),
          total,
          page,
          pageSize,
        };
      } catch (err) {
        logger.error("Error fetching events", { error: err.message });
        throw err;
      }
    },

    event: async (_, { id }, { db }) => {
      const result = await db.query("SELECT * FROM events WHERE id = $1", [id]);
      return result.rows[0] ? mapEvent(result.rows[0]) : null;
    },

    alerts: async (_, { status }, { db }) => {
      let query = "SELECT * FROM alerts";
      const params = [];
      if (status) { query += " WHERE status = $1"; params.push(status); }
      query += " ORDER BY created_at DESC";
      const result = await db.query(query, params);
      return result.rows.map(mapAlert);
    },

    metricSummary: async (_, __, { db }) => {
      const [total, open, critical, avgRes] = await Promise.all([
        db.query("SELECT COUNT(*) FROM events"),
        db.query("SELECT COUNT(*) FROM events WHERE status = 'OPEN'"),
        db.query("SELECT COUNT(*) FROM events WHERE severity = 'CRITICAL' AND status = 'OPEN'"),
        db.query(
          `SELECT AVG(EXTRACT(EPOCH FROM (resolved_at - created_at))/3600) as avg_hours
           FROM events WHERE resolved_at IS NOT NULL`
        ),
      ]);

      return {
        totalEvents: parseInt(total.rows[0].count),
        openEvents: parseInt(open.rows[0].count),
        criticalEvents: parseInt(critical.rows[0].count),
        avgResolutionTimeHours: parseFloat(avgRes.rows[0].avg_hours) || 0,
        uptimePercent: 99.5,
        requestsPerMinute: Math.floor(Math.random() * 200 + 800),
        errorRate: parseFloat((Math.random() * 0.5).toFixed(2)),
        mttr: parseFloat((avgRes.rows[0].avg_hours || 2.4).toFixed(2)),
      };
    },

    serviceHealth: async (_, __, { db }) => {
      const services = ["api-gateway", "auth-service", "event-processor", "notification-service", "frontend"];
      return services.map((service) => ({
        service,
        status: Math.random() > 0.1 ? "healthy" : "degraded",
        uptime: parseFloat((99 + Math.random()).toFixed(2)),
        errorRate: parseFloat((Math.random() * 0.5).toFixed(2)),
        latencyMs: parseFloat((Math.random() * 50 + 10).toFixed(1)),
        lastChecked: new Date().toISOString(),
      }));
    },
  },

  Mutation: {
    createEvent: async (_, args, { db }) => {
      const id = uuidv4();
      const result = await db.query(
        `INSERT INTO events (id, title, description, severity, status, service, environment, tags, error_count)
         VALUES ($1, $2, $3, $4, 'OPEN', $5, $6, $7, 0) RETURNING *`,
        [id, args.title, args.description || "", args.severity, args.service, args.environment, args.tags || []]
      );
      activeEventsGauge.inc();
      logger.info("Event created", { id, severity: args.severity, service: args.service });
      return mapEvent(result.rows[0]);
    },

    updateEventStatus: async (_, { id, status }, { db }) => {
      const resolved = status === "RESOLVED" ? new Date().toISOString() : null;
      const result = await db.query(
        `UPDATE events SET status = $1, resolved_at = $2, updated_at = NOW()
         WHERE id = $3 RETURNING *`,
        [status, resolved, id]
      );
      if (status === "RESOLVED") {
        activeEventsGauge.dec();
        eventResolutionHistogram.observe(Math.random() * 10);
      }
      return mapEvent(result.rows[0]);
    },

    acknowledgeEvent: async (_, { id }, { db }) => {
      const result = await db.query(
        "UPDATE events SET status = 'ACKNOWLEDGED', updated_at = NOW() WHERE id = $1 RETURNING *",
        [id]
      );
      return mapEvent(result.rows[0]);
    },

    resolveEvent: async (_, { id }, { db }) => {
      const result = await db.query(
        "UPDATE events SET status = 'RESOLVED', resolved_at = NOW(), updated_at = NOW() WHERE id = $1 RETURNING *",
        [id]
      );
      activeEventsGauge.dec();
      return mapEvent(result.rows[0]);
    },

    createAlert: async (_, args, { db }) => {
      const id = uuidv4();
      const result = await db.query(
        `INSERT INTO alerts (id, name, condition, threshold, status, service)
         VALUES ($1, $2, $3, $4, 'ACTIVE', $5) RETURNING *`,
        [id, args.name, args.condition, args.threshold, args.service]
      );
      return mapAlert(result.rows[0]);
    },

    resolveAlert: async (_, { id }, { db }) => {
      const result = await db.query(
        "UPDATE alerts SET status = 'RESOLVED', resolved_at = NOW() WHERE id = $1 RETURNING *",
        [id]
      );
      return mapAlert(result.rows[0]);
    },
  },
};

function mapEvent(row) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    severity: row.severity,
    status: row.status,
    service: row.service,
    environment: row.environment,
    tags: row.tags || [],
    errorCount: row.error_count || 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    resolvedAt: row.resolved_at,
  };
}

function mapAlert(row) {
  return {
    id: row.id,
    name: row.name,
    condition: row.condition,
    threshold: parseFloat(row.threshold),
    status: row.status,
    service: row.service,
    triggeredAt: row.triggered_at,
    resolvedAt: row.resolved_at,
    createdAt: row.created_at,
  };
}

module.exports = { resolvers };
