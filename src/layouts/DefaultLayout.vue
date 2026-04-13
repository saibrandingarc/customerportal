<script setup lang="ts">
import SidebarMenu from '@/components/SidebarMenu.vue';
import NavBar from '../components/NavBar.vue';
import Footer from '../components/Footer.vue';
import { useSessionIdleTimeout } from '@/composables/useSessionIdleTimeout';

useSessionIdleTimeout();
</script>

<template>
  <div>
    <SidebarMenu />
    <div class="wrapper d-flex flex-column min-vh-100">
      <NavBar />
      <div class="body flex-grow-1">
        <CContainer class="px-4" lg>
          <router-view />
        </CContainer>
      </div>
      <Footer />
    </div>
  </div>
</template>
