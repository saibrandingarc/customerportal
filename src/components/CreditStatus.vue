<template>
  <section class="credit-status" aria-label="Credit Status">
    <h6 class="credit-status-title">Credit Status</h6>
    <div class="row g-3">
      <div class="col-12 col-md-4">
        <div class="credit-status-card credit-status-card-zero">
          <span class="credit-status-label">Credits in Plan</span>
          <span class="credit-status-value">{{ formatCredits(creditsInPlan) }}</span>
        </div>
      </div>
      <div class="col-12 col-md-4">
        <div class="credit-status-card">
          <span class="credit-status-label">Credits Used</span>
          <span class="credit-status-value">{{ formatCredits(creditsUsed) }}</span>
        </div>
      </div>
      <div class="col-12 col-md-4">
        <div class="credit-status-card" :class="availableCardClass">
          <span class="credit-status-label">Available Credits</span>
          <span class="credit-status-value">{{ formatCredits(availableCredits) }}</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script lang="ts" setup>
import { computed, watch } from 'vue';
import { formatCredits, useCreditStatus } from '@/composables/useCreditStatus';

const props = defineProps<{
  year?: number;
  colorByBalance?: boolean;
}>();

const { creditsInPlan, creditsUsed, availableCredits, loadCreditStatus } = useCreditStatus();

const availableCardClass = computed(() => {
  if (!props.colorByBalance) return 'credit-status-card-zero';
  const value = availableCredits.value;
  if (value == null || value === 0) return 'credit-status-card-zero';
  if (value < 0) return 'credit-status-card-negative';
  return 'credit-status-card-positive';
});

watch(
  () => props.year ?? new Date().getFullYear(),
  (year) => {
    void loadCreditStatus(year);
  },
  { immediate: true }
);
</script>

<style scoped>
.credit-status-title {
  margin: 0 0 0.75rem;
  color: #212529;
  font-size: 0.95rem;
  font-weight: 600;
}

.credit-status-card {
  height: 100%;
  padding: 14px 16px;
  border: 1px solid #e9ebec;
  border-radius: 8px;
  background: #f3f6f9;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.credit-status-card-zero {
  background: #e8f4fc;
  border-color: #c5e4f6;
}

.credit-status-card-positive {
  background: #e8f8ef;
  border-color: #b7e4c7;
}

.credit-status-card-negative {
  background: #fdecea;
  border-color: #f5c2c0;
}

.credit-status-label {
  color: #495057;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}

.credit-status-value {
  color: #212529;
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1.2;
}
</style>
