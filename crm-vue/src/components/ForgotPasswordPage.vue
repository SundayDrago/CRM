<template>
    <div class="forgot-password-page">
      <h2>Reset Your Password</h2>
      <p>Enter your email address below to receive a password reset link.</p>
      <form @submit.prevent="sendResetLink">
        <div>
          <label for="email">Email:</label>
          <input type="email" v-model="email" id="email" required />
        </div>
        <button type="submit">Send Reset Link</button>
        <p>
          Remembered your password? 
          <router-link to="/login">Go back to Login</router-link>
        </p>
      </form>
      <p v-if="message" class="message">{{ message }}</p>
    </div>
  </template>
  
  <script>
  import axios from "axios";
  
  export default {
    name: "ForgotPasswordPage",
    data() {
      return {
        email: "",
        message: "",
      };
    },
    methods: {
      async sendResetLink() {
        try {
          const response = await axios.post("http://localhost:5000/api/admin/forgot-password", {
            email: this.email,
          });
          this.message = response.data.message || "A reset link has been sent to your email.";
        } catch (error) {
          this.message = error.response?.data?.message || "Something went wrong. Please try again.";
        }
      },
    },
  };
  </script>
  
  <style scoped>
  .forgot-password-page {
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
    margin-bottom: 10px;
    color: #007bff;
  }
  
  p {
    font-size: 0.9em;
    color: #555;
  }
  
  form {
    display: flex;
    flex-direction: column;
    margin-top: 15px;
  }
  
  label {
    text-align: left;
    margin-bottom: 5px;
    font-weight: bold;
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
  
  .message {
    margin-top: 15px;
    font-size: 0.9em;
    color: green;
    font-weight: bold;
  }
  
  .router-link {
    color: #007bff;
    font-weight: bold;
    text-decoration: none;
  }
  
  .router-link:hover {
    text-decoration: underline;
  }
  </style>
  