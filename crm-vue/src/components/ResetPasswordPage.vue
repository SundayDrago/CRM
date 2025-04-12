<template>
  <div class="reset-password-container">
    <div class="card">
      <h2>Reset Your Password</h2>
      <p>Enter your new password below.</p>

      <form @submit.prevent="resetPassword">
        <div class="form-group">
          <label for="newPassword">New Password</label>
          <div class="password-wrapper">
            <input
              :type="showNewPassword ? 'text' : 'password'"
              id="newPassword"
              v-model="newPassword"
              required
            />
            <span class="toggle-password" @click="toggleNewPassword">
              {{ showNewPassword ? "🙈" : "👁️" }}
            </span>
          </div>
        </div>

        <div class="form-group">
          <label for="confirmPassword">Confirm Password</label>
          <div class="password-wrapper">
            <input
              :type="showConfirmPassword ? 'text' : 'password'"
              id="confirmPassword"
              v-model="confirmPassword"
              required
            />
            <span class="toggle-password" @click="toggleConfirmPassword">
              {{ showConfirmPassword ? "🙈" : "👁️" }}
            </span>
          </div>
        </div>

        <button type="submit" class="reset-button" :disabled="loading">Reset Password</button>
        <button type="button" class="back-button" @click="goToLogin">Back to Login</button>

        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
        <p v-if="successMessage" class="success-message">{{ successMessage }}</p>
      </form>
    </div>
  </div>
</template>

<script>
import { useRoute, useRouter } from "vue-router";
import axios from "axios";

export default {
  data() {
    return {
      newPassword: "",
      confirmPassword: "",
      showNewPassword: false, // Toggle for new password visibility
      showConfirmPassword: false, // Toggle for confirm password visibility
      errorMessage: "",
      successMessage: "",
      loading: false, // Prevent multiple submissions
    };
  },
  setup() {
    const route = useRoute();
    const router = useRouter();

    const goToLogin = () => {
      router.push("/login");
    };

    return { route, goToLogin };
  },
  methods: {
    toggleNewPassword() {
      this.showNewPassword = !this.showNewPassword;
    },
    toggleConfirmPassword() {
      this.showConfirmPassword = !this.showConfirmPassword;
    },
    async resetPassword() {
      if (this.newPassword !== this.confirmPassword) {
        this.errorMessage = "Passwords do not match.";
        return;
      }

      this.loading = true;
      this.errorMessage = "";
      this.successMessage = "";

      try {
        const response = await axios.post("http://localhost:5000/api/admin/reset-password", {
          token: this.route.params.token,
          newPassword: this.newPassword,
        });
        this.successMessage = response.data.message || "Password reset successfully!";
        setTimeout(() => {
          this.goToLogin();
        }, 2000); // Redirect to login after 2 seconds
      } catch (error) {
        this.errorMessage = error.response?.data?.message || "Something went wrong.";
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
/* Container */
.reset-password-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: #f8f9fa;
  padding: 20px;
}

/* Card */
.card {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  max-width: 400px;
  width: 100%;
  text-align: center;
}

/* Form */
.form-group {
  text-align: left;
  margin-bottom: 15px;
}

label {
  font-weight: bold;
  display: block;
  margin-bottom: 5px;
}

.password-wrapper {
  position: relative;
}

input {
  width: 100%;
  padding: 12px;
  padding-right: 40px; /* Space for the toggle */
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 1em;
  transition: border 0.3s ease;
  background: #fff;
}

input:focus {
  border-color: #007bff;
  outline: none;
  box-shadow: 0 0 5px rgba(0, 123, 255, 0.3);
}

.toggle-password {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  font-size: 1.2em;
  color: #666;
  user-select: none; /* Prevent text selection */
}

.toggle-password:hover {
  color: #333;
}

/* Reset Button */
.reset-button {
  width: 100%;
  padding: 14px;
  background: #007bff;
  color: white;
  font-size: 1.1em;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.3s, transform 0.2s;
  margin-top: 10px;
}

.reset-button:hover:not(:disabled) {
  background: #0056b3;
  transform: scale(1.05);
}

.reset-button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

/* Back to Login Button */
.back-button {
  width: 100%;
  padding: 14px;
  background: #6c757d;
  color: white;
  font-size: 1.1em;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.3s, transform 0.2s;
  margin-top: 10px;
}

.back-button:hover {
  background: #5a6268;
  transform: scale(1.05);
}

/* Messages */
.error-message {
  color: #dc3545;
  margin-top: 10px;
  font-size: 0.9em;
}

.success-message {
  color: #28a745;
  margin-top: 10px;
  font-size: 0.9em;
}
</style>