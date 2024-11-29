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
            item-key="id"
            :sort-by="[{ key: 'calories', order: 'asc' }]"
          >
            <template v-slot:top>
              <v-toolbar flat>
                <v-toolbar-title>{{ heading }}</v-toolbar-title>
                <v-divider class="mx-8" inset vertical></v-divider>
                <v-spacer></v-spacer>
                <v-dialog v-model="dialog" max-width="800px">
                  <v-card>
                    <v-card-title>
                      <span class="text-h5">{{ formTitle }}</span>
                    </v-card-title>

                    <v-card-text>
                      <v-container>
                        <v-row>
                          <v-col cols="12" md="12" sm="12">
                            <v-textarea v-model="editedItem.Subject" clearable label="Subject" variant="outlined"></v-textarea>
                          </v-col>
                          <v-col cols="12" md="12" sm="12">
                            <v-select
                              label="Status"
                              :items="['-None-', 'Email', 'Internal(Automated)', 'Internal(Manual)', 'Phone', 'Web']"
                              variant="outlined"
                              v-model="editedItem.Status"
                            ></v-select>
                          </v-col>
                        </v-row>
                      </v-container>
                    </v-card-text>

                    <v-card-actions>
                      <v-spacer></v-spacer>
                      <v-btn color="blue-darken-1" variant="text" @click="close">Cancel</v-btn>
                      <v-btn color="blue-darken-1" variant="text" @click="save">Save</v-btn>
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
import { Deliverable } from '@/interfaces/deliverables';
const authStore = useAuthStore();

interface Case {
  Case_Number: string;
  Subject: string;
  Status: string;
  Account_Name: string;
}

const heading = ref("Deliverables")
const search = ref('');

const headers = [
  { title: 'Topic', key: 'Name', class: "topicWidth" },
  { title: 'Content Type', key: 'Main_Status' },
  { title: 'Due Date', key: 'Due_Date' },
  { title: 'Status', key: 'Main_Status1' }
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
const fetchDeliverables = async () => {
  loading.value = true;
    try {
      console.log(authStore);
      var companyId = authStore.getCompanyId();
      const response = await axios.get('https://zohodeliverablesapi.azurewebsites.net/Zoho/zoho/deliverables/'+companyId);
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

</script>

<style scoped>
.v-btn {
  min-width: 80px;
}
.topicWidth {
  width: 150px;
}
</style>
