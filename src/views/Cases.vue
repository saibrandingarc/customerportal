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
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0">Cases</h5>
            <div class="d-flex gap-2">
              <button
                class="btn btn-outline-secondary"
                @click="fetchCases"
                :disabled="loading"
              >
                {{ loading ? 'Refreshing...' : 'Refresh' }}
              </button>
              <button class="btn btn-primary" @click="dialog = true">New Case</button>
            </div>
          </div>
          <div class="card-body">
            <ul class="nav nav-tabs nav-justified cases-tabs mb-3">
              <li class="nav-item">
                <button
                  class="nav-link"
                  :class="{ active: activeCasesTab === 'open' }"
                  type="button"
                  @click="activeCasesTab = 'open'"
                >
                  Open
                </button>
              </li>
              <li class="nav-item">
                <button
                  class="nav-link"
                  :class="{ active: activeCasesTab === 'closed' }"
                  type="button"
                  @click="activeCasesTab = 'closed'"
                >
                  Closed
                </button>
              </li>
            </ul>

            <div class="tab-content">
              <div class="tab-pane fade" :class="{ 'show active': activeCasesTab === 'open' }">
                <input v-model="searchOpen" class="form-control mb-3" placeholder="Search..." />
                <div class="d-none d-md-block">
                  <EasyDataTable
                    :headers="headers"
                    :items="openitems"
                    :rows-per-page="10"
                    table-class="table-bordered"
                    show-index
                    :searchable="true"
                  >
                    <template #item-Operation="{ id }">
                      <button class="btn btn-sm btn-primary me-2" @click="viewItem(id)">View</button>
                      <button class="btn btn-sm btn-warning me-2" @click="editItem(id)">Edit</button>
                      <button class="btn btn-sm btn-danger" @click="deleteItem(id)">Delete</button>
                    </template>
                  </EasyDataTable>
                </div>

                <!-- Mobile card view -->
                <div class="d-md-none case-cards">
                  <p v-if="!filteredOpenItems.length" class="text-muted text-center py-3 mb-0">
                    No Available Data
                  </p>
                  <div v-for="(row, i) in filteredOpenItems" :key="row.id ?? i" class="case-card">
                    <div class="dc-row">
                      <span class="dc-label">Case Number</span>
                      <span class="dc-value fw-semibold">{{ row.Case_Number }}</span>
                    </div>
                    <div class="dc-row">
                      <span class="dc-label">Subject</span>
                      <span class="dc-value">{{ row.Subject }}</span>
                    </div>
                    <div class="dc-row">
                      <span class="dc-label">Status</span>
                      <span class="dc-value">{{ row.Status }}</span>
                    </div>
                    <div class="dc-row">
                      <span class="dc-label">Open Date</span>
                      <span class="dc-value">{{ row.Case_Open_Date }}</span>
                    </div>
                    <div class="dc-row">
                      <span class="dc-label">Type</span>
                      <span class="dc-value">{{ row.Type }}</span>
                    </div>
                    <div class="dc-row">
                      <span class="dc-label">Reason</span>
                      <span class="dc-value">{{ row.Case_Reason }}</span>
                    </div>
                    <div class="dc-actions">
                      <button class="btn btn-sm btn-primary" @click="viewItem(row.id)">View</button>
                    </div>
                  </div>
                </div>
              </div>

              <div class="tab-pane fade" :class="{ 'show active': activeCasesTab === 'closed' }">
                <div class="alert alert-success" v-if="snackbar">{{ text }}</div>
                <input v-model="searchClosed" class="form-control mb-3" placeholder="Search..." />
                <div class="d-none d-md-block">
                  <EasyDataTable
                    :headers="closedheaders"
                    :items="closeditems"
                    :rows-per-page="10"
                    table-class="table-bordered"
                    show-index
                    :searchable="true"
                    buttons-pagination
                    sort-by="Case_Closed_Date"
                    sort-type="desc"
                  >
                    <template #item-Operation="{ id }">
                      <button class="btn btn-sm btn-primary me-2" @click="viewItem(id)">View</button>
                    </template>
                  </EasyDataTable>
                </div>

                <!-- Mobile card view -->
                <div class="d-md-none case-cards">
                  <p v-if="!filteredClosedItems.length" class="text-muted text-center py-3 mb-0">
                    No Available Data
                  </p>
                  <div v-for="(row, i) in filteredClosedItems" :key="row.id ?? i" class="case-card">
                    <div class="dc-row">
                      <span class="dc-label">Case Number</span>
                      <span class="dc-value fw-semibold">{{ row.Case_Number }}</span>
                    </div>
                    <div class="dc-row">
                      <span class="dc-label">Subject</span>
                      <span class="dc-value">{{ row.Subject }}</span>
                    </div>
                    <div class="dc-row">
                      <span class="dc-label">Open Date</span>
                      <span class="dc-value">{{ row.Case_Open_Date }}</span>
                    </div>
                    <div class="dc-row">
                      <span class="dc-label">Close Date</span>
                      <span class="dc-value">{{ row.Case_Closed_Date }}</span>
                    </div>
                    <div class="dc-row">
                      <span class="dc-label">Type</span>
                      <span class="dc-value">{{ row.Type }}</span>
                    </div>
                    <div class="dc-row">
                      <span class="dc-label">Reason</span>
                      <span class="dc-value">{{ row.Case_Reason }}</span>
                    </div>
                    <div class="dc-actions">
                      <button class="btn btn-sm btn-primary" @click="viewItem(row.id)">View</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-if="dialog" class="modal show d-block" tabindex="-1">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">{{ formTitle }}</h5>
          <button type="button" class="btn-close" @click="close"></button>
        </div>
        <div class="modal-body">
          <div v-if="error" class="alert alert-danger py-2">{{ error }}</div>
          <div class="mb-3">
            <label class="form-label">Subject</label>
            <input type="text" class="form-control" v-model="editedItem.Subject" />
          </div>
          <div class="mb-3">
            <label class="form-label">Description</label>
            <textarea class="form-control" v-model="editedItem.Description"></textarea>
          </div>
          <div v-if="editedIndex === -1" class="mb-3">
            <label class="form-label">Attachments</label>
            <input
              ref="attachmentInput"
              type="file"
              class="form-control"
              multiple
              accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.gif,.txt,.zip"
              @change="onAttachmentsSelected"
            />
            <div class="form-text text-muted">
              Optional. Up to 5 files, 25 MB each (PDF, Office, images, text, or ZIP).
            </div>
            <ul v-if="caseAttachments.length" class="list-unstyled small mt-2 mb-0">
              <li
                v-for="(file, index) in caseAttachments"
                :key="`${file.name}-${file.size}-${index}`"
                class="d-flex justify-content-between align-items-center border rounded px-2 py-1 mb-1"
              >
                <span>{{ file.name }} ({{ formatFileSize(file.size) }})</span>
                <button
                  type="button"
                  class="btn btn-sm btn-link text-danger p-0"
                  @click="removeAttachment(index)"
                >
                  Remove
                </button>
              </li>
            </ul>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="close">Cancel</button>
          <button type="button" class="btn btn-primary" @click="save">Save</button>
        </div>
      </div>
    </div>
  </div>

  <!-- Delete Confirmation Modal -->
  <div v-if="dialogDelete" class="modal show d-block" tabindex="-1">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Confirm Deletion</h5>
        </div>
        <div class="modal-body">
          <p>Are you sure you want to delete this item?</p>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="closeDelete">Cancel</button>
          <button type="button" class="btn btn-danger" @click="deleteItemConfirm">OK</button>
        </div>
      </div>
    </div>
  </div>
