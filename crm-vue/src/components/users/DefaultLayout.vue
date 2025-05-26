<template>
  <div class="dashboard-container" :class="{ 'dark-mode': darkMode }">
    <!-- Mobile Menu Toggle Button -->
    <button
      v-if="isMobile"
      class="mobile-menu-toggle"
      @click="toggleSidebar"
      :aria-expanded="sidebarOpen"
      aria-label="Toggle sidebar menu"
    >
      <span v-html="SvgIcons.close ? SvgIcons.close : SvgIcons.menu"></span>
    </button>

    <!-- Sidebar Backdrop for Mobile -->
    <transition name="fade">
      <div
        v-if="sidebarOpen && isMobile"
        class="sidebar-backdrop"
        @click="toggleSidebar(false)"
        aria-hidden="true"
      ></div>
    </transition>

    <!-- Side Navigation -->
    <aside class="side-nav" :class="{ 'expanded': sidebarOpen }" aria-label="Main navigation">
      <div class="nav-header">
        <h1 class="logo">
          <router-link to="/dashboard">
            <span v-if="sidebarOpen || !isMobile">CustomerInsights</span>
            <span v-else>CI</span>
          </router-link>
        </h1>
        <button
          class="nav-toggle"
          @click="toggleSidebar"
          aria-label="Toggle sidebar"
          :aria-expanded="sidebarOpen"
        >
          <span v-html="sidebarOpen ? SvgIcons.chevronLeft : SvgIcons.chevronRight"></span>
        </button>
      </div>

      <div class="nav-menu">
        <router-link
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="nav-item"
          active-class="active"
          @click="handleNavClick"
          :aria-current="isActiveRoute(item.path) ? 'page' : null"
        >
          <span class="nav-icon" v-html="SvgIcons[item.icon]" :aria-label="item.text"></span>
          <span class="nav-text">{{ item.text }}</span>
          <span v-if="item.badge" class="nav-badge">{{ item.badge }}</span>
        </router-link>
      </div>

      <!-- Quick Access Section -->
      <div class="quick-access">
        <h3 class="section-title" v-if="sidebarOpen || !isMobile">Quick Access</h3>
        <div class="quick-access-items">
          <button 
            v-for="item in quickAccessItems" 
            :key="item.action"
            class="quick-access-item"
            @click="handleQuickAction(item.action)"
            :aria-label="item.text"
          >
            <span class="nav-icon" v-html="SvgIcons[item.icon]"></span>
            <span class="nav-text">{{ item.text }}</span>
          </button>
        </div>
      </div>

      <!-- Segment Health Monitoring -->
      <div class="segment-health">
        <h3 class="section-title" v-if="sidebarOpen || !isMobile">Segment Health</h3>
        <div class="health-metrics">
          <div 
            v-for="metric in segmentMetrics" 
            :key="metric.name"
            class="health-metric"
            @click="viewSegment(metric.segment)"
          >
            <div class="metric-info">
              <span class="metric-name">{{ metric.name }}</span>
              <span class="metric-value">{{ metric.value }}%</span>
            </div>
            <div class="metric-bar">
              <div 
                class="metric-fill" 
                :style="{ width: metric.value + '%' }"
                :class="getMetricClass(metric.value)"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div class="nav-footer">
        <button
          class="nav-item logout"
          @click="confirmLogout"
          aria-label="Sign out"
        >
          <span class="nav-icon" v-html="SvgIcons.logout"></span>
          <span class="nav-text">Sign Out</span>
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="main-content" :class="{ 'sidebar-expanded': sidebarOpen }">
      <!-- Top Bar -->
      <header class="top-bar">
        <div class="search-bar">
          <span v-html="SvgIcons.search"></span>
          <input
            type="text"
            placeholder="Search customers, reports..."
            v-model="searchQuery"
            @input="handleSearch"
            aria-label="Search customers and reports"
          />
          <button v-if="searchQuery" class="clear-search" @click="clearSearch" aria-label="Clear search">
            <span v-html="SvgIcons.clear"></span>
          </button>
        </div>

        <div class="top-bar-actions">
          <!-- Advisory Tools Dropdown -->
          <div class="advisory-tools">
            <button class="action-btn" @click="toggleAdvisoryTools" aria-expanded="advisoryToolsOpen">
              <span v-html="SvgIcons.tools"></span>
              <span>Advisory Tools</span>
              <span v-html="SvgIcons.arrowDown"></span>
            </button>

            <transition name="slide-down">
              <div v-if="advisoryToolsOpen" class="tools-dropdown" @click.stop>
                <button 
                  v-for="tool in advisoryTools" 
                  :key="tool.action"
                  class="dropdown-item"
                  @click="handleToolAction(tool.action)"
                >
                  <span class="dropdown-icon" v-html="SvgIcons[tool.icon]"></span>
                  <span>{{ tool.name }}</span>
                </button>
              </div>
            </transition>
          </div>

          <button
            class="action-btn"
            @click="refreshData"
            :disabled="loading"
            aria-label="Refresh data"
          >
            <span v-html="SvgIcons.refresh"></span>
            <span>Refresh</span>
          </button>

          <div class="time-filter">
            <select v-model="timeRange" @change="fetchData" aria-label="Select time range">
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
          </div>

          <!-- Data Quality Indicator -->
          <div class="data-quality" :class="dataQualityClass">
            <span v-html="SvgIcons.dataQuality"></span>
            <span>Data Quality: {{ dataQualityScore }}%</span>
          </div>

          <div class="notification-wrapper">
            <button
              class="notification-btn"
              @click="toggleNotifications"
              aria-label="View notifications"
              :aria-expanded="notificationsOpen"
            >
              <span v-html="SvgIcons.notifications"></span>
              <span v-if="unreadNotifications" class="badge">{{ unreadNotifications }}</span>
            </button>

            <transition name="slide-down">
              <div v-if="notificationsOpen" class="notifications-dropdown" @click.stop>
                <div class="dropdown-header">
                  <h3>Notifications</h3>
                  <button class="mark-all-read" @click="markAllAsRead">Mark all as read</button>
                </div>
                <div class="dropdown-divider"></div>
                <div v-if="notifications.length > 0" class="notifications-list">
                  <div
                    v-for="notification in notifications"
                    :key="notification.id"
                    class="notification-item"
                    :class="{ 'unread': !notification.read }"
                    @click="handleNotificationClick(notification)"
                  >
                    <div class="notification-icon" :class="notification.type">
                      <span v-html="SvgIcons[notification.icon]"></span>
                    </div>
                    <div class="notification-content">
                      <p>{{ notification.message }}</p>
                      <span class="notification-time">{{ notification.time }}</span>
                    </div>
                  </div>
                </div>
                <div v-else class="empty-notifications">
                  <span v-html="SvgIcons.notifications"></span>
                  <p>No new notifications</p>
                </div>
                <div class="dropdown-footer">
                  <router-link to="/notifications" @click="notificationsOpen = false">View all notifications</router-link>
                </div>
              </div>
            </transition>
          </div>

          <div class="user-profile" @click="toggleUserDropdown">
            <label for="avatar-upload" class="avatar-upload-label">
              <div class="avatar" :style="{ backgroundImage: user.avatar ? `url(${user.avatar})` : '' }">
                <span v-if="!user.avatar">{{ userInitials }}</span>
              </div>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                @change="handleAvatarUpload"
                style="display: none;"
              />
            </label>
            <div class="user-info">
              <div class="name">{{ user.name }}</div>
              <div class="role">{{ user.role }}</div>
            </div>
            <span class="dropdown-icon" v-html="SvgIcons.arrowDown"></span>

            <transition name="slide-down">
              <div v-if="userDropdownOpen" class="user-dropdown" @click.stop>
                <div class="dropdown-header">
                  <div class="avatar">{{ userInitials }}</div>
                  <div>
                    <div class="name">{{ user.name }}</div>
                    <div class="email">{{ user.email }}</div>
                  </div>
                </div>
                <div class="dropdown-divider"></div>
                <router-link to="/profile" class="dropdown-item" @click="userDropdownOpen = false">
                  <span class="dropdown-icon" v-html="SvgIcons.accountCircle"></span>
                  <span>My Profile</span>
                </router-link>
                <router-link to="/settings" class="dropdown-item" @click="userDropdownOpen = false">
                  <span class="dropdown-icon" v-html="SvgIcons.settings"></span>
                  <span>Settings</span>
                </router-link>
                <div class="dropdown-divider"></div>
                <button class="dropdown-item" @click="toggleDarkMode">
                  <span class="dropdown-icon" v-html="darkMode ? SvgIcons.lightMode : SvgIcons.darkMode"></span>
                  <span>{{ darkMode ? 'Light Mode' : 'Dark Mode' }}</span>
                </button>
                <div class="dropdown-divider"></div>
                <button class="dropdown-item logout" @click="confirmLogout">
                  <span class="dropdown-icon" v-html="SvgIcons.logout"></span>
                  <span>Sign Out</span>
                </button>
              </div>
            </transition>
          </div>
        </div>
      </header>

      <!-- Child Route Content -->
      <div class="content-wrapper">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </main>

    <!-- Logout Confirmation Modal -->
    <transition name="fade">
      <div v-if="showLogoutConfirmation" class="modal-overlay">
        <div class="modal-content">
          <h3>Confirm Logout</h3>
          <p>Are you sure you want to sign out?</p>
          <div class="modal-actions">
            <button class="cancel-btn" @click="showLogoutConfirmation = false">Cancel</button>
            <button class="confirm-btn" @click="logout">Sign Out</button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Loading Overlay -->
    <transition name="fade">
      <div v-if="loading" class="loading-overlay" role="status" aria-live="polite">
        <div class="spinner"></div>
        <p>Loading data...</p>
      </div>
    </transition>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { debounce } from 'lodash';
