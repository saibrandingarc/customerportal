<template>
  <div class="app-menu navbar-menu">
    <!-- LOGO -->
    <div class="navbar-brand-box">
      <!-- Dark Logo-->
      <a href="index.html" class="logo logo-dark">
        <span class="logo-sm">
          <img src="/logo.png" alt="" width="120">
        </span>
        <span class="logo-lg">
          <img src="/logo.png" alt="" width="120">
        </span>
      </a>
      <!-- Light Logo-->
      <a href="index.html" class="logo logo-light">
        <span class="logo-sm">
          <img src="/logo.png" alt="" width="120">
        </span>
        <span class="logo-lg">
          <img src="/logo.png" alt="" width="120">
        </span>
      </a>
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
                              <ul class="nav nav-sm flex-column">
                                <li class="nav-item my-2" v-for="(item, index) in filteredMenuItems" :key="index"
                                  @click="navigate(item.route)" role="button">
                                  <div class="d-flex align-items-center nav-link">
                                    <!-- <i :class="item.icon + ' me-2'"></i> -->
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

</template>

<script lang="ts" setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/userStore';
import { useAuth0 } from '@auth0/auth0-vue';

const router = useRouter();
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

const navigate = (route: string) => {
  router.push(route);
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
</style>