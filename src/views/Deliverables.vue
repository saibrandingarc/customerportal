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
        <div class="card">
          <div class="card-body">
            <div class="d-flex align-items-center mb-3">
              <h5 class="me-3 mb-0">Deliverables</h5>
              <div class="flex-grow-1 border-start mx-3" style="height: 24px;"></div>
            </div>

            <ul class="nav nav-tabs mb-3">
              <li class="nav-item">
                <button
                  class="nav-link"
                  :class="{ active: activeDeliverablesTab === 'pending' }"
                  type="button"
                  @click="activeDeliverablesTab = 'pending'"
                >
                  Pending Approvals
                </button>
              </li>
              <li class="nav-item">
                <button
                  class="nav-link"
                  :class="{ active: activeDeliverablesTab === 'upcoming' }"
                  type="button"
                  @click="activeDeliverablesTab = 'upcoming'"
                >
                  Upcoming
                </button>
              </li>
              <li class="nav-item">
                <button
                  class="nav-link"
                  :class="{ active: activeDeliverablesTab === 'completed' }"
                  type="button"
                  @click="activeDeliverablesTab = 'completed'"
                >
                  Completed
                </button>
              </li>
            </ul>

            <div class="tab-content">
              <div class="tab-pane fade" :class="{ 'show active': activeDeliverablesTab === 'pending' }">
                <div class="table-responsive">
                  <EasyDataTable
                    :headers="pendingheaders"
                    :items="pendingDeliverables"
                    :rows-per-page="10"
                    table-class="table-bordered"
                    show-index
                    :searchable="true"
                    buttons-pagination
                  >
                    <template #item-Content_Doc="{ Content_Doc }">
                      <a
                        v-if="Content_Doc"
                        :href="Content_Doc"
                        target="_blank"
                        rel="noopener"
                        class="text-primary fw-semibold"
                      >
                        Open Doc
                      </a>
                      <span v-else class="text-muted">—</span>
                    </template>
                    <template #item-actions="{ id }">
                      <button class="btn btn-success btn-sm me-2" @click="openApproveModal(id)">
                        Approve
                      </button>
                      <button class="btn btn-danger btn-sm" @click="openRejectModal(id)">
                        Reject
                      </button>
                    </template>
                  </EasyDataTable>
                </div>
              </div>

              <div class="tab-pane fade" :class="{ 'show active': activeDeliverablesTab === 'upcoming' }">
                <div class="table-responsive">
                  <EasyDataTable
                    :headers="headers"
                    :items="upcomingDeliverables"
                    :rows-per-page="10"
                    table-class="table-bordered"
                    show-index
                    :searchable="true"
                    buttons-pagination
                  />
                </div>
              </div>

              <div class="tab-pane fade" :class="{ 'show active': activeDeliverablesTab === 'completed' }">
                <div class="col-sm-4">
                  <label for="yearSelect" class="form-label">Select Year</label>
                  <select id="yearSelect" class="form-select w-50 mb-3" v-model="selectedBlock" @change="fetchDataForBlock">
                    <option v-for="(month, index) in monthsArray" :key="index" :value="month">
                      {{ month }}
                    </option>
                  </select>
                </div>
                <div class="table-responsive">
                  <EasyDataTable
                    :headers="completedheaders"
                    :items="completedDeliverables"
                    sort-by="Publish_Date"
                    sort-type="desc"
                    :rows-per-page="10"
                    table-class="table-bordered"
                    show-index
                    buttons-pagination
                  >
                    <template #item-Final_Publication="{ Final_Publication }">
                      <a
                        v-if="Final_Publication"
                        :href="Final_Publication"
                        target="_blank"
                        rel="noopener"
                        class="text-primary text-truncate d-inline-block"
                      >
                        Content Doc
                      </a>
                      <span v-else class="text-muted">—</span>
                    </template>
                  </EasyDataTable>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Modal for Editing Deliverable -->
        <div class="modal fade" tabindex="-1" :class="{ show: dialog }" style="display: block;" v-if="dialog">
          <div class="modal-dialog modal-lg">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">{{ formTitle }}</h5>
                <button type="button" class="btn-close" @click="close"></button>
              </div>
              <div class="modal-body">
                <div class="mb-3">
                  <label class="form-label">Subject</label>
                  <textarea class="form-control" v-model="editedItem.Subject" rows="3"></textarea>
                </div>
                <div class="mb-3">
                  <label class="form-label">Status</label>
                  <select class="form-select" v-model="editedItem.Status">
                    <option
                      v-for="status in ['-None-', 'Email', 'Internal(Automated)', 'Internal(Manual)', 'Phone', 'Web']"
                      :key="status" :value="status">
                      {{ status }}
                    </option>
                  </select>
                </div>
              </div>
              <div class="modal-footer">
                <!-- <button class="btn btn-secondary" @click="close">Cancel</button> -->
                <button class="btn btn-primary" @click="save">Save</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Delete Confirmation Modal -->
        <div class="modal fade" tabindex="-1" :class="{ show: dialogDelete }" style="display: block;"
          v-if="dialogDelete">
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">Are you sure you want to delete this item?</h5>
              </div>
              <div class="modal-footer">
                <button class="btn btn-secondary" @click="closeDelete">Cancel</button>
                <button class="btn btn-danger" @click="deleteItemConfirm">OK</button>
              </div>
            </div>
          </div>
        </div>

      </div>
      <!-- Reject Modal -->
      <div class="modal fade" tabindex="-1" :class="{ show: showRejectModal }" style="display: block;"
        v-if="showRejectModal">
        <div class="modal-dialog modal-md modal-dialog-centered">
          <div class="modal-content shadow-lg">
            <div class="modal-header">
              <h5 class="modal-title">Reject Deliverable</h5>
              <button type="button" class="btn-close" @click="closeRejectModal"></button>
            </div>

            <div class="modal-body">
              <div class="mb-3">
                <label class="form-label">Reason for Rejection</label>
                <textarea class="form-control" v-model="rejectReason" rows="3"></textarea>
              </div>
            </div>

            <div class="modal-footer">
              <button class="btn btn-danger" @click="submitRejection" :disabled="loading">
                <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                Submit
              </button>
            </div>
          </div>
        </div>
      </div>
      <!-- Approval Modal -->
      <div class="modal fade" tabindex="-1" :class="{ show: approveDialog }" style="display: block;"
        v-if="approveDialog">
        <div class="modal-dialog modal-md modal-dialog-centered">
          <div class="modal-content shadow-lg">
            <div class="modal-header">
              <h5 class="modal-title">Approve Deliverable</h5>
              <button type="button" class="btn-close" @click="closeApprove"></button>
            </div>
            <div class="modal-body">
              <p>Are you sure you want to approve this deliverable?</p>

              <div class="mb-3">
                <label class="form-label">Approval Note (optional)</label>
                <textarea class="form-control" v-model="approvalNote" rows="3"></textarea>
              </div>
            </div>
            <div class="modal-footer">
              <!-- <button class="btn btn-secondary" @click="closeApprove">Cancel</button> -->
              <button class="btn btn-success" @click="confirmApprove">Approve</button>
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
import { useAuthStore } from '@/stores/userStore';
import { Header } from 'vue3-easy-data-table';
import Toastify from 'toastify-js'
import 'toastify-js/src/toastify.css'
import { API_BASE_URL } from '@/api/config';

