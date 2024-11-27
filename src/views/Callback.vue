<template>
    <div>
      <h1>Loading...</h1>
    </div>
  </template>
  
  <script lang="ts" setup>
  import { useAuth0 } from '@auth0/auth0-vue';
  import { onMounted } from 'vue';
  
  const { handleRedirectCallback, isAuthenticated, error } = useAuth0();
  
  // In the callback handler (if required)
  const handleAuthCallback = async () => {
    const { appState } = await handleRedirectCallback();
    const loginType = appState?.loginType || "unknown";
    localStorage.setItem("loginType", loginType);
  };

  onMounted(async () => {
    await handleRedirectCallback();
  });
  </script>
  