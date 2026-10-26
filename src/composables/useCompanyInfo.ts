import { computed, ref } from 'vue';
import axios from 'axios';
import { API_BASE_URL } from '@/api/config';
import { useAuthStore } from '@/stores/userStore';

const STORAGE_KEY = 'dashboardZohoData';

const zohoApiData = ref<Record<string, unknown> | null>(null);
const accountImageUrl = ref('');
const loading = ref(false);
const error = ref('');
let request: Promise<void> | null = null;

function parsePayload(data: unknown): Record<string, unknown> | null {
  let value = data;
  if (typeof value === 'string') {
    try {
      value = JSON.parse(value);
    } catch {
      return null;
    }
  }
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }
  return value as Record<string, unknown>;
}

function readCreditNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  const numeric = Number(String(value).replace(/,/g, '').trim());
  return Number.isFinite(numeric) ? numeric : null;
}

const formatZohoValue = (value: unknown): string => {
  if (value === null || value === undefined || value === '') {
    return '-';
  }

  if (Array.isArray(value)) {
    return value.length ? value.map((item) => String(item)).join(', ') : '-';
  }

  if (typeof value === 'object') {
    return JSON.stringify(value);
  }

  return String(value);
};

const resolvedRecord = computed<Record<string, unknown> | null>(() => {
  const payload = zohoApiData.value;
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const rootData = (payload as { data?: unknown }).data;

  if (Array.isArray(rootData)) {
    const firstRecord = rootData[0];
    return firstRecord && typeof firstRecord === 'object'
      ? (firstRecord as Record<string, unknown>)
      : null;
  }

  if (rootData && typeof rootData === 'object') {
    return rootData as Record<string, unknown>;
  }

  return payload;
});

async function fetchCompanyInfo() {
  const authStore = useAuthStore();
  loading.value = true;
  error.value = '';

  try {
    const companyId = authStore.getCompanyId();
    if (!companyId) {
      zohoApiData.value = null;
      return;
    }

    const response = await axios.get(`${API_BASE_URL}/Zoho/zoho/${companyId}`);
    const data = parsePayload(response?.data);
    zohoApiData.value = data;

    if (data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }

    await loadAccountImage(companyId, resolvedRecord.value?.Record_Image);
  } catch (err) {
    console.error('Error fetching company information:', err);
    const errorMessage = axios.isAxiosError(err)
      ? err.response?.data?.message || err.message
      : 'Unknown error';
    error.value = `Unable to load company information. (${errorMessage})`;
  } finally {
    loading.value = false;
  }
}

let accountImageRequest = 0;

async function loadAccountImage(companyId: string, recordImage: unknown) {
  const requestId = ++accountImageRequest;
  if (recordImage === null || recordImage === undefined || recordImage === '') {
    accountImageUrl.value = '';
    return;
  }

  try {
    const response = await axios.get(`${API_BASE_URL}/Zoho/zoho/${companyId}/photo`, {
      responseType: 'blob',
    });
    if (requestId !== accountImageRequest) return;

    const blob = response.data as Blob;
    if (!blob?.type?.startsWith('image/') || blob.size === 0) {
      accountImageUrl.value = '';
      return;
    }

    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(blob);
    });
    if (requestId !== accountImageRequest || !dataUrl.startsWith('data:image/')) return;
    accountImageUrl.value = dataUrl;
  } catch (err) {
    if (requestId !== accountImageRequest) return;
    console.error('Error fetching account image:', err);
    accountImageUrl.value = '';
  }
}

export function useCompanyInfo() {
  const companyName = computed(() => formatZohoValue(resolvedRecord.value?.Account_Name));
  const productsEngaged = computed(() => formatZohoValue(resolvedRecord.value?.Products_Engaged));
  const mdCredits = computed(() => formatZohoValue(resolvedRecord.value?.MD_Credits));
  const mdCreditsNumber = computed(() => readCreditNumber(resolvedRecord.value?.MD_Credits));
  const hasData = computed(() => resolvedRecord.value !== null);

  const accountJson = computed(() =>
    resolvedRecord.value ? JSON.stringify(resolvedRecord.value, null, 2) : ''
  );

  const hydrateCompanyInfo = () => {
    if (zohoApiData.value) return;
    const cached = localStorage.getItem(STORAGE_KEY);
    if (!cached) return;
    try {
      zohoApiData.value = JSON.parse(cached);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const loadCompanyInfo = (options?: { refresh?: boolean }) => {
    hydrateCompanyInfo();
    if (options?.refresh === false && zohoApiData.value) {
      return Promise.resolve();
    }

    if (!request) {
      request = fetchCompanyInfo().finally(() => {
        request = null;
      });
    }

    return request;
  };

  return {
    loading,
    error,
    hasData,
    companyName,
    productsEngaged,
    mdCredits,
    mdCreditsNumber,
    accountJson,
    accountImageUrl,
    loadCompanyInfo,
  };
}