</template>


<script lang="ts" setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import NavBar from "../components/NavBar.vue";
import SidebarMenu from '@/components/SidebarMenu.vue';
import { useAuthStore } from '@/stores/userStore';
import { Header } from 'vue3-easy-data-table';
import { API_BASE_URL } from '@/api/config';

const router = useRouter();
const authStore = useAuthStore();
const text = ref("Hello, I'm a snackbar");
const snackbar = ref<boolean>(false);
const activeCasesTab = ref<'open' | 'closed'>('open');

interface Account {
  id: string;
  name: string | null;
}

interface Case {
  id: string | null;
  Case_Number: string | null;
  Account_Name: Account | null;
  Status: string | null;
  Email: string | null;
  Description: string | null;
  Internal_Comments: string | null;
  Priority: string | null;
  Reported_By: string | null;
  Case_Origin: string | null;
  Case_Reason: string | null;
  Subject: string | null;
  Type: string | null;
  Phone: string | null;
}

const heading = ref("Cases")
const search = ref('');
const searchOpen = ref('');
const searchClosed = ref('');

const headers: Header[] = [
  { text: 'Case Number', value: 'Case_Number' },
  // { title: 'Company Name', key: 'Account_Name.name' },
  { text: 'Subject', value: 'Subject' },
  { text: 'Status', value: 'Status' },
  // { text: 'Close Date', value: 'Case_Closed_Date' },
  { text: 'Open Date', value: 'Case_Open_Date' },
  { text: 'Type', value: 'Type' },
  { text: 'Reason', value: 'Case_Reason' },
  
  // { text: 'View Details', value: 'Operation', sortable: false }
];

