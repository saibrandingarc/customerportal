<script setup lang="ts">
import SidebarMenu from '@/components/SidebarMenu.vue';
import NavBar from '../components/NavBar.vue';
import Footer from '../components/Footer.vue';
import { useSessionIdleTimeout } from '@/composables/useSessionIdleTimeout';
import { closeSidebar, useSidebar } from '@/composables/useSidebar';
import { watch } from 'vue';
import { useRoute } from 'vue-router';

useSessionIdleTimeout();
useSidebar();

const route = useRoute();
watch(
  () => route.fullPath,
  () => closeSidebar()
);
</script>

<template>
  <div class="layout-root">
    <SidebarMenu />
    <div class="vertical-overlay" @click="closeSidebar"></div>
    <div class="wrapper d-flex flex-column min-vh-100">
      <NavBar />
      <div class="body flex-grow-1">
        <router-view />
      </div>
      <Footer />
    </div>
  </div>
</template>
