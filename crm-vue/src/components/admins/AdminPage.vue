<template>
  <div class="admin-dashboard" :class="{ 'sidebar-collapsed': isSidebarCollapsed, 'dark-theme': darkMode }">
    <!-- Sidebar -->
    <aside class="sidebar" :class="{ 'sidebar-open': sidebarOpen }">
      <div class="sidebar-header">
        <button class="toggle-sidebar" @click="toggleSidebar">
          <i :class="isSidebarCollapsed ? 'fas fa-bars' : 'fas fa-chevron-left'"></i>
        </button>
        <div v-if="!isSidebarCollapsed" class="logo-container">
          <img src="@/assets/logo.png" alt="Company Logo" class="logo-image">
          <h2 class="logo-text">
            <span class="logo-primary">Customer</span>
            <span class="logo-secondary">Segment</span>
          </h2>
        </div>
        <div v-else class="logo-collapsed">
          <img src="@/assets/logo.png" alt="Logo" class="logo-collapsed-image">
        </div>
      </div>

      <nav>
        <ul class="sidebar-menu">
          <li
            v-for="item in menuItems"
            :key="item.id"
            :class="{ 'active': currentTab === item.id || (item.subItems && item.subItems.some(sub => sub.id === currentTab)), 'has-notification': item.hasNotification }"
          >
            <!-- Regular Menu Item -->
            <div v-if="!item.subItems" @click="selectMenuItem(item.id)" class="menu-item">
              <i :class="item.icon"></i>
              <span v-if="!isSidebarCollapsed">{{ item.label }}</span>
              <span v-if="item.hasNotification && !isSidebarCollapsed" class="notification-badge"></span>
            </div>
            <!-- Dropdown Menu Item -->
            <div v-else class="dropdown-toggle" @click="toggleDropdown(item.id)">
              <i :class="item.icon"></i>
              <span v-if="!isSidebarCollapsed">{{ item.label }}</span>
              <i v-if="!isSidebarCollapsed" class="fas fa-chevron-down dropdown-arrow" :class="{ 'rotated': item.isOpen }"></i>
            </div>
            <!-- Submenu -->
            <ul v-if="item.subItems && item.isOpen && !isSidebarCollapsed" class="submenu">
              <li
                v-for="subItem in item.subItems"
                :key="subItem.id"
                @click.stop="selectSubMenuItem(subItem.id)"
                :class="{ 'active': currentTab === subItem.id }"
              >
                <i :class="subItem.icon"></i>
                <span>{{ subItem.label }}</span>
              </li>
            </ul>
          </li>
        </ul>
      </nav>

      <div class="sidebar-footer">
        <button class="logout-button" @click="confirmLogout">
          <i class="fas fa-sign-out-alt"></i>
          <span v-if="!isSidebarCollapsed">Logout</span>
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="main-container">
      <!-- Navbar -->
      <nav class="navbar">
        <div class="navbar-left">
          <button class="mobile-toggle-sidebar" @click="toggleSidebarMobile">
            <i class="fas fa-bars"></i>
          </button>
          <div class="search-container">
            <i class="fas fa-search search-icon"></i>
            <input
              type="text"
              placeholder="Search users, segments, reports..."
              class="search-input"
              v-model="searchQuery"
              @keyup.enter="performSearch"
              @input="debouncedSearch"
            />
          </div>
        </div>

        <div class="nav-right">
          <div class="nav-item">
            <button class="nav-icon theme-toggle" @click="toggleDarkMode" :title="darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'">
              <div class="theme-icon-wrapper" :class="{ 'dark': darkMode }">
                <i class="fas fa-sun"></i>
                <i class="fas fa-moon"></i>
              </div>
            </button>
          </div>

          <div class="nav-item notification-wrapper" @click="toggleNotifications">
            <button class="nav-icon">
              <i class="fas fa-bell"></i>
              <span v-if="unreadNotifications > 0" class="notification-count">{{ unreadNotifications }}</span>
            </button>
            <div v-if="notificationsOpen" class="notifications-dropdown">
              <div class="notifications-header">
                <h3>Notifications ({{ notifications.length }})</h3>
                <button class="mark-read" @click.stop="markAllAsRead">Mark all as read</button>
              </div>
              <ul>
                <li v-for="(notification, index) in notifications" :key="index" :class="{ 'unread': !notification.read }">
                  <div class="notification-content">
                    <i :class="notification.icon"></i>
                    <div>
                      <p class="notification-title">{{ notification.title }}</p>
                      <p class="notification-time">{{ notification.time }}</p>
                    </div>
                  </div>
                </li>
              </ul>
              <div class="notifications-footer">
                <button @click.stop="viewAllNotifications">View All Notifications</button>
              </div>
            </div>
          </div>

          <div class="nav-item profile-menu" @click="toggleProfileMenu">
            <div class="profile-info">
              <div class="avatar-wrapper">
                <img
                  :src="adminProfile.picture || defaultAvatar"
                  alt="Profile"
                  class="profile-pic"
                  @error="adminProfile.picture = defaultAvatar"
                />
                <span class="active-status" :class="{ 'online': adminProfile.isOnline }"></span>
              </div>
              <span class="profile-name">{{ adminProfile.username }}</span>
            </div>
            <i class="fas fa-chevron-down profile-arrow"></i>
            <div v-if="profileMenuOpen" class="profile-dropdown">
              <ul>
                <li @click="triggerFileInput">
                  <i class="fas fa-user-edit"></i> Change Profile Picture
                  <input
                    type="file"
                    accept="image/png,image/jpeg"
                    @change="onProfilePicChange"
                    class="profile-input"
                    ref="fileInput"
                    hidden
                  />
                </li>
                <li @click="navigateToProfile">
                  <i class="fas fa-user-cog"></i> Account Settings
                </li>
                <li @click="toggleDarkMode">
                  <i :class="darkMode ? 'fas fa-sun' : 'fas fa-moon'"></i>
                  {{ darkMode ? 'Light Mode' : 'Dark Mode' }}
                </li>
                <li class="divider"></li>
                <li @click="confirmLogout">
                  <i class="fas fa-sign-out-alt"></i> Logout
                </li>
              </ul>
            </div>
          </div>
        </div>
      </nav>

      <!-- Dynamic Page Content -->
      <main class="content">
        <div class="content-header">
          <div class="breadcrumbs">
            <span>Admin</span>
            <i class="fas fa-chevron-right"></i>
            <span>{{ currentTabLabel }}</span>
          </div>
        </div>
        <div class="content-body">
          <component :is="currentTabComponent" :search-query="searchQuery" @update-search="updateSearchResults"></component>
        </div>
      </main>

      <!-- Enhanced Logout Confirmation Modal -->
      <transition name="modal-transition">
        <div v-if="showLogoutModal" class="logout-modal-overlay" @click.self="showLogoutModal = false">
          <div class="logout-modal-container">
            <div class="logout-modal-content">
              <div class="modal-icon-wrapper">
                <i class="fas fa-exclamation-circle warning-icon"></i>
              </div>
              <h3 class="modal-title">Confirm Sign Out</h3>
              <p class="modal-message">You're about to sign out of your admin session. Any unsaved changes will be lost.</p>
              <div class="modal-action-buttons">
                <button class="modal-button secondary-button" @click="showLogoutModal = false">
                  Cancel
                </button>
                <button class="modal-button primary-button" @click="logout">
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script>
import DashboardPage from './DashboardPage.vue';
import UsersPage from './UsersPage.vue';
import SegmentPage from './SegmentPage.vue';
import CreateSegmentsPage from './segments/CreateSegmentsPage.vue';
import ReportPage from './ReportPage.vue';
import SettingsPage from './SettingsPage.vue';
import { reactive } from 'vue';
import debounce from 'lodash/debounce';

