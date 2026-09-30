<template>
  <!-- Loading Spinner -->
  <div v-if="loading" class="spinner-overlay d-flex justify-content-center align-items-center">
    <div class="spinner-border text-primary" role="status">
      <span class="visually-hidden">Loading...</span>
    </div>
  </div>
  <div class="main-content">
    <div class="page-content">
      <div class="container-fluid">
        <div class="row">
          <div class="col-12 mt-3">
            <div class="card card-height-100">
              <div class="card-header align-items-center d-flex">
                <h4 class="card-title mb-0 flex-grow-1">Company Information</h4>
              </div>
              <div class="card-body">
                <p v-if="zohoApiLoading" class="mb-0">Loading Zoho data...</p>
                <p v-else-if="zohoApiError" class="text-danger mb-2">{{ zohoApiError }}</p>
                <p v-else-if="!zohoApiData" class="mb-0">No Zoho data available.</p>
                <div v-else>
                  <div class="mb-1"><strong>Company Name:</strong> {{ companyNameDisplay }}</div>
                  <div class="mb-1"><strong>Products Engaged:</strong> {{ productsEngagedDisplay }}</div>
                  <div class="mb-1"><strong>MD Credits:</strong> {{ mdCreditsDisplay }}</div>
                </div>
              </div>
            </div>
          </div>
          <div class="col-12 mb-3">
            <div class="card website-status-card">
              <div class="card-body">
                <p v-if="websiteLoading" class="mb-0">Loading website status...</p>
                <p v-else-if="websiteError" class="text-danger mb-0">{{ websiteError }}</p>
                <p v-else-if="!websiteStatus" class="mb-0">No website status available.</p>
                <div v-else class="website-status">
                  <div class="website-status__summary">
                    <div class="website-status__badge" aria-hidden="true">
                      <span>STEP</span>
                      <strong>{{ websiteStepIndex >= 0 ? websiteStepNumber : "–" }}</strong>
                      <span>OF {{ websiteSteps.length }}</span>
                    </div>
                    <div class="website-status__copy">
                      <h3>{{ websiteStepTitle }}</h3>
                      <p>{{ websiteStepDescription }}</p>
                    </div>
                  </div>
                  <ol class="website-status__track">
                    <li
                      v-for="(step, index) in websiteSteps"
                      :key="step.label"
                      class="website-status__step"
                      :class="{
                        'is-current': index === websiteStepIndex,
                        'is-complete': websiteStepIndex >= 0 && index < websiteStepIndex,
                      }"
                    >
                      <span class="website-status__dot">{{ index + 1 }}</span>
                      <span class="website-status__label">{{ step.label }}</span>
                    </li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
          <div class="col-12 col-md-6 mb-3">
            <div class="card clickable-card" role="button" tabindex="0" @click="goToInvoices" @keydown.enter="goToInvoices">
              <div class="card-body">
                <h4>Outstanding Balance</h4>
                <h2>{{ formattedOutstandingBalance }}</h2>
              </div>
            </div>
          </div>
          <div class="col-12 col-md-6 mb-3">
            <div class="card clickable-card" role="button" tabindex="0" @click="goToInvoices" @keydown.enter="goToInvoices">
              <div class="card-body">
                <h4>Past Due</h4>
                <h2>{{ formattedPastDue }}</h2>
              </div>
            </div>
          </div>
        </div>
        <div class="row">
          <div class="col-12 col-lg-6 mb-4">
            <div class="card card-height-100">
              <div class="card-header align-items-center d-flex">
                <h4 class="card-title mb-0 flex-grow-1">Deliverables</h4>
                <div class="flex-shrink-0">
                  <!-- <div class="dropdown card-header-dropdown">
                    <a class="text-reset dropdown-btn" href="#" data-bs-toggle="dropdown" aria-haspopup="true"
                      aria-expanded="false">
                      <span class="text-muted">Report<i class="mdi mdi-chevron-down ms-1"></i></span>
                    </a>
                    <div class="dropdown-menu dropdown-menu-end">
                      <a class="dropdown-item" href="#">Download Report</a>
                      <a class="dropdown-item" href="#">Export</a>
                      <a class="dropdown-item" href="#">Import</a>
                    </div>
                  </div> -->
                </div>
              </div>
              <div class="card-body">
                <div class="chart-wrap" :style="{ height: deliverablesChartHeight }">
                  <BarChart
                    :key="deliverablesChartKey"
                    v-bind="deliverablesBarChartProps"
                    ref="deliverablesBarChartRef"
                  />
                </div>
              </div>
            </div>
          </div>
          <div class="col-12 col-lg-6 mb-4">
            <div class="card card-height-100">
              <div class="card-header align-items-center d-flex">
                <h4 class="card-title mb-0 flex-grow-1">Cases</h4>
                <div class="flex-shrink-0">
                  <!-- <div class="dropdown card-header-dropdown">
                    <a class="text-reset dropdown-btn" href="#" data-bs-toggle="dropdown" aria-haspopup="true"
                      aria-expanded="false">
                      <span class="text-muted">Report<i class="mdi mdi-chevron-down ms-1"></i></span>
                    </a>
                    <div class="dropdown-menu dropdown-menu-end">
                      <a class="dropdown-item" href="#">Download Report</a>
                      <a class="dropdown-item" href="#">Export</a>
                      <a class="dropdown-item" href="#">Import</a>
                    </div>
                  </div> -->
                </div>
              </div>
              <div class="card-body">
                <div class="chart-wrap" :style="{ height: casesChartHeight }">
                  <BarChart :key="casesChartKey" v-bind="barChartProps" ref="barChartRef" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { useAuthStore } from '@/stores/userStore';
