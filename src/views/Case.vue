<template>
  <div v-if="loading" class="spinner-overlay d-flex justify-content-center align-items-center">
    <div class="spinner-border text-primary" role="status">
      <span class="visually-hidden">Loading...</span>
    </div>
  </div>
  <div class="main-content">
    <div class="page-content">
      <div class="container-fluid">
        <div class="case-history">
          <div class="history-toolbar">
            <div class="history-tabs" role="tablist">
              <button
                type="button"
                class="history-tab"
                :class="{ active: model === 'overview' }"
                @click="model = 'overview'"
              >
                Overview
              </button>
              <button
                type="button"
                class="history-tab"
                :class="{ active: model === 'timeline' }"
                @click="model = 'timeline'"
              >
                Timeline
              </button>
            </div>
            <div v-if="lastUpdateLabel" class="last-update">
              Last Update : {{ lastUpdateLabel }}
            </div>
          </div>

          <div v-if="model === 'overview'" class="history-card">
            <div class="history-card-title">Case Details</div>
            <div class="overview-grid">
              <div><span>ID</span><strong>{{ item?.Case_Number || '—' }}</strong></div>
              <div><span>Name</span><strong>{{ item?.Subject || '—' }}</strong></div>
              <div><span>Case owner</span><strong>{{ item?.Reported_By || item?.Email || '—' }}</strong></div>
              <div class="overview-wide"><span>Description</span><strong>{{ item?.Description || '—' }}</strong></div>
            </div>
            <form v-if="isOpen" class="context-form" @submit.prevent="addContext">
              <label for="case-context">Add context</label>
              <textarea
                id="case-context"
                v-model="contextText"
                rows="4"
                maxlength="5000"
                placeholder="Add more detail for this open case"
              ></textarea>
              <div class="context-actions">
                <button type="submit" class="btn btn-primary btn-sm" :disabled="contextSaving || !contextText.trim()">
                  {{ contextSaving ? 'Saving…' : 'Add context' }}
                </button>
                <span v-if="contextError" class="text-danger">{{ contextError }}</span>
                <span v-else-if="contextSaved" class="text-success">Context added.</span>
              </div>
            </form>
            <div v-if="emailNotes.length" class="notes-block">
              <div class="history-card-title">Notes</div>
              <div v-for="(note, index) in emailNotes" :key="note.id || index" class="note-row">
                <div class="fw-semibold">
                  {{ note.Comment_Type || 'Note' }}
                  <small class="text-muted">{{ formatDate(note.Created_Time || note.Comment_Date) }}</small>
                </div>
                <p class="mb-0">{{ note.Comments }}</p>
              </div>
            </div>
          </div>

          <div v-else class="history-card">
            <div class="history-card-title">History</div>
            <div class="history-filter-row">
              <label class="history-filter">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M4 6h16M7 12h10M10 18h4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
                </svg>
                <select v-model="timelineFilter" aria-label="Timeline history filter">
                  <option value="all">Timeline History</option>
                  <option value="updated">Field updates</option>
                  <option value="created">Created</option>
                </select>
              </label>
            </div>

            <div v-if="timelineLoading" class="history-empty">Loading timeline…</div>
            <div v-else-if="timelineError" class="history-empty text-danger">{{ timelineError }}</div>
            <div v-else-if="!groupedTimeline.length" class="history-empty">No timeline history</div>
            <div v-else class="timeline">
              <section v-for="group in groupedTimeline" :key="group.dateKey" class="timeline-day">
                <div class="timeline-date">{{ group.label }}</div>
                <article v-for="entry in group.entries" :key="entry.id" class="timeline-row">
                  <div class="timeline-time">{{ entry.timeLabel }}</div>
                  <div class="timeline-rail">
                    <span class="timeline-icon" :class="entry.kind" aria-hidden="true">
                      <svg v-if="entry.kind !== 'updated'" viewBox="0 0 24 24">
                        <path d="M7 3.5h7.2L19 8.2V20a1.5 1.5 0 0 1-1.5 1.5h-10A1.5 1.5 0 0 1 6 20V5A1.5 1.5 0 0 1 7.5 3.5H7z" fill="none" stroke="currentColor" stroke-width="1.6"/>
                        <path d="M14 3.8V8h4.2M8.5 12.5h7M8.5 16h5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
                      </svg>
                      <svg v-else viewBox="0 0 24 24">
                        <path d="M4 16.5V20h3.5L18.8 8.7l-3.5-3.5L4 16.5z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
                        <path d="M13.8 6.7l3.5 3.5" fill="none" stroke="currentColor" stroke-width="1.6"/>
                      </svg>
                    </span>
                  </div>
                  <p class="timeline-text">{{ entry.text }}</p>
                </article>
              </section>
            </div>
          </div>

          <p v-if="error" class="text-danger mt-3 mb-0">{{ error }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';
import { useAuthStore } from '@/stores/userStore';
import { API_BASE_URL } from '@/api/config';

type TimelineKind = 'created' | 'updated' | 'other';

interface EmailNote {
  Comment_Type?: string;
  Created_Time?: string;
  Comment_Date?: string;
  Comments?: string;
  id?: string;
}

interface CaseRecord {
  Case_Number?: string | null;
  Subject?: string | null;
  Description?: string | null;
  Status?: string | null;
  Reported_By?: string | null;
  Email?: string | null;
  Email_Notes1?: EmailNote[];
}

interface TimelineField {
  api_name?: string;
  field_label?: string;
  data_type?: string;
  _value?: { new?: unknown; old?: unknown };
}

interface TimelineRecordRef {
  name?: string | null;
  module?: { api_name?: string } | null;
}

interface TimelineEntry {
  id?: string;
  action?: string;
  source?: string;
  audited_time?: string;
  done_by?: { name?: string };
  automation_details?: {
    type?: string;
    rule?: { name?: string };
    workflow?: { field_update_action?: { name?: string }[] };
  } | null;
  record?: TimelineRecordRef | null;
  related_record?: TimelineRecordRef | null;
  field_history?: TimelineField[] | null;
}

interface TimelineRow {
  id: string;
  kind: TimelineKind;
  text: string;
  timeLabel: string;
  dateKey: string;
  dateLabel: string;
  sortTime: number;
}

const route = useRoute();
const authStore = useAuthStore();
const caseId = route.params.Case_Number as string;

const model = ref<'overview' | 'timeline'>('timeline');
const timelineFilter = ref<'all' | 'updated' | 'created'>('all');
const item = ref<CaseRecord | null>(null);
const emailNotes = ref<EmailNote[]>([]);
const timeline = ref<TimelineEntry[]>([]);
const loading = ref(false);
const timelineLoading = ref(false);
const error = ref('');
const timelineError = ref('');
const contextText = ref('');
const contextSaving = ref(false);
const contextError = ref('');
const contextSaved = ref(false);

const isOpen = computed(() => (item.value?.Status ?? '').trim().toLowerCase() === 'new');

const readBody = (payload: unknown): Record<string, unknown> => {
  if (typeof payload === 'string') {
    try {
      return JSON.parse(payload) as Record<string, unknown>;
    } catch {
      return {};
    }
  }
  return (payload ?? {}) as Record<string, unknown>;
};

const fetchCase = async (id: string, showLoader = true) => {
  if (showLoader) loading.value = true;
  try {
    const companyId = authStore.getCompanyId();
    const response = await axios.get(`${API_BASE_URL}/Zoho/zoho/case/${companyId}/${id}`);
    const body = readBody(response.data);
    const rows = Array.isArray(body.data) ? body.data : [];
    const record = (rows[0] ?? null) as CaseRecord | null;
    item.value = record;
    emailNotes.value = [...(record?.Email_Notes1 ?? [])].reverse();
    error.value = '';
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Case details could not be loaded.';
  } finally {
    if (showLoader) loading.value = false;
  }
};

const addContext = async () => {
  const comments = contextText.value.trim();
  if (!isOpen.value || !comments) return;
  contextSaving.value = true;
  contextError.value = '';
  contextSaved.value = false;
  try {
    const companyId = authStore.getCompanyId();
    await axios.post(`${API_BASE_URL}/Zoho/zoho/case/${companyId}/${caseId}/context`, { comments });
    contextText.value = '';
    contextSaved.value = true;
    await fetchCase(caseId, false);
  } catch (err) {
    const data = axios.isAxiosError(err) ? err.response?.data : null;
    const parsed = typeof data === 'string' ? readBody(data) : (data as Record<string, unknown> | null);
    const message = parsed && typeof parsed.message === 'string' ? parsed.message : '';
    contextError.value = message || 'Context could not be saved.';
  } finally {
    contextSaving.value = false;
  }
};

const fetchTimeline = async (id: string) => {
  timelineLoading.value = true;
  try {
    const companyId = authStore.getCompanyId();
    const response = await axios.get(`${API_BASE_URL}/Zoho/zoho/case/${companyId}/${id}/timeline`);
    const body = readBody(response.data);
    const rows = Array.isArray(body.__timeline) ? body.__timeline : [];
    timeline.value = rows as TimelineEntry[];
    timelineError.value = '';
  } catch {
    timeline.value = [];
    timelineError.value = 'Timeline history could not be loaded.';
  } finally {
    timelineLoading.value = false;
  }
};

const formatDate = (dateString?: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatDay = (date: Date): string =>
  date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const formatClock = (date: Date): string =>
  date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

const isBlank = (value: unknown): boolean =>
  value == null || value === '' || value === 'blank';

const formatValue = (value: unknown, dataType?: string): string => {
  if (isBlank(value)) return 'blank value';
  if (typeof value === 'object') {
    const named = value as { name?: string };
    if (named.name) return named.name;
    return JSON.stringify(value);
  }
  const text = String(value);
  const looksLikeDate = dataType === 'date' || dataType === 'datetime' || /^\d{4}-\d{2}-\d{2}/.test(text);
  if (looksLikeDate) {
    const date = new Date(dataType === 'date' || /^\d{4}-\d{2}-\d{2}$/.test(text) ? `${text.slice(0, 10)}T00:00:00` : text);
    if (!Number.isNaN(date.getTime())) return formatDay(date);
  }
  return text;
};

const automationSuffix = (entry: TimelineEntry): string => {
  const details = entry.automation_details;
  if (!details) return '';
  const actionName = details.workflow?.field_update_action?.find((action) => action.name)?.name?.trim() ?? '';
  const ruleName = details.rule?.name?.trim() ?? '';
  const parts: string[] = [];
  if (actionName) parts.push(`through Field Update ${actionName}`);
  if (ruleName) parts.push(`via Workflow rule ${ruleName}`);
  return parts.length ? ` ${parts.join(' ')}` : '';
};

const singularModule = (apiName: string): string => {
  if (apiName.endsWith('ies')) return `${apiName.slice(0, -3)}y`;
  if (apiName.endsWith('s')) return apiName.slice(0, -1);
  return apiName;
};

const isCreatedAction = (action: string): boolean =>
  action === 'added' || action === 'created' || action.includes('create');

const timelineRows = computed<TimelineRow[]>(() => {
  const rows: TimelineRow[] = [];
  timeline.value.forEach((entry, index) => {
    const audited = entry.audited_time ? new Date(entry.audited_time) : null;
    const validDate = audited && !Number.isNaN(audited.getTime()) ? audited : null;
    const dateLabel = validDate ? formatDay(validDate) : 'Unknown date';
    const timeLabel = validDate ? formatClock(validDate) : '';
    const dateKey = validDate ? validDate.toISOString().slice(0, 10) : `unknown-${index}`;
    const sortTime = validDate ? validDate.getTime() : 0;
    const action = (entry.action ?? '').toLowerCase();
    const actor = entry.done_by?.name?.trim() || 'a user';
    const suffix = automationSuffix(entry);
    const fields = entry.field_history ?? [];
    const recordModule = entry.record?.module?.api_name ?? '';
    const isCaseRecord = !recordModule || recordModule === 'Cases';

    if (isCreatedAction(action) && fields.length === 0) {
      const relatedName = entry.record?.name?.trim();
      const text = isCaseRecord
        ? `Case Created by ${actor}${dateLabel === 'Unknown date' ? '' : ` ${dateLabel}`}`
        : `${singularModule(recordModule)} ${relatedName || ''} was added by ${actor}`.replace(/\s+/g, ' ');
      rows.push({
        id: entry.id ?? `created-${index}`,
        kind: isCaseRecord ? 'created' : 'other',
        text,
        timeLabel,
        dateKey,
        dateLabel,
        sortTime,
      });
      return;
    }

    if (fields.length) {
      fields.forEach((field, fieldIndex) => {
        const label = field.field_label || field.api_name || 'A field';
        const oldValue = formatValue(field._value?.old, field.data_type);
        const newValue = formatValue(field._value?.new, field.data_type);
        const fromLabel = oldValue === 'blank value' ? 'blank value' : oldValue;
        rows.push({
          id: `${entry.id ?? index}-${field.api_name ?? fieldIndex}`,
          kind: 'updated',
          text: `${label} was updated from ${fromLabel} to ${newValue}${suffix}`,
          timeLabel,
          dateKey,
          dateLabel,
          sortTime,
        });
      });
      return;
    }

    const readable = action.replaceAll('_', ' ') || 'updated';
    rows.push({
      id: entry.id ?? `event-${index}`,
      kind: isCreatedAction(action) ? 'created' : 'other',
      text: `Case ${readable} by ${actor}${suffix}`,
      timeLabel,
      dateKey,
      dateLabel,
      sortTime,
    });
  });
  return rows.sort((left, right) => right.sortTime - left.sortTime);
});

const visibleRows = computed(() => {
  if (timelineFilter.value === 'all') return timelineRows.value;
  return timelineRows.value.filter((row) => row.kind === timelineFilter.value);
});

const groupedTimeline = computed(() => {
  const groups: { dateKey: string; label: string; entries: TimelineRow[] }[] = [];
  visibleRows.value.forEach((row) => {
    const current = groups[groups.length - 1];
    if (!current || current.dateKey !== row.dateKey) {
      groups.push({ dateKey: row.dateKey, label: row.dateLabel, entries: [row] });
      return;
    }
    current.entries.push(row);
  });
  return groups;
});

const lastUpdateLabel = computed(() => timelineRows.value[0]?.timeLabel ?? '');

onMounted(() => {
  fetchCase(caseId);
  fetchTimeline(caseId);
});
</script>

<style scoped>
.case-history {
  padding-bottom: 24px;
}

.history-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.history-tabs {
  display: inline-flex;
  gap: 8px;
  padding: 4px;
  background: #fff;
  border: 1px solid #e6e8f0;
  border-radius: 999px;
}

.history-tab {
  border: 0;
  background: transparent;
  color: #6b7280;
  border-radius: 999px;
  padding: 6px 16px;
  font-weight: 600;
}

.history-tab.active {
  background: #e8f4fc;
  color: #0192d0;
}

.last-update {
  color: #6b7280;
  font-size: 14px;
  white-space: nowrap;
}

.history-card {
  background: #fff;
  border: 1px solid #e6e8f0;
  border-radius: 12px;
  padding: 20px 22px 8px;
}

.history-card-title {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 14px;
}

.history-filter-row {
  display: flex;
  justify-content: flex-start;
  margin-bottom: 18px;
}

.history-filter {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 1px solid #e6e8f0;
  border-radius: 8px;
  padding: 4px 8px;
  color: #4b5563;
  background: #fff;
}

.history-filter svg {
  width: 16px;
  height: 16px;
}

.history-filter select {
  border: 0;
  background: transparent;
  font-weight: 600;
  color: #374151;
  outline: none;
}

.overview-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px 24px;
  margin-bottom: 18px;
}

.overview-grid span {
  display: block;
  color: #6b7280;
  font-size: 13px;
}

.overview-wide {
  grid-column: 1 / -1;
}

.overview-wide strong {
  white-space: pre-wrap;
}

.context-form {
  margin-top: 18px;
  display: grid;
  gap: 8px;
}

.context-form label {
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.context-form textarea {
  width: 100%;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 10px 12px;
  resize: vertical;
}

.context-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.notes-block {
  border-top: 1px solid #eef0f4;
  padding-top: 16px;
}

.note-row {
  padding: 10px 0;
  border-bottom: 1px solid #f3f4f6;
}

.timeline-day {
  position: relative;
  padding-bottom: 8px;
}

.timeline-date {
  font-weight: 700;
  margin: 4px 0 12px;
}

.timeline-row {
  display: grid;
  grid-template-columns: 92px 36px minmax(0, 1fr);
  gap: 8px;
  align-items: start;
  position: relative;
  padding-bottom: 18px;
}

.timeline-row:not(:last-child) .timeline-rail::after {
  content: '';
  position: absolute;
  top: 28px;
  bottom: -6px;
  left: 50%;
  width: 1px;
  background: #d9dee7;
  transform: translateX(-50%);
}

.timeline-time {
  color: #6b7280;
  font-size: 13px;
  padding-top: 6px;
  text-align: right;
}

.timeline-rail {
  position: relative;
  display: flex;
  justify-content: center;
}

.timeline-icon {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #f3f4f6;
  color: #4b5563;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;
}

.timeline-icon svg {
  width: 15px;
  height: 15px;
}

.timeline-text {
  margin: 0;
  padding-top: 4px;
  color: #1f2937;
  line-height: 1.45;
}

.history-empty {
  color: #6b7280;
  padding: 8px 0 18px;
}

@media (max-width: 720px) {
  .history-toolbar,
  .overview-grid {
    display: block;
  }

  .last-update {
    margin-top: 10px;
  }

  .overview-grid div + div {
    margin-top: 12px;
  }

  .timeline-row {
    grid-template-columns: 72px 32px minmax(0, 1fr);
  }
}
</style>
