<template>
  <div class="main-content">
    <div class="page-content">
      <div class="container-fluid">
        <div v-if="library" class="card">
          <div class="card-header">
            <h5 class="mb-0">{{ item ? item.title : library.title }}</h5>
          </div>
          <div class="card-body">
            <template v-if="item">
              <router-link class="resource-back" :to="listPath">Back to {{ library.title }}</router-link>
              <p v-if="item.summary" class="resource-summary">{{ item.summary }}</p>
              <ol v-if="item.steps?.length" class="scribe-steps">
                <li v-for="(step, index) in item.steps" :key="step.title">
                  <span class="scribe-num">{{ index + 1 }}</span>
                  <div>
                    <strong>{{ step.title }}</strong>
                    <p>{{ step.detail }}</p>
                  </div>
                </li>
              </ol>
              <div v-else class="article-copy">
                <p v-for="paragraph in item.paragraphs" :key="paragraph">{{ paragraph }}</p>
              </div>
            </template>
            <template v-else-if="missing">
              <p class="mb-3">That page is not in this list.</p>
              <router-link class="resource-back" :to="listPath">Back to {{ library.title }}</router-link>
            </template>
            <template v-else>
              <p class="resource-intro">{{ library.intro }}</p>
              <div class="resource-list">
                <router-link
                  v-for="entry in library.items"
                  :key="entry.slug"
                  class="resource-card"
                  :to="`${listPath}/${entry.slug}`"
                >
                  <strong>{{ entry.title }}</strong>
                  <span>{{ entry.summary }}</span>
                </router-link>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { libraryFor } from '@/views/resourceContent';

const route = useRoute();
const library = computed(() => libraryFor(String(route.meta.library ?? '')));
const listPath = computed(() => (library.value?.key === 'articles' ? '/resources/articles' : '/resources/scribes'));
const item = computed(() => {
  const slug = typeof route.params.slug === 'string' ? route.params.slug : '';
  if (!slug || !library.value) return null;
  return library.value.items.find((entry) => entry.slug === slug) ?? null;
});
const missing = computed(() => Boolean(route.params.slug) && !item.value);
</script>

<style scoped>
.resource-intro {
  margin: 0 0 12px;
  color: #495057;
}

.resource-list {
  display: grid;
  gap: 12px;
}

.resource-card {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px 14px;
  border: 1px solid #e9ebec;
  border-radius: 8px;
  color: #212529;
  text-decoration: none;
}

.resource-card strong {
  font-size: 15px;
}

.resource-card span {
  color: #495057;
  font-size: 14px;
  line-height: 1.45;
}

.resource-card:hover {
  border-color: #0192d0;
  color: #0192d0;
}

.resource-card:hover span {
  color: #495057;
}

.resource-back {
  display: inline-block;
  margin-bottom: 12px;
  color: #0192d0;
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
}

.resource-back:hover {
  text-decoration: underline;
}

.resource-summary {
  margin: 0 0 16px;
  color: #495057;
}

.scribe-steps {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.scribe-steps li {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.scribe-num {
  flex: 0 0 28px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(1, 146, 208, 0.12);
  color: #0192d0;
  font-size: 13px;
  font-weight: 700;
  line-height: 28px;
  text-align: center;
}

.scribe-steps strong {
  display: block;
  margin-bottom: 4px;
}

.scribe-steps p,
.article-copy p {
  margin: 0;
  color: #495057;
  line-height: 1.5;
}

.article-copy {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>
