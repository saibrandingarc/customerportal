<template>
  <header id="page-topbar">
    <div class="layout-width">
      <div class="navbar-header">
        <div class="d-flex align-items-center gap-2">
          <button
            type="button"
            class="btn btn-sm px-2 fs-16 header-item vertical-menu-btn topnav-hamburger"
            id="topnav-hamburger-icon"
            aria-label="Toggle navigation"
            @click="toggleSidebar"
          >
            <span class="hamburger-icon" :class="{ open: sidebarOpen }">
              <span></span>
              <span></span>
              <span></span>
            </span>
          </button>
          <router-link to="/dashboard" class="portal-brand">
            <img src="/logo.png" alt="Branding Arc">
          </router-link>
        </div>

        <div class="d-flex align-items-center gap-3">
          <span v-if="isWebsiteLive" class="portal-live-badge">Live</span>
          <div class="dropdown header-item topbar-user">
            <button v-if="isLoggedIn" type="button" class="portal-user-btn" id="page-header-user-dropdown"
              data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
              <img
                v-if="accountImageUrl"
                :src="accountImageUrl"
                alt=""
                class="portal-user-logo"
              />
              <i v-else class="mdi mdi-account-circle fs-24" aria-hidden="true"></i>
              <span class="portal-user-copy">
                <span class="user-name-text">Hi <strong>{{ username }}</strong>!</span>
                <strong v-if="companyname" class="portal-user-company">{{ companyname }}</strong>
              </span>
            </button>
            <div class="dropdown-menu dropdown-menu-end portal-user-menu">
              <h6 class="dropdown-header">Welcome {{ username }}!</h6>
              <div class="portal-company-details">
                <p v-if="companyLoading && !hasCompanyData" class="mb-0">Loading company information...</p>
                <p v-else-if="companyError && !hasCompanyData" class="text-danger mb-0">{{ companyError }}</p>
                <p v-else-if="!hasCompanyData" class="mb-0">No company information available.</p>
                <template v-else>
                  <div><strong>Company Name:</strong> {{ companyInfoName }}</div>
                  <div><strong>Products Engaged:</strong> {{ productsEngaged }}</div>
                  <div><strong>Credits:</strong> {{ mdCredits }}</div>
                </template>
              </div>
              <div class="dropdown-divider"></div>
              <router-link class="dropdown-item" to="/profile">
                <i class="mdi mdi-account text-muted fs-16 align-middle me-1"></i>
                <span class="align-middle">Profile</span>
              </router-link>
              <router-link class="dropdown-item" to="/company-profile">
                <i class="mdi mdi-domain text-muted fs-16 align-middle me-1"></i>
                <span class="align-middle">Company Profile</span>
              </router-link>
              <a class="dropdown-item" href="#" @click.prevent="logoutUser"><i
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
import { ref, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import router from '@/router';
import axios from 'axios';
import { API_BASE_URL } from '@/api/config';
import { sidebarOpen, toggleSidebar } from '@/composables/useSidebar';
import { useCompanyInfo } from '@/composables/useCompanyInfo';
import { useWebsiteStatus } from '@/composables/useWebsiteStatus';

const authStore = useAuthStore();
const { isLoggedIn } = storeToRefs(authStore);
const username = ref("");
const companyname = ref("");
username.value = authStore.getUsername();
companyname.value = authStore.getCompanyName();
const {
  loading: companyLoading,
  error: companyError,
  hasData: hasCompanyData,
  companyName: companyInfoName,
  productsEngaged,
  mdCredits,
  accountImageUrl,
  loadCompanyInfo,
} = useCompanyInfo();
const { isWebsiteLive, loadWebsiteStatus } = useWebsiteStatus();
const { logout } = useAuth0();
onMounted(() => {
  if (isLoggedIn.value) {
    loadCompanyInfo();
    loadWebsiteStatus();
  }
  const logintype = localStorage.getItem("loginType");
  if (logintype === "google") {
    const userString = localStorage.getItem("user");
    if (userString) {
      const userdata = JSON.parse(userString);
      username.value = userdata.nickname;
      companyname.value = userdata.companyName;
    }
  }
});

const logoutUser = async () => {
  const loginType = localStorage.getItem("loginType");
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
    sessionStorage.removeItem('outstanding-approvals-notice');
    sessionStorage.removeItem('show-approval-popup');
    if (loginType && loginType !== "username-password") {
      await logout({
        logoutParams: { returnTo: `${window.location.origin}/login` },
      });
      return;
    }
    await router.replace({ name: "Login" });
  }
};
</script>

<style scoped>
.portal-user-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  border: 0;
  background: transparent;
  padding: 0;
  color: #212529;
  cursor: pointer;
}

.portal-user-logo {
  width: 36px;
  height: 36px;
  object-fit: contain;
  border-radius: 6px;
  background: #fff;
}

.portal-user-copy {
  display: none;
  flex-direction: column;
  align-items: flex-start;
  line-height: 1.25;
  text-align: left;
}

.portal-user-company {
  font-size: 13px;
  font-weight: 700;
  color: #212529;
}

.portal-live-badge {
  color: #1b8a3e;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.02em;
  line-height: 1;
}

.portal-user-menu {
  min-width: 280px;
}

.portal-company-details {
  padding: 4px 1.2rem 12px;
  color: #212529;
  font-size: 13px;
  line-height: 1.5;
  white-space: normal;
}

.portal-company-details div + div {
  margin-top: 4px;
}

@media (min-width: 768px) {
  .portal-user-copy {
    display: flex;
  }
}
</style>
