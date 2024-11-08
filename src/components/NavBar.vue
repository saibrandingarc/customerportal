<template>
  <div class="nav-container mb-3">
    <nav class="navbar navbar-expand-md navbar-light bg-light">
      <div class="container">
        <div class="navbar-brand">
          <img class="app-logo" src="/logo.png" alt="Vue.js logo" width="120">
        </div>
        <button
          class="navbar-toggler"
          type="button"
          data-toggle="collapse"
          data-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav mr-auto">
            <!-- <li class="nav-item">
              <router-link to="/" class="nav-link">Home</router-link>
            </li> -->
            <li class="nav-item" v-if="isAuthenticated">
              <router-link to="/cases" class="nav-link">Cases</router-link>
            </li>
            <li class="nav-item" v-if="isAuthenticated">
              <router-link to="/deliverables" class="nav-link">Deliverables</router-link>
            </li>
          </ul>
          <ul class="navbar-nav d-none d-md-block">
            <li v-if="!isAuthenticated && !isLoading" class="nav-item">
              <router-link to="/login" class="btn btn-primary btn-margin">Login</router-link>
            </li>

            <li class="nav-item dropdown" v-if="isAuthenticated">
              <a id="qsLogoutBtn" href="#" class="dropdown-item" @click.prevent="logout">
                <font-awesome-icon class="mr-3" icon="power-off" />Log out
              </a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  </div>
</template>

<script lang="ts" setup>
import { useAuthStore } from '@/stores/userStore';
import { useAuth0 } from '@auth0/auth0-vue';
import { ref, computed, watch, onMounted } from 'vue';
import router from '@/router';
const { isAuthenticated, isLoading, user, loginWithRedirect } = useAuth0();
const accessToken = localStorage.getItem('auth_token');
const authStore = useAuthStore();

onMounted(() => {
  isAuthenticated.value = authStore.isTokenValid();
});

const login = () => {
  loginWithRedirect();
};

const logout = () => {
  authStore.logout();
  router.push('/');
};

const logoutUser = () => {
  // logout({
  //   logoutParams: {
  //     returnTo: window.location.origin
  //   }
  // });
};
</script>

<style>
#mobileAuthNavBar {
  min-height: 125px;
  justify-content: space-between;
}
</style>
