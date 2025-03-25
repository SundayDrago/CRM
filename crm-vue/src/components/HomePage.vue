<template>
  <div class="home">
    <!-- Header Section -->
    <header>
      <h1>Customer Segmentation System</h1>
      <p>Gain insights and improve customer satisfaction through advanced segmentation tools.</p>
      <button @click="showLoginPrompt">Get Started</button>
    </header>

    <!-- Features Section -->
    <section class="features">
      <h2>Key Features</h2>
      <div class="feature-list">
        <div class="feature animate__animated animate__fadeInUp" v-for="(feature, index) in features" :key="index">
          <h3>{{ feature.title }}</h3>
          <p>{{ feature.description }}</p>
        </div>
      </div>
    </section>

    <!-- Call-To-Action (CTA) Section -->
    <section class="cta">
      <h2>Ready to Transform Your Business?</h2>
      <button @click="showLoginPrompt">Get Started Now</button>
    </section>

    <!-- Footer Section -->
    <footer>
      <p>© 2025 Customer Segmentation System. All rights reserved.</p>
      <nav>
        <a href="#">Privacy Policy</a> | 
        <a href="#">Terms of Service</a> | 
        <router-link to="/contact-us">Contact Us</router-link>
      </nav>
    </footer>
  </div>
</template>

<script>
import { useRouter } from 'vue-router';

export default {
  setup() {
    const router = useRouter();

    // Function to navigate to the login page
    function showLoginPrompt() {
      router.push('/login');
    }

    // Function to navigate to the Contact Us page
    function goToContact() {
      router.push('/contact-us'); // Corrected path
    }

    // Features List
    const features = [
      { title: "AI-Driven Insights", description: "Utilize machine learning to analyze customer behavior and predict trends." },
      { title: "Custom Segmentation", description: "Create highly targeted customer groups based on demographics and behavior." },
      { title: "Real-time Analytics", description: "Track customer engagement and adjust strategies in real-time." }
    ];

    return { showLoginPrompt, goToContact, features };
  }
};
</script>

<style scoped>
/* General Styling */
.home {
  text-align: center;
  padding: 20px;
  background-color: #f9f9f9;
  color: #333;
}

/* Header */
header {
  padding: 50px 20px;
}

h1 {
  font-size: 2.5em;
  color: #007bff;
  margin-bottom: 10px;
}

p {
  font-size: 1.2em;
  color: #555;
  max-width: 600px;
  margin: 0 auto 20px;
}

/* Buttons */
button {
  padding: 15px 30px;
  background-color: #007bff;
  color: white;
  border: none;
  cursor: pointer;
  border-radius: 5px;
  font-size: 1.1em;
  transition: 0.3s;
}

button:hover {
  background-color: #0056b3;
  transform: scale(1.05);
}

/* Features Section Animation */
.features {
  background: white;
  padding: 40px 20px;
  overflow: hidden;
}

.features h2 {
  color: #007bff;
  font-size: 2em;
  margin-bottom: 20px;
}

.feature-list {
  display: flex;
  justify-content: center;
  gap: 20px;
}

.feature {
  background: #e3f2fd;
  padding: 20px;
  border-radius: 8px;
  max-width: 300px;
  opacity: 0;
  transform: translateY(30px);
  animation: fadeSlideUp 0.8s ease-out forwards;
}

/* Animate each feature with delay */
.feature:nth-child(1) { animation-delay: 0.2s; }
.feature:nth-child(2) { animation-delay: 0.4s; }
.feature:nth-child(3) { animation-delay: 0.6s; }

@keyframes fadeSlideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* CTA Background Animation */
.cta {
  background: linear-gradient(270deg, #007bff, #0056b3, #003f7f);
  background-size: 600% 600%;
  animation: gradientShift 6s ease infinite;
  color: white;
  padding: 40px 20px;
  border-radius: 10px;
  transition: transform 0.3s ease;
}

.cta:hover {
  transform: scale(1.02);
}

@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

/* Footer */
footer {
  background: #333;
  color: white;
  padding: 20px;
  margin-top: 20px;
}

footer nav a {
  color: #bbb;
  text-decoration: none;
  margin: 0 10px;
}

footer nav a:hover {
  color: white;
}

/* Mobile Responsiveness */
@media (max-width: 768px) {
  .feature-list {
    flex-direction: column;
    align-items: center;
  }
}
</style>
