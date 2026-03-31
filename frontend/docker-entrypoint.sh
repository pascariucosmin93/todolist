#!/bin/sh
set -eu

envsubst '${VITE_API_URL} ${VITE_KEYCLOAK_URL} ${VITE_KEYCLOAK_REALM} ${VITE_KEYCLOAK_CLIENT_ID}' \
  < /usr/share/nginx/html/config.template.js \
  > /usr/share/nginx/html/config.js
