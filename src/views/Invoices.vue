<template>
  <nav-bar />
  <SidebarMenu />
  <!-- Loading Spinner -->
  <div v-if="loading" class="spinner-overlay">
    <div class="spinner"></div>
  </div>
  <v-card>
    <div class="pa-5">
      <v-row>
        <v-col cols="12" sm="12">
          <v-data-table
            :headers="headers"
            :items="items"
            item-key="Id"
            @click:row="handleRowClick"
          >
          <!-- Custom template for rows -->
            <template #item="{ item }">
              <tr>
                <td>{{ item.Id }}</td>
                <td>{{ item.InvoiceDate }}</td>
                <td>{{ item.DueDate }}</td>
                <td>{{ item.TotalAmount }}</td>
                <td>{{ item.Status }}</td>
                <td>
                  <v-btn-group variant="outlined" divided>
                    <v-btn color="primary" icon="mdi-download" @click="handleRowClick(item)"></v-btn>
                  </v-btn-group>
                </td>
              </tr>
            </template>
          </v-data-table>
        </v-col>
      </v-row>
    </div>
  </v-card>
</template>

<script lang="ts" setup>
import { ref, computed, watch, onMounted } from 'vue';
import axios from 'axios';
import NavBar from "../components/NavBar.vue";
import SidebarMenu from '@/components/SidebarMenu.vue';
import { useAuthStore } from '@/stores/userStore';
import { Invoice } from "@/interfaces/Invoice";
const authStore = useAuthStore();

// Ref to hold invoices data
const invoices = ref<string | null>(null);
const isChecked = ref(false);
const isDisabled = ref(false)
const loading = ref(false);
const error = ref('');
const items = ref<Invoice[]>([]);
const heading = ref("Invoices")
const search = ref('');

const headers = [
  { title: 'ID', key: 'Id' },
  { title: 'Invoice Date', key: 'InvoiceDate' },
  { title: 'Due Date', key: 'DueDate' },
  { title: 'Total Amount', key: 'TotalAmount' },
  { title: 'Status', key: 'Status' },
  { title: 'Actions', key: 'Actions' },
];

// Fetch invoices using the access token
const fetchInvoices = async () => {
  try {
    console.log(authStore);
    const parsedData = JSON.parse(localStorage.getItem("user"));
    const companyName = parsedData.companyName;
    console.log(companyName);
    var companyId = authStore.getCompanyId();
    const response = await axios.get('https://zohodeliverablesapi.azurewebsites.net/Intuit/invoices/'+companyName);
    console.log(response);
    error.value = '';
    const invoices: Invoice[] = response.data.QueryResponse.Invoice.map((item: { Id: any; TxnDate: any; DueDate: any; TotalAmt: any; Balance: number; }) => ({
      Id: item.Id,
      InvoiceDate: item.TxnDate,
      DueDate: item.DueDate,
      TotalAmount: item.TotalAmt,
      Status: item.Balance === 0 ? "Paid" : "Pending"
    }));
    items.value = invoices;
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

const handleRowClick = async (row: any) => {
  console.log('Row clicked:', row);
  if (row?.Id) {
    try {
      const response = await axios.get('https://zohodeliverablesapi.azurewebsites.net/Intuit/invoice/pdf/'+row.Id, {
        responseType: 'blob', // Ensure response is treated as binary data
      });
      if (response.status === 200) {
        // Create a Blob object for the PDF
        const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
        const pdfURL = window.URL.createObjectURL(pdfBlob);

        // Open the PDF in a new tab
        const newTab = window.open();
        if (newTab) {
          newTab.location.href = pdfURL;
        } else {
          alert('Please allow popups to view the PDF.');
        }

        // Revoke the Blob URL to release memory
        setTimeout(() => {
          window.URL.revokeObjectURL(pdfURL);
        }, 10000); // Revoke after 10 seconds
      } else {
        console.error("Error fetching PDF:", response.statusText);
        alert(`Failed to fetch PDF: ${response.statusText}`);
      }
    } catch (err) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  } else {
    console.error('Invalid row or missing ID');
  }
};

onMounted(() => {
  fetchInvoices();
});

</script>

<style scoped>
.v-btn {
  min-width: 80px;
}
</style>
