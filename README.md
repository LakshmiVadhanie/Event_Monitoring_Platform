# Event Monitoring Platform

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


## Features

-  Real-time event monitoring dashboard
-  Live error tracking via Sentry
-  Metrics visualization via Grafana
-  Alert management system
-  GraphQL + REST dual API
-  Dockerized microservices
-  Kubernetes-ready with HPA
- 99.5% uptime design with health checks
