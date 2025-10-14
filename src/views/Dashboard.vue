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
          <!-- Left Column - Bar Chart -->
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
                <DoughnutChart v-bind="doughnutChartProps" />
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
import NavBar from "../components/NavBar.vue";
import SidebarMenu from '@/components/SidebarMenu.vue';
import Footer from '@/components/Footer.vue';
import { useAuthStore } from '@/stores/userStore';
import { API_BASE_URL } from '@/api/config';

import { DoughnutChart, useDoughnutChart } from "vue-chart-3";
import { BarChart, useBarChart } from 'vue-chart-3';
import { Chart, ChartData, ChartOptions, registerables } from "chart.js";

const router = useRouter();
const authStore = useAuthStore();
const snackbar = ref<boolean>(false);
const loading = ref(false);

// Register Chart.js
Chart.register(...registerables);
const toggleLegend = ref(true);
const dataValues = ref<number[]>([]);
const dataLabels = ref<string[]>([]);
const backgroundColor = ref<string[]>([]);
const options = computed<ChartOptions<"doughnut">>(() => ({
  scales: {
    myScale: {
      type: "logarithmic",
      position: toggleLegend.value ? "left" : "right",
    },
  },
  plugins: {
    legend: {
      position: toggleLegend.value ? "top" : "bottom",
    },
    title: {
      display: true,
      text: "Deliverables by Type (Records)",
    },
  },
}));
const testData = computed<ChartData<"doughnut">>(() => ({
  labels: dataLabels.value,
  datasets: [
    {
      data: dataValues.value,
      backgroundColor: backgroundColor.value,
    },
  ],
}));
const { doughnutChartProps, doughnutChartRef } = useDoughnutChart({
  chartData: testData,
  options,
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
  await fetchCases();
  await fetchDeliverables();
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

    // Process the response data to extract necessary chart data
    const statusCount: { [key: string]: number } = {};

    response.data.data.forEach((item: any) => {
      const status = item.Main_Status; // Replace with your actual data field
      if (status) {
        statusCount[status] = (statusCount[status] || 0) + 1;
      }
    });
    console.log(statusCount);
    dataLabels.value = Object.keys(statusCount);
    dataValues.value = Object.values(statusCount);
    backgroundColor.value = Object.keys(statusCount).map(() => getRandomColor(dataValues.value.length));
    console.log(backgroundColor.value);
  } catch (err) {
    console.error("Error fetching deliverables:", err);
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
</style>
