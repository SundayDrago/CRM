<!-- ProfilePage.vue -->
<template>
  <div class="profile-wrapper">
    <!-- Navigation Bar -->
    <nav class="navbar">
      <div class="navbar-left">
        <button
          class="sidebar-toggle"
          @click="toggleSidebar"
          aria-label="Toggle sidebar"
        >
          <span class="material-icons">menu</span>
        </button>
        <h1 class="logo">
          <span class="logo-icon">📊</span>
          <span class="logo-text">Customer Insights</span>
        </h1>
      </div>

      <div class="navbar-center">
        <span class="page-title">My Profile</span>
      </div>

      <div class="navbar-right">
        <div class="user-profile" @click="toggleDropdown">
          <div class="avatar">
            <img v-if="user?.avatar" :src="user.avatar" alt="User avatar">
            <span v-else>{{ userInitials }}</span>
          </div>
          <div class="user-info">
            <span class="user-name">{{ userName }}</span>
            <span class="user-role">{{ userRole }}</span>
          </div>
          <span class="material-icons dropdown-arrow">expand_more</span>

          <div v-if="showDropdown" class="dropdown-menu">
            <div class="dropdown-header">
              <div class="avatar-large">
                <img v-if="user?.avatar" :src="user.avatar" alt="User avatar">
                <span v-else>{{ userInitials }}</span>
              </div>
              <div>
                <div class="user-name-large">{{ userName }}</div>
                <div class="user-email">{{ userEmail }}</div>
              </div>
            </div>
            <div class="dropdown-divider"></div>
            <button @click="goToProfile" class="dropdown-item active">
              <span class="material-icons">account_circle</span>
              My Profile
            </button>
            <button @click="goToSettings" class="dropdown-item">
              <span class="material-icons">settings</span>
              Settings
            </button>
            <div class="dropdown-divider"></div>
            <button @click="logout" class="dropdown-item logout">
              <span class="material-icons">logout</span>
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- Sidebar -->
    <aside class="sidebar" :class="{ 'collapsed': !sidebarOpen }">
      <div class="sidebar-content">
        <nav class="sidebar-nav">
          <router-link
            v-for="item in navItems"
            :key="item.path"
            :to="item.path"
            class="sidebar-link"
            @click="toggleSidebar"
            active-class="active"
          >
            <span class="material-icons">{{ item.icon }}</span>
            <span class="link-text">{{ item.text }}</span>
            <span v-if="item.badge" class="link-badge">{{ item.badge }}</span>
          </router-link>
        </nav>

        <div class="sidebar-footer">
          <div class="app-info">
            <div class="app-version">v1.0.0</div>
            <div class="copyright">© 2023 Customer Insights</div>
          </div>
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="main-content" :class="{ 'expanded': !sidebarOpen }">
      <section class="profile-section card">
        <div class="section-header">
          <h2>Profile Information</h2>
          <p class="section-description">Update your personal details and profile picture.</p>
        </div>
        <form @submit.prevent="updateProfile" class="profile-form">
          <div class="form-group avatar-group">
            <label for="avatar">Profile Picture</label>
            <div class="avatar-upload">
              <div class="avatar-preview" @click="$refs.avatarInput.click()">
                <img v-if="previewAvatar || user?.avatar" :src="previewAvatar || user.avatar" alt="Avatar preview">
                <span v-else>{{ userInitials }}</span>
                <div class="avatar-overlay">
                  <span class="material-icons">camera_alt</span>
                </div>
              </div>
              <input
                type="file"
                id="avatar"
                accept="image/*"
                @change="handleAvatarUpload"
                ref="avatarInput"
                aria-label="Upload profile picture"
              />
              <div class="avatar-actions">
                <button type="button" class="upload-btn" @click="$refs.avatarInput.click()">
                  <span class="material-icons">upload</span>
                  Upload
                </button>
                <button
                  v-if="previewAvatar || user?.avatar"
                  type="button"
                  class="remove-btn"
                  @click="removeAvatar"
                  aria-label="Remove profile picture"
                >
                  <span class="material-icons">delete</span>
                  Remove
                </button>
              </div>
            </div>
          </div>
          <div class="form-grid">
            <div class="form-group">
              <label for="name">Full Name</label>
              <input
                type="text"
                id="name"
                v-model="form.name"
                required
                placeholder="Enter your full name"
                aria-label="Full name"
              />
            </div>
            <div class="form-group">
              <label for="email">Email Address</label>
              <input
                type="email"
                id="email"
                v-model="form.email"
                required
                placeholder="Enter your email"
                aria-label="Email address"
              />
            </div>
            <div class="form-group">
              <label for="role">Role</label>
              <input
                type="text"
                id="role"
                v-model="form.role"
                disabled
                aria-label="User role"
              />
            </div>
          </div>
          <div class="form-actions">
            <button type="submit" class="save-btn" :disabled="loading">
              <span class="material-icons">save</span>
              {{ loading ? 'Saving...' : 'Save Changes' }}
            </button>
            <button type="button" class="cancel-btn" @click="resetForm" :disabled="loading">
              <span class="material-icons">cancel</span>
              Cancel
            </button>
          </div>
        </form>
      </section>

      <section class="password-section card">
        <div class="section-header">
          <h2>Change Password</h2>
          <p class="section-description">Secure your account with a new password.</p>
        </div>
        <form @submit.prevent="changePassword" class="password-form">
          <div class="form-grid">
            <div class="form-group">
              <label for="current-password">Current Password</label>
              <input
                type="password"
                id="current-password"
                v-model="passwordForm.currentPassword"
                required
                placeholder="Enter current password"
                aria-label="Current password"
              />
            </div>
            <div class="form-group">
              <label for="new-password">New Password</label>
              <input
                type="password"
                id="new-password"
                v-model="passwordForm.newPassword"
                required
                placeholder="Enter new password"
                aria-label="New password"
              />
            </div>
            <div class="form-group">
              <label for="confirm-password">Confirm New Password</label>
              <input
                type="password"
                id="confirm-password"
                v-model="passwordForm.confirmPassword"
                required
                placeholder="Confirm new password"
                aria-label="Confirm new password"
              />
            </div>
          </div>
          <div class="form-actions">
            <button type="submit" class="save-btn" :disabled="passwordLoading">
              <span class="material-icons">lock</span>
              {{ passwordLoading ? 'Updating...' : 'Update Password' }}
            </button>
            <button type="button" class="cancel-btn" @click="resetPasswordForm" :disabled="passwordLoading">
              <span class="material-icons">cancel</span>
              Cancel
            </button>
          </div>
        </form>
      </section>
    </main>

    <!-- Loading Overlay -->
    <div v-if="loading || passwordLoading" class="loading-overlay">
      <div class="spinner"></div>
      <p>Loading...</p>
    </div>

    <!-- Error/Success Message -->
    <div v-if="error" class="error-message">
      {{ error }}
      <button @click="clearError" aria-label="Close error message">Close</button>
    </div>
    <div v-if="success" class="success-message">
      {{ success }}
      <button @click="clearSuccess" aria-label="Close success message">Close</button>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

