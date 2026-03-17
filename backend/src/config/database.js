const { Pool } = require("pg");
const { logger } = require("./logger");

const db = new Pool({
  host: process.env.POSTGRES_HOST || "localhost",
  port: parseInt(process.env.POSTGRES_PORT || "5432"),
  database: process.env.POSTGRES_DB || "events_db",
  user: process.env.POSTGRES_USER || "postgres",
  password: process.env.POSTGRES_PASSWORD || "postgres123",
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

db.on("connect", () => logger.info("PostgreSQL connected"));
db.on("error", (err) => logger.error("PostgreSQL error", { error: err.message }));

module.exports = { db };
