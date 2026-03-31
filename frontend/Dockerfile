FROM node:22-alpine AS build

WORKDIR /app

ARG VITE_API_URL
ARG VITE_AUTH_AUTHORITY
ARG VITE_AUTH_CLIENT_ID
ARG VITE_AUTH_REDIRECT_URI
ARG VITE_AUTH_POST_LOGOUT_REDIRECT_URI

ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_AUTH_AUTHORITY=${VITE_AUTH_AUTHORITY}
ENV VITE_AUTH_CLIENT_ID=${VITE_AUTH_CLIENT_ID}
ENV VITE_AUTH_REDIRECT_URI=${VITE_AUTH_REDIRECT_URI}
ENV VITE_AUTH_POST_LOGOUT_REDIRECT_URI=${VITE_AUTH_POST_LOGOUT_REDIRECT_URI}

COPY package*.json ./
RUN npm install

COPY src ./src
COPY public ./public
COPY index.html ./index.html
COPY vite.config.js ./vite.config.js

RUN npm run build

FROM nginx:1.27-alpine

RUN apk add --no-cache gettext \
    && chmod +x /docker-entrypoint.d

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY docker-entrypoint.sh /docker-entrypoint.d/40-env-config.sh
COPY public/config.template.js /usr/share/nginx/html/config.template.js
COPY --from=build /app/dist /usr/share/nginx/html

RUN chmod +x /docker-entrypoint.d/40-env-config.sh

EXPOSE 80