export default {
  name: 'ProfilePage',
  setup() {
    const router = useRouter();

    // State
    const loading = ref(false);
    const passwordLoading = ref(false);
    const error = ref('');
    const success = ref('');
    const user = ref(null);
    const form = ref({
      name: '',
      email: '',
      role: '',
      avatar: null,
    });
    const passwordForm = ref({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    const previewAvatar = ref(null);
    const sidebarOpen = ref(true);
    const showDropdown = ref(false);
    const avatarInput = ref(null);
    const navItems = ref([
      { path: '/dashboard', icon: 'dashboard', text: 'Overview' },
      { path: '/clients', icon: 'people', text: 'Clients' },
      { path: '/analytics', icon: 'assessment', text: 'Analytics' },
      { path: '/reports', icon: 'description', text: 'Reports', badge: 3 },
      { path: '/settings', icon: 'settings', text: 'Settings' },
    ]);

    // Computed
    const userInitials = computed(() => {
      if (!user.value?.name) return 'U';
      const names = user.value.name.split(' ');
      return names.length > 1
        ? `${names[0][0]}${names[1][0]}`.toUpperCase()
        : names[0][0].toUpperCase();
    });

    const userName = computed(() => user.value?.name || 'User');
    const userEmail = computed(() => user.value?.email || '');
    const userRole = computed(() => user.value?.role || 'User');

    // Authentication Check
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/user-login');
        return false;
      }
      return true;
    };

    // Methods
    const fetchUser = async () => {
      if (!checkAuth()) return;
      loading.value = true;
      error.value = '';
      try {
        const res = await axios.get('http://localhost:5000/api/user', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        user.value = res.data;
        form.value = {
          name: res.data.name || '',
          email: res.data.email || '',
          role: res.data.role || 'User',
          avatar: res.data.avatar || null,
        };
      } catch (err) {
        error.value = err.response
          ? `Server error: ${err.response.status}`
          : 'Network error. Please check your connection.';
        console.error('Fetch error:', err);
      } finally {
        loading.value = false;
      }
    };

    const handleAvatarUpload = (event) => {
      const file = event.target.files[0];
      if (file) {
        if (!file.type.startsWith('image/')) {
          error.value = 'Please upload an image file.';
          return;
        }
        if (file.size > 2 * 1024 * 1024) {
          error.value = 'Image size must be less than 2MB.';
          return;
        }
        previewAvatar.value = URL.createObjectURL(file);
        form.value.avatar = file;
      }
    };

    const removeAvatar = () => {
      previewAvatar.value = null;
      form.value.avatar = null;
      if (user.value.avatar) {
        user.value.avatar = null;
      }
      if (avatarInput.value) {
        avatarInput.value.value = '';
      }
    };

    const updateProfile = async () => {
      if (!checkAuth()) return;
      if (!form.value.name || !form.value.email) {
        error.value = 'Name and email are required.';
        return;
      }
      loading.value = true;
      error.value = '';
      try {
        const formData = new FormData();
        formData.append('name', form.value.name);
        formData.append('email', form.value.email);
        if (form.value.avatar instanceof File) {
          formData.append('avatar', form.value.avatar);
        }

        const res = await axios.put('http://localhost:5000/api/user', formData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'multipart/form-data',
          },
        });
        user.value = res.data;
        form.value = {
          name: res.data.name,
          email: res.data.email,
          role: res.data.role,
          avatar: null,
        };
        previewAvatar.value = null;
        success.value = 'Profile updated successfully.';
      } catch (err) {
        error.value = err.response
          ? err.response.data.message || 'Failed to update profile.'
          : 'Network error. Please try again.';
        console.error('Update error:', err);
      } finally {
        loading.value = false;
      }
    };

    const changePassword = async () => {
      if (!checkAuth()) return;
      if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
        error.value = 'New passwords do not match.';
        return;
      }
      if (passwordForm.value.newPassword.length < 8) {
        error.value = 'New password must be at least 8 characters long.';
        return;
      }
      passwordLoading.value = true;
      error.value = '';
      try {
        await axios.post(
          'http://localhost:5000/api/user/change-password',
          {
            currentPassword: passwordForm.value.currentPassword,
            newPassword: passwordForm.value.newPassword,
          },
          {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          }
        );
        success.value = 'Password updated successfully.';
        resetPasswordForm();
      } catch (err) {
        error.value = err.response
          ? err.response.data.message || 'Failed to update password.'
          : 'Network error. Please try again.';
        console.error('Password change error:', err);
      } finally {
        passwordLoading.value = false;
      }
    };

    const resetForm = () => {
      form.value = {
        name: user.value?.name || '',
        email: user.value?.email || '',
        role: user.value?.role || 'User',
        avatar: null,
      };
      previewAvatar.value = null;
      if (avatarInput.value) {
        avatarInput.value.value = '';
      }
    };

    const resetPasswordForm = () => {
      passwordForm.value = {
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      };
    };

    const clearError = () => {
      error.value = '';
    };

    const clearSuccess = () => {
      success.value = '';
    };

    const toggleSidebar = () => {
      sidebarOpen.value = !sidebarOpen.value;
    };

    const toggleDropdown = () => {
      showDropdown.value = !showDropdown.value;
    };

    const goToProfile = () => {
      showDropdown.value = false;
      router.push('/profile');
    };

    const goToSettings = () => {
      showDropdown.value = false;
      router.push('/settings');
    };

    const logout = async () => {
      try {
        await axios.post(
          'http://localhost:5000/api/logout',
          {},
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        );
      } catch (err) {
        console.error('Logout error:', err);
      } finally {
        localStorage.removeItem('token');
        router.push('/user-login');
      }
    };

    onMounted(() => {
      checkAuth();
      fetchUser();
      document.addEventListener('click', closeDropdownOutside);
    });

    onUnmounted(() => {
      document.removeEventListener('click', closeDropdownOutside);
    });

    const closeDropdownOutside = (event) => {
      if (!event.target.closest('.user-profile')) {
        showDropdown.value = false;
      }
    };

    return {
      loading,
      passwordLoading,
      error,
      success,
      user,
      form,
      passwordForm,
      previewAvatar,
      sidebarOpen,
      showDropdown,
      avatarInput,
      navItems,
      userInitials,
      userName,
      userEmail,
      userRole,
      fetchUser,
      handleAvatarUpload,
      removeAvatar,
      updateProfile,
      changePassword,
      resetForm,
      resetPasswordForm,
      clearError,
      clearSuccess,
      toggleSidebar,
      toggleDropdown,
      goToProfile,
      goToSettings,
      logout,
    };
  },
};
</script>