import { API_BASE_URL } from '@/api/config';

import { DoughnutChart, useDoughnutChart } from "vue-chart-3";
import { BarChart, useBarChart } from 'vue-chart-3';
import { Chart, ChartData, ChartOptions, registerables } from "chart.js";

const router = useRouter();
const authStore = useAuthStore();

const goToInvoices = () => {
  router.push('/invoices');
};
const snackbar = ref<boolean>(false);
const loading = ref(false);
const outstandingBalance = ref(0);
const pastDue = ref(0);
const ZOHO_API_STORAGE_KEY = "dashboardZohoData";
const zohoApiData = ref<Record<string, unknown> | null>(null);
const zohoApiLoading = ref(false);
const zohoApiError = ref("");
const websiteLoading = ref(false);
const websiteError = ref("");
const websiteStatus = ref("");

interface WebsiteBuildStep {
  label: string;
  title: string;
  description: string;
  statuses: string[];
}

const websiteSteps: WebsiteBuildStep[] = [
  {
    label: "Planning / Framework",
    title: "Planning & Framework",
    description:
      "We're laying the groundwork for everything that comes next. This is where we organize the site structure, confirm project requirements, and make sure the pieces are in place before content and design begin.",
    statuses: ["planning / framework", "planning & framework", "planning and framework"],
  },
  {
    label: "Content Development",
    title: "Content Development",
    description:
      "We're writing and gathering the pages, messages, and materials the site needs so design and build have a clear foundation.",
    statuses: ["content development"],
  },
  {
    label: "Design & Element Building",
    title: "Design & Element Building",
    description:
      "We're shaping the look of the site and building the elements that bring the structure and content together.",
    statuses: ["design & element building", "design and element building"],
  },
  {
    label: "Site Configuration",
    title: "Site Configuration",
    description:
      "We're setting up the site itself: pages, tools, and the technical pieces that make the design work in the browser.",
    statuses: ["site configuration"],
  },
  {
    label: "Internal Review & Refinement",
    title: "Internal Review & Refinement",
    description:
      "Our team is reviewing the site and refining the details before it is ready for you to see.",
    statuses: ["internal review & refinement", "internal review and refinement"],
  },
  {
    label: "Client Review & Approval",
    title: "Client Review & Approval",
    description:
      "The site is ready for your review. This is where you confirm the direction and we apply your feedback.",
    statuses: ["client review & approval", "client review and approval"],
  },
  {
    label: "Launch Preparation",
    title: "Launch Preparation",
    description:
      "We're preparing the site to go live, with final checks and the connections that need to be in place on launch day.",
    statuses: ["launch preparation"],
  },
  {
    label: "Launch / Post-Launch",
    title: "Launch / Post-Launch",
    description:
      "The site is live or in its final launch stage. We're confirming everything is in place and supporting what comes next.",
    statuses: ["launch / post-launch", "launch", "post-launch", "active", "live"],
  },
];

