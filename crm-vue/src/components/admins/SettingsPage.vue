<template>
  <div class="settings-container">
    <h2 class="page-title">Account Settings</h2>

    <!-- Profile Settings Section -->
    <section class="settings-card">
      <div class="card-header">
        <h3>Profile Information</h3>
        <p class="subtitle">Update your personal details</p>
      </div>

      <form @submit.prevent="updateProfile" class="settings-form">
        <div class="form-group">
          <label for="name">Full Name</label>
          <input
            type="text"
            id="name"
            v-model="admin.name"
            placeholder="Enter your full name"
            required
          />
        </div>

        <div class="form-group">
          <label for="email">Email Address</label>
          <input
            type="email"
            id="email"
            v-model="admin.email"
            placeholder="Enter your email"
            required
          />
        </div>

        <button
          type="submit"
          class="action-btn primary"
          :disabled="isProfileLoading"
        >
          <span v-if="!isProfileLoading">Save Changes</span>
          <span v-else class="loading">Saving...</span>
        </button>
      </form>
    </section>

    <!-- Security Settings Section -->
    <section class="settings-card">
      <div class="card-header">
        <h3>Security</h3>
        <p class="subtitle">Manage your password</p>
      </div>

      <form @submit.prevent="updatePassword" class="settings-form">
        <div class="form-group">
          <label for="currentPassword">Current Password</label>
          <div class="password-input">
            <input
              :type="showCurrent ? 'text' : 'password'"
              id="currentPassword"
              v-model="passwords.current"
              placeholder="••••••••"
              required
            />
            <span
              class="toggle-icon"
              @click="showCurrent = !showCurrent"
            >
              <i :class="showCurrent ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
            </span>
          </div>
        </div>

        <div class="form-group">
          <label for="newPassword">New Password</label>
          <div class="password-input">
            <input
              :type="showNew ? 'text' : 'password'"
              id="newPassword"
              v-model="passwords.new"
              placeholder="••••••••"
              required
            />
            <span
              class="toggle-icon"
              @click="showNew = !showNew"
            >
              <i :class="showNew ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
            </span>
          </div>
        </div>

        <div class="form-group">
          <label for="confirmPassword">Confirm New Password</label>
          <div class="password-input">
            <input
              :type="showConfirm ? 'text' : 'password'"
              id="confirmPassword"
              v-model="passwords.confirm"
              placeholder="••••••••"
              required
            />
            <span
              class="toggle-icon"
              @click="showConfirm = !showConfirm"
            >
              <i :class="showConfirm ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
            </span>
          </div>
        </div>

        <button
          type="submit"
          class="action-btn primary"
          :disabled="isPasswordLoading"
        >
          <span v-if="!isPasswordLoading">Update Password</span>
          <span v-else class="loading">Updating...</span>
        </button>
      </form>
    </section>
  </div>
</template>

<script>
export default {
  name: "SettingsPage",
  data() {
    return {
      admin: {
        name: "Admin Name",
        email: "admin@example.com",
      },
      passwords: {
        current: "",
        new: "",
        confirm: "",
      },
      showCurrent: false,
      showNew: false,
      showConfirm: false,
      isProfileLoading: false,
      isPasswordLoading: false,
    };
  },
  methods: {
    async updateProfile() {
      this.isProfileLoading = true;
      try {
        // Add your API call here
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulated API call
        alert("Profile updated successfully!");
      } catch (error) {
        alert("Failed to update profile. Please try again.");
      } finally {
        this.isProfileLoading = false;
      }
    },
    async updatePassword() {
      this.isPasswordLoading = true;
      if (this.passwords.new !== this.passwords.confirm) {
        alert("Passwords do not match!");
        this.isPasswordLoading = false;
        return;
      }
      try {
        // Add your API call here
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulated API call
        alert("Password updated successfully!");
        this.passwords.current = "";
        this.passwords.new = "";
        this.passwords.confirm = "";
      } catch (error) {
        alert("Failed to update password. Please try again.");
      } finally {
        this.isPasswordLoading = false;
      }
    },
  },
};
</script>

<style scoped>
.settings-container {
  max-width: 800px;
  margin: 2rem auto;
  padding: 0 1rem;
}

.page-title {
  color: #2c3e50;
  font-size: 2.2rem;
  font-weight: 700;
  margin-bottom: 2rem;
  text-align: center;
}

.settings-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  margin-bottom: 2rem;
}

.card-header {
  margin-bottom: 1.5rem;
}

h3 {
  color: #2c3e50;
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: #7f8c8d;
  font-size: 0.95rem;
}

.settings-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

label {
  color: #2c3e50;
  font-weight: 500;
  font-size: 1rem;
}

input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  background-color: #fff;
  transition: border-color 0.3s, box-shadow 0.3s;
}

input:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 5px rgba(52, 152, 219, 0.3);
}

.password-input {
  position: relative;
}

.toggle-icon {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #7f8c8d;
  cursor: pointer;
  transition: color 0.3s;
}

.toggle-icon:hover {
  color: #3498db;
}

.action-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.2s;
  align-self: flex-start;
}

.action-btn.primary {
  background: #3498db;
  color: white;
}

.action-btn.primary:hover:not(:disabled) {
  background: #2980b9;
  transform: translateY(-2px);
}

.action-btn:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
  transform: none;
}

.loading {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .settings-container {
    margin: 1rem;
    padding: 0 0.5rem;
  }

  .settings-card {
    padding: 1.5rem;
  }

  .page-title {
    font-size: 1.8rem;
  }

  h3 {
    font-size: 1.3rem;
  }
}
</style>