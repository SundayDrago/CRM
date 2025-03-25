import { createApp } from 'vue';
import App from './App.vue';
import { createRouter, createWebHistory } from 'vue-router';
import '@fortawesome/fontawesome-free/css/all.css';

// Import components for each route
import HomePage from './components/HomePage.vue';
import LoginPage from './components/LoginPage.vue';
import RegisterPage from './components/RegisterPage.vue';
import AdminPage from './components/admins/AdminPage.vue'; 
import VerifySecurityCode from './components/admins/VerifySecurityCode.vue';
import ForgotPasswordPage from './components/ForgotPasswordPage.vue';
import NotFoundPage from './components/NotFoundPage.vue'; 
import ResetPasswordPage from './components/ResetPasswordPage.vue';
import ActivityLogPage from './components/admins/ActivityLogPage.vue';
import SegmentPage from './components/admins/SegmentPage.vue';
import UsersPage from './components/admins/UsersPage.vue';
import AdvisoryPage from './components/admins/AdvisoryPage.vue';
import ContactPage from './components/ContactPage.vue';

// Define routes
const routes = [
    { path: '/', component: HomePage },
    { path: '/login', component: LoginPage },
    { path: '/register', component: RegisterPage },
    { path: '/admin', component: AdminPage, meta: { requiresAuth: true } },
    { path: '/verify', component: VerifySecurityCode },
    { path: '/forgot-password', component: ForgotPasswordPage },
    { path: '/reset-password/:token', component: ResetPasswordPage },
    { path: '/activity-log', component: ActivityLogPage },
    { path: '/advisory', component: AdvisoryPage }, 
    { path: '/segments', component: SegmentPage },
    { path: '/users', component: UsersPage },
    { path: '/contact-us', component: ContactPage },
    { path: '/:catchAll(.*)', component: NotFoundPage } // 
];

// Create the router instance
const router = createRouter({
    history: createWebHistory(),
    routes
});

// Optional: Add route navigation guards
router.beforeEach((to, from, next) => {
  const isAuthenticated = !!localStorage.getItem("authToken");

  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login'); // Redirect to login if not authenticated
  } else {
    next(); // Continue navigation
  }
});

// Create the Vue app and mount it with the router
const app = createApp(App);
app.use(router); 
app.mount('#app');