import { SvgIcons } from './icons';

export default {
  name: 'UsersDashboard',
  setup() {
    const router = useRouter();
    const route = useRoute();

    // State
    const sidebarOpen = ref(!(window.innerWidth < 1024));
    const isMobile = ref(window.innerWidth < 1024);
    const loading = ref(false);
    const searchQuery = ref('');
    const timeRange = ref('30d');
    const darkMode = ref(localStorage.getItem('darkMode') === 'true');
    const userDropdownOpen = ref(false);
    const notificationsOpen = ref(false);
    const advisoryToolsOpen = ref(false);
    const unreadNotifications = ref(3);
    const showLogoutConfirmation = ref(false);
    const avatarFile = ref(null);
    const avatarPreview = ref('');
    const dataQualityScore = ref(92);

    let pollInterval = null;

    // User data
    const user = ref({
      name: '',
      role: 'Senior Advisor',
      email: '',
      avatar: '',
    });

    // Navigation items
    const navItems = ref([
      { path: '/users-dashboard', text: 'Overview', icon: 'dashboard' },
      { path: '/clients', text: 'Customers', icon: 'people' },
      { path: '/segments', text: 'Segments', icon: 'category', badge: 2 },
      { path: '/analytics', text: 'Analytics', icon: 'insights' },
      { path: '/users-report', text: 'Reports', icon: 'description', badge: 1 },
      { path: '/user-settings', text: 'Settings', icon: 'settings' },
    ]);

    // Quick access items
    const quickAccessItems = ref([
      { text: 'New Segment', icon: 'addCircle', action: 'createSegment' },
      { text: 'Quick Report', icon: 'report', action: 'quickReport' },
      { text: 'Flag Issue', icon: 'flag', action: 'flagIssue' },
    ]);

    // Segment metrics
    const segmentMetrics = ref([
      { name: 'High Value', value: 82, segment: 'high-value' },
      { name: 'At Risk', value: 65, segment: 'at-risk' },
      { name: 'New Customers', value: 78, segment: 'new-customers' },
      { name: 'Inactive', value: 42, segment: 'inactive' },
    ]);

    // Advisory tools
    const advisoryTools = ref([
      { name: 'Segment Validator', icon: 'validation', action: 'validateSegment' },
      { name: 'Impact Simulator', icon: 'simulation', action: 'runSimulation' },
      { name: 'Policy Check', icon: 'policy', action: 'checkPolicy' },
      { name: 'Bias Detector', icon: 'bias', action: 'detectBias' },
    ]);

    // Notifications
    const notifications = ref([
      {
        id: 1,
        type: 'purchase',
        icon: 'shoppingCart',
        message: 'New high-value purchase recorded from customer #1005',
        time: '2 min ago',
        read: false,
        link: '/customers/1005',
      },
      {
        id: 2,
        type: 'segment',
        icon: 'category',
        message: 'Segment "High Potential" was updated with 12 new customers',
        time: '15 min ago',
        read: false,
        link: '/segments/high-potential',
      },
      {
        id: 3,
        type: 'alert',
        icon: 'notifications',
        message: 'High churn risk detected for 5 customers in "At Risk" segment',
        time: '1 hour ago',
        read: true,
        link: '/segments/at-risk',
      },
      {
        id: 4,
        type: 'system',
        icon: 'systemUpdate',
        message: 'Scheduled maintenance tonight at 2:00 AM (30 min downtime expected)',
        time: '3 hours ago',
        read: true,
        link: '/notifications',
      },
    ]);

    // Computed properties
    const userInitials = computed(() => {
      const names = user.value.name.split(' ');
      return names.map(name => name[0]).join('').toUpperCase();
    });

    const dataQualityClass = computed(() => {
      if (dataQualityScore.value >= 90) return 'excellent';
      if (dataQualityScore.value >= 75) return 'good';
      if (dataQualityScore.value >= 50) return 'fair';
      return 'poor';
    });

    const fetchUserProfile = async () => {
      try {
        loading.value = true;
        const token = localStorage.getItem('token');

        if (!token) {
          throw new Error('No token found in localStorage');
        }

        const response = await fetch('http://localhost:5000/api/user/profile', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch user profile');
        }

        const data = await response.json();
        user.value.name = data.username || 'Unknown User';
        user.value.email = data.email || 'No email provided';
      } catch (err) {
        console.error('Failed to fetch user profile:', err);
      } finally {
        loading.value = false;
      }
    };

    // Methods
    const toggleSidebar = (state = null) => {
      sidebarOpen.value = state !== null ? state : !sidebarOpen.value;
    };

    const handleNavClick = () => {
      if (isMobile.value) {
        toggleSidebar(false);
      }
    };

    const isActiveRoute = (path) => {
      return route.path === path || route.path.startsWith(path + '/');
    };

    const toggleUserDropdown = () => {
      userDropdownOpen.value = !userDropdownOpen.value;
      if (userDropdownOpen.value) {
        notificationsOpen.value = false;
        advisoryToolsOpen.value = false;
      }
    };

    const toggleNotifications = () => {
      notificationsOpen.value = !notificationsOpen.value;
      if (notificationsOpen.value) {
        userDropdownOpen.value = false;
        advisoryToolsOpen.value = false;
      }
    };

    const toggleAdvisoryTools = () => {
      advisoryToolsOpen.value = !advisoryToolsOpen.value;
      if (advisoryToolsOpen.value) {
        notificationsOpen.value = false;
        userDropdownOpen.value = false;
      }
    };

    const getMetricClass = (value) => {
      if (value >= 75) return 'high';
      if (value >= 50) return 'medium';
      return 'low';
    };

    const markAllAsRead = () => {
      notifications.value = notifications.value.map(n => ({ ...n, read: true }));
      unreadNotifications.value = 0;
    };

    const handleNotificationClick = (notification) => {
      if (!notification.read) {
        notification.read = true;
        unreadNotifications.value = Math.max(0, unreadNotifications.value - 1);
      }
      router.push(notification.link);
      notificationsOpen.value = false;
    };

    const closeAllDropdowns = (event) => {
      if (
        !event.target.closest('.user-profile') &&
        !event.target.closest('.notification-wrapper') &&
        !event.target.closest('.advisory-tools')
      ) {
        userDropdownOpen.value = false;
        notificationsOpen.value = false;
        advisoryToolsOpen.value = false;
      }
    };

    const toggleDarkMode = () => {
      darkMode.value = !darkMode.value;
      localStorage.setItem('darkMode', darkMode.value);
      document.body.classList.toggle('dark-mode', darkMode.value);
    };

    const fetchData = async () => {
      if (loading.value) return;
      loading.value = true;
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (err) {
        console.error('Failed to fetch data:', err);
      } finally {
        loading.value = false;
      }
    };

    const handleSearch = debounce(() => {
      router.push({ query: { search: searchQuery.value } });
    }, 300);

    const clearSearch = () => {
      searchQuery.value = '';
      router.push({ query: {} });
    };

    const refreshData = () => {
      fetchData();
    };

    const confirmLogout = () => {
      showLogoutConfirmation.value = true;
      userDropdownOpen.value = false;
    };

    const logout = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 500));
        stopPolling();
        showLogoutConfirmation.value = false;
        user.value = { name: '', role: '', email: '', avatar: '' };
        localStorage.removeItem('userToken');
        router.push('/user-login');
      } catch (err) {
        console.error('Logout failed:', err);
      }
    };

    const handleAvatarUpload = (event) => {
      const file = event.target.files[0];
      if (file) {
        if (file.size > 2 * 1024 * 1024) {
          alert('File size should be less than 2MB');
          return;
        }
        if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
          alert('Only JPEG, PNG, or GIF images are allowed');
          return;
        }

        avatarFile.value = file;
        const reader = new FileReader();
        reader.onload = (e) => {
          avatarPreview.value = e.target.result;
          user.value.avatar = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    };

    const handleQuickAction = (action) => {
      switch(action) {
        case 'createSegment':
          router.push('/new-segments');
          break;
        case 'quickReport':
          generateQuickReport();
          break;
        case 'flagIssue':
          openFlagModal();
          break;
      }
      if (isMobile.value) toggleSidebar(false);
    };

    const viewSegment = (segmentId) => {
      router.push(`/segments/${segmentId}`);
      if (isMobile.value) toggleSidebar(false);
    };

    const handleToolAction = (action) => {
      advisoryToolsOpen.value = false;
      switch(action) {
        case 'validateSegment':
          openValidator();
          break;
        case 'runSimulation':
          openSimulator();
          break;
        case 'checkPolicy':
          checkCompliance();
          break;
        case 'detectBias':
          scanForBias();
          break;
      }
    };

    const generateQuickReport = () => {
      console.log('Generating quick report...');
      // Implementation would go here
    };

    const openFlagModal = () => {
      console.log('Opening flag issue modal...');
      // Implementation would go here
    };

    const openValidator = () => {
      console.log('Opening segment validator...');
      // Implementation would go here
    };

    const openSimulator = () => {
      console.log('Opening impact simulator...');
      // Implementation would go here
    };

    const checkCompliance = () => {
      console.log('Checking policy compliance...');
      // Implementation would go here
    };

    const scanForBias = () => {
      console.log('Scanning for bias...');
      // Implementation would go here
    };

    const startPolling = () => {
      if (pollInterval) return;
      pollInterval = setInterval(fetchData, 30000);
    };

    const stopPolling = () => {
      if (pollInterval) {
        clearInterval(pollInterval);
        pollInterval = null;
      }
    };

    const handleResize = () => {
      isMobile.value = window.innerWidth < 1024;
      if (!isMobile.value && !sidebarOpen.value) {
        sidebarOpen.value = true;
      } else if (isMobile.value && sidebarOpen.value) {
        sidebarOpen.value = false;
      }
    };

    // Lifecycle hooks
    onMounted(() => {
      fetchUserProfile();
      fetchData();
      startPolling();
      window.addEventListener('resize', handleResize);
      window.addEventListener('click', closeAllDropdowns);
      document.body.classList.toggle('dark-mode', darkMode.value);
    });

    onUnmounted(() => {
      stopPolling();
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('click', closeAllDropdowns);
    });

    // Watchers
    watch(darkMode, () => {
      document.body.classList.toggle('dark-mode', darkMode.value);
    });

    watch(timeRange, () => {
      fetchData();
    });

    return {
      sidebarOpen,
      isMobile,
      loading,
      searchQuery,
      timeRange,
      darkMode,
      userDropdownOpen,
      notificationsOpen,
      advisoryToolsOpen,
      unreadNotifications,
      showLogoutConfirmation,
      dataQualityScore,
      dataQualityClass,
      user,
      navItems,
      quickAccessItems,
      segmentMetrics,
      advisoryTools,
      notifications,
      userInitials,
      SvgIcons,
      toggleSidebar,
      handleNavClick,
      isActiveRoute,
      toggleUserDropdown,
      toggleNotifications,
      toggleAdvisoryTools,
      getMetricClass,
      markAllAsRead,
      handleNotificationClick,
      toggleDarkMode,
      fetchData,
      handleSearch,
      clearSearch,
      refreshData,
      confirmLogout,
      logout,
      handleAvatarUpload,
      handleQuickAction,
      viewSegment,
      handleToolAction,
    };
  },
};
</script>

