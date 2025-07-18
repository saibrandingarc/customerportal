
<template>
  <nav-bar />
  <SidebarMenu />
  <div v-if="loading" class="spinner-overlay d-flex justify-content-center align-items-center">
    <div class="spinner-border text-primary" role="status">
      <span class="visually-hidden">Loading...</span>
    </div>
  </div>
  <div class="main-content">
    <div class="page-content">
      <div class="container-fluid">
        <div class="card">
          <div class="card-header">
            <ul class="nav nav-tabs justify-content-start" id="caseTabs" role="tablist">
              <li class="nav-item" role="presentation">
                <button class="nav-link" :class="{ active: model === 'tab-1' }" @click="model = 'tab-1'">
                  Case Details
                </button>
              </li>
              <li class="nav-item" role="presentation">
                <button class="nav-link" :class="{ active: model === 'tab-2' }" @click="model = 'tab-2'">
                  Time Lines
                </button>
              </li>
            </ul>
          </div>

          <div class="tab-content p-3">
            <!-- Case Details -->
            <div class="tab-pane fade" :class="{ show: model === 'tab-1', active: model === 'tab-1' }">
              <div class="card-body">
                <div class="mb-2"><strong>ID:</strong> {{ item?.Case_Number }}</div>
                <div class="mb-2"><strong>Name:</strong> {{ item?.Subject }}</div>
                <div class="mb-2"><strong>Description:</strong> {{ item?.Description }}</div>
              </div>
            </div>

            <!-- Time Lines -->
            <div class="tab-pane fade" :class="{ show: model === 'tab-2', active: model === 'tab-2' }">
              <div v-if="emailNotes && emailNotes.length" class="list-group">
                <div
                  v-for="(comment, index) in emailNotes"
                  :key="index"
                  class="list-group-item"
                >
                  <div class="fw-bold">
                    {{ comment.Comment_Type }} -
                    <small class="text-muted">{{ formatDate(comment.Created_Time) }}</small>
                  </div>
                  <p class="mb-0">{{ comment.Comments }}</p>
                </div>
              </div>
              <div v-else class="text-muted px-2">No notes available</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <!-- <v-card>
    <v-toolbar>
      <v-tabs v-model="model" align-tabs="center" active-class="selected-tab" color="deep-purple-accent-4">
        <v-tab text="Case Details" value="tab-1"></v-tab>
        <v-tab text="Time Lines" value="tab-2"></v-tab>
      </v-tabs>
    </v-toolbar>

    <v-tabs-window v-model="model">
      <v-tabs-window-item value="tab-1">
        <v-card>
          <v-card-text>
            <div class="ma-2 pa-2">
              <p><strong>ID:</strong> {{ Case_Number }}</p>
              <p><strong>Name:</strong> {{ item?.Subject }}</p>
              <p><strong>Description:</strong> {{ item?.Description }}</p>
            </div>
          </v-card-text>
        </v-card>
      </v-tabs-window-item>

      <v-tabs-window-item value="tab-2">
        <v-card>
          <div class="ma-2 pa-2">
            <v-list v-if="emailNotes && emailNotes.length">
              <v-list-item v-for="(comment, index) in emailNotes" :key="index" class="my-1">
                <v-list-item-content>
                  <v-card>
                    <v-card-title>
                      <span class="text-h6">
                        {{ comment.Comment_Type }} - 
                        <span class="v-card-subtitle" style="display: inline;">
                          {{ formatDate(comment.Created_Time) }}
                        </span>
                      </span>
                    </v-card-title>
                    <v-card-text>
                      {{ comment.Comments }}
                    </v-card-text>
                  </v-card>
                </v-list-item-content>
              </v-list-item>
            </v-list>
            <v-list v-else>
              <v-list-item-title>
                No notes available
              </v-list-item-title>
            </v-list>
          </div>
        </v-card>
      </v-tabs-window-item>
      <v-tabs-window-item value="tab-3">
        <v-card>
          <v-card-text>{{ text }}</v-card-text>
        </v-card>
      </v-tabs-window-item>
    </v-tabs-window>
  </v-card> -->
</template>

<script lang="ts" setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import NavBar from "../components/NavBar.vue";
import SidebarMenu from '@/components/SidebarMenu.vue';
import { useAuthStore } from '@/stores/userStore';

const model = ref('tab-1');

const router = useRouter();
const authStore = useAuthStore();
const text = ref("Hello, I'm a snackbar");
const snackbar = ref<boolean>(false);

import { useRoute } from 'vue-router';

const route = useRoute();
const Case_Number = route.params.Case_Number as string;

// Mock data fetching
const item = ref<{ name: string; description: string } | null>(null);

onMounted(() => {
  fetchCase(Case_Number);
});

interface Account {
  id: string;
  name: string | null;
}

interface ParentId {
  name: string;
  id: string;
}

interface LayoutId {
  name: string;
  id: string;
}

interface EmailNote {
  Modified_Time: string;
  Comment_Type: string;
  $in_merge: boolean;
  $field_states: any | null;
  Created_Time: string;
  Comments: string;
  Parent_Id: ParentId;
  id: string;
  $layout_id: LayoutId;
  $zia_visions: any | null;
  Comment_Date: string;
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

const heading = ref("Cases");
const emailNotes = ref<EmailNote[]>([]);
const isChecked = ref(false);
const isDisabled = ref(false)
const loading = ref(false);
const error = ref('');
const items = ref<Case[]>([]);
const fetchCase = async (caseNumber: string) => {
  loading.value = true;
    try {
      console.log(authStore);
      var companyId = authStore.getCompanyId();
      const response = await axios.get('https://zohodeliverablesapi.azurewebsites.net/Zoho/zoho/case/'+companyId+'/'+caseNumber);
      console.log(response);
      error.value = '';
      item.value = response.data.data[0];
      emailNotes.value = response.data.data[0].Email_Notes1?.reverse() || [];
      console.log(emailNotes.value);
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

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString();
};

</script>
<style scoped>
/* Style for the selected tab */
.selected-tab {
  color: #ffffff !important;
  background-color: #4caf50 !important; /* Example: green background */
  border-radius: 4px;
}
</style>