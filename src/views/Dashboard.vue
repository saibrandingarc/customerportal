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
          <div class="col-12">
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
          <div class="col-6">
            <div class="card summary-card" @click="goToInvoices">
              <div class="card-body">
                <h4>Outstanding Balance</h4>
                <h2>{{ formattedOutstandingBalance }}</h2>
              </div>
            </div>
          </div>
          <div class="col-6">
            <div class="card summary-card" @click="goToInvoices">
              <div class="card-body">
                <h4>Past Due</h4>
                <h2>{{ formattedPastDue }}</h2>
              </div>
            </div>
          </div>
        </div>
        <div class="row">
          <div class="col-sm-6 mb-4">
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
                <BarChart v-bind="deliverablesBarChartProps" ref="deliverablesBarChartRef" />
              </div>
            </div>
          </div>
          <div class="col-sm-6 mb-4">
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
                <BarChart v-bind="barChartProps" ref="barChartRef" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { useAuthStore } from '@/stores/userStore';
import { API_BASE_URL } from '@/api/config';

import { DoughnutChart, useDoughnutChart } from "vue-chart-3";
import { BarChart, useBarChart } from 'vue-chart-3';
import { Chart, ChartData, ChartOptions, registerables } from "chart.js";

const router = useRouter();
const authStore = useAuthStore();
const snackbar = ref<boolean>(false);
const loading = ref(false);
const outstandingBalance = ref(0);
const pastDue = ref(0);
const ZOHO_API_URL = "https://localhost:7083/Zoho/zoho/3293516000043629616";
const ZOHO_API_STORAGE_KEY = "dashboardZohoData";
const zohoApiData = ref<Record<string, unknown> | null>(null);
const zohoApiLoading = ref(false);
const zohoApiError = ref("");

// Register Chart.js
Chart.register(...registerables);
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

const goToInvoices = () => {
  router.push({ name: 'Invoices' });
};

// Deliverables Bar Chart configuration
const deliverablesChartData = computed<ChartData<"bar">>(() => ({
  labels: dataLabels.value,
  datasets: [
    {
      label: "Deliverables by Status",
      data: dataValues.value,
      backgroundColor: deliverablesBarColor,
      borderColor: deliverablesBarBorderColor,
      borderWidth: 1,
    },
  ],
}));

const deliverablesChartOptions = computed<ChartOptions<"bar">>(() => ({
  responsive: true,
  plugins: {
    legend: { display: true },
    title: {
      display: true,
      text: "Deliverables by Type (Records)",
    },
  },
}));

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
  const cachedZohoData = localStorage.getItem(ZOHO_API_STORAGE_KEY);
  if (cachedZohoData) {
    try {
      zohoApiData.value = JSON.parse(cachedZohoData);
    } catch {
      localStorage.removeItem(ZOHO_API_STORAGE_KEY);
    }
  }

  await fetchZohoDetails();
  await fetchCases();
  await fetchDeliverables();
  await fetchInvoices();
});

const fetchZohoDetails = async () => {
  zohoApiLoading.value = true;
  zohoApiError.value = "";

  try {
    const response = await axios.get(ZOHO_API_URL);
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
const casesChartLabels = computed(() => Object.keys(countsPerMonth.value));
const casesChartValues = computed(() => Object.values(countsPerMonth.value));

const chartData = computed<ChartData<"bar">>(() => ({
  labels: casesChartLabels.value, // Months as labels
  datasets: [
    {
      label: "Cases Per Month",
      data: casesChartValues.value, // Counts as data
      backgroundColor: "#42A5F5",
      borderColor: "#1E88E5",
      borderWidth: 1,
    },
  ],
}));

// Bar Chart Options
const chartOptions = computed<ChartOptions<"bar">>(() => ({
  responsive: true,
  plugins: {
    legend: { display: true },
    title: {
      display: true,
      text: "Monthly Case Count",
    },
  },
}));

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

.summary-card {
  cursor: pointer;
}
</style>
