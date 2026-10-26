import { computed, ref } from 'vue';
import axios from 'axios';
import { API_BASE_URL } from '@/api/config';
import { useAuthStore } from '@/stores/userStore';
import { useCompanyInfo } from '@/composables/useCompanyInfo';

const STORAGE_KEY = 'portalCreditStatus';

interface DeliverableCreditRow {
  TotalCredit?: string | number | null;
  Credit_Cost?: string | number | null;
}

interface CreditCache {
  plan: Record<string, number | null>;
  used: Record<string, number>;
}

const creditsInPlan = ref<number | null>(null);
const creditsUsed = ref<number | null>(null);
const availableCredits = computed(() => {
  if (creditsInPlan.value == null || creditsUsed.value == null) return null;
  return Math.round((creditsInPlan.value - creditsUsed.value) * 100) / 100;
});

const requests = new Map<string, Promise<void>>();

function emptyCache(): CreditCache {
  return { plan: {}, used: {} };
}

function readCache(): CreditCache {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return emptyCache();
  try {
    const parsed = JSON.parse(raw) as Partial<CreditCache>;
    return {
      plan: parsed.plan && typeof parsed.plan === 'object' ? parsed.plan : {},
      used: parsed.used && typeof parsed.used === 'object' ? parsed.used : {},
    };
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return emptyCache();
  }
}

function writeCache(cache: CreditCache) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
}

function usedKey(companyId: string, year: number) {
  return `${companyId}:${year}`;
}

function readDeliverableRows(payload: unknown): DeliverableCreditRow[] {
  let data = payload;
  if (typeof data === 'string') {
    try {
      data = JSON.parse(data);
    } catch {
      return [];
    }
  }
  if (!data || typeof data !== 'object') return [];
  const rows = (data as { data?: DeliverableCreditRow[] }).data;
  return Array.isArray(rows) ? rows : [];
}

function rowCredits(row: DeliverableCreditRow): number | null {
  const raw = row.TotalCredit ?? row.Credit_Cost;
  if (raw === null || raw === undefined || raw === '') return null;
  const numeric = Number(raw);
  return Number.isFinite(numeric) ? numeric : null;
}

export function formatCredits(value: unknown): string {
  if (value === null || value === undefined || value === '') return '—';
  return String(value);
}

function applyStored(companyId: string, year: number): { hasPlan: boolean; hasUsed: boolean } {
  const cache = readCache();
  const hasPlan = Object.prototype.hasOwnProperty.call(cache.plan, companyId);
  const key = usedKey(companyId, year);
  const hasUsed = Object.prototype.hasOwnProperty.call(cache.used, key);
  creditsInPlan.value = hasPlan ? cache.plan[companyId] : null;
  creditsUsed.value = hasUsed ? cache.used[key] : null;
  return { hasPlan, hasUsed };
}

export function useCreditStatus() {
  const authStore = useAuthStore();
  const { hasData, mdCreditsNumber, loadCompanyInfo } = useCompanyInfo();

  async function loadCreditsInPlan(companyId: string) {
    const cache = readCache();
    if (Object.prototype.hasOwnProperty.call(cache.plan, companyId)) {
      creditsInPlan.value = cache.plan[companyId];
      return;
    }

    try {
      await loadCompanyInfo({ refresh: false });
      if (!hasData.value) {
        creditsInPlan.value = null;
        return;
      }
      creditsInPlan.value = mdCreditsNumber.value;
      const next = readCache();
      next.plan[companyId] = creditsInPlan.value;
      writeCache(next);
    } catch (err) {
      console.error('Error loading credits in plan:', err);
      creditsInPlan.value = null;
    }
  }

  async function loadCreditsUsed(companyId: string, year: number) {
    const key = usedKey(companyId, year);
    const cache = readCache();
    if (Object.prototype.hasOwnProperty.call(cache.used, key)) {
      creditsUsed.value = cache.used[key];
      return;
    }

    try {
      const response = await axios.get(
        `${API_BASE_URL}/Zoho/zoho/deliverables/${companyId}/year`,
        { params: { year } }
      );
      const rows = readDeliverableRows(response.data);
      const total = rows.reduce((sum, row) => sum + (rowCredits(row) ?? 0), 0);
      creditsUsed.value = Math.round(total * 100) / 100;
      const next = readCache();
      next.used[key] = creditsUsed.value;
      writeCache(next);
    } catch (err) {
      console.error('Error loading credits used:', err);
      creditsUsed.value = null;
    }
  }

  function loadCreditStatus(year = new Date().getFullYear()) {
    const companyId = authStore.getCompanyId();
    if (!companyId) {
      creditsInPlan.value = null;
      creditsUsed.value = null;
      return Promise.resolve();
    }

    applyStored(companyId, year);
    const key = usedKey(companyId, year);
    const existing = requests.get(key);
    if (existing) return existing;

    const request = Promise.all([
      loadCreditsInPlan(companyId),
      loadCreditsUsed(companyId, year),
    ]).then(() => undefined).finally(() => {
      requests.delete(key);
    });
    requests.set(key, request);
    return request;
  }

  return {
    creditsInPlan,
    creditsUsed,
    availableCredits,
    loadCreditStatus,
  };
}
