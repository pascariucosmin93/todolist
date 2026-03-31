import Keycloak from "keycloak-js";

const runtimeConfig = window.__APP_CONFIG__ || {};

const keycloak = new Keycloak({
  url: runtimeConfig.VITE_KEYCLOAK_URL || import.meta.env.VITE_KEYCLOAK_URL,
  realm: runtimeConfig.VITE_KEYCLOAK_REALM || import.meta.env.VITE_KEYCLOAK_REALM,
  clientId:
    runtimeConfig.VITE_KEYCLOAK_CLIENT_ID || import.meta.env.VITE_KEYCLOAK_CLIENT_ID,
});

export default keycloak;
