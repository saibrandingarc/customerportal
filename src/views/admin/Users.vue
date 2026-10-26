<template>
  <div class="main-content">
    <div class="page-content">
      <div class="container-fluid">
    <!-- Loading Spinner -->
    <div v-if="loading" class="spinner-overlay">
            <div class="spinner"></div>
        </div>
    <v-card>
      <div class="pa-1">
        <v-row>
          <v-col cols="12" sm="12">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h5 class="mb-0">{{ heading }}</h5>
          <button type="button" class="btn btn-primary" @click="dialog = true">New User</button>
        </div>
        <PortalDataTable :headers="headers" :items="items" :rows-per-page="10">
          <template #item-actions="item">
            <button type="button" class="btn btn-sm btn-primary me-2" @click="editItem(item)">Edit</button>
            <button type="button" class="btn btn-sm btn-danger" @click="deleteItem(item)">Delete</button>
          </template>
        </PortalDataTable>
        <v-dialog v-model="dialog" max-width="800px">
          <v-card>
            <v-card-title>
              <span class="text-h5">{{ formTitle }}</span>
            </v-card-title>
            <v-card-text>
              <v-row>
                <v-col cols="12" md="12" sm="12">
                  <v-text-field v-model="editedItem.email" clearable label="Email" variant="outlined"></v-text-field>
                </v-col>
                <v-col cols="12" md="12" sm="12">
                  <v-text-field v-model="editedItem.password" clearable label="Password" variant="outlined"></v-text-field>
                </v-col>
                <v-col cols="12" md="12" sm="12">
                  <v-select
                    v-model="editedItem.selectedAccount"
                    :items="companies"
                    item-title="Account_Name"
                    item-value="id"
                    label="Select Company"
                    return-object
                    variant="outlined"
                  ></v-select>
                </v-col>
              </v-row>
            </v-card-text>
            <v-card-actions class="mr-4">
              <v-btn class="text-none mb-4" color="blue-darken-1" variant="text" @click="close">Cancel</v-btn>
              <v-btn class="text-none mb-4" color="indigo-darken-3" size="large" variant="flat" @click="save">Save</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
        <v-dialog v-model="dialogDelete" max-width="500px">
          <v-card>
            <v-card-title class="text-h5">Are you sure you want to delete this item?</v-card-title>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue-darken-1" variant="text" @click="closeDelete">Cancel</v-btn>
              <v-btn color="blue-darken-1" variant="text" @click="deleteItemConfirm">OK</v-btn>
              <v-spacer></v-spacer>
            </v-card-actions>
          </v-card>
        </v-dialog>
          </v-col>
        </v-row>
      </div>
    </v-card>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch, onMounted } from 'vue';
import axios from 'axios';
import { useAuthStore } from '@/stores/userStore';
import type { User } from './interfaces/User';
import type { Companies } from './interfaces/Companies';
import { API_BASE_URL } from '@/api/config';
import PortalDataTable from '@/components/PortalDataTable.vue';
import type { Header } from 'vue3-easy-data-table';

const authStore = useAuthStore();

const heading = ref("Users")
const search = ref('');

const headers: Header[] = [
  { text: 'Email', value: 'email' },
  { text: 'Company Name', value: 'companyName' },
  { text: 'Status', value: 'auth0Status' },
  { text: 'Actions', value: 'actions', sortable: false },
];

const companies = ref<Companies[]>([]);

const dialog = ref(false)
const dialogDelete = ref(false)

onMounted(() => {
  fetchCompanies();
  fetchUsers();
});

const isChecked = ref(false);
const isDisabled = ref(false)
const loading = ref(false);
const error = ref('');
const items = ref<User[]>([]);
const fetchUsers = async () => {
  loading.value = true;
    try {
      console.log(authStore);
      var companyId = authStore.getCompanyId();
      const response = await axios.get(API_BASE_URL+'/auth0/users');
      console.log(response);
      error.value = '';
      items.value = response.data.value;
      console.log(items);
    } catch (err) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
};

const fetchCompanies = async () => {
  loading.value = true;
    try {
      console.log(authStore);
      var companyId = authStore.getCompanyId();
      const response = await axios.get(API_BASE_URL+'/Zoho/zoho/companies');
      console.log(response);
      error.value = '';
      companies.value = response.data.data;
    } catch (err) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
};

const editedIndex = ref(-1)
const defaultItem: User = {};
const editedItem = ref<User>({ ...defaultItem })

const formTitle = computed(() => (editedIndex.value === -1 ? 'New User' : 'Edit User'))

// Watchers for dialog and dialogDelete
watch(dialog, (val) => {
  if (!val) close()
})
watch(dialogDelete, (val) => {
  if (!val) closeDelete()
})

// Method to edit an item
const editItem = (item: User) => {
  editedIndex.value = items.value.indexOf(item)
  editedItem.value = { ...item }
  dialog.value = true
}

// Method to delete an item
const deleteItem = (item: User) => {
  editedIndex.value = items.value.indexOf(item)
  editedItem.value = { ...item }
  dialogDelete.value = true
}

// Confirm deletion of an item
const deleteItemConfirm = async () => {
  // items.value.splice(editedIndex.value, 1);
  try {
    const response = await axios.delete(API_BASE_URL+'/auth0/deleteUser', {
      data: editedItem.value });
    console.log(response);
    // responseMessage.value = `User with ID ${userId} deleted successfully`;
    // // Refresh the users list after deletion
    // await fetchUsers();
  } catch (error) {
    console.error('Error deleting user:', error);
    // responseMessage.value = 'Failed to delete user';
  }
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
  console.log(editedItem);

  const user: User = {
    id: 0,
    email: editedItem.value.email,
    password: editedItem.value.password,
    otp: '',
    zohoEmailStatus: false,
    otpStatus: false,
    auth0Status: false,
    auth0AccountId: '',
    companyName: editedItem.value.selectedAccount.Account_Name,
    companyId: editedItem.value.selectedAccount.id
  };
  console.log(user);
  loading.value = true;
  try {
    // const data = { key1: 'value1', key2: 'value2' };
    const response = await axios.post(API_BASE_URL+'/create-auth0-user', user);
    console.log('Form submitted:', response.data);
    error.value = '';
    editedItem.value.companyName = editedItem.value.selectedAccount.Account_Name;
    editedItem.value.auth0Status = true;
    fetchUsers();
    // items.value.push({ ...editedItem.value })
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
