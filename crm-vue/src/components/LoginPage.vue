<template>
  <div class="login-container">
    <div class="login-card">
      <!-- Branding with icon instead of logo -->
      <div class="branding">
        <i class="fas fa-chart-pie logo-icon"></i>
        <h1>Customer Segmentation</h1>
        <p>Advanced Analytics Platform</p>
      </div>

      <!-- Login Form -->
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-header">
          <h2>Welcome Back</h2>
          <p>Please enter your credentials to login</p>
        </div>

        <!-- Email Input -->
        <div class="form-group">
          <label for="email">Email Address</label>
          <div class="input-with-icon">
            <i class="fas fa-envelope"></i>
            <input
              type="email"
              id="email"
              v-model="email"
              placeholder="Enter your email"
              required
              @input="validateEmail"
            >
          </div>
          <span v-if="emailError" class="error-message">{{ emailError }}</span>
        </div>

        <!-- Password Input -->
        <div class="form-group">
          <div class="label-row">
            <label for="password">Password</label>
            <router-link to="/forgot-password" class="forgot-password">Forgot password?</router-link>
          </div>
          <div class="input-with-icon">
            <i class="fas fa-lock"></i>
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
          <span v-if="passwordError" class="error-message">{{ passwordError }}</span>
        </div>

        <!-- Remember Me & Submit -->
        <div class="form-options">
          <label class="remember-me">
            <input type="checkbox" v-model="rememberMe">
            <span>Remember me</span>
          </label>
        </div>

        <button type="submit" class="login-btn" :disabled="isLoading">
          <span v-if="!isLoading">Login</span>
          <div v-else class="spinner"></div>
        </button>

        <!-- Social Login -->
        <div class="social-login">
          <p>Or login with</p>
          <div class="social-icons">
            <button type="button" class="social-btn google" @click="loginWithGoogle">
              <i class="fab fa-google"></i>
            </button>
            <button type="button" class="social-btn microsoft" @click="loginWithMicrosoft">
              <i class="fab fa-microsoft"></i>
            </button>
          </div>
        </div>

        <!-- Sign Up Link -->
        <div class="signup-link">
          Don't have an account? <router-link to="/register">Sign up</router-link>
        </div>
      </form>
    </div>

    <!-- Back to Home -->
    <router-link to="/" class="back-to-home">
      <i class="fas fa-arrow-left"></i> Back to Home
    </router-link>

    <!-- Error Modal -->
    <div v-if="showErrorModal" class="modal-overlay">
      <div class="modal">
        <div class="modal-header">
          <h3>Login Error</h3>
          <button @click="showErrorModal = false" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <p>{{ errorMessage }}</p>
        </div>
        <div class="modal-footer">
          <button @click="showErrorModal = false" class="modal-btn">OK</button>
        </div>
      </div>
    </div>
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
    // Check for saved credentials if "remember me" was checked previously
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      this.email = savedEmail;
      this.rememberMe = true;
    }
  },
  methods: {
    validateEmail() {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(this.email)) {
        this.emailError = 'Please enter a valid email address';
      } else {
        this.emailError = '';
      }
    },

    togglePassword() {
      this.showPassword = !this.showPassword;
    },

    async handleLogin() {
      // Validate inputs
      this.validateEmail();
      if (this.emailError || !this.email || !this.password) {
        if (!this.password) {
          this.passwordError = 'Please enter your password';
        }
        return;
      }

      this.isLoading = true;

      try {
        const response = await axios.post('http://localhost:5000/api/admin/login', {
          email: this.email,
          password: this.password,
        });

        // Store token
        const token = response.data.token;
        localStorage.setItem('authToken', token);

        // Remember email if checkbox is checked
        if (this.rememberMe) {
          localStorage.setItem('rememberedEmail', this.email);
        } else {
          localStorage.removeItem('rememberedEmail');
        }

        // Redirect to dashboard
        this.$router.push('/admin');
      } catch (error) {
        this.errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
        this.showErrorModal = true;

        // Clear password field on error
        this.password = '';
      } finally {
        this.isLoading = false;
      }
    },

    loginWithGoogle() {
      console.log('Logging in with Google');
    },

    loginWithMicrosoft() {
      console.log('Logging in with Microsoft');
    },
  },
};
</script>

<style scoped lang="scss">
/* Color Variables */
:root {
  --primary-color: #4361ee;
  --primary-light: #4895ef;
  --primary-dark: #3f37c9;
  --secondary-color: #3a0ca3;
  --accent-color: #f72585;
  --success-color: #4cc9f0;
  --warning-color: #f8961e;
  --danger-color: #ef233c;
  --dark-color: #2b2d42;
  --light-color: #f8f9fa;
  --gray-light: #e9ecef;
  --gray-medium: #adb5bd;
  --gray-dark: #495057;
  --white: #ffffff;
  --black: #212529;
  --border-radius: 8px;
  --box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  --transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

/* Base Styles */
.login-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: var(--light-color);
  padding: 20px;
  position: relative;
}

.login-card {
  width: 100%;
  max-width: 450px;
  background-color: var(--white);
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  overflow: hidden;
}

.branding {
  text-align: center;
  padding: 30px 20px;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
  color: var(--white);

  .logo-icon {
    font-size: 3rem;
    margin-bottom: 15px;
  }

  h1 {
    font-size: 1.8rem;
    margin: 0 0 5px;
  }

  p {
    font-size: 1rem;
    margin: 0;
    opacity: 0.9;
  }
}

.login-form {
  padding: 30px;
}