const authStore = useAuthStore();
const activeDeliverablesTab = ref<'upcoming' | 'pending' | 'completed'>('pending');

interface Case {
  Case_Number: string;
  Subject: string;
  Status: string;
  Account_Name: string;
}

// Function to generate months relative to the current date
const generateRelativeMonthsArray = (past: number, future: number): string[] => {
  const today = new Date();
  const months: string[] = [];

  // Generate past months
  for (let i = past; i > 0; i--) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Zero-padded month
    months.push(`${year}-${month}`);
  }

  // Add the current month
  const currentYear = today.getFullYear();
  const currentMonth = (today.getMonth() + 1).toString().padStart(2, '0');
  months.push(`${currentYear}-${currentMonth}`);

  // Generate future months
  for (let i = 1; i <= future; i++) {
    const date = new Date(today.getFullYear(), today.getMonth() + i, 1);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Zero-padded month
    months.push(`${year}-${month}`);
  }

  return months;
};

// Generate array of past 12 months and next 12 months
// const monthsArray = ref<string[]>(generateRelativeMonthsArray(12, 12));
const monthsArray = ref<string[]>(["2026", "2025", "2024"]);

const selectedBlock = ref<string>("2026");

const heading = ref("Deliverables")
const search = ref('');

const headers: Header[] = [
  { text: "Block", value: "Block", sortable: true },
  // { text: "Due Date", value: "Due_Date", sortable: true },
  { text: "Status", value: "Status", sortable: true },
  { text: "Content Type", value: "Main_Content_Type", sortable: true },
  { text: "Topic", value: "Name", sortable: true },
  // { text: "Credit Cost", value: "Credit_Cost", sortable: true }
];

