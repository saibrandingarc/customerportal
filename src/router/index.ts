import { createRouter, createWebHistory } from 'vue-router';
import Login from '../views/Login.vue';
import Register from '../views/Register.vue';
import ForgotPassword from '../views/ForgotPassword.vue';
import { jwtDecode } from 'jwt-decode';
import EndUserAgreementVue from '@/views/EndUserAgreement.vue';
import PrivacyPolicyVue from '@/views/PrivacyPolicy.vue';
import DefaultLayout from '../layouts/DefaultLayout.vue';

const routes = [
  // Auth pages (separated from main layout)
  {
    path: '/login',
    name: 'Login',
    component: Login,
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
  },
  {
    path: '/forgot_password',
    name: 'ForgotPassword',
    component: ForgotPassword,
  },

  // Public pages (no auth required, can be inside or outside layout)
  {
    path: '/enduser',
    name: 'EndUser',
    component: EndUserAgreementVue,
  },
  {
    path: '/privacypolicy',
    name: 'PrivacyPolicy',
    component: PrivacyPolicyVue,
  },

  // Main app (requires layout + auth)
  {
    path: '/',
    name: 'Home',
    component: DefaultLayout,
    redirect: '/dashboard',
    children: [
      {
        path: '/dashboard',
        name: 'Dashboard',
        component: () => import('../views/Dashboard.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: '/cases',
        name: 'Cases',
        component: () => import('../views/Cases.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: '/deliverables',
        name: 'Deliverables',
        component: () => import('../views/Deliverables.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: '/invoices',
        name: 'Invoices',
        component: () => import('../views/Invoices.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: '/admin/users',
        name: 'Users',
        component: () => import('../views/admin/Users.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: '/case/:Case_Number',
        name: 'Case',
        component: () => import('@/views/Case.vue'),
        props: true,
        meta: { requiresAuth: true },
      },
      {
        path: '/profile',
        name: 'Profile',
        component: () => import('../views/Profile.vue'),
        meta: { requiresAuth: true },
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// JWT token structure
interface JwtPayload {
  exp: number;
}

// Function to check if the token is expired
function isTokenExpired(token: string): boolean {
  try {
    const decodedToken: JwtPayload = jwtDecode(token);
    const currentTime = Math.floor(Date.now() / 1000);
    return decodedToken.exp < currentTime;
  } catch (error) {
    console.error('Invalid token:', error);
    return true; // Treat invalid token as expired
  }
}

function hasValidUsernamePasswordSession(): boolean {
  const loginType = localStorage.getItem('loginType');
  if (loginType !== 'username-password') return false;

  const rawUser = localStorage.getItem('user');
  if (!rawUser) return false;

  try {
    const user = JSON.parse(rawUser) as { expiresIn?: string };
    if (!user?.expiresIn) return false;

    const expiration = new Date(user.expiresIn).getTime();
    if (Number.isNaN(expiration)) return false;

    return Date.now() < expiration;
  } catch (error) {
    console.error('Invalid local user session:', error);
    return false;
  }
}

function hasValidSocialSession(): boolean {
  const loginType = localStorage.getItem('loginType');
  if (!loginType || loginType === 'username-password') return false;

  const rawUser = localStorage.getItem('user');
  if (!rawUser) return false;

  try {
    const user = JSON.parse(rawUser) as { access_token?: string };
    if (!user?.access_token) return false;
    return !isTokenExpired(user.access_token);
  } catch (error) {
    console.error('Invalid social session:', error);
    return false;
  }
}

router.beforeEach((to) => {
  if (!to.matched.some((record) => record.meta.requiresAuth)) {
    return true;
  }

  const localSessionValid =
    hasValidUsernamePasswordSession() || hasValidSocialSession();

  if (localSessionValid) {
    return true;
  }

  return { name: 'Login' };
});

export default router;
