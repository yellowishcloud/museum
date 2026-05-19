# Musei Kasteev Final Defense Guide

## 60-Second Opening

Musei Kasteev is a digital museum prototype deployed through a GitOps Kubernetes workflow. The repository includes the application, Argo CD configuration, Argo Rollouts, monitoring, hardened namespace policies, storage, and a custom `MuseumBackupPolicy` extension.

The frontend is stateless, so I deploy it with a canary rollout: 25%, then 50%, then 100%. That lets me expose a new web version gradually and stop promotion if health checks fail.

The API is intentionally different. It uses one SQLite database file on one PVC, so I keep it as a simple Kubernetes `Deployment` with `Recreate`. A backend canary would mean multiple API versions touching the same SQLite file, which is not a clean architecture for this prototype. If I migrated persistence to PostgreSQL, then the API could become horizontally scalable and also use canary rollout safely.

For resources, I tightened the gap between requests and limits. The containers now use roughly 25-50% headroom instead of oversized 4-10x limits, which makes scheduling and quota planning more realistic.

The project also demonstrates defense-in-depth: non-root containers, dropped Linux capabilities, restricted namespace policy, RBAC, NetworkPolicies, PodDisruptionBudgets, quotas, persistent storage, monitoring, and a small custom Kubernetes controller pattern.

## Best Demo Order

1. Show the repository structure and GitOps entry point in `clusters/microk8s/applications/musei.yaml`.
2. Show `apps/musei/web-rollout.yaml` and explain the 25% -> 50% -> 100% frontend canary.
3. Show `apps/musei/api-deployment.yaml` and explain why the API is intentionally not canary in the SQLite prototype.
4. Show `apps/musei/security.yaml`, `network-policies.yaml`, and `rbac.yaml` as the security layer.
5. Show `storage.yaml` and `backup-policy.yaml` as the persistence layer.
6. Show `hpa.yaml`, `pdb.yaml`, and monitoring manifests as the reliability layer.
7. End by opening the running application and the dashboards if available.

## Exact Answers To Likely Questions

### Why is the web canary but the API a simple Deployment?

Because the web layer is stateless and safe to split across versions. The API stores data in a single SQLite file on a PVC, so running two backend versions side by side is not a good canary design for this prototype. I used `Recreate` intentionally to preserve a single-writer model. With PostgreSQL or another external database, I would make the API horizontally scalable and then use a canary rollout there too.

### Why not just make the API canary for symmetry?

Symmetry is not the goal; safe architecture is. A rollout strategy should match the workload. Canary fits the frontend today. The backend first needs database architecture that supports multiple replicas cleanly.

### Why are requests and limits close now?

Requests reserve the amount the scheduler should plan for; limits cap burst usage. If limits are 10 times larger than requests, capacity planning becomes less honest and noisy-neighbor risk increases. I kept the gap around 25-50% so there is still burst room without pretending the workload needs huge emergency headroom.

### What happens if a frontend canary is unhealthy?

Readiness checks fail, the rollout pauses, and promotion stops before all traffic moves to the new version. The previous stable ReplicaSet stays available.

### What happens during an API update?

Because the API is one-replica and SQLite-backed, the `Recreate` strategy stops the old pod before starting the new one. That trades a short update interruption for data-model simplicity in the prototype. In production, I would externalize the database to remove that limitation.

### What are the strongest DevOps features in the project?

GitOps deployment, progressive delivery for the stateless frontend, resource governance, namespace hardening, least-privilege networking and RBAC, persistent storage, monitoring, autoscaling for the web tier, disruption budgets, and a custom CRD/controller pattern.

## One-Line Closing

This project is not only deployed; it is defended by clear trade-offs. The final architecture shows where progressive delivery helps today and where a future production version should evolve next.
