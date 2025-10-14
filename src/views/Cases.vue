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
            <h5 class="mb-0">Open Cases</h5>
            <button class="btn btn-primary" @click="dialog = true">New Case</button>
          </div>
          <div class="card-body">
            <input v-model="searchOpen" class="form-control mb-3" placeholder="Search..." />
            <EasyDataTable
                :headers="headers"
                :items="openitems"
                :rows-per-page="10"
                table-class="table-bordered"
                show-index
                :searchable="true"
              >
              <template #item-Operation="{ id, Case_Number }">
                <button class="btn btn-sm btn-primary me-2" @click="viewItem(id)">View</button>
                <button class="btn btn-sm btn-warning me-2" @click="editItem(id)">Edit</button>
                <button class="btn btn-sm btn-danger" @click="deleteItem(id)">Delete</button>
              </template>
            </EasyDataTable>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h5 class="mb-0">Closed Cases</h5>
          </div>
          <div class="card-body">
            <div class="alert alert-success" v-if="snackbar">{{ text }}</div>
            <input v-model="searchClosed" class="form-control mb-3" placeholder="Search..." />
            <EasyDataTable
                :headers="headers"
                :items="closeditems"
                :rows-per-page="10"
                table-class="table-bordered"
                show-index
                :searchable="true"
                buttons-pagination
              >
              <template #item-Operation="{ id, Case_Number }">
                <button class="btn btn-sm btn-primary me-2" @click="viewItem(id)">View</button>
              </template>
            </EasyDataTable>
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
          <div class="mb-3">
            <label class="form-label">Subject</label>
            <input type="text" class="form-control" v-model="editedItem.Subject" />
          </div>
          <div class="mb-3">
            <label class="form-label">Description</label>
            <textarea class="form-control" v-model="editedItem.Description"></textarea>
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

const headers: Header[] = [
  { text: 'Case Number', value: 'Case_Number' },
  // { title: 'Company Name', key: 'Account_Name.name' },
  { text: 'Subject', value: 'Subject' },
  { text: 'Close Date', value: 'Case_Closed_Date' },
  { text: 'Open Date', value: 'Case_Open_Date' },
  { text: 'Type', value: 'Type' },
  { text: 'Reason', value: 'Case_Reason' },
  { text: 'Status', value: 'Status' },
  { text: 'View Details', value: 'Operation', sortable: false }
];

const dialog = ref(false)
const dialogDelete = ref(false)

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
        const dateA = a.Due_Date ? new Date(a.Due_Date).getTime() : 0;
        const dateB = b.Due_Date ? new Date(b.Due_Date).getTime() : 0;
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
const save = async () => {
  text.value = "Case added";
  snackbar.value = true;
    
  console.log(editedItem);
  var user = authStore.authResponse;
  console.log(user);
  var companyId = authStore.getCompanyId();

  editedItem.value.Account_Name.id = companyId;
  editedItem.value.Email = user?.Email;
  loading.value = true;
  try {
    // const data = { key1: 'value1', key2: 'value2' };
    const response = await axios.post(API_BASE_URL+'/Zoho/zoho/newcase', editedItem.value);
    console.log('Form submitted:', response.data);
    editedItem.value.Account_Name.name = authStore.getCompanyName();
    editedItem.value.Case_Number = response.data.data[0].details.id;
    editedItem.value.Status = "New";
    error.value = '';
    items.value.push({ ...editedItem.value })
    snackbar.value = true;
    text.value = "Case added";
    fetchCases();
    close()
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
}

</script>

<style scoped>
.v-btn {
  min-width: 80px;
}
</style>
