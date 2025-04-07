<template>
  <div class="user-dashboard" :class="{ 'dark-mode': darkMode }">
    <!-- Header -->
    <header class="dashboard-header">
      <div class="header-left">
        <div class="logo">
          <i class="fas fa-chart-pie logo-icon"></i>
          <span class="logo-text">Segment Insights</span>
        </div>
      </div>
      <div class="header-right">
        <button class="theme-toggle" @click="toggleDarkMode">
          <i :class="darkMode ? 'fas fa-sun' : 'fas fa-moon'"></i>
        </button>
        <div class="user-profile" @click="toggleProfileMenu">
          <img :src="userProfile.avatar || defaultAvatar" alt="User Avatar" class="avatar" />
          <span class="username">{{ userProfile.name }}</span>
          <i class="fas fa-caret-down"></i>
          <div v-if="profileMenuOpen" class="profile-dropdown">
            <ul>
              <li @click="navigateToSettings">
                <i class="fas fa-cog"></i> Settings
              </li>
              <li @click="logout">
                <i class="fas fa-sign-out-alt"></i> Sign Out
              </li>
            </ul>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="dashboard-content">
      <!-- Welcome Section -->
      <section class="welcome-section">
        <h1>Welcome back, {{ userProfile.name }}!</h1>
        <p>Explore your customer segments and insights below.</p>
      </section>

      <!-- Quick Stats -->
      <section class="stats-grid">
        <div class="stat-card">
          <i class="fas fa-users stat-icon"></i>
          <h3>Total Customers</h3>
          <p class="stat-value">{{ stats.totalCustomers }}</p>
        </div>
        <div class="stat-card">
          <i class="fas fa-chart-line stat-icon"></i>
          <h3>Active Segments</h3>
          <p class="stat-value">{{ stats.activeSegments }}</p>
        </div>
        <div class="stat-card">
          <i class="fas fa-eye stat-icon"></i>
          <h3>Views This Month</h3>
          <p class="stat-value">{{ stats.monthlyViews }}</p>
        </div>
      </section>

      <!-- Segment Overview -->
      <section class="segment-overview">
        <div class="section-header">
          <h2>Your Segments</h2>
          <button class="view-all-btn" @click="viewAllSegments">View All</button>
        </div>
        <div class="segment-grid">
          <div v-for="segment in segments" :key="segment.id" class="segment-card">
            <h3>{{ segment.name }}</h3>
            <p class="segment-size">{{ segment.size }} customers</p>
            <div class="segment-progress">
              <div class="progress-bar" :style="{ width: segment.growth + '%' }"></div>
            </div>
            <p class="segment-growth" :class="{ 'positive': segment.growth > 0, 'negative': segment.growth < 0 }">
              {{ segment.growth > 0 ? '+' : '' }}{{ segment.growth }}% this month
            </p>
            <button class="details-btn" @click="viewSegmentDetails(segment.id)">Details</button>
          </div>
        </div>
      </section>

      <!-- Recent Activity -->
      <section class="activity-section">
        <h2>Recent Activity</h2>
        <ul class="activity-list">
          <li v-for="activity in recentActivities" :key="activity.id" class="activity-item">
            <i :class="activity.icon" class="activity-icon"></i>
            <div class="activity-details">
              <p class="activity-text">{{ activity.text }}</p>
              <span class="activity-time">{{ activity.time }}</span>
            </div>
          </li>
        </ul>
      </section>
    </main>

    <!-- Footer -->
    <footer class="dashboard-footer">
      <p>&copy; {{ currentYear }} Segment Insights. All rights reserved.</p>
      <div class="footer-links">
        <a href="#">Help</a>
        <a href="#">Privacy</a>
        <a href="#">Terms</a>
      </div>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'UserDashboard',
  data() {
    return {
      darkMode: false,
      profileMenuOpen: false,
      userProfile: {
        name: 'Jane Doe',
        avatar: '',
      },
      defaultAvatar: 'https://cdn-icons-png.flaticon.com/512/149/149071.png',
      stats: {
        totalCustomers: 1250,
        activeSegments: 8,
        monthlyViews: 3421,
      },
      segments: [
        { id: 1, name: 'Loyal Customers', size: 450, growth: 12 },
        { id: 2, name: 'New Users', size: 300, growth: 8 },
        { id: 3, name: 'At-Risk', size: 200, growth: -5 },
        { id: 4, name: 'High Spenders', size: 150, growth: 15 },
      ],
      recentActivities: [
        { id: 1, text: 'Updated segment "Loyal Customers"', icon: 'fas fa-user-check', time: '2 hours ago' },
        { id: 2, text: 'Viewed segment report', icon: 'fas fa-file-alt', time: 'Yesterday' },
        { id: 3, text: 'Added 50 new customers', icon: 'fas fa-user-plus', time: '2 days ago' },
      ],
    };
  },
  computed: {
    currentYear() {
      return new Date().getFullYear();
    },
  },
  created() {
    this.loadUserProfile();
    const savedTheme = localStorage.getItem('userTheme');
    if (savedTheme) {
      this.darkMode = savedTheme === 'dark';
      this.applyTheme();
    }
  },
  methods: {
    loadUserProfile() {
      // Simulate API call
      const storedAvatar = localStorage.getItem('userAvatar');
      if (storedAvatar) this.userProfile.avatar = storedAvatar;
    },
    toggleDarkMode() {
      this.darkMode = !this.darkMode;
      this.applyTheme();
      localStorage.setItem('userTheme', this.darkMode ? 'dark' : 'light');
    },
    applyTheme() {
      if (this.darkMode) {
        document.documentElement.classList.add('dark-mode');
      } else {
        document.documentElement.classList.remove('dark-mode');
      }
    },
    toggleProfileMenu() {
      this.profileMenuOpen = !this.profileMenuOpen;
    },
    navigateToSettings() {
      this.$router.push('/settings');
      this.profileMenuOpen = false;
    },
    logout() {
      localStorage.removeItem('userAvatar');
      localStorage.removeItem('token');
      this.$router.push('/login');
    },
    viewAllSegments() {
      this.$router.push('/segments');
    },
    viewSegmentDetails(segmentId) {
      this.$router.push(`/segments/${segmentId}`);
    },
  },
};
</script>

