import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import Login from '../views/Login.vue';
import Register from '../views/Register.vue';
import ForgotPassword from '../views/ForgotPassword.vue';
import { useAuth0 } from '@auth0/auth0-vue';
import { jwtDecode } from 'jwt-decode';
import { useAuthStore } from '@/stores/userStore';
import { ref } from 'vue';

const routes = [
  // { path: "/callback", name: 'Callback', component: Callback },
  {
    path: '/',
    name: 'Home',
    component: Login,
    meta: { requiresAuth: true },
  },
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
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/Profile.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/cases',
    name: 'cases',
    component: () => import('../views/Cases.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/deliverables',
    name: 'deliverables',
    component: () => import('../views/Deliverables.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/invoices',
    name: 'invoices',
    component: () => import('../views/Invoices.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/admin/users',
    name: 'users',
    component: () => import('../views/admin/Users.vue'),
    meta: { requiresAuth: true },
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
