<template>
  <div v-if="loading" class="spinner-overlay d-flex justify-content-center align-items-center">
    <div class="spinner-border text-primary" role="status">
      <span class="visually-hidden">Loading...</span>
    </div>
  </div>
  <div class="main-content">
    <div class="page-content">
      <div class="container-fluid">
        <div class="card">
          <div class="card-body">
            <div class="row">
              <div class="col-12">
                <EasyDataTable
                  :headers="headers"
                  :items="items"
                  :rows-per-page="10"
                  table-class="table-bordered"
                  show-index
                  :searchable="true"
                >
                  <template #item-Actions="{ Id }">
                    <button class="btn btn-sm btn-primary" @click="handleRowClick(Id)">Download</button>
                  </template>
                </EasyDataTable>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch, onMounted } from 'vue';
import axios from 'axios';
import NavBar from "../components/NavBar.vue";
import SidebarMenu from '@/components/SidebarMenu.vue';
import { useAuthStore } from '@/stores/userStore';
import { Invoice } from "@/interfaces/Invoice";
import { Header } from 'vue3-easy-data-table';
import { API_BASE_URL } from '@/api/config';
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

const headers: Header[] = [
  { text: 'ID', value: 'Id' },
  { text: 'Invoice Date', value: 'InvoiceDate' },
  { text: 'Due Date', value: 'DueDate' },
  { text: 'Total Amount', value: 'TotalAmount' },
  { text: 'Status', value: 'Status' },
  { text: 'Actions', value: 'Actions' },
];

// Fetch invoices using the access token
const fetchInvoices = async () => {
  loading.value = true;
  try {
    console.log(authStore);
    const parsedData = JSON.parse(localStorage.getItem("user"));
    const companyName = parsedData.companyName;
    console.log(companyName);
    var companyId = authStore.getCompanyId();
    const response = await axios.get(API_BASE_URL+'/Intuit/invoices/'+companyName);
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

const handleRowClick = async (id: string) => {
  console.log(id);
  if (id) {
    try {
      const response = await axios.get(API_BASE_URL+'/Intuit/invoice/pdf/'+id, {
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