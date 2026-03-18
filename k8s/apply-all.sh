#!/bin/bash
set -e
echo "🚀 Deploying Event Monitoring Platform to Kubernetes..."

kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml
kubectl apply -f k8s/postgres.yaml
kubectl apply -f k8s/redis.yaml

echo "⏳ Waiting for PostgreSQL..."
kubectl rollout status statefulset/postgres -n monitoring-platform --timeout=120s

kubectl apply -f k8s/backend.yaml
echo "⏳ Waiting for backend..."
kubectl rollout status deployment/backend -n monitoring-platform --timeout=120s

kubectl apply -f k8s/frontend.yaml
echo "⏳ Waiting for frontend..."
kubectl rollout status deployment/frontend -n monitoring-platform --timeout=120s

echo ""
echo "✅ Deployment complete!"
echo ""
kubectl get pods -n monitoring-platform
echo ""
kubectl get svc -n monitoring-platform