<style scoped>
/* Base Variables */
:root {
  --primary-color: #4361ee;
  --primary-light: #eef2ff;
  --primary-dark: #3a56d0;
  --success-color: #4cc9f0;
  --danger-color: #f72585;
  --text-primary: #2b2d42;
  --text-secondary: #8d99ae;
  --divider-color: #edf2f4;
  --bg-color: #f8f9fa;
  --card-bg: #ffffff;
  --sidebar-bg: #ffffff;
  --header-bg: #ffffff;
  --hover-color: #f1f3f9;
  --active-color: #e6e9f5;
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
  --transition: all 0.3s ease;
}

/* Reset and Base Styles */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.profile-wrapper {
  min-height: 100vh;
  background: var(--bg-color);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  display: flex;
  flex-direction: column;
}

/* Navbar Styles */
.navbar {
  position: sticky;
  top: 0;
  z-index: 1000;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 1.5rem;
  height: 64px;
  background: var(--header-bg);
  box-shadow: var(--shadow-sm);
  transition: var(--transition);
}

.navbar-left,
.navbar-center,
.navbar-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.navbar-center {
  flex: 1;
  justify-content: center;
}

.page-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: -0.02em;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
}

.logo-icon {
  font-size: 1.5rem;
}

.logo-text {
  font-size: 1.25rem;
}

