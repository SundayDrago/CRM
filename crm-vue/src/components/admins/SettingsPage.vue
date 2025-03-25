<template>
    <div class="settings-page">
      <!-- Profile Settings Section -->
      <h1>Settings</h1>
      <section class="settings-section">
        <h3>Profile Settings</h3>
        <form @submit.prevent="updateProfile">
          <div class="form-group">
            <label for="name">Full Name</label>
            <input type="text" id="name" v-model="admin.name" required />
          </div>
          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" v-model="admin.email" required />
          </div>
          <button type="submit" class="save-btn">Save Profile</button>
        </form>
      </section>
  
      <!-- Security Settings Section -->
      <section class="settings-section">
        <h3>Security Settings</h3>
        <form @submit.prevent="updatePassword">
          <div class="form-group">
            <label for="currentPassword">Current Password</label>
            <input type="password" id="currentPassword" v-model="passwords.current" required />
          </div>
          <div class="form-group">
            <label for="newPassword">New Password</label>
            <input type="password" id="newPassword" v-model="passwords.new" required />
          </div>
          <div class="form-group">
            <label for="confirmPassword">Confirm New Password</label>
            <input type="password" id="confirmPassword" v-model="passwords.confirm" required />
          </div>
          <button type="submit" class="save-btn">Change Password</button>
        </form>
      </section>
    </div>
  </template>
  
  <script>
  export default {
    name: "SettingsPage",
    data() {
      return {
        admin: {
          name: "Admin Name",
          email: "admin@example.com",
        },
        passwords: {
          current: "",
          new: "",
          confirm: "",
        },
      };
    },
    methods: {
      async updateProfile() {
        // Handle profile update here
        alert("Profile updated successfully!");
      },
      async updatePassword() {
        if (this.passwords.new !== this.passwords.confirm) {
          alert("Passwords do not match!");
          return;
        }
        // Handle password update here
        alert("Password updated successfully!");
      },
    },
  };
  </script>
  
  <style scoped>
  .settings-page {
    margin: 30px;
    display: flex;
    flex-direction: column;
    gap: 40px;
  }
  
  .settings-section {
    background-color: #ffffff;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  }
  
  h3 {
    color: #007bff;
    font-size: 1.6em;
    margin-bottom: 20px;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  
  form {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  
  .form-group {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }
  
  label {
    font-size: 1.1em;
    color: #333;
  }
  
  input {
    padding: 12px;
    font-size: 1em;
    border-radius: 5px;
    border: 1px solid #ccc;
    background-color: #f9f9f9;
  }
  
  input:focus {
    outline: none;
    border-color: #007bff;
    background-color: #fff;
  }
  
  button {
    padding: 12px;
    background-color: #007bff;
    color: white;
    border: none;
    cursor: pointer;
    border-radius: 5px;
    font-size: 1.1em;
    transition: background-color 0.3s ease;
  }
  
  button:hover {
    background-color: #0056b3;
  }
  
  .save-btn {
    align-self: flex-start;
  }
  </style>
  