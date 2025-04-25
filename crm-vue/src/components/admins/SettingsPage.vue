<template>
  <div class="settings-page">
    <div class="settings-header">
      <h1 class="settings-title">Account Settings</h1>
      <p class="settings-subtitle">Manage your profile and security preferences</p>
    </div>

    <div class="settings-content">
      <!-- Profile Section -->
      <div class="settings-section">
        <div class="section-header">
          <div class="header-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
          <div>
            <h2 class="section-title">Profile Information</h2>
            <p class="section-description">Update your personal details and contact information</p>
          </div>
        </div>

        <form @submit.prevent="updateProfile" class="settings-form">
          <div class="form-group">
            <label for="name" class="form-label">Full Name</label>
            <div class="input-container">
              <input
                type="text"
                id="name"
                v-model="admin.name"
                placeholder="Enter your full name"
                required
                class="form-input"
              />
              <span class="input-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </span>
            </div>
          </div>

          <div class="form-group">
            <label for="email" class="form-label">Email Address</label>
            <div class="input-container">
              <input
                type="email"
                id="email"
                v-model="admin.email"
                placeholder="Enter your email"
                required
                class="form-input"
              />
              <span class="input-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
              </span>
            </div>
          </div>

          <div class="form-actions">
            <button
              type="submit"
              class="btn btn-primary"
              :disabled="isProfileLoading"
            >
              <span v-if="!isProfileLoading">Save Changes</span>
              <span v-else class="loading-spinner"></span>
            </button>
          </div>
        </form>
      </div>

      <!-- Security Section -->
      <div class="settings-section">
        <div class="section-header">
          <div class="header-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </div>
          <div>
            <h2 class="section-title">Security Settings</h2>
            <p class="section-description">Change your password and security preferences</p>
          </div>
        </div>

        <form @submit.prevent="updatePassword" class="settings-form">
          <div class="form-group">
            <label for="currentPassword" class="form-label">Current Password</label>
            <div class="input-container">
              <input
                :type="showCurrent ? 'text' : 'password'"
                id="currentPassword"
                v-model="passwords.current"
                placeholder="Enter current password"
                required
                class="form-input"
              />
              <span class="input-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </span>
              <button
                type="button"
                class="password-toggle"
                @click="showCurrent = !showCurrent"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path v-if="showCurrent" d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                  <path v-else d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              </button>
            </div>
          </div>

          <div class="form-group">
            <label for="newPassword" class="form-label">New Password</label>
            <div class="input-container">
              <input
                :type="showNew ? 'text' : 'password'"
                id="newPassword"
                v-model="passwords.new"
                placeholder="Enter new password"
                required
                class="form-input"
              />
              <span class="input-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </span>
              <button
                type="button"
                class="password-toggle"
                @click="showNew = !showNew"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path v-if="showNew" d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                  <path v-else d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              </button>
            </div>
            <div class="password-strength" v-if="passwords.new">
              <div class="strength-meter">
                <div class="strength-bar" :class="getPasswordStrengthClass"></div>
              </div>
              <span class="strength-text">{{ getPasswordStrengthText }}</span>
            </div>
          </div>

          <div class="form-group">
            <label for="confirmPassword" class="form-label">Confirm New Password</label>
            <div class="input-container">
              <input
                :type="showConfirm ? 'text' : 'password'"
                id="confirmPassword"
                v-model="passwords.confirm"
                placeholder="Confirm new password"
                required
                class="form-input"
              />
              <span class="input-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </span>
              <button
                type="button"
                class="password-toggle"
                @click="showConfirm = !showConfirm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path v-if="showConfirm" d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                  <path v-else d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              </button>
            </div>
          </div>

          <div class="form-actions">
            <button
              type="submit"
              class="btn btn-primary"
              :disabled="isPasswordLoading || passwords.new !== passwords.confirm"
            >
              <span v-if="!isPasswordLoading">Update Password</span>
              <span v-else class="loading-spinner"></span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Notification Toast -->
    <transition name="fade">
      <div v-if="notification.show" class="notification" :class="notification.type">
        <div class="notification-content">
          <div class="notification-icon">
            <svg v-if="notification.type === 'success'" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>
          <div class="notification-message">
            <p>{{ notification.message }}</p>
          </div>
          <button class="notification-close" @click="hideNotification">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "SettingsPage",
  data() {
    return {
      admin: { name: "", email: "" },
      passwords: { current: "", new: "", confirm: "" },
      showCurrent: false,
      showNew: false,
      showConfirm: false,
      isProfileLoading: false,
      isPasswordLoading: false,
      notification: {
        show: false,
        type: "", // 'success' or 'error'
        message: "",
        timeout: null
      }
    };
  },
  computed: {
    getPasswordStrengthClass() {
      if (!this.passwords.new) return "";
      const strength = this.calculatePasswordStrength(this.passwords.new);
      return `strength-${strength}`;
    },
    getPasswordStrengthText() {
      if (!this.passwords.new) return "";
      const strength = this.calculatePasswordStrength(this.passwords.new);
      const texts = ["Very Weak", "Weak", "Moderate", "Strong", "Very Strong"];
      return texts[strength - 1];
    }
  },
  async created() {
    await this.fetchAdminProfile();
  },
  methods: {
    calculatePasswordStrength(password) {
      let strength = 0;
      if (password.length >= 8) strength++;
      if (password.length >= 12) strength++;
      if (/[A-Z]/.test(password)) strength++;
      if (/[0-9]/.test(password)) strength++;
      if (/[^A-Za-z0-9]/.test(password)) strength++;
      return Math.min(5, strength);
    },
    async fetchAdminProfile() {
      const token = localStorage.getItem("authToken");
      console.log("Fetching profile with token:", token ? "Token exists" : "No token");
      if (!token) {
        this.showNotification("error", "Authentication token is missing. Please log in again.");
        this.$router.push("/login");
        return;
      }

      try {
        const response = await axios.get("http://localhost:5000/api/admin/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Profile response:", response.data);
        this.admin.name = response.data.name;
        this.admin.email = response.data.email;
      } catch (error) {
        console.error("Profile fetch error:", {
          message: error.message,
          response: error.response ? { status: error.response.status, data: error.response.data } : null
        });
        const message = error.response?.data?.message || "Failed to load profile data. Please try again.";
        this.showNotification("error", message);
        if (error.response?.status === 401) {
          localStorage.removeItem("authToken");
          this.$router.push("/login");
        }
      }
    },
    async updateProfile() {
      this.isProfileLoading = true;
      const token = localStorage.getItem("authToken");
      console.log("Updating profile with token:", token ? "Token exists" : "No token");

      if (!token) {
        this.showNotification("error", "Authentication token is missing. Please log in again.");
        this.$router.push("/login");
        this.isProfileLoading = false;
        return;
      }

      try {
        if (!this.admin.name || !this.admin.email) throw new Error("Name and email are required.");
        if (!/\S+@\S+\.\S+/.test(this.admin.email)) throw new Error("Invalid email format.");

        const response = await axios.put(
          "http://localhost:5000/api/admin/profile",
          { name: this.admin.name, email: this.admin.email },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log("Profile update response:", response.data);

        this.showNotification("success", response.data.message || "Profile updated successfully!");

        try {
          await axios.post(
            "http://localhost:5000/api/admin/users/send-notification",
            {
              email: this.admin.email,
              type: "account_updated",
              changes: { email: { new: this.admin.email } },
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          console.log("Notification email sent");
        } catch (notificationError) {
          console.warn("Failed to send notification email:", notificationError);
        }
      } catch (error) {
        console.error("Profile update error:", {
          message: error.message,
          response: error.response ? { status: error.response.status, data: error.response.data } : null
        });
        const message = error.response?.data?.message || error.message || "Failed to update profile.";
        this.showNotification("error", message);
        if (error.response?.status === 401) {
          localStorage.removeItem("authToken");
          this.$router.push("/login");
        }
      } finally {
        this.isProfileLoading = false;
      }
    },
    async updatePassword() {
      this.isPasswordLoading = true;
      const token = localStorage.getItem("authToken");
      console.log("Updating password with token:", token ? "Token exists" : "No token");

      if (!token) {
        this.showNotification("error", "Authentication token is missing. Please log in again.");
        this.$router.push("/login");
        this.isPasswordLoading = false;
        return;
      }

      try {
        if (!this.passwords.current || !this.passwords.new || !this.passwords.confirm)
          throw new Error("All password fields are required.");
        if (this.passwords.new !== this.passwords.confirm) throw new Error("New passwords do not match.");
        if (this.passwords.new.length < 8) throw new Error("New password must be at least 8 characters long.");

        const response = await axios.put(
          "http://localhost:5000/api/admin/password",
          { currentPassword: this.passwords.current, newPassword: this.passwords.new },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log("Password update response:", response.data);

        this.showNotification("success", response.data.message || "Password updated successfully!");
        this.passwords.current = "";
        this.passwords.new = "";
        this.passwords.confirm = "";
      } catch (error) {
        console.error("Password update error:", {
          message: error.message,
          response: error.response ? { status: error.response.status, data: error.response.data } : null
        });
        const message = error.response?.data?.message || error.message || "Failed to update password.";
        this.showNotification("error", message);
        if (error.response?.status === 401) {
          localStorage.removeItem("authToken");
          this.$router.push("/login");
        }
      } finally {
        this.isPasswordLoading = false;
      }
    },
    showNotification(type, message) {
      if (this.notification.timeout) {
        clearTimeout(this.notification.timeout);
      }

      this.notification = {
        show: true,
        type,
        message,
        timeout: setTimeout(() => {
          this.notification.show = false;
        }, 5000)
      };
    },
    hideNotification() {
      if (this.notification.timeout) {
        clearTimeout(this.notification.timeout);
      }
      this.notification.show = false;
    }
  }
};
</script>

<style scoped>
.settings-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  color: #1a202c;
}

.settings-header {
  margin-bottom: 3rem;
  text-align: center;
}

.settings-title {
  font-size: 2.25rem;
  font-weight: 700;
  color: #1a202c;
  margin-bottom: 0.5rem;
  line-height: 1.2;
}

.settings-subtitle {
  font-size: 1.125rem;
  color: #718096;
  margin: 0;
}

.settings-content {
  display: grid;
  gap: 2.5rem;
  max-width: 800px;
  margin: 0 auto;
}

.settings-section {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem 2rem;
  background: #f7fafc;
  border-bottom: 1px solid #edf2f7;
}

.header-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a202c;
  margin: 0 0 0.25rem 0;
}

.section-description {
  font-size: 0.875rem;
  color: #718096;
  margin: 0;
}

.settings-form {
  padding: 1.5rem 2rem 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #4a5568;
  margin-bottom: 0.5rem;
}

.input-container {
  position: relative;
}

.form-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 3rem;
  font-size: 0.9375rem;
  color: #1a202c;
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: #4299e1;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.2);
}

