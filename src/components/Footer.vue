<template>
  <v-footer app class="bg-light text-center">
    <v-container class="pa-3">
      <div class="logo">
        <!-- Add your logo here, e.g., an image -->
        <img src="path/to/your/logo.png" alt="Logo" />
      </div>
      <p>
        Sample project provided by
        <a href="https://auth0.com" target="_blank" rel="noopener noreferrer"> Auth0</a>
      </p>
    </v-container>
  </v-footer>
</template>

<script lang="ts">
export default {}; // Add default export
</script>

<style scoped>
.bg-light {
  background-color: #f8f9fa; /* Light background color */
}
.text-center {
  text-align: center; /* Center text */
}
.logo {
  margin-bottom: 16px; /* Space below the logo */
}
</style>
