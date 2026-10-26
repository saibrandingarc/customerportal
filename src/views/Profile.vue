<template>
  <div class="main-content">
    <div class="page-content">
      <div class="container-fluid">
        <div class="d-flex align-items-center mb-3">
          <h5 class="mb-0">Profile</h5>
        </div>

        <div class="card">
          <div class="card-body">
            <div class="profile-overview">
              <img
                v-if="photoUrl"
                :src="photoUrl"
                alt=""
                class="profile-photo"
              />
              <span v-else class="profile-photo profile-photo-fallback" aria-hidden="true">
                <i class="mdi mdi-account"></i>
              </span>
              <dl class="profile-facts">
                <div>
                  <dt>Name</dt>
                  <dd>{{ displayName }}</dd>
                </div>
                <div>
                  <dt>Email</dt>
                  <dd>{{ email }}</dd>
                </div>
                <div>
                  <dt>Company</dt>
                  <dd>{{ displayCompany }}</dd>
                </div>
                <div>
                  <dt>Role</dt>
                  <dd>{{ roleLabel }}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/userStore';
import { useCompanyInfo } from '@/composables/useCompanyInfo';

const authStore = useAuthStore();
const { companyName, accountImageUrl, loadCompanyInfo } = useCompanyInfo();

const user = computed(() => {
  const stored = authStore.authResponse as (typeof authStore.authResponse & {
    name?: string;
    nickname?: string;
    picture?: string;
    Email?: string;
    Username?: string;
  }) | null;
  return stored;
});

const displayName = computed(() => {
  const current = user.value;
  return (
    current?.username ||
    current?.Username ||
    current?.name ||
    current?.nickname ||
    'Guest'
  );
});

const email = computed(() => user.value?.email || user.value?.Email || '—');

const displayCompany = computed(() => {
  if (companyName.value && companyName.value !== '-') return companyName.value;
  return authStore.getCompanyName() || '—';
});

const roleLabel = computed(() => {
  const roles = authStore.getRoles().filter(Boolean);
  return roles.length ? roles.join(', ') : 'User';
});

const photoUrl = computed(() => user.value?.picture || accountImageUrl.value || '');

onMounted(() => {
  loadCompanyInfo();
});
</script>

<style scoped>
.profile-overview {
  display: flex;
  align-items: flex-start;
  gap: 20px;
}

.profile-photo {
  width: 72px;
  height: 72px;
  object-fit: contain;
  border-radius: 12px;
  background: #f3f6f9;
  flex: 0 0 auto;
}

.profile-photo-fallback {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #878a99;
  font-size: 36px;
}

.profile-facts {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px 32px;
  margin: 0;
  flex: 1;
}

.profile-facts dt {
  color: #878a99;
  font-size: 13px;
  font-weight: 500;
}

.profile-facts dd {
  margin: 2px 0 0;
  font-weight: 600;
}

@media (max-width: 720px) {
  .profile-overview {
    flex-direction: column;
  }

  .profile-facts {
    grid-template-columns: 1fr;
  }
}
</style>
