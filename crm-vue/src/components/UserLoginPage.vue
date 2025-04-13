<!-- UserLogin.vue -->
<template>
  <div class="user-login-container">
    <div class="login-card">
      <h1>User Login</h1>
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="email">Email</label>
          <input
            type="email"
            id="email"
            v-model.trim="email"
            placeholder="Enter your email"
            required
            @input="validateEmail"
            :aria-invalid="!!emailError"
            aria-describedby="email-error"
          />
          <span v-if="emailError" id="email-error" class="error-message">{{ emailError }}</span>
        </div>
        <div class="form-group">
          <label for="password">Password</label>
          <div class="password-wrapper">
            <input
              :type="showPassword ? 'text' : 'password'"
              id="password"
              v-model.trim="password"
              placeholder="Enter your password"
              required
              @input="validatePassword"
              :aria-invalid="!!passwordError"
              aria-describedby="password-error"
            />
            <button
              type="button"
              class="toggle-password"
              @click="togglePassword"
              :aria-label="showPassword ? 'Hide password' : 'Show password'"
            >
              <span class="material-icons">{{
                showPassword ? 'visibility_off' : 'visibility'
              }}</span>
            </button>
          </div>
          <span v-if="passwordError" id="password-error" class="error-message">{{
            passwordError
          }}</span>
          <p v-if="password.length && !passwordError" class="password-hint">
            Password must be at least 8 characters long.
          </p>
        </div>
        <button
          type="submit"
          class="login-btn"
          :disabled="isLoading || !!emailError || !!passwordError"
        >
          <span v-if="!isLoading">Sign In</span>
          <div v-else class="spinner"></div>
        </button>
        <p class="admin-link">
          Are you an admin? <router-link to="/login">Admin Login</router-link>
        </p>
        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
      </form>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'UserLoginPage',
  data() {
    return {
      email: '',
      password: '',
      showPassword: false,
      isLoading: false,
      emailError: '',
      passwordError: '',
      errorMessage: '',
    };
  },
  methods: {
    validateEmail() {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      this.emailError = emailRegex.test(this.email)
        ? ''
        : 'Please enter a valid email address.';
      this.clearGeneralError();
    },
    validatePassword() {
      this.passwordError =
        this.password.length >= 8 ? '' : 'Password must be at least 8 characters long.';
      this.clearGeneralError();
    },
    togglePassword() {
      this.showPassword = !this.showPassword;
    },
    clearGeneralError() {
      this.errorMessage = '';
    },
    async handleLogin() {
      this.validateEmail();
      this.validatePassword();
      if (this.emailError || this.passwordError || !this.email || !this.password) {
        this.errorMessage = 'Please fill in all fields correctly.';
        return;
      }

      this.isLoading = true;
      try {
        const response = await axios.post('http://localhost:5000/api/user/login', {
          email: this.email,
          password: this.password,
        });
        localStorage.setItem('token', response.data.token);
        this.$router.push(response.data.redirect || '/users-dashboard');
      } catch (error) {
        this.errorMessage =
          error.response?.data?.message || 'Login failed. Please check your credentials.';
      } finally {
        this.isLoading = false;
      }
    },
  },
};
</script>

<style scoped lang="scss">
.user-login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e7eb 100%);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  padding: 1rem;
}

.login-card {
  width: 100%;
  max-width: 400px;
  background: #ffffff;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

h1 {
  text-align: center;
  color: #1a202c;
  font-size: 1.8rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  color: #4a5568;
  font-weight: 500;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.9rem;
  background: #f7fafc;
  transition: border-color 0.2s;
}

input:focus {
  outline: none;
  border-color: #2196f3;
}

.password-wrapper {
  position: relative;
}

.toggle-password {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #718096;
  cursor: pointer;
  font-size: 1.2rem;
}

.toggle-password:hover {
  color: #2196f3;
}

.login-btn {
  width: 100%;
  padding: 0.75rem;
  background: #2196f3;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.login-btn:hover:not(:disabled) {
  background: #1e88e5;
}

.login-btn:disabled {
  background: #b0bec5;
  cursor: not-allowed;
}

.spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error-message {
  color: #e53e3e;
  font-size: 0.85rem;
  margin-top: 0.25rem;
  display: block;
}

.password-hint {
  color: #718096;
  font-size: 0.85rem;
  margin-top: 0.25rem;
}

.admin-link {
  text-align: center;
  margin-top: 1rem;
  color: #718096;
  font-size: 0.9rem;
}

.admin-link a {
  color: #2196f3;
  text-decoration: none;
  transition: color 0.2s;
}

.admin-link a:hover {
  color: #1e88e5;
}

@media (max-width: 480px) {
  .login-card {
    padding: 1.5rem;
  }

  h1 {
    font-size: 1.5rem;
  }

  input,
  .login-btn {
    font-size: 0.85rem;
  }
}
</style>