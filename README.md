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

## Live Verification Commands

```bash
kubectl get applications -n argocd -o wide
kubectl get nodes -o wide
kubectl get rollout,deploy,svc,ingress,pvc,hpa,networkpolicy,pdb -n museum-prod
kubectl top pods -n museum-prod
kubectl get pods -n monitoring
kubectl get pods -n logging
kubectl get museumbackuppolicies -n museum-prod
kubectl get configmap -n museum-prod backup-policy-postgresql-daily -o yaml
```

GitOps source of truth:

```text
https://github.com/yellowishcloud/museum.git
```

Local dashboard/app access:

```bash
kubectl port-forward svc/musei-web -n museum-prod 8088:80
kubectl port-forward svc/monitoring-grafana -n monitoring 3000:80
kubectl port-forward svc/argocd-server -n argocd 8081:443
kubectl port-forward svc/argo-rollouts-dashboard -n argo-rollouts 3100:3100
```

Public NodePort ingress check:

```bash
curl -H 'Host: museum.local' http://<node-external-ip>:<ingress-node-port>/api/healthz
```

## Rollout Design

`musei-web` is stateless and uses a canary rollout with 25%, 50%, and 100% stages.

`musei-api` now also uses a canary rollout because persistence was moved from SQLite to PostgreSQL. PostgreSQL removes the single-file SQLite limitation, so multiple API pods can safely run during progressive delivery.

PostgreSQL itself is a single persistent database workload with a `Recreate` update strategy because the demo uses one PVC-backed database instance.

## Resource Sizing

Requests and limits are intentionally close, usually around 50% headroom rather than oversized 4-10x limits. This makes scheduling, quota planning, and defense explanation cleaner.

## Backup Policy Scope

`MuseumBackupPolicy` is implemented as a CRD/controller demonstration. The live resource is:

- name: `postgresql-daily`
- PVC: `musei-postgresql-data`
- schedule: `daily-02:00`
- retention: `7d`

The controller watches `MuseumBackupPolicy` resources and reconciles them into managed ConfigMaps such as `backup-policy-postgresql-daily`. It demonstrates a custom extension pattern; a production version would replace the ConfigMap proof with real VolumeSnapshot or CronJob reconciliation.

## Safety

Database and application passwords are stored in Kubernetes Secrets, not committed to Git. Application passwords are stored in PostgreSQL only as salted PBKDF2 hashes.
