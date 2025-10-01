import { createRouter, createWebHistory } from 'vue-router';
import Login from '../views/Login.vue';
import Register from '../views/Register.vue';
import ForgotPassword from '../views/ForgotPassword.vue';
import { useAuth0 } from '@auth0/auth0-vue';
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

router.beforeEach((to, from, next) => {
  // const logintype = localStorage.getItem("loginType");
  // const isAuthenticated = ref(false);
  // if(logintype == "username-password") {
  //   const authStore = useAuthStore();
  //   isAuthenticated.value = authStore.isTokenValid();
  // }
  
  // const isAuthenticated = authStore.isTokenValid();
  const { isAuthenticated } = useAuth0();

  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!isAuthenticated.value) {
      // No token found, redirect to login page
      next({ name: 'Login' });
    } else {
        next();
    }
  } else {
    next(); // Always allow navigation if no authentication required
  }
});

export default router;
