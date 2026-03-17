# 🚀 Event Monitoring Platform

A full-stack event monitoring platform built with React, GraphQL, REST APIs, Sentry, Grafana, Docker, and Kubernetes.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Bootstrap 5, Apollo Client (GraphQL) |
| Backend | Node.js, Express, Apollo Server (GraphQL) |
| Monitoring | Sentry (error tracking), Grafana + Prometheus (metrics) |
| Infrastructure | Docker, Kubernetes (K8s) |
| Database | PostgreSQL + Redis |

## Project Structure

```
event-monitoring-platform/
├── frontend/          # React + Bootstrap + Apollo Client
├── backend/           # Node.js + Express + Apollo Server
├── k8s/               # Kubernetes manifests
├── monitoring/        # Grafana dashboards + Prometheus config
├── docker/            # Dockerfiles
└── docker-compose.yml # Local development
```

## Quick Start (Local Dev)

```bash
# 1. Clone & install
git clone <your-repo>
cd event-monitoring-platform

# 2. Set environment variables
cp .env.example .env
# Fill in your Sentry DSN etc.

# 3. Run everything with Docker Compose
docker-compose up --build

# Access:
# Frontend:  http://localhost:3000
# GraphQL:   http://localhost:4000/graphql
# REST API:  http://localhost:4000/api
# Grafana:   http://localhost:3001  (admin/admin)
# Prometheus:http://localhost:9090
```

## Kubernetes Deployment

```bash
# Apply all manifests
kubectl apply -f k8s/

# Check pods
kubectl get pods -n monitoring-platform

# Get service URLs
kubectl get svc -n monitoring-platform
```

## Features

- 📊 Real-time event monitoring dashboard
- 🔴 Live error tracking via Sentry
- 📈 Metrics visualization via Grafana
- 🔔 Alert management system
- 🏗️ GraphQL + REST dual API
- 🐳 Dockerized microservices
- ☸️ Kubernetes-ready with HPA
- 99.5% uptime design with health checks
