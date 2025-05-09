<template>
  <div class="landing-page">
    <!-- Gradient Background Hero Section -->
    <section class="hero-section">
      <div class="gradient-overlay"></div>
      <div class="hero-container">
        <div class="hero-content">
          <div class="hero-text">
            <h1>
              <span class="gradient-text">Smarter</span> Customer Segmentation
              <span class="highlight-circle"></span>
            </h1>
            <p class="subtitle">AI-powered insights that transform how you understand and engage your customers</p>
            <div class="cta-buttons">
              <button class="primary-btn" @click="showLoginPrompt">
                <span class="btn-icon">🔒</span> Admin Portal
              </button>
              <button class="secondary-btn" @click="navigateToGetStarted">
                <span class="btn-icon">🚀</span> User Dashboard
              </button>
            </div>
          </div>
          <div class="hero-image">
            <div class="floating-cards">
              <div class="card card-1">
                <div class="card-icon">📈</div>
                <p>45% higher engagement</p>
              </div>
              <div class="card card-2">
                <div class="card-icon">⏱️</div>
                <p>Real-time analytics</p>
              </div>
            </div>
            <img
              src="@/assets/dashboard-preview.png"
              alt="Customer segmentation dashboard"
              class="dashboard-preview floating"
            >
          </div>
        </div>
      </div>
      <div class="scrolling-brands">
        <div class="brands-track">
          <span>TRUSTED BY INNOVATORS</span>
          <div class="brand-logo">TechSolutions</div>
          <div class="brand-logo">GlobalRetail</div>
          <div class="brand-logo">NextGen</div>
          <div class="brand-logo">MarketLeaders</div>
          <div class="brand-logo">VisionaryCorp</div>
        </div>
      </div>
    </section>

    <!-- Features Section with Animated Cards -->
    <section class="features-section">
      <div class="section-intro">
        <h2>Powerful Features <span class="underline">Built for Results</span></h2>
        <p class="section-subtitle">Everything you need to turn customer data into business growth</p>
      </div>
      <div class="features-container">
        <div 
          v-for="(feature, index) in features" 
          :key="index"
          class="feature-card"
          :style="{ '--delay': index * 0.1 + 's' }"
        >
          <div class="feature-icon">{{ featureIcons[index] }}</div>
          <h3>{{ feature.title }}</h3>
          <p>{{ feature.description }}</p>
          <div class="feature-arrow">→</div>
        </div>
      </div>
    </section>

    <!-- Stats Section -->
<!-- Stats Section -->
<section class="stats-section">
  <div class="stat-item">
    <div class="stat-number" ref="stat1">Loading...</div>
    <div class="stat-label">Most Purchased Category</div>
  </div>
  <div class="stat-item">
    <div class="stat-number" ref="stat2">Loading...</div>
    <div class="stat-label">Best Region</div>
  </div>
  <div class="stat-item">
    <div class="stat-number" ref="stat3">Loading...</div>
    <div class="stat-label">Accuracy Level</div>
  </div>
</section>


    <!-- Testimonials Section with Slider Effect -->
    <div class="team-content">
    <h2>Our Team Members</h2>

  <div class="team-member">
    <img src="@/assets/img-3.jpg" alt="Member One" class="member-avatar">
    <div class="member-info">
      <h2 class="member-name">Geriga Sunday Drago</h2>
      <p class="member-skills"><strong>Skills:</strong> Frontend Development, UI/UX Design</p>
      <p class="member-contribution"><strong>Contribution:</strong> Designed and implemented the user interface, ensuring responsive and accessible layouts using Vue.js and SCSS.</p>
    </div>
  </div>

  <div class="team-member">
    <img src="@/assets/img-2.jpg" alt="Member Two" class="member-avatar">
    <div class="member-info">
      <h2 class="member-name">Akoldou Samuel Wel</h2>
      <p class="member-skills"><strong>Skills:</strong> Backend Development, Database Management</p>
      <p class="member-contribution"><strong>Contribution:</strong> Developed REST APIs with Node.js and Express, handled database integration with MySQL, and implemented secure authentication.</p>
    </div>
  </div>
