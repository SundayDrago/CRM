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

        <!-- Social Login -->
        <div class="social-login">
          <div class="divider">
            <span>Or continue with</span>
          </div>
          <div class="social-buttons">
            <button type="button" class="social-btn google" @click="loginWithGoogle">
              <i class="fab fa-google"></i>
            </button>
            <button type="button" class="social-btn microsoft" @click="loginWithMicrosoft">
              <i class="fab fa-microsoft"></i>
            </button>
          </div>
        </div>

        <!-- Registration Link -->
        <p class="signup-link">
          New to the platform? <router-link to="/register">Create an account</router-link>
        </p>
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
  created() {
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
        if (!this.password) this.passwordError = 'Password is required';
        return;
      }

      this.isLoading = true;
      try {
        const response = await axios.post('http://localhost:5000/api/admin/login', {
          email: this.email,
          password: this.password,
        });

        // Store the authentication token
        localStorage.setItem('authToken', response.data.token);
        this.$router.push('/users');

        // Handle "Remember Me" functionality
        if (this.rememberMe) {
          localStorage.setItem('rememberedEmail', this.email);
        } else {
          localStorage.removeItem('rememberedEmail');
        }

        // Redirect to admin dashboard
        this.$router.push('/admin');
      } catch (error) {
        this.errorMessage =
          error.response?.data?.message ||
          (error.response?.status === 401 ? 'Invalid admin credentials' : 'Login failed');
        this.showErrorModal = true;
        this.password = ''; // Clear password field on error
      } finally {
        this.isLoading = false;
      }
    },
    loginWithGoogle() {
      // Placeholder for Google OAuth login
      this.isLoading = true;
      console.log('Initiating Google login...');
      // Example: Redirect to Google OAuth endpoint (implement with your backend)
      window.location.href = 'http://localhost:5000/api/auth/google';
      // After redirection, your backend should handle the callback and set the token
    },
    loginWithMicrosoft() {
      // Placeholder for Microsoft OAuth login
      this.isLoading = true;
      console.log('Initiating Microsoft login...');
      // Example: Redirect to Microsoft OAuth endpoint (implement with your backend)
      window.location.href = 'http://localhost:5000/api/auth/microsoft';
      // After redirection, your backend should handle the callback and set the token
    },
  },
};
</script>
<style scoped lang="scss">
$primary: #4a6cf7;
$secondary: #2d3748;
$accent: #ed64a6;
$background: #f7fafc;
$text: #2d3748;
$error: #e53e3e;
$border: #e2e8f0;

.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, $background 0%, darken($background, 5%) 100%);
  padding: 1rem;
}

.login-card {
  width: 100%;
  max-width: 420px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.branding {
  padding: 2rem;
  background: $primary;
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
}

.form-header {
  text-align: center;
  margin-bottom: 2rem;

  h2 {
    font-size: 1.5rem;
    font-weight: 600;
    color: $text;
    margin-bottom: 0.25rem;
  }

  p {
    font-size: 0.9rem;
    color: lighten($text, 20%);
  }
}

.form-group {
  margin-bottom: 1.5rem;

  label {
    display: block;
    font-size: 0.9rem;
    font-weight: 500;
    color: $text;
    margin-bottom: 0.5rem;
  }

  .label-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .forgot-password {
    font-size: 0.85rem;
    color: $primary;
    text-decoration: none;
    &:hover {
      text-decoration: underline;
    }
  }
}

.input-wrapper {
  position: relative;

  .input-icon {
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: lighten($text, 30%);
  }

  input {
    width: 100%;
    padding: 0.75rem 0.75rem 0.75rem 2.5rem;
    border: 1px solid $border;
    border-radius: 8px;
    font-size: 0.95rem;
    transition: all 0.2s ease;

    &:focus {
      outline: none;
      border-color: $primary;
      box-shadow: 0 0 0 3px rgba(74, 108, 247, 0.1);
    }
  }

  .toggle-password {
    position: absolute;
    right: 1rem;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: lighten($text, 30%);
    cursor: pointer;
    &:hover {
      color: $primary;
    }
  }
}

.error-message {
  color: $error;
  font-size: 0.8rem;
  margin-top: 0.25rem;
}

.form-options {
  margin: 1.5rem 0;
}

.checkbox-container {
  display: flex;
  align-items: center;
  cursor: pointer;

  input {
    display: none;

    &:checked + .checkmark {
      background: $primary;
      border-color: $primary;

      &::after {
        display: block;
      }
    }
  }

  .checkmark {
    width: 1rem;
    height: 1rem;
    border: 1px solid $border;
    border-radius: 4px;
    margin-right: 0.5rem;
    position: relative;

    &::after {
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
  }

  .checkbox-label {
    font-size: 0.9rem;
    color: $text;
  }
}

.login-btn {
  width: 100%;
  padding: 0.875rem;
  background: $primary;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s ease;
  display: flex;
  justify-content: center;
  align-items: center;

  &:hover:not(:disabled) {
    background: darken($primary, 10%);
  }

  &:disabled {
    background: lighten($primary, 20%);
    cursor: not-allowed;
  }
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

.social-login {
  margin: 2rem 0;
  text-align: center;

  .divider {
    position: relative;
    margin-bottom: 1rem;

    span {
      font-size: 0.9rem;
      color: lighten($text, 20%);
      background: white;
      padding: 0 0.5rem;
      position: relative;
      z-index: 1;
    }

    &::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 0;
      right: 0;
      height: 1px;
      background: $border;
    }
  }
}

.social-buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.social-btn {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  border: none;
  color: white;
  cursor: pointer;
  transition: transform 0.2s ease;

  &.google {
    background: #db4437;
    &:hover { transform: scale(1.05); }
  }

  &.microsoft {
    background: #0078d4;
    &:hover { transform: scale(1.05); }
  }
}

.signup-link {
  text-align: center;
  font-size: 0.9rem;
  color: lighten($text, 20%);

  a {
    color: $primary;
    font-weight: 500;
    text-decoration: none;
    &:hover { text-decoration: underline; }
  }
}

.back-link {
  position: absolute;
  top: 1.5rem;
  left: 1.5rem;
  color: $primary;
  text-decoration: none;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    text-decoration: underline;
  }
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
  border-radius: 12px;
  width: 90%;
  max-width: 400px;
  animation: slideIn 0.2s ease-out;
}

.modal-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid $border;
  display: flex;
  justify-content: space-between;
  align-items: center;

  h3 {
    margin: 0;
    font-size: 1.25rem;
    color: $text;
  }

  .close-btn {
    background: none;
    border: none;
    color: lighten($text, 30%);
    cursor: pointer;
    &:hover { color: $text; }
  }
}

.modal-body {
  padding: 1.5rem;
  color: $text;
}

.modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid $border;
  text-align: right;

  .modal-btn {
    padding: 0.5rem 1rem;
    background: $primary;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    &:hover { background: darken($primary, 10%); }
  }
}

@keyframes slideIn {
  from { transform: translateY(-20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
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
  .login-card {
    margin: 1rem;
  }

  .branding {
    padding: 1.5rem;
  }

  .login-form {
    padding: 1.5rem;
  }
}
</style>