import { onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/userStore';
import { useAuth0 } from '@auth0/auth0-vue';
import axios from 'axios';
import { API_BASE_URL } from '@/api/config';

// set time for logout
function resolveIdleMs(): number {
  const fromMs = Number(import.meta.env.VITE_SESSION_IDLE_MS);
  if (!Number.isNaN(fromMs) && fromMs > 0) return fromMs;
  const fromMinutes = Number(import.meta.env.VITE_SESSION_IDLE_MINUTES);
  if (!Number.isNaN(fromMinutes) && fromMinutes > 0) return fromMinutes * 60 * 1000;
  return 60 * 60 * 1000;
}

const ACTIVITY_EVENTS = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'] as const;

/**
 * Logs the user out after a period with no pointer/keyboard/scroll activity
 * while the main app layout is mounted.
 */
export function useSessionIdleTimeout() {
  const router = useRouter();
  const authStore = useAuthStore();
  const { logout } = useAuth0();

  const idleMs = resolveIdleMs();
  let idleTimer: ReturnType<typeof setTimeout> | null = null;
  let throttleHandle: ReturnType<typeof setTimeout> | null = null;

  const recordLogoutActivity = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('user') || 'null');
      const email = userData?.email;
      if (!email) return;

      await axios.post(`${API_BASE_URL}/Zoho/zoho/logout`, { email });
    } catch {
      /* do not block auto logout if API call fails */
    }
  };

  const performLogout = () => {
    if (idleTimer) {
      clearTimeout(idleTimer);
      idleTimer = null;
    }

    void (async () => {
      await recordLogoutActivity();
      authStore.logout();
      await logout({
        logoutParams: { returnTo: `${window.location.origin}/login` },
      }).catch(() => {
        /* username-password users may not have an Auth0 session */
      });
      await router.push({ name: 'Login' });
    })();
  };

  const scheduleIdle = () => {
    if (idleTimer) clearTimeout(idleTimer);
    idleTimer = setTimeout(performLogout, idleMs);
  };

  const onActivity = () => {
    if (throttleHandle) return;
    throttleHandle = setTimeout(() => {
      throttleHandle = null;
      scheduleIdle();
    }, 1000);
  };

  onMounted(() => {
    scheduleIdle();
    for (const ev of ACTIVITY_EVENTS) {
      window.addEventListener(ev, onActivity, { passive: true });
    }
  });

  onUnmounted(() => {
    for (const ev of ACTIVITY_EVENTS) {
      window.removeEventListener(ev, onActivity);
    }
    if (throttleHandle) clearTimeout(throttleHandle);
    if (idleTimer) clearTimeout(idleTimer);
  });
}