export default {
  components: { DashboardPage, UsersPage, SegmentPage, CreateSegmentsPage, ReportPage, SettingsPage },
  provide() {
    return {
      themeContext: reactive({
        darkMode: this.darkMode,
        toggleDarkMode: this.toggleDarkMode,
      }),
    };
  },
  data() {
    return {
      isSidebarCollapsed: false,
      sidebarOpen: false,
      currentTab: 'dashboard',
      darkMode: false,
      searchQuery: '',
      notificationsOpen: false,
      profileMenuOpen: false,
      showLogoutModal: false,
      adminProfile: {
        picture: '',
        username: 'Admin',
        isOnline: true,
      },
      defaultAvatar: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
      menuItems: [
        { id: 'dashboard', label: 'Dashboard', icon: 'fas fa-tachometer-alt', hasNotification: false },
        { id: 'users', label: 'Users', icon: 'fas fa-users', hasNotification: true },
        {
          id: 'segmentation',
          label: 'Recommendation',
          icon: 'fas fa-chart-pie',
          hasNotification: false,
          isOpen: false,
          subItems: [
            { id: 'view-segments', label: 'View', icon: 'fas fa-eye' },
            { id: 'create-segment', label: 'Target-Strategy', icon: 'fas fa-plus' },
          ],
        },
        { id: 'reports', label: 'Reports', icon: 'fas fa-chart-bar', hasNotification: false },
        { id: 'settings', label: 'System Settings', icon: 'fas fa-cogs', hasNotification: false },
      ],
      notifications: [],
      baseUrl: 'http://localhost:5000', // Centralized backend URL
    };
  },
  computed: {
    currentTabComponent() {
      return {
        dashboard: DashboardPage,
        users: UsersPage,
        'view-segments': SegmentPage,
        'create-segment': CreateSegmentsPage,
        reports: ReportPage,
        settings: SettingsPage,
      }[this.currentTab] || DashboardPage;
    },
    currentTabLabel() {
      const item = this.menuItems.find((i) => i.id === this.currentTab);
      if (item) return item.label;
      const parentItem = this.menuItems.find((i) => i.subItems && i.subItems.some((sub) => sub.id === this.currentTab));
      if (parentItem) {
        return `${parentItem.label}`;
      }
      return 'Dashboard';
    },
    unreadNotifications() {
      return this.notifications.filter((n) => !n.read).length;
    },
  },
  created() {
    this.fetchUserProfile();
    this.fetchNotifications();
    this.updateOnlineStatus();
    window.addEventListener('online', this.updateOnlineStatus);
    window.addEventListener('offline', () => this.updateOnlineStatus());
    // Load saved theme from localStorage
    const savedTheme = localStorage.getItem('adminTheme');
    if (savedTheme) {
      this.darkMode = savedTheme === 'dark';
      this.applyTheme();
    }
    this.debouncedSearch = debounce(this.performSearch, 300);
  },
  beforeUnmount() {
    window.removeEventListener('online', this.updateOnlineStatus);
    window.removeEventListener('offline', this.updateOnlineStatus);
  },
  methods: {
    async fetchUserProfile() {
      try {
        const token = await localStorage.getItem('authToken');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await fetch(`${this.baseUrl}/api/admin/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to fetch profile: ${response.status} ${errorText}`);
        }

        const data = await response.json();
        this.adminProfile.username = data.username || 'Admin';
        this.adminProfile.picture = data.avatar ? `${this.baseUrl}${data.avatar}` : this.defaultAvatar;
      } catch (error) {
        console.error('Error fetching user profile:', error.message);
        if (this.$toast && this.$toast.error) {
          this.$toast.error('Failed to load user profile. Please try again.');
        } else {
          alert('Failed to load user profile. Please try again.');
        }
      }
    },
    async updateProfilePicture(file) {
      try {
        const token = await localStorage.getItem('authToken');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const formData = new FormData();
        formData.append('avatar', file);

        const response = await fetch(`${this.baseUrl}/api/admin/profile/avatar`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        if (!response.ok) {
          const errorText = await response.text();
          if (response.status === 413) {
            throw new Error('File size too large.');
          } else if (response.status === 401) {
            throw new Error('Unauthorized. Please try again.');
          }
          throw new Error(`Failed to update: ${errorText}`);
        }

        const data = await response.json();
        this.adminProfile.picture = `${this.baseUrl}${data.avatar}`;
        this.$toast?.success?.('Profile picture updated successfully');
        await this.fetchUserProfile();
      } catch (error) {
        console.error('Error updating profile picture:', error.message);
        this.$toast?.error?.(error.message || 'Failed to update profile picture. Please try again.');
      }
    },
    onProfilePicChange(event) {
      const file = event.target.files[0];
      if (!file) {
        this.$toast?.error?.('No file selected.');
        return;
      }

      const validTypes = ['image/png', 'image/jpeg'];
      if (!validTypes.includes(file.type)) {
        this.$toast?.error('Please upload a PNG or JPEG image.');
        return;
      }

      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        this.$toast?.error('File size exceeds 5MB limit.');
        return;
      }

      this.updateProfilePicture(file);
    },
    triggerFileInput() {
      this.$refs.fileInput.click();
    },
    toggleSidebar() {
      this.isSidebarCollapsed = !this.isSidebarCollapsed;
      if (!this.isSidebarCollapsed) {
        this.sidebarOpen = false;
      }
    },
    toggleSidebarMobile() {
      this.sidebarOpen = !this.sidebarOpen;
    },
    selectMenuItem(id) {
      const item = this.menuItems.find((i) => i.id === id);
      if (!item.subItems) {
        this.currentTab = id;
        this.sidebarOpen = false;
        this.searchQuery = '';
      }
    },
    toggleDropdown(id) {
      const item = this.menuItems.find((i) => i.id === id);
      if (item.subItems) {
        item.isOpen = !item.isOpen;
      }
    },
    selectSubMenuItem(id) {
      this.currentTab = id;
      this.sidebarOpen = false;
      this.searchQuery = '';
      const parentItem = this.menuItems.find((i) => i.subItems && i.subItems.some((sub) => sub.id === id));
      if (parentItem) {
        parentItem.isOpen = false;
      }
    },
    performSearch() {
      if (this.searchQuery.trim()) {
        console.log(`Searching in ${this.currentTab} for:`, this.searchQuery);
        this.$refs.currentTabComponent?.search(this.searchQuery);
      } else {
        this.$refs.currentTabComponent?.search('');
      }
    },
    updateSearchResults(results) {
      console.log('Search results from child:', results);
    },
    async fetchNotifications() {
      try {
        const token = await localStorage.getItem('authToken');
        if (!token) {
          throw new Error('No authentication token found');
        }
        const response = await fetch(`${this.baseUrl}/api/notifications`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch notifications');
        }

        const data = await response.json();
        this.notifications = data.map((n) => ({
          id: n.id,
          title: n.title,
          time: this.formatTime(n.timestamp),
          icon: n.icon || 'fas fa-bell',
          read: n.read || false,
        }));
      } catch (error) {
        console.error('Error fetching notifications:', error);
        this.notifications = [
          { id: 1, title: 'New user registration', time: '2 mins ago', icon: 'fas fa-user-plus', read: false },
          { id: 2, title: 'System update available', time: '1 hr ago', icon: 'fas fa-download', read: true },
          { id: 3, title: 'Segmentation analysis complete', time: '3 hours ago', icon: 'fas fa-chart-pie', read: true },
          { id: 4, title: 'New report generated', time: '1 day ago', icon: 'fas fa-file-alt', read: true },
        ];
      }
    },
    formatTime(timestamp) {
      const now = new Date();
      const time = new Date(timestamp);
      const diff = (now - time) / 1000;
      if (diff < 60) {
        return `${Math.round(diff)}s ago`;
      }
      if (diff < 3600) {
        return `${Math.round(diff / 60)}m ago`;
      }
      if (diff < 86400) {
        return `${Math.round(diff / 3600)}h ago`;
      }
      return `${Math.round(diff / 86400)}d ago`;
    },
    toggleNotifications() {
      this.notificationsOpen = !this.notificationsOpen;
      this.profileMenuOpen = false;
      if (this.notificationsOpen && this.unreadNotifications > 0) {
        this.markAllAsRead();
      }
    },
    async markAllAsRead() {
      try {
        const token = await localStorage.getItem('authToken');
        if (!token) {
          throw new Error('No authentication token found');
        }
        await fetch(`${this.baseUrl}/api/notifications/read`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        this.notifications = this.notifications.map((n) => ({
          ...n,
          read: true,
        }));
      } catch (error) {
        console.error('Error marking notifications as read:', error);
        this.notifications = this.notifications.map((n) => ({
          ...n,
          read: true,
        }));
      }
    },
    viewAllNotifications() {
      this.$router.push('/notifications');
      this.notificationsOpen = false;
    },
    toggleProfileMenu() {
      this.profileMenuOpen = !this.profileMenuOpen;
      this.notificationsOpen = false;
    },
    navigateToProfile() {
      this.$router.push('/settings');
      this.profileMenuOpen = false;
    },
    confirmLogout() {
      this.showLogoutModal = true;
      this.profileMenuOpen = false;
    },
    logout() {
      localStorage.removeItem('authToken');
      this.$router.push('/');
    },
    updateOnlineStatus() {
      this.adminProfile.isOnline = navigator.onLine;
    },
    toggleDarkMode() {
      this.darkMode = !this.darkMode;
      this.applyTheme();
      localStorage.setItem('adminTheme', this.darkMode ? 'dark' : 'light');
    },
    applyTheme() {
      if (this.darkMode) {
        document.documentElement.classList.add('dark-mode');
      } else {
        document.documentElement.classList.remove('dark-mode');
      }
    },
  },
};
</script>
<style scoped lang="scss">
/* Root Variables */
:root {
  --primary-color: #4CAF50; /* Primary green from LandingPage */
  --primary-light: #66BB6A; /* Lighter green */
  --primary-dark: #388E3C; /* Darker green for hover */
  --secondary-color: #2196F3; /* Secondary blue */
  --accent-color: #f44336; /* Red for errors/notifications */
  --success-color: #4CAF50; /* Green for success states */
  --warning-color: #ff9800; /* Orange for warnings */
  --danger-color: #f44336; /* Red for danger */
  --dark-color: #333; /* Dark text */
  --light-color: #f5f7fa; /* Light background */
  --gray-light: #ddd; /* Light gray */
  --gray-medium: #666; /* Medium gray */
  --gray-dark: #555; /* Dark gray */
  --white: #ffffff;
  --black: #333;
  --sidebar-width: 260px;
  --sidebar-collapsed-width: 70px;
  --navbar-height: 60px;
  --transition: all 0.3s ease;
  --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.1);
  --shadow-md: 0 4px 15px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 20px rgba(0, 0, 0, 0.15);
  --border-radius: 10px;
  --sidebar-bg: #ffffff;
  --text-dark: #333;
  --hover-bg: rgba(76, 175, 80, 0.1); /* Green hover */
}

