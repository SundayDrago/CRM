<template>
  <div class="login-container">
    <div class="login-card">
      <!-- Branding Section -->
      <div class="branding">
        <i class="fas fa-chart-pie logo-icon"></i>
        <h1>Customer Segmentation</h1>
        <p>Advanced Analytics Platform</p>
      </div>

      <!-- Login Form Section -->
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-header">
          <h2>Welcome Back</h2>
          <p>Sign in to access your analytics dashboard</p>
        </div>

        <!-- Email Field -->
        <div class="form-group">
          <label for="email">Email Address</label>
          <div class="input-wrapper">
            <i class="fas fa-envelope input-icon"></i>
            <input
              type="email"
              id="email"
              v-model="email"
              placeholder="Enter your email"
              required
              @input="validateEmail"
            >
          </div>
          <transition name="fade">
            <span v-if="emailError" class="error-message">{{ emailError }}</span>
          </transition>
        </div>

        <!-- Password Field -->
        <div class="form-group">
          <div class="label-row">
            <label for="password">Password</label>
            <router-link to="/forgot-password" class="forgot-password">Forgot Password?</router-link>
          </div>
          <div class="input-wrapper">
            <i class="fas fa-lock input-icon"></i>
            <input
              :type="showPassword ? 'text' : 'password'"
              id="password"
              v-model="password"
              placeholder="Enter your password"
              required
              minlength="8"
            >
            <button type="button" class="toggle-password" @click="togglePassword">
              <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
            </button>
          </div>
          <transition name="fade">
            <span v-if="passwordError" class="error-message">{{ passwordError }}</span>
          </transition>
        </div>

        <!-- Form Options -->
        <div class="form-options">
          <label class="checkbox-container">
            <input type="checkbox" v-model="rememberMe">
            <span class="checkmark"></span>
            <span class="checkbox-label">Remember me</span>
          </label>
        </div>

        <!-- Submit Button -->
        <button type="submit" class="login-btn" :disabled="isLoading">
          <span v-if="!isLoading">Sign In</span>
          <div v-else class="spinner"></div>
        </button>

        <!-- Registration Link -->
        <p class="signup-link">
          New to the platform? <router-link to="/register">Create an account</router-link>
        </p>

        <!-- User Login Link -->
        <div class="user-link">
          Are you a regular user? <router-link to="/user-login">User Login</router-link>
        </div>
      </form>
    </div>

    <!-- Back to Home Link -->
    <router-link to="/" class="back-link">
      <i class="fas fa-arrow-left"></i> Return to Home
    </router-link>

    <!-- Error Modal -->
    <transition name="modal">
      <div v-if="showErrorModal" class="modal-overlay" @click.self="showErrorModal = false">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Login Failed</h3>
            <button class="close-btn" @click="showErrorModal = false">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="modal-body">
            <p>{{ errorMessage }}</p>
          </div>
          <div class="modal-footer">
            <button class="modal-btn" @click="showErrorModal = false">Try Again</button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'LoginPage',
  data() {
    return {
      email: '',
      password: '',
      rememberMe: false,
      showPassword: false,
      isLoading: false,
      emailError: '',
      passwordError: '',
      showErrorModal: false,
      errorMessage: '',
    };
  },
  async created() {
    // Check if already authenticated
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        console.log('Checking existing token on login page');
        const response = await axios.get('http://localhost:5000/api/admin/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.status === 200) {
          console.log('Valid token found, redirecting to /admin');
          this.$router.push('/admin');
        } else {
          console.log('Invalid token, clearing');
          localStorage.removeItem('authToken');
        }
      } catch (error) {
        console.error('Error validating token:', {
          message: error.message,
          response: error.response ? { status: error.response.status, data: error.response.data } : null,
        });
        localStorage.removeItem('authToken');
      }
    }

    // Load remembered email
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      this.email = savedEmail;
      this.rememberMe = true;
    }
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
        if (!this.email) this.emailError = 'Email is required';
        if (!this.password) this.passwordError = 'Password is required';
        return;
      }
      if (this.password.length < 8) {
        this.passwordError = 'Password must be at least 8 characters long';
        return;
      }

      this.isLoading = true;
      try {
        console.log('Sending login request:', { email: this.email });
        const response = await axios.post('http://localhost:5000/api/admin/login', {
          email: this.email,
          password: this.password,
        }, {
          headers: { 'Content-Type': 'application/json' },
        });

        console.log('Login response:', response.data);
        // Verify token exists
        if (!response.data.token) {
          throw new Error('No token received from server');
        }

        // Store the authentication token
        localStorage.setItem('authToken', response.data.token);

        // Handle "Remember Me" functionality
        if (this.rememberMe) {
          localStorage.setItem('rememberedEmail', this.email);
        } else {
          localStorage.removeItem('rememberedEmail');
        }

        console.log('Login successful, redirecting to /admin');
        this.$router.push('/admin');
      } catch (error) {
        console.error('Login error:', {
          message: error.message,
          response: error.response ? { status: error.response.status, data: error.response.data } : null,
          config: error.config,
        });
        this.errorMessage =
          error.response?.data?.message ||
          (error.response?.status === 400
            ? 'Please provide both email and password'
            : error.response?.status === 401
            ? 'Invalid email or password'
            : error.response?.status === 403
            ? 'Your email is not verified'
            : error.response?.status === 404
            ? 'Login endpoint not found. Check server configuration.'
            : error.message.includes('ECONNREFUSED')
            ? 'Cannot connect to the server. Ensure it is running on port 5000.'
            : 'An unexpected error occurred. Please try again.');
        this.showErrorModal = true;
        this.password = '';
        this.passwordError = '';
      } finally {
        this.isLoading = false;
      }
    },
  },
};
</script>

