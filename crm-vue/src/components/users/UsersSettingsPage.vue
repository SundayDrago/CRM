<template>
  <div class="settings-container">
    <div class="settings-header">
      <h1 class="settings-title">Account Settings</h1>
      <p class="settings-subtitle">Manage your profile and security settings</p>
    </div>

    <div class="settings-content">
      <div class="settings-card">
        <div class="card-header">
          <h2 class="card-title">Profile Information</h2>
          <p class="card-description">Update your account's profile information and email address</p>
        </div>

        <form @submit.prevent="updateProfile" class="settings-form">
          <div class="form-section">
            <div class="form-group">
              <label for="name" class="form-label">Full Name</label>
              <div class="input-container">
                <input
                  id="name"
                  v-model="form.name"
                  type="text"
                  class="form-input"
                  placeholder="John Doe"
                  required
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
                  id="email"
                  v-model="form.email"
                  type="email"
                  class="form-input"
                  placeholder="john@example.com"
                  required
                />
                <span class="input-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                </span>
              </div>
            </div>
          </div>

          <div class="form-section">
            <h3 class="section-title">Security</h3>
            <div class="form-group">
              <label for="password" class="form-label">New Password</label>
              <div class="input-container">
                <input
                  id="password"
                  v-model="form.password"
                  type="password"
                  class="form-input"
                  placeholder="••••••••"
                />
                <span class="input-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                </span>
              </div>
              <p class="input-hint">Leave blank to keep current password</p>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" class="btn-secondary" @click="goBack">
              Cancel
            </button>
            <button type="submit" class="btn-primary" :disabled="loading">
              <span v-if="loading" class="button-loader"></span>
              {{ loading ? 'Saving...' : 'Save Changes' }}
            </button>
          </div>

          <div v-if="error" class="alert-error">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span>{{ error }}</span>
          </div>

          <div v-if="success" class="alert-success">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            <span>Profile updated successfully!</span>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

export default {
  name: 'UsersSettingsPage',
  setup() {
    const router = useRouter();
    const form = ref({
      name: '',
      email: '',
      password: '',
    });
    const loading = ref(false);
    const error = ref('');
    const success = ref(false);

    const fetchProfile = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/user', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        form.value.name = res.data.name;
        form.value.email = res.data.email;
      } catch (err) {
        error.value = 'Failed to load profile. Please try again later.';
        console.error('Fetch profile error:', err);
      }
    };

    const updateProfile = async () => {
      loading.value = true;
      error.value = '';
      success.value = false;
      try {
        const payload = { ...form.value };
        if (!payload.password) delete payload.password;

        await axios.put('http://localhost:5000/api/user', payload, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        success.value = true;
        setTimeout(() => success.value = false, 3000);
      } catch (err) {
        error.value = err.response?.data?.error || 'Failed to update profile. Please check your information and try again.';
        console.error('Update profile error:', err);
      } finally {
        loading.value = false;
      }
    };

    const goBack = () => {
      router.push('/users-dashboard');
    };

    fetchProfile();

    return {
      form,
      loading,
      error,
      success,
      updateProfile,
      goBack,
    };
  },
};
</script>

<style scoped>
.settings-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  color: #1a202c;
}

.settings-header {
  margin-bottom: 2.5rem;
  text-align: center;
}

.settings-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1a202c;
  margin-bottom: 0.5rem;
  line-height: 1.2;
}

.settings-subtitle {
  font-size: 1rem;
  color: #718096;
  margin: 0;
}

.settings-content {
  display: flex;
  justify-content: center;
}

.settings-card {
  width: 100%;
  max-width: 600px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.card-header {
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #edf2f7;
}

.card-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a202c;
  margin: 0 0 0.25rem 0;
}

.card-description {
  font-size: 0.875rem;
  color: #718096;
  margin: 0;
}

.settings-form {
  padding: 1.5rem 2rem 2rem;
}

.form-section {
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: #1a202c;
  margin: 0 0 1rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #edf2f7;
}

.form-group {
  margin-bottom: 1.25rem;
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
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  font-size: 0.9375rem;
  color: #1a202c;
  background-color: #f7fafc;
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

.input-hint {
  font-size: 0.75rem;
  color: #718096;
  margin: 0.25rem 0 0 0;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.btn-primary {
  padding: 0.75rem 1.5rem;
  font-size: 0.9375rem;
  font-weight: 500;
  color: #ffffff;
  background-color: #4299e1;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 120px;
}

.btn-primary:hover:not(:disabled) {
  background-color: #3182ce;
}

.btn-primary:disabled {
  background-color: #cbd5e0;
  cursor: not-allowed;
}

.btn-secondary {
  padding: 0.75rem 1.5rem;
  font-size: 0.9375rem;
  font-weight: 500;
  color: #4a5568;
  background-color: #edf2f7;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background-color: #e2e8f0;
}

.button-loader {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #ffffff;
  animation: spin 1s ease-in-out infinite;
  margin-right: 8px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.alert-error {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  margin-top: 1.5rem;
  font-size: 0.875rem;
  color: #9b2c2c;
  background-color: #fff5f5;
  border-radius: 8px;
}

.alert-success {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  margin-top: 1.5rem;
  font-size: 0.875rem;
  color: #2f855a;
  background-color: #f0fff4;
  border-radius: 8px;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .settings-container {
    padding: 1.5rem 1rem;
  }

  .settings-title {
    font-size: 1.75rem;
  }

  .card-header,
  .settings-form {
    padding: 1.25rem 1.5rem;
  }

  .form-actions {
    flex-direction: column-reverse;
    gap: 0.75rem;
  }

  .btn-primary,
  .btn-secondary {
    width: 100%;
  }
}
</style>