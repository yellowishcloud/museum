# Musei Kasteev Final Defense Guide

## 60-Second Opening

Musei Kasteev is a digital museum information system deployed on a Kubernetes cluster using a GitOps workflow. The live stack includes Argo CD, Argo Rollouts, ingress-nginx, PostgreSQL, Prometheus/Grafana metrics, Loki/Promtail logs, metrics-server autoscaling, secured namespaces, persistent storage, and a custom `MuseumBackupPolicy` CRD.

The business application has two main services: `musei-web` for the frontend and `musei-api` for the backend. Both use Argo Rollouts canary strategy, so updates move gradually instead of replacing the full system at once. The API can now be canary because I replaced SQLite with PostgreSQL, which removes the single-file database problem.

For security, the workloads run as non-root, drop Linux capabilities, use ResourceQuotas and LimitRanges, and are protected by NetworkPolicies. For reliability, the app has HPA autoscaling, PDBs, readiness/liveness probes, persistent database storage, monitoring, logs, and a backup-policy controller proof.

## Best Live Demo Order

1. `kubectl get nodes -o wide` — show the cluster topology.
2. `kubectl get applications -n argocd -o wide` — show GitOps apps all Synced/Healthy and reconciled from GitHub.
3. `kubectl get rollout,deploy,svc,ingress,pvc,hpa -n museum-prod` — show business architecture.
4. `kubectl get pods -n monitoring` and `kubectl get pods -n logging` — show metrics and logs.
5. `kubectl get networkpolicy,resourcequota,limitrange,pdb -n museum-prod` — show security and governance.
6. `kubectl get museumbackuppolicies -n museum-prod` and the generated ConfigMap — show the CRD/controller.
7. Open the app at `http://127.0.0.1:8088` after port-forwarding `svc/musei-web`.
8. Show a canary update by patching a rollout annotation and watching ReplicaSets change.

## Exact Answers

### Do we meet Perfection?

Yes. The live cluster has defined release strategies, working autoscaling, a CRD/controller, monitoring, logging, secure workload controls, persistent PostgreSQL storage, and a complete business application.

### What is the GitOps source of truth?

The source of truth is `https://github.com/yellowishcloud/museum.git`. Argo CD tracks the `main` branch and reconciles both the business app and the custom extension from Git. Manual cluster drift is visible in Argo CD, so the defense can show that the cluster is not just “installed manually”; it is managed declaratively.

### Why PostgreSQL instead of SQLite?

SQLite is good for a local prototype, but it is a single-file database and does not fit multiple API replicas or canary updates cleanly. PostgreSQL makes the API stateless enough for scaling and progressive delivery.

### What is the release strategy?

The frontend and API use Argo Rollouts canary strategy. The frontend moves 25% -> 50% -> 100%; the API moves 50% -> 100%. PostgreSQL uses a safer single-instance persistent update model.

### What proves autoscaling works?

`metrics-server` is installed, `kubectl top` returns metrics, and both `musei-web` and `musei-api` have HPAs with live CPU targets.

### What proves monitoring and logs?

Prometheus, Grafana, Alertmanager, Loki, and Promtail are running. Grafana has Prometheus and Loki data sources, so the defense can show both metrics and log infrastructure.

### What proves security?

The namespace enforces restricted Pod Security. Pods run non-root, service account tokens are disabled where possible, capabilities are dropped, NetworkPolicies default-deny traffic, RBAC is least-privilege, and resources are controlled with quota and limits.

## One-Line Closing

This is not only an app on Kubernetes; it is a defended platform design with GitOps, progressive delivery, observability, storage, security, autoscaling, and a custom extension.