<style scoped lang="scss">
/* Base Variables */
$primary: #6b48ff;
$secondary: #1a202c;
$accent: #ff6b6b;
$background: #f7fafc;
$text: #2d3748;
$light: #ffffff;
$gray: #a0aec0;
$success: #48bb78;
$danger: #f56565;

/* Dark Mode Variables */
.dark-mode {
  $background: #1a202c;
  $text: #e2e8f0;
  $light: #2d3748;
  $gray: #718096;

  background-color: $background;
  color: $text;

  .dashboard-header,
  .stat-card,
  .segment-card,
  .activity-section,
  .dashboard-footer {
    background-color: $light;
    color: $text;
  }

  .profile-dropdown {
    background-color: $light;
  }

  .activity-item {
    border-bottom-color: darken($light, 10%);
  }
}

/* Mobile-first Styles */
.user-dashboard {
  min-height: 100vh;
  background-color: $background;
  color: $text;
  font-family: 'Inter', sans-serif;
  display: flex;
  flex-direction: column;
}

/* Header */
.dashboard-header {
  background-color: $light;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 10;
}

.header-left {
  display: flex;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.logo-icon {
  font-size: 1.5rem;
  color: $primary;
}

.logo-text {
  font-size: 1.25rem;
  font-weight: 700;
  color: $text;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.theme-toggle {
  background: none;
  border: none;
  font-size: 1.25rem;
  color: $gray;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  &:hover { background-color: rgba($gray, 0.1); }
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 1.5rem;
  &:hover { background-color: rgba($gray, 0.1); }
}

.avatar {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  object-fit: cover;
}

.username {
  font-weight: 600;
  font-size: 0.9rem;
  display: none;
}

.profile-dropdown {
  position: fixed;
  top: 3.5rem;
  right: 1rem;
  width: 180px;
  background-color: $light;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 100;
  ul {
    list-style: none;
    padding: 0.5rem 0;
    margin: 0;
    li {
      padding: 0.75rem 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.9rem;
      cursor: pointer;
      &:hover { background-color: rgba($gray, 0.1); }
      i { color: $gray; width: 1.25rem; }
    }
  }
}

/* Main Content */
.dashboard-content {
  flex-grow: 1;
  padding: 1rem;
}

/* Welcome Section */
.welcome-section {
  margin-bottom: 1.5rem;
  h1 {
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0 0 0.5rem;
  }
  p {
    font-size: 0.9rem;
    color: $gray;
    margin: 0;
  }
}

/* Stats Grid */
.stats-grid {
  display: grid;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.stat-card {
  background-color: $light;
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  text-align: center;
}

.stat-icon {
  font-size: 1.5rem;
  color: $primary;
  margin-bottom: 0.5rem;
}

.stat-card h3 {
  font-size: 0.9rem;
  font-weight: 600;
  margin: 0 0 0.25rem;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: $text;
  margin: 0;
}

/* Segment Overview */
.segment-overview {
  margin-bottom: 1.5rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  h2 {
    font-size: 1.25rem;
    font-weight: 700;
    margin: 0;
  }
}

.view-all-btn {
  background: none;
  border: none;
  color: $primary;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  &:hover { text-decoration: underline; }
}

.segment-grid {
  display: grid;
  gap: 1rem;
}

.segment-card {
  background-color: $light;
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.segment-card h3 {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.5rem;
}

.segment-size {
  font-size: 0.85rem;
  color: $gray;
  margin: 0 0 0.5rem;
}

.segment-progress {
  height: 0.5rem;
  background-color: $gray;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-bar {
  height: 100%;
  background-color: $primary;
  transition: width 0.3s ease;
}

.segment-growth {
  font-size: 0.85rem;
  margin: 0 0 0.75rem;
  &.positive { color: $success; }
  &.negative { color: $danger; }
}

.details-btn {
  width: 100%;
  padding: 0.5rem;
  background-color: $primary;
  color: $light;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  font-size: 0.9rem;
  cursor: pointer;
  &:hover { background-color: darken($primary, 10%); }
}

/* Activity Section */
.activity-section {
  h2 {
    font-size: 1.25rem;
    font-weight: 700;
    margin: 0 0 1rem;
  }
}

.activity-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid rgba($gray, 0.2);
}

.activity-icon {
  font-size: 1.25rem;
  color: $primary;
}

.activity-details {
  flex-grow: 1;
}

.activity-text {
  font-size: 0.9rem;
  margin: 0 0 0.25rem;
}

.activity-time {
  font-size: 0.75rem;
  color: $gray;
}

/* Footer */
.dashboard-footer {
  background-color: $light;
  padding: 1rem;
  text-align: center;
  font-size: 0.85rem;
  color: $gray;
  border-top: 1px solid rgba($gray, 0.2);
}

.footer-links {
  margin-top: 0.5rem;
  display: flex;
  justify-content: center;
  gap: 1rem;
  a {
    color: $primary;
    text-decoration: none;
    &:hover { text-decoration: underline; }
  }
}

/* Tablet (min-width: 768px) */
@media (min-width: 768px) {
  .dashboard-header {
    padding: 1rem 2rem;
  }

  .logo-icon {
    font-size: 1.75rem;
  }

  .logo-text {
    font-size: 1.5rem;
  }

  .avatar {
    width: 2.25rem;
    height: 2.25rem;
  }

  .username {
    display: block;
  }

  .profile-dropdown {
    position: absolute;
    top: 100%;
    right: 0;
  }

  .dashboard-content {
    padding: 2rem;
  }

  .welcome-section {
    margin-bottom: 2rem;
    h1 { font-size: 2rem; }
    p { font-size: 1rem; }
  }

  .stats-grid {
    grid-template-columns: repeat(3, 1fr);
    margin-bottom: 2rem;
  }

  .stat-card {
    padding: 1.5rem;
  }

  .stat-icon {
    font-size: 2rem;
  }

  .stat-card h3 {
    font-size: 1rem;
  }

  .stat-value {
    font-size: 1.5rem;
  }

  .section-header h2 {
    font-size: 1.5rem;
  }

  .segment-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .segment-card {
    padding: 1.5rem;
  }

  .segment-card h3 {
    font-size: 1.1rem;
  }

  .activity-section h2 {
    font-size: 1.5rem;
  }

  .activity-item {
    padding: 1rem 0;
  }

  .dashboard-footer {
    padding: 1.5rem 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}

/* Desktop (min-width: 1024px) */
@media (min-width: 1024px) {
  .dashboard-header {
    padding: 1.5rem 3rem;
  }

  .logo-icon {
    font-size: 2rem;
  }

  .avatar {
    width: 2.5rem;
    height: 2.5rem;
  }

  .dashboard-content {
    padding: 3rem;
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;
  }

  .welcome-section {
    margin-bottom: 3rem;
  }

  .stats-grid {
    gap: 1.5rem;
  }

  .stat-card {
    padding: 2rem;
  }

  .segment-grid {
    grid-template-columns: repeat(4, 1fr);
  }

  .segment-card {
    padding: 2rem;
  }

  .activity-section {
    max-width: 600px;
    margin: 0 auto;
  }
}
</style>