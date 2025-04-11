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
            v-model="email"
            placeholder="Enter your email"
            required
            @input="validateEmail"
          />
          <span v-if="emailError" class="error-message">{{ emailError }}</span>
        </div>
        <div class="form-group">
          <label for="password">Password</label>
          <input
            :type="showPassword ? 'text' : 'password'"
            id="password"
            v-model="password"
            placeholder="Enter your password"
            required
          />
          <button
            type="button"
            class="toggle-password"
            @click="togglePassword"
            :aria-label="showPassword ? 'Hide password' : 'Show password'"
          >
            <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
          </button>
        </div>
        <button type="submit" class="login-btn" :disabled="isLoading">
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
      errorMessage: '',
    };
  },
  methods: {
    validateEmail() {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      this.emailError = emailRegex.test(this.email) ? '' : 'Please enter a valid email address';
    },
    togglePassword() {
      this.showPassword = !this.showPassword;
    },
    async handleLogin() {
      this.validateEmail();
      if (this.emailError || !this.email || !this.password) {
        this.errorMessage = 'Please fill in all fields correctly.';
        return;
      }

      this.isLoading = true;
      console.log('Attempting login with:', { email: this.email, password: this.password });
      try {
        const response = await axios.post('http://localhost:5000/api/auth/login', {
          email: this.email,
          password: this.password,
        });
        console.log('Login successful. Response:', response.data);
        localStorage.setItem('authToken', response.data.token);
        this.$router.push(response.data.redirect || '/users-dashboard');
      } catch (error) {
        console.error('Login failed:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });
        this.errorMessage =
          error.response?.data?.message || 'Login failed. Please check your user credentials.';
      } finally {
        this.isLoading = false;
      }
    },
  },
};
</script>

<style scoped lang="scss">
/* Unchanged styles */
.user-login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f7fafc;
}

.login-card {
  width: 100%;
  max-width: 400px;
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

h1 {
  text-align: center;
  color: #2d3748;
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
  position: relative;
}

label {
  display: block;
  color: #2d3748;
  font-weight: 500;
  margin-bottom: 0.5rem;
}

input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
}

.toggle-password {
  position: absolute;
  right: 1rem;
  top: 2.75rem;
  background: none;
  border: none;
  color: #718096;
  cursor: pointer;
}

.toggle-password:hover {
  color: #4a6cf7;
}

.login-btn {
  width: 100%;
  padding: 0.75rem;
  background: #4a6cf7;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
}

.login-btn:disabled {
  background: #a0aec0;
}

.spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-message {
  color: #e53e3e;
  font-size: 0.9rem;
  margin-top: 0.5rem;
}

.admin-link {
  text-align: center;
  margin-top: 1rem;
  color: #718096;
}

.admin-link a {
  color: #4a6cf7;
  text-decoration: none;
}
</style>