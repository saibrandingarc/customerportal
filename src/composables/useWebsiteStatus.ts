import { computed, ref } from 'vue';
import axios from 'axios';
import { API_BASE_URL } from '@/api/config';
import { useAuthStore } from '@/stores/userStore';

const websiteStatus = ref('');
const websiteLoading = ref(false);
const websiteError = ref('');
let request: Promise<void> | null = null;

const normalizeWebsiteStatus = (value: string) =>
  value
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

const parseWebsiteRecord = (payload: unknown): Record<string, unknown> | null => {
  let data = payload;
  if (typeof data === 'string') {
    const trimmed = data.trim();
    if (!trimmed.startsWith('{')) return null;
    try {
      data = JSON.parse(trimmed);
    } catch {
      return null;
    }
  }

  if (!data || typeof data !== 'object') return null;
  const records = (data as { data?: unknown }).data;
  if (!Array.isArray(records) || records.length === 0) return null;

  const websites = records.filter(
    (record): record is Record<string, unknown> =>
      Boolean(record) && typeof record === 'object'
  );
  if (!websites.length) return null;

  return websites.reduce((latest, record) => {
    const latestTime = Date.parse(String(latest.Modified_Time ?? ''));
    const recordTime = Date.parse(String(record.Modified_Time ?? ''));
    if (Number.isNaN(recordTime)) return latest;
    if (Number.isNaN(latestTime) || recordTime > latestTime) return record;
    return latest;
  });
};

async function fetchWebsiteStatus() {
  const authStore = useAuthStore();
  websiteLoading.value = true;
  websiteError.value = '';

  try {
    const companyId = authStore.getCompanyId();
    if (!companyId) {
      websiteStatus.value = '';
      return;
    }

    const response = await axios.get(`${API_BASE_URL}/Zoho/zoho/website/${companyId}`);
    const record = parseWebsiteRecord(response?.data);
    const status = record?.Website_Status;
    websiteStatus.value = status === null || status === undefined ? '' : String(status);
  } catch (err) {
    console.error('Error fetching website status:', err);
    const errorMessage = axios.isAxiosError(err)
      ? err.response?.data?.message || err.message
      : 'Unknown error';
    websiteError.value = `Unable to fetch website status. (${errorMessage})`;
  } finally {
    websiteLoading.value = false;
  }
}

export function useWebsiteStatus() {
  const isWebsiteLive = computed(() => normalizeWebsiteStatus(websiteStatus.value) === 'active');

  const loadWebsiteStatus = () => {
    if (!request) {
      request = fetchWebsiteStatus().finally(() => {
        request = null;
      });
    }
    return request;
  };

  return {
    websiteStatus,
    websiteLoading,
    websiteError,
    isWebsiteLive,
    loadWebsiteStatus,
  };
}