<style scoped lang="scss">
/* Color Variables */
$primary: #3b82f6;
$primary-dark: #60a5fa;
$background: #f9fafb;
$background-dark: #1f2937;
$text: #1f2937;
$text-dark: #e5e7eb;
$border: #e5e7eb;
$border-dark: #374151;
$success: #22c55e;
$warning: #f59e0b;
$danger: #ef4444;
$muted: #6b7280;
$muted-dark: #9ca3af;

/* Base Styles */
.dashboard-container {
  display: flex;
  min-height: 100vh;
  background-color: $background;
  transition: background-color 0.3s;

  &.dark-mode {
    background-color: $background-dark;
    color: $text-dark;
  }
}

/* SVG Icon Styles */
.nav-icon,
.dropdown-icon,
.notification-icon > span,
.action-btn > span,
.notification-btn > span,
.search-bar > span,
.clear-search > span,
.mobile-menu-toggle > span,
.nav-toggle > span {
  display: inline-block;
  width: 24px;
  height: 24px;
  vertical-align: middle;
  color: inherit;
}

/* Sidebar Styles */
.side-nav {
  width: 250px;
  background-color: white;
  border-right: 1px solid $border;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  position: fixed;
  top: 0;
  bottom: 0;
  z-index: 1000;

  .dark-mode & {
    background-color: $background-dark;
    border-right-color: $border-dark;
  }

  /* Collapsed state */
  &:not(.expanded) {
    width: 80px;

    .nav-text,
    .logo span:first-child,
    .section-title {
      opacity: 0;
      width: 0;
      overflow: hidden;
      position: absolute;
    }

    .logo span:last-child {
      display: inline;
    }
  }

  /* Mobile styles */
  @media (max-width: 1023px) {
    transform: translateX(-100%);

    &.expanded {
      transform: translateX(0);
    }
  }

  .nav-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem;
    border-bottom: 1px solid $border;
    min-height: 64px;

    .dark-mode & {
      border-bottom-color: $border-dark;
    }

    .logo {
      font-size: 1.5rem;
      font-weight: 600;
      margin: 0;
      white-space: nowrap;

      a {
        text-decoration: none;
        color: $text;

        .dark-mode & {
          color: $text-dark;
        }
      }

      span:last-child {
        display: none;
      }
    }

    .nav-toggle {
      background: none;
      border: none;
      cursor: pointer;
      color: $text;
      padding: 0.5rem;

      .dark-mode & {
        color: $text-dark;
      }

      &:hover {
        color: $primary;

        .dark-mode & {
          color: $primary-dark;
        }
      }
    }
  }

  .nav-menu {
    flex-grow: 1;
    padding: 1rem 0;
    overflow-y: auto;

    .nav-item {
      display: flex;
      align-items: center;
      padding: 0.75rem 1rem;
      color: $text;
      text-decoration: none;
      position: relative;
      white-space: nowrap;
      transition: all 0.3s ease;

      .dark-mode & {
        color: $text-dark;
      }

      &:hover,
      &.active {
        background-color: rgba($primary, 0.1);
        color: $primary;

        .dark-mode & {
          background-color: rgba($primary-dark, 0.1);
          color: $primary-dark;
        }
      }

      &.logout {
        color: $danger;

        &:hover {
          background-color: rgba($danger, 0.1);
        }
      }

      .nav-icon {
        margin-right: 1rem;
        flex-shrink: 0;
      }

      .nav-text {
        transition: opacity 0.3s ease;
      }

      .nav-badge {
        background-color: $danger;
        color: white;
        border-radius: 12px;
        padding: 0.2rem 0.5rem;
        font-size: 0.75rem;
        margin-left: auto;
      }
    }
  }

  /* Quick Access Section */
  .quick-access {
    padding: 1rem;
    border-top: 1px solid $border;
    border-bottom: 1px solid $border;

    .dark-mode & {
      border-color: $border-dark;
    }

    .section-title {
      font-size: 0.75rem;
      text-transform: uppercase;
      color: $muted;
      margin-bottom: 0.5rem;
      letter-spacing: 0.05em;

      .dark-mode & {
        color: $muted-dark;
      }
    }

    .quick-access-items {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .quick-access-item {
      display: flex;
      align-items: center;
      padding: 0.5rem;
      background: none;
      border: none;
      color: $text;
      cursor: pointer;
      border-radius: 4px;
      width: 100%;
      text-align: left;

      .dark-mode & {
        color: $text-dark;
      }

      &:hover {
        background-color: rgba($primary, 0.1);
        color: $primary;

        .dark-mode & {
          background-color: rgba($primary-dark, 0.1);
          color: $primary-dark;
        }
      }

      .nav-icon {
        margin-right: 0.75rem;
      }
    }
  }

  /* Segment Health Monitoring */
  .segment-health {
    padding: 1rem;

    .section-title {
      font-size: 0.75rem;
      text-transform: uppercase;
      color: $muted;
      margin-bottom: 0.5rem;
      letter-spacing: 0.05em;

      .dark-mode & {
        color: $muted-dark;
      }
    }

    .health-metrics {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .health-metric {
      cursor: pointer;
      transition: all 0.3s;

      &:hover {
        opacity: 0.9;
      }

      .metric-info {
        display: flex;
        justify-content: space-between;
        font-size: 0.75rem;
        margin-bottom: 0.25rem;
      }

      .metric-name {
        color: $text;

        .dark-mode & {
          color: $text-dark;
        }
      }

      .metric-value {
        font-weight: 600;
      }

      .metric-bar {
        height: 6px;
        background-color: $border;
        border-radius: 3px;
        overflow: hidden;

        .dark-mode & {
          background-color: $border-dark;
        }

        .metric-fill {
          height: 100%;
          transition: width 0.5s ease;

          &.high {
            background-color: $success;
          }

          &.medium {
            background-color: $warning;
          }

          &.low {
            background-color: $danger;
          }
        }
      }
    }
  }

  .nav-footer {
    padding: 1rem;
    border-top: 1px solid $border;

    .dark-mode & {
      border-top-color: $border-dark;
    }

    .nav-item {
      width: 100%;
      background: none;
      border: none;
      cursor: pointer;
    }
  }
}

/* Sidebar Backdrop */
.sidebar-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
}

