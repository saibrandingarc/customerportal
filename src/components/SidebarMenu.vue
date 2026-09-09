<template>
  <div class="app-menu navbar-menu">
    <div class="navbar-brand-box">
      <router-link to="/dashboard" class="logo logo-dark">
        <span class="logo-sm">
          <img src="/logo.png" alt="" width="120">
        </span>
        <span class="logo-lg">
          <img src="/logo.png" alt="" width="120">
        </span>
      </router-link>
      <router-link to="/dashboard" class="logo logo-light">
        <span class="logo-sm">
          <img src="/logo.png" alt="" width="120">
        </span>
        <span class="logo-lg">
          <img src="/logo.png" alt="" width="120">
        </span>
      </router-link>
    </div>

    <div v-if="isAuthenticated" class="h-100">
      <div class="container-fluid">
        <ul class="navbar-nav" id="navbar-nav">
          <li class="menu-title"><span data-key="t-menu">Menu</span></li>
          <ul class="nav nav-sm flex-column">
            <li
              class="nav-item my-2"
              v-for="(item, index) in filteredMenuItems"
              :key="index"
              @click="navigate(item.route)"
              role="button"
            >
              <div class="d-flex align-items-center nav-link">
                <span>{{ item.title }}</span>
              </div>
            </li>
          </ul>
        </ul>
      </div>
    </div>

    <div class="sidebar-background"></div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/userStore';
import { useAuth0 } from '@auth0/auth0-vue';
import { closeSidebar } from '@/composables/useSidebar';

const router = useRouter();
const authStore = useAuthStore();
const userRoles = ref();
userRoles.value = authStore.getRoles();
if (userRoles.value.length == 0) {
  userRoles.value.push('User');
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
  closeSidebar();
  router.push(route);
};
</script>
