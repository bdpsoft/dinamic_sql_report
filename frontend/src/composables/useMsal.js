import * as msal from '@azure/msal-browser';
import { ref } from 'vue';

const msalConfig = {
  auth: {
    clientId: import.meta.env.VITE_MSAL_CLIENT_ID || '',
    authority: import.meta.env.VITE_MSAL_AUTHORITY || 'https://login.microsoftonline.com/common',
    redirectUri: import.meta.env.VITE_MSAL_REDIRECT_URI || window.location.origin
  },
  cache: {
    cacheLocation: 'localStorage',
    storeAuthStateInCookie: false
  }
};

// Build login/acquire token scopes from env. If an API scope is provided, include it.
const apiScope = import.meta.env.VITE_API_SCOPE || '';
const loginRequest = {
  scopes: apiScope ? ['openid', 'profile', 'email', apiScope] : ['openid', 'profile', 'email']
};

const msalInstance = new msal.PublicClientApplication(msalConfig);

const account = ref(null);

export function useMsal() {
  const signIn = async () => {
    try {
      const response = await msalInstance.loginPopup(loginRequest);
      account.value = response.account || msalInstance.getActiveAccount();
      return response;
    } catch (e) {
      console.error('MSAL login failed', e);
      throw e;
    }
  };

  const signOut = async () => {
    try {
      const current = msalInstance.getActiveAccount();
      if (current) {
        await msalInstance.logoutPopup({ account: current });
        account.value = null;
      }
    } catch (e) {
      console.error('MSAL logout failed', e);
    }
  };

  const acquireToken = async () => {
    const active = msalInstance.getActiveAccount();
    if (!active) return null;
    try {
      const result = await msalInstance.acquireTokenSilent({
        ...loginRequest,
        account: active
      });
      return result.accessToken;
    } catch (error) {
      // fallback to interactive
      const result = await msalInstance.acquireTokenPopup(loginRequest);
      return result.accessToken;
    }
  };

  const ensureAccount = () => {
    account.value = msalInstance.getActiveAccount();
  };

  return { msalInstance, signIn, signOut, acquireToken, account, ensureAccount };
}
