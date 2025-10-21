<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="bg-white p-8 rounded-lg shadow-md text-center">
      <h2 class="text-xl font-semibold mb-4">Signing you in…</h2>
      <p class="text-gray-600">Please wait while we finish the sign-in process.</p>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useAuth } from '../composables/useAuth';

const { checkAuth } = useAuth();

onMounted(async () => {
  // Complete the auth check which will try to acquire token and call /auth/user.
  try {
    await checkAuth();
  } finally {
    // Navigate back to root where the main app will show the authenticated UI.
    window.location.href = '/';
  }
});
</script>

<style scoped>
/* Minimal styling; Tailwind is used by the app */
</style>