.dark-theme {
  --primary-color: #66BB6A; /* Lighter green for dark mode */
  --primary-light: #81C784;
  --primary-dark: #2E7D32; /* Darker green */
  --secondary-color: #1976D2; /* Darker blue */
  --dark-color: #f5f7fa; /* Light text in dark mode */
  --light-color: #1e1e1e; /* Dark background */
  --gray-light: #555;
  --gray-medium: #bbb;
  --gray-dark: #ddd;
  --white: #1e1e1e; /* Dark background for cards */
  --black: #f5f7fa; /* Light text */
  --sidebar-bg: #2a2a2a; /* Dark sidebar */
  --text-dark: #f5f7fa;
  --hover-bg: rgba(102, 187, 106, 0.2); /* Green hover in dark mode */
}

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}

/* Admin Dashboard */
.admin-dashboard {
  display: flex;
  min-height: 100vh;
  background-color: var(--light-color);
  color: var(--dark-color);
  font-family: 'Inter', sans-serif;
  transition: var(--transition);
  animation: fadeIn 0.5s ease-out;
}

/* Sidebar Styles */
.sidebar {
  width: var(--sidebar-width);
  background-color: var(--sidebar-bg);
  color: var(--text-dark);
  display: flex;
  flex-direction: column;
  transition: transform var(--transition), width var(--transition);
  box-shadow: var(--shadow-md);
  z-index: 100;
  animation: fadeInUp 0.6s ease-out;
}