const normalizeWebsiteStatus = (value: string) =>
  value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const websiteStepIndex = computed(() => {
  const normalized = normalizeWebsiteStatus(websiteStatus.value);
  if (!normalized) return -1;
  return websiteSteps.findIndex((step) =>
    step.statuses.some((status) => normalizeWebsiteStatus(status) === normalized)
  );
});

const websiteStepNumber = computed(() =>
  websiteStepIndex.value >= 0 ? websiteStepIndex.value + 1 : 1
);

const websiteStepTitle = computed(() =>
  websiteStepIndex.value >= 0
    ? websiteSteps[websiteStepIndex.value].title
    : websiteStatus.value
);

const websiteStepDescription = computed(() =>
  websiteStepIndex.value >= 0
    ? websiteSteps[websiteStepIndex.value].description
    : "This status is outside the 8-step website timeline."
);

// Register Chart.js
Chart.register(...registerables);
const isMobile = ref(false);

const updateIsMobile = () => {
  isMobile.value = window.innerWidth < 768;
};

const deliverablesChartHeight = computed(() => (isMobile.value ? '420px' : '400px'));
const casesChartHeight = computed(() => (isMobile.value ? '400px' : '380px'));

const deliverablesChartKey = computed(
  () => `x-${dataLabels.value.join('|')}`
);

function verticalBarOptions(title: string): ChartOptions<"bar"> {
  const mobile = isMobile.value;
  return {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: "x",
    layout: {
      padding: { top: 8, right: 28, bottom: 8, left: 8 },
    },
    datasets: {
      bar: {
        maxBarThickness: mobile ? 24 : 40,
        categoryPercentage: mobile ? 0.5 : 0.65,
        barPercentage: mobile ? 0.55 : 0.7,
      },
    },
    plugins: {
      legend: { display: false },
      title: {
        display: false,
        text: title,
      },
      tooltip: {
        callbacks: {
          title(items) {
            return items[0]?.label ?? "";
          },
        },
      },
    },
    scales: {
      x: {
        ticks: {
          autoSkip: false,
          maxRotation: 45,
          minRotation: 45,
          padding: 4,
          font: { size: mobile ? 10 : 11 },
        },
        afterFit(axis) {
          axis.height = Math.max(axis.height, mobile ? 96 : 88);
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
          stepSize: 1,
          autoSkip: true,
          maxTicksLimit: 8,
          callback(value) {
            const n = Number(value);
            return Number.isInteger(n) ? n : '';
          },
        },
      },
    },
  };
}
const toggleLegend = ref(true);
const dataValues = ref<number[]>([]);
const dataLabels = ref<string[]>([]);
const deliverablesBarColor = "#42A5F5";
const deliverablesBarBorderColor = "#1E88E5";

/** Fixed x-axis order for Deliverables by Main_Status (dashboard bar chart). */
const DELIVERABLES_STATUS_AXIS_ORDER: readonly string[] = [
  "Research",
  "Ready To Schedule Planning",
  "Ready To Schedule",
  "Ready to Record",
  "Webinar Outline",
  "In Progress - Video Voice",
  "In Progress - Video",
  "In Progress - Content",
  "In Progress - Graphic",
  "In Progress - Executive",
  "In Progress - Consulting",
  "In Progress - SEO",
  "In Progress - Web",
  "Manager Review",
  "Quality Review - Initial",
  "Client Approval - Initial",
  "Publish Proposal",
  "Manager Review - Final",
  "Quality Review - Final",
  "Client Approval - Final",
  "Ready To Publish",
  "Publish Content",
  "Publishing Scheduled",
  "Submission Outstanding",
  "On Hold",
];

const formattedOutstandingBalance = computed(() =>
  outstandingBalance.value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  })
);

const formattedPastDue = computed(() =>
  pastDue.value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  })
);

// Deliverables Bar Chart configuration
const deliverablesChartData = computed<ChartData<"bar">>(() => ({
  labels: dataLabels.value,
  datasets: [
    {
      label: "",
      data: dataValues.value,
      backgroundColor: deliverablesBarColor,
      borderColor: deliverablesBarBorderColor,
      borderWidth: 1,
      maxBarThickness: isMobile.value ? 28 : 56,
    },
  ],
}));

const deliverablesChartOptions = computed<ChartOptions<"bar">>(() =>
  verticalBarOptions("Deliverables by Type (Records)")
);