.sidebar-toggle {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-secondary);
  padding: 0.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: var(--transition);
}

.sidebar-toggle:hover {
  background: var(--hover-color);
  color: var(--primary-color);
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem;
  border-radius: 2rem;
  cursor: pointer;
  position: relative;
  transition: var(--transition);
}

.user-profile:hover {
  background: var(--hover-color);
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--primary-light);
  color: var(--primary-color);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  font-weight: 600;
  overflow: hidden;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-primary);
}

.user-role {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.dropdown-arrow {
  color: var(--text-secondary);
  font-size: 1.2rem;
  transition: transform 0.2s;
}

.user-profile:hover .dropdown-arrow {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: 56px;
  right: 0;
  width: 280px;
  background: var(--card-bg);
  border-radius: 0.75rem;
  box-shadow: var(--shadow-lg);
  z-index: 1000;
  overflow: hidden;
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.dropdown-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--primary-light);
}

.avatar-large {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--primary-light);
  color: var(--primary-color);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  font-weight: 600;
  overflow: hidden;
}

.avatar-large img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-name-large {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.user-email {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.dropdown-divider {
  height: 1px;
  background: var(--divider-color);
  margin: 0.25rem 0;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 100%;
  padding: 0.75rem 1rem;
  background: none;
  border: none;
  text-align: left;
  font-size: 0.9rem;
  color: var(--text-primary);
  cursor: pointer;
  transition: var(--transition);
}

.dropdown-item:hover {
  background: var(--hover-color);
}

.dropdown-item.active {
  background: var(--active-color);
  color: var(--primary-color);
}

.dropdown-item .material-icons {
  font-size: 1.2rem;
  color: var(--text-secondary);
}

.dropdown-item.active .material-icons {
  color: var(--primary-color);
}

.dropdown-item.logout {
  color: var(--danger-color);
}

.dropdown-item.logout .material-icons {
  color: var(--danger-color);
}

/* Sidebar Styles */
.sidebar {
  position: fixed;
  top: 64px;
  left: 0;
  bottom: 0;
  width: 240px;
  background: var(--sidebar-bg);
  box-shadow: var(--shadow-sm);
  z-index: 999;
  transition: transform 0.3s ease;
  overflow-y: auto;
}

.sidebar.collapsed {
  transform: translateX(-100%);
}

.sidebar-content {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 64px);
}

.sidebar-nav {
  flex: 1;
  padding: 1rem 0;
}

.sidebar-link {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1.5rem;
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 0.95rem;
  font-weight: 500;
  transition: var(--transition);
  position: relative;
}

.sidebar-link:hover {
  color: var(--primary-color);
  background: var(--hover-color);
}

.sidebar-link.active {
  color: var(--primary-color);
  background: var(--primary-light);
}

.sidebar-link.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: var(--primary-color);
  border-radius: 0 4px 4px 0;
}

