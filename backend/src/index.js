const express = require("express");
const cors = require("cors");
const { ApolloServer } = require("@apollo/server");
const { expressMiddleware } = require("@apollo/server/express4");
const bodyParser = require("body-parser");
const Sentry = require("@sentry/node");
const { ProfilingIntegration } = require("@sentry/profiling-node");

const { typeDefs } = require("./graphql/schema");
const { resolvers } = require("./resolvers");
const eventsRouter = require("./routes/events");
const alertsRouter = require("./routes/alerts");
const metricsRouter = require("./routes/metrics");
const { db } = require("./config/database");
const { logger } = require("./config/logger");
const { register } = require("./config/metrics");

async function startServer() {
  const app = express();

  // ── Sentry Init ────────────────────────────────────────────
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || "development",
    integrations: [
      new Sentry.Integrations.Http({ tracing: true }),
      new Sentry.Integrations.Express({ app }),
      new ProfilingIntegration(),
    ],
    tracesSampleRate: 1.0,
    profilesSampleRate: 1.0,
  });

  app.use(Sentry.Handlers.requestHandler());
  app.use(Sentry.Handlers.tracingHandler());

  // ── Middleware ─────────────────────────────────────────────
  app.use(cors({ origin: "*" }));
  app.use(bodyParser.json());

  // ── Health Check ───────────────────────────────────────────
  app.get("/health", async (req, res) => {
    try {
      await db.query("SELECT 1");
      res.json({
        status: "healthy",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: "1.0.0",
      });
    } catch (err) {
      res.status(503).json({ status: "unhealthy", error: err.message });
    }
  });

  // ── Prometheus Metrics ─────────────────────────────────────
  app.get("/metrics", async (req, res) => {
    res.set("Content-Type", register.contentType);
    res.end(await register.metrics());
  });

  // ── REST Routes ────────────────────────────────────────────
  app.use("/api/events", eventsRouter);
  app.use("/api/alerts", alertsRouter);
  app.use("/api/metrics", metricsRouter);

  // ── GraphQL ────────────────────────────────────────────────
  const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
    formatError: (error) => {
      Sentry.captureException(error);
      logger.error("GraphQL error", { error: error.message });
      return error;
    },
  });

  await apolloServer.start();
  app.use(
    "/graphql",
    expressMiddleware(apolloServer, {
      context: async ({ req }) => ({ db, req }),
    })
  );

  // ── Sentry Error Handler ───────────────────────────────────
  app.use(Sentry.Handlers.errorHandler());

  // ── Global Error Handler ───────────────────────────────────
  app.use((err, req, res, next) => {
    logger.error("Unhandled error", { error: err.message, stack: err.stack });
    res.status(500).json({ error: "Internal server error" });
  });

  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    logger.info(`🚀 Backend running on port ${PORT}`);
    logger.info(`📊 GraphQL: http://localhost:${PORT}/graphql`);
    logger.info(`🔗 REST API: http://localhost:${PORT}/api`);
    logger.info(`📈 Metrics: http://localhost:${PORT}/metrics`);
  });
}

startServer().catch((err) => {
  console.error("Fatal startup error:", err);
  process.exit(1);
});
