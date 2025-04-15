import { createApp } from 'vue';
import App from './App.vue';
import { createRouter, createWebHistory } from 'vue-router';
import Toast from 'vue-toastification'; // Import Toast plugin
import 'vue-toastification/dist/index.css'; // Import Toast styles
import '@fortawesome/fontawesome-free/css/all.css';

// Import components for each route
import HomePage from './components/HomePage.vue';
import LoginPage from './components/LoginPage.vue';
import UserLoginPage from './components/UserLoginPage.vue';
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
import ReportPage from './components/admins/ReportPage.vue';
import ContactPage from './components/ContactPage.vue';
import SettingsPage from './components/admins/SettingsPage.vue';
import UsersSettingsPage from './components/users/UsersSettingsPage.vue';
import SetupAccountPage from './components/users/SetupAccountPage.vue';
import UsersDashboard from './components/users/UsersDashboard.vue';
import CreateSegmentsPage from './components/admins/segments/CreateSegmentsPage.vue';
import GetStartedPage from './components/GetStartedPage.vue';
import AdminStats from './components/admins/AdminStats.vue';
import UsersStats from './components/admins/UsersStats.vue';
import ProfilePage from './components/users/ProfilePage.vue';


// Define routes
const routes = [
    { path: '/', component: HomePage },
    { path: '/login', component: LoginPage },
    { path: '/user-login', component: UserLoginPage },
    { path: '/users-dashboard', component: UsersDashboard},
    { path: '/register', component: RegisterPage },
    { path: '/admin', component: AdminPage, meta: { requiresAuth: true } },
    { path: '/verify', component: VerifySecurityCode },
    { path: '/forgot-password', component: ForgotPasswordPage },
    { path: '/reset-password/:token', component: ResetPasswordPage },
    { path: '/activity-log', component: ActivityLogPage },
    { path: '/advisory', component: AdvisoryPage },
    { path: '/segments', component: SegmentPage },
    { path: '/settings', component: SettingsPage },
    { path: '/setting', component: UsersSettingsPage },
    { path: '/users', component: UsersPage },
    { path: '/report', component: ReportPage },
    { path: '/setup-account', component: SetupAccountPage },
    { path: '/contact-us', component: ContactPage },
    { path: '/profile', component: ProfilePage },
    { path: '/create', component: CreateSegmentsPage },
    { path: '/:catchAll(.*)', component: NotFoundPage },
    { path: '/get-started', component: GetStartedPage },
      {
    path: '/dashboard/admin-stats',
    name: 'AdminStats',
    component: AdminStats,
    meta: { requiresAuth: true }
  },
  {
    path: '/dashboard/user-stats',
    name: 'UsersStats',
    component: UsersStats,
    meta: { requiresAuth: true }
  },
];

// Create the router instance
const router = createRouter({
    history: createWebHistory(),
    routes
});

//router.beforeEach((to, from, next) => {
//  const isAuthenticated = !!localStorage.getItem("authToken");
//  if (to.meta.requiresAuth && !isAuthenticated) {
//    if (to.path === '/users-dashboard') {
//      console.log('Redirecting to /user-login');
//      next('/user-login'); // Redirect to user login for users-dashboard
//    } else {
//      console.log('Redirecting to /login');
//      next('/login'); // Redirect to admin login for other protected routes
//    }
//  } else {
//    next();
//  }
//});

// Create the Vue app and mount it with the router and Toast
const app = createApp(App);
app.use(router); // Register the router
app.use(Toast); // Register the Toast plugin
app.mount('#app');