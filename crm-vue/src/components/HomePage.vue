<template>
  <div class="home">
    <h1>Customer Segmentation System</h1>
    <p>Gain insights and improve customer satisfaction through advanced segmentation tools.</p>
    <button @click="showLoginPrompt">Get Started </button>
  </div>
</template>

<script>
import { useRouter } from 'vue-router';
export default {
  // name: 'HomePage',
  // methods: {
  //   showLoginPrompt() {
  //     this.$router.push('/login');  // Adjust as needed if you're using Vue Router
  //   }
  // }
  setup(){
    const router = useRouter();
    function showLoginPrompt(){
      router.push('/login');
    }
    return {showLoginPrompt};
  }
}
</script>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  height: 100vh;
  padding: 20px;
  background-color: #f9f9f9; /* Light background for contrast */
  color: #333; /* Dark text for readability */
}

h1 {
  font-size: 2.5em;
  color: #007bff; /* Blue header for a professional look */
  margin-bottom: 20px;
}

p {
  font-size: 1.2em;
  color: #555;
  margin-bottom: 20px;
  max-width: 600px; /* Limit the width of the paragraph for better layout */
}

button {
  padding: 15px 30px;
  background-color: #007bff;
  color: white;
  border: none;
  cursor: pointer;
  border-radius: 5px;
  font-size: 1.1em;
  transition: background-color 0.3s ease;
}

button:hover {
  background-color: #0056b3; /* Darker blue */
  transform: scale(1.1); /* Slight zoom effect on hover */
}

button:active {
  background-color: #003f7f; /* Darker blue on click */
  transform: scale(1.05); /* Slightly smaller on click */
}

button:focus {
  outline: none;
  box-shadow: 0 0 0 4px rgba(0, 123, 255, 0.5); /* Blue outline on focus */
}

@media (max-width: 768px) {
  /* Responsive design for mobile */
  h1 {
    font-size: 2em;
  }
  p {
    font-size: 1.1em;
  }
}
</style>
