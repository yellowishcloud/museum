# Musei Kasteev DevOps II Final Project

Musei Kasteev is a digital museum prototype deployed on a Kubernetes cluster with a GitOps workflow. The final live stack uses Argo CD, Argo Rollouts, PostgreSQL, Prometheus/Grafana, Loki/Promtail logging, ingress-nginx, metrics-server, hardened workload policies, and a small custom Kubernetes extension.

## What Is Implemented

- Museum web UI and Node API with PostgreSQL persistence.
- GitOps delivery through Argo CD Applications.
- Canary rollouts for both the frontend and API through Argo Rollouts.
- Working autoscaling through HorizontalPodAutoscalers backed by metrics-server.
- ingress-nginx Ingress Controller and `museum.local` Ingress route.
- PostgreSQL database with PVC-backed DigitalOcean Block Storage.
- Monitoring with Prometheus and Grafana; logging with Loki and Promtail.
- Namespace hardening: restricted pod security labels, non-root pods, dropped capabilities, ResourceQuota, LimitRange, RBAC, NetworkPolicies, and PodDisruptionBudgets.
- `MuseumBackupPolicy` CRD plus controller reconciliation into a managed ConfigMap.
