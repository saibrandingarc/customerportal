
<template>
  <nav-bar />
  <SidebarMenu />
  <!-- Loading Spinner -->
  <div v-if="loading" class="spinner-overlay">
    <div class="spinner"></div>
  </div>
  <ul class="nav nav-tabs">
  <li class="nav-item">
    <a class="nav-link active" aria-current="page" href="#">Active</a>
  </li>
  <li class="nav-item">
    <a class="nav-link" href="#">Link</a>
  </li>
  <li class="nav-item">
    <a class="nav-link" href="#">Link</a>
  </li>
  <li class="nav-item">
    <a class="nav-link disabled" aria-disabled="true">Disabled</a>
  </li>
</ul>
  <v-card>
    <v-toolbar>
      <v-tabs v-model="model" align-tabs="center" active-class="selected-tab" color="deep-purple-accent-4">
        <v-tab text="Case Details" value="tab-1"></v-tab>
        <v-tab text="Time Lines" value="tab-2"></v-tab>
        <!-- <v-tab text="Item 3" value="tab-3"></v-tab> -->
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
          <v-list v-if="item?.Email_Notes1">
            <v-list-item v-for="(comment, index) in item?.Email_Notes1?.reverse()" :key="index" class="my-1">
              <v-list-item-content>
                <v-card>
                  <v-card-title>
                    <span class="text-h6">{{ comment.Comment_Type }} - <span class="v-card-subtitle" style="display: inline;">{{ formatDate(comment.Created_Time) }}</span></span>
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
  </v-card>      
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