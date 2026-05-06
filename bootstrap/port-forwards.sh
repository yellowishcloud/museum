#!/usr/bin/env bash
set -euo pipefail

kubectl port-forward svc/argocd-server -n argocd 8081:443 &
kubectl port-forward svc/monitoring-grafana -n monitoring 3000:80 &
kubectl port-forward svc/argo-rollouts-dashboard -n argo-rollouts 3100:3100 &
kubectl port-forward svc/musei-web -n museum-prod 8088:80 &

cat <<'NOTE'
Dashboards:
  Argo CD:         https://127.0.0.1:8081
  Grafana:         http://127.0.0.1:3000
  Argo Rollouts:   http://127.0.0.1:3100
  Museum app:       http://127.0.0.1:8088

Grafana credentials are stored in the cluster secret:
  kubectl -n monitoring get secret grafana-admin -o jsonpath='{.data.admin-user}' | base64 -d; echo
  kubectl -n monitoring get secret grafana-admin -o jsonpath='{.data.admin-password}' | base64 -d; echo

Press Ctrl+C to stop port-forwards.
NOTE

wait
