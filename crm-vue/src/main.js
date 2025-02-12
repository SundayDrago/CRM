import { createApp } from 'vue';
import App from './App.vue';

import { createRouter, createWebHistory } from 'vue-router';

// Import components for each route
import HomePage from './components/HomePage.vue';
import LoginPage from './components/LoginPage.vue';
import RegisterPage from './components/RegisterPage.vue';
import AdminPage from './components/admins/AdminPage.vue'; 
import VerifySecurityCode from './components/admins/VerifySecurityCode.vue';

// Define routes
const routes = [
    { path: '/', component: HomePage },
    { path: '/login', component: LoginPage },
    { path: '/register', component: RegisterPage },
    { path: '/admin', component: AdminPage },
    { path: '/verify', component: VerifySecurityCode },
];

// Create the router instance
const router = createRouter({
    history: createWebHistory(),
    routes
});

// Create the Vue app and mount it with the router
const app = createApp(App);
app.use(router); // Use the router
app.mount('#app'); // Mount the app to the DOM
