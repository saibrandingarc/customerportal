<template>
  <nav-bar />
  <SidebarMenu />
  <!-- Loading Spinner -->
  <div v-if="loading" class="spinner-overlay">
    <div class="spinner"></div>
  </div>
  <v-card>
    <v-row>
      <v-col cols="12" sm="12">
        <v-data-table :headers="headers" :items="openitems" item-key="id" :sort-by="[{ key: 'Case_Number', order: 'asc' }]">
          <template v-slot:top>
            <v-toolbar flat>
              <v-toolbar-title>Open Cases</v-toolbar-title>
              <v-divider class="mx-8" inset vertical></v-divider>
              <v-spacer></v-spacer>
              <v-dialog v-model="dialog" max-width="800px">
                <template v-slot:activator="{ props }">
                  <v-btn class="mb-2" color="primary" dark v-bind="props">New Case</v-btn>
                </template>
                <v-card>
                  <v-card-title>
                    <span class="text-h5">{{ formTitle }}</span>
                  </v-card-title>

                  <v-card-text>
                      <v-row>
                        <v-col cols="12" md="12" sm="12">
                          <v-text-field v-model="editedItem.Subject" clearable label="Subject" variant="outlined"></v-text-field>
                        </v-col>
                        <v-col cols="12" md="12" sm="12">
                          <v-textarea v-model="editedItem.Description" clearable label="Description" variant="outlined"></v-textarea>
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
            </v-toolbar>
          </template>
          <template #item.Case_Number="{ item }">
            {{ item.Case_Number ? item.Case_Number.slice(-8) : 'N/A' }}
          </template>
          <template v-slot:item.actions="{ item }">
            <v-btn-group variant="outlined" divided>
              <v-btn icon="mdi-eye" @click="viewItem(item)"></v-btn>
              <v-btn icon="mdi-pencil" @click="editItem(item)"></v-btn>
              <v-btn icon="mdi-delete" @click="deleteItem(item)"></v-btn>
            </v-btn-group>
          </template>
        </v-data-table>
      </v-col>
    </v-row>
  </v-card>
  <v-spacer></v-spacer>
  <v-card class="mt-4">
    <v-row>
      <v-col cols="12" sm="12">
        <v-data-table :headers="headers" :items="closeditems" item-key="id" :sort-by="[{ key: 'Case_Number', order: 'asc' }]">
          <template v-slot:top>
            <v-toolbar flat>
              <v-toolbar-title>Closed Cases</v-toolbar-title>
              <v-divider class="mx-8" inset vertical></v-divider>
              <v-spacer></v-spacer>
              <v-dialog v-model="dialog" max-width="800px">
                <v-card>
                  <v-card-title>
                    <span class="text-h5">{{ formTitle }}</span>
                  </v-card-title>

                  <v-card-text>
                      <v-row>
                        <v-col cols="12" md="12" sm="12">
                          <v-text-field v-model="editedItem.Subject" clearable label="Subject" variant="outlined"></v-text-field>
                        </v-col>
                        <v-col cols="12" md="12" sm="12">
                          <v-textarea v-model="editedItem.Description" clearable label="Description" variant="outlined"></v-textarea>
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
            </v-toolbar>
          </template>
          <template #item.Case_Number="{ item }">
            {{ item.Case_Number ? item.Case_Number.slice(-8) : 'N/A' }}
          </template>
          <template v-slot:item.actions="{ item }">
            <v-btn-group variant="outlined" divided>
              <v-btn icon="mdi-eye" @click="viewItem(item)"></v-btn>
              <!-- <v-btn icon="mdi-pencil" @click="editItem(item)"></v-btn>
              <v-btn icon="mdi-delete" @click="deleteItem(item)"></v-btn> -->
            </v-btn-group>
            <!-- <v-icon class="me-2" color="red" size="large" @click="editItem(item)">mdi-pencil</v-icon>
            <v-icon size="large" color="red" @click="deleteItem(item)">mdi-delete</v-icon> -->
          </template>
        </v-data-table>
        <v-snackbar v-model="snackbar" :timeout="3000">
          {{ text }}
        </v-snackbar>
      </v-col>
    </v-row>
  </v-card>
</template>

<script lang="ts" setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import NavBar from "../components/NavBar.vue";
import SidebarMenu from '@/components/SidebarMenu.vue';
import { useAuthStore } from '@/stores/userStore';

const router = useRouter();
const authStore = useAuthStore();
const text = ref("Hello, I'm a snackbar");
const snackbar = ref<boolean>(false);

interface Account {
  id: string;
  name: string | null;
}

interface Case {
  id: number | null;
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

const headers = [
  { title: 'Case Number', key: 'Case_Number' },
  // { title: 'Company Name', key: 'Account_Name.name' },
  { title: 'Subject', key: 'Subject' },
  { title: 'Status', key: 'Status' },
  { title: 'Actions', key: 'actions', sortable: false }
];

const dialog = ref(false)
const dialogDelete = ref(false)

onMounted(() => {
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
      const response = await axios.get('https://zohodeliverablesapi.azurewebsites.net/Zoho/zoho/cases/'+companyId);
      console.log(response);
      error.value = '';
      items.value = response.data.data;
      openitems.value = response.data.data.filter((c: { Status: string; }) => c.Status === 'New');
      closeditems.value = response.data.data.filter((c: { Status: string; }) => c.Status === 'Closed');
    } catch (err) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
};

const editedIndex = ref(-1)
const defaultItem: Case = {
  id:0,
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
const viewItem = (item: { id: string }) => {
  router.push({ name: 'case', params: { Case_Number: item.id } });
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
    const response = await axios.delete('https://zohodeliverablesapi.azurewebsites.net/Zoho/zoho/deleteCase/'+id);
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
    const response = await axios.post('https://zohodeliverablesapi.azurewebsites.net/Zoho/zoho/newcase', editedItem.value);
    console.log('Form submitted:', response.data);
    editedItem.value.Account_Name.name = authStore.getCompanyName();
    editedItem.value.Case_Number = response.data.data[0].details.id;
    editedItem.value.Status = "New";
    error.value = '';
    items.value.push({ ...editedItem.value })
    snackbar.value = true;
    text.value = "Case added";
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
