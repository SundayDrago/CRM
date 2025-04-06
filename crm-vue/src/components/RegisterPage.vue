<template>
  <div class="register-container">
    <div class="register-card">
      <div class="header">
        <h2>Admin Registration</h2>
        <p class="subtitle">Create your admin account</p>
      </div>

      <form @submit.prevent="register">
        <div class="form-group">
          <label for="fullName">Full Name</label>
          <input
            type="text"
            v-model="fullName"
            id="fullName"
            placeholder="John Doe"
            required
          />
        </div>

        <div class="form-group">
          <label for="username">Username</label>
          <input
            type="text"
            v-model="username"
            id="username"
            placeholder="johndoe123"
            required
          />
        </div>

        <div class="form-group">
          <label for="email">Email Address</label>
          <input
            type="email"
            v-model="email"
            id="email"
            placeholder="john.doe@example.com"
            required
          />
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <div class="password-wrapper">
            <input
              :type="showPassword ? 'text' : 'password'"
              v-model="password"
              id="password"
              placeholder="••••••••"
              required
            />
            <span
              class="toggle-password"
              @click="togglePasswordVisibility('password')"
            >
              <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
            </span>
          </div>
        </div>

        <div class="form-group">
          <label for="confirmPassword">Confirm Password</label>
          <div class="password-wrapper">
            <input
              :type="showConfirmPassword ? 'text' : 'password'"
              v-model="confirmPassword"
              id="confirmPassword"
              placeholder="••••••••"
              required
            />
            <span
              class="toggle-password"
              @click="togglePasswordVisibility('confirmPassword')"
            >
              <i :class="showConfirmPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
            </span>
          </div>
        </div>

        <div class="terms-group">
          <label class="checkbox-container">
            <input
              type="checkbox"
              id="terms"
              v-model="termsAccepted"
              required
            />
            <span class="checkmark"></span>
            I agree to the <a href="#" class="terms-link">Terms and Conditions</a>
          </label>
        </div>

        <button
          type="submit"
          class="submit-btn"
          :disabled="isLoading"
        >
          <span v-if="!isLoading">Create Account</span>
          <span v-else class="loading">Registering...</span>
        </button>

        <div class="login-link">
          Already have an account?
          <router-link to="/login">Sign in</router-link>
        </div>
      </form>
    </div>
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

<style scoped>
.register-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.register-card {
  width: 100%;
  max-width: 450px;
  background: white;
  padding: 2.5rem;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.header {
  text-align: center;
  margin-bottom: 2rem;
}

h2 {
  color: #2c3e50;
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: #7f8c8d;
  font-size: 1rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  color: #2c3e50;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.3s, box-shadow 0.3s;
}

input:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 5px rgba(52, 152, 219, 0.3);
}

.password-wrapper {
  position: relative;
}

.toggle-password {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  color: #7f8c8d;
  transition: color 0.3s;
}

.toggle-password:hover {
  color: #3498db;
}

.terms-group {
  margin: 1.5rem 0;
}

.checkbox-container {
  display: flex;
  align-items: center;
  color: #2c3e50;
  cursor: pointer;
}

.checkbox-container input {
  display: none;
}

.checkmark {
  width: 18px;
  height: 18px;
  border: 2px solid #ddd;
  border-radius: 4px;
  margin-right: 0.75rem;
  position: relative;
  transition: all 0.3s;
}

.checkbox-container input:checked + .checkmark {
  background: #3498db;
  border-color: #3498db;
}

.checkbox-container input:checked + .checkmark:after {
  content: '\2713';
  color: white;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  font-size: 12px;
}

.terms-link {
  color: #3498db;
  text-decoration: none;
}

.terms-link:hover {
  text-decoration: underline;
}

.submit-btn {
  width: 100%;
  padding: 0.9rem;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s;
}

.submit-btn:hover:not(:disabled) {
  background: #2980b9;
}

.submit-btn:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-link {
  text-align: center;
  margin-top: 1.5rem;
  color: #7f8c8d;
}

.login-link a {
  color: #3498db;
  text-decoration: none;
  font-weight: 600;
}

.login-link a:hover {
  text-decoration: underline;
}
</style>