.sidebar-collapsed .sidebar {
  width: var(--sidebar-collapsed-width);
}

.sidebar-header {
  padding: 15px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(90deg, #4CAF50, #2196F3); /* Matches UserLoginPage branding */
  min-height: 70px;
}

.toggle-sidebar,
.mobile-toggle-sidebar {
  background: none;
  border: none;
  color: var(--white);
  font-size: 1.2rem;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: var(--transition);
}

.toggle-sidebar:hover,
.mobile-toggle-sidebar:hover {
  background-color: rgba(255, 255, 255, 0.2);
  transform: scale(1.1);
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-left: 10px;
}

.logo-image,
.logo-collapsed-image {
  width: 40px;
  height: 40px;
  object-fit: contain;
  border-radius: 50%;
  transition: transform 0.3s ease;
}

.logo-container:hover .logo-image,
.logo-container:hover .logo-collapsed-image {
  transform: scale(1.05);
}

.logo-text {
  font-size: 1.4rem;
  font-weight: 800;
}

.logo-primary { color: #fff; }
.logo-secondary { color: rgba(255, 255, 255, 0.8); }

.sidebar-menu {
  list-style: none;
  padding: 10px 0;
  margin: 0;
  flex-grow: 1;
}

.sidebar-menu li {
  margin: 5px 10px;
  border-radius: var(--border-radius);
  animation: fadeInUp 0.5s ease-out forwards;
}

.sidebar-menu li:nth-child(1) { animation-delay: 0.1s; }
.sidebar-menu li:nth-child(2) { animation-delay: 0.2s; }
.sidebar-menu li:nth-child(3) { animation-delay: 0.3s; }
.sidebar-menu li:nth-child(4) { animation-delay: 0.4s; }
.sidebar-menu li:nth-child(5) { animation-delay: 0.5s; }

.menu-item,
.dropdown-toggle {
  padding: 12px 15px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-dark);
  transition: var(--transition);
}

.menu-item:hover,
.dropdown-toggle:hover {
  background-color: var(--hover-bg);
  color: var(--primary-color);
  transform: translateX(4px);
}

.dropdown-toggle .dropdown-arrow {
  font-size: 0.8rem;
  margin-left: auto;
  color: var(--gray-medium);
  transition: transform 0.3s ease;
}

.dropdown-toggle .dropdown-arrow.rotated {
  transform: rotate(180deg);
}

.submenu {
  list-style: none;
  padding: 5px 0;
  margin: 0 0 5px 0;
  background-color: var(--gray-light);
  border-radius: var(--border-radius);
}

.submenu li {
  padding: 10px 30px;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.9rem;
  color: var(--text-dark);
  cursor: pointer;
  transition: var(--transition);
}

.submenu li:hover {
  background-color: var(--hover-bg);
  color: var(--primary-color);
  transform: translateX(4px);
}

.submenu li.active {
  background-color: rgba(76, 175, 80, 0.2); /* Green accent */
  color: var(--primary-color);
  font-weight: 600;
}

.submenu li i {
  font-size: 1rem;
  min-width: 20px;
  color: var(--gray-medium);
}

.sidebar-menu li.active > .menu-item,
.sidebar-menu li.active > .dropdown-toggle {
  background-color: rgba(76, 175, 80, 0.2);
  color: var(--primary-color);
  font-weight: 600;
}

.sidebar-menu li.has-notification::after {
  content: '';
  position: absolute;
  top: 12px;
  right: 15px;
  width: 8px;
  height: 8px;
  background-color: var(--accent-color);
  border-radius: 50%;
}

.notification-badge {
  background-color: var(--accent-color);
  color: var(--white);
  border-radius: 10px;
  padding: 2px 6px;
  font-size: 0.7rem;
  font-weight: bold;
  margin-left: auto;
}

.sidebar-footer {
  padding: 15px;
  border-top: 1px solid var(--gray-light);
}

.logout-button {
  width: 100%;
  padding: 10px;
  background-color: var(--danger-color);
  color: var(--white);
  border: none;
  border-radius: 50px; /* Matches LandingPage buttons */
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.9rem;
}

.logout-button:hover {
  background-color: #d32f2f; /* Darker red */
  transform: translateY(-2px);
}

/* Main Container */
.main-container {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

/* Navbar */
.navbar {
  height: var(--navbar-height);
  background-color: var(--white);
  color: var(--text-dark);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  box-shadow: var(--shadow-sm);
  z-index: 10;
  animation: fadeIn 0.5s ease-out;
}

.navbar-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.mobile-toggle-sidebar {
  display: none;
  background: none;
  border: none;
  color: var(--text-dark);
  font-size: 1.2rem;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: var(--transition);
}

.mobile-toggle-sidebar:hover {
  background-color: var(--hover-bg);
  transform: scale(1.1);
}

.search-container {
  position: relative;
  flex: 1;
  max-width: 400px;
}

.search-icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--gray-medium);
  font-size: 1rem;
}

