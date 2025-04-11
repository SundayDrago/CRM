<!-- UserLoginPage.vue -->
<template>
  <div class="login-container">
    <h2>User Login</h2>
    <form @submit.prevent="handleLogin">
      <div class="form-group">
        <label for="email">Email</label>
        <input
          id="email"
          v-model="email"
          type="email"
          placeholder="Enter your email"
          required
          @input="clearError"
        />
      </div>
      <div class="form-group">
        <label for="password">Password</label>
        <input
          id="password"
          v-model="password"
          type="password"
          placeholder="Enter your password"
          required
          @input="clearError"
        />
      </div>
      <button type="submit" :disabled="loading">
        {{ loading ? 'Logging in...' : 'Login' }}
      </button>
    </form>
    <p v-if="error" class="error">{{ error }}</p>
    <p v-if="success" class="success">{{ success }}</p>
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
      error: '',
      success: '',
    };
  },
  methods: {
    clearError() {
      this.error = ''; // Clear error when user starts typing
    },
    async handleLogin() {
      this.loading = true;
      this.error = '';
      this.success = '';

      // Basic input validation
      if (!this.email || !this.password) {
        this.error = 'Please enter both email and password.';
        this.loading = false;
        return;
      }

      try {
        // Step 1: Attempt login
        const loginResponse = await axios.post('http://localhost:5000/api/user/login', {
          email: this.email,
          password: this.password,
        }, {
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const { token } = loginResponse.data;
        if (!token) {
          throw new Error('No token received from server.');
        }

        // Store token
        localStorage.setItem('authToken', token);

        // Step 2: Verify user role
        const profileResponse = await axios.get('http://localhost:5000/api/user/login', {
          headers: { Authorization: `Bearer ${token}` },
        });

        const user = profileResponse.data;
        if (user.isAdmin) {
          this.error = 'Admin accounts cannot log in here. Please use the admin portal.';
          localStorage.removeItem('authToken');
          this.loading = false;
          return;
        }

        // Step 3: Successful login for non-admin user
        this.success = 'Login successful! Redirecting...';
        setTimeout(() => {
          this.$router.push('/users-dashboard');
        }, 1000); // Brief delay to show success message

      } catch (error) {
        // Detailed error handling
        if (error.response) {
          // Server responded with a status other than 2xx
          const status = error.response.status;
          const message = error.response.data?.message || 'Unknown error';
          if (status === 401) {
            this.error = 'Invalid email or password.';
          } else if (status === 403) {
            this.error = 'Access denied. Admins cannot log in here.';
          } else {
            this.error = `Login failed: ${message} (Status: ${status})`;
          }
        } else if (error.request) {
          // No response received (e.g., network error)
          this.error = 'Failed to connect to the server. Please check your network.';
        } else {
          // Other errors (e.g., setup or client-side issue)
          this.error = `Login error: ${error.message}`;
        }
        console.error('Login error details:', error);
        localStorage.removeItem('authToken'); // Clear invalid token
      } finally {
        this.loading = false;
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