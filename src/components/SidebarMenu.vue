<template>
  <aside class="app-menu navbar-menu" aria-label="Portal navigation">
    <nav v-if="isLoggedIn" class="portal-nav">
      <template v-for="item in filteredMenuItems" :key="item.title">
        <div v-if="item.children?.length" class="portal-nav-group">
          <button
            type="button"
            class="portal-nav-link portal-nav-toggle"
            :class="{ 'is-open': isOpen(item.title), 'is-active': isGroupActive(item) }"
            :aria-expanded="isOpen(item.title)"
            :aria-controls="`nav-group-${item.title}`"
            @click="toggle(item.title)"
          >
            <span>{{ item.title }}</span>
            <i class="mdi mdi-chevron-right" aria-hidden="true"></i>
          </button>
          <div
            v-show="isOpen(item.title)"
            :id="`nav-group-${item.title}`"
            class="portal-nav-children"
          >
            <router-link
              v-for="child in item.children"
              :key="child.route"
              :to="child.route"
              class="portal-nav-link portal-nav-child"
              :class="{ 'router-link-active': isChildActive(child.route) }"
              @click="closeSidebar"
            >
              {{ child.title }}
            </router-link>
          </div>
        </div>
        <router-link
          v-else-if="item.route"
          :to="item.route"
          class="portal-nav-link"
          @click="closeSidebar"
        >
          {{ item.title }}
        </router-link>
      </template>
    </nav>
  </aside>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useAuthStore } from '@/stores/userStore';
import { closeSidebar } from '@/composables/useSidebar';

interface MenuChild {
  title: string;
  route: string;
  roles: string[];
}

interface MenuItem {
  title: string;
  route?: string;
  roles: string[];
  children?: MenuChild[];
}

const route = useRoute();
const authStore = useAuthStore();
const { isLoggedIn } = storeToRefs(authStore);
const userRoles = computed(() => {
  const roles = authStore.getRoles();
  return roles.length ? roles : ['User'];
});

const menuItems: MenuItem[] = [
  { title: 'Dashboard', route: '/dashboard', roles: ['Admin', 'User'] },
  { title: 'Admin User', route: '/admin/users', roles: ['Admin'] },
  { title: 'Deliverables', route: '/deliverables', roles: ['Admin', 'User'] },
  { title: 'Cases', route: '/cases', roles: ['Admin', 'User'] },
  { title: 'Invoices', route: '/invoices', roles: ['Admin', 'User'] },
  { title: 'FAQ', route: '/faq', roles: ['Admin', 'User'] },
  {
    title: 'Resources',
    roles: ['Admin', 'User'],
    children: [
      { title: 'Instructional Videos', route: '/resources/videos', roles: ['Admin', 'User'] },
      { title: 'Scribes', route: '/resources/scribes', roles: ['Admin', 'User'] },
      { title: 'Articles', route: '/resources/articles', roles: ['Admin', 'User'] },
    ],
  },
];

const canSee = (roles: string[]) => roles.some((role) => userRoles.value.includes(role));

const filteredMenuItems = computed(() => {
  return menuItems
    .filter((item) => canSee(item.roles))
    .map((item) => {
      if (!item.children) return item;
      return {
        ...item,
        children: item.children.filter((child) => canSee(child.roles)),
      };
    })
    .filter((item) => !item.children || item.children.length > 0);
});

const openGroups = ref<Record<string, boolean>>({});

const isOpen = (title: string) => Boolean(openGroups.value[title]);

const isChildActive = (path: string) => route.path === path || route.path.startsWith(`${path}/`);

const isGroupActive = (item: MenuItem) =>
  item.children?.some((child) => isChildActive(child.route)) ?? false;

const toggle = (title: string) => {
  openGroups.value = {
    ...openGroups.value,
    [title]: !openGroups.value[title],
  };
};

watch(
  () => route.path,
  () => {
    for (const item of filteredMenuItems.value) {
      if (item.children && isGroupActive(item)) {
        openGroups.value = { ...openGroups.value, [item.title]: true };
      }
    }
  },
  { immediate: true }
);
</script>
