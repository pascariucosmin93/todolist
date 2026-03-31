# Todo App

This repository contains a small full-stack todo application designed to run locally with Docker and later be deployed to Kubernetes through Helm and ArgoCD.

## Stack

- Python backend with `FastAPI`
- React frontend with `Vite`
- `PostgreSQL` database
- Authentication with an external OIDC provider
- Local runtime with `Docker Compose`
- Kubernetes packaging with `Helm`
- CI/CD with `GitHub Actions`

## Repository Layout

```text
todolist-keycloak/
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

2. Point the OIDC values to your identity provider.

3. Start the stack:

```bash
docker compose up --build
```

## Authentication Flow

- the frontend uses generic OIDC Authorization Code + PKCE
- the user authenticates in the configured identity provider
- the frontend sends the access token as a bearer token to the backend
- the backend validates the issuer and JWKS
- todos are stored per authenticated user using the token `sub`

## Helm Chart

The Helm chart is available in [helm/todolist](/Users/cosmin.pascariu/todolist-keycloak/helm/todolist).

It packages:

- frontend
- backend
- PostgreSQL
- ingress
- config maps and secrets

It expects an external OIDC provider and configurable OIDC endpoints:

- `auth.authorityUrl`
- `auth.issuerUrl`
- `auth.jwksUrl`
- `auth.clientId`
- `auth.redirectUri`
- `auth.postLogoutRedirectUri`

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

- No identity provider is deployed by this chart; configure stable HTTPS OIDC endpoints separately
- for production, adding `Alembic` is the next logical step
- the older raw manifests in `infra/k8s/base` are still available, but Helm should be the main deployment path