const pendingheaders: Header[] = [
  { text: "Block", value: "Block", sortable: true },
  { text: "Content Type", value: "Main_Content_Type", sortable: true },
  { text: "Topic", value: "Name", sortable: true },
  { text: "Content Document", value: "Content_Doc", sortable: true },
  { text: "Actions", value: "actions" }
];

const completedheaders = [
  { text: 'Block', value: 'Block', class: 'blockWidth' },
  { text: 'Date Published', value: 'Publish_Date' },
  { text: 'Content Type', value: 'Main_Content_Type' },
  { text: 'Topic', value: 'Name', class: "topicWidth" },
  { text: 'Link', value: 'Final_Publication' }
];

const dialog = ref(false)
const dialogDelete = ref(false)

onMounted(() => {
  fetchDeliverables();
});

const isChecked = ref(false);
const isDisabled = ref(false)
const loading = ref(false);
const error = ref('');
const items = ref<Case[]>([]);
const upcomingDeliverables = ref<any[]>([]);
const completedDeliverables = ref<any[]>([]);
const pendingDeliverables = ref<any[]>([]);
const fetchDeliverables = async () => {
  loading.value = true;
  try {
    console.log(authStore);
    var companyId = authStore.getCompanyId();
    const response = await axios.get(API_BASE_URL+'/Zoho/zoho/deliverables/' + companyId + '/' + selectedBlock.value);
    console.log(response);
    error.value = '';
    items.value = response.data.data;
    upcomingDeliverables.value = response.data.data
      .filter((c: { Main_Status: string }) => c.Main_Status !== 'Completed' && c.Main_Status !== 'Cancelled')
      .sort((a, b) => {
        const blockA = (a.Block || '').toString();
        const blockB = (b.Block || '').toString();
        return blockA.localeCompare(blockB);
      });
    completedDeliverables.value = response.data.data
      .filter((c: { Main_Status: string }) => c.Main_Status === 'Completed')
      .sort((a, b) => {
        const dateA = a.Publish_Date ? new Date(a.Publish_Date).getTime() : 0;
        const dateB = b.Publish_Date ? new Date(b.Publish_Date).getTime() : 0;
        return dateB - dateA;
      });
    pendingDeliverables.value = response.data.data
      .filter((c: { Main_Status: string; Client_Approval_Status: string }) =>
        c.Main_Status === 'Client Approval - Final' && c.Client_Approval_Status === null
      )
      .sort((a, b) => {
        const blockA = (a.Block || '').toString();
        const blockB = (b.Block || '').toString();
        return blockA.localeCompare(blockB);
      });
    console.log("test :" + completedDeliverables);
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

// Function to call the API when a month is selected
const fetchDataForBlock = async () => {
  if (!selectedBlock.value) return;
  loading.value = true;
  try {
    var companyId = authStore.getCompanyId();
    const response = await axios.get(API_BASE_URL+'/Zoho/zoho/deliverables/' + companyId + '/' + selectedBlock.value);
    console.log(response);
    error.value = '';
    if(response.data !== "") {
      items.value = response.data.data;
      // upcomingDeliverables.value = response.data.data.filter((c: { Main_Status: string; }) => c.Main_Status !== 'Completed' && c.Main_Status !== 'Cancelled').sort((a, b) => {
      //   const dateA = a.Due_Date ? new Date(a.Due_Date).getTime() : 0;
      //   const dateB = b.Due_Date ? new Date(b.Due_Date).getTime() : 0;
      //   return dateB - dateA;
      // });
      completedDeliverables.value = response.data.data
        .filter((c: { Main_Status: string }) => c.Main_Status === 'Completed')
        .sort((a, b) => {
          const dateA = a.Publish_Date ? new Date(a.Publish_Date).getTime() : 0;
          const dateB = b.Publish_Date ? new Date(b.Publish_Date).getTime() : 0;
          return dateB - dateA;
        });
      // pendingDeliverables.value = response.data.data.filter((c: { Main_Status: string; Client_Approval_Status: string}) => c.Main_Status === 'Client Approval - Final' &&
      // (c.Client_Approval_Status === 'none' || c.Client_Approval_Status === null)).sort((a, b) => {
      //   const dateA = a.Due_Date ? new Date(a.Due_Date).getTime() : 0;
      //   const dateB = b.Due_Date ? new Date(b.Due_Date).getTime() : 0;
      //   return dateB - dateA;
      // });
      console.log(completedDeliverables.value);
    } else {
      upcomingDeliverables.value = [];
      completedDeliverables.value = [];
      pendingDeliverables.value = [];
      Toastify({
        text: "No deliverables found for this block.",
        duration: 3000, // 3 seconds
        gravity: "top", // "top" or "bottom"
        position: "right", // "left", "center", or "right"
        backgroundColor: "#ed5e5e",
      }).showToast()
    }
  } catch (err) {
    error.value = err.message;
    console.error("Error fetching data:", error);
  } finally {
    loading.value = false;
  }
};

const editedIndex = ref(-1)
const defaultItem: Case = {
  Case_Number: '',
  Subject: '',
  Status: '',
  Account_Name: ''
}
const editedItem = ref<Case>({ ...defaultItem })

const formTitle = computed(() => (editedIndex.value === -1 ? 'New Case' : 'Edit Case'))

// Watchers for dialog and dialogDelete
watch(dialog, (val) => {
  if (!val) close()
})
watch(dialogDelete, (val) => {
  if (!val) closeDelete()
})

// Method to edit an item
const editItem = (item: Case) => {
  editedIndex.value = items.value.indexOf(item)
  editedItem.value = { ...item }
  dialog.value = true
}

// Method to delete an item
const deleteItem = (item: Case) => {
  editedIndex.value = items.value.indexOf(item)
  editedItem.value = { ...item }
  dialogDelete.value = true
}

// Confirm deletion of an item
const deleteItemConfirm = () => {
  items.value.splice(editedIndex.value, 1)
  closeDelete()
}

// Method to close the form dialog
const close = () => {
  dialog.value = false
  editedItem.value = { ...defaultItem }
  editedIndex.value = -1
}

// Method to close the delete confirmation dialog
const closeDelete = () => {
  dialogDelete.value = false
  editedItem.value = { ...defaultItem }
  editedIndex.value = -1
}

// Method to save the edited or new item
const save = () => {
  if (editedIndex.value > -1) {
    Object.assign(items.value[editedIndex.value], editedItem.value)
  } else {
    items.value.push({ ...editedItem.value })
  }
  close()
}

const showRejectModal = ref(false);
const rejectReason = ref("");
const selectedDeliverableId = ref<number | null>(null);

const approveDialog = ref(false);
const approvalNote = ref("");

// Called when user clicks Approve button
function openApproveModal(id: number) {
  selectedDeliverableId.value = id;
  approvalNote.value = "";
  approveDialog.value = true;
}

function closeApprove() {
  approveDialog.value = false;
}

async function confirmApprove() {
  if (!selectedDeliverableId.value) return;
  loading.value = true;
  try {
    var deliverable = pendingDeliverables.value.find(d => d.id === selectedDeliverableId.value?.toString());
    await fetch(API_BASE_URL+`/Zoho/zoho/deliverables/${selectedDeliverableId.value}/Approved`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        message: approvalNote.value, 
        name: deliverable?.Name,
        company: deliverable?.Account.name
      }),
    });
    // On success, close modal
    approveDialog.value = false;
    await fetchDeliverables();
    Toastify({
      text: "Deliverable approved successfully!",
      duration: 3000, // 3 seconds
      gravity: "top", // "top" or "bottom"
      position: "right", // "left", "center", or "right"
      backgroundColor: "#13c56b",
      close: true,
      stopOnFocus: true,
    }).showToast()
  } catch (error) {
    console.error("Approval failed", error);
    Toastify({
      text: "Failed to approve deliverable.",
      duration: 3000, // 3 seconds
      gravity: "top", // "top" or "bottom"
      position: "right", // "left", "center", or "right"
      backgroundColor: "#ed5e5e",
      close: true,
      stopOnFocus: true,
    }).showToast()
  } finally {
    loading.value = false;
  }
}

