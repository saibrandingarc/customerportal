<template>
  <div class="main-content">
    <div class="page-content">
      <div class="container-fluid">
        <div class="card">
          <div class="card-header">
            <h5 class="mb-0">{{ title }}</h5>
          </div>
          <div class="card-body">
            <p class="mb-0">{{ summary }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const title = computed(() => String(route.meta.title ?? ''));
const summary = computed(() => String(route.meta.summary ?? ''));
</script>
