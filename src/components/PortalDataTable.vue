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
      <div
        v-for="field in filterFields"
        :key="field"
        class="portal-data-table__filter"
        :ref="(element) => setFilterRoot(field, element)"
      >
        <span :id="filterLabelId(field)">{{ headerLabel(field) }}</span>
        <button
          type="button"
          class="form-select text-start portal-data-table__toggle"
          :aria-expanded="openField === field"
          :aria-labelledby="filterLabelId(field)"
          @click="toggleOpen(field)"
        >
          {{ filterSummary(field) }}
        </button>
        <div
          v-if="openField === field"
          class="portal-data-table__menu"
          role="group"
          :aria-labelledby="filterLabelId(field)"
        >
          <label class="portal-data-table__option">
            <input
              type="checkbox"
              :checked="!(selectedFilters[field]?.length)"
              @change="clearField(field)"
            />
            All
          </label>
          <label
            v-for="option in filterChoices[field]"
            :key="option"
            class="portal-data-table__option"
            :class="{ 'is-selected': isSelected(field, option) }"
          >
            <input
              type="checkbox"
              :checked="isSelected(field, option)"
              @change="toggleOption(field, option)"
            />
            {{ option }}
          </label>
        </div>
      </div>
      <button
        type="button"
        :disabled="!hasActiveFilters"
        class="btn btn-outline-secondary portal-data-table__reset"
        @click="resetFilters"
      >
        <i class="mdi mdi-filter-remove-outline me-1" aria-hidden="true"></i>
        Reset filters
      </button>
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
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue';
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
const instanceId = Math.random().toString(36).slice(2, 8);
const selectedFilters = reactive<Record<string, string[]>>({});
const openField = ref<string | null>(null);
const filterRoots = new Map<string, HTMLElement>();

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
      choices[header.value] = [...values].sort((a, b) =>
        a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
      );
    }
  }
  return choices;
});

const filterFields = computed(() => Object.keys(filterChoices.value));

watch(filterChoices, (choices) => {
  for (const field of Object.keys(selectedFilters)) {
    const selected = selectedFilters[field] ?? [];
    const valid = selected.filter((value) => choices[field]?.includes(value));
    if (valid.length !== selected.length) {
      selectedFilters[field] = valid;
    }
  }
});

const visibleItems = computed(() => {
  const query = search.value.trim().toLowerCase();
  return props.items.filter((item) => {
    for (const field of filterFields.value) {
      const selected = selectedFilters[field] ?? [];
      if (selected.length && !selected.includes(String(readField(item, field) ?? ''))) {
        return false;
      }
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

function filterLabelId(field: string): string {
  return `portal-filter-${instanceId}-${field.replace(/[^A-Za-z0-9_-]/g, '-')}`;
}

function setFilterRoot(field: string, element: unknown): void {
  if (element instanceof HTMLElement) {
    filterRoots.set(field, element);
    return;
  }
  filterRoots.delete(field);
}

function toggleOpen(field: string): void {
  openField.value = openField.value === field ? null : field;
}

function isSelected(field: string, option: string): boolean {
  return selectedFilters[field]?.includes(option) ?? false;
}

function clearField(field: string): void {
  selectedFilters[field] = [];
}

function toggleOption(field: string, option: string): void {
  const current = selectedFilters[field] ?? [];
  selectedFilters[field] = current.includes(option)
    ? current.filter((value) => value !== option)
    : [...current, option];
}

function filterSummary(field: string): string {
  const selected = selectedFilters[field] ?? [];
  if (!selected.length) return 'All';
  return selected.join(', ');
}

function onPointerDown(event: PointerEvent): void {
  const field = openField.value;
  if (!field) return;
  const root = filterRoots.get(field);
  if (root && event.target instanceof Node && !root.contains(event.target)) {
    openField.value = null;
  }
}

onMounted(() => document.addEventListener('pointerdown', onPointerDown));
onBeforeUnmount(() => document.removeEventListener('pointerdown', onPointerDown));

const hasActiveFilters = computed(
  () =>
    search.value.trim() !== '' ||
    Object.values(selectedFilters).some((selected) => selected.length > 0)
);

function resetFilters(): void {
  search.value = '';
  openField.value = null;
  for (const field of Object.keys(selectedFilters)) {
    selectedFilters[field] = [];
  }
}
</script>

<style scoped>
.portal-data-table__tools {
  position: relative;
  z-index: 5;
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
  position: relative;
  flex: 0 1 200px;
}

.portal-data-table__toggle {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.portal-data-table__menu {
  position: absolute;
  z-index: 20;
  top: calc(100% + 2px);
  left: 0;
  min-width: 100%;
  max-height: 240px;
  overflow: auto;
  padding: 4px 0;
  border: 1px solid #ced4da;
  border-radius: 6px;
  background: #fff;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.12);
}

.portal-data-table__option {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  padding: 6px 12px;
  color: #212529;
  font-size: 14px;
  font-weight: 400;
  white-space: nowrap;
  cursor: pointer;
}

.portal-data-table__option:hover,
.portal-data-table__option.is-selected {
  background: #0192d0;
  color: #fff;
}

.portal-data-table__option input {
  margin: 0;
}

.portal-data-table__reset {
  display: inline-flex;
  align-items: center;
  white-space: nowrap;
}
</style>