.sidebar-link .material-icons {
  font-size: 1.2rem;
}

.link-text {
  flex: 1;
}

.link-badge {
  background: var(--danger-color);
  color: white;
  font-size: 0.7rem;
  padding: 0.2rem 0.5rem;
  border-radius: 1rem;
}

.sidebar-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--divider-color);
}

.app-info {
  font-size: 0.75rem;
  color: var(--text-secondary);
  text-align: center;
}

.app-version {
  margin-bottom: 0.25rem;
  font-weight: 500;
}

.copyright {
  opacity: 0.7;
}

/* Main Content */
.main-content {
  margin-left: 240px;
  margin-top: 64px;
  padding: 2rem;
  background: var(--bg-color);
  min-height: calc(100vh - 64px);
  transition: var(--transition);
}

.main-content.expanded {
  margin-left: 0;
}

/* Card Styles */
.card {
  background: var(--card-bg);
  padding: 2rem;
  border-radius: 16px;
  box-shadow: var(--shadow-md);
  margin-bottom: 2rem;
  transition: var(--transition);
}

.card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}

/* Section Header */
.section-header {
  margin-bottom: 1.5rem;
}

.section-header h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.02em;
}

.section-description {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-top: 0.5rem;
}

/* Profile Form */
.profile-form,
.password-form {
  max-width: 700px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-primary);
}

.form-group input {
  padding: 0.75rem 1rem;
  border: 1px solid var(--divider-color);
  border-radius: 10px;
  font-size: 0.95rem;
  color: var(--text-primary);
  background: #fafafa;
  transition: var(--transition);
}

.form-group input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px var(--primary-light);
  background: var(--card-bg);
}

.form-group input:disabled {
  background: var(--hover-color);
  color: var(--text-secondary);
  cursor: not-allowed;
}

.form-group input::placeholder {
  color: var(--text-secondary);
  opacity: 0.7;
}

/* Avatar Upload */
.avatar-group {
  grid-column: 1 / -1;
  margin-bottom: 1rem;
}