</div>


    <!-- CTA Section with Parallax Effect -->
    <section class="cta-section">
      <div class="parallax-bg"></div>
      <div class="cta-content">
        <h2>Ready to Transform Your Customer Strategy?</h2>
        <p>Join industry leaders who are already seeing results</p>
        <button class="cta-button" @click="navigateToGetStarted">
          Start Your Free Trial
          <span class="arrow-icon">→</span>
        </button>
      </div>
    </section>

    <!-- Footer -->
    <footer class="main-footer">
      <div class="footer-content">
        <div class="footer-brand">
          <div class="logo">CustomerSeg</div>
          <p>Intelligent customer segmentation for the modern enterprise</p>
          <div class="social-links">
            <a href="#"><i class="fab fa-twitter"></i></a>
            <a href="#"><i class="fab fa-linkedin"></i></a>
            <a href="#"><i class="fab fa-facebook"></i></a>
          </div>
        </div>
        <div class="footer-links">
          <div class="link-group">
            <h4>Product</h4>
            <router-link to="/features">Features</router-link>
            <router-link to="/pricing">Pricing</router-link>
            <router-link to="/integrations">Integrations</router-link>
          </div>
          <div class="link-group">
            <h4>Resources</h4>
            <router-link to="/blog">Blog</router-link>
            <router-link to="/webinars">Webinars</router-link>
            <router-link to="/docs">Documentation</router-link>
          </div>
          <div class="link-group">
            <h4>Company</h4>
            <router-link to="/about-us">About Us</router-link>
            <router-link to="/careers">Careers</router-link>
            <router-link to="/contact-us">Contact</router-link>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <p>© 2025 CustomerSeg. All rights reserved.</p>
        <div class="legal-links">
          <router-link to="/privacy">Privacy Policy</router-link>
          <router-link to="/terms">Terms of Service</router-link>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { ref, onMounted } from 'vue';
import axios from 'axios';

const router = useRouter();
const isAdmin = ref(false);
const isAuthenticated = ref(false);

