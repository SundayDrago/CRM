import { createApp } from 'vue';
import App from './App.vue';
import { createRouter, createWebHistory } from 'vue-router';
import Toast from 'vue-toastification';
import 'vue-toastification/dist/index.css';
import '@fortawesome/fontawesome-free/css/all.css';
import axios from 'axios';

// Import components
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
import UsersReportPage from './components/users/UsersReportPage.vue';
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
import AnalyticsPage from './components/users/AnalyticsPage.vue';
import ClientsPage from './components/users/ClientsPage.vue';
import SendEmailPage from './components/admins/SendEmailPage.vue';

// Define routes
const routes = [
    { path: '/', component: HomePage },
    { path: '/login', component: LoginPage },
    { path: '/user-login', component: UserLoginPage },
    { path: '/users-dashboard', component: UsersDashboard, meta: { requiresAuth: true } },
    { path: '/register', component: RegisterPage },
    { path: '/admin', component: AdminPage, meta: { requiresAuth: true } },
    { path: '/verify', component: VerifySecurityCode },
    { path: '/forgot-password', component: ForgotPasswordPage },
    { path: '/reset-password/:token', component: ResetPasswordPage },
    { path: '/activity-log', component: ActivityLogPage, meta: { requiresAuth: true } },
    { path: '/advisory', component: AdvisoryPage, meta: { requiresAuth: true } },
    { path: '/segments', component: SegmentPage, meta: { requiresAuth: true } },
    { path: '/settings', component: SettingsPage, meta: { requiresAuth: true } },
    { path: '/setting', component: UsersSettingsPage, meta: { requiresAuth: true } },
    { path: '/users', component: UsersPage, meta: { requiresAuth: true } },
    { path: '/report', component: ReportPage, meta: { requiresAuth: true } },
    { path: '/users-report', component: UsersReportPage, meta: { requiresAuth: true } },
    { path: '/setup-account', component: SetupAccountPage },
    { path: '/contact-us', component: ContactPage },
    { path: '/profile', component: ProfilePage, meta: { requiresAuth: true } },
    { path: '/send', component: SendEmailPage, meta: { requiresAuth: true } },
    { path: '/analytics', component: AnalyticsPage, meta: { requiresAuth: true } },
    { path: '/clients', component: ClientsPage, meta: { requiresAuth: true } },
    { path: '/create', component: CreateSegmentsPage, meta: { requiresAuth: true } },
    { path: '/get-started', component: GetStartedPage },
    { path: '/dashboard/admin-stats', name: 'AdminStats', component: AdminStats, meta: { requiresAuth: true } },
    { path: '/dashboard/user-stats', name: 'UsersStats', component: UsersStats, meta: { requiresAuth: true } },
    { path: '/:catchAll(.*)', component: NotFoundPage },
];

// Create the router instance
const router = createRouter({
    history: createWebHistory(),
    routes,
});

//// Navigation guard
router.beforeEach(async (to, from, next) => {
 const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
 const token = localStorage.getItem('authToken');

 if (!requiresAuth) {
   // Allow access to public routes (e.g., /login, /register)
   return next();
 }

 if (!token) {
   console.log(`No token found for ${to.path}, redirecting to /login`);
   return next('/login');
 }

 try {
   console.log(`Validating token for ${to.path}`);
   const response = await axios.get('http://localhost:5000/api/admin/profile', {
     headers: { Authorization: `Bearer ${token}` },
   });

   if (response.status === 200) {
     console.log(`Valid token for ${to.path}, proceeding`);
     return next();
   } else {
     console.log(`Invalid response status ${response.status} for ${to.path}, clearing token`);
     localStorage.removeItem('authToken');
     return next('/login');
   }
 } catch (error) {
   console.error(`Token validation error for ${to.path}:`, {
     message: error.message,
     response: error.response ? { status: error.response.status, data: error.response.data } : null,
   });
   localStorage.removeItem('authToken');
   return next('/login');
 }
});
// Create and mount the app

const app = createApp(App);
app.use(router);
app.use(Toast);
app.mount('#app');