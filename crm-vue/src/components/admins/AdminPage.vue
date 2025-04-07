<template>
  <div class="admin-dashboard" :class="{ 'sidebar-collapsed': isSidebarCollapsed }">
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
            <button class="nav-icon" @click="toggleDarkMode">
              <i :class="darkMode ? 'fas fa-sun' : 'fas fa-moon'"></i>
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
                <img :src="adminProfile.picture || defaultAvatar" alt="Profile" class="profile-pic" />
                <span class="active-status" :class="{ 'online': adminProfile.isOnline }"></span>
              </div>
              <span class="profile-name">{{ adminProfile.username }}</span>
            </div>
            <i class="fas fa-chevron-down profile-arrow"></i>
            <div v-if="profileMenuOpen" class="profile-dropdown">
              <ul>
                <li @click="triggerFileInput">
                  <i class="fas fa-user-edit"></i> Change Profile Picture
                  <input type="file" accept="image/*" @change="onProfilePicChange" class="profile-input" ref="fileInput" hidden />
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
import CreateSegmentsPage from './segments/CreateSegmentsPage.vue'; // New component
import ReportPage from './ReportPage.vue'; // New component
import SettingsPage from './SettingsPage.vue';
import ActivityLogPage from './ActivityLogPage.vue';
import AdvisoryPage from './AdvisoryPage.vue';
import debounce from 'lodash/debounce';

