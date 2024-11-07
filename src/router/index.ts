import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import Login from '../views/Login.vue';
import Register from '../views/Register.vue';
import ForgotPassword from '../views/ForgotPassword.vue';
import { useAuth0 } from '@auth0/auth0-vue';
import { jwtDecode } from 'jwt-decode';
import { useAuthStore } from '@/stores/userStore';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
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
  const authStore = useAuthStore();
  const isAuthenticated = authStore.isTokenValid();

  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (to.meta.requiresAuth && !isAuthenticated) {
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
