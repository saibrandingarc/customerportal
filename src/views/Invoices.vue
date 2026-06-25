<template>
  <div v-if="loading" class="spinner-overlay d-flex justify-content-center align-items-center">
    <div class="spinner-border text-primary" role="status">
      <span class="visually-hidden">Loading...</span>
    </div>
  </div>
  <div class="main-content">
    <div class="page-content">
      <div class="container-fluid">
        <div class="row">
          <div class="col-12 col-sm-6">
            <div class="card">
              <div class="card-body">
                <h4>Outstanding Balance</h4>
                <h2>{{ formattedOutstandingBalance }}</h2>
              </div>
            </div>
          </div>
          <div class="col-12 col-sm-6">
            <div class="card">
              <div class="card-body">
                <h4>Past Due</h4>
                <h2>{{ formattedPastDue }}</h2>
              </div>
            </div>
          </div>
        </div>
        <div class="card">
          <div class="card-body">
            <div class="d-flex align-items-center mb-3">
              <h5 class="me-3 mb-0">Invoices</h5>
              <div class="flex-grow-1 border-start mx-3" style="height: 24px;"></div>
            </div>
            <div class="row">
              <div class="col-12 d-none d-md-block">
                <EasyDataTable :headers="headers" :items="items" :rows-per-page="10" table-class="table-bordered"
                  show-index :searchable="true">
                  <template #item-TotalAmount="{ TotalAmount }">
                    {{ Number(TotalAmount).toLocaleString('en-US', { style: 'currency', currency: 'USD' }) }}
                  </template>
                  <template #item-Actions="{ Id, InvoiceLink, Status }">
                    <button class="btn btn-sm btn-primary" @click="handleRowClick(Id)">Download</button>
                    <a v-if="Status !== 'Paid'" :href="InvoiceLink" target="_blank" rel="noopener noreferrer"
                      class="btn btn-sm btn-primary mx-2">Pay Now</a>
                  </template>
                </EasyDataTable>
              </div>
            </div>

            <!-- Mobile card view -->
            <div class="d-md-none invoice-cards">
              <p v-if="!items.length" class="text-muted text-center py-3 mb-0">
                No Available Data
              </p>
              <div v-for="(row, i) in items" :key="row.Id ?? i" class="invoice-card">
                <div class="dc-row">
                  <span class="dc-label">Invoice ID</span>
                  <span class="dc-value fw-semibold">{{ row.Id }}</span>
                </div>
                <div class="dc-row">
                  <span class="dc-label">Status</span>
                  <span class="dc-value">
                    <span class="badge" :class="row.Status === 'Paid' ? 'bg-success' : 'bg-warning'">
                      {{ row.Status }}
                    </span>
                  </span>
                </div>
                <div class="dc-row">
                  <span class="dc-label">Invoice Date</span>
                  <span class="dc-value">{{ row.InvoiceDate }}</span>
                </div>
                <div class="dc-row">
                  <span class="dc-label">Due Date</span>
                  <span class="dc-value">{{ row.DueDate }}</span>
                </div>
                <div class="dc-row">
                  <span class="dc-label">Total Amount</span>
                  <span class="dc-value fw-semibold">
                    {{ Number(row.TotalAmount).toLocaleString('en-US', { style: 'currency', currency: 'USD' }) }}
                  </span>
                </div>
                <div class="dc-actions">
                  <button class="btn btn-sm btn-primary" @click="handleRowClick(row.Id)">Download</button>
                  <a v-if="row.Status !== 'Paid'" :href="row.InvoiceLink" target="_blank" rel="noopener noreferrer"
                    class="btn btn-sm btn-primary">Pay Now</a>
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
import { ref, computed, watch, onMounted } from 'vue';
import axios from 'axios';
import NavBar from "../components/NavBar.vue";
import SidebarMenu from '@/components/SidebarMenu.vue';
import { useAuthStore } from '@/stores/userStore';
import { Invoice } from "@/interfaces/Invoice";
import { Header } from 'vue3-easy-data-table';
import { API_BASE_URL } from '@/api/config';
const authStore = useAuthStore();

// Totals
const outstandingBalance = ref(0);
const pastDue = ref(0);
const isChecked = ref(false);
const isDisabled = ref(false)
const loading = ref(false);
const error = ref('');
const items = ref<Invoice[]>([]);
const heading = ref("Invoices")
const search = ref('');

const headers: Header[] = [
  { text: 'Invoice ID', value: 'Id' },
  { text: 'Status', value: 'Status' },
  { text: 'Invoice Date', value: 'InvoiceDate' },
  { text: 'Due Date', value: 'DueDate' },
  { text: 'Total Amount', value: 'TotalAmount' },
  { text: 'Actions', value: 'Actions' },
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

// Fetch invoices using the access token
const fetchInvoices = async () => {
  loading.value = true;
  try {
    console.log(authStore);
    const parsedData = JSON.parse(localStorage.getItem("user"));
    const companyName = parsedData.companyName;
    console.log(companyName);
    var companyId = authStore.getCompanyId();
    const response = await axios.get(API_BASE_URL + '/Intuit/invoices/' + companyName);
    console.log(response);
    error.value = '';
    const invoices: Invoice[] = response.data.QueryResponse.Invoice.map(
      (item: {
        Id: any;
        TxnDate: any;
        DueDate: any;
        TotalAmt: any;
        Balance: number;
        InvoiceLink?: string;
      }) => ({
        Id: item.Id,
        InvoiceDate: item.TxnDate,
        DueDate: item.DueDate,
        TotalAmount: item.TotalAmt,
        Status: item.Balance === 0 ? "Paid" : "Pending",
        InvoiceLink: item.InvoiceLink,
      })
    );

    // Calculate outstanding balance and past due totals
    const today = new Date();
    let outstandingTotal = 0;
    let pastDueTotal = 0;

    response.data.QueryResponse.Invoice.forEach(
      (item: { DueDate: string; Balance: number; }) => {
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
      }
    );

    outstandingBalance.value = outstandingTotal;
    pastDue.value = pastDueTotal;

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
      const response = await axios.get(API_BASE_URL + '/Intuit/invoice/pdf/' + id, {
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
/* Mobile card view for the invoices table */
.invoice-card {
  border: 1px solid #e9ebec;
  border-radius: 8px;
  padding: 12px 14px;
  margin-bottom: 12px;
  background: #fff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}

.dc-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 5px 0;
  font-size: 14px;
}

.dc-row + .dc-row {
  border-top: 1px dashed #f0f0f0;
}

.dc-label {
  color: #878a99;
  font-weight: 500;
  flex: 0 0 auto;
}

.dc-value {
  text-align: right;
  word-break: break-word;
}

.dc-actions {
  display: flex;
  gap: 8px;
  margin-top: 10px;
}

.dc-actions .btn {
  flex: 1;
}
</style>