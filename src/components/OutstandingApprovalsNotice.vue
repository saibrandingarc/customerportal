<template>
  <router-link
    v-if="hasOverdueApprovals"
    to="/deliverables"
    class="approval-alert"
    :class="levelClass"
  >
    <strong>Outstanding Approvals</strong>
    <span>{{ message }}</span>
    <span class="approval-alert-action">Review deliverables</span>
  </router-link>

  <div v-if="popupOpen" class="approval-popup-backdrop" @click.self="dismissPopup">
    <button type="button" class="approval-popup" :class="levelClass" @click="openDeliverables">
      <strong>Outstanding Approvals</strong>
      <span>{{ message }}</span>
      <span class="approval-popup-action">Review deliverables</span>
    </button>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useAuthStore } from '@/stores/userStore';
import {
  dismissOutstandingApprovalsNotice,
  shouldShowOutstandingApprovalsNotice,
  useOutstandingApprovals,
} from '@/composables/useOutstandingApprovals';

const router = useRouter();
const authStore = useAuthStore();
const { isLoggedIn } = storeToRefs(authStore);
const { overdueCount, approvalLevel, hasOverdueApprovals, loadOutstandingApprovals } = useOutstandingApprovals();
const popupOpen = ref(false);

const waitingDays = computed(() => {
  if (approvalLevel.value === 'red') return 45;
  if (approvalLevel.value === 'orange') return 30;
  return 7;
});

const levelClass = computed(() => `approval-alert--${approvalLevel.value}`);

const message = computed(() => {
  const count = overdueCount.value;
  const noun = count === 1 ? 'deliverable has' : 'deliverables have';
  return `${count} ${noun} been waiting for your approval for more than ${waitingDays.value} days.`;
});

const openPopup = () => {
  if (!isLoggedIn.value || !hasOverdueApprovals.value || !shouldShowOutstandingApprovalsNotice()) {
    return;
  }
  popupOpen.value = true;
};

watch([hasOverdueApprovals, approvalLevel], openPopup);

onMounted(async () => {
  if (!isLoggedIn.value) return;
  await loadOutstandingApprovals();
  openPopup();
});

const dismissPopup = () => {
  dismissOutstandingApprovalsNotice();
  popupOpen.value = false;
};

const openDeliverables = async () => {
  dismissPopup();
  await router.push('/deliverables');
};
</script>

<style scoped>
.approval-alert,
.approval-popup {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  color: #212529;
  text-align: left;
}

.approval-alert {
  margin-bottom: 16px;
  padding: 14px 16px;
  border: 1px solid #e9ebec;
  border-radius: 8px;
  background: #fff;
  text-decoration: none;
}

.approval-popup-backdrop {
  position: fixed;
  inset: 0;
  z-index: 3000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(33, 37, 41, 0.35);
}

.approval-popup {
  width: min(420px, 100%);
  padding: 20px;
  border: 1px solid #e9ebec;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(33, 37, 41, 0.12);
}

.approval-alert--orange,
.approval-popup.approval-alert--orange {
  border-color: #f0c48a;
  background: #fff7ed;
}

.approval-alert--orange strong,
.approval-popup.approval-alert--orange strong {
  color: #c56a00;
}

.approval-alert--red,
.approval-popup.approval-alert--red {
  border-color: #f3c2c2;
  background: #fff5f5;
}

.approval-alert--red strong,
.approval-popup.approval-alert--red strong {
  color: #c43b3b;
}

.approval-alert strong,
.approval-popup strong {
  font-size: 16px;
}

.approval-popup strong {
  font-size: 18px;
}

.approval-alert span,
.approval-popup span {
  font-size: 14px;
  line-height: 1.45;
  color: #495057;
}

.approval-alert-action,
.approval-popup-action {
  color: #0192d0 !important;
  font-weight: 700;
}
</style>
