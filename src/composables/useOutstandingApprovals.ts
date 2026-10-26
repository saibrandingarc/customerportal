import { computed, ref } from 'vue';
import axios from 'axios';
import { API_BASE_URL } from '@/api/config';
import { useAuthStore } from '@/stores/userStore';

const OVERDUE_DAYS = 7;
const ORANGE_AFTER_DAYS = 30;
const RED_AFTER_DAYS = 45;
const SHOW_KEY = 'show-approval-popup';

export type ApprovalAlertLevel = 'none' | 'attention' | 'orange' | 'red';

interface DeliverableRecord {
  id?: string | number;
  Main_Status?: string | null;
  Status?: string | null;
  Client_Approved?: boolean | string | null;
  Modified_Time?: string | null;
}

const overdueCount = ref(0);
const approvalLevel = ref<ApprovalAlertLevel>('none');
let request: Promise<void> | null = null;

const LEVEL_RANK: Record<ApprovalAlertLevel, number> = {
  none: 0,
  attention: 1,
  orange: 2,
  red: 3,
};

function readDeliverableRows(payload: unknown): DeliverableRecord[] {
  let data = payload;
  if (typeof data === 'string') {
    try {
      data = JSON.parse(data);
    } catch {
      return [];
    }
  }
  if (Array.isArray(data)) return data as DeliverableRecord[];
  if (!data || typeof data !== 'object') return [];
  const rows = (data as { data?: unknown }).data;
  if (typeof rows === 'string') return readDeliverableRows(rows);
  return Array.isArray(rows) ? (rows as DeliverableRecord[]) : [];
}

function levelForAge(age: number): ApprovalAlertLevel {
  if (age > RED_AFTER_DAYS) return 'red';
  if (age > ORANGE_AFTER_DAYS && age < RED_AFTER_DAYS) return 'orange';
  if (age >= RED_AFTER_DAYS) return 'red';
  if (age > OVERDUE_DAYS) return 'attention';
  return 'none';
}

function summarizeApprovals(records: DeliverableRecord[]): { count: number; level: ApprovalAlertLevel } {
  let level: ApprovalAlertLevel = 'none';
  const ages: number[] = [];

  records.forEach((record) => {
    if (!isClientApproval(record) || !record.Modified_Time) return;
    const age = daysSinceModified(record.Modified_Time);
    if (age === null) return;
    const next = levelForAge(age);
    if (next === 'none') return;
    ages.push(age);
    if (LEVEL_RANK[next] > LEVEL_RANK[level]) level = next;
  });

  const count = ages.filter((age) => levelForAge(age) === level).length;
  return { count, level };
}

function daysSinceModified(value: string): number | null {
  const modified = new Date(value);
  if (Number.isNaN(modified.getTime())) return null;

  const modifiedDay = Date.UTC(modified.getFullYear(), modified.getMonth(), modified.getDate());
  const now = new Date();
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.floor((today - modifiedDay) / 86400000);
}

function isApproved(value: DeliverableRecord['Client_Approved']): boolean {
  return value === true || value === 'true';
}

function isClientApproval(record: DeliverableRecord): boolean {
  const status = String(record.Main_Status ?? record.Status ?? '');
  return status.includes('Client Approval') && !isApproved(record.Client_Approved);
}

async function fetchOutstandingApprovals() {
  const authStore = useAuthStore();
  const companyId = authStore.getCompanyId();
  if (!companyId) {
    overdueCount.value = 0;
    approvalLevel.value = 'none';
    return;
  }

  try {
    const year = new Date().getFullYear();
    const [allResult, pendingResult] = await Promise.allSettled([
      axios.get(`${API_BASE_URL}/Zoho/zoho/deliverables/${companyId}`),
      axios.get(`${API_BASE_URL}/Zoho/zoho/deliverables/${companyId}/${year}/pending`),
    ]);
    const records = [
      ...(allResult.status === 'fulfilled' ? readDeliverableRows(allResult.value?.data) : []),
      ...(pendingResult.status === 'fulfilled' ? readDeliverableRows(pendingResult.value?.data) : []),
    ];
    const seen = new Set<string>();
    const unique = records.filter((record, index) => {
      const key = record.id != null ? String(record.id) : `row-${index}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    const summary = summarizeApprovals(unique);
    overdueCount.value = summary.count;
    approvalLevel.value = summary.level;
  } catch (err) {
    console.error('Error checking outstanding approvals:', err);
    overdueCount.value = 0;
    approvalLevel.value = 'none';
  }
}

function applySummary(summary: { count: number; level: ApprovalAlertLevel }) {
  if (LEVEL_RANK[summary.level] > LEVEL_RANK[approvalLevel.value]) {
    approvalLevel.value = summary.level;
    overdueCount.value = summary.count;
    return;
  }
  if (summary.level === approvalLevel.value && summary.count > overdueCount.value) {
    overdueCount.value = summary.count;
  }
}

export function markOutstandingApprovalsNotice() {
  overdueCount.value = 0;
  approvalLevel.value = 'none';
  sessionStorage.setItem(SHOW_KEY, '1');
}

export function shouldShowOutstandingApprovalsNotice(): boolean {
  return sessionStorage.getItem(SHOW_KEY) === '1';
}

export function dismissOutstandingApprovalsNotice() {
  sessionStorage.removeItem(SHOW_KEY);
}

export function publishDeliverableRows(payload: unknown) {
  applySummary(summarizeApprovals(readDeliverableRows(payload)));
}

export function useOutstandingApprovals() {
  const hasOverdueApprovals = computed(() => overdueCount.value > 0);

  const loadOutstandingApprovals = () => {
    if (!request) {
      request = fetchOutstandingApprovals().finally(() => {
        request = null;
      });
    }
    return request;
  };

  return {
    overdueCount,
    approvalLevel,
    hasOverdueApprovals,
    loadOutstandingApprovals,
  };
}