.avatar-upload {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.avatar-preview {
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: var(--primary-light);
  color: var(--primary-color);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  font-weight: 600;
  overflow: hidden;
  border: 3px solid var(--divider-color);
  cursor: pointer;
  transition: var(--transition);
}

.avatar-preview:hover {
  border-color: var(--primary-color);
}

.avatar-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: var(--transition);
}

.avatar-preview:hover .avatar-overlay {
  opacity: 1;
}

.avatar-overlay .material-icons {
  color: white;
  font-size: 2rem;
}

.avatar-upload input[type="file"] {
  display: none;
}

.avatar-actions {
  display: flex;
  gap: 1rem;
}

.upload-btn,
.remove-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
}

.upload-btn {
  background: var(--primary-color);
  color: white;
}

.upload-btn:hover {
  background: var(--primary-dark);
  transform: translateY(-1px);
}

.remove-btn {
  background: var(--danger-color);
  color: white;
}

.remove-btn:hover {
  background: #d61f74;
  transform: translateY(-1px);
}

/* Form Actions */
.form-actions {
  grid-column: 1 / -1;
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.save-btn,
.cancel-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
}

.save-btn {
  background: var(--primary-color);
  color: white;
}

.save-btn:hover:not(:disabled) {
  background: var(--primary-dark);
  transform: translateY(-1px);
}

.save-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.cancel-btn {
  background: var(--hover-color);
  color: var(--text-primary);
}

.cancel-btn:hover:not(:disabled) {
  background: var(--active-color);
  transform: translateY(-1px);
}

/* Loading Overlay */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.spinner {
  border: 4px solid var(--divider-color);
  border-top: 4px solid var(--primary-color);
  border-radius: 50%;
  width: 48px;
  height: 48px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loading-overlay p {
  color: white;
  font-size: 1rem;
  margin-top: 1rem;
}

/* Error and Success Messages */
.error-message,
.success-message {
  position: fixed;
  top: 80px;
  right: 2rem;
  max-width: 400px;
  padding: 1rem 1.5rem;
  border-radius: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: var(--shadow-md);
  z-index: 999;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.error-message {
  background: #fee2e2;
  color: #b91c1c;
}

.success-message {
  background: #e6f3fa;
  color: #1e6091;
}

.error-message button,
.success-message button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: var(--transition);
}

.error-message button {
  background: var(--danger-color);
  color: white;
}

.error-message button:hover {
  background: #d61f74;
}

.success-message button {
  background: var(--primary-color);
  color: white;
}

.success-message button:hover {
  background: var(--primary-dark);
}

/* Responsive Design */
@media (max-width: 1024px) {
  .sidebar {
    transform: translateX(-100%);
  }

  .sidebar.collapsed {
    transform: translateX(-100%);
  }

  .main-content {
    margin-left: 0;
  }

  .navbar-center {
    display: none;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .navbar {
    padding: 0 1rem;
  }

  .logo-text {
    display: none;
  }

  .user-info {
    display: none;
  }

  .main-content {
    padding: 1.5rem;
  }

  .card {
    padding: 1.5rem;
  }

  .section-header h2 {
    font-size: 1.3rem;
  }

  .avatar-preview {
    width: 100px;
    height: 100px;
    font-size: 2rem;
  }

  .avatar-upload {
    flex-direction: column;
    align-items: flex-start;
  }

  .error-message,
  .success-message {
    right: 1rem;
    max-width: calc(100% - 2rem);
  }
}

@media (max-width: 480px) {
  .logo-icon {
    font-size: 1.25rem;
  }

  .sidebar {
    width: 200px;
  }

  .dropdown-menu {
    width: 240px;
  }

  .form-actions {
    flex-direction: column;
    gap: 0.75rem;
  }

  .save-btn,
  .cancel-btn {
    width: 100%;
  }

  .avatar-preview {
    width: 80px;
    height: 80px;
    font-size: 1.5rem;
  }

  .upload-btn,
  .remove-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>