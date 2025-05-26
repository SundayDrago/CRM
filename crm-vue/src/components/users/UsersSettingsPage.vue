<template>
  <div class="user-settings">
    <!-- Header Section -->
    <div class="header">
      <h1>Account Settings</h1>
      <p>Manage your profile, security, and preferences</p>
    </div>

    <!-- Main Settings Grid -->
    <div class="settings-grid">
      <!-- Profile Card -->
      <div class="settings-card profile-card">
        <div class="card-header">
          <h2>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            Profile
          </h2>
        </div>

        <div class="avatar-section">
          <div class="avatar">
            <img v-if="user.avatar" :src="user.avatar" alt="Profile" />
            <div v-else class="avatar-fallback">
              {{ user.name.charAt(0).toUpperCase() }}
            </div>
          </div>
          <button class="upload-btn" @click="triggerFileUpload">
            Change Photo
            <input type="file" ref="fileInput" @change="handleAvatarUpload" accept="image/*" hidden />
          </button>
        </div>

        <form @submit.prevent="saveSettings">
          <div class="form-group">
            <label>Full Name</label>
            <input type="text" v-model="user.name" placeholder="John Doe" />
          </div>

          <div class="form-group">
            <label>Email</label>
            <input type="email" v-model="user.email" placeholder="john@example.com" disabled />
          </div>

          <div class="form-group">
            <label>Bio</label>
            <textarea v-model="user.bio" placeholder="Tell us about yourself..."></textarea>
          </div>
        </form>
      </div>

      <!-- Preferences Card -->
      <div class="settings-card preferences-card">
        <div class="card-header">
          <h2>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
            Preferences
          </h2>
        </div>

        <div class="form-group">
          <label>Theme</label>
          <div class="theme-selector">
            <button 
              v-for="theme in themes" 
              :key="theme.value" 
              :class="{ active: user.theme === theme.value }"
              @click="user.theme = theme.value"
            >
              <span class="theme-icon" :class="theme.value"></span>
              {{ theme.label }}
            </button>
          </div>
        </div>

        <div class="form-group">
          <label>Notifications</label>
          <div class="switch-group">
            <label class="switch">
              <input type="checkbox" v-model="user.notifications.email" />
              <span class="slider"></span>
              <span>Email Notifications</span>
            </label>
            <label class="switch">
              <input type="checkbox" v-model="user.notifications.push" />
              <span class="slider"></span>
              <span>Push Notifications</span>
            </label>
          </div>
        </div>

        <div class="form-group">
          <label>Language</label>
          <select v-model="user.language">
            <option v-for="lang in languages" :key="lang.code" :value="lang.code">
              {{ lang.name }}
            </option>
          </select>
        </div>
      </div>

      <!-- Security Card -->
      <div class="settings-card security-card">
        <div class="card-header">
          <h2>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
            Security
          </h2>
        </div>

        <div class="form-group">
          <label>Change Password</label>
          <input type="password" v-model="security.currentPassword" placeholder="Current Password" />
          <input type="password" v-model="security.newPassword" placeholder="New Password" />
          <input type="password" v-model="security.confirmPassword" placeholder="Confirm New Password" />
          <button class="btn-update" @click="updatePassword">Update Password</button>
        </div>

        <div class="two-factor">
          <label>Two-Factor Authentication</label>
          <div class="toggle-group">
            <span :class="{ active: user.twoFactorEnabled }">
              {{ user.twoFactorEnabled ? 'ON' : 'OFF' }}
            </span>
            <label class="switch">
              <input type="checkbox" v-model="user.twoFactorEnabled" />
              <span class="slider"></span>
            </label>
          </div>
        </div>
      </div>
    </div>

    <!-- Save Button -->
    <div class="action-buttons">
      <button class="btn-cancel" @click="resetChanges">Cancel</button>
      <button class="btn-save" @click="saveSettings" :disabled="isSaving">
        <span v-if="isSaving" class="spinner"></span>
        {{ isSaving ? 'Saving...' : 'Save Changes' }}
      </button>
    </div>

    <!-- Status Messages -->
    <div v-if="successMessage" class="alert success">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
      </svg>
      {{ successMessage }}
    </div>

    <div v-if="errorMessage" class="alert error">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
      {{ errorMessage }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'UserSettings',
  data() {
    return {
      user: {
        name: 'John Doe',
        email: 'john.doe@example.com',
        bio: 'Product designer and developer',
        avatar: null,
        theme: 'system',
        language: 'en',
        twoFactorEnabled: false,
        notifications: {
          email: true,
          push: true
        }
      },
      security: {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      },
      themes: [
        { value: 'light', label: 'Light' },
        { value: 'dark', label: 'Dark' },
        { value: 'system', label: 'System Default' }
      ],
      languages: [
        { code: 'en', name: 'English' },
        { code: 'es', name: 'Español' },
        { code: 'fr', name: 'Français' },
        { code: 'de', name: 'Deutsch' }
      ],
      isSaving: false,
      successMessage: '',
      errorMessage: ''
    }
  },
  methods: {
    triggerFileUpload() {
      this.$refs.fileInput.click();
    },
    handleAvatarUpload(event) {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.user.avatar = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    },
    async saveSettings() {
      this.isSaving = true;
      this.errorMessage = '';
      
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        this.successMessage = 'Your settings have been saved successfully!';
        setTimeout(() => this.successMessage = '', 5000);
      } catch (error) {
        this.errorMessage = 'Failed to save settings. Please try again.';
      } finally {
        this.isSaving = false;
      }
    },
    async updatePassword() {
      if (this.security.newPassword !== this.security.confirmPassword) {
        this.errorMessage = 'Passwords do not match';
        return;
      }
      
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        this.successMessage = 'Password updated successfully!';
        this.security = {
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        };
        setTimeout(() => this.successMessage = '', 5000);
      } catch (error) {
        this.errorMessage = 'Failed to update password';
      }
    },
    resetChanges() {
      // In a real app, you would reset to the original values from your data store
      this.user = {
        name: 'John Doe',
        email: 'john.doe@example.com',
        bio: 'Product designer and developer',
        avatar: null,
        theme: 'system',
        language: 'en',
        twoFactorEnabled: false,
        notifications: {
          email: true,
          push: true
        }
      };
      this.security = {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      };
      this.successMessage = '';
      this.errorMessage = '';
    }
  }
}
</script>

