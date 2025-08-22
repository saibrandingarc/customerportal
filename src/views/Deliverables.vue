<template>
  <NavBar />
  <SidebarMenu />
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
            <div class="row mb-3">
              <!-- Select Year -->
              <div class="col-sm-4">
                <label for="yearSelect" class="form-label">Select Year</label>
                <select id="yearSelect" class="form-select w-50" v-model="selectedBlock" @change="fetchDataForBlock">
                  <option v-for="(month, index) in monthsArray" :key="index" :value="month">
                    {{ month }}
                  </option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-body">
            <!-- Upcoming Deliverables Table -->
            <div class="table-responsive">
              <div class="d-flex align-items-center mb-3">
                <h5 class="me-3 mb-0">Pending Approval Deliverables</h5>
                <div class="flex-grow-1 border-start mx-3" style="height: 24px;"></div>
              </div>
              <EasyDataTable
                :headers="pendingheaders"
                :items="pendingDeliverables"
                :rows-per-page="5"
                table-class="table-bordered"
                show-index
                :searchable="true"
                buttons-pagination
              >
                <template #item-actions="{ id }">
                  <button class="btn btn-success btn-sm me-2" @click="approveDeliverable(id)">
                    Approve
                  </button>
                  <button class="btn btn-danger btn-sm" @click="rejectDeliverable(id)">
                    Reject
                  </button>
                </template>
              </EasyDataTable>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-body">
            <!-- Upcoming Deliverables Table -->
            <div class="table-responsive">
              <div class="d-flex align-items-center mb-3">
                <h5 class="me-3 mb-0">Upcoming Deliverables</h5>
                <div class="flex-grow-1 border-start mx-3" style="height: 24px;"></div>
                <button class="btn btn-primary" @click="dialog = true">Add New</button>
              </div>
              <EasyDataTable
                :headers="headers"
                :items="upcomingDeliverables"
                :rows-per-page="5"
                table-class="table-bordered"
                show-index
                :searchable="true"
                buttons-pagination
              />
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
                <button class="btn btn-secondary" @click="close">Cancel</button>
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

        <!-- Completed Deliverables -->
        <div class="card">
          <div class="card-body">
            <h5 class="mb-3">Completed Deliverables</h5>
            <div class="table-responsive">
              <EasyDataTable
                :headers="completedheaders"
                :items="completedDeliverables"
                :rows-per-page="5"
                table-class="table-bordered"
                show-index
                buttons-pagination
              />
            </div>
          </div>
        </div>
      </div>
    </div>
    <Footer />
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch, onMounted } from 'vue';
import axios from 'axios';
import NavBar from "../components/NavBar.vue";
import SidebarMenu from '@/components/SidebarMenu.vue';
import { useAuthStore } from '@/stores/userStore';
import { Deliverable } from '@/interfaces/deliverables';
import { Header } from 'vue3-easy-data-table';

const authStore = useAuthStore();

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
const monthsArray = ref<string[]>(["2025", "2024"]);

const selectedBlock = ref<string | null>(null);

const heading = ref("Deliverables")
const search = ref('');

const headers: Header[] = [
      // { text: "Block", value: "Block" },
      { text: "Due Date", value: "Due_Date", sortable: true },
      { text: "Status", value: "Status", sortable: true },
      { text: "Content Type", value: "Main_Content_Type", sortable: true },
      { text: "Topic", value: "Name", sortable: true },
      // { text: "Credit Cost", value: "Credit_Cost", sortable: true }
    ];

const pendingheaders: Header[] = [
  { text: "Due Date", value: "Due_Date", sortable: true },
  { text: "Status", value: "Status", sortable: true },
  { text: "Content Type", value: "Main_Content_Type", sortable: true },
  { text: "Topic", value: "Name", sortable: true },
  { text: "Content Document", value: "Content_Doc", sortable: true },
  { text: "Actions", value: "actions" }
];

