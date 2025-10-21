<template>
  <div class="min-h-screen bg-gray-100">
    <nav class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <h1 class="text-xl font-semibold">Dynamic SQL Form</h1>
          </div>
          <div class="flex items-center">
            <template v-if="isAuthenticated">
              <span class="mr-4 text-gray-700">{{ user?.email }}</span>
              <button @click="logout" class="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600">
                Logout
              </button>
            </template>
          </div>
        </div>
      </div>
    </nav>

    <main class="p-8">
      <component :is="currentView" />
    </main>
  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue';
import DynamicFunctionForm from "./components/DynamicFunctionForm.vue";
import LandingRedirect from './components/LandingRedirect.vue';
import { useAuth } from './composables/useAuth';

const { user, isAuthenticated, login, logout, checkAuth } = useAuth();

const currentView = computed(() => {
  // If the browser has been redirected back from MSAL, use the landing component
  if (window.location.pathname === '/redirect') return LandingRedirect;
  // Otherwise show either login prompt or the main app
  return isAuthenticated.value ? DynamicFunctionForm : {
    template: `
      <div v-if="!isAuthenticated" class="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
        <h2 class="text-2xl font-bold mb-4">Welcome</h2>
        <p class="mb-4">Please sign in with your Microsoft 365 account to continue.</p>
        <button @click="login" class="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
          Sign in with Microsoft
        </button>
      </div>
    `,
    setup() {
      return { isAuthenticated, login };
    }
  };
});

onMounted(async () => {
  await checkAuth();
});
</script>
