<template>
  <div class="register-container">
    <div class="register-card">
      <!-- Branding Section -->
      <div class="branding">
        <i class="fas fa-chart-pie"></i>
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
          <span v-if="!isLoading" class="arrow-icon">→</span>
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
// Consistent Color Palette
$primary: #4CAF50; // Green from UserLoginPage.vue
$secondary: #1e293b; // Dark gray for text and headers
$accent: #10b981; // Emerald green for secondary actions
$background: #f8fafc; // Light gray background
$text: #334155; // Slate gray for body text
$error: #ef4444; // Red for error states
$border: #e2e8f0; // Light gray for inputs and cards
$white: #ffffff; // Pure white for cards and text
$disabled: #cccccc; // Gray for disabled state from UserLoginPage.vue

// Typography
$font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
$font-size-base: 1rem;
$font-size-sm: 0.875rem;
$font-size-lg: 1.125rem;
$font-weight-normal: 400;
$font-weight-medium: 500;
$font-weight-bold: 700;

// Spacing
$spacing-unit: 1rem;
$spacing-xs: $spacing-unit * 0.25;
$spacing-sm: $spacing-unit * 0.5;
$spacing-md: $spacing-unit;
$spacing-lg: $spacing-unit * 1.5;
$spacing-xl: $spacing-unit * 2;

// Border Radius
$border-radius-sm: 6px;
$border-radius-md: 8px;
$border-radius-lg: 12px;
$border-radius-pill: 50px; // From UserLoginPage.vue

// Shadows
$shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.05);
$shadow-md: 0 4px 12px rgba(0, 0, 0, 0.08);
$shadow-lg: 0 10px 24px rgba(0, 0, 0, 0.1);

.register-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, $background 0%, darken($background, 3%) 100%);
  padding: $spacing-md;
}

.register-card {
  width: 100%;
  max-width: 440px;
  background: $white;
  border-radius: $border-radius-lg;
  box-shadow: $shadow-lg;
  overflow: hidden;
}

.branding {
  padding: $spacing-xl;
  background: $primary;
  text-align: center;
  color: $white;

  .logo-icon {
    font-size: 2.75rem;
    margin-bottom: $spacing-sm;
  }

  h1 {
    font-size: 1.875rem;
    font-weight: $font-weight-bold;
    font-family: $font-family;
    margin: 0 0 $spacing-xs;
  }

  p {
    font-size: $font-size-sm;
    font-weight: $font-weight-normal;
    opacity: 0.85;
  }
}

.register-form {
  padding: $spacing-xl;
}

.form-header {
  text-align: center;
  margin-bottom: $spacing-lg;

  h2 {
    font-size: 1.625rem;
    font-weight: $font-weight-bold;
    color: $secondary;
    margin-bottom: $spacing-xs;
  }

  p {
    font-size: $font-size-sm;
    color: lighten($text, 15%);
  }
}

.form-group {
  margin-bottom: $spacing-lg;

  label {
    display: block;
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    color: $text;
    margin-bottom: $spacing-sm;
  }
}

.input-wrapper {
  position: relative;

  .input-icon {
    position: absolute;
    left: $spacing-md;
    top: 50%;
    transform: translateY(-50%);
    color: lighten($text, 25%);
    font-size: $font-size-sm;
  }

  input {
    width: 100%;
    padding: $spacing-sm $spacing-md $spacing-sm $spacing-xl;
    border: 1px solid $border;
    border-radius: $border-radius-md;
    font-size: $font-size-base;
    font-family: $font-family;
    transition: all 0.2s ease;

    &:focus {
      outline: none;
      border-color: $primary;
      box-shadow: 0 0 0 3px rgba(74, 108, 247, 0.15);
    }

    &::placeholder {
      color: lighten($text, 40%);
    }
  }

  .toggle-password {
    position: absolute;
    right: $spacing-md;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: lighten($text, 25%);
    cursor: pointer;
    font-size: $font-size-sm;

    &:hover {
      color: $primary;
    }
  }
}

.form-options {
  margin: $spacing-lg 0;
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
    width: 1.125rem;
    height: 1.125rem;
    border: 1px solid $border;
    border-radius: $border-radius-sm;
    margin-right: $spacing-sm;
    position: relative;
    transition: all 0.2s ease;

    &::after {
      content: '';
      display: none;
      position: absolute;
      left: 4px;
      top: 2px;
      width: 5px;
      height: 9px;
      border: solid $white;
      border-width: 0 2px 2px 0;
      transform: rotate(45deg);
    }
  }

  .checkbox-label {
    font-size: $font-size-sm;
    color: $text;
  }

  .terms-link {
    color: $primary;
    text-decoration: none;
    font-weight: $font-weight-medium;

    &:hover {
      text-decoration: underline;
    }
  }
}

.register-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1.5rem;
  font-size: $font-size-base;
  font-weight: $font-weight-bold;
  font-family: $font-family;
  border-radius: $border-radius-pill;
  cursor: pointer;
  transition: all 0.3s ease;
  background: $primary;
  color: $white;
  border: none;
  margin-top: $spacing-md;

  &:hover:not(:disabled) {
    background: #388E3C; // Darker green from UserLoginPage.vue
    transform: translateY(-2px);
  }

  &:disabled {
    background: $disabled;
    cursor: not-allowed;
  }
}

.arrow-icon {
  margin-left: 8px;
  font-size: $font-size-base;
}

.spinner {
  width: 1.5rem;
  height: 1.5rem;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: $white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.login-link {
  text-align: center;
  font-size: $font-size-sm;
  color: lighten($text, 15%);
  margin-top: $spacing-lg;

  a {
    color: $primary;
    font-weight: $font-weight-medium;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
}

.back-link {
  position: absolute;
  top: $spacing-lg;
  left: $spacing-lg;
  color: $primary;
  text-decoration: none;
  font-size: $font-size-sm;
  font-weight: $font-weight-medium;
  display: flex;
  align-items: center;
  gap: $spacing-xs;
  transition: color 0.2s ease;

  &:hover {
    color: darken($primary, 10%);
    text-decoration: underline;
  }

  i {
    font-size: $font-size-sm;
  }
}

@media (max-width: 480px) {
  .register-container {
    padding: $spacing-sm;
  }

  .register-card {
    margin: $spacing-sm;
    max-width: 100%;
  }

  .branding {
    padding: $spacing-lg;
  }

  .register-form {
    padding: $spacing-lg;
  }

  .form-header h2 {
    font-size: 1.375rem;
  }
}
</style>