const { barChartProps: deliverablesBarChartProps, barChartRef: deliverablesBarChartRef } = useBarChart({
  chartData: deliverablesChartData,
  options: deliverablesChartOptions,
});

interface Case {
  Created_Time?: string;
  Due_Date?: string;
}

// Cases and deliverables
const cases = ref<Case[]>([]);
const deliverables = ref([]);

// Fetch data on mount
onMounted(async () => {
  updateIsMobile();
  window.addEventListener('resize', updateIsMobile);

  const cachedZohoData = localStorage.getItem(ZOHO_API_STORAGE_KEY);
  if (cachedZohoData) {
    try {
      zohoApiData.value = JSON.parse(cachedZohoData);
    } catch {
      localStorage.removeItem(ZOHO_API_STORAGE_KEY);
    }
  }

  await fetchZohoDetails();
  await fetchWebsiteStatus();
  await fetchCases();
  await fetchDeliverables();
  await fetchInvoices();
});

onUnmounted(() => {
  window.removeEventListener('resize', updateIsMobile);
});

const fetchZohoDetails = async () => {
  zohoApiLoading.value = true;
  zohoApiError.value = "";

  try {
    const companyId = authStore.getCompanyId();
    const response = await axios.get(`${API_BASE_URL}/Zoho/zoho/${companyId}`);
    const data = response?.data ?? null;
    zohoApiData.value = data;

    if (data) {
      localStorage.setItem(ZOHO_API_STORAGE_KEY, JSON.stringify(data));
    } else {
      localStorage.removeItem(ZOHO_API_STORAGE_KEY);
    }
  } catch (err) {
    console.error("Error fetching Zoho details:", err);
    const errorMessage = axios.isAxiosError(err)
      ? err.response?.data?.message || err.message
      : "Unknown error";
    zohoApiError.value = `Unable to fetch Zoho data from local API. (${errorMessage})`;
  } finally {
    zohoApiLoading.value = false;
  }
};

