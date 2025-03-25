<template>
  <div class="admin-dashboard" :class="{ 'sidebar-collapsed': isSidebarCollapsed }">
    <!-- Sidebar -->
    <aside class="sidebar">
      <button class="toggle-sidebar" @click="toggleSidebar">
        <i :class="isSidebarCollapsed ? 'fas fa-bars' : 'fas fa-chevron-left'"></i>
      </button>
      <h2 v-if="!isSidebarCollapsed">Admin Panel</h2>
      <nav>
        <ul class="sidebar-menu">
          <li @click="currentTab = 'dashboard'" :class="{ active: currentTab === 'dashboard' }">
            <i class="fas fa-tachometer-alt"></i> <span v-if="!isSidebarCollapsed">Dashboard</span>
          </li>
          <li @click="currentTab = 'users'" :class="{ active: currentTab === 'users' }">
            <i class="fas fa-users"></i> <span v-if="!isSidebarCollapsed">Users</span>
          </li>
          <li @click="currentTab = 'segmentation'" :class="{ active: currentTab === 'segmentation' }">
            <i class="fas fa-chart-pie"></i> <span v-if="!isSidebarCollapsed">Segmentation</span>
          </li>
          <li @click="currentTab = 'settings'" :class="{ active: currentTab === 'settings' }">
            <i class="fas fa-cogs"></i> <span v-if="!isSidebarCollapsed">Settings</span>
          </li>
          <li @click="currentTab = 'activity'" :class="{ active: currentTab === 'activity' }">
            <i class="fas fa-history"></i> <span v-if="!isSidebarCollapsed">Activity Log</span>
          </li>
          <li @click="currentTab = 'advisory'" :class="{ active: currentTab === 'advisory' }">
            <i class="fas fa-lightbulb"></i> <span v-if="!isSidebarCollapsed">Advisory</span>
          </li>
        </ul>
      </nav>
      <button class="logout-button" @click="confirmLogout">
        <i class="fas fa-sign-out-alt"></i> <span v-if="!isSidebarCollapsed">Logout</span>
      </button>
    </aside>

    <!-- Main Content -->
    <div class="main-container">
      <!-- Navbar -->
      <nav class="navbar">
        <div class="search-container">
          <input type="text" placeholder="Search..." class="search-input" />
          <button class="search-button" @click="performSearch">
            <i class="fas fa-search"></i>
          </button>
        </div>
        <div class="nav-icons">
          <div class="profile-menu" @click="triggerFileInput">
            <input type="file" accept="image/*" @change="onProfilePicChange" class="profile-input" ref="fileInput" hidden />
            <img :src="adminProfile.picture || defaultAvatar" alt="Profile" class="profile-pic" />
            <span>{{ adminProfile.username }}</span>
          </div>
        </div>
      </nav>

      <!-- Dynamic Page Content -->
      <main class="content">
        <component :is="currentTabComponent"></component>
      </main>
    </div>

    <!-- Logout Confirmation Modal -->
    <div v-if="showLogoutModal" class="modal-overlay">
      <div class="modal">
        <p>Are you sure you want to log out?</p>
        <div class="modal-buttons">
          <button class="confirm-button" @click="logout">Yes</button>
          <button class="cancel-button" @click="showLogoutModal = false">No</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import DashboardPage from './DashboardPage.vue';
import UsersPage from './UsersPage.vue';
import SegmentPage from './SegmentPage.vue';
import SettingsPage from './SettingsPage.vue';
import ActivityLogPage from './ActivityLogPage.vue';
import AdvisoryPage from './AdvisoryPage.vue';

