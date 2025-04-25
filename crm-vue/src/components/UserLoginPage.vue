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
      showPassword: false
    }
  },
  computed: {
    isFormValid() {
      return this.email && !this.emailError && 
             this.password && !this.passwordError;
    }
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
        const response = await axios.post('http://localhost:5000/api/user/login', {
          email: this.email,
          password: this.password
        });
        console.log('Response:', response);
        const { data } = response;
        console.log('Response Data:', data);

        if (data.token) {
          await new Promise(resolve => setTimeout(resolve, 100)); // Brief delay
          localStorage.setItem('authToken', data.token);
          console.log('Token stored:', localStorage.getItem('authToken'));
          const redirectPath = data.redirect || '/users-dashboard';
          console.log('Redirecting to:', redirectPath);
          try {
            await this.$router.push(redirectPath);
          } catch (err) {
            console.error('Router push error:', err);
            this.errorMessage = 'Failed to redirect to dashboard';
          }
        } else {
          throw new Error('Authentication token not received');
        }
      } catch (error) {
        console.error('Full Error:', error);
        if (error.response) {
          console.error('Error Response:', error.response);
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
    }
  }
}
</script>

<style scoped>
.login-container {
  max-width: 400px;
  margin: 0 auto;
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

h1 {
  text-align: center;
  color: #333;
  margin-bottom: 1.5rem;
}

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

input {
  width: 100%;
  padding: 0.75rem;
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
}

.password-toggle-icon:hover {
  color: #007bff;
}

.input-error {
  color: #dc3545;
  font-size: 0.85rem;
  margin-top: 0.25rem;
  display: block;
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
}

.login-btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.login-btn:hover:not(:disabled) {
  background-color: #0069d9;
}

.error-message {
  color: #dc3545;
  margin-top: 1rem;
  text-align: center;
  padding: 0.5rem;
  background-color: #f8d7da;
  border-radius: 4px;
}

.admin-link {
  margin-top: 1rem;
  text-align: center;
  font-size: 0.9rem;
  color: #555;
}

.admin-link a {
  color: #007bff;
  text-decoration: none;
}

.admin-link a:hover {
  text-decoration: underline;
}
</style>