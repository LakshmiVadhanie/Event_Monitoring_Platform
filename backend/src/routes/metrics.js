const express = require("express");
const { db } = require("../config/database");
const router = express.Router();

router.get("/summary", async (req, res) => {
  try {
    const [total, open, critical, avgRes] = await Promise.all([
      db.query("SELECT COUNT(*) FROM events"),
      db.query("SELECT COUNT(*) FROM events WHERE status='OPEN'"),
      db.query("SELECT COUNT(*) FROM events WHERE severity='CRITICAL' AND status='OPEN'"),
      db.query(
        "SELECT AVG(EXTRACT(EPOCH FROM (resolved_at-created_at))/3600) as avg FROM events WHERE resolved_at IS NOT NULL"
      ),
    ]);

    res.json({
      totalEvents: parseInt(total.rows[0].count),
      openEvents: parseInt(open.rows[0].count),
      criticalEvents: parseInt(critical.rows[0].count),
      avgResolutionTimeHours: parseFloat(avgRes.rows[0].avg) || 0,
      uptimePercent: 99.5,
      requestsPerMinute: Math.floor(Math.random() * 200 + 800),
      errorRate: parseFloat((Math.random() * 0.5).toFixed(2)),
      mttr: parseFloat((avgRes.rows[0].avg || 2.4).toFixed(2)),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/by-severity", async (req, res) => {
  try {
    const result = await db.query(
      "SELECT severity, COUNT(*) as count FROM events GROUP BY severity"
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/by-service", async (req, res) => {
  try {
    const result = await db.query(
      "SELECT service, COUNT(*) as count, COUNT(CASE WHEN status='OPEN' THEN 1 END) as open FROM events GROUP BY service"
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
