#!/bin/bash
echo " Starting Event Monitoring Platform (local dev)..."
echo ""
echo "Prerequisites: Docker + Docker Compose installed"
echo ""

# Copy env if not exists
if [ ! -f .env ]; then
  cp .env.example .env
  echo "📋 Created .env from .env.example — update SENTRY_DSN before running in production"
fi

docker-compose up --build

echo ""
echo "Services:"
echo "  Frontend:   http://localhost:3000"
echo "  GraphQL:    http://localhost:4000/graphql"
echo "  REST API:   http://localhost:4000/api"
echo "  Grafana:    http://localhost:3001  (admin / admin123)"
echo "  Prometheus: http://localhost:9090"