/* Mobile Menu Toggle */
.mobile-menu-toggle {
  position: fixed;
  top: 1rem;
  left: 1rem;
  z-index: 1100;
  background: none;
  border: none;
  padding: 0.5rem;
  color: $text;
  cursor: pointer;
  background-color: white;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  .dark-mode & {
    color: $text-dark;
    background-color: $background-dark;
  }

  &:hover {
    color: $primary;

    .dark-mode & {
      color: $primary-dark;
    }
  }
}

/* Main Content */
.main-content {
  margin-left: 250px;
  flex-grow: 1;
  padding: 1.5rem;
  transition: margin-left 0.3s ease;

  &.sidebar-expanded {
    @media (max-width: 1023px) {
      margin-left: 0;
    }
  }

  @media (max-width: 1023px) {
    margin-left: 0;
  }
}

/* Top Bar */
.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;

  .search-bar {
    display: flex;
    align-items: center;
    background-color: white;
    border: 1px solid $border;
    border-radius: 8px;
    padding: 0.5rem;
    flex-grow: 1;
    max-width: 400px;
    transition: all 0.3s;

    .dark-mode & {
      background-color: $background-dark;
      border-color: $border-dark;
    }

    input {
      border: none;
      outline: none;
      flex-grow: 1;
      font-size: 0.875rem;
      background: transparent;
      color: $text;
      padding: 0.25rem;

      .dark-mode & {
        color: $text-dark;
      }

      &::placeholder {
        color: $muted;

        .dark-mode & {
          color: $muted-dark;
        }
      }
    }

    .clear-search {
      background: none;
      border: none;
      cursor: pointer;
      color: $muted;
      padding: 0.25rem;

      .dark-mode & {
        color: $muted-dark;
      }

      &:hover {
        color: $danger;
      }
    }

    &:focus-within {
      border-color: $primary;
      box-shadow: 0 0 0 2px rgba($primary, 0.2);

      .dark-mode & {
        border-color: $primary-dark;
        box-shadow: 0 0 0 2px rgba($primary-dark, 0.2);
      }
    }
  }

  .top-bar-actions {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: wrap;

    .action-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: none;
      border: 1px solid $border;
      border-radius: 6px;
      padding: 0.5rem 0.75rem;
      font-size: 0.875rem;
      cursor: pointer;
      color: $text;
      transition: all 0.2s;

      .dark-mode & {
        border-color: $border-dark;
        color: $text-dark;
      }

      &:hover {
        background-color: rgba($primary, 0.1);
        border-color: $primary;
        color: $primary;

        .dark-mode & {
          background-color: rgba($primary-dark, 0.1);
          border-color: $primary-dark;
          color: $primary-dark;
        }
      }

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }

