<template>
    <v-navigation-drawer v-model="drawer" app permanent color="primary" class="sidebar-menu" v-if="isAuthenticated">
        <v-list-item class="list-item my-3" v-for="(item, index) in filteredMenuItems" :key="index" @click="navigate(item.route)">
            <template v-slot:prepend>
                <v-icon :icon="item.icon"></v-icon>
            </template>
            <v-list-item-content>
                <v-list-item-title>{{ item.title }}</v-list-item-title>
            </v-list-item-content>
        </v-list-item>
    </v-navigation-drawer>
</template>
  
<script lang="ts" setup>
    import { ref, computed, watch, onMounted } from 'vue';
    import { useRouter } from 'vue-router';
    import { useAuthStore } from '@/stores/userStore';
  
    const router = useRouter();
    const drawer = ref(true);
    const authStore = useAuthStore();
    const userRoles = ref();
    userRoles.value = authStore.getRoles();
  
    const menuItems = [
        { title: 'Dashboard', icon: 'mdi-view-dashboard', route: '/dashboard', roles: ['Admin', 'User'] },
        { title: 'Cases', icon: 'mdi-file-document', route: '/cases', roles: ['Admin', 'User'] },
        { title: 'Deliverables', icon: 'mdi-package-variant', route: '/deliverables', roles: ['Admin', 'User'] },
        { title: 'Admin User', icon: 'mdi-account', route: '/admin/users', roles: ['Admin'] },
        // { title: 'Profile', icon: 'mdi-account-circle', route: '/profile' },
        // { title: 'Settings', icon: 'mdi-cog', route: '/settings' },
        // { title: 'Logout', icon: 'mdi-logout', route: '/logout' },
    ];

    const filteredMenuItems = computed(() => {
      return menuItems.filter(item => item.roles.some(role => userRoles.value.includes(role)));
    });
  
    const navigate = (route: string) => {
        router.push(route);
    };

    const isAuthenticated = ref(false);
    const accessToken = localStorage.getItem('auth_token');
    

    onMounted(() => {
        isAuthenticated.value = authStore.isTokenValid();
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
  