export default {
  components: { DashboardPage, UsersPage, SegmentPage, CreateSegmentsPage, ReportPage, SettingsPage, ActivityLogPage, AdvisoryPage },
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
        { id: 'users', label: 'User Management', icon: 'fas fa-users', hasNotification: true },
        {
          id: 'segmentation',
          label: 'Segmentation',
          icon: 'fas fa-chart-pie',
          hasNotification: false,
          isOpen: false,
          subItems: [
            { id: 'view-segments', label: 'View', icon: 'fas fa-eye' },
            { id: 'create-segment', label: 'Create Segment', icon: 'fas fa-plus' },
          ],
        },
        { id: 'reports', label: 'Reports', icon: 'fas fa-chart-bar', hasNotification: false }, // New Reports item
        { id: 'settings', label: 'System Settings', icon: 'fas fa-cogs', hasNotification: false },
        { id: 'activity', label: 'Activity Log', icon: 'fas fa-history', hasNotification: false },
        { id: 'advisory', label: 'Advisory', icon: 'fas fa-lightbulb', hasNotification: true },
      ],
      notifications: [
        { id: 1, title: 'New user registration', time: '2 mins ago', icon: 'fas fa-user-plus', read: false },
        { id: 2, title: 'System update available', time: '1 hour ago', icon: 'fas fa-download', read: false },
        { id: 3, title: 'Segmentation analysis complete', time: '3 hours ago', icon: 'fas fa-chart-pie', read: true },
        { id: 4, title: 'New advisory report generated', time: '1 day ago', icon: 'fas fa-file-alt', read: true },
      ],
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
        activity: ActivityLogPage,
        advisory: AdvisoryPage,
      }[this.currentTab] || DashboardPage;
    },
    currentTabLabel() {
      const item = this.menuItems.find(i => i.id === this.currentTab);
      if (item) return item.label;
      const parentItem = this.menuItems.find(i => i.subItems && i.subItems.some(sub => sub.id === this.currentTab));
      if (parentItem) {
        const subItem = parentItem.subItems.find(sub => sub.id === this.currentTab);
        return `${parentItem.label} - ${subItem.label}`;
      }
      return 'Dashboard';
    },
    unreadNotifications() {
      return this.notifications.filter(n => !n.read).length;
    },
  },
  created() {
    this.loadUserAvatar();
    this.fetchUserProfile();
    this.updateOnlineStatus();
    window.addEventListener('online', this.updateOnlineStatus);
    window.addEventListener('offline', this.updateOnlineStatus);

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
        const response = await fetch('http://localhost:3000/api/admin/profile', { // Update to your actual API
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        const data = await response.json();
        console.log('User Profile:', data);
        this.adminProfile.username = data.username || 'Admin';
        if (data.avatar) this.adminProfile.picture = data.avatar;
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    },
    toggleSidebar() {
      this.isSidebarCollapsed = !this.isSidebarCollapsed;
      if (!this.isSidebarCollapsed) this.sidebarOpen = false;
    },
    toggleSidebarMobile() {
      this.sidebarOpen = !this.sidebarOpen;
    },
    selectMenuItem(id) {
      const item = this.menuItems.find(i => i.id === id);
      if (!item.subItems) {
        this.currentTab = id;
        this.sidebarOpen = false;
        this.searchQuery = '';
      }
    },
    toggleDropdown(id) {
      const item = this.menuItems.find(i => i.id === id);
      if (item.subItems) {
        item.isOpen = !item.isOpen;
      }
    },
    selectSubMenuItem(subId) {
      this.currentTab = subId;
      this.sidebarOpen = false;
      this.searchQuery = '';
      const parentItem = this.menuItems.find(i => i.subItems && i.subItems.some(sub => sub.id === subId));
      if (parentItem) parentItem.isOpen = false; // Close dropdown after selection
    },
    loadUserAvatar() {
      const storedAvatar = localStorage.getItem('userAvatar');
      if (storedAvatar) this.adminProfile.picture = storedAvatar;
    },
    onProfilePicChange(event) {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = e => {
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
      if (this.searchQuery.trim()) {
        console.log(`Searching across ${this.currentTabLabel} for:`, this.searchQuery);
        this.$emit('update-search', this.searchQuery);
      } else {
        this.$emit('update-search', '');
      }
    },
    updateSearchResults(results) {
      console.log('Search results from child:', results);
    },
    toggleNotifications() {
      this.notificationsOpen = !this.notificationsOpen;
      this.profileMenuOpen = false;
    },
    toggleProfileMenu() {
      this.profileMenuOpen = !this.profileMenuOpen;
      this.notificationsOpen = false;
    },
    markAllAsRead() {
      this.notifications = this.notifications.map(n => ({ ...n, read: true }));
    },
    viewAllNotifications() {
      this.$router.push('/notifications');
    },
    navigateToProfile() {
      this.$router.push('/settings'); // Fixed route name
    },
    confirmLogout() {
      this.showLogoutModal = true;
      this.profileMenuOpen = false;
    },
    logout() {
      localStorage.removeItem('userAvatar');
      localStorage.removeItem('token');
      this.$router.push('/login');
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
        document.documentElement.classList.add('dark-theme');
      } else {
        document.documentElement.classList.remove('dark-theme');
      }
    },
  },
};
</script>
<style scoped lang="scss">
:root {
  --primary-color: #4361ee;
  --primary-light: #4895ef;
  --primary-dark: #3f37c9;
  --secondary-color: #3a0ca3;
  --accent-color: #f72585;
  --success-color: #4cc9f0;
  --warning-color: #f8961e;
  --danger-color: #ef233c;
  --dark-color: #2b2d42;
  --light-color: #f8f9fa;
  --gray-light: #e9ecef;
  --gray-medium: #adb5bd;
  --gray-dark: #495057;
  --white: #ffffff;
  --black: #212529;
  --sidebar-width: 260px;
  --sidebar-collapsed-width: 70px;
  --navbar-height: 60px;
  --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.12);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
  --border-radius: 8px;
}

.dark-theme {
  --primary-color: #4895ef;
  --primary-light: #4361ee;
  --primary-dark: #3f37c9;
  --secondary-color: #3a0ca3;
  --dark-color: #f8f9fa;
  --light-color: #2b2d42;
  --gray-light: #495057;
  --gray-medium: #adb5bd;
  --gray-dark: #e9ecef;
  --white: #212529;
  --black: #ffffff;
}

.admin-dashboard {
  display: flex;
  min-height: 100vh;
  background-color: var(--light-color);
  color: var(--dark-color);
  transition: var(--transition);
}

/* Sidebar Styles */
.sidebar {
  width: var(--sidebar-width);
  background-color: var(--white);
  color: var(--dark-color);
  display: flex;
  flex-direction: column;
  transition: width var(--transition);
  box-shadow: var(--shadow-md);
  z-index: 100;
}

.sidebar-collapsed .sidebar {
  width: var(--sidebar-collapsed-width);
}

.sidebar-header {
  padding: 15px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--gray-light);
  min-height: 70px;
}

.toggle-sidebar, .mobile-toggle-sidebar {
  background: none;
  border: none;
  color: var(--gray-dark);
  font-size: 1.2rem;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: var(--transition);
  &:hover {
    background-color: var(--gray-light);
    color: var(--primary-color);
  }
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-left: 10px;
}