.input-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #a0aec0;
}

.password-toggle {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #a0aec0;
  cursor: pointer;
  padding: 0.25rem;
  transition: color 0.2s;
}

.password-toggle:hover {
  color: #4a5568;
}

.password-strength {
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.strength-meter {
  flex: 1;
  height: 4px;
  background: #e2e8f0;
  border-radius: 2px;
  overflow: hidden;
}

.strength-bar {
  height: 100%;
  width: 0%;
  transition: width 0.3s, background-color 0.3s;
}

.strength-1 {
  width: 20%;
  background-color: #e53e3e;
}

.strength-2 {
  width: 40%;
  background-color: #dd6b20;
}

.strength-3 {
  width: 60%;
  background-color: #d69e2e;
}

.strength-4 {
  width: 80%;
  background-color: #38a169;
}

.strength-5 {
  width: 100%;
  background-color: #2f855a;
}

.strength-text {
  font-size: 0.75rem;
  font-weight: 500;
  color: #4a5568;
}

.form-actions {
  margin-top: 2rem;
  display: flex;
  justify-content: flex-end;
}

.btn {
  padding: 0.75rem 1.5rem;
  font-size: 0.9375rem;
  font-weight: 500;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 120px;
}

.btn-primary {
  background-color: #4299e1;
  color: #ffffff;
}

.btn-primary:hover:not(:disabled) {
  background-color: #3182ce;
}

.btn-primary:disabled {
  background-color: #cbd5e0;
  cursor: not-allowed;
}

.loading-spinner {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #ffffff;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.notification {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  z-index: 1000;
  max-width: 400px;
  width: calc(100% - 4rem);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(0);
  transition: all 0.3s ease;
}

.notification.success {
  background: #f0fff4;
  border-left: 4px solid #38a169;
}

.notification.error {
  background: #fff5f5;
  border-left: 4px solid #e53e3e;
}

.notification-content {
  display: flex;
  align-items: center;
  padding: 1rem;
}

.notification-icon {
  margin-right: 1rem;
  flex-shrink: 0;
}

.notification-icon svg {
  width: 24px;
  height: 24px;
}

.notification.success .notification-icon svg {
  color: #38a169;
}

.notification.error .notification-icon svg {
  color: #e53e3e;
}

.notification-message {
  flex: 1;
  font-size: 0.9375rem;
  line-height: 1.5;
}

.notification-close {
  margin-left: 1rem;
  background: none;
  border: none;
  color: #a0aec0;
  cursor: pointer;
  padding: 0.25rem;
  transition: color 0.2s;
}

.notification-close:hover {
  color: #4a5568;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

@media (max-width: 768px) {
  .settings-page {
    padding: 1.5rem 1rem;
  }

  .settings-title {
    font-size: 1.75rem;
  }

  .settings-subtitle {
    font-size: 1rem;
  }

  .section-header {
    padding: 1.25rem 1.5rem;
  }

  .settings-form {
    padding: 1.25rem 1.5rem 1.5rem;
  }

  .notification {
    bottom: 1rem;
    right: 1rem;
    width: calc(100% - 2rem);
  }
}

@media (max-width: 480px) {
  .settings-header {
    margin-bottom: 2rem;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .header-icon {
    width: 40px;
    height: 40px;
  }

  .form-actions {
    justify-content: center;
  }

  .btn {
    width: 100%;
  }
}
</style>