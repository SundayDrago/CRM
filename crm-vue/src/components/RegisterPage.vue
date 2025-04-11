<template>
  <div class="register-container">
    <div class="register-card">
      <!-- Branding Section -->
      <div class="branding">
        <i class="fas fa-chart-pie logo-icon"></i>
        <h1>Customer Segmentation</h1>
        <p>Advanced Analytics Platform</p>
      </div>

      <!-- Registration Form Section -->
      <form @submit.prevent="register" class="register-form">
        <div class="form-header">
          <h2>Admin Registration</h2>
          <p>Create your admin account</p>
        </div>

        <!-- Full Name Field -->
        <div class="form-group">
          <label for="fullName">Full Name</label>
          <div class="input-wrapper">
            <i class="fas fa-user input-icon"></i>
            <input
              type="text"
              id="fullName"
              v-model="fullName"
              placeholder="John Doe"
              required
            />
          </div>
        </div>

        <!-- Username Field -->
        <div class="form-group">
          <label for="username">Username</label>
          <div class="input-wrapper">
            <i class="fas fa-user-tag input-icon"></i>
            <input
              type="text"
              id="username"
              v-model="username"
              placeholder="johndoe123"
              required
            />
          </div>
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
              placeholder="john.doe@example.com"
              required
            />
          </div>
        </div>

        <!-- Password Field -->
        <div class="form-group">
          <label for="password">Password</label>
          <div class="input-wrapper">
            <i class="fas fa-lock input-icon"></i>
            <input
              :type="showPassword ? 'text' : 'password'"
              id="password"
              v-model="password"
              placeholder="••••••••"
              required
              minlength="8"
            />
            <button type="button" class="toggle-password" @click="togglePasswordVisibility('password')">
              <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
            </button>
          </div>
        </div>

        <!-- Confirm Password Field -->
        <div class="form-group">
          <label for="confirmPassword">Confirm Password</label>
          <div class="input-wrapper">
            <i class="fas fa-lock input-icon"></i>
            <input
              :type="showConfirmPassword ? 'text' : 'password'"
              id="confirmPassword"
              v-model="confirmPassword"
              placeholder="••••••••"
              required
              minlength="8"
            />
            <button type="button" class="toggle-password" @click="togglePasswordVisibility('confirmPassword')">
              <i :class="showConfirmPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
            </button>
          </div>
        </div>

        <!-- Terms Checkbox -->
        <div class="form-options">
          <label class="checkbox-container">
            <input type="checkbox" v-model="termsAccepted" required />
            <span class="checkmark"></span>
            <span class="checkbox-label">
              I agree to the <a href="#" class="terms-link">Terms and Conditions</a>
            </span>
          </label>
        </div>

        <!-- Submit Button -->
        <button type="submit" class="register-btn" :disabled="isLoading">
          <span v-if="!isLoading">Create Account</span>
          <div v-else class="spinner"></div>
        </button>

        <!-- Login Link -->
        <p class="login-link">
          Already have an account? <router-link to="/login">Sign in</router-link>
        </p>
      </form>
    </div>

    <!-- Back to Home Link -->
    <router-link to="/" class="back-link">
      <i class="fas fa-arrow-left"></i> Return to Home
    </router-link>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "RegisterPage",
  data() {
    return {
      fullName: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      termsAccepted: false,
      showPassword: false,
      showConfirmPassword: false,
      isLoading: false,
    };
  },
  methods: {
    async register() {
      this.isLoading = true;
      const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

      if (!passwordRegex.test(this.password)) {
        alert("Password must be at least 8 characters and include letters, numbers, and special characters.");
        this.isLoading = false;
        return;
      }

      if (this.password !== this.confirmPassword) {
        alert("Passwords don't match.");
        this.isLoading = false;
        return;
      }

      if (!this.termsAccepted) {
        alert("Please accept the terms and conditions.");
        this.isLoading = false;
        return;
      }

      try {
        const response = await axios.post("http://localhost:5000/api/admin/register", {
          full_name: this.fullName,
          username: this.username,
          email: this.email,
          password: this.password,
          confirmPassword: this.confirmPassword,
        });

        alert(response.data.message);
        this.$router.push({ path: "/verify", query: { email: this.email } });
      } catch (error) {
        alert(error.response?.data?.message || "Registration failed. Please try again.");
      } finally {
        this.isLoading = false;
      }
    },
    togglePasswordVisibility(field) {
      if (field === "password") {
        this.showPassword = !this.showPassword;
      } else if (field === "confirmPassword") {
        this.showConfirmPassword = !this.showConfirmPassword;
      }
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

.register-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, $background 0%, darken($background, 5%) 100%);
  padding: 1rem;
}

.register-card {
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

.register-form {
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

  .terms-link {
    color: $primary;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
}

.register-btn {
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
  to {
    transform: rotate(360deg);
  }
}

.login-link {
  text-align: center;
  font-size: 0.9rem;
  color: lighten($text, 20%);
  margin-top: 1.5rem;

  a {
    color: $primary;
    font-weight: 500;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
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

@media (max-width: 480px) {
  .register-card {
    margin: 1rem;
  }

  .branding {
    padding: 1.5rem;
  }

  .register-form {
    padding: 1.5rem;
  }
}
</style>