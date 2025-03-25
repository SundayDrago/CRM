<template>
  <div class="login-page">
    <!-- Back to Home Button with Arrow -->
    <router-link to="/" class="back-to-home">
      <i class="fas fa-arrow-left"></i> Back to Home
    </router-link>

    <h2>Login to Your Account</h2>

    <form @submit.prevent="login">
      <!-- Email Input -->
      <div class="input-group">
        <label for="email">Email:</label>
        <input type="email" v-model="email" id="email" required placeholder="Enter your email" />
      </div>

      <!-- Password Input with Toggle -->
      <div class="input-group">
        <label for="password">Password:</label>
        <div class="password-input">
          <input :type="showPassword ? 'text' : 'password'" v-model="password" id="password" required placeholder="Enter your password" />
          <span @click="togglePassword" class="eye-icon">
            <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
          </span>
        </div>
      </div>

      <!-- Login Button -->
      <button type="submit">Login</button>

      <!-- Links -->
      <p>
        <router-link to="/forgot-password" class="forgot-password">Forgot password?</router-link>
      </p>
      <p>
        Don't have an account? 
        <router-link to="/register">Register here</router-link>
      </p>
    </form>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "LoginPage",
  data() {
    return {
      email: "",
      password: "",
      showPassword: false,
    };
  },
  methods: {
    async login() {
      try {
        // Call the backend login API
        const response = await axios.post("http://localhost:5000/api/admin/login", {
          email: this.email,
          password: this.password,
        });

        // If login is successful, store the JWT token in localStorage
        localStorage.setItem("authToken", response.data.token);

        // Navigate to the admin dashboard
        this.$router.push("/admin");
      } catch (error) {
        // Handle login errors
        alert(error.response?.data?.message || "Login failed. Please try again.");
      }
    },
    togglePassword() {
      this.showPassword = !this.showPassword;
    }
  }
};
</script>

<style scoped>
/* ===== LOGIN PAGE STYLES ===== */
.login-page {
  max-width: 400px;
  margin: 50px auto;
  text-align: center;
  background-color: #ffffff;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

/* Back to Home Button */
.back-to-home {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  color: #007bff;
  font-size: 1em;
  font-weight: bold;
  text-decoration: none;
  margin-bottom: 20px;
  transition: color 0.3s ease-in-out;
}

.back-to-home i {
  margin-right: 8px;
  font-size: 1.2em;
}

.back-to-home:hover {
  color: #0056b3;
  text-decoration: underline;
}

/* Title */
h2 {
  font-size: 1.8em;
  margin-bottom: 20px;
  color: #007bff;
}

/* Input Group */
.input-group {
  margin-bottom: 15px;
  text-align: left;
}

label {
  display: block;
  font-weight: bold;
  margin-bottom: 5px;
}

/* Input Fields */
input {
  width: 100%;
  padding: 10px;
  font-size: 1em;
  border: 1px solid #ccc;
  border-radius: 5px;
  outline: none;
  transition: border 0.3s;
}

input:focus {
  border: 1px solid #007bff;
}

/* Password Input */
.password-input {
  position: relative;
  display: flex;
  align-items: center;
}

.password-input input {
  padding-right: 35px;
}

.eye-icon {
  position: absolute;
  right: 10px;
  cursor: pointer;
  font-size: 18px;
  color: #555;
}

.eye-icon:hover {
  color: #007bff;
}

/* Login Button */
button {
  width: 100%;
  padding: 12px;
  font-size: 1.2em;
  background-color: #007bff;
  color: white;
  border: none;
  cursor: pointer;
  border-radius: 5px;
  transition: background-color 0.3s;
}

button:hover {
  background-color: #0056b3;
}

/* Links */
p {
  margin-top: 10px;
  font-size: 0.9em;
  color: #333;
}

p a {
  color: #007bff;
  font-weight: bold;
  text-decoration: none;
  transition: color 0.3s;
}

p a:hover {
  color: #0056b3;
  text-decoration: underline;
}

/* Forgot Password */
.forgot-password {
  display: block;
  margin-top: 10px;
  font-size: 0.9em;
  color: #ff5733;
  font-weight: bold;
  text-decoration: none;
  transition: color 0.3s;
}

.forgot-password:hover {
  color: #c70039;
  text-decoration: underline;
}

/* Responsive Design */
@media (max-width: 480px) {
  .login-page {
    width: 90%;
    padding: 20px;
  }

  h2 {
    font-size: 1.5em;
  }

  button {
    font-size: 1em;
    padding: 10px;
  }

  .back-to-home {
    font-size: 0.9em;
  }

  .back-to-home i {
    font-size: 1em;
  }
}
</style>
