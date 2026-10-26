<template>
  <div class="main-content">
    <div class="page-content">
      <div class="container-fluid">
        <div class="d-flex align-items-center mb-3">
          <h5 class="mb-0">Company Profile</h5>
        </div>

        <div class="card">
          <div class="card-header">
            <h5 class="mb-0">Account</h5>
          </div>
          <div class="card-body">
            <p class="section-intro">Overview of account information</p>
            <p v-if="companyLoading && !hasCompanyData" class="text-muted mb-3">Loading account information...</p>
            <p v-else-if="companyError && !hasCompanyData" class="text-danger mb-3">{{ companyError }}</p>
            <div class="account-overview">
              <img
                v-if="accountImageUrl"
                :src="accountImageUrl"
                alt=""
                class="account-logo"
              />
              <dl class="account-facts">
                <div>
                  <dt>Company Name</dt>
                  <dd>{{ displayCompanyName }}</dd>
                </div>
                <div>
                  <dt>Products Engaged</dt>
                  <dd>{{ productsEngaged }}</dd>
                </div>
                <div>
                  <dt>Credits</dt>
                  <dd>{{ mdCredits }}</dd>
                </div>
                <div>
                  <dt>Website Status</dt>
                  <dd>{{ websiteStatusLabel }}</dd>
                </div>
              </dl>
            </div>
            <div class="row g-3 mt-1">
              <div class="col-12 col-md-6">
                <div
                  class="summary-card"
                  role="link"
                  tabindex="0"
                  @click="goToInvoices"
                  @keydown.enter="goToInvoices"
                >
                  <h4>Outstanding Balance</h4>
                  <p>{{ formattedOutstandingBalance }}</p>
                </div>
              </div>
              <div class="col-12 col-md-6">
                <div
                  class="summary-card"
                  role="link"
                  tabindex="0"
                  @click="goToInvoices"
                  @keydown.enter="goToInvoices"
                >
                  <h4>Past Due</h4>
                  <p>{{ formattedPastDue }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h5 class="mb-0">Manage Communication Preferences</h5>
          </div>
          <div class="card-body">
            <p class="section-intro">Choose which emails you want to receive.</p>
            <ul class="preference-list">
              <template v-for="item in preferences" :key="item.id">
                <li>
                  <label :for="item.id">{{ item.label }}</label>
                  <div class="form-check form-switch">
                    <input
                      :id="item.id"
                      v-model="item.enabled"
                      class="form-check-input"
                      type="checkbox"
                      role="switch"
                      @change="savePreferences"
                    />
                  </div>
                </li>
                <li v-if="item.id === 'project-client-approval'" class="contacts-row">
                  <div class="contacts-block">
                    <h6 class="contacts-heading">Contacts</h6>
                    <p v-if="contactsLoading" class="text-muted mb-0">Loading contacts...</p>
                    <p v-else-if="contactsError" class="text-danger mb-0">{{ contactsError }}</p>
                    <p v-else-if="contacts.length === 0" class="text-muted mb-0">No contacts found.</p>
                    <div v-else class="table-responsive">
                      <table class="table contacts-table mb-0">
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Title</th>
                            <th>Email</th>
                            <th>Phone</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-for="contact in contacts" :key="contact.id">
                            <td>{{ contact.name }}</td>
                            <td>{{ contact.title }}</td>
                            <td>
                              <a v-if="contact.email !== '-'" :href="`mailto:${contact.email}`">{{ contact.email }}</a>
                              <span v-else>-</span>
                            </td>
                            <td>{{ contact.phone }}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </li>
              </template>
            </ul>
            <p v-if="saved" class="preference-saved" role="status">Preferences saved.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { API_BASE_URL } from '@/api/config';
import { useAuthStore } from '@/stores/userStore';
import { useCompanyInfo } from '@/composables/useCompanyInfo';
import { useWebsiteStatus } from '@/composables/useWebsiteStatus';

interface Preference {
  id: string;
  label: string;
  enabled: boolean;
}

interface CompanyContact {
  id: string;
  name: string;
  title: string;
  email: string;
  phone: string;
}

const DEFAULTS: Preference[] = [
  { id: 'project-client-approval', label: 'Project Client Approval Notifications', enabled: true },
  { id: 'invoice-billing', label: 'Invoice/Billing Notifications', enabled: true },
  { id: 'website-reports', label: 'Website Reports and Analytics', enabled: true },
];

const router = useRouter();
const authStore = useAuthStore();
const {
  loading: companyLoading,
  error: companyError,
  hasData: hasCompanyData,
  companyName,
  productsEngaged,
  mdCredits,
  accountImageUrl,
  loadCompanyInfo,
} = useCompanyInfo();
const { websiteStatus, isWebsiteLive, loadWebsiteStatus } = useWebsiteStatus();

const invoicesLoading = ref(false);
const contactsLoading = ref(false);
const contactsError = ref('');
const contacts = ref<CompanyContact[]>([]);
const outstandingBalance = ref(0);
const pastDue = ref(0);
const preferences = ref<Preference[]>(DEFAULTS.map((item) => ({ ...item })));
const saved = ref(false);

const displayCompanyName = computed(() => {
  if (companyName.value && companyName.value !== '-') return companyName.value;
  return authStore.getCompanyName() || '-';
});

const websiteStatusLabel = computed(() => {
  if (isWebsiteLive.value) return 'Live';
  const status = websiteStatus.value.trim();
  return status || '-';
});

const money = (amount: number) =>
  amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

const formattedOutstandingBalance = computed(() => money(outstandingBalance.value));
const formattedPastDue = computed(() => money(pastDue.value));

const storageKey = () => {
  const user = authStore.authResponse;
  const owner = user?.email || user?.username || user?.userId || 'guest';
  return `communication-preferences:${owner}`;
};

const loadPreferences = () => {
  try {
    const raw = localStorage.getItem(storageKey());
    if (!raw) return;
    const stored = JSON.parse(raw) as Record<string, boolean>;
    preferences.value = DEFAULTS.map((item) => ({
      ...item,
      enabled: typeof stored[item.id] === 'boolean' ? stored[item.id] : item.enabled,
    }));
  } catch {
    preferences.value = DEFAULTS.map((item) => ({ ...item }));
  }
};

const savePreferences = () => {
  const stored = Object.fromEntries(preferences.value.map((item) => [item.id, item.enabled]));
  localStorage.setItem(storageKey(), JSON.stringify(stored));
  saved.value = true;
};

const displayValue = (value: unknown) => {
  if (value === null || value === undefined || value === '') return '-';
  return String(value);
};

const contactName = (record: Record<string, unknown>) => {
  const fullName = displayValue(record.Full_Name);
  if (fullName !== '-') return fullName;
  const parts = [record.First_Name, record.Last_Name]
    .map((part) => displayValue(part))
    .filter((part) => part !== '-');
  return parts.length ? parts.join(' ') : '-';
};

const fetchContacts = async () => {
  contactsLoading.value = true;
  contactsError.value = '';
  try {
    const companyId = authStore.getCompanyId();
    if (!companyId) {
      contacts.value = [];
      contactsError.value = 'Unable to load contacts. Company is not available.';
      return;
    }

    const response = await axios.get(`${API_BASE_URL}/Zoho/zoho/contacts/${companyId}`);
    const payload = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
    const rows = Array.isArray(payload?.data) ? payload.data : [];
    contacts.value = rows.map((record: Record<string, unknown>, index: number) => ({
      id: displayValue(record.id) !== '-' ? String(record.id) : `contact-${index}`,
      name: contactName(record),
      title: displayValue(record.Title),
      email: displayValue(record.Email),
      phone: displayValue(record.Phone) !== '-' ? displayValue(record.Phone) : displayValue(record.Mobile),
    }));
  } catch (err) {
    console.error('Error fetching company contacts:', err);
    contacts.value = [];
    contactsError.value = 'Unable to load contacts.';
  } finally {
    contactsLoading.value = false;
  }
};

const fetchInvoices = async () => {
  invoicesLoading.value = true;
  try {
    const parsedData = JSON.parse(localStorage.getItem('user') || '{}') as { companyName?: string };
    const company = parsedData.companyName;
    if (!company) {
      outstandingBalance.value = 0;
      pastDue.value = 0;
      return;
    }

    const response = await axios.get(`${API_BASE_URL}/Intuit/invoices/${company}`);
    const invoices = response?.data?.QueryResponse?.Invoice ?? [];
    const today = new Date();
    let outstandingTotal = 0;
    let pastDueTotal = 0;

    invoices.forEach((item: { DueDate?: string; Balance?: number }) => {
      const balance = Number(item.Balance || 0);
      if (balance <= 0) return;
      outstandingTotal += balance;
      if (item.DueDate && new Date(item.DueDate) < today) {
        pastDueTotal += balance;
      }
    });

    outstandingBalance.value = outstandingTotal;
    pastDue.value = pastDueTotal;
  } catch (err) {
    console.error('Error fetching invoices:', err);
    outstandingBalance.value = 0;
    pastDue.value = 0;
  } finally {
    invoicesLoading.value = false;
  }
};

const goToInvoices = () => {
  router.push('/invoices');
};

onMounted(() => {
  loadPreferences();
  loadCompanyInfo();
  loadWebsiteStatus();
  fetchContacts();
  fetchInvoices();
});
</script>

<style scoped>
.section-intro {
  margin: 0 0 16px;
  color: #495057;
}

.account-overview {
  display: flex;
  align-items: flex-start;
  gap: 20px;
}

.account-logo {
  width: 72px;
  height: 72px;
  object-fit: contain;
  border: 1px solid #e9ebec;
  border-radius: 8px;
  background: #fff;
}

.account-facts {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px 24px;
  margin: 0;
  flex: 1;
}

.account-facts div {
  min-width: 0;
}

.account-facts dt {
  margin: 0 0 4px;
  color: #495057;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.account-facts dd {
  margin: 0;
  color: #212529;
  font-weight: 600;
}

.summary-card {
  height: 100%;
  padding: 16px 18px;
  border: 1px solid #e9ebec;
  border-radius: 8px;
  background: #f3f6f9;
  cursor: pointer;
}

.contacts-block {
  padding: 4px 0 8px;
}

.contacts-heading {
  margin: 0 0 12px;
  color: #212529;
  font-weight: 600;
}

.contacts-table th {
  color: #495057;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.contacts-table td {
  color: #212529;
  vertical-align: middle;
}

.summary-card h4 {
  margin: 0 0 8px;
  color: #495057;
  font-size: 14px;
}

.summary-card p {
  margin: 0;
  color: #212529;
  font-size: 28px;
  font-weight: 700;
}

.preference-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.preference-list li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 0;
  border-top: 1px solid #e9ebec;
}

.preference-list li.contacts-row {
  display: block;
  padding-top: 0;
}

.preference-list label {
  margin: 0;
  color: #212529;
  font-weight: 600;
  cursor: pointer;
}

.preference-list .form-switch {
  margin: 0;
  padding-left: 2.5em;
  min-height: 0;
}

.preference-list .form-check-input {
  cursor: pointer;
}

.preference-saved {
  margin: 12px 0 0;
  color: #1b8a3e;
  font-weight: 600;
}

@media (max-width: 767.98px) {
  .account-overview {
    flex-direction: column;
  }

  .account-facts {
    grid-template-columns: 1fr;
  }
}
</style>