const closedheaders: Header[] = [
  { text: 'Case Number', value: 'Case_Number' },
  // { title: 'Company Name', key: 'Account_Name.name' },
  { text: 'Subject', value: 'Subject' },
  // { text: 'Status', value: 'Status' },
  { text: 'Open Date', value: 'Case_Open_Date' },
  { text: 'Close Date', value: 'Case_Closed_Date' },
  { text: 'Type', value: 'Type' },
  { text: 'Reason', value: 'Case_Reason' },
  
  // { text: 'View Details', value: 'Operation', sortable: false }
];

const dialog = ref(false)
const dialogDelete = ref(false)
const attachmentInput = ref<HTMLInputElement | null>(null)
const caseAttachments = ref<File[]>([])

const MAX_ATTACHMENTS = 5
const MAX_ATTACHMENT_BYTES = 25 * 1024 * 1024

onMounted(() => {
  console.log("API Base URL : "+API_BASE_URL);
  fetchCases();
});

const isChecked = ref(false);
const isDisabled = ref(false)
const loading = ref(false);
const error = ref('');
const items = ref<Case[]>([]);
const openitems = ref<Case[]>([]);
const closeditems = ref<Case[]>([]);

const filterCases = (list: Case[], term: string): any[] => {
  const q = term.trim().toLowerCase();
  if (!q) return list as any[];
  return (list as any[]).filter((c) =>
    [c.Case_Number, c.Subject, c.Status, c.Type, c.Case_Reason].some((v) =>
      String(v ?? '').toLowerCase().includes(q)
    )
  );
};
const filteredOpenItems = computed<any[]>(() => filterCases(openitems.value, searchOpen.value));
const filteredClosedItems = computed<any[]>(() => filterCases(closeditems.value, searchClosed.value));
const fetchCases = async () => {
  loading.value = true;
    try {
      console.log(authStore);
      var companyId = authStore.getCompanyId();
      const response = await axios.get(API_BASE_URL+'/Zoho/zoho/cases/'+companyId);
      console.log(response);
      error.value = '';
      items.value = response.data.data;
      openitems.value = response.data.data.filter((c: { Status: string; }) => c.Status === 'New')
      .sort((a, b) => {
        const dateA = a.Created_Time ? new Date(a.Created_Time).getTime() : 0;
        const dateB = b.Created_Time ? new Date(b.Created_Time).getTime() : 0;
        return dateB - dateA; // Descending
      });
      console.log(openitems.value);
      closeditems.value = response.data.data.filter((c: { Status: string; }) => c.Status === 'Closed');
      console.log(closeditems);
    } catch (err) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
};

const editedIndex = ref(-1)
const defaultItem: Case = {
  id:"0",
  Case_Number: "",
  Account_Name: { id: "", name: "" },
  Status: "",
  Email: "",
  Description: "",
  Internal_Comments: "",
  Priority: "",
  Reported_By: "",
  Case_Origin: "",
  Case_Reason: "",
  Subject: "",
  Type: "",
  Phone: ""
};
const editedItem = ref<Case>({ ...defaultItem })
const viewItem = (id: string) => {
  console.log(id);
  router.push({ name: 'case', params: { Case_Number: id } });
};
const formTitle = computed(() => (editedIndex.value === -1 ? 'New Case' : 'Edit Case'))

// Watchers for dialog and dialogDelete
watch(dialog, (val) => {
  if (!val) close()
})
watch(dialogDelete, (val) => {
  if (!val) closeDelete()
})

// Method to edit an item
const editItem = (id: string) => {
  // editedIndex.value = items.value.indexOf(item)
  // editedItem.value = { ...item }
  dialog.value = true
}

// Method to delete an item
const deleteItem = (id: string) => {
  // editedIndex.value = items.value.indexOf(item)
  // editedItem.value = { ...item }
  dialogDelete.value = true
  console.log("deleted");
}