// Check authentication status
onMounted(async () => {
  try {
    const token = localStorage.getItem('authToken');
    if (token) {
      const response = await axios.get('/admin/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      isAuthenticated.value = true;
      isAdmin.value = response.data.isAdmin;
    }
    animateStats();
  } catch (error) {
    console.error('Auth check failed:', error);
    localStorage.removeItem('authToken');
  }
});

// Refs for DOM elements
const stat1 = ref(null); // Most Purchased Category
const stat2 = ref(null); // Best Region (as percentage)
const stat3 = ref(null); // Accuracy Level

// Animate function
const animate = (element, finalValue, suffix = '', duration = 2000) => {
  const start = 0;
  const increment = finalValue / (duration / 16);
  let current = start;
  const timer = setInterval(() => {
    current += increment;
    if (current >= finalValue) {
      clearInterval(timer);
      current = finalValue;
    }
    element.textContent = Math.floor(current) + suffix;
  }, 16);
}

// Fetch and apply backend stats
const animateStats = async () => {
  try {
    const response = await fetch('http://localhost:5000/query');
    const data = await response.json();

    // Most Purchased Category
    const category = data.most_purchased_category || 'Unknown';
    stat1.value.textContent = category;

    // Best Region (percentage)
    const percentage = parseFloat(data.percentage?.replace('%', '') || 0);
    animate(stat2.value, percentage, '%');

    // Accuracy Level (use average_spending here)
    const accuracy = parseFloat(data.average_spending || 0);
    animate(stat3.value, accuracy, '');
  } catch (error) {
    console.error('Failed to fetch stats:', error);
  }
};

onMounted(() => {
  animateStats();
});

// Features data
const features = [
  { 
    title: "AI-Powered Segmentation", 
    description: "Our machine learning algorithms automatically identify meaningful customer groups based on behavior patterns." 
  },
  { 
    title: "Real-Time Analytics", 
    description: "Get up-to-the-minute insights with our interactive dashboards and reporting tools." 
  },
  { 
    title: "Predictive Scoring", 
    description: "Identify high-value customers and predict churn before it happens with our advanced scoring system." 
  },
  { 
    title: "Campaign Automation", 
    description: "Launch targeted campaigns that automatically adjust based on segment performance and engagement." 
  },
  { 
    title: "Cross-Channel Integration", 
    description: "Seamlessly connect with your existing CRM, email, and advertising platforms." 
  },
  { 
    title: "Custom Reporting", 
    description: "Create tailored reports that highlight exactly the metrics that matter to your business." 
  }
];

const featureIcons = ['🧠', '📊', '🔮', '⚡', '🔄', '📈'];

// Login redirection based on authentication status
const showLoginPrompt = () => {
  if (isAuthenticated.value && isAdmin.value) {
    router.push('/admin');
  } else if (isAuthenticated.value) {
    router.push('/users-dashboard');
  } else {
    router.push('/login');
  }
};

const navigateToGetStarted = () => {
  if (isAuthenticated.value) {
    router.push('/users-dashboard');
  } else {
    router.push('/user-login');
  }
};
</script>


<style scoped lang="scss">
/* Color Variables */
:root {
  --primary: #6c5ce7;
  --primary-dark: #5649c0;
  --secondary: #00cec9;
  --accent: #fd79a8;
  --dark: #2d3436;
  --light: #f5f6fa;
  --gray: #636e72;
  --white: #ffffff;
  --gradient: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
}

/* Base Styles */
.landing-page {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  color: var(--dark);
  line-height: 1.6;
  overflow-x: hidden;
}

h1, h2, h3, h4 {
  font-weight: 800;
  margin: 0 0 1rem;
  line-height: 1.2;
  letter-spacing: -0.025em;
}

h1 {
  font-size: clamp(2.5rem, 5vw, 4rem);
}

h2 {
  font-size: clamp(2rem, 4vw, 3rem);
  position: relative;
  display: inline-block;
  
  .underline {
    position: relative;
    
    &::after {
      content: '';
      position: absolute;
      bottom: -5px;
      left: 0;
      width: 100%;
      height: 8px;
      background: var(--accent);
      z-index: -1;
      opacity: 0.3;
      border-radius: 4px;
    }
  }
}

p {
  margin: 0 0 1.5rem;
  color: var(--gray);
  font-size: 1.1rem;
  line-height: 1.7;
}

/* Hero Section */
.hero-section {
  position: relative;
  padding: 120px 5% 180px;
  color: var(--white);
  overflow: hidden;
  
  .gradient-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: var(--gradient);
    z-index: -2;
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: url('@/assets/hero-pattern.jpg') center/cover;
    opacity: 0.05;
    z-index: -1;
  }
}

.hero-container {
  max-width: 1400px;
  margin: 0 auto;
}

.hero-content {
  display: flex;
  align-items: center;
  gap: 60px;
}

.hero-text {
  flex: 1;
  
  h1 {
    position: relative;
    margin-bottom: 2rem;
    
    .gradient-text {
      background: linear-gradient(90deg, var(--white) 0%, var(--secondary) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .highlight-circle {
      position: absolute;
      top: -15px;
      right: -30px;
      width: 60px;
      height: 60px;
      background: var(--accent);
      border-radius: 50%;
      z-index: -1;
      opacity: 0.3;
    }
  }
  
  .subtitle {
    font-size: clamp(1.1rem, 2vw, 1.5rem);
    max-width: 600px;
    margin-bottom: 3rem;
    color: rgba(70, 68, 68, 0.9);
  }
}

.cta-buttons {
  display: flex;
  gap: 20px;
  
  .btn-icon {
    margin-right: 8px;
  }
}

.hero-image {
  flex: 1;
  position: relative;
  
  .dashboard-preview {
    width: 100%;
    max-width: 700px;
    border-radius: 20px;
    box-shadow: 0 30px 60px -10px rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.2);
    position: relative;
    z-index: 1;
    
    &.floating {
      animation: float 6s ease-in-out infinite;
    }
  }
}

.floating-cards {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  
  .card {
    position: absolute;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 16px;
    padding: 20px;
    width: 160px;
    box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.2);
    
    .card-icon {
      font-size: 1.8rem;
      margin-bottom: 10px;
    }
    
    p {
      font-size: 0.9rem;
      color: var(--white);
      margin: 0;
      line-height: 1.4;
    }
    
    &.card-1 {
      top: -20px;
      left: -40px;
      animation: float 4s ease-in-out infinite;
    }
    
    &.card-2 {
      bottom: -20px;
      right: -40px;
      animation: float 4s ease-in-out infinite 0.5s;
    }
  }
}

