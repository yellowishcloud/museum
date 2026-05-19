# Optional DigitalOcean Self-Hosted Cluster

This folder documents the production-grade infrastructure path for the project demo.
It is intentionally not auto-applied from the local demo because creating
Droplets costs money.

The recommended perfection architecture is:

- 3 DigitalOcean Ubuntu Droplets
- K3s installed with Ansible
- Cilium or Flannel CNI
- NGINX ingress
- Longhorn storage dashboard with replicated volumes, snapshots, and backups
- Argo CD bootstrapped from this repository

The local MicroK8s cluster in `clusters/microk8s` is the working laptop-safe
demo. The DigitalOcean path is the same GitOps shape, but the Kubernetes nodes
live on x86 cloud VMs instead of the Snapdragon/WSL environment.
