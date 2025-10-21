import { ref } from 'vue';

const user = ref(null);
const isAuthenticated = ref(false);

export const useAuth = () => {
  const login = () => {
    window.location.href = 'http://localhost:4000/auth/login';
  };

  const logout = () => {
    user.value = null;
    isAuthenticated.value = false;
    // Add any additional cleanup
  };

  const checkAuth = async () => {
    try {
      const response = await fetch('http://localhost:4000/auth/user', {
        credentials: 'include'
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
    checkAuth
  };
};