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
        <OutstandingApprovalsNotice />
        <div class="row">
          <div class="col-12">
            <div class="card">
              <div class="card-body">
                <CreditStatus />
              </div>
            </div>
          </div>
          <div v-if="showWebsiteProgress" class="col-12">
            <div class="card website-status-card">
              <div class="card-body">
                <p v-if="websiteError" class="text-danger mb-0">{{ websiteError }}</p>
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
          <div class="col-12 col-md-6">
            <div class="card clickable-card" role="button" tabindex="0" @click="goToInvoices" @keydown.enter="goToInvoices">
              <div class="card-body">
                <h4>Outstanding Balance</h4>
                <h2>{{ formattedOutstandingBalance }}</h2>
              </div>
            </div>
          </div>
          <div class="col-12 col-md-6">
            <div class="card clickable-card" role="button" tabindex="0" @click="goToInvoices" @keydown.enter="goToInvoices">
              <div class="card-body">
                <h4>Past Due</h4>
                <h2>{{ formattedPastDue }}</h2>
              </div>
            </div>
          </div>
        </div>
        <div class="row">
          <div class="col-12 col-lg-6">
            <div
              class="card card-height-100 clickable-card"
              role="button"
              tabindex="0"
              @click="goToActiveDeliverables"
              @keydown.enter="goToActiveDeliverables"
            >
              <div class="card-header align-items-center d-flex">
                <h4 class="card-title mb-0 flex-grow-1">Active Deliverables</h4>
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
          <div class="col-12 col-lg-6">
            <div
              class="card card-height-100 clickable-card"
              role="button"
              tabindex="0"
              @click="goToCases"
              @keydown.enter="goToCases"
            >
              <div class="card-header align-items-center d-flex">
                <h4 class="card-title mb-0 flex-grow-1">Website Cases</h4>
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
        <div class="row">
          <div class="col-12 col-lg-6">
            <div
              class="card clickable-card"
              role="button"
              tabindex="0"
              @click="goToActiveDeliverables"
              @keydown.enter="goToActiveDeliverables"
            >
              <div class="card-header align-items-center d-flex">
                <h4 class="card-title mb-0 flex-grow-1">Active Deliverables</h4>
              </div>
              <div class="card-body">
                <p v-if="!dataLabels.length" class="text-muted mb-0">No active deliverables.</p>
                <div v-else class="pie-layout">
                  <div class="chart-wrap pie-chart-wrap">
                    <PieChart
                      :key="deliverablesPieKey"
                      v-bind="deliverablesPieChartProps"
                      ref="deliverablesPieChartRef"
                    />
                  </div>
                  <ul class="pie-legend">
                    <li v-for="(label, index) in dataLabels" :key="label">
                      <span
                        class="pie-legend__swatch"
                        :style="{ backgroundColor: pieSliceColors(dataLabels.length)[index] }"
                      ></span>
                      <span>{{ label }}</span>
                      <strong>{{ dataValues[index] }}</strong>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <div class="col-12 col-lg-6">
            <div
              class="card clickable-card"
              role="button"
              tabindex="0"
              @click="goToCases"
              @keydown.enter="goToCases"
            >
              <div class="card-header align-items-center d-flex">
                <h4 class="card-title mb-0 flex-grow-1">Website Cases</h4>
              </div>
              <div class="card-body">
                <p v-if="!casesChartLabels.length" class="text-muted mb-0">No website cases.</p>
                <div v-else class="pie-layout">
                  <div class="chart-wrap pie-chart-wrap">
                    <PieChart
                      :key="casesPieKey"
                      v-bind="casesPieChartProps"
                      ref="casesPieChartRef"
                    />
                  </div>
                  <ul class="pie-legend">
                    <li v-for="(label, index) in casesChartLabels" :key="label">
                      <span
                        class="pie-legend__swatch"
                        :style="{ backgroundColor: pieSliceColors(casesChartLabels.length)[index] }"
                      ></span>
                      <span>{{ label }}</span>
                      <strong>{{ casesChartValues[index] }}</strong>
                    </li>
                  </ul>
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
import { useWebsiteStatus } from '@/composables/useWebsiteStatus';
import { publishDeliverableRows } from '@/composables/useOutstandingApprovals';
import OutstandingApprovalsNotice from '@/components/OutstandingApprovalsNotice.vue';
import CreditStatus from '@/components/CreditStatus.vue';

import { PieChart, usePieChart } from "vue-chart-3";
import { BarChart, useBarChart } from 'vue-chart-3';
import { Chart, ChartData, ChartOptions, registerables } from "chart.js";

const router = useRouter();
const authStore = useAuthStore();

