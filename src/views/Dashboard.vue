<template>
  <nav-bar />
  <SidebarMenu />
  <!-- Loading Spinner -->
  <div v-if="loading" class="spinner-overlay">
    <div class="spinner"></div>
  </div>
  <v-row>
    <v-col cols="6" sm="6">
      <v-card class="mt-4">
        <v-card-title>
          <span class="text-h5">Cases</span>
        </v-card-title>
        <v-card-body>
          <BarChart v-bind="barChartProps" ref="barChartRef" />
        </v-card-body>
      </v-card>
    </v-col>
    <v-col cols="6" sm="6">
      <v-card class="mt-4">
        <v-card-title>
          <span class="text-h5">Deliverables</span>
        </v-card-title>
        <v-card-body>
          <DoughnutChart v-bind="doughnutChartProps" />
        </v-card-body>
      </v-card>
    </v-col>
  </v-row>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import NavBar from "../components/NavBar.vue";
import SidebarMenu from '@/components/SidebarMenu.vue';
import { useAuthStore } from '@/stores/userStore';

import { DoughnutChart, useDoughnutChart } from "vue-chart-3";
import { BarChart, useBarChart } from 'vue-chart-3';
import { Chart, ChartData, ChartOptions, registerables } from "chart.js";

const router = useRouter();
const authStore = useAuthStore();
const snackbar = ref<boolean>(false);

// Register Chart.js
Chart.register(...registerables);
const toggleLegend = ref(true);
const dataValues = ref([30, 40, 60, 70, 5]);
const dataLabels = ref(["Paris", "Nîmes", "Toulon", "Perpignan", "Autre"]);
const backgroundColor = ref(["#77CEFF", "#0079AF", "#123E6B", "#97B0C4", "#A5C8ED", "#A3C8ED", "#A5C81D", "#A5C8E1"]);
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
      text: "Chart.js Doughnut Chart",
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
  // const { doughnutChartProps, doughnutChartRef } = useDoughnutChart({
  //   chartData: testData,
  //   options,
  // });
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
  try {
    const companyId = authStore.getCompanyId();
    const response = await axios.get(
      `https://zohodeliverablesapi.azurewebsites.net/Zoho/zoho/cases/${companyId}`
    );
    console.log("Cases Response:", response);
    cases.value = response.data.data;
  } catch (err) {
    console.error("Error fetching cases:", err);
  }
};

// Fetch deliverables
const fetchDeliverables = async () => {
  try {
    const companyId = authStore.getCompanyId();
    const response = await axios.get(
      `https://zohodeliverablesapi.azurewebsites.net/Zoho/zoho/deliverables/${companyId}`
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
  // const letters = '0123456789ABCDEF';
  // let color = '#';
  // for (let i = 0; i < count; i++) {
  //   color += letters[Math.floor(Math.random() * 16)];
  // }
  // return color;
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
