#!/usr/bin/env bash
set -euo pipefail

echo "Cluster topology"
kubectl get nodes -o wide

echo "GitOps applications"
kubectl get applications -n argocd

echo "Business app"
kubectl get rollout,deploy,svc,ingress,pvc,hpa,networkpolicy -n museum-prod

echo "Deny-all policy proof"
kubectl get networkpolicy deny-all -n museum-prod -o yaml

echo "Custom CRD proof"
kubectl get crd museumbackuppolicies.devops.aknie.kz
kubectl get museumbackuppolicies -n museum-prod
kubectl get configmap -n museum-prod backup-policy-sqlite-daily -o yaml

echo "Monitoring proof"
kubectl get pods,svc,pvc -n monitoring

echo "Rollout update demo"
kubectl argo rollouts get rollout musei-web -n museum-prod || true

echo "App smoke test through ingress"
curl -fsS -H "Host: museum.local" http://127.0.0.1/api/healthz
