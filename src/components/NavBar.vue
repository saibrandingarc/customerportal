<template>
  <header id="page-topbar">
    <div class="layout-width">
      <div class="navbar-header">
        <div class="d-flex">
          <!-- LOGO -->
          <div class="navbar-brand-box horizontal-logo">
            
          </div>
        </div>

        <div class="d-flex align-items-center">
          <div class="dropdown ms-sm-3 header-item topbar-user">
            <button v-if="isAuthenticated" type="button" class="btn material-shadow-none" id="page-header-user-dropdown"
              data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
              <span class="d-flex align-items-center">
                <!-- <img class="rounded-circle header-profile-user" src="assets/images/users/avatar-1.jpg"
                  alt="Header Avatar"> -->
                <span class="text-start ms-xl-2">
                  <span class="d-none d-xl-inline-block ms-1 fw-medium user-name-text">Hi {{ username }} !</span>
                </span>
              </span>
            </button>
            <div class="dropdown-menu dropdown-menu-end">
              <!-- item-->
              <h6 class="dropdown-header">Welcome {{ username }}!</h6>
              <!-- <button class="btn btn-outline-secondary d-flex align-items-center">
                          <i class="bi bi-power me-2"></i> Logout
                        </button> -->
              <a class="dropdown-item" @click.prevent="logoutUser"><i
                  class="mdi mdi-logout text-muted fs-16 align-middle me-1"></i> <span class="align-middle"
                  data-key="t-logout">Logout</span></a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>
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
  if (logintype == "username-password") {
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
