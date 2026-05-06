#!/usr/bin/env bash
set -euo pipefail

kubectl create namespace argocd --dry-run=client -o yaml | kubectl apply -f -
kubectl apply --server-side --force-conflicts -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
kubectl rollout status deployment/argocd-server -n argocd --timeout=300s
kubectl rollout status statefulset/argocd-application-controller -n argocd --timeout=300s

kubectl create namespace monitoring --dry-run=client -o yaml | kubectl apply -f -
if ! kubectl -n monitoring get secret grafana-admin >/dev/null 2>&1; then
  generate_password() {
    if command -v openssl >/dev/null 2>&1; then
      openssl rand -base64 24
    else
      head -c 24 /dev/urandom | base64
    fi
  }

  GRAFANA_ADMIN_USER="${GRAFANA_ADMIN_USER:-admin}"
  GRAFANA_ADMIN_PASSWORD="${GRAFANA_ADMIN_PASSWORD:-$(generate_password)}"
  kubectl -n monitoring create secret generic grafana-admin \
    --from-literal=admin-user="$GRAFANA_ADMIN_USER" \
    --from-literal=admin-password="$GRAFANA_ADMIN_PASSWORD" \
    --dry-run=client -o yaml | kubectl apply -f -
fi

kubectl apply -k clusters/microk8s

cat <<'NOTE'
Argo CD is installed and the final-project app-of-apps has been applied.

Open dashboards for the live demo:

  kubectl port-forward svc/argocd-server -n argocd 8081:443
  kubectl port-forward svc/monitoring-grafana -n monitoring 3000:80
  kubectl port-forward svc/argo-rollouts-dashboard -n argo-rollouts 3100:3100

Passwords:

  Argo CD admin:
    kubectl -n argocd get secret argocd-initial-admin-secret \
      -o jsonpath='{.data.password}' | base64 -d; echo

  Grafana:
    kubectl -n monitoring get secret grafana-admin \
      -o jsonpath='{.data.admin-user}' | base64 -d; echo
    kubectl -n monitoring get secret grafana-admin \
      -o jsonpath='{.data.admin-password}' | base64 -d; echo
NOTE
