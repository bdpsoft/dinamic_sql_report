import { ref } from 'vue';
import { useMsal } from './useMsal';

const user = ref(null);
const isAuthenticated = ref(false);

export const useAuth = () => {
  const { signIn, signOut, acquireToken, ensureAccount, account } = useMsal();

  const login = async () => {
    await signIn();
    ensureAccount();
    await checkAuth();
  };

  const logout = async () => {
    await signOut();
    user.value = null;
    isAuthenticated.value = false;
  };

  const checkAuth = async () => {
    try {
      const token = await acquireToken();
      if (!token) return false;
      const response = await fetch('http://localhost:4000/auth/user', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (response.ok) {
        const userData = await response.json();
        user.value = userData;
        isAuthenticated.value = true;
        return true;
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    }
    return false;
  };

  return {
    user,
    isAuthenticated,
    login,
    logout,
    checkAuth,
    account
  };
};