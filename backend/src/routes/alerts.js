const express = require("express");
const { v4: uuidv4 } = require("uuid");
const { db } = require("../config/database");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { status } = req.query;
    let query = "SELECT * FROM alerts";
    const params = [];
    if (status) { query += " WHERE status = $1"; params.push(status); }
    query += " ORDER BY created_at DESC";
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { name, condition, threshold, service } = req.body;
    const id = uuidv4();
    const result = await db.query(
      "INSERT INTO alerts (id, name, condition, threshold, status, service) VALUES ($1,$2,$3,$4,'ACTIVE',$5) RETURNING *",
      [id, name, condition, threshold, service]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch("/:id/resolve", async (req, res) => {
  try {
    const result = await db.query(
      "UPDATE alerts SET status='RESOLVED', resolved_at=NOW() WHERE id=$1 RETURNING *",
      [req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: "Alert not found" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