.search-input {
  width: 100%;
  padding: 8px 10px 8px 35px;
  border: 1px solid var(--gray-light);
  border-radius: var(--border-radius);
  font-size: 0.9rem;
  background-color: var(--white);
  color: var(--text-dark);
  transition: var(--transition);
}

.search-input:hover {
  border-color: var(--primary-color);
}

.search-input:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.2); /* Matches UserLoginPage */
  outline: none;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 15px;
}

.nav-item {
  position: relative;
}

.nav-icon {
  background: none;
  border: none;
  color: var(--text-dark);
  font-size: 1.2rem;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: var(--transition);
  min-width: 40px;
  min-height: 40px;
}

.nav-icon:hover {
  background-color: var(--hover-bg);
  color: var(--primary-color);
  transform: scale(1.1);
}

.theme-toggle {
  position: relative;
  width: 48px;
  height: 24px;
  padding: 0;
  border-radius: 12px;
  background-color: var(--gray-light);
  overflow: hidden;
}

.theme-toggle:hover {
  background-color: var(--gray-medium);
}

.theme-icon-wrapper {
  display: flex;
  align-items: center;
  width: 200%;
  height: 100%;
  transition: transform 0.3s ease;
}

.theme-icon-wrapper.dark {
  transform: translateX(-50%);
}

.theme-icon-wrapper .fa-sun,
.theme-icon-wrapper .fa-moon {
  width: 50%;
  text-align: center;
  font-size: 1rem;
  color: var(--text-dark);
}

.theme-icon-wrapper .fa-sun {
  color: #f1c40f;
}

.theme-icon-wrapper .fa-moon {
  color: #2196F3;
}

.notification-count {
  position: absolute;
  top: 0;
  right: 0;
  background-color: var(--accent-color);
  color: var(--white);
  border-radius: 50%;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: bold;
}

.notifications-dropdown {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  width: 300px;
  max-height: 350px;
  background-color: var(--white);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--gray-light);
  z-index: 1000;
  animation: fadeIn 0.2s ease-out;
}

