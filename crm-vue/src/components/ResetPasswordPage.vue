<template>
    <div class="reset-password-container">
      <div class="card">
        <h2>Reset Your Password</h2>
        <p>Enter your new password below.</p>
        <form @submit.prevent="resetPassword">
          <div class="form-group">
            <label for="newPassword">New Password</label>
            <input type="password" id="newPassword" v-model="newPassword" required />
          </div>
          <div class="form-group">
            <label for="confirmPassword">Confirm Password</label>
            <input type="password" id="confirmPassword" v-model="confirmPassword" required />
          </div>
          <button type="submit">Reset Password</button>
          <p v-if="errorMessage">{{ errorMessage }}</p>
          <p v-if="successMessage">{{ successMessage }}</p>
        </form>
      </div>
    </div>
  </template>
  
  <script>
  import { useRoute } from "vue-router";
  import axios from "axios";
  
  export default {
    data() {
      return {
        newPassword: "",
        confirmPassword: "",
        errorMessage: "",
        successMessage: "",
      };
    },
    setup() {
      const route = useRoute();
      return { route };
    },
    methods: {
      async resetPassword() {
        if (this.newPassword !== this.confirmPassword) {
          this.errorMessage = "Passwords do not match.";
          return;
        }
        try {
          const response = await axios.post("http://localhost:5000/api/admin/reset-password", {
            token: this.route.params.token,
            newPassword: this.newPassword,
          });
          this.successMessage = response.data.message;
          this.errorMessage = "";
        } catch (error) {
          this.errorMessage = error.response?.data?.message || "Something went wrong.";
        }
      },
    },
  };
  </script>
  