.logo-image {
  width: 40px;
  height: 40px;
  object-fit: contain;
}

.logo-text {
  font-size: 1.4rem;
  font-weight: 700;
  .logo-primary { color: var(--primary-color); }
  .logo-secondary { color: var(--dark-color); }
}

.logo-collapsed-image {
  width: 40px;
  height: 40px;
  object-fit: contain;
}

.sidebar-menu {
  list-style: none;
  padding: 10px 0;
  margin: 0;
  flex-grow: 1;
}

.sidebar-menu li {
  margin: 5px 10px;
  border-radius: var(--border-radius);
  position: relative;
}

/* Menu Item (Regular Items) */
.menu-item {
  padding: 12px 15px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--gray-dark);
  transition: var(--transition);
  &:hover {
    background-color: var(--gray-light);
    color: var(--primary-color);
  }
}

/* Dropdown Toggle (Segmentation) */
.dropdown-toggle {
  padding: 12px 15px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--gray-dark);
  transition: var(--transition);
  position: relative;
  &:hover {
    background-color: var(--gray-light);
    color: var(--primary-color);
  }
  .dropdown-arrow {
    font-size: 0.8rem;
    margin-left: auto;
    transition: transform 0.3s;
    &.rotated {
      transform: rotate(180deg);
    }
  }
}

/* Submenu (View, Create Segment) */
.submenu {
  list-style: none;
  padding: 5px 0;
  margin: 0 0 5px 0;
  background-color: var(--gray-light);
  border-radius: var(--border-radius);
  li {
    padding: 10px 30px;
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 0.9rem;
    color: var(--gray-dark);
    cursor: pointer;
    transition: var(--transition);
    &:hover {
      background-color: var(--gray-medium);
      color: var(--primary-color);
    }
    &.active {
      background-color: rgba(67, 97, 238, 0.2);
      color: var(--primary-color);
      font-weight: 600;
    }
    i {
      font-size: 1rem;
      min-width: 20px;
    }
  }
}

/* Active State for Menu Items and Dropdown */
.sidebar-menu li.active > .menu-item,
.sidebar-menu li.active > .dropdown-toggle {
  background-color: rgba(67, 97, 238, 0.1);
  color: var(--primary-color);
  font-weight: 600;
}

/* Notification Badge */
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
  border-radius: var(--border-radius);
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
  display: flex;
  align-items: center;
  gap: 10px;
  &:hover { background-color: darken(#ef233c, 10%); }
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
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  box-shadow: var(--shadow-sm);
  z-index: 10;
}

/* Rest of the styles remain unchanged */
.navbar-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.mobile-toggle-sidebar {
  display: none;
}

.search-container {
  position: relative;
  flex: 1;
  max-width: 400px;
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
    transition: var(--transition);
    &:focus {
      border-color: var(--primary-color);
      box-shadow: 0 0 0 2px rgba(67, 97, 238, 0.2);
      outline: none;
    }
  }
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
  color: var(--gray-dark);
  font-size: 1.2rem;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: var(--transition);
  &:hover {
    background-color: var(--gray-light);
    color: var(--primary-color);
  }
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
  z-index: 1000;
  animation: fadeIn 0.2s ease-out;
  .notifications-header {
    padding: 10px 15px;
    border-bottom: 1px solid var(--gray-light);
    display: flex;
    justify-content: space-between;
    align-items: center;
    h3 {
      font-size: 1rem;
      margin: 0;
      color: var(--dark-color);
    }
    .mark-read {
      background: none;
      border: none;
      color: var(--primary-color);
      font-size: 0.8rem;
      cursor: pointer;
      &:hover { background-color: rgba(67, 97, 238, 0.1); }
    }
  }
  ul {
    list-style: none;
    padding: 0;
    margin: 0;
    max-height: 250px;
    overflow-y: auto;
    li {
      padding: 10px 15px;
      border-bottom: 1px solid var(--gray-light);
      transition: var(--transition);
      &:hover { background-color: var(--gray-light); }
      &.unread { background-color: rgba(67, 97, 238, 0.05); }
      .notification-content {
        display: flex;
        align-items: flex-start;
        gap: 10px;
        i { color: var(--primary-color); font-size: 1.1rem; margin-top: 2px; }
        .notification-title { font-weight: 500; margin: 0 0 4px; color: var(--dark-color); }
        .notification-time { font-size: 0.75rem; color: var(--gray-medium); margin: 0; }
      }
    }
  }
  .notifications-footer {
    padding: 10px;
    border-top: 1px solid var(--gray-light);
    text-align: center;
    button {
      background: none;
      border: none;
      color: var(--primary-color);
      font-weight: 500;
      cursor: pointer;
      padding: 5px;
      &:hover { background-color: rgba(67, 97, 238, 0.1); }
    }
  }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.profile-menu {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 5px;
  border-radius: 50px;
  cursor: pointer;
  transition: var(--transition);
  &:hover { background-color: var(--gray-light); }
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
    &.online { background-color: var(--success-color); }
  }
  .profile-name {
    font-weight: 600;
    font-size: 0.9rem;
    color: var(--dark-color);
    white-space: nowrap;
  }
  .profile-arrow {
    font-size: 0.8rem;
    color: var(--gray-medium);
    transition: transform 0.2s;
  }
  &.profile-menu-open .profile-arrow { transform: rotate(180deg); }
}

