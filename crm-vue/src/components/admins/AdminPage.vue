<template>
  <div class="admin-dashboard">
    <!-- Navbar -->
    <nav class="navbar">
      <div class="nav-left">
        <img :src="logo" alt="Logo" class="logo" />
      </div>
      <div class="search-container">
        <div class="search-bar">
          <input type="text" placeholder="Search..." />
        </div>
        <button class="search-button" @click="performSearch">
          <i class="fas fa-search"></i>
        </button>
      </div>
      <div class="nav-icons">
        <i class="fas fa-bell notification-icon"></i>
        <div class="profile-menu">
          <input type="file" accept="image/*" @change="onProfilePicChange" class="profile-input" ref="fileInput" />
          <img :src="adminProfile.picture" alt="Profile" class="profile-pic" @click="triggerFileInput" />
          <span>{{ adminProfile.username }}</span> <!-- Display username here -->
        </div>
      </div>
    </nav>

    <!-- Sidebar -->
    <aside class="sidebar">
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
        <UsersPage />
      </div>
      <div v-if="currentTab === 'segmentation'">
        <SegmentPage />
      </div>
      <div v-if="currentTab === 'settings'">
        <SettingsPage />
      </div>
      <div v-if="currentTab === 'activity'">
        <ActivityLogPage />
      </div>
    </main>
  </div>
</template>

<script>
import SettingsPage from './SettingsPage.vue';
import DashboardPage from './DashboardPage.vue';
import ActivityLogPage from './ActivityLogPage.vue';
import SegmentPage from './SegmentPage.vue';
import UsersPage from './UsersPage.vue';

export default {
  name: 'AdminPage',
  components: {
    SettingsPage,
    DashboardPage,
    ActivityLogPage,
    SegmentPage,
    UsersPage
  },
  data() {
    return {
      currentTab: 'dashboard',
      adminProfile: {
        picture: 'https://via.placeholder.com/80',
        username: 'Admin', // Added username property
      },
    };
  },
  computed: {
    pageTitle() {
      const titles = {
        dashboard: 'Dashboard',
        users: 'User Management',
        segmentation: 'Customer Segmentation',
        settings: 'Settings',
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
    performSearch() {
      alert('Search function is not implemented yet.'); // Placeholder for search functionality
    },
    triggerFileInput() {
      this.$refs.fileInput.click(); // Trigger the file input click
    },
    onProfilePicChange(event) {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.adminProfile.picture = e.target.result; // Update the profile picture
        };
        reader.readAsDataURL(file); // Convert image file to base64 string
      }
    },
  },
};
</script>

<style scoped>
.admin-dashboard {
  display: flex;
  height: 100vh;
  background-color: #f4f4f9;
}

.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 10px 20px;
  color: #333;
  width: 100%;
  position: fixed;
  top: 0;
  left: 0;
  height: 60px;
  z-index: 1000;
}

.logo {
  height: 40px;
}

.search-container {
  display: flex;
  align-items: center;
}

.search-bar {
  background: white;
  border-radius: 5px;
}

.search-bar input {
  border: 1px solid #ccc;
  outline: none;
  padding: 5px;
  width: 200px;
  border-radius: 5px;
}

.search-button {
  background: #007bff;
  color: white;
  border: none;
  padding: 13px 18px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1em;
  transition: background 0.3s;
  margin-left: 5px;
}

.search-button:hover {
  background: #0056b3;
}

.nav-icons {
  display: flex;
  align-items: center;
  gap: 15px;
}

.notification-icon {
  font-size: 1.2em;
  margin-right: 10px;
  cursor: pointer;
  color: black;
}

.profile-menu {
  display: flex;
  margin-right: 150px;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.profile-input {
  display: none;
}

.profile-pic {
  width: 35px;
  height: 35px;
  border-radius: 50%;
  object-fit: cover;
  cursor: pointer;
}

.sidebar {
  width: 220px;
  background-color: white;
  color: #333;
  padding: 20px;
  height: 100vh;
  padding-top: 70px;
  border-right: 1px solid #ccc;
}

.sidebar h2 {
  text-align: center;
  font-size: 1.3em;
  margin-bottom: 15px;
}

.sidebar nav ul {
  list-style: none;
  padding: 0;
}

.sidebar nav li {
  padding: 10px;
  cursor: pointer;
  border-radius: 5px;
  transition: background 0.3s;
  display: flex;
  align-items: center;
}

.sidebar nav li i {
  margin-right: 10px;
  color: black;
}

.sidebar nav li:hover,
.sidebar nav li.active {
  background-color: #e6e6e6;
}

.logout {
  background: transparent;
  border: none;
  color: #333;
  font-size: 1em;
  cursor: pointer;
  padding: 10px;
  width: 100%;
  text-align: left;
  transition: background 0.3s;
}

.logout:hover {
  background-color: rgba(0, 0, 0, 0.1);
}

.content {
  flex: 1;
  padding: 20px;
  margin-top: 70px;
  color: #333;
}
</style>
