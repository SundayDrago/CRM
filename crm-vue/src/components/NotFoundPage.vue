<template>
    <div class="not-found">
      <h1>404 - Page Not Found</h1>
      <p>Oops! The page you are looking for does not exist.</p>
      <router-link to="/admin" class="home-link">Back</router-link>
    </div>
  </template>
  
  <script>
  export default {
    name: 'NotFoundPage',
  };
  </script>
  
  <style scoped>
  .not-found {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100vh;
    text-align: center;
    background-color: #f4f4f4;
  }
  
  h1 {
    font-size: 2em;
    color: #ff5733;
  }
  
  p {
    font-size: 1.2em;
    color: #555;
  }
  
  .home-link {
    margin-top: 20px;
    padding: 10px 15px;
    background-color: #007bff;
    color: white;
    text-decoration: none;
    border-radius: 5px;
    transition: background 0.3s;
  }
  
  .home-link:hover {
    background-color: #0056b3;
  }
  </style>
  