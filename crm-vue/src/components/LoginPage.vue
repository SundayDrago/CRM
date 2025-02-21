<template>
  <div class="login-page">
    <h2>Login to Your Account</h2>
    <form @submit.prevent="login">
      <div>
        <label for="email">Email:</label>
        <input type="email" v-model="email" id="email" required />
      </div>
      <div>
        <label for="password">Password:</label>
        <div class="password-input">
          <input :type="showPassword ? 'text' : 'password'" v-model="password" id="password" required />
          <span @click="togglePassword" class="eye-icon">
            <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
          </span>
        </div>
      </div>
      <button type="submit">Login</button>
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
      showPassword: false
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
.login-page {
  max-width: 400px;
  margin: 50px auto;
  text-align: center;
  background-color: #f4f4f9;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

h2 {
  font-size: 1.8em;
  margin-bottom: 20px;
  color: #007bff;
}

form {
  display: flex;
  flex-direction: column;
}

label {
  text-align: left;
  margin-bottom: 5px;
  font-weight: bold;
}

.password-input {
  display: flex;
  align-items: center;
  position: relative;
}

.password-input input {
  width: 100%;
  padding: 10px;
  font-size: 1em;
  border: 1px solid #ccc;
  border-radius: 5px;
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

input {
  margin: 10px 0;
  padding: 10px;
  font-size: 1em;
  border: 1px solid #ccc;
  border-radius: 5px;
  width: 100%;
}

button {
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
</style>