const goToInvoices = () => {
  router.push('/invoices');
};

const goToActiveDeliverables = () => {
  router.push({ path: '/deliverables', query: { tab: 'active' } });
};

const goToCases = () => {
  router.push('/cases');
};
const snackbar = ref<boolean>(false);
const loading = ref(false);
const outstandingBalance = ref(0);
const pastDue = ref(0);
const { websiteStatus, websiteLoading, websiteError, loadWebsiteStatus } = useWebsiteStatus();

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
    statuses: ["launch / post-launch", "launch", "post-launch"],
  },
];

const normalizeWebsiteStatus = (value: string) =>
  value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const settledWebsiteStatuses = new Set([
  "active",
  "self hosted",
  "suspended",
  "terminated",
]);

const normalizedWebsiteStatus = computed(() =>
  normalizeWebsiteStatus(websiteStatus.value)
);

const showWebsiteProgress = computed(() => {
  if (websiteLoading.value) return false;
  if (websiteError.value || !websiteStatus.value) return true;
  return !settledWebsiteStatuses.has(normalizedWebsiteStatus.value);
});

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
  verticalBarOptions("Active Deliverables")
);

const PIE_COLORS = [
  "#42A5F5",
  "#0192d0",
  "#5C6BC0",
  "#26A69A",
  "#66BB6A",
  "#FFA726",
  "#EF5350",
  "#AB47BC",
  "#8D6E63",
  "#78909C",
  "#EC407A",
  "#7E57C2",
  "#9CCC65",
  "#FFCA28",
  "#26C6DA",
  "#FF7043",
];

function pieSliceColors(count: number): string[] {
  return Array.from({ length: count }, (_, index) => PIE_COLORS[index % PIE_COLORS.length]);
}

function pieOptions(): ChartOptions<"pie"> {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label(item) {
            const value = Number(item.raw ?? 0);
            const data = (item.dataset.data as number[]).map((entry) => Number(entry) || 0);
            const total = data.reduce((sum, entry) => sum + entry, 0);
            const percent = total > 0 ? Math.round((value / total) * 100) : 0;
            return ` ${item.label}: ${value} (${percent}%)`;
          },
        },
      },
    },
  };
}

const deliverablesPieKey = computed(
  () => `deliverables-pie-${dataLabels.value.join("|")}-${dataValues.value.join("|")}`
);
const deliverablesPieData = computed<ChartData<"pie">>(() => ({
  labels: dataLabels.value,
  datasets: [
    {
      data: dataValues.value,
      backgroundColor: pieSliceColors(dataValues.value.length),
      borderColor: "#ffffff",
      borderWidth: 2,
    },
  ],
}));
const deliverablesPieOptions = computed<ChartOptions<"pie">>(() => pieOptions());
const { pieChartProps: deliverablesPieChartProps, pieChartRef: deliverablesPieChartRef } = usePieChart({
  chartData: deliverablesPieData,
  options: deliverablesPieOptions,
});

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

  await loadWebsiteStatus();
  await fetchCases();
  await fetchDeliverables();
  await fetchInvoices();
});

onUnmounted(() => {
  window.removeEventListener('resize', updateIsMobile);
});

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
    publishDeliverableRows(response.data);

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
  verticalBarOptions("Website Cases")
);

// Initialize Bar Chart with vue-chart-3
const { barChartProps, barChartRef } = useBarChart({
  chartData,
  options: chartOptions,
});

const casesPieKey = computed(
  () => `cases-pie-${casesChartLabels.value.join("|")}-${casesChartValues.value.join("|")}`
);
const casesPieData = computed<ChartData<"pie">>(() => ({
  labels: casesChartLabels.value,
  datasets: [
    {
      data: casesChartValues.value,
      backgroundColor: pieSliceColors(casesChartValues.value.length),
      borderColor: "#ffffff",
      borderWidth: 2,
    },
  ],
}));
const casesPieOptions = computed<ChartOptions<"pie">>(() => pieOptions());
const { pieChartProps: casesPieChartProps, pieChartRef: casesPieChartRef } = usePieChart({
  chartData: casesPieData,
  options: casesPieOptions,
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
.pie-layout {
  display: flex;
  align-items: center;
  gap: 12px;
}

.card:has(.pie-layout) .card-body {
  overflow: visible;
}

.pie-chart-wrap {
  flex: 1 1 58%;
  height: 280px;
  min-width: 0;
}

.pie-legend {
  flex: 0 1 42%;
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.pie-legend li {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #212529;
  font-size: 12px;
  line-height: 1.3;
}

.pie-legend__swatch {
  width: 10px;
  height: 10px;
  border-radius: 2px;
  flex: none;
}

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