<style scoped>
.user-settings {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  color: #333;
}

.header {
  margin-bottom: 2.5rem;
}

.header h1 {
  font-size: 2.25rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: #1a202c;
}

.header p {
  font-size: 1.1rem;
  color: #4a5568;
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.settings-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  padding: 1.75rem;
  transition: transform 0.2s, box-shadow 0.2s;
}

.settings-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #edf2f7;
}

.card-header h2 {
  font-size: 1.5rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.card-header svg {
  width: 24px;
  height: 24px;
  color: #4a5568;
}

.profile-card .card-header svg { color: #4299e1; }
.preferences-card .card-header svg { color: #9f7aea; }
.security-card .card-header svg { color: #f56565; }

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 1.5rem;
}

.avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background-color: #edf2f7;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  margin-bottom: 1rem;
  border: 3px solid white;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-fallback {
  font-size: 2.5rem;
  font-weight: 600;
  color: #718096;
}

.upload-btn {
  background: none;
  border: none;
  color: #4299e1;
  font-weight: 500;
  cursor: pointer;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  transition: all 0.2s;
}

.upload-btn:hover {
  background: rgba(66, 153, 225, 0.1);
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: #4a5568;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s;
  background-color: #f7fafc;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #4299e1;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
  background-color: white;
}

.form-group textarea {
  min-height: 100px;
  resize: vertical;
}

.theme-selector {
  display: flex;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.theme-selector button {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
}

.theme-selector button:hover {
  border-color: #cbd5e0;
}

.theme-selector button.active {
  border-color: #4299e1;
  background: rgba(66, 153, 225, 0.05);
  box-shadow: 0 0 0 1px #4299e1;
}

.theme-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid #e2e8f0;
}

.theme-icon.light {
  background: linear-gradient(135deg, #ffffff 0%, #f7fafc 100%);
}

.theme-icon.dark {
  background: linear-gradient(135deg, #1a202c 0%, #2d3748 100%);
}

.theme-icon.system {
  background: linear-gradient(135deg, #ffffff 50%, #1a202c 50%);
}

.switch-group {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 0.5rem;
}

.switch {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
}

.slider {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
  background-color: #cbd5e0;
  border-radius: 24px;
  transition: all 0.3s;
}

.slider:before {
  content: "";
  position: absolute;
  width: 20px;
  height: 20px;
  left: 2px;
  bottom: 2px;
  background-color: white;
  border-radius: 50%;
  transition: all 0.3s;
}

input:checked + .slider {
  background-color: #4299e1;
}

input:checked + .slider:before {
  transform: translateX(26px);
}

.two-factor {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #edf2f7;
}

.toggle-group {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 0.5rem;
}

.toggle-group span {
  font-weight: 500;
  color: #718096;
}

.toggle-group span.active {
  color: #38a169;
}

.btn-update {
  width: 100%;
  padding: 0.75rem;
  background: #f7fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-weight: 500;
  color: #4a5568;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 1rem;
}

.btn-update:hover {
  background: #edf2f7;
}

.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.btn-cancel {
  padding: 0.75rem 1.5rem;
  background: #f7fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-weight: 500;
  color: #4a5568;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel:hover {
  background: #edf2f7;
}

.btn-save {
  padding: 0.75rem 1.5rem;
  background: #4299e1;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-save:hover:not(:disabled) {
  background: #3182ce;
}

.btn-save:disabled {
  background: #cbd5e0;
  cursor: not-allowed;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s linear infinite;
}

.alert {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  border-radius: 8px;
  margin-top: 1.5rem;
  animation: slideIn 0.3s ease-out;
}

.alert svg {
  flex-shrink: 0;
}

.alert.success {
  background: #f0fff4;
  color: #2f855a;
  border: 1px solid #c6f6d5;
}

.alert.error {
  background: #fff5f5;
  color: #c53030;
  border: 1px solid #fed7d7;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .user-settings {
    padding: 1.5rem;
  }
  
  .settings-grid {
    grid-template-columns: 1fr;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .btn-cancel,
  .btn-save {
    width: 100%;
  }
}
</style>