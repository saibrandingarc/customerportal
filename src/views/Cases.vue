<template>
  <nav-bar />
  <v-container fluid class="down-top-padding">
    <v-card>
      <div class="pa-5">
        <v-row>
          <v-col cols="12" sm="12">
            <v-data-table
              :headers="headers"
              :items="items"
              item-key="id"
              :sort-by="[{ key: 'calories', order: 'asc' }]"
            >
              <template v-slot:top>
                <v-toolbar flat>
                  <v-toolbar-title>{{ heading }}</v-toolbar-title>
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
              <template v-slot:item.actions="{ item }">
                <v-btn-group variant="outlined" divided>
                  <v-btn icon="mdi-pencil" @click="editItem(item)"></v-btn>
                  <v-btn icon="mdi-delete" @click="deleteItem(item)"></v-btn>
                </v-btn-group>
                <!-- <v-icon class="me-2" color="red" size="large" @click="editItem(item)">mdi-pencil</v-icon>
                <v-icon size="large" color="red" @click="deleteItem(item)">mdi-delete</v-icon> -->
              </template>
              <template v-slot:no-data>
                <v-btn
                  color="primary"
                  @click="initialize"
                >
                  Reset
                </v-btn>
              </template>
            </v-data-table>
            <!-- <v-data-table
                :headers="headers"
                :items="items"
                item-key="id"
                :search="search"
              >
                <template v-slot:[`item.actions`]="{ item }">
                  <v-btn icon="$edit" @click="editItem(item)" class="mr-5"></v-btn>
                  <v-btn icon="$delete" @click="deleteItem(item)" class="mr-5"></v-btn>
                </template>
              </v-data-table> -->
          </v-col>
        </v-row>
      </div>
    </v-card>
  </v-container>
</template>

<script lang="ts" setup>
import { ref, computed, watch, onMounted } from 'vue';
import axios from 'axios';
import NavBar from "../components/NavBar.vue";
import { useAuthStore } from '@/stores/userStore';

const authStore = useAuthStore();

interface Account {
  id: string;
}

interface Case {
  Account_Name: Account;
  Status: string;
  Email: string;
  Description: string;
  Internal_Comments: string;
  Priority: string;
  Reported_By: string;
  Case_Origin: string;
  Case_Reason: string;
  Subject: string;
  Type: string;
  Phone: string;
}

const heading = ref("Cases")
const search = ref('');

const headers = [
  { title: 'Case Number', key: 'Case_Number' },
  { title: 'Company Name', key: 'Account_Name.name' },
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
const fetchCases = async () => {
  loading.value = true;
    try {
      console.log(authStore);
      var companyId = authStore.getCompanyId();
      const response = await axios.get('https://zohodeliverablesapi.azurewebsites.net/Zoho/zoho/cases/'+companyId);
      console.log(response);
      error.value = '';
      items.value = response.data.data;
    } catch (err) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
};

const editedIndex = ref(-1)
const defaultItem: Case = {
  Account_Name: { id: "" },
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
const save = async () => {
  console.log(editedItem);
  var user = authStore.authResponse;
  console.log(user);
  var companyId = authStore.getCompanyId();

  editedItem.value.Account_Name.id = companyId;
  editedItem.value.Email = user.Email;
  loading.value = true;
  try {
    // const data = { key1: 'value1', key2: 'value2' };
    const response = await axios.post('https://zohodeliverablesapi.azurewebsites.net/Zoho/zoho/newcase', editedItem.value);
    console.log('Form submitted:', response.data);
    error.value = '';
    items.value = response.data.data;
    if (editedIndex.value > -1) {
      Object.assign(items.value[editedIndex.value], editedItem.value)
    } else {
      items.value.push({ ...editedItem.value })
    }
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