<style scoped>
/* Colors matching UserLoginPage.vue */
.login-container {
  max-width: 400px;
  margin: 0 auto;
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.branding {
  padding: 2rem;
  background: #007bff;
  text-align: center;
  color: white;

  .logo-icon {
    font-size: 2.5rem;
    margin-bottom: 1rem;
  }

  h1 {
    font-size: 1.75rem;
    font-weight: 600;
    margin: 0 0 0.25rem;
  }

  p {
    font-size: 0.9rem;
    opacity: 0.9;
  }
}

.login-form {
  padding: 2rem;
  display: flex;
  flex-direction: column;
}

.form-header {
  text-align: center;
  margin-bottom: 2rem;

  h2 {
    font-size: 1.5rem;
    font-weight: 600;
    color: #333;
    margin-bottom: 0.25rem;
  }

  p {
    font-size: 0.9rem;
    color: #555;
  }
}

.form-group {
  margin-bottom: 1.5rem;
}

.label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  color: #555;
  font-weight: 500;
}

.forgot-password {
  font-size: 0.85rem;
  color: #007bff;
  text-decoration: none;
}

.forgot-password:hover {
  text-decoration: underline;
}

.input-wrapper {
  position: relative;
}

.input-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #555;
}

input {
  width: 100%;
  padding: 0.75rem 0.75rem 0.75rem 2.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
  font-size: 1rem;
  transition: border-color 0.3s;
}

input:focus {
  border-color: #007bff;
  outline: none;
}

.toggle-password {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #555;
  cursor: pointer;
}

.toggle-password:hover {
  color: #007bff;
}

.error-message {
  color: #dc3545;
  font-size: 0.85rem;
  margin-top: 0.25rem;
  display: block;
}

.form-options {
  margin: 1.5rem 0;
}

.checkbox-container {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.checkbox-container input {
  display: none;
}

.checkbox-container input:checked + .checkmark {
  background: #007bff;
  border-color: #007bff;
}

.checkbox-container input:checked + .checkmark::after {
  display: block;
}

.checkmark {
  width: 1rem;
  height: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-right: 0.5rem;
  position: relative;
}

.checkmark::after {
  content: '';
  display: none;
  position: absolute;
  left: 3px;
  top: 1px;
  width: 4px;
  height: 8px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.checkbox-label {
  font-size: 0.9rem;
  color: #555;
}

.login-btn {
  width: 100%;
  padding: 0.75rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  margin-top: 1rem;
  transition: background-color 0.3s;
  display: flex;
  justify-content: center;
  align-items: center;
}

.login-btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.login-btn:hover:not(:disabled) {
  background-color: #0069d9;
}

.spinner {
  width: 1.25rem;
  height: 1.25rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.signup-link {
  text-align: center;
  font-size: 0.9rem;
  color: #555;
  margin-top: 1rem;
}

.signup-link a {
  color: #007bff;
  text-decoration: none;
}

.signup-link a:hover {
  text-decoration: underline;
}

.user-link {
  margin-top: 1rem;
  text-align: center;
  font-size: 0.9rem;
  color: #555;
}

.user-link a {
  color: #007bff;
  text-decoration: none;
}

.user-link a:hover {
  text-decoration: underline;
}

.back-link {
  position: absolute;
  top: 1.5rem;
  left: 1.5rem;
  color: #007bff;
  text-decoration: none;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.back-link:hover {
  text-decoration: underline;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.modal-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #ddd;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  color: #333;
}

.modal-header .close-btn {
  background: none;
  border: none;
  color: #555;
  cursor: pointer;
}

.modal-header .close-btn:hover {
  color: #333;
}

.modal-body {
  padding: 1.5rem;
  color: #333;
}

.modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #DDD;
  text-align: right;
}

.modal-footer .modal-btn {
  padding: 0.5rem 1rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.modal-footer .modal-btn:hover {
  background: #0069d9;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.modal-enter-active, .modal-leave-active {
  transition: opacity 0.2s;
}

.modal-enter-from, .modal-leave-to {
  opacity: 0;
}

@media (max-width: 480px) {
  .login-container {
    margin: 1rem;
    padding: 1rem;
  }

  .branding {
    padding: 1.5rem;
  }

  .login-form {
    padding: 1.5rem;
  }
}
</style>