// Confirm deletion of an item
const deleteItemConfirm = async () => {
  // items.value.splice(editedIndex.value, 1)
  console.log(editedItem);
  var user = authStore.authResponse;
  console.log(user);
  loading.value = true;
  const id = editedItem.value?.id;
  try {
    // const data = { key1: 'value1', key2: 'value2' };
    const response = await axios.delete(API_BASE_URL+'/Zoho/zoho/deleteCase/'+id);
    console.log('Form submitted:', response.data);
    items.value.splice(editedIndex.value, 1)
    close()
    snackbar.value = true;
    text.value = "Case deleted";
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
  console.log(editedItem.value);
  closeDelete()
}

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const resetAttachments = () => {
  caseAttachments.value = []
  if (attachmentInput.value) {
    attachmentInput.value.value = ''
  }
}

const onAttachmentsSelected = (event: Event) => {
  const input = event.target as HTMLInputElement
  const selected = input.files ? Array.from(input.files) : []
  if (!selected.length) return

  const combined = [...caseAttachments.value, ...selected]
  if (combined.length > MAX_ATTACHMENTS) {
    error.value = `You can attach up to ${MAX_ATTACHMENTS} files.`
    input.value = ''
    return
  }

  const oversized = combined.find((file) => file.size > MAX_ATTACHMENT_BYTES)
  if (oversized) {
    error.value = `${oversized.name} exceeds the 25 MB limit.`
    input.value = ''
    return
  }

  error.value = ''
  caseAttachments.value = combined
  input.value = ''
}

const removeAttachment = (index: number) => {
  caseAttachments.value.splice(index, 1)
}

// Method to close the form dialog
const close = () => {
  dialog.value = false
  editedItem.value = { ...defaultItem }
  editedIndex.value = -1
  resetAttachments()
}

// Method to close the delete confirmation dialog
const closeDelete = () => {
  dialogDelete.value = false
  editedItem.value = { ...defaultItem }
  editedIndex.value = -1
}

// Method to save the edited or new item
const save = async () => {
  if (!editedItem.value.Subject?.trim()) {
    error.value = 'Subject is required.'
    return
  }

  const user = authStore.authResponse
  const companyId = authStore.getCompanyId()

  editedItem.value.Account_Name = editedItem.value.Account_Name ?? { id: '', name: '' }
  editedItem.value.Account_Name.id = companyId
  editedItem.value.Email = user?.Email

  loading.value = true
  error.value = ''

  try {
    const payload = { ...editedItem.value }
    const formData = new FormData()
    formData.append('caseData', JSON.stringify(payload))
    caseAttachments.value.forEach((file) => {
      formData.append('attachments', file)
    })

    const response = await axios.post(
      `${API_BASE_URL}/Zoho/zoho/newcase`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    )

    console.log('Form submitted:', response.data)
    editedItem.value.Account_Name.name = authStore.getCompanyName()
    editedItem.value.Case_Number = response.data.data[0].details.id
    editedItem.value.Status = 'New'
    items.value.push({ ...editedItem.value })
    snackbar.value = true
    text.value = caseAttachments.value.length
      ? 'Case added with attachments'
      : 'Case added'
    await fetchCases()
    close()
  } catch (err: unknown) {
    const message =
      axios.isAxiosError(err) && err.response?.data?.message
        ? String(err.response.data.message)
        : err instanceof Error
          ? err.message
          : 'Failed to create case.'
    error.value = message
  } finally {
    loading.value = false
  }
}

</script>

<style scoped>
.v-btn {
  min-width: 80px;
}

.cases-tabs {
  border-bottom: 1px solid #dee2e6;
}

.cases-tabs .nav-item {
  margin-bottom: -1px;
}

.cases-tabs .nav-link {
  color: #198fd9;
  text-align: center;
  padding: 0.5rem 0.75rem;
  border: 1px solid transparent;
  border-top-left-radius: 0.375rem;
  border-top-right-radius: 0.375rem;
  white-space: nowrap;
}

.cases-tabs .nav-link:hover {
  background-color: rgba(25, 143, 217, 0.08);
}

.cases-tabs .nav-link.active {
  background-color: #198fd9;
  border-color: #198fd9;
  color: #ffffff;
}

/* Mobile card view for tables */
.case-card {
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
