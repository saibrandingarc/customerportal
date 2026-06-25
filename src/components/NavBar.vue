<template>
  <header id="page-topbar">
    <div class="layout-width">
      <div class="navbar-header">
        <div class="d-flex align-items-center">
          <!-- Mobile sidebar toggle -->
          <button v-if="isAuthenticated" type="button"
            class="btn btn-sm px-2 fs-22 header-item sidebar-toggle-btn d-md-none" aria-label="Toggle menu"
            @click="toggleSidebar">
            <i class="mdi mdi-menu"></i>
          </button>
          <!-- LOGO (mobile only) -->
          <a href="#" class="navbar-brand-box horizontal-logo d-md-none" @click.prevent="goToHome">
            <img src="/logo.png" alt="logo" height="26">
          </a>
        </div>

        <div class="d-flex align-items-center">
          <div class="dropdown ms-sm-3 header-item topbar-user">
            <button v-if="isAuthenticated" type="button" class="btn material-shadow-none" id="page-header-user-dropdown"
              data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
              <span class="d-flex align-items-left">
                <!-- Show this icon only on mobile -->
                <i class="mdi mdi-account-circle d-xl-none fs-24"></i>
                <!-- <img class="rounded-circle header-profile-user" src="assets/images/users/avatar-1.jpg"
                  alt="Header Avatar"> -->
                <span class="">
                  <span class="d-none d-xl-inline-block ms-1 fw-medium user-name-text">Hi <strong>{{ username }} </strong>!</span>
                </span>
              </span>
              <span class="d-none d-xl-inline-block ms-1 fw-medium user-name-text">{{ companyname }}</span>
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
import axios from 'axios';
import { API_BASE_URL } from '@/api/config';
import { useSidebar } from '@/composables/useSidebar';

const { toggleSidebar } = useSidebar();
const accessToken = localStorage.getItem('auth_token');
const authStore = useAuthStore();
const username = ref("");
const companyname = ref("");
username.value = authStore.getUsername();
companyname.value = authStore.getCompanyName();
const { loginWithRedirect, isAuthenticated, logout, user, getAccessTokenSilently } = useAuth0();

onMounted(() => {
  const logintype = localStorage.getItem("loginType");
  if (logintype == "username-password") {
    const authStore = useAuthStore();
    isAuthenticated.value = authStore.isTokenValid();
  } else {
    console.log("Login Type : " + logintype);
    if (logintype === "google") {
      const userString = localStorage.getItem("user");
      if (userString) {
        const userdata = JSON.parse(userString);
        username.value = userdata.nickname;
        companyname.value = userdata.companyName;
        // use userdata if necessary
      } else {
        console.warn("No user data found in localStorage for google login.");
      }
    }
  }
});

const login = () => {
  loginWithRedirect();
};

const isUserLoggedIn = (): boolean => {
  const loginType = localStorage.getItem('loginType');
  if (loginType === 'username-password') {
    return authStore.isTokenValid();
  }
  return isAuthenticated.value;
};

const goToHome = () => {
  router.push(isUserLoggedIn() ? '/dashboard' : '/login');
};

const logoutUser = async () => {
  try {
    const userData = JSON.parse(localStorage.getItem('user') || 'null');
    const email = userData?.email;

    if (email) {
      await axios.post(`${API_BASE_URL}/Zoho/zoho/logout`, {
        email
      });
    }
  } catch (error) {
    console.error('Failed to record logout activity:', error);
  } finally {
    authStore.logout();
    logout();
    router.push('/');
  }
};

</script>

<style>
#mobileAuthNavBar {
  min-height: 125px;
  justify-content: space-between;
}

.sidebar-toggle-btn {
  color: var(--vz-header-item-sub-color);
  border: none;
  line-height: 1;
}

.sidebar-toggle-btn:focus {
  box-shadow: none;
}

.horizontal-logo.d-md-none {
  display: inline-flex !important;
  align-items: center;
  padding: 0;
  margin: 0;
}

@media (min-width: 768px) {
  .horizontal-logo.d-md-none {
    display: none !important;
  }
}
</style>
