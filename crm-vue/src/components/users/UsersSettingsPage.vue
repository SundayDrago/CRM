<template>
  <div class="settings-container">
    <router-link to="/users-dashboard" class="back-button">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M15 18l-6-6 6-6"/>
      </svg>
      Back to Dashboard
    </router-link>

    <div class="settings-header">
      <h1 class="settings-title">Settings</h1>
      <p class="settings-subtitle">Customize your account preferences</p>
    </div>

    <div class="settings-card">
      <div class="card-content">
        <h2 class="card-title">Account Preferences</h2>
        <form @submit.prevent="updateSettings">
          <div class="form-group">
            <label for="username" class="form-label">Username</label>
            <div class="input-container">
              <input
                id="username"
                v-model="form.username"
                type="text"
                class="form-input"
                placeholder="Your username"
                required
              />
              <span class="input-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </span>
            </div>
          </div>

          <div class="form-group">
            <label for="theme" class="form-label">Theme Preference</label>
            <div class="input-container">
              <select
                id="theme"
                v-model="form.theme"
                class="form-input"
                required
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System</option>
              </select>
              <span class="input-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
              </span>
            </div>
          </div>

          <div class="form-group">
            <label for="notifications" class="form-label">Email Notifications</label>
            <div class="input-container">
              <select
                id="notifications"
                v-model="form.notifications"
                class="form-input"
                required
              >
                <option value="all">All Notifications</option>
                <option value="important">Important Only</option>
                <option value="none">None</option>
              </select>
              <span class="input-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
              </span>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" class="btn-secondary" @click="resetForm">Reset</button>
            <button type="submit" class="btn-primary" :disabled="loading">
              <span v-if="loading" class="button-loader"></span>
              {{ loading ? 'Saving...' : 'Save Settings' }}
            </button>
          </div>

          <div v-if="error" class="alert-error">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <span>{{ error }}</span>
          </div>

          <div v-if="success" class="alert-success">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            <span>Settings updated successfully!</span>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';

export default {
  name: 'UsersSettingsPage',
  setup() {
    const form = ref({
      username: '',
      theme: 'system',
      notifications: 'all',
    });

    const loading = ref(false);
    const error = ref('');
    const success = ref(false);
    const originalForm = ref({});

    const fetchSettings = async () => {
      try {
        // Simulated API call - replace with actual API call
        await new Promise(resolve => setTimeout(resolve, 300));

        const mockResponse = {
          username: 'CurrentUser123', // This would come from your API
          theme: 'system',
          notifications: 'all',
        };

        form.value = { ...mockResponse };
        originalForm.value = { ...mockResponse };
      } catch (err) {
        error.value = 'Failed to load settings.';
        setTimeout(() => error.value = '', 3000);
      }
    };

    const updateSettings = async () => {
      loading.value = true;
      error.value = '';
      success.value = false;

      try {
        // Simulated API call - replace with actual API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Update original form with new values
        originalForm.value = { ...form.value };
        success.value = true;
        setTimeout(() => success.value = false, 3000);
      } catch (err) {
        error.value = 'Failed to update settings.';
        setTimeout(() => error.value = '', 3000);
      } finally {
        loading.value = false;
      }
    };

    const resetForm = () => {
      form.value = { ...originalForm.value };
    };

    // Fetch settings when component mounts
    onMounted(() => {
      fetchSettings();
    });

    return {
      form,
      loading,
      error,
      success,
      updateSettings,
      resetForm,
    };
  },
};
</script>

<style>
.settings-container {
  max-width: 800px;
  margin: 2rem auto;
  padding: 0 1rem;
}

.settings-header {
  text-align: left;
  margin-bottom: 2rem;
  animation: slideIn 0.5s ease-out;
}

.settings-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1a202c;
  margin-bottom: 0.5rem;
}

.settings-subtitle {
  font-size: 1rem;
  color: #718096;
}

.back-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #4299e1;
  text-decoration: none;
  margin-bottom: 1.5rem;
  transition: color 0.3s ease;
}

.back-button:hover {
  color: #3182ce;
}

.back-button svg {
  width: 16px;
  height: 16px;
}

.settings-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  margin-bottom: 1.5rem;
  overflow: hidden;
  animation: fadeInUp 0.6s ease-out;
}

.card-content {
  padding: 1.5rem 2rem;
}

.card-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a202c;
  margin-bottom: 1rem;
  border-bottom: 1px solid #edf2f7;
  padding-bottom: 0.75rem;
}

.form-group {
  margin-bottom: 1.5rem;
  position: relative;
}

.form-label {
  display: block;
  font-size: 0.9rem;
  font-weight: 500;
  color: #4a5568;
  margin-bottom: 0.5rem;
  transition: color 0.3s ease;
}

.input-container {
  position: relative;
}

.form-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  font-size: 0.95rem;
  color: #2d3748;
  background-color: #f7fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  transition: all 0.3s ease;
  appearance: none;
}

.form-input:focus {
  outline: none;
  border-color: #4299e1;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
  background-color: white;
}

.input-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #a0aec0;
  transition: color 0.3s ease;
}

.input-icon svg {
  width: 18px;
  height: 18px;
}

.form-input:focus + .input-icon {
  color: #4299e1;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1rem 0;
}

.btn-primary {
  padding: 0.75rem 1.5rem;
  font-size: 0.95rem;
  font-weight: 500;
  color: white;
  background-color: #4299e1;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 120px;
}

.btn-primary:hover:not(:disabled) {
  background-color: #3182ce;
  transform: translateY(-1px);
}

.btn-primary:disabled {
  background-color: #cbd5e0;
  cursor: not-allowed;
}

.btn-secondary {
  padding: 0.75rem 1.5rem;
  font-size: 0.95rem;
  font-weight: 500;
  color: #4a5568;
  background-color: #edf2f7;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  background-color: #e2e8f0;
  transform: translateY(-1px);
}

.button-loader {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;
  margin-right: 8px;
}

.alert-error {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  margin-top: 1rem;
  font-size: 0.85rem;
  color: #9b2c2c;
  background-color: #fff5f5;
  border-radius: 8px;
  animation: slideIn 0.3s ease-out;
}

.alert-success {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  margin-top: 1rem;
  font-size: 0.85rem;
  color: #2f855a;
  background-color: #f0fff4;
  border-radius: 8px;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 640px) {
  .settings-container {
    margin: 1rem auto;
    padding: 0 0.75rem;
  }

  .settings-title {
    font-size: 1.75rem;
  }

  .card-content {
    padding: 1rem 1.5rem;
  }

  .form-actions {
    flex-direction: column;
    gap: 0.75rem;
  }

  .btn-primary,
  .btn-secondary {
    width: 100%;
  }
}
</style>