.notifications-header {
  padding: 10px 15px;
  border-bottom: 1px solid var(--gray-light);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(90deg, #4CAF50, #2196F3); /* Matches sidebar-header */
  border-top-left-radius: var(--border-radius);
  border-top-right-radius: var(--border-radius);
}

.notifications-header h3 {
  font-size: 1rem;
  margin: 0;
  color: var(--white);
}

.notifications-header .mark-read {
  background: none;
  border: none;
  color: var(--white);
  font-size: 0.8rem;
  cursor: pointer;
  padding: 4px;
  transition: var(--transition);
}

.notifications-header .mark-read:hover {
  background-color: rgba(255, 255, 255, 0.2);
  transform: scale(1.05);
}

.notifications-dropdown ul {
  list-style: none;
  padding: 0;
  margin: 0;
  max-height: 250px;
  overflow-y: auto;
}

.notifications-dropdown ul li {
  padding: 10px 15px;
  border-bottom: 1px solid var(--gray-light);
  transition: var(--transition);
}

.notifications-dropdown ul li:hover {
  background-color: var(--hover-bg);
  transform: translateX(4px);
}

.notifications-dropdown ul li.unread {
  background-color: rgba(76, 175, 80, 0.05);
}

.notification-content {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.notification-content i {
  color: var(--primary-color);
  font-size: 1.1rem;
  margin-top: 2px;
}

.notification-title {
  font-weight: 600;
  margin: 0 0 4px;
  color: var(--dark-color);
  font-size: 0.9rem;
}

.notification-time {
  font-size: 0.75rem;
  color: var(--gray-medium);
  margin: 0;
}

.notifications-footer {
  padding: 10px;
  border-top: 1px solid var(--gray-light);
  text-align: center;
}

.notifications-footer button {
  background: none;
  border: none;
  color: var(--primary-color);
  font-weight: 600;
  cursor: pointer;
  padding: 5px;
  font-size: 0.85rem;
  transition: var(--transition);
}

.notifications-footer button:hover {
  background-color: var(--hover-bg);
  transform: scale(1.05);
}

.profile-menu {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 5px;
  border-radius: 50px;
  cursor: pointer;
  transition: var(--transition);
}

.profile-menu:hover {
  background-color: var(--hover-bg);
  transform: scale(1.02);
}

.profile-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.avatar-wrapper {
  position: relative;
  width: 36px;
  height: 36px;
}

.profile-pic {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--gray-light);
  transition: transform 0.3s ease;
}

.profile-menu:hover .profile-pic {
  transform: scale(1.05);
}

.active-status {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 2px solid var(--white);
  background-color: var(--gray-medium);
}

.active-status.online {
  background-color: var(--success-color);
}

.profile-name {
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--text-dark);
  white-space: nowrap;
}

.profile-arrow {
  font-size: 0.8rem;
  color: var(--text-dark);
  transition: transform 0.2s ease;
}

.profile-menu.profile-menu-open .profile-arrow {
  transform: rotate(180deg);
}

.profile-dropdown {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  width: 220px;
  background-color: white;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--gray-light);
  z-index: 1000;
  animation: fadeIn 0.2s ease-out;
}

.profile-dropdown ul {
  list-style: none;
  padding: 5px 0;
  margin: 0;
}

.profile-dropdown ul li {
  padding: 10px 15px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.9rem;
  color: var(--dark-color);
  cursor: pointer;
  transition: var(--transition);
}

.profile-dropdown ul li:hover {
  background-color: var(--hover-bg);
  color: var(--primary-color);
  transform: translateX(4px);
}

.profile-dropdown ul li i {
  width: 20px;
  color: var(--gray-medium);
}

.profile-dropdown ul li:hover i {
  color: var(--primary-color);
}

.profile-dropdown ul li.divider {
  padding: 0;
  border-top: 1px solid var(--gray-light);
  margin: 5px 0;
}

/* Content Area */
.content {
  flex-grow: 1;
  padding: 20px;
  background-color: var(--light-color);
  overflow-y: auto;
  animation: fadeIn 0.5s ease-out;
}

.content-header {
  margin-bottom: 20px;
}

.breadcrumbs {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  color: var(--gray-medium);
}

.breadcrumbs i {
  font-size: 0.7rem;
  opacity: 0.7;
}

.content-body {
  background-color: var(--white);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-sm);
  padding: 15px;
  min-height: calc(100vh - 120px);
}

/* Customer Query Dropdowns */
.dropdown-container {
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-width: 300px;
}

.dropdown-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-dark);
  margin-left: 6px;
}

.dropdown-wrapper {
  position: relative;
}

.dropdown-select,
.multi-select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--gray-light);
  border-radius: var(--border-radius);
  background-color: var(--white);
  color: var(--text-dark);
  font-size: 0.9rem;
  font-weight: 400;
  appearance: none;
  cursor: pointer;
  transition: var(--transition);
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23333' d='M2 4l4 4 4-4H2z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  background-size: 12px;
}

.dropdown-select:hover,
.multi-select:hover {
  border-color: var(--primary-color);
  background-color: var(--hover-bg);
}

.dropdown-select:focus,
.multi-select:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.2);
}

.dropdown-select.error,
.multi-select.error {
  border-color: var(--danger-color);
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23f44336' d='M2 4l4 4 4-4H2z'/%3E%3C/svg%3E");
}

.dark-theme .dropdown-select,
.dark-theme .multi-select {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23f5f7fa' d='M2 4l4 4 4-4H2z'/%3E%3C/svg%3E");
}

.dark-theme .dropdown-select.error,
.dark-theme .multi-select.error {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23f44336' d='M2 4l4 4 4-4H2z'/%3E%3C/svg%3E");
}

.dropdown-error {
  font-size: 0.8rem;
  color: var(--danger-color);
  margin-top: 6px;
  margin-left: 6px;
}

.multi-select {
  min-height: 48px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  padding: 8px 10px;
}

