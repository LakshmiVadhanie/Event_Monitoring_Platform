-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT DEFAULT '',
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  status VARCHAR(20) NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'ACKNOWLEDGED', 'RESOLVED', 'CLOSED')),
  service VARCHAR(100) NOT NULL,
  environment VARCHAR(50) NOT NULL DEFAULT 'production',
  tags TEXT[] DEFAULT '{}',
  error_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- Create alerts table
CREATE TABLE IF NOT EXISTS alerts (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  condition VARCHAR(500) NOT NULL,
  threshold NUMERIC NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'RESOLVED', 'SILENCED')),
  service VARCHAR(100) NOT NULL,
  triggered_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_severity ON events(severity);
CREATE INDEX IF NOT EXISTS idx_events_service ON events(service);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_status ON alerts(status);

-- Seed data
INSERT INTO events (id, title, description, severity, status, service, environment, tags, error_count) VALUES
  (gen_random_uuid(), 'High CPU usage on api-gateway', 'CPU exceeded 90% for 5 minutes', 'HIGH', 'OPEN', 'api-gateway', 'production', '{"infrastructure","performance"}', 14),
  (gen_random_uuid(), 'Database connection pool exhausted', 'Max connections reached on primary DB', 'CRITICAL', 'OPEN', 'auth-service', 'production', '{"database","critical"}', 89),
  (gen_random_uuid(), 'Slow query detected', 'Query taking >2s on events table', 'MEDIUM', 'ACKNOWLEDGED', 'event-processor', 'production', '{"database","performance"}', 3),
  (gen_random_uuid(), '404 spike on /api/users', '3x increase in 404 responses', 'LOW', 'RESOLVED', 'api-gateway', 'staging', '{"api","errors"}', 45),
  (gen_random_uuid(), 'Memory leak in notification service', 'Heap usage growing 10MB/min', 'CRITICAL', 'OPEN', 'notification-service', 'production', '{"memory","critical"}', 7),
  (gen_random_uuid(), 'SSL certificate expiring', 'Certificate expires in 7 days', 'HIGH', 'OPEN', 'api-gateway', 'production', '{"security","certificate"}', 1),
  (gen_random_uuid(), 'Redis cache miss rate high', 'Cache miss rate at 45%, expected <10%', 'MEDIUM', 'OPEN', 'event-processor', 'production', '{"cache","performance"}', 22),
  (gen_random_uuid(), 'Deployment successful', 'v2.4.1 deployed to production', 'LOW', 'RESOLVED', 'api-gateway', 'production', '{"deploy"}', 0)
ON CONFLICT DO NOTHING;

INSERT INTO alerts (id, name, condition, threshold, status, service) VALUES
  (gen_random_uuid(), 'CPU Alert', 'cpu_usage > threshold', 85.0, 'ACTIVE', 'api-gateway'),
  (gen_random_uuid(), 'Error Rate Alert', 'error_rate > threshold', 5.0, 'ACTIVE', 'auth-service'),
  (gen_random_uuid(), 'Memory Alert', 'memory_usage > threshold', 90.0, 'RESOLVED', 'notification-service'),
  (gen_random_uuid(), 'Latency Alert', 'p99_latency_ms > threshold', 500.0, 'ACTIVE', 'event-processor')
ON CONFLICT DO NOTHING;
