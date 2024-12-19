
<template>
  <nav-bar />
  <SidebarMenu />
  <!-- Loading Spinner -->
  <div v-if="loading" class="spinner-overlay">
    <div class="spinner"></div>
  </div>
  <v-row>
    <v-col cols="12" sm="4">
      <v-card>
        <template v-slot:title>
          <span class="font-weight-black">Case Details</span>
        </template>
        <div class="ma-2 pa-2">
          <p><strong>ID:</strong> {{ Case_Number }}</p>
          <p><strong>Name:</strong> {{ item?.Subject }}</p>
          <p><strong>Description:</strong> {{ item?.Description }}</p>
        </div>
      </v-card>
    </v-col>
    <v-col cols="8">
      <v-card>
        <template v-slot:title>
          <span class="font-weight-black">Time Lines</span>
        </template>
        <div class="ma-2 pa-2">
          <div class="mb-2"><b>Admin :</b> {{ item?.Description }}</div>
          <div class="mb-2"><b>Customer :</b> {{ item?.Description }}</div>
        </div>
      </v-card>
      
    </v-col>
  </v-row>
      
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

</script>