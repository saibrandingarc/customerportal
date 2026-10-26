<template>
  <div class="main-content">
    <div class="page-content">
      <div class="container-fluid">
        <div class="d-flex align-items-center mb-3">
          <h5 class="mb-0">Menu</h5>
        </div>

        <div class="card">
          <div class="card-body">
            <p v-if="loading" class="text-muted mb-0">Loading menu...</p>
            <p v-else-if="error" class="text-danger mb-0">{{ error }}</p>
            <PortalDataTable
              v-else
              :headers="headers"
              :items="rows"
              :rows-per-page="10"
              sort-by="project"
              sort-type="asc"
              :max-filter-options="40"
            >
              <template #item-topicCategory="{ topicCategory }">
                {{ topicCategory || '—' }}
              </template>
              <template #item-credits="{ credits }">
                {{ credits ?? '—' }}
              </template>
            </PortalDataTable>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import axios from 'axios';
import type { Header } from 'vue3-easy-data-table';
import { API_BASE_URL } from '@/api/config';
import PortalDataTable from '@/components/PortalDataTable.vue';

interface MenuRow {
  project: string;
  mainContentType: string;
  topicCategory: string;
  description: string;
  credits: number | null;
}

const headers: Header[] = [
  { text: 'Project', value: 'project', sortable: true },
  { text: 'Main Content Type', value: 'mainContentType', sortable: true },
  { text: 'Topic Category', value: 'topicCategory', sortable: true },
  { text: 'Description', value: 'description', sortable: true },
  { text: 'Credits', value: 'credits', sortable: true },
];

const loading = ref(true);
const error = ref('');
const rows = ref<MenuRow[]>([]);

const text = (value: unknown) => (value == null ? '' : String(value).trim());

const readCredits = (value: unknown): number | null => {
  const raw = text(value);
  if (!raw) return null;
  const amount = Number(raw);
  return Number.isFinite(amount) ? amount : null;
};

const readRow = (raw: Record<string, unknown>): MenuRow => ({
  project: text(raw.Project ?? raw.project),
  mainContentType: text(raw['Main Content Type'] ?? raw.mainContentType),
  topicCategory: text(raw['Topic Category'] ?? raw.topicCategory),
  description: text(raw.Description ?? raw.description),
  credits: readCredits(raw.Credits ?? raw.credits),
});

const loadMenu = async () => {
  loading.value = true;
  error.value = '';
  try {
    const response = await axios.get<unknown>(`${API_BASE_URL}/GoogleSheet`);
    const data = response.data;
    rows.value = Array.isArray(data)
      ? data.map((row) => readRow(row as Record<string, unknown>))
      : [];
  } catch (err) {
    const message = axios.isAxiosError(err) ? err.response?.data?.message : '';
    error.value = typeof message === 'string' && message ? message : 'Unable to load the menu.';
    rows.value = [];
  } finally {
    loading.value = false;
  }
};

onMounted(loadMenu);
</script>