.selected-option {
  display: inline-flex;
  align-items: center;
  background-color: rgba(76, 175, 80, 0.1);
  color: var(--primary-color);
  padding: 6px 8px;
  border-radius: 12px;
  font-size: 0.85rem;
}

.selected-option .remove-option {
  margin-left: 6px;
  background: none;
  border: none;
  color: var(--primary-color);
  font-size: 0.8rem;
  cursor: pointer;
  padding: 0;
}

.selected-option .remove-option:hover {
  color: var(--danger-color);
}

/* Individual Customer Predictions Dropdown */
.prediction-dropdown {
  position: relative;
  max-width: 350px;
}

.prediction-dropdown.open .prediction-dropdown-menu {
  display: block;
  animation: fadeIn 0.2s ease-out;
}

.prediction-select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--gray-light);
  border-radius: var(--border-radius);
  background-color: var(--white);
  color: var(--text-dark);
  font-size: 0.9rem;
  font-weight: 400;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: var(--transition);
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23333' d='M2 4l4 4 4-4H2z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  background-size: 12px;
}

.prediction-select:hover {
  border-color: var(--primary-color);
  background-color: var(--hover-bg);
}

.prediction-select:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.2);
}

.dark-theme .prediction-select {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23f5f7fa' d='M2 4l4 4 4-4H2z'/%3E%3C/svg%3E");
}

.prediction-dropdown-menu {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  width: 100%;
  max-height: 250px;
  background-color: var(--white);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--gray-light);
  overflow-y: auto;
  z-index: 1000;
  display: none;
}

.prediction-dropdown-menu ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.prediction-dropdown-menu ul li {
  padding: 10px 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  color: var(--text-dark);
  cursor: pointer;
  transition: var(--transition);
}

.prediction-dropdown-menu ul li:hover {
  background-color: var(--hover-bg);
  transform: translateX(4px);
}

.prediction-dropdown-menu ul li.selected {
  background-color: rgba(76, 175, 80, 0.1);
  color: var(--primary-color);
  font-weight: 600;
}

.prediction-info {
  display: flex;
  flex-direction: column;
}

.prediction-info .customer-id {
  font-weight: 600;
  color: var(--text-dark);
}

.prediction-info .prediction-score {
  font-size: 0.8rem;
  color: var(--gray-medium);
}

.prediction-dropdown-menu ul li i {
  color: var(--primary-color);
  font-size: 1rem;
}

/* Logout Modal Styles */
.logout-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.4s ease-out;
}

.logout-modal-container {
  width: 100%;
  max-width: 420px;
  padding: 0 20px;
}

.logout-modal-content {
  background-color: var(--white);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
  text-align: center;
  padding: 32px;
  animation: scaleIn 0.3s ease-out;
}

.modal-icon-wrapper {
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
}

.modal-icon-wrapper .warning-icon {
  font-size: 64px;
  color: var(--warning-color);
  background: rgba(255, 152, 0, 0.1);
  width: 100px;
  height: 100px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--dark-color);
  margin: 0 0 12px;
}

.modal-message {
  color: var(--gray-dark);
  font-size: 1rem;
  line-height: 1.5;
  margin: 0 0 28px;
}

.modal-action-buttons {
  display: flex;
  gap: 16px;
  justify-content: center;
}