export default {
  components: { DashboardPage, UsersPage, SegmentPage, SettingsPage, ActivityLogPage, AdvisoryPage },
  data() {
    return {
      isSidebarCollapsed: false,
      currentTab: 'dashboard',
      adminProfile: { picture: '', username: 'Admin' },
      defaultAvatar: 'https://graph.facebook.com/10000000/picture?type=normal',
      showLogoutModal: false,
    };
  },
  computed: {
    currentTabComponent() {
      return {
        dashboard: DashboardPage,
        users: UsersPage,
        segmentation: SegmentPage,
        settings: SettingsPage,
        activity: ActivityLogPage,
        advisory:AdvisoryPage,
      }[this.currentTab];
    },
  },
  created() {
    this.loadUserAvatar();
  },
  methods: {
    toggleSidebar() {
      this.isSidebarCollapsed = !this.isSidebarCollapsed;
    },
    loadUserAvatar() {
      const storedAvatar = localStorage.getItem('userAvatar');
      this.adminProfile.picture = storedAvatar || this.defaultAvatar;
    },
    onProfilePicChange(event) {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.adminProfile.picture = e.target.result;
          localStorage.setItem('userAvatar', e.target.result);
        };
        reader.readAsDataURL(file);
      }
    },
    triggerFileInput() {
      this.$refs.fileInput.click();
    },
    performSearch() {
      alert('Search function is not implemented yet.');
    },
    confirmLogout() {
      this.showLogoutModal = true;
    },
    logout() {
      this.showLogoutModal = false;
      localStorage.removeItem('userAvatar');
      this.$router.push('/');
    },
  },
};
</script>

<style scoped>
.admin-dashboard {
  display: flex;
  height: 100vh;
  background-color: #f8f9fa;
}

.sidebar {
  width: 240px;
  background-color: #ffffff;
  color: #333;
  padding: 15px;
  transition: width 0.3s ease;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
}

.sidebar-collapsed .sidebar {
  width: 70px;
}

.sidebar .toggle-sidebar {
  background: none;
  border: none;
  color: #333;
  font-size: 1.2em;
  cursor: pointer;
  margin-bottom: 20px;
  align-self: flex-start;
}

.sidebar-menu {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sidebar-menu li {
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.3s;
  border-radius: 5px;
  color: #333;
}

.sidebar-menu li:hover {
  background: #f1f1f1;
}

.sidebar-menu li.active {
  background: #e0e0e0;
  font-weight: bold;
}

.sidebar-menu i {
  width: 20px;
}

.notification-container {
  position: relative;
  cursor: pointer;
}
.notification-icon {
  font-size: 1.5em;
  color: #555;
}
.notification-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background: red;
  color: white;
  font-size: 0.8em;
  padding: 4px 8px;
  border-radius: 50%;
}

.logout-button {
  background: #e74c3c;
  color: white;
  border: none;
  padding: 10px;
  margin-top: auto;
  width: 100%;
  text-align: center;
  border-radius: 5px;
  cursor: pointer;
}

.logout-button:hover {
  background: #c0392b;
}

/* Main Content */
.main-container {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 12px 24px;
  border-bottom: 1px solid #ddd;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.search-container {
  display: flex;
  align-items: center;
  background: #f1f1f1;
  padding: 8px;
  border-radius: 5px;
  width: 250px;
}

.search-input {
  border: none;
  background: none;
  padding: 5px;
  outline: none;
  flex-grow: 1;
}

.search-button {
  background: #3498db;
  border: none;
  color: white;
  padding: 5px 10px;
  cursor: pointer;
  border-radius: 5px;
}

.search-button:hover {
  background: #2980b9;
}

.profile-menu {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.profile-pic {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal {
  background: white;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  width: 300px;
}

.modal-buttons {
  display: flex;
  justify-content: space-around;
  margin-top: 10px;
}

.confirm-button {
  background: #e74c3c;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 5px;
  cursor: pointer;
}

.confirm-button:hover {
  background: #c0392b;
}

.cancel-button {
  background: #bdc3c7;
  color: black;
  border: none;
  padding: 8px 12px;
  border-radius: 5px;
  cursor: pointer;
}

.cancel-button:hover {
  background: #95a5a6;
}
</style>