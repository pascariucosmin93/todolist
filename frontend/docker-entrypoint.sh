#!/bin/sh
set -eu

envsubst '${VITE_API_URL}' \
  < /usr/share/nginx/html/config.template.js \
  > /usr/share/nginx/html/config.js

envsubst '${BACKEND_UPSTREAM_URL}' \
  < /etc/nginx/templates/default.conf.template \
  > /etc/nginx/conf.d/default.conf