/* Advisory Tools Dropdown - Updated styles */
.advisory-tools {
  position: relative;

  .action-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.6rem 1rem;
    border-radius: 8px;
    font-weight: 500;
    transition: all 0.2s;
    position: relative;
    padding-right: 2.5rem; /* Make room for arrow */

    /* Dropdown arrow */
    &::after {
      content: '';
      position: absolute;
      right: 1rem;
      top: 50%;
      transform: translateY(-50%);
      width: 16px;
      height: 16px;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%231f2937' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: center;
      transition: transform 0.2s;

      .dark-mode & {
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23e5e7eb' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
      }
    }

    &:hover::after {
      transform: translateY(-50%) rotate(180deg);
    }
  }

  /* When dropdown is open */
  &.open {
    .action-btn::after {
      transform: translateY(-50%) rotate(180deg);
    }
  }

  .tools-dropdown {
    /* ... (keep existing dropdown styles) ... */
    
    /* Add a small arrow pointing to the button */
    &::before {
      content: '';
      position: absolute;
      top: -6px;
      right: 1.5rem;
      width: 12px;
      height: 12px;
      background-color: white;
      transform: rotate(45deg);
      border-top: 1px solid $border;
      border-left: 1px solid $border;
      z-index: -1;

      .dark-mode & {
        background-color: $background-dark;
        border-color: $border-dark;
      }
    }
  }
}

    /* Time Filter */
