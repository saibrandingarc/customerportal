<template>
  <div class="portal-data-table">
    <div class="portal-data-table__tools">
      <label class="portal-data-table__search">
        <span>Search</span>
        <input
          v-model="search"
          type="search"
          class="form-control"
          placeholder="Search this table"
        />
      </label>
      <label
        v-for="field in filterFields"
        :key="field"
        class="portal-data-table__filter"
      >
        <span>{{ headerLabel(field) }}</span>
        <select
          class="form-select"
          :value="selectedFilters[field] ?? ''"
          @change="onFilterChange(field, $event)"
        >
          <option value="">All</option>
          <option
            v-for="option in filterChoices[field]"
            :key="option"
            :value="option"
          >
            {{ option }}
          </option>
        </select>
      </label>
    </div>

    <EasyDataTable
      :headers="headers"
      :items="visibleItems"
      :rows-per-page="rowsPerPage"
      :rows-items="[10, 25, 50, 100]"
      :sort-by="sortBy"
      :sort-type="sortType"
      :table-class-name="tableClassName"
      :body-row-class-name="bodyRowClassName"
      :body-expand-row-class-name="bodyExpandRowClassName"
      show-index
      buttons-pagination
      theme-color="#0192d0"
      @click-row="onClickRow"
    >
      <template v-for="(_, slotName) in $slots" :key="slotName" #[slotName]="slotProps">
        <slot :name="slotName" v-bind="slotProps" />
      </template>
    </EasyDataTable>
  </div>
</template>

<script lang="ts" setup>
import { computed, reactive, ref, watch } from 'vue';
import type { Header } from 'vue3-easy-data-table';

type TableItem = Record<string, unknown>;

const SKIP_FILTERS = new Set([
  'actions',
  'operation',
  'name',
  'subject',
  'case_number',
  'id',
  'content_doc_url',
  'final_publication',
  'totalamount',
  'invoicedate',
  'duedate',
  'publish_date',
  'case_open_date',
  'case_closed_date',
  'email',
]);

const props = withDefaults(
  defineProps<{
    headers: Header[];
    items: object[];
    rowsPerPage?: number;
    sortBy?: string;
    sortType?: 'asc' | 'desc';
    tableClassName?: string;
    bodyRowClassName?: string | Function;
    bodyExpandRowClassName?: string;
    maxFilterOptions?: number;
  }>(),
  {
    rowsPerPage: 10,
    sortBy: '',
    sortType: 'asc',
    tableClassName: 'table-bordered',
    bodyRowClassName: '',
    bodyExpandRowClassName: '',
    maxFilterOptions: 15,
  }
);

const emit = defineEmits<{
  (event: 'click-row', item: object): void;
}>();

const search = ref('');
const selectedFilters = reactive<Record<string, string>>({});

function onClickRow(item: object) {
  emit('click-row', item);
}

function readField(item: object, field: string): unknown {
  return (item as TableItem)[field];
}

const searchFields = computed(() =>
  props.headers
    .map((header) => header.value)
    .filter((value) => !['actions', 'Actions', 'Operation'].includes(value))
);

const filterChoices = computed<Record<string, string[]>>(() => {
  const choices: Record<string, string[]> = {};
  for (const header of props.headers) {
    const key = header.value.toLowerCase();
    if (SKIP_FILTERS.has(key)) continue;
    const values = new Set<string>();
    for (const item of props.items) {
      const value = readField(item, header.value);
      if (value === null || value === undefined || value === '') continue;
      values.add(String(value));
    }
    if (values.size >= 2 && values.size <= props.maxFilterOptions) {
      choices[header.value] = [...values].sort((a, b) => a.localeCompare(b));
    }
  }
  return choices;
});

const filterFields = computed(() => Object.keys(filterChoices.value));

watch(filterChoices, (choices) => {
  for (const field of Object.keys(selectedFilters)) {
    const selected = selectedFilters[field];
    if (selected && !choices[field]?.includes(selected)) {
      selectedFilters[field] = '';
    }
  }
});

const visibleItems = computed(() => {
  const query = search.value.trim().toLowerCase();
  return props.items.filter((item) => {
    for (const field of filterFields.value) {
      const selected = selectedFilters[field];
      if (selected && String(readField(item, field) ?? '') !== selected) return false;
    }
    if (!query) return true;
    return searchFields.value.some((field) =>
      String(readField(item, field) ?? '').toLowerCase().includes(query)
    );
  });
});

function headerLabel(field: string): string {
  return props.headers.find((header) => header.value === field)?.text ?? field;
}

function onFilterChange(field: string, event: Event): void {
  selectedFilters[field] = (event.target as HTMLSelectElement).value;
}
</script>

<style scoped>
.portal-data-table__tools {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 12px;
  margin-bottom: 12px;
}

.portal-data-table__search,
.portal-data-table__filter {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin: 0;
  min-width: 160px;
  color: #495057;
  font-size: 12px;
  font-weight: 600;
}

.portal-data-table__search {
  flex: 1 1 240px;
  max-width: 320px;
}

.portal-data-table__filter {
  flex: 0 1 200px;
}
</style>
