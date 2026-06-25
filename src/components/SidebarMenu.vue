<template>
  <div class="app-menu navbar-menu" :class="{ 'app-menu-show': isSidebarOpen }">
    <!-- LOGO -->
    <div class="navbar-brand-box">
      <!-- Dark Logo-->
      <a href="#" @click.prevent="goToHome" class="logo logo-dark">
        <span class="logo-sm">
          <img src="/logo.png" alt="" width="120">
        </span>
        <span class="logo-lg">
          <img src="/logo.png" alt="" width="120">
        </span>
      </a>
      <!-- Light Logo-->
      <a href="#" @click.prevent="goToHome" class="logo logo-light">
        <span class="logo-sm">
          <img src="/logo.png" alt="" width="120">
        </span>
        <span class="logo-lg">
          <img src="/logo.png" alt="" width="120">
        </span>
      </a>
      <!-- Close button (mobile only) -->
      <button type="button" class="btn btn-sm p-0 fs-22 header-item sidebar-close-btn d-md-none"
        aria-label="Close menu" @click="closeSidebar">
        <i class="mdi mdi-close"></i>
      </button>
      <button type="button" class="btn btn-sm p-0 fs-20 header-item float-end btn-vertical-sm-hover"
        id="vertical-hover">
        <i class="ri-record-circle-line"></i>
      </button>
    </div>

    <div v-if="isAuthenticated" id="scrollbar" data-simplebar="init" class="h-100 simplebar-scrollable-y">
      <div class="simplebar-wrapper" style="margin: 0px;">
        <div class="simplebar-height-auto-observer-wrapper">
          <div class="simplebar-height-auto-observer"></div>
        </div>
        <div class="simplebar-mask">
          <div class="simplebar-offset" style="right: 0px; bottom: 0px;">
            <div class="simplebar-content-wrapper" tabindex="0" role="region" aria-label="scrollable content"
              style="height: 100%; overflow: hidden scroll;">
              <div class="simplebar-content" style="padding: 0px;">
                <div class="container-fluid">
                  <div id="two-column-menu">
                  </div>
                  <ul class="navbar-nav" id="navbar-nav" data-simplebar="init">
                    <div class="simplebar-wrapper" style="margin: 0px;">
                      <div class="simplebar-height-auto-observer-wrapper">
                        <div class="simplebar-height-auto-observer"></div>
                      </div>
                      <div class="simplebar-mask">
                        <div class="simplebar-offset" style="right: 0px; bottom: 0px;">
                          <div class="simplebar-content-wrapper" tabindex="0" role="region"
                            aria-label="scrollable content" style="height: auto; overflow: hidden;">
                            <div class="simplebar-content" style="padding: 0px;">
                              <li class="menu-title"><span data-key="t-menu">Menu</span></li>
                              <ul class="nav flex-column">
                                <li class="nav-item" v-for="(item, index) in filteredMenuItems" :key="index"
                                  @click="navigate(item.route)" role="button">
                                  <div class="d-flex align-items-center nav-link"
                                    :class="{ active: isActive(item.route) }">
                                    <i :class="['mdi', item.icon, 'menu-icon']"></i>
                                    <span>{{ item.title }}</span>
                                  </div>
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div class="simplebar-placeholder" style="width: 249px; height: 1123px;"></div>
                    </div>
                    <div class="simplebar-track simplebar-horizontal" style="visibility: hidden;">
                      <div class="simplebar-scrollbar" style="width: 0px; display: none;"></div>
                    </div>
                    <div class="simplebar-track simplebar-vertical" style="visibility: hidden;">
                      <div class="simplebar-scrollbar" style="height: 0px; display: none;"></div>
                    </div>
                    <div class="simplebar-track simplebar-horizontal">
                      <div class="simplebar-scrollbar"></div>
                    </div>
                    <div class="simplebar-track simplebar-vertical">
                      <div class="simplebar-scrollbar"></div>
                    </div>
                  </ul>
                </div>
                <!-- Sidebar -->
              </div>
            </div>
          </div>
        </div>
        <div class="simplebar-placeholder" style="width: 249px; height: 1123px;"></div>
      </div>
      <div class="simplebar-track simplebar-horizontal" style="visibility: hidden;">
        <div class="simplebar-scrollbar" style="width: 0px; display: none;"></div>
      </div>
      <div class="simplebar-track simplebar-vertical" style="visibility: visible;">
        <div class="simplebar-scrollbar" style="height: 386px; display: block; transform: translate3d(0px, 0px, 0px);">
        </div>
      </div>
    </div>

    <div class="sidebar-background"></div>
  </div>

  <!-- Mobile drawer backdrop -->
  <div v-if="isSidebarOpen" class="sidebar-overlay d-md-none" @click="closeSidebar"></div>