/* Time Filter - Updated styles */
.time-filter {
  position: relative;
  
  select {
    background-color: white;
    border: 1px solid $border;
    border-radius: 8px;
    padding: 0.6rem 2.25rem 0.6rem 1rem; /* Adjusted right padding */
    font-size: 0.925rem;
    color: $text;
    cursor: pointer;
    appearance: none;
    transition: all 0.2s;
    min-width: 120px; /* Ensures consistent width */

    .dark-mode & {
      background-color: $background-dark;
      border-color: $border-dark;
      color: $text-dark;
    }

    /* Custom dropdown arrow */
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 0.75rem center;
    background-size: 1rem;

    .dark-mode & {
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
    }

    &:hover {
      border-color: darken($border, 10%);
      
      .dark-mode & {
        border-color: darken($border-dark, 10%);
      }
    }

    &:focus {
      outline: none;
      border-color: $primary;
      box-shadow: 0 0 0 2px rgba($primary, 0.2);

      .dark-mode & {
        border-color: $primary-dark;
        box-shadow: 0 0 0 2px rgba($primary-dark, 0.2);
      }
    }
  }

  /* For Firefox - ensure arrow is visible */
  @-moz-document url-prefix() {
    select {
      padding-right: 1.75rem;
      text-indent: 0.01px;
      text-overflow: '';
    }
  }
}

    /* Data Quality Indicator */
    .data-quality {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      padding: 0.5rem 0.75rem;
      border-radius: 6px;

      &.excellent {
        color: $success;
        background-color: rgba($success, 0.1);
      }

      &.good {
        color: $warning;
        background-color: rgba($warning, 0.1);
      }

      &.fair {
        color: $primary;
        background-color: rgba($primary, 0.1);
      }

      &.poor {
        color: $danger;
        background-color: rgba($danger, 0.1);
      }
    }

    /* Notifications */
    .notification-wrapper {
      position: relative;

      .notification-btn {
        position: relative;
        background: none;
        border: none;
        cursor: pointer;
        color: $text;
        padding: 0.5rem;

        .dark-mode & {
          color: $text-dark;
        }

        &:hover {
          color: $primary;

          .dark-mode & {
            color: $primary-dark;
          }
        }

        .badge {
          position: absolute;
          top: 0;
          right: 0;
          background-color: $danger;
          color: white;
          border-radius: 50%;
          width: 18px;
          height: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.625rem;
          font-weight: 600;
        }
      }

      .notifications-dropdown {
        position: absolute;
        top: 100%;
        right: 0;
        background-color: white;
        border: 1px solid $border;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        width: 320px;
        max-height: 400px;
        overflow-y: auto;
        z-index: 100;
        margin-top: 0.5rem;

        .dark-mode & {
          background-color: $background-dark;
          border-color: $border-dark;
        }

        .dropdown-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          border-bottom: 1px solid $border;

          .dark-mode & {
            border-bottom-color: $border-dark;
          }

          h3 {
            margin: 0;
            font-size: 1rem;
          }

          .mark-all-read {
            background: none;
            border: none;
            color: $primary;
            cursor: pointer;
            font-size: 0.875rem;

            .dark-mode & {
              color: $primary-dark;
            }

            &:hover {
              text-decoration: underline;
            }
          }
        }

        .dropdown-divider {
          height: 1px;
          background-color: $border;

          .dark-mode & {
            background-color: $border-dark;
          }
        }

        .notifications-list {
          .notification-item {
            display: flex;
            gap: 1rem;
            padding: 1rem;
            cursor: pointer;
            transition: background-color 0.2s;

            &:hover {
              background-color: rgba($primary, 0.05);

              .dark-mode & {
                background-color: rgba($primary-dark, 0.05);
              }
            }

            &.unread {
              background-color: rgba($primary, 0.1);

              .dark-mode & {
                background-color: rgba($primary-dark, 0.1);
              }
            }

            .notification-icon {
              width: 40px;
              height: 40px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              flex-shrink: 0;

              &.purchase {
                background-color: rgba($success, 0.1);
                color: $success;
              }

              &.segment {
                background-color: rgba($primary, 0.1);
                color: $primary;
              }

              &.alert {
                background-color: rgba($danger, 0.1);
                color: $danger;
              }

              &.system {
                background-color: rgba($warning, 0.1);
                color: $warning;
              }
            }

            .notification-content {
              flex-grow: 1;

              p {
                margin: 0 0 0.25rem;
                font-size: 0.875rem;
              }

              .notification-time {
                font-size: 0.75rem;
                color: $muted;

                .dark-mode & {
                  color: $muted-dark;
                }
              }
            }
          }
        }

        .empty-notifications {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 2rem 1rem;
          text-align: center;
          color: $muted;

          .dark-mode & {
            color: $muted-dark;
          }

          p {
            margin: 0.5rem 0 0;
          }
        }

        .dropdown-footer {
          padding: 0.75rem 1rem;
          text-align: center;
          border-top: 1px solid $border;

          .dark-mode & {
            border-top-color: $border-dark;
          }

          a {
            color: $primary;
            text-decoration: none;
            font-size: 0.875rem;

            .dark-mode & {
              color: $primary-dark;
            }

            &:hover {
              text-decoration: underline;
            }
          }
        }
      }
    }

    /* User Profile */
    .user-profile {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      cursor: pointer;
      position: relative;

      .avatar-upload-label {
        cursor: pointer;
      }

      .avatar {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background-color: rgba($primary, 0.1);
        display: flex;
        align-items: center;
        justify-content: center;
        color: $primary;
        font-weight: 600;
        background-size: cover;
        background-position: center;

        .dark-mode & {
          background-color: rgba($primary-dark, 0.1);
          color: $primary-dark;
        }
      }

      .user-info {
        display: flex;
        flex-direction: column;
        line-height: 1.2;

        .name {
          font-size: 0.875rem;
          font-weight: 500;
        }

        .role {
          font-size: 0.75rem;
          color: $muted;

          .dark-mode & {
            color: $muted-dark;
          }
        }
      }

      .user-dropdown {
        position: absolute;
        top: 100%;
        right: 0;
        background-color: white;
        border: 1px solid $border;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        width: 240px;
        z-index: 100;
        margin-top: 0.5rem;

        .dark-mode & {
          background-color: $background-dark;
          border-color: $border-dark;
        }

        .dropdown-header {
          display: flex;
          gap: 1rem;
          padding: 1rem;
          align-items: center;

          .avatar {
            width: 40px;
            height: 40px;
            flex-shrink: 0;
          }

          .name {
            font-weight: 600;
          }

          .email {
            font-size: 0.75rem;
            color: $muted;

            .dark-mode & {
              color: $muted-dark;
            }
          }
        }

        .dropdown-divider {
          height: 1px;
          background-color: $border;

          .dark-mode & {
            background-color: $border-dark;
          }
        }

        .dropdown-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          width: 100%;
          text-align: left;
          background: none;
          border: none;
          color: $text;
          cursor: pointer;
          font-size: 0.875rem;

          .dark-mode & {
            color: $text-dark;
          }

          &:hover {
            background-color: rgba($primary, 0.1);
            color: $primary;

            .dark-mode & {
              background-color: rgba($primary-dark, 0.1);
              color: $primary-dark;
            }
          }

          .dropdown-icon {
            color: $muted;

            .dark-mode & {
              color: $muted-dark;
            }
          }

          &.logout {
            color: $danger;

            &:hover {
              background-color: rgba($danger, 0.1);
            }
          }
        }
      }
    }
  }
}

