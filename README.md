# Todo App cu Keycloak

Aplicatie full-stack pregatita pentru:

- backend Python cu `FastAPI`
- frontend React cu `Vite`
- baza de date `PostgreSQL`
- autentificare OIDC cu `Keycloak`
- rulare locala cu `Docker Compose`
- manifeste de baza pentru Kubernetes, usor de mutat intr-un repo GitOps cu ArgoCD

## Structura

```text
todolist-keycloak/
├── backend/
├── frontend/
├── keycloak/
├── infra/k8s/base/
├── docker-compose.yml
└── .env.example
```

## Pornire locala

1. Copiaza configuratia:

```bash
cp .env.example .env
```

2. Porneste stack-ul:

```bash
docker compose up --build
```

3. Deschide:

- frontend: `http://localhost:3000`
- backend docs: `http://localhost:8000/docs`
- keycloak via frontend proxy: `http://localhost:3000/auth`
- keycloak direct: `http://localhost:8080/auth`

## Credentiale demo

- utilizator Keycloak: `demo`
- parola: `Demo123!`
- admin Keycloak: din `.env`

Schimba aceste credentiale inainte de orice deploy real.

## Cum functioneaza autentificarea

- frontend-ul foloseste `keycloak-js` cu `PKCE`
- utilizatorul se logheaza in Keycloak
- frontend-ul trimite `Bearer token` catre backend
- backend-ul valideaza `issuer`-ul public si ia JWKS-ul de pe URL-ul intern al Keycloak
- fiecare todo este legat de utilizatorul autentificat prin `sub`

## Deploy in Kubernetes

In `infra/k8s/base` ai un set de manifeste de baza:

- `Namespace`
- `ConfigMap` si `Secret` placeholder
- `Deployment` + `Service` pentru `frontend`, `backend`, `postgres`, `keycloak`
- `Ingress` simplu
- `kustomization.yaml`

Pentru GitOps:

1. muti `infra/k8s/base` in repo-ul dedicat
2. schimbi imaginile catre registry-ul tau
3. inlocuiesti secretele placeholder cu `SealedSecret`, `ExternalSecret` sau alt mecanism
4. adaugi overlay-uri `dev/staging/prod`

## Note

- backend-ul creeaza tabelele automat la pornire pentru viteza de bootstrap
- pentru productie, urmatorul pas logic este sa adaugi `Alembic`
- pentru Kubernetes productie, Keycloak si Postgres ar trebui mutate spre storage persistent si configuratie mai stricta
