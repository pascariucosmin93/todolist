import { UserManager, WebStorageStateStore } from "oidc-client-ts";

const runtimeConfig = window.__APP_CONFIG__ || {};

export const authManager = new UserManager({
  authority: runtimeConfig.VITE_AUTH_AUTHORITY || import.meta.env.VITE_AUTH_AUTHORITY,
  client_id: runtimeConfig.VITE_AUTH_CLIENT_ID || import.meta.env.VITE_AUTH_CLIENT_ID,
  redirect_uri: runtimeConfig.VITE_AUTH_REDIRECT_URI || import.meta.env.VITE_AUTH_REDIRECT_URI,
  post_logout_redirect_uri:
    runtimeConfig.VITE_AUTH_POST_LOGOUT_REDIRECT_URI ||
    import.meta.env.VITE_AUTH_POST_LOGOUT_REDIRECT_URI,
  response_type: "code",
  scope: "openid profile email",
  userStore: new WebStorageStateStore({ store: window.localStorage }),
  automaticSilentRenew: false,
  loadUserInfo: true,
});

export async function completeSigninIfNeeded() {
  const params = new URLSearchParams(window.location.search);
  if (params.has("code") && params.has("state")) {
    await authManager.signinCallback();
    const cleanUrl = `${window.location.origin}${window.location.pathname}`;
    window.history.replaceState({}, document.title, cleanUrl);
  }
}