/* Content Wrapper */
.content-wrapper {
  background-color: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  .dark-mode & {
    background-color: $background-dark;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  }
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.modal-content {
  background-color: white;
  border-radius: 8px;
  padding: 1.5rem;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

  .dark-mode & {
    background-color: $background-dark;
  }

  h3 {
    margin-top: 0;
    margin-bottom: 1rem;
  }

  p {
    margin-bottom: 1.5rem;
  }

  .modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;

    button {
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.875rem;
      transition: all 0.2s;

      &.cancel-btn {
        background: none;
        border: 1px solid $border;
        color: $text;

        .dark-mode & {
          border-color: $border-dark;
          color: $text-dark;
        }

        &:hover {
          background-color: rgba($muted, 0.1);
        }
      }

      &.confirm-btn {
        background-color: $danger;
        border: 1px solid $danger;
        color: white;

        &:hover {
          background-color: darken($danger, 5%);
        }
      }
    }
  }
}

/* Loading Overlay */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 2000;

  .dark-mode & {
    background-color: rgba(0, 0, 0, 0.8);
  }

  .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid rgba($primary, 0.1);
    border-radius: 50%;
    border-top-color: $primary;
    animation: spin 1s ease-in-out infinite;

    .dark-mode & {
      border-top-color: $primary-dark;
    }
  }

  p {
    margin-top: 1rem;
    color: $text;

    .dark-mode & {
      color: $text-dark;
    }
  }
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
  transform-origin: top;
}

.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Animations */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Responsive Adjustments */
@media (max-width: 768px) {
  .top-bar {
    flex-direction: column;
    align-items: stretch;

    .search-bar {
      max-width: 100%;
    }

    .top-bar-actions {
      justify-content: space-between;
    }
  }
}

@media (max-width: 480px) {
  .main-content {
    padding: 1rem;
  }

  .content-wrapper {
    padding: 1rem;
  }

  .top-bar-actions {
    .data-quality,
    .time-filter {
      display: none;
    }
  }
}
</style>