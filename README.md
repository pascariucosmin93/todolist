
# Todo App

This repository contains a small full-stack todo application designed to run locally with Docker and later be deployed to Kubernetes through Helm and ArgoCD.

## Stack

- Python backend with `FastAPI`
- React frontend with `Vite`
- `PostgreSQL` database
- Local runtime with `Docker Compose`
- Kubernetes packaging with `Helm`
- CI/CD with `GitHub Actions`

## Repository Layout

```text
todolist/
├── backend/
├── frontend/
├── helm/todolist/
├── infra/k8s/base/
├── docker-compose.yml
└── .env.example
```

## Local Run

1. Copy the environment file:

```bash
cp .env.example .env
```

2. Start the stack:

```bash
docker compose up --build
```

## Helm Chart

The Helm chart is available in [helm/todolist](/Users/cosmin.pascariu/Desktop/todolist/helm/todolist).

It packages:

- frontend
- backend
- PostgreSQL
- ingress
- config maps and secrets

## Kubernetes Secret

Required Kubernetes secret:

- `todolist-postgres`
  Keys: `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`

Example:

```bash
kubectl -n todo-app create secret generic todolist-postgres \
  --from-literal=POSTGRES_DB=todos \
  --from-literal=POSTGRES_USER=todos \
  --from-literal=POSTGRES_PASSWORD='strong-password'
```

## CI/CD

The workflows are:

- `ci.yml`
  Runs backend tests, frontend build, and Helm validation.
- `release.yml`
  Builds dev images and updates `todolist-giops/k8s/chart/values.yaml`.
- `promote.yml`
  Promotes an existing image tag to a release version and can update GitOps.

Expected GitHub secrets:

- `GITOPS_PUSH_USER`
- `GITOPS_PUSH_TOKEN`
- `POSTGRES_DB`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`

## Notes

- for production, adding `Alembic` is the next logical step
- the older raw manifests in `infra/k8s/base` are still available, but Helm should be the main deployment path