</template>

<script lang="ts" setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/userStore';
import { useAuth0 } from '@auth0/auth0-vue';
import { useSidebar } from '@/composables/useSidebar';

const router = useRouter();
const route = useRoute();
const { isSidebarOpen, closeSidebar } = useSidebar();
const drawer = ref(true);
const authStore = useAuthStore();
const userRoles = ref();
userRoles.value = authStore.getRoles();
if (userRoles.value.length == 0) {
  console.log("zero");
  userRoles.value.push('User');
} else {
  console.log("not zero");
}
const { isAuthenticated } = useAuth0();

const menuItems = [
  { title: 'Dashboard', icon: 'mdi-view-dashboard', route: '/dashboard', roles: ['Admin', 'User'] },
  { title: 'Admin User', icon: 'mdi-account', route: '/admin/users', roles: ['Admin'] },
  { title: 'Deliverables', icon: 'mdi-package-variant', route: '/deliverables', roles: ['Admin', 'User'] },
  { title: 'Cases', icon: 'mdi-file-document', route: '/cases', roles: ['Admin', 'User'] },
  { title: 'Invoices', icon: 'mdi-package-variant', route: '/invoices', roles: ['Admin', 'User'] },
];

const filteredMenuItems = computed(() => {
  return menuItems.filter(item => item.roles.some(role => userRoles.value.includes(role)));
});

const navigate = (path: string) => {
  router.push(path);
  closeSidebar();
};

const isActive = (path: string): boolean => {
  return route.path === path || route.path.startsWith(path + '/');
};

const isUserLoggedIn = (): boolean => {
  const loginType = localStorage.getItem('loginType');
  if (loginType === 'username-password') {
    return authStore.isTokenValid();
  }
  return isAuthenticated.value;
};

const goToHome = () => {
  if (isUserLoggedIn()) {
    router.push('/dashboard');
  } else {
    router.push('/login');
  }
};

// const isAuthenticated = ref(false);
const accessToken = localStorage.getItem('auth_token');

onMounted(() => {
  // isAuthenticated.value = authStore.isTokenValid();
});
</script>

<style scoped>
.sidebar-menu {
  width: 250px;
}

.v-list-item {
  cursor: pointer;
}

.list-item {
  cursor: pointer;
  transition: background-color 0.3s;
}

.list-item:hover {
  background-color: rgba(0, 0, 0, 0.1);
}

/* Menu item icons + active/hover states */
.nav-item .nav-link {
  border-radius: 6px;
  margin: 2px 10px;
  padding: 0.6rem 0.85rem;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.menu-icon {
  min-width: 1.5rem;
  margin-right: 0.65rem;
  font-size: 18px;
  line-height: 1;
}

.nav-item .nav-link:hover {
  background-color: rgba(64, 81, 137, 0.07);
  color: var(--vz-vertical-menu-item-hover-color);
}

.nav-item .nav-link.active {
  background-color: rgba(64, 81, 137, 0.1);
  color: var(--vz-vertical-menu-item-active-color);
  font-weight: 500;
}

.sidebar-close-btn {
  position: absolute;
  top: 14px;
  right: 16px;
  color: var(--vz-vertical-menu-item-color);
}

/* Mobile off-canvas drawer */
@media (max-width: 767.98px) {
  .app-menu.navbar-menu {
    transform: translateX(-100%);
    transition: transform 0.25s ease-in-out;
    width: 250px;
  }

  .app-menu.navbar-menu.app-menu-show {
    transform: translateX(0);
    z-index: 1004;
    box-shadow: 0 0 35px rgba(0, 0, 0, 0.25);
  }

  /* Show the logo at the top of the drawer on mobile */
  .navbar-brand-box {
    display: block !important;
    text-align: left;
    padding-top: 10px;
  }
}

.sidebar-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(54, 61, 72, 0.4);
  z-index: 1003;
}
</style>