.modal-button {
  padding: 12px 24px;
  border-radius: 50px; /* Matches LandingPage buttons */
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: var(--transition);
  border: none;
  min-width: 120px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.modal-button:hover {
  transform: translateY(-2px);
}

.primary-button {
  background-color: var(--danger-color);
  color: var(--white);
}

.primary-button:hover {
  background-color: #d32f2f; /* Darker red */
  box-shadow: 0 4px 8px rgba(244, 67, 54, 0.3);
}

.secondary-button {
  background-color: var(--gray-light);
  color: var(--gray-dark);
}

.secondary-button:hover {
  background-color: #ccc;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.modal-transition-enter-active,
.modal-transition-leave-active {
  transition: opacity 0.3s ease;
}

.modal-transition-enter,
.modal-transition-leave-to {
  opacity: 0;
}

.modal-transition-enter .logout-modal-content,
.modal-transition-leave-to .logout-modal-content {
  transform: translateY(-20px);
}

/* Responsive Design */
@media (max-width: 768px) {
  .admin-dashboard {
    position: relative;
  }

  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    transform: translateX(-100%);
    width: 260px;
    animation: none;
  }

  .sidebar.sidebar-open {
    transform: translateX(0);
    animation: fadeInUp 0.4s ease-out;
  }

  .sidebar-collapsed .sidebar {
    width: 260px;
    transform: translateX(-100%);
  }

  .main-container {
    margin-left: 0;
  }

  .navbar {
    flex-direction: column;
    align-items: flex-start;
    padding: 15px;
    height: auto;
    min-height: var(--navbar-height);
    animation: fadeIn 0.4s ease-out;
  }

  .navbar-left {
    width: 100%;
    flex-direction: row;
    align-items: center;
    margin-bottom: 10px;
  }

  .mobile-toggle-sidebar {
    display: block;
    margin-right: 10px;
  }

  .search-container {
    max-width: 100%;
  }

  .nav-right {
    width: 100%;
    justify-content: flex-end;
  }

  .notifications-dropdown,
  .profile-dropdown,
  .prediction-dropdown-menu {
    right: 15px;
    width: 260px;
  }

  .content {
    padding: 15px;
  }

  .content-header {
    margin-bottom: 15px;
  }

  .content-body {
    padding: 10px;
  }

  .dropdown-container,
  .prediction-dropdown {
    max-width: 100%;
  }

  .logout-modal-container {
    max-width: 360px;
  }

  .theme-toggle {
    width: 40px;
    height: 20px;
  }

  .theme-icon-wrapper .fa-sun,
  .theme-icon-wrapper .fa-moon {
    font-size: 0.9rem;
  }
}

@media (max-width: 480px) {
  .sidebar {
    width: 100%;
    max-width: 300px;
  }

  .sidebar-collapsed .sidebar {
    width: 100%;
  }

  .sidebar-header {
    padding: 10px;
    min-height: 60px;
  }

  .logo-image,
  .logo-collapsed-image {
    width: 35px;
    height: 35px;
  }

  .logo-text {
    font-size: 1.2rem;
  }

  .menu-item,
  .dropdown-toggle {
    padding: 10px 12px;
    font-size: 0.9rem;
  }

  .submenu li {
    padding: 8px 25px;
    font-size: 0.85rem;
  }

  .sidebar-footer {
    padding: 10px;
  }

  .logout-button {
    padding: 8px;
    font-size: 0.85rem;
  }

  .navbar {
    padding: 10px;
  }

  .navbar-left {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .search-container {
    max-width: 100%;
  }

  .search-input {
    padding: 6px 8px 6px 30px;
    font-size: 0.85rem;
  }

  .search-icon {
    font-size: 0.9rem;
  }

  .nav-right {
    flex-wrap: wrap;
    gap: 8px;
  }

  .nav-icon {
    padding: 6px;
    font-size: 1.1rem;
  }

  .notification-count {
    width: 14px;
    height: 14px;
    font-size: 0.65rem;
  }

  .notifications-dropdown {
    width: 240px;
    max-height: 320px;
  }

  .notifications-header {
    padding: 8px 12px;
  }

  .notifications-header h3 {
    font-size: 0.95rem;
  }

  .notifications-header .mark-read {
    font-size: 0.75rem;
  }

  .notifications-dropdown ul li {
    padding: 8px 12px;
  }

  .notification-content .notification-title {
    font-size: 0.85rem;
  }

  .notification-content .notification-time {
    font-size: 0.7rem;
  }

  .notifications-footer {
    padding: 8px;
  }

  .notifications-footer button {
    font-size: 0.8rem;
  }

  .profile-menu .avatar-wrapper {
    width: 32px;
    height: 32px;
  }

  .profile-menu .profile-name {
    font-size: 0.85rem;
  }

  .profile-menu .profile-arrow {
    font-size: 0.75rem;
  }

  .profile-dropdown {
    width: 200px;
  }

  .profile-dropdown ul li {
    padding: 8px 12px;
    font-size: 0.85rem;
  }

  .content {
    padding: 10px;
  }

  .content-header {
    margin-bottom: 10px;
  }

  .content-header .breadcrumbs {
    font-size: 0.85rem;
  }

  .content-header .breadcrumbs i {
    font-size: 0.65rem;
  }

  .content-body {
    padding: 8px;
  }

  .dropdown-container,
  .prediction-dropdown {
    max-width: 100%;
  }

  .dropdown-label {
    font-size: 0.85rem;
  }

  .dropdown-select,
  .multi-select,
  .prediction-select {
    padding: 8px 10px;
    font-size: 0.85rem;
  }

  .dropdown-error {
    font-size: 0.75rem;
  }

  .selected-option {
    padding: 4px 6px;
    font-size: 0.8rem;
  }

  .selected-option .remove-option {
    font-size: 0.75rem;
  }

  .prediction-dropdown-menu {
    width: 240px;
    max-height: 220px;
  }

  .prediction-dropdown-menu ul li {
    padding: 8px 10px;
    font-size: 0.85rem;
  }

  .prediction-info .customer-id {
    font-size: 0.85rem;
  }

  .prediction-info .prediction-score {
    font-size: 0.75rem;
  }

  .prediction-dropdown-menu ul li i {
    font-size: 0.9rem;
  }

  .logout-modal-container {
    max-width: 320px;
  }

  .logout-modal-content {
    padding: 24px;
  }

  .modal-icon-wrapper .warning-icon {
    font-size: 48px;
    width: 80px;
    height: 80px;
  }

  .modal-title {
    font-size: 1.3rem;
  }

  .modal-message {
    font-size: 0.95rem;
  }

  .modal-button {
    padding: 10px 20px;
    font-size: 0.9rem;
    min-width: 100px;
  }

  .theme-toggle {
    width: 36px;
    height: 18px;
  }

  .theme-icon-wrapper .fa-sun,
  .theme-icon-wrapper .fa-moon {
    font-size: 0.8rem;
  }
}

/* Accessibility Enhancements */
@media (prefers-reduced-motion: reduce) {
  .admin-dashboard,
  .sidebar,
  .navbar,
  .content,
  .logout-modal-overlay,
  .logout-modal-content,
  .notifications-dropdown,
  .profile-dropdown,
  .prediction-dropdown-menu,
  .theme-icon-wrapper {
    animation: none;
  }

  .toggle-sidebar,
  .mobile-toggle-sidebar,
  .menu-item,
  .dropdown-toggle,
  .submenu li,
  .logout-button,
  .nav-icon,
  .mark-read,
  .notifications-footer button,
  .profile-menu,
  .profile-pic,
  .profile-dropdown li,
  .modal-button,
  .dropdown-select,
  .multi-select,
  .prediction-select,
  .selected-option .remove-option,
  .prediction-dropdown-menu li {
    transition: none;
    transform: none;
  }
}
</style>
