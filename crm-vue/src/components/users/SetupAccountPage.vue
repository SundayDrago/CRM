<template>
  <div class="setup-account-page">
    <div class="header">
      <h1>Setup Your Account</h1>
      <p>Enter your temporary password and set a new password to complete your account setup.</p>
    </div>

    <!-- Setup Form -->
    <form @submit.prevent="setupAccount" class="setup-form">
      <div class="form-group">
        <label for="temp-password">Temporary Password</label>
        <div class="input-wrapper">
          <input
            :type="showTempPassword ? 'text' : 'password'"
            id="temp-password"
            v-model="form.tempPassword"
            placeholder="Enter temporary password"
            required
          />
          <button type="button" class="toggle-password" @click="toggleTempPassword">
            <i :class="showTempPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
          </button>
        </div>
      </div>
      <div class="form-group">
        <label for="new-password">New Password</label>
        <div class="input-wrapper">
          <input
            :type="showNewPassword ? 'text' : 'password'"
            id="new-password"
            v-model="form.newPassword"
            placeholder="Enter new password"
            required
            minlength="8"
          />
          <button type="button" class="toggle-password" @click="toggleNewPassword">
            <i :class="showNewPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
          </button>
        </div>
      </div>
      <div class="form-buttons">
        <button type="submit" class="submit-button" :disabled="isSubmitting">
          <span v-if="!isSubmitting">Complete Setup</span>
          <div v-else class="spinner"></div>
        </button>
        <router-link to="/login" class="cancel-link">Cancel</router-link>
      </div>
      <transition name="fade">
        <p v-if="successMessage" class="success-message">{{ successMessage }}</p>
      </transition>
      <transition name="fade">
        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
      </transition>
    </form>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'SetupAccountPage',
  data() {
    return {
      form: {
        tempPassword: '',
        newPassword: '',
      },
      showTempPassword: false,
      showNewPassword: false,
      isSubmitting: false,
      successMessage: '',
      errorMessage: '',
    };
  },
  methods: {
    toggleTempPassword() {
      this.showTempPassword = !this.showTempPassword;
    },
    toggleNewPassword() {
      this.showNewPassword = !this.showNewPassword;
    },
    async setupAccount() {
      this.isSubmitting = true;
      this.successMessage = '';
      this.errorMessage = '';

      const token = this.$route.query.token; // Get token from URL query param
      if (!token) {
        this.errorMessage = 'No setup token provided. Please use the link from your invitation email.';
        this.isSubmitting = false;
        return;
      }

      // Trim tempPassword to avoid whitespace issues
      const trimmedTempPassword = this.form.tempPassword.trim();

      // Prepare payload
      const payload = {
        token,
        tempPassword: trimmedTempPassword,
        newPassword: this.form.newPassword,
        confirmPassword: this.form.newPassword,
      };

      // Log payload for debugging
      console.log('Sending payload:', payload);

      try {
        const response = await axios.post('http://localhost:5000/api/user/setup-account', payload);

        // Log response for debugging
        console.log('Backend response:', response.data);

        this.successMessage = response.data.message || 'Account setup successful! You can now log in.';
        this.form.tempPassword = '';
        this.form.newPassword = '';
        setTimeout(() => {
          this.$router.push('/user-login'); // Redirect to login after success
        }, 2000);
      } catch (error) {
        // Log full error for debugging
        console.error('Setup account error:', error.response ? error.response.data : error.message);

        // Use backend error message if available
        this.errorMessage =
          error.response?.data?.message ||
          'Failed to setup account. Please check your temporary password or request a new invitation.';
      } finally {
        this.isSubmitting = false;
      }
    },
  },
};
</script>

<style scoped lang="scss">
.setup-account-page {
  padding: 40px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
  font-family: 'Inter', sans-serif;
  max-width: 800px;
  margin: 0 auto;
}

.header {
  text-align: center;
  margin-bottom: 40px;
}

h1 {
  font-size: 32px;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
}

p {
  font-size: 16px;
  color: #7f8c8d;
}

.setup-form {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #34495e;
  margin-bottom: 8px;
}

.input-wrapper {
  position: relative;
}

input {
  width: 100%;
  padding: 12px 40px 12px 16px;
  border: 1px solid #dcdcdc;
  border-radius: 8px;
  font-size: 15px;
  color: #2c3e50;
  box-sizing: border-box;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

input:focus {
  border-color: #3498db;
  box-shadow: 0 0 8px rgba(52, 152, 219, 0.2);
  outline: none;
}

.toggle-password {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #7f8c8d;
  cursor: pointer;
  font-size: 16px;
}

.toggle-password:hover {
  color: #3498db;
}

.form-buttons {
  display: flex;
  gap: 15px;
  justify-content: center;
  align-items: center;
  margin-top: 25px;
}

.submit-button {
  padding: 12px 30px;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #3498db;
  color: white;
}

.submit-button:hover:not(:disabled) {
  background: #2980b9;
  transform: translateY(-2px);
}

.submit-button:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}

.cancel-link {
  padding: 12px 30px;
  font-size: 15px;
  font-weight: 500;
  color: #95a5a6;
  text-decoration: none;
  transition: color 0.3s ease;
}

.cancel-link:hover {
  color: #7f8c8d;
}

.spinner {
  width: 1.25rem;
  height: 1.25rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.success-message {
  color: #2ecc71;
  font-size: 14px;
  text-align: center;
  margin-top: 15px;
}

.error-message {
  color: #e74c3c;
  font-size: 14px;
  text-align: center;
  margin-top: 15px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .setup-account-page {
    padding: 20px;
  }

  .setup-form {
    padding: 20px;
  }

  .form-buttons {
    flex-direction: column;
  }
}
</style>