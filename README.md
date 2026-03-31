# Todo App with Keycloak

This repository contains a small full-stack todo application designed to run locally with Docker and later be deployed to Kubernetes through Helm and ArgoCD.

## Stack

- Python backend with `FastAPI`
- React frontend with `Vite`
- `PostgreSQL` database
- Authentication with `Keycloak` using OIDC and PKCE
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
├── keycloak/
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

3. Open the services:

- frontend: `http://localhost:3000`
- backend docs: `http://localhost:8000/docs`
- Keycloak through frontend proxy: `http://localhost:3000/auth`
- Keycloak direct access: `http://localhost:8080/auth`

## Demo Credentials

No demo credentials are stored in the repository.

You must provide:

- PostgreSQL database name, username, and password
- Keycloak admin username and password
- optional application user accounts directly in Keycloak

## Authentication Flow

- the frontend uses `keycloak-js` with PKCE
- the user authenticates in Keycloak
- the frontend sends the access token as a bearer token to the backend
- the backend validates the token issuer and fetches signing keys from the internal JWKS endpoint
- todos are stored per authenticated user using the token `sub`

## Helm Chart

The Helm chart is available in [helm/todolist](/Users/cosmin.pascariu/todolist-keycloak/helm/todolist).

It packages:

- frontend
- backend
- PostgreSQL
- Keycloak
- ingress
- config maps and secrets

Default image version:

- backend: `0.0.1`
- frontend: `0.0.1`

Basic commands:

```bash
helm lint helm/todolist
helm template todo helm/todolist
```

The chart supports:

- configurable image repositories and tags
- frontend service as `LoadBalancer` for BGP-based exposure
- optional ingress
- existing Kubernetes secrets
- persistent volume claims for PostgreSQL
- Keycloak realm import from values

For a BGP load balancer setup, the frontend service is configured as `LoadBalancer` by default. If your cluster uses MetalLB or another BGP speaker, you can set service annotations and optionally a fixed `loadBalancerIP` in the Helm values.

## ArgoCD / GitOps

Recommended flow:

1. Build and push `frontend` and `backend` images to your registry.
2. Copy the Helm chart or only the rendered environment values into your GitOps repository.
3. In ArgoCD, point the application to the GitOps repo path that contains the chart or chart values.
4. Replace inline secrets with your preferred GitOps-safe secret mechanism such as `ExternalSecret` or `SealedSecret`.

Recommended GitOps repo path:

- `k8s/chart`

Example values file you can place in your GitOps repo:

```yaml
images:
  backend:
    repository: ghcr.io/pascariucosmin93/todo-backend
    tag: "0.0.1"
  frontend:
    repository: ghcr.io/pascariucosmin93/todo-frontend
    tag: "0.0.1"

ingress:
  enabled: true
  className: nginx
  hosts:
    frontend: todo.example.internal
    backend: api.todo.example.internal
    keycloak: auth.todo.example.internal

frontend:
  service:
    type: LoadBalancer
    annotations:
      metallb.universe.tf/address-pool: public
```

Required Kubernetes secrets:

- PostgreSQL secret
  Keys: `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`
- Keycloak admin secret
  Keys: `KEYCLOAK_ADMIN`, `KEYCLOAK_ADMIN_PASSWORD`

Example:

```bash
kubectl -n todo-app create secret generic todolist-postgres \
  --from-literal=POSTGRES_DB=todos \
  --from-literal=POSTGRES_USER=todos \
  --from-literal=POSTGRES_PASSWORD='strong-password'

kubectl -n todo-app create secret generic todolist-keycloak-admin \
  --from-literal=KEYCLOAK_ADMIN=admin \
  --from-literal=KEYCLOAK_ADMIN_PASSWORD='strong-admin-password'
```

## CI/CD

Two GitHub Actions workflows are included in [.github/workflows](/Users/cosmin.pascariu/todolist-keycloak/.github/workflows):

- `ci.yml`
  Runs backend tests, frontend build, and Helm validation on pushes and pull requests.
- `release.yml`
  Builds and pushes versioned Docker images to GHCR. Intended for versions like `0.0.1`.
- `promote.yml`
  Updates the GitOps repository to a promoted version such as `1.0.0` and injects database and Keycloak admin secrets from GitHub Actions secrets into the GitOps Helm values.

Expected GitHub secrets:

- `GITOPS_PUSH_USER`
- `GITOPS_PUSH_TOKEN`
- `POSTGRES_DB`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `KEYCLOAK_ADMIN`
- `KEYCLOAK_ADMIN_PASSWORD`

Promotion defaults:

- initial app version: `0.0.1`
- production promotion example: `1.0.0`
```

## Notes

- the backend creates tables automatically on startup for fast bootstrap
- for production, adding `Alembic` is the next logical step
- Keycloak and PostgreSQL should use stronger secret handling and persistent storage in real clusters
- the older raw manifests in `infra/k8s/base` are still available, but Helm should be the main deployment path
- Keycloak URLs used by the app should include `/auth`, for example `https://auth.todo.example.internal/auth`
