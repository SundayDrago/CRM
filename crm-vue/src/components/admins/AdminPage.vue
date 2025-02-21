<template>
  <div class="admin-dashboard">
    <!-- Sidebar -->
    <aside class="sidebar">
      <!-- Avatar Section -->
      <div class="avatar-section">
        <div class="avatar-container">
          <img :src="adminProfile.picture" alt="Admin Profile Picture" class="avatar" />
          <!-- Online Status -->
          <div class="online-status" :class="{ online: adminProfile.isOnline }"></div>
        </div>
        <label for="file-upload" class="upload-btn">
          <i class="fas fa-camera"></i> Change Photo
        </label>
        <input type="file" id="file-upload" @change="uploadProfilePicture" class="file-input" />
      </div>

      <h2>Admin Panel</h2>
      <nav>
        <ul>
          <li @click="currentTab = 'dashboard'" :class="{ active: currentTab === 'dashboard' }">
            <i class="fas fa-tachometer-alt"></i> Dashboard
          </li>
          <li @click="currentTab = 'users'" :class="{ active: currentTab === 'users' }">
            <i class="fas fa-users"></i> Users
          </li>
          <li @click="currentTab = 'segmentation'" :class="{ active: currentTab === 'segmentation' }">
            <i class="fas fa-chart-pie"></i> Segmentation
          </li>
          <li @click="currentTab = 'settings'" :class="{ active: currentTab === 'settings' }">
            <i class="fas fa-cogs"></i> Settings
          </li>
          <li @click="currentTab = 'reports'" :class="{ active: currentTab === 'reports' }">
            <i class="fas fa-file-alt"></i> Reports
          </li>
          <li @click="currentTab = 'activity'" :class="{ active: currentTab === 'activity' }">
            <i class="fas fa-history"></i> Activity Logs
          </li>
        </ul>
      </nav>
      <button class="logout" @click="logout">
        <i class="fas fa-sign-out-alt"></i> Logout
      </button>
    </aside>

    <!-- Main Content -->
    <main class="content">
      <h2>{{ pageTitle }}</h2>

      <div v-if="currentTab === 'dashboard'">
        <DashboardPage />
      </div>

      <div v-if="currentTab === 'users'">
        <p>Manage users here.</p>
      </div>

      <div v-if="currentTab === 'segmentation'">
        <p>Manage customer segmentation here.</p>
      </div>

      <div v-if="currentTab === 'settings'">
        <SettingsPage />
      </div>

      <div v-if="currentTab === 'reports'">
        <p>Generate reports on user activity and segmentation.</p>
      </div>

      <div v-if="currentTab === 'activity'">
        <p>View admin activity logs here.</p>
      </div>
    </main>

    <AppFooter />
  </div>
</template>

<script>
import SettingsPage from './SettingsPage.vue';
import DashboardPage from './DashboardPage.vue';
//import AppFooter from '@/components/Footer.vue';

export default {
  name: 'AdminPage',
  components: {
    SettingsPage,
    DashboardPage,
  },
  data() {
    return {
      currentTab: 'dashboard',
      adminProfile: {
        picture: 'https://via.placeholder.com/80',
        isOnline: true,
      },
    };
  },
  computed: {
    pageTitle() {
      const titles = {
        dashboard: '',
        users: 'User Management',
        segmentation: 'Customer Segmentation',
        settings: 'Admin Settings',
        reports: 'Reports',
        activity: 'Activity Logs',
      };
      return titles[this.currentTab];
    },
  },
  methods: {
    logout() {
      alert('Logging out...');
      this.$router.push('/');
    },
    uploadProfilePicture(event) {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.adminProfile.picture = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    },
  },
};
</script>

<style scoped>
/* Add Font Awesome Icons */
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css');

/* Styles for AdminPage.vue */
.admin-dashboard {
  display: flex;
  height: 100vh;
  background-color: #f4f4f9;
}

.sidebar {
  width: 220px; /* Reduced sidebar width */
  background-color: #007bff;
  color: white;
  padding: 15px; /* Reduced padding */
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px; /* Reduced bottom margin */
}

.avatar-container {
  position: relative;
  width: 80px; /* Reduced avatar size */
  height: 80px; /* Reduced avatar size */
  border-radius: 50%;
  overflow: hidden;
  margin-bottom: 8px; /* Reduced margin */
}

.avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.online-status {
  position: absolute;
  top: 0;
  right: 0;
  width: 12px; /* Smaller online status indicator */
  height: 12px; /* Smaller online status indicator */
  border-radius: 50%;
  background-color: #28a745;
  border: 2px solid white;
}

.online-status.online {
  background-color: #28a745;
}

.upload-btn {
  margin-top: 8px; /* Reduced margin */
  display: inline-block;
  padding: 3px 8px; /* Reduced padding */
  background-color: #ffffff;
  color: #007bff;
  font-size: 12px; /* Reduced font size */
  cursor: pointer;
  border-radius: 5px;
  border: 1px solid #007bff;
  transition: background-color 0.3s;
}

.upload-btn:hover {
  background-color: #007bff;
  color: white;
}

.file-input {
  display: none;
}

.sidebar h2 {
  text-align: center;
  font-size: 1.3em; /* Reduced font size */
  margin-bottom: 15px; /* Reduced margin */
}

.sidebar nav ul {
  list-style: none;
  padding: 0;
}

.sidebar nav li {
  padding: 8px; /* Reduced padding */
  cursor: pointer;
  border-radius: 5px;
  transition: background 0.3s;
  display: flex;
  align-items: center;
}

.sidebar nav li i {
  margin-right: 8px; /* Reduced icon spacing */
}

.sidebar nav li:hover,
.sidebar nav li.active {
  background-color: #0056b3;
}

.logout {
  margin-top: auto;
  background-color: #ff4d4d;
  border: none;
  padding: 8px; /* Reduced padding */
  color: white;
  font-size: 0.9em; /* Reduced font size */
  cursor: pointer;
  border-radius: 5px;
  transition: background 0.3s;
  display: flex;
  align-items: center;
}

.logout i {
  margin-right: 8px; /* Reduced icon spacing */
}

.logout:hover {
  background-color: #cc0000;
}

.content {
  flex: 1;
  padding: 15px; /* Reduced padding */
}

.content h2 {
  color: #007bff;
  font-size: 1.5em; /* Reduced font size */
  margin-bottom: 10px; /* Reduced margin */
}

.content p {
  font-size: 1.1em; /* Reduced font size */
  color: #333;
}

</style>
