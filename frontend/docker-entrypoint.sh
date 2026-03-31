#!/bin/sh
set -eu

envsubst '${VITE_API_URL} ${VITE_AUTH_AUTHORITY} ${VITE_AUTH_CLIENT_ID} ${VITE_AUTH_REDIRECT_URI} ${VITE_AUTH_POST_LOGOUT_REDIRECT_URI}' \
  < /usr/share/nginx/html/config.template.js \
  > /usr/share/nginx/html/config.js
