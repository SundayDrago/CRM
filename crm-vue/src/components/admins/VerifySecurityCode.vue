<template>
    <div class="verify-page">
      <h2>Verify Your Account</h2>
      <form @submit.prevent="verify">
        <div>
          <label for="email">Email:</label>
          <input type="email" v-model="email" id="email" required readonly />
        </div>
  
        <div>
          <label for="securityCode">Security Code:</label>
          <input type="text" v-model="securityCode" id="securityCode" required />
        </div>
  
        <button type="submit">Verify</button>
      </form>
    </div>
  </template>
  
  <script>
  import axios from "axios";
  
  export default {
    name: "VerifySecurityCode",
    data() {
      return {
        email: "sundaydrago120@gmail.com", // Hardcoded for testing
        securityCode: ""
      };
    },
    methods: {
      async verify() {
        if (!this.email || !this.securityCode) {
          alert("Email and security code are required.");
          return;
        }
  
        // Log data before sending request
        console.log("Verification data:", {
          email: this.email,
          securityCode: this.securityCode
        });
  
        try {
          const response = await axios.post("http://localhost:5000/api/admin/verify-security-code", {
            email: this.email,
            securityCode: this.securityCode
          });
  
          alert(response.data.message);
          this.$router.push("/login"); // Redirect to login after successful verification
        } catch (error) {
          console.error("Verification error:", error);
          alert(error.response?.data?.message || "Verification failed. Please try again.");
        }
      }
    }
  };
  </script>
  
  <style scoped>
  .verify-page {
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
  </style>
  