.form-header {
  text-align: center;
  margin-bottom: 25px;

  h2 {
    font-size: 1.5rem;
    color: var(--dark-color);
    margin: 0 0 5px;
  }

  p {
    font-size: 0.9rem;
    color: var(--gray-dark);
    margin: 0;
  }
}

.form-group {
  margin-bottom: 20px;

  label {
    display: block;
    font-size: 0.9rem;
    font-weight: 500;
    color: var(--dark-color);
    margin-bottom: 8px;
  }
}

.label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.input-with-icon {
  position: relative;
  display: flex;
  align-items: center;

  i {
    position: absolute;
    left: 15px;
    color: var(--gray-medium);
    font-size: 1rem;
  }

  input {
    width: 100%;
    padding: 12px 15px 12px 45px;
    border: 1px solid var(--gray-light);
    border-radius: var(--border-radius);
    font-size: 0.95rem;
    transition: var(--transition);
    background-color: var(--light-color);

    &:focus {
      outline: none;
      border-color: var(--primary-color);
      box-shadow: 0 0 0 2px rgba(67, 97, 238, 0.2);
    }
  }

  .toggle-password {
    position: absolute;
    right: 15px;
    background: none;
    border: none;
    color: var(--gray-medium);
    cursor: pointer;
    font-size: 1rem;
    padding: 5px;

    &:hover {
      color: var(--primary-color);
    }
  }
}

.error-message {
  display: block;
  font-size: 0.8rem;
  color: var(--danger-color);
  margin-top: 5px;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 20px 0;
}

.remember-me {
  display: flex;
  align-items: center;
  font-size: 0.9rem;
  color: var(--gray-dark);
  cursor: pointer;

  input {
    margin-right: 8px;
    accent-color: var(--primary-color);
  }
}

.forgot-password {
  font-size: 0.85rem;
  color: var(--primary-color);
  text-decoration: none;
  transition: var(--transition);

  &:hover {
    color: var(--primary-dark);
    text-decoration: underline;
  }
}

.login-btn {
  width: 100%;
  padding: 14px;
  background-color: var(--primary-color);
  color: var(--white);
  border: none;
  border-radius: var(--border-radius);
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover:not(:disabled) {
    background-color: var(--primary-dark);
  }

  &:disabled {
    background-color: var(--gray-light);
    cursor: not-allowed;
    opacity: 0.7;
  }
}

.spinner {
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: var(--white);
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.social-login {
  text-align: center;
  margin: 25px 0;

  p {
    font-size: 0.9rem;
    color: var(--gray-dark);
    margin: 0 0 15px;
    position: relative;

    &::before, &::after {
      content: '';
      position: absolute;
      top: 50%;
      width: 30%;
      height: 1px;
      background-color: var(--gray-light);
    }

    &::before {
      left: 0;
    }

    &::after {
      right: 0;
    }
  }
}

.social-icons {
  display: flex;
  justify-content: center;
  gap: 15px;
}

.social-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  transition: var(--transition);
  display: flex;
  align-items: center;
  justify-content: center;

  &.google {
    background-color: #db4437;
    color: var(--white);

    &:hover {
      background-color: #c23321;
    }
  }

  &.microsoft {
    background-color: #0078d4;
    color: var(--white);

    &:hover {
      background-color: #0062ad;
    }
  }
}

.signup-link {
  text-align: center;
  font-size: 0.9rem;
  color: var(--gray-dark);
  margin-top: 20px;

  a {
    color: var(--primary-color);
    font-weight: 500;
    text-decoration: none;
    transition: var(--transition);

    &:hover {
      color: var(--primary-dark);
      text-decoration: underline;
    }
  }
}

.back-to-home {
  position: absolute;
  top: 20px;
  left: 20px;
  display: flex;
  align-items: center;
  color: var(--primary-color);
  font-size: 0.95rem;
  text-decoration: none;
  transition: var(--transition);

  i {
    margin-right: 8px;
  }

  &:hover {
    color: var(--primary-dark);
    text-decoration: underline;
  }
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background-color: var(--white);
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  width: 90%;
  max-width: 400px;
  overflow: hidden;
}

.modal-header {
  padding: 15px 20px;
  border-bottom: 1px solid var(--gray-light);
  display: flex;
  justify-content: space-between;
  align-items: center;

  h3 {
    font-size: 1.2rem;
    margin: 0;
    color: var(--dark-color);
  }
}

.close-btn {
  background: none;
  border: none;
  color: var(--gray-medium);
  font-size: 1.2rem;
  cursor: pointer;
  padding: 5px;

  &:hover {
    color: var(--dark-color);
  }
}

.modal-body {
  padding: 20px;

  p {
    margin: 0;
    color: var(--dark-color);
    line-height: 1.5;
  }
}

.modal-footer {
  padding: 15px 20px;
  border-top: 1px solid var(--gray-light);
  display: flex;
  justify-content: flex-end;
}

.modal-btn {
  padding: 8px 16px;
  background-color: var(--primary-color);
  color: var(--white);
  border: none;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: var(--transition);

  &:hover {
    background-color: var(--primary-dark);
  }
}

/* Responsive Design */
@media (max-width: 480px) {
  .login-container {
    padding: 15px;
  }

  .branding {
    padding: 20px 15px;

    h1 {
      font-size: 1.5rem;
    }

    p {
      font-size: 0.9rem;
    }
  }

  .login-form {
    padding: 20px 15px;
  }

  .back-to-home {
    font-size: 0.85rem;
    top: 15px;
    left: 15px;
  }
}
</style>