const formatZohoValue = (value: unknown): string => {
  if (value === null || value === undefined) {
    return "-";
  }

  if (Array.isArray(value)) {
    return value.length ? value.map((item) => String(item)).join(", ") : "-";
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
};

const resolvedZohoRecord = computed<Record<string, unknown> | null>(() => {
  const payload = zohoApiData.value;
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const rootData = (payload as { data?: unknown }).data;

  if (Array.isArray(rootData)) {
    const firstRecord = rootData[0];
    return firstRecord && typeof firstRecord === "object"
      ? (firstRecord as Record<string, unknown>)
      : null;
  }

  if (rootData && typeof rootData === "object") {
    return rootData as Record<string, unknown>;
  }

  return payload;
});

const companyNameDisplay = computed(() =>
  formatZohoValue(resolvedZohoRecord.value?.Account_Name)
);

const productsEngagedDisplay = computed(() =>
  formatZohoValue(resolvedZohoRecord.value?.Products_Engaged)
);

const mdCreditsDisplay = computed(() =>
  formatZohoValue(resolvedZohoRecord.value?.MD_Credits)
);

const parseWebsiteRecord = (payload: unknown): Record<string, unknown> | null => {
  let data = payload;
  if (typeof data === "string") {
    const trimmed = data.trim();
    if (!trimmed.startsWith("{")) return null;
    try {
      data = JSON.parse(trimmed);
    } catch {
      return null;
    }
  }

  if (!data || typeof data !== "object") return null;
  const records = (data as { data?: unknown }).data;
  if (!Array.isArray(records) || records.length === 0) return null;

  const websites = records.filter(
    (record): record is Record<string, unknown> =>
      Boolean(record) && typeof record === "object"
  );
  if (!websites.length) return null;

  return websites.reduce((latest, record) => {
    const latestTime = Date.parse(String(latest.Modified_Time ?? ""));
    const recordTime = Date.parse(String(record.Modified_Time ?? ""));
    if (Number.isNaN(recordTime)) return latest;
    if (Number.isNaN(latestTime) || recordTime > latestTime) return record;
    return latest;
  });
};

const fetchWebsiteStatus = async () => {
  websiteLoading.value = true;
  websiteError.value = "";
  websiteStatus.value = "";

  try {
    const companyId = authStore.getCompanyId();
    if (!companyId) {
      return;
    }

    const response = await axios.get(`${API_BASE_URL}/Zoho/zoho/website/${companyId}`);
    const record = parseWebsiteRecord(response?.data);
    const status = record?.Website_Status;
    websiteStatus.value = status === null || status === undefined ? "" : String(status);
  } catch (err) {
    console.error("Error fetching website status:", err);
    const errorMessage = axios.isAxiosError(err)
      ? err.response?.data?.message || err.message
      : "Unknown error";
    websiteError.value = `Unable to fetch website status. (${errorMessage})`;
  } finally {
    websiteLoading.value = false;
  }
};

// Utility function to format date to 'YYYY-MM'
function getMonthYear(dateString: string | undefined): string | null {
  if (!dateString) return null;
  const date = new Date(dateString);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

// Compute count per month
const countsPerMonth = computed(() => {
  const counts: Record<string, number> = {};

  cases.value.forEach((record) => {
    const createdMonth = getMonthYear(record.Created_Time);
    const dueMonth = getMonthYear(record.Due_Date);

    // Count Created_Time month
    if (createdMonth) {
      counts[createdMonth] = (counts[createdMonth] || 0) + 1;
    }

    // Count Due_Date month
    if (dueMonth) {
      counts[dueMonth] = (counts[dueMonth] || 0) + 1;
    }
  });

  return Object.keys(counts)
    .sort((a, b) => a.localeCompare(b)) // Sort keys in ascending order
    .reduce((sortedCounts, key) => {
      sortedCounts[key] = counts[key];
      return sortedCounts;
    }, {} as Record<string, number>);
});

// Fetch cases
const fetchCases = async () => {
  loading.value = true;
  try {
    const companyId = authStore.getCompanyId();
    const response = await axios.get(
      `${API_BASE_URL}/Zoho/zoho/cases/dashboard/${companyId}`
    );
    console.log("Cases Response:", response);
    cases.value = response.data.data;
  } catch (err) {
    console.error("Error fetching cases:", err);
  } finally {
    loading.value = false;
  }
};

// Fetch deliverables
const fetchDeliverables = async () => {
  loading.value = true;
  try {
    const companyId = authStore.getCompanyId();
    const response = await axios.get(
      `${API_BASE_URL}/Zoho/zoho/deliverables/${companyId}`
    );
    console.log("Deliverables Response:", response);
    deliverables.value = response.data.data;

    // Process the response data to extract necessary chart data
    const statusCount: { [key: string]: number } = {};
    const excludedStatuses = new Set([
      "Approval Idea",
      "Completed",
      "Canceled",
      "Cancelled",
      "Completed - Unapproved",
      "Completed - No Info",
    ]);

    response.data.data.forEach((item: any) => {
      const status = (item.Main_Status ?? "").toString().trim(); // Replace with your actual data field
      if (status && !excludedStatuses.has(status)) {
        statusCount[status] = (statusCount[status] || 0) + 1;
      }
    });
    console.log(statusCount);
    const orderedPresent = DELIVERABLES_STATUS_AXIS_ORDER.filter(
      (status) => (statusCount[status] ?? 0) > 0
    );
    dataLabels.value = orderedPresent;
    dataValues.value = orderedPresent.map((status) => statusCount[status] ?? 0);
  } catch (err) {
    console.error("Error fetching deliverables:", err);
  } finally {
    loading.value = false;
  }
};

// Fetch invoices and calculate outstanding/past due totals
const fetchInvoices = async () => {
  loading.value = true;
  try {
    const parsedData = JSON.parse(localStorage.getItem("user") || "{}");
    const companyName = parsedData.companyName;

    if (!companyName) {
      outstandingBalance.value = 0;
      pastDue.value = 0;
      return;
    }

    const response = await axios.get(`${API_BASE_URL}/Intuit/invoices/${companyName}`);
    const invoices = response?.data?.QueryResponse?.Invoice ?? [];

    const today = new Date();
    let outstandingTotal = 0;
    let pastDueTotal = 0;

    invoices.forEach((item: { DueDate?: string; Balance?: number }) => {
      const balance = Number(item.Balance || 0);
      if (balance > 0) {
        outstandingTotal += balance;

        if (item.DueDate) {
          const dueDate = new Date(item.DueDate);
          if (dueDate < today) {
            pastDueTotal += balance;
          }
        }
      }
    });

    outstandingBalance.value = outstandingTotal;
    pastDue.value = pastDueTotal;
  } catch (err) {
    console.error("Error fetching invoices:", err);
    outstandingBalance.value = 0;
    pastDue.value = 0;
  } finally {
    loading.value = false;
  }
};

// Transform countsPerMonth into Chart.js data
const casesChartLabels = computed(() =>
  Object.keys(countsPerMonth.value).map((ym) => {
    const [year, month] = ym.split("-");
    const date = new Date(Number(year), Number(month) - 1, 1);
    if (Number.isNaN(date.getTime())) return ym;
    return date.toLocaleString("en-US", { month: "short", year: "numeric" });
  })
);
const casesChartValues = computed(() => Object.values(countsPerMonth.value));
const casesChartKey = computed(
  () => `cases-x-${casesChartLabels.value.join('|')}`
);

const chartData = computed<ChartData<"bar">>(() => ({
  labels: casesChartLabels.value,
  datasets: [
    {
      label: "",
      data: casesChartValues.value,
      backgroundColor: "#42A5F5",
      borderColor: "#1E88E5",
      borderWidth: 1,
      maxBarThickness: isMobile.value ? 28 : 56,
    },
  ],
}));

const chartOptions = computed<ChartOptions<"bar">>(() =>
  verticalBarOptions("Monthly Case Count")
);

// Initialize Bar Chart with vue-chart-3
const { barChartProps, barChartRef } = useBarChart({
  chartData,
  options: chartOptions,
});


function getRandomColor(count: any) {
  // Generate random RGB values
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);

  // Convert to hex
  const color = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  return color;
}
</script>

<style scoped>
.v-btn {
  min-width: 80px;
}

.clickable-card {
  cursor: pointer;
}

.website-status-card {
  background: #f4f8fd;
  border: none;
  border-radius: 16px;
  box-shadow: none;
}

.website-status__summary {
  display: flex;
  align-items: center;
  gap: 28px;
}

.website-status__badge {
  flex: 0 0 auto;
  width: 112px;
  height: 112px;
  border-radius: 50%;
  background: #2f6fed;
  color: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.website-status__badge span {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.04em;
}

.website-status__badge strong {
  margin: 4px 0;
  font-size: 42px;
  font-weight: 700;
}

.website-status__copy {
  min-width: 0;
  padding-left: 28px;
  border-left: 1px solid #d5deea;
}

.website-status__copy h3 {
  margin: 0 0 8px;
  color: #1c2434;
  font-size: 28px;
  font-weight: 700;
}

.website-status__copy p {
  margin: 0;
  max-width: 760px;
  color: #5d6b7c;
  font-size: 15px;
  line-height: 1.45;
}

.website-status__track {
  display: flex;
  gap: 8px;
  margin: 28px 0 0;
  padding: 0;
  list-style: none;
  position: relative;
}

.website-status__track::before {
  content: "";
  position: absolute;
  top: 15px;
  left: 24px;
  right: 24px;
  height: 2px;
  background: #d7e0ea;
}

.website-status__step {
  position: relative;
  z-index: 1;
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 0;
  text-align: center;
}

.website-status__dot {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid #c5d0dc;
  background: #fff;
  color: #8b97a8;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
}

.website-status__label {
  margin-top: 10px;
  max-width: 110px;
  color: #8b97a8;
  font-size: 12px;
  line-height: 1.25;
}

.website-status__step.is-current .website-status__dot,
.website-status__step.is-complete .website-status__dot {
  border-color: #2f6fed;
  background: #2f6fed;
  color: #fff;
}

.website-status__step.is-current .website-status__label {
  padding: 6px 8px;
  border-radius: 8px;
  background: #e7f0ff;
  color: #2458d6;
  font-weight: 600;
}

@media (max-width: 767.98px) {
  .website-status__summary {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .website-status__badge {
    width: 88px;
    height: 88px;
  }

  .website-status__badge strong {
    font-size: 32px;
  }

  .website-status__copy {
    padding-left: 0;
    border-left: none;
  }

  .website-status__copy h3 {
    font-size: 22px;
  }

  .website-status__track {
    overflow-x: auto;
    padding-bottom: 8px;
  }

  .website-status__step {
    flex: 0 0 96px;
  }
}
</style>
