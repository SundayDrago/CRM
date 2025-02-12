<template>
    <footer class="footer">
      <div class="footer-content">
        <p>&copy; {{ currentYear }} CRM Systems By Drago && Samuel. All rights reserved.</p>
      </div>
    </footer>
  </template>
  
  <script>
  export default {
    name: "AppFooter",
    data() {
      return {
        currentYear: new Date().getFullYear(),
      };
    },
  };
  </script>
  
  <style scoped>
  .footer {
    background-color: #007bff;
    color: white;
    padding: 15px;
    text-align: center;  /* Ensures the text is centered */
    position: fixed;
    bottom: 0;
    left: 0;  /* Ensures the footer is aligned to the left side */
    right: 0;  /* Ensures the footer spans across the entire width */
    width: 100%;
  }
  
  .footer-content p {
    margin: 0;
    font-size: 0.9em;
  }
  </style>
  