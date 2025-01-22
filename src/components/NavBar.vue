<template>
  <v-app-bar app color="default" dark class="pa-2">
    <!-- Left Logo -->
    <v-toolbar-title class="d-flex align-center">
      <img src="/logo.png" alt="Logo" class="app-logo" width="120" />
    </v-toolbar-title>

    <!-- Spacer to push logout button to the right -->
    <v-spacer />

    <!-- Right Logout Button -->
    {{username}}
    <v-btn @click.prevent="logoutUser" color="secondary" outlined v-if="isAuthenticated">
      <v-icon class="mr-2">mdi-power</v-icon> Logout
    </v-btn>
  </v-app-bar>
</template>

<script lang="ts" setup>
import { useAuthStore } from '@/stores/userStore';
import { useAuth0 } from '@auth0/auth0-vue';
import { ref, computed, watch, onMounted } from 'vue';
import router from '@/router';

const accessToken = localStorage.getItem('auth_token');
const authStore = useAuthStore();
const username = ref("");
username.value = authStore.getUsername();
const { loginWithRedirect, isAuthenticated, logout, user, getAccessTokenSilently } = useAuth0();

onMounted(() => {
  const logintype = localStorage.getItem("loginType");
  if(logintype == "username-password") {
    const authStore = useAuthStore();
    isAuthenticated.value = authStore.isTokenValid();
  }
});

const login = () => {
  loginWithRedirect();
};

const logoutUser = () => {
  authStore.logout();
  logout();
  router.push('/');
};
</script>

<style>
#mobileAuthNavBar {
  min-height: 125px;
  justify-content: space-between;
}
</style>
