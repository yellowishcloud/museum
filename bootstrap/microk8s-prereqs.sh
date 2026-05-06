#!/usr/bin/env bash
set -euo pipefail

microk8s status --wait-ready
microk8s enable dns hostpath-storage ingress metallb:172.23.37.210-172.23.37.230 metrics-server helm3

microk8s kubectl get nodes -o wide
microk8s kubectl get storageclass
microk8s kubectl get ingressclass
microk8s kubectl get pods -A
