const express = require("express");
const { v4: uuidv4 } = require("uuid");
const { db } = require("../config/database");
const { logger } = require("../config/logger");
const { httpRequestCounter } = require("../config/metrics");

const router = express.Router();

// GET /api/events
router.get("/", async (req, res) => {
  const start = Date.now();
  try {
    const { page = 1, pageSize = 20, severity, status, service } = req.query;
    let query = "SELECT * FROM events WHERE 1=1";
    const params = [];
    let idx = 1;

    if (severity) { query += ` AND severity = $${idx++}`; params.push(severity); }
    if (status) { query += ` AND status = $${idx++}`; params.push(status); }
    if (service) { query += ` AND service = $${idx++}`; params.push(service); }

    const countQ = await db.query(query.replace("SELECT *", "SELECT COUNT(*)"), params);
    query += ` ORDER BY created_at DESC LIMIT $${idx++} OFFSET $${idx++}`;
    params.push(parseInt(pageSize), (parseInt(page) - 1) * parseInt(pageSize));

    const result = await db.query(query, params);
    httpRequestCounter.inc({ method: "GET", route: "/api/events", status_code: 200 });

    res.json({
      events: result.rows,
      total: parseInt(countQ.rows[0].count),
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      duration: Date.now() - start,
    });
  } catch (err) {
    logger.error("GET /api/events error", { error: err.message });
    httpRequestCounter.inc({ method: "GET", route: "/api/events", status_code: 500 });
    res.status(500).json({ error: err.message });
  }
});

// GET /api/events/:id
router.get("/:id", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM events WHERE id = $1", [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: "Event not found" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/events
router.post("/", async (req, res) => {
  try {
    const { title, description, severity, service, environment, tags } = req.body;
    if (!title || !severity || !service || !environment) {
      return res.status(400).json({ error: "Missing required fields: title, severity, service, environment" });
    }

    const id = uuidv4();
    const result = await db.query(
      `INSERT INTO events (id, title, description, severity, status, service, environment, tags, error_count)
       VALUES ($1, $2, $3, $4, 'OPEN', $5, $6, $7, 0) RETURNING *`,
      [id, title, description || "", severity, service, environment, tags || []]
    );

    logger.info("Event created via REST", { id, severity, service });
    httpRequestCounter.inc({ method: "POST", route: "/api/events", status_code: 201 });
    res.status(201).json(result.rows[0]);
  } catch (err) {
    logger.error("POST /api/events error", { error: err.message });
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/events/:id/status
router.patch("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["OPEN", "ACKNOWLEDGED", "RESOLVED", "CLOSED"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` });
    }

    const resolved = status === "RESOLVED" ? new Date().toISOString() : null;
    const result = await db.query(
      "UPDATE events SET status = $1, resolved_at = $2, updated_at = NOW() WHERE id = $3 RETURNING *",
      [status, resolved, req.params.id]
    );

    if (!result.rows[0]) return res.status(404).json({ error: "Event not found" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/events/:id
router.delete("/:id", async (req, res) => {
  try {
    await db.query("DELETE FROM events WHERE id = $1", [req.params.id]);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