const completedheaders = [
  { text: 'Block', value: 'Block' },
  { text: 'Date Published', value: 'Date_Published' },
  { text: 'Content Type', value: 'Main_Content_Type' },
  { text: 'Topic', value: 'Name', class: "topicWidth" },
  // { text: 'Credit Cost', value: 'Credit_Cost' }
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
const upcomingDeliverables = ref<Case[]>([]);
const completedDeliverables = ref<Case[]>([]);
const pendingDeliverables = ref<Case[]>([]);
const fetchDeliverables = async () => {
  loading.value = true;
  try {
    console.log(authStore);
    var companyId = authStore.getCompanyId();
    const response = await axios.get('https://zohodeliverablesapi.azurewebsites.net/Zoho/zoho/deliverables/' + companyId);
    console.log(response);
    error.value = '';
    items.value = response.data.data;
    upcomingDeliverables.value = response.data.data.filter((c: { Main_Status: string; }) => c.Main_Status !== 'Completed' && c.Main_Status !== 'Cancelled').sort((a, b) => {
      const dateA = a.Due_Date ? new Date(a.Due_Date).getTime() : 0;
      const dateB = b.Due_Date ? new Date(b.Due_Date).getTime() : 0;
      return dateB - dateA;
    });
    completedDeliverables.value = response.data.data.filter((c: { Main_Status: string; }) => c.Main_Status === 'Completed').sort((a, b) => {
      const dateA = a.Due_Date ? new Date(a.Due_Date).getTime() : 0;
      const dateB = b.Due_Date ? new Date(b.Due_Date).getTime() : 0;
      return dateB - dateA;
    });
    pendingDeliverables.value = response.data.data.filter((c: { Main_Status: string; }) => c.Main_Status === 'Client Approval - Final').sort((a, b) => {
      const dateA = a.Due_Date ? new Date(a.Due_Date).getTime() : 0;
      const dateB = b.Due_Date ? new Date(b.Due_Date).getTime() : 0;
      return dateB - dateA;
    });
    console.log("test :"+completedDeliverables);
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

// Function to call the API when a month is selected
const fetchDataForBlock = async () => {
  if (!selectedBlock.value) return;

  try {
    var companyId = authStore.getCompanyId();
    const response = await axios.get('https://zohodeliverablesapi.azurewebsites.net/Zoho/zoho/deliverables/' + companyId + '/' + selectedBlock.value);
    console.log(response);
    error.value = '';
    items.value = response.data.data;
    upcomingDeliverables.value = response.data.data.filter((c: { Main_Status1: string; }) => c.Main_Status1 != 'Completed').sort((a, b) => {
      const dateA = a.Due_Date ? new Date(a.Due_Date).getTime() : 0;
      const dateB = b.Due_Date ? new Date(b.Due_Date).getTime() : 0;
      return dateB - dateA;
    });
    completedDeliverables.value = response.data.data.filter((c: { Main_Status1: string; }) => c.Main_Status1 === 'Completed').sort((a, b) => {
      const dateA = a.Due_Date ? new Date(a.Due_Date).getTime() : 0;
      const dateB = b.Due_Date ? new Date(b.Due_Date).getTime() : 0;
      return dateB - dateA;
    });
    console.log(completedDeliverables.value);
  } catch (err) {
    error.value = err.message;
    console.error("Error fetching data:", error);
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

const approveDeliverable = async (id: number) => {
  try {
    await axios.post(`/api/deliverables/${id}/approve`);
    pendingDeliverables.value = pendingDeliverables.value.filter(d => d.id !== id);
  } catch (err) {
    console.error("Approve failed", err);
  }
};

const rejectDeliverable = async (id: number) => {
  try {
    await axios.post(`/api/deliverables/${id}/reject`);
    pendingDeliverables.value = pendingDeliverables.value.filter(d => d.id !== id);
  } catch (err) {
    console.error("Reject failed", err);
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

.custom-data-table th:nth-child(0),
.custom-data-table td:nth-child(0) {
  width: 150px;
  text-align: center;
  white-space: nowrap;
}
</style>
