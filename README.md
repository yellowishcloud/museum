# Musei Kasteev DevOps II Final Project

Musei Kasteev is a digital museum prototype deployed with a GitOps-style Kubernetes setup. The repository contains the application, MicroK8s manifests, Argo CD app-of-apps configuration, rollout strategy, monitoring setup, and a small custom Kubernetes extension.

## What Is Implemented

- Museum web UI and Node API with SQLite persistence.
- GitOps manifests for Argo CD, Argo Rollouts, monitoring, and the app namespace.
- Canary rollout for the frontend with 25%, 50%, and 100% steps.
- PVC-backed SQLite storage for the API and PVCs for Prometheus, Grafana, and Alertmanager.
- Namespace hardening with restricted pod-security labels, non-root pods, dropped capabilities, quotas, limit ranges, RBAC, and NetworkPolicies.
- Prometheus/Grafana deployment with a Prometheus data source configured in Grafana.
- `MuseumBackupPolicy` CRD and controller reconciliation pattern.

## Backup Policy Scope

`MuseumBackupPolicy` is implemented as a custom resource and controller demonstration. The example resource is:

- name: `sqlite-daily`
- schedule: `daily-02:00`
- retention: `7d`
- PVC: `musei-sqlite-data`

In this version, the controller watches `MuseumBackupPolicy` resources and reconciles them into managed ConfigMaps such as `backup-policy-sqlite-daily`. It does not yet create real Kubernetes `CronJob`, `Job`, or `VolumeSnapshot` resources.

## Public Repository Safety

Local databases, kubeconfigs, Terraform state, private variables, keys, certificates, logs, and presentation materials are intentionally ignored. The SQLite file is local runtime data and should not be committed.

Demo account passwords are not committed. The application stores only salted password hashes in SQLite.
