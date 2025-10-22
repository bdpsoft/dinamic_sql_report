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
// ✅ Initialize first
await msalInstance.initialize();

// Process redirect responses when the app loads after a redirect
msalInstance.handleRedirectPromise().then((response) => {
  if (response && response.account) {
    msalInstance.setActiveAccount(response.account);
    account.value = response.account;
  } else {
    // No redirect response - try to set active account from cache
    account.value = msalInstance.getActiveAccount();
  }
}).catch((err) => {
  console.error('MSAL handleRedirectPromise error', err);
});

export function useMsal() {
  const signIn = async () => {
    // Redirect flow: this will navigate away to the Azure login page.
    try {
      await msalInstance.loginRedirect(loginRequest);
      // After redirect returns, handleRedirectPromise above will set account
    } catch (e) {
      console.error('MSAL loginRedirect failed', e);
      throw e;
    }
  };

  const signOut = async () => {
    try {
      const current = msalInstance.getActiveAccount();
      if (current) {
        await msalInstance.logoutRedirect({ account: current });
        account.value = null;
      }
    } catch (e) {
      console.error('MSAL logoutRedirect failed', e);
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
      // Fallback to redirect flow - this will navigate away
      try {
        await msalInstance.acquireTokenRedirect(loginRequest);
        return null; // token will be available on return from redirect
      } catch (e) {
        console.error('MSAL acquireTokenRedirect failed', e);
        return null;
      }
    }
  };

  const ensureAccount = () => {
    account.value = msalInstance.getActiveAccount();
  };

  return { msalInstance, signIn, signOut, acquireToken, account, ensureAccount };
}
