<template>
  <div class="login-container">
    <h1>User Login</h1>
    <form @submit.prevent="handleLogin" class="login-form">
      <div class="form-group">
        <label for="email">Email</label>
        <input
          type="email"
          id="email"
          v-model="email"
          required
          placeholder="Enter your email"
          @input="validateEmail"
        />
        <span v-if="emailError" class="input-error">{{ emailError }}</span>
      </div>
      <div class="form-group">
        <div class="label-row">
          <label for="password">Password</label>
          <router-link to="/forgot-password" class="forgot-password">Forgot Password?</router-link>
        </div>
        <div class="password-container">
          <input
            :type="showPassword ? 'text' : 'password'"
            id="password"
            v-model="password"
            required
            placeholder="Enter your password"
            minlength="6"
            @input="validatePassword"
          />
          <i
            :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"
            class="password-toggle-icon"
            @click="togglePassword"
          ></i>
        </div>
        <span v-if="passwordError" class="input-error">{{ passwordError }}</span>
      </div>
      <button type="submit" class="login-btn" :disabled="loading || !isFormValid">
        {{ loading ? 'Logging in...' : 'Login' }}
        <span v-if="!loading" class="arrow-icon">→</span>
      </button>
      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>
    </form>
    <div class="admin-link">
      Are you an admin? <router-link to="/login">Admin Login</router-link>
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
      loading: false,
      errorMessage: '',
      emailError: '',
      passwordError: '',
      showPassword: false,
    };
  },
  computed: {
    isFormValid() {
      return this.email && !this.emailError && this.password && !this.passwordError;
    },
  },
  methods: {
    validateEmail() {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!this.email) {
        this.emailError = '';
        return;
      }
      if (!emailRegex.test(this.email)) {
        this.emailError = 'Please enter a valid email address';
      } else {
        this.emailError = '';
      }
    },
    validatePassword() {
      if (!this.password) {
        this.passwordError = '';
        return;
      }
      if (this.password.length < 6) {
        this.passwordError = 'Password must be at least 6 characters';
      } else {
        this.passwordError = '';
      }
    },
    togglePassword() {
      this.showPassword = !this.showPassword;
    },
    async handleLogin() {
      if (!this.isFormValid) return;
      this.loading = true;
      this.errorMessage = '';
      try {
        const { data } = await axios.post('http://localhost:5000/api/user/login', {
          email: this.email,
          password: this.password,
        });
        if (data.token) {
          await new Promise(resolve => setTimeout(resolve, 100));
          localStorage.setItem('token', data.token);
          const redirectPath = data.redirect || '/users-dashboard';
          await this.$router.push(redirectPath);
        } else {
          throw new Error('Authentication token not received');
        }
      } catch (error) {
        console.error('Login error:', error);
        if (error.response) {
          switch (error.response.status) {
            case 400:
              this.errorMessage = 'Email and password are required';
              break;
            case 401:
              this.errorMessage = 'Invalid credentials';
              break;
            case 403:
              this.errorMessage = error.response.data.message || 'Account not active';
              break;
            default:
              this.errorMessage = error.response.data.message || 'Login failed';
          }
        } else if (error.request) {
          this.errorMessage = 'Network error - please try again later';
        } else {
          this.errorMessage = error.message || 'An error occurred during login';
        }
      } finally {
        this.loading = false;
      }
    },
    async checkExistingToken() {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        await axios.get('/api/admin/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        this.$router.push('/admin');
      } catch (error) {
        console.log('Invalid or expired token');
        localStorage.removeItem('token');
      }
    },
  },
  created() {
    this.checkExistingToken();
  },
};
</script>

<style scoped>
/* General Styling */
.login-container {
  font-family: 'Inter', sans-serif;
  max-width: 400px;
  margin: 5rem auto;
  padding: 2rem;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  animation: fadeInUp 0.6s ease-out;
  background: #f9f9f9; /* Matches feature-card background */
}

/* Heading */
h1 {
  text-align: center;
  font-size: 2.5rem;
  font-weight: 800;
  color: #333;
  margin-bottom: 1.5rem;
  position: relative;
}

h1::after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 50%;
  transform: translateX(-50%);
  width: 80px;
  height: 3px;
  background: #4CAF50; /* Matches .underline::after */
}

/* Form Styling */
.login-form {
  display: flex;
  flex-direction: column;
}

.form-group {
  margin-bottom: 1.5rem;
}

.label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

label {
  display: block;
  color: #555;
  font-weight: 600; /* Matches home page label weight */
  font-size: 1rem;
}

.forgot-password {
  font-size: 0.9rem;
  color: #2196F3; /* Matches secondary color */
  text-decoration: none;
  transition: color 0.3s ease;
}

.forgot-password:hover {
  color: #4CAF50; /* Hover matches primary color */
}

input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
  font-size: 1rem;
  transition: border-color 0.3s, box-shadow 0.3s;
  background: #fff;
}

input:focus {
  border-color: #4CAF50; /* Matches primary color */
  box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.2); /* Matches gradient-overlay */
  outline: none;
}

.password-container {
  position: relative;
}

.password-toggle-icon {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  color: #555;
  font-size: 1rem;
  transition: color 0.3s ease;
}

.password-toggle-icon:hover {
  color: #4CAF50; /* Matches primary color */
}

.input-error {
  color: #f44336;
  font-size: 0.85rem;
  margin-top: 0.25rem;
  display: block;
}

/* Button Styling */
.login-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 50px; /* Matches home page buttons */
  cursor: pointer;
  transition: all 0.3s ease;
  background: #4CAF50; /* Primary color */
  color: white;
  border: none;
  margin-top: 1rem;
}

.login-btn:disabled {
  background: #cccccc;
  cursor: not-allowed;
}

.login-btn:hover:not(:disabled) {
  background: #388E3C; /* Darker green, matches primary-btn:hover */
  transform: translateY(-2px); /* Matches home page hover effect */
}

.arrow-icon {
  margin-left: 8px;
}

/* Error Message */
.error-message {
  color: #f44336;
  font-size: 1rem;
  margin-top: 1rem;
  text-align: center;
  padding: 0.5rem;
  background: #fff; /* Matches home page .error */
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(244, 67, 54, 0.1);
}

/* Admin Link */
.admin-link {
  margin-top: 1.5rem;
  text-align: center;
  font-size: 0.9rem;
  color: #666; /* Matches section-subtitle */
}

.admin-link a {
  color: #2196F3; /* Matches secondary color */
  text-decoration: none;
  transition: color 0.3s ease;
}

.admin-link a:hover {
  color: #4CAF50; /* Matches primary color */
}

/* Animation */
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Responsive Design */
@media (max-width: 768px) {
  .login-container {
    margin: 2rem 1rem;
    padding: 1.5rem;
  }

  h1 {
    font-size: 2rem;
  }

  .login-btn {
    padding: 0.75rem;
  }
}
</style>