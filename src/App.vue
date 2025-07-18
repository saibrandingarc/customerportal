<template>
  <div id="app" class="d-flex flex-column min-vh-100">
    <main class="flex-grow-1">
      <router-view />
    </main>
  </div>
</template>

<script lang="ts">
import NavBar from "./components/NavBar.vue";
import Error from "./components/Error.vue";

export default {
  components: {
    NavBar,
    Error
  }
};
</script>