.scrolling-brands {
  position: absolute;
  bottom: 40px;
  left: 0;
  width: 100%;
  overflow: hidden;
  
  .brands-track {
    display: flex;
    align-items: center;
    gap: 40px;
    animation: scroll 30s linear infinite;
    white-space: nowrap;
    
    span {
      color: rgba(255, 255, 255, 0.7);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 2px;
      font-size: 0.8rem;
    }
  }
  
  .brand-logo {
    color: var(--white);
    font-weight: 700;
    font-size: 1.2rem;
    opacity: 0.8;
    transition: all 0.3s ease;
    
    &:hover {
      opacity: 1;
    }
  }
}

/* Features Section */
.features-section {
  padding: 120px 5%;
  background: var(--light);
  position: relative;
  
  .section-intro {
    text-align: center;
    max-width: 800px;
    margin: 0 auto 80px;
    
    .section-subtitle {
      font-size: 1.2rem;
      color: var(--gray);
    }
  }
}

.features-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
  max-width: 1200px;
  margin: 0 auto;
}

.feature-card {
  background: var(--white);
  border-radius: 16px;
  padding: 40px 30px;
  box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.05);
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  transform: translateY(20px);
  opacity: 0;
  animation: fadeInUp 0.6s forwards;
  animation-delay: var(--delay);
  position: relative;
  overflow: hidden;
  
  &:hover {
    transform: translateY(-10px) !important;
    box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.1);
    
    .feature-arrow {
      transform: translateX(5px);
      opacity: 1;
    }
  }
  
  .feature-icon {
    font-size: 2.5rem;
    margin-bottom: 20px;
  }
  
  h3 {
    font-size: 1.4rem;
    margin-bottom: 15px;
    color: var(--dark);
  }
  
  p {
    font-size: 1rem;
    color: var(--gray);
    margin-bottom: 25px;
  }
  
  .feature-arrow {
    font-size: 1.5rem;
    color: var(--primary);
    transition: all 0.3s ease;
    opacity: 0;
  }
}

/* Stats Section */
.stats-section {
  display: flex;
  justify-content: center;
  gap: 60px;
  padding: 80px 5%;
  background: var(--white);
  
  .stat-item {
    text-align: center;
    
    .stat-number {
      font-size: clamp(2.5rem, 5vw, 4rem);
      font-weight: 800;
      color: var(--primary);
      margin-bottom: 10px;
    }
    
    .stat-label {
      font-size: 1.1rem;
      color: var(--gray);
      font-weight: 500;
    }
  }
}

/* Team Section */
.team-content {
  padding: 120px 5%;
  background: var(--light);

  h2 {
    text-align: center;
    margin-bottom: 60px;
    font-size: 2.5rem;
    color: var(--dark);
  }
}

.team-member {
  background: var(--white);
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.05);
  margin: 30px auto;
  max-width: 600px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;

  .member-avatar {
    width: 200px;
    height: 200px;
    border-radius: 100%;
    object-fit: cover;
    border: 3px solid var(--primary);
    margin-bottom: 20px;
  }

  .member-info {
    .member-name {
      font-weight: 700;
      font-size: 1.5rem;
      color: var(--dark);
      margin-bottom: 10px;
    }

    .member-skills,
    .member-contribution {
      font-size: 1rem;
      color: var(--gray);
      margin-bottom: 10px;
      line-height: 1.6;

      strong {
        color: var(--dark);
      }
    }
  }
}