const openRejectModal = (id: number) => {
  selectedDeliverableId.value = id;
  rejectReason.value = "";
  showRejectModal.value = true;
};

const closeRejectModal = () => {
  showRejectModal.value = false;
  rejectReason.value = "";
  selectedDeliverableId.value = null;
};

const submitRejection = async () => {
  if (!rejectReason.value.trim()) {
    Toastify({
      text: "Please provide a reason for rejection.",
      duration: 3000, // 3 seconds
      gravity: "top", // "top" or "bottom"
      position: "right", // "left", "center", or "right"
      backgroundColor: "#ed5e5e",
      close: true,
      stopOnFocus: true,
    }).showToast()
    return;
  }

  if (!selectedDeliverableId.value) return;
  loading.value = true;
  try {
    var deliverable = pendingDeliverables.value.find(d => d.id === selectedDeliverableId.value?.toString());
    await fetch(API_BASE_URL+`/Zoho/zoho/deliverables/${selectedDeliverableId.value}/Rejected`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        message: rejectReason.value, 
        name: deliverable?.Name,
        company: deliverable?.Account.name
      }),
    });
    // On success, close modal
    showRejectModal.value = false;
    await fetchDeliverables();
    Toastify({
      text: "Deliverable status updated successfully!",
      duration: 3000, // 3 seconds
      gravity: "top", // "top" or "bottom"
      position: "right", // "left", "center", or "right"
      backgroundColor: "#13c56b",
      close: true,
      stopOnFocus: true,
    }).showToast()
  } catch (error) {
    console.error("Approval failed", error);
    Toastify({
      text: "Failed to update the deliverable rejection.",
      duration: 3000, // 3 seconds
      gravity: "top", // "top" or "bottom"
      position: "right", // "left", "center", or "right"
      backgroundColor: "#ed5e5e",
      close: true,
      stopOnFocus: true,
    }).showToast()
  } finally {
    loading.value = false;
  }
};

</script>

<style scoped>
.v-btn {
  min-width: 80px;
}

.topicWidth {
  width: 150px;
}

.blockWidth {
  white-space: nowrap;
}

.custom-data-table th:nth-child(0),
.custom-data-table td:nth-child(0) {
  width: 150px;
  text-align: center;
  white-space: nowrap;
}

.nav-tabs .nav-link.active {
  background-color: #198fd9;
  border-color: #198fd9;
  color: #ffffff;
}

.nav-tabs .nav-link {
  color: #198fd9;
}
</style>