.profile-dropdown {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  width: 220px;
  background-color: var(--white);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-lg);
  z-index: 1000;
  animation: fadeIn 0.2s ease-out;
  ul {
    list-style: none;
    padding: 5px 0;
    margin: 0;
    li {
      padding: 10px 15px;
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 0.9rem;
      color: var(--dark-color);
      cursor: pointer;
      transition: var(--transition);
      i { width: 20px; color: var(--gray-medium); }
      &:hover {
        background-color: var(--gray-light);
        color: var(--primary-color);
        i { color: var(--primary-color); }
      }
      &.divider {
        padding: 0;
        border-top: 1px solid var(--gray-light);
        margin: 5px 0;
      }
    }
  }
}

/* Content Area */
.content {
  flex-grow: 1;
  padding: 20px;
  background-color: var(--light-color);
  overflow-y: auto;
}

.content-header {
  margin-bottom: 20px;
  .breadcrumbs {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.9rem;
    color: var(--gray-medium);
    i { font-size: 0.7rem; opacity: 0.7; }
  }
}

.content-body {
  background-color: var(--white);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-sm);
  padding: 15px;
  min-height: calc(100vh - 120px);
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
  backdrop-filter: blur(3px);
  transition: opacity 0.3s ease;
}

.logout-modal-container {
  width: 100%;
  max-width: 420px;
  padding: 0 20px;
}

.logout-modal-content {
  background-color: var(--white);
  border-radius: 12px;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  text-align: center;
  padding: 32px;
  transform: translateY(0);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.modal-icon-wrapper {
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
  .warning-icon {
    font-size: 64px;
    color: var(--warning-color);
    background: rgba(248, 150, 30, 0.1);
    width: 100px;
    height: 100px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 6px solid rgba(248, 150, 30, 0.2);
  }
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--dark-color);
  margin: 0 0 12px 0;
  line-height: 1.3;
}

.modal-message {
  color: var(--gray-dark);
  font-size: 1rem;
  line-height: 1.5;
  margin: 0 0 28px 0;
}

.modal-action-buttons {
  display: flex;
  gap: 16px;
  justify-content: center;
}

.modal-button {
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 500;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  min-width: 120px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.3);
  }
}

.primary-button {
  background-color: var(--danger-color);
  color: white;
  &:hover {
    background-color: darken(#ef233c, 8%);
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(239, 35, 60, 0.3);
  }
  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(239, 35, 60, 0.3);
  }
}

.secondary-button {
  background-color: var(--gray-light);
  color: var(--gray-dark);
  &:hover {
    background-color: darken(#e9ecef, 5%);
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
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
@media (max-width: 480px) {
  .logout-modal-content {
    padding: 24px;
  }
  .modal-icon-wrapper .warning-icon {
    width: 80px;
    height: 80px;
    font-size: 48px;
  }
  .modal-title {
    font-size: 1.3rem;
  }
  .modal-message {
    font-size: 0.95rem;
    margin-bottom: 24px;
  }
  .modal-action-buttons {
    flex-direction: column;
    gap: 12px;
  }
  .modal-button {
    width: 100%;
    padding: 12px;
  }
}
</style>