/* CTA Section */
.cta-section {
  padding: 160px 5%;
  position: relative;
  color: var(--white);
  text-align: center;
  overflow: hidden;
  
  .parallax-bg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: url('@/assets/cta-bg.png') center/cover fixed;
    z-index: -2;
    
    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(241, 235, 235, 0.7);
      z-index: -1;
    }
  }
  
  .cta-content {
    max-width: 800px;
    margin: 0 auto;
    position: relative;
    
    h2 {
      font-size: clamp(2rem, 4vw, 3rem);
      margin-bottom: 1.5rem;
      color: var(--white);
    }
    
    p {
      font-size: 1.3rem;
      color: rgba(244, 237, 237, 0.9);
      margin-bottom: 2.5rem;
    }
  }
}

.cta-button {
  background: var(--accent);
  color: var(--white);
  border: none;
  padding: 18px 40px;
  font-size: 1.1rem;
  font-weight: 600;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 10px 30px -10px rgba(236, 104, 148, 0.5);
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 15px 40px -10px rgba(236, 102, 169, 0.6);
    
    .arrow-icon {
      transform: translateX(5px);
    }
  }
  
  .arrow-icon {
    transition: all 0.3s ease;
  }
}

/* Footer */
.main-footer {
  background: var(--dark);
  color: var(--white);
  padding: 100px 5% 40px;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  gap: 80px;
}

.footer-brand {
  flex: 1;
  
  .logo {
    font-size: 1.8rem;
    font-weight: 800;
    margin-bottom: 20px;
    background: var(--gradient);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  p {
    color: rgba(9, 7, 7, 0.7);
    margin-bottom: 30px;
  }
}

.social-links {
  display: flex;
  gap: 20px;
  
  a {
    color: rgba(5, 4, 4, 0.7);
    font-size: 1.2rem;
    transition: all 0.3s ease;
    
    &:hover {
      color: var(--white);
      transform: translateY(-3px);
    }
  }
}

.footer-links {
  flex: 2;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 40px;
}

.link-group {
  h4 {
    color: var(--white);
    margin-bottom: 20px;
    font-size: 1.1rem;
  }
  
  a {
    display: block;
    color: rgba(5, 4, 4, 0.7);
    margin-bottom: 12px;
    text-decoration: none;
    transition: all 0.3s ease;
    
    &:hover {
      color: var(--white);
      transform: translateX(5px);
    }
  }
}

.footer-bottom {
  max-width: 1200px;
  margin: 60px auto 0;
  padding-top: 30px;
  border-top: 1px solid rgba(4, 3, 3, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  p {
    color: rgba(255, 255, 255, 0.5);
    font-size: 0.9rem;
    margin: 0;
  }
}

.legal-links {
  display: flex;
  gap: 20px;
  
  a {
    color: rgba(255, 255, 255, 0.5);
    font-size: 0.9rem;
    text-decoration: none;
    transition: all 0.3s ease;
    
    &:hover {
      color: var(--white);
    }
  }
}

/* Animations */
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}

@keyframes scroll {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive Design */
@media (max-width: 1024px) {
  .hero-content {
    flex-direction: column;
    text-align: center;
  }
  
  .footer-content {
    flex-direction: column;
    gap: 40px;
  }
  
  .footer-links {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .stats-section {
    flex-direction: column;
    gap: 40px;
  }
  
  .testimonial {
    padding: 40px 30px;
  }
  
  .footer-bottom {
    flex-direction: column;
    gap: 20px;
    text-align: center;
  }
}

@media (max-width: 480px) {
  .cta-buttons {
    flex-direction: column;
  }
  
  .features-container {
    grid-template-columns: 1fr;
  }
  
  .footer-links {
    grid-template-columns: 1fr;
  }
  
  .testimonial-author {
    flex-direction: column;
  }
}
</style>