<template>
  <div class="register-page">
    <h2>Admin Registration</h2>
    <form @submit.prevent="register">
      <div>
        <label for="fullName">Full Name:</label>
        <input type="text" v-model="fullName" id="fullName" required />
      </div>

      <div>
        <label for="username">Username:</label>
        <input type="text" v-model="username" id="username" required />
      </div>

      <div>
        <label for="email">Email:</label>
        <input type="email" v-model="email" id="email" required />
      </div>

      <div>
        <label for="password">Password:</label>
        <div class="password-container">
          <input :type="showPassword ? 'text' : 'password'" v-model="password" id="password" required />
          <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'" class="toggle-icon" @click="togglePasswordVisibility('password')"></i>
        </div>
      </div>

      <div>
        <label for="confirmPassword">Confirm Password:</label>
        <div class="password-container">
          <input :type="showConfirmPassword ? 'text' : 'password'" v-model="confirmPassword" id="confirmPassword" required />
          <i :class="showConfirmPassword ? 'fas fa-eye-slash' : 'fas fa-eye'" class="toggle-icon" @click="togglePasswordVisibility('confirmPassword')"></i>
        </div>
      </div>

      <div class="checkbox">
        <input type="checkbox" id="terms" v-model="termsAccepted" required />
        <label for="terms">I agree to the terms and conditions</label>
      </div>

      <button type="submit">Register</button>
      <p>Already have an account? <router-link to="/login">Login here</router-link></p>
    </form>
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
    };
  },
  methods: {
    async register() {
      const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordRegex.test(this.password)) {
        alert("Password must be at least 8 characters long and include a number and special character.");
        return;
      }

      if (this.password !== this.confirmPassword) {
        alert("Passwords don't match.");
        return;
      }

      if (!this.termsAccepted) {
        alert("You must accept the terms and conditions.");
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
        console.error("Registration error:", error);
        alert(error.response?.data?.message || "Registration failed. Please try again.");
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
.register-page {
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

.password-container {
  position: relative;
  display: flex;
  align-items: center;
}

.password-container input {
  flex-grow: 1;
  padding-right: 30px;
}

.toggle-icon {
  position: absolute;
  right: 10px;
  cursor: pointer;
  font-size: 1.2em;
  color: #007bff;
  transition: color 0.3s;
}

.toggle-icon:hover {
  color: #0056b3;
}

input {
  margin: 10px 0;
  padding: 10px;
  font-size: 1em;
  border: 1px solid #ccc;
  border-radius: 5px;
  width: 100%;
}

.checkbox {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 10px;
}

.checkbox input {
  margin-right: 5px;
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
</style>
