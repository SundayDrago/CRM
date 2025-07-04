import { createApp } from 'vue';
import App from './App.vue';
//import jwtDecode from 'jwt-decode';
import { createRouter, createWebHistory } from 'vue-router';
import Toast from 'vue-toastification';
import 'vue-toastification/dist/index.css';
import '@fortawesome/fontawesome-free/css/all.css';
//import axios from 'axios';

// Import components
import HomePage from './components/HomePage.vue';
import AboutUsPage from './components/AboutUsPage.vue';
import LoginPage from './components/LoginPage.vue';
import UserLoginPage from './components/UserLoginPage.vue';
import RegisterPage from './components/RegisterPage.vue';
import AdminPage from './components/admins/AdminPage.vue';
import VerifySecurityCode from './components/admins/VerifySecurityCode.vue';
import ForgotPasswordPage from './components/ForgotPasswordPage.vue';
import NotFoundPage from './components/NotFoundPage.vue';
import ModelDisplayPage from './components/ModelDisplayPage.vue';
import ResetPasswordPage from './components/ResetPasswordPage.vue';
import ActivityLogPage from './components/admins/ActivityLogPage.vue';
import SegmentPage from './components/admins/SegmentPage.vue';
import NewSegments from './components/admins/segments/NewSegments.vue';
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
import DefaultLayout from './components/users/DefaultLayout.vue';

// Define routes
const routes = [
    { path: '/', component: HomePage },
    { path: '/login', component: LoginPage },
    { path: '/model', component: ModelDisplayPage },
    { path: '/user-login', component: UserLoginPage },
    { path: '/register', component: RegisterPage },
    { path: '/admin', component: AdminPage, meta: { requiresAuth: true } },
    { path: '/verify', component: VerifySecurityCode },
    { path: '/about-us', component: AboutUsPage },
    { path: '/forgot-password', component: ForgotPasswordPage },
    { path: '/reset-password/:token', component: ResetPasswordPage },
    { path: '/activity-log', component: ActivityLogPage, meta: { requiresAuth: true } },
    { path: '/advisory', component: AdvisoryPage, meta: { requiresAuth: true } },
    { path: '/settings', component: SettingsPage, meta: { requiresAuth: true } },
    { path: '/setting', component: UsersSettingsPage, meta: { requiresAuth: true } },
    { path: '/users', component: UsersPage, meta: { requiresAuth: true } },
    { path: '/report', component: ReportPage, meta: { requiresAuth: true } },
    { path: '/reports', component: UsersReportPage, meta: { requiresAuth: true } },
    { path: '/setup-account', component: SetupAccountPage },
    { path: '/contact-us', component: ContactPage },
    { path: '/profile', component: ProfilePage, meta: { requiresAuth: true } },
    { path: '/send', component: SendEmailPage, meta: { requiresAuth: true } },
    { path: '/create', component: CreateSegmentsPage, meta: { requiresAuth: true } },
    { path: '/get-started', component: GetStartedPage },
    { path: '/dashboard/admin-stats', name: 'AdminStats', component: AdminStats, meta: { requiresAuth: true } },
    { path: '/dashboard/user-stats', name: 'UsersStats', component: UsersStats, meta: { requiresAuth: true } },
    { path: '/:catchAll(.*)', component: NotFoundPage },
    {
        path:'/user-default',
        component: DefaultLayout,
        children: [
            { path: '/clients', component: ClientsPage, meta: { requiresAuth: true } },
            { path: '/analytics', component: AnalyticsPage, meta: { requiresAuth: true } },
            { path: '/users-report', component: UsersReportPage, meta: { requiresAuth: true } },
            { path: '/users-dashboard', component: UsersDashboard, meta: { requiresAuth: true } },
            { path: '/user-settings', component: UsersSettingsPage, meta: { requiresAuth: true } },
            { path: '/segments', component: SegmentPage, meta: { requiresAuth: true } },
            
            { path: '/new-segments', component: NewSegments, meta: { requiresAuth: true } },

        ]
    }
];

// Create the router instance
const router = createRouter({
    history: createWebHistory(),
    routes,
});

// Navigation guard
// router.beforeEach(async (to, from, next) => {
//   const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
//   const token = localStorage.getItem('authToken');

//   if (!requiresAuth) {
//     return next();
//   }

//   if (!token) {
//     console.log(`No token found for ${to.path}, redirecting to /login`);
//     return next('/login');
//   }

//   try {
//     // Decode token to check isAdmin
//     const decoded = jwtDecode(token);
//     const isAdmin = decoded.isAdmin;
//     const validationUrl = isAdmin
//       ? 'http://localhost:5000/api/admin/profile'
//       : 'http://localhost:5000/api/user/profile'; // Add user profile endpoint in backend

//     console.log(`Validating token for ${to.path} as ${isAdmin ? 'admin' : 'user'}`);
//     const response = await axios.get(validationUrl, {
//       headers: { Authorization: `Bearer ${token}` },
//     });

//     if (response.status === 200) {
//       console.log(`Valid token for ${to.path}, proceeding`);
//       return next();
//     } else {
//       console.log(`Invalid response status ${response.status} for ${to.path}, clearing token`);
//       localStorage.removeItem('authToken');
//       return next('/login');
//     }
//   } catch (error) {
//     console.error(`Token validation error for ${to.path}:`, {
//       message: error.message,
//       response: error.response ? { status: error.response.status, data: error.response.data } : null,
//     });
//     localStorage.removeItem('authToken');
//     return next('/login');
//   }
// });


// Create and mount the app

const app = createApp(App);
app.use(router);
app.use(Toast);
app.mount('#app');