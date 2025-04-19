<template>
  <div class="landing-page">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-container">
        <div class="hero-text">
          <h1>Transform Customer Data Into <span>Actionable Insights</span></h1>
          <p class="subtitle">Our AI-powered segmentation platform helps you understand your customers like never before</p>
          <div class="cta-buttons">
            <button class="primary-btn" @click="showLoginPrompt">Admins Only</button>
            <button class="secondary-btn" @click="navigateToGetStarted">Users only</button>
          </div>
        </div>
        <div class="hero-image">
          <img
            src="@/assets/img-3.png"
            alt="Customer segmentation dashboard"
            class="dashboard-preview"
          >
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features-section">
      <div class="section-intro">
        <h2>Powerful Features Designed for Growth</h2>
        <p>Everything you need to turn customer data into business results</p>
      </div>
      <div class="features-container">
        <div
          v-for="(feature, index) in features"
          :key="index"
          class="feature-card"
        >
          <div class="feature-header">
            <div class="icon-circle">
              <span class="material-icons">{{ featureIcons[index] }}</span>
            </div>
            <h3>{{ feature.title }}</h3>
          </div>
          <p>{{ feature.description }}</p>
        </div>
      </div>
    </section>

    <!-- Testimonials Section -->
    <section class="testimonials-section">
      <div class="section-intro">
        <h2>Trusted by Industry Leaders</h2>
        <p>Join thousands of businesses transforming their customer strategies</p>
      </div>
      <div class="testimonials-container">
        <div class="testimonial-card">
          <div class="testimonial-content">
            <div class="quote-icon">"</div>
            <p class="testimonial-text">CustomerSeg helped us increase our campaign response rates by 45% while reducing marketing costs by 30%.</p>
          </div>
          <div class="testimonial-author">
            <img src="@/assets/img-1.png" alt="Sunday Drago" class="author-avatar">
            <div class="author-info">
              <p class="author-name">Sunday Drago</p>
              <p class="author-title">CMO, TechSolutions Inc.</p>
            </div>
          </div>
        </div>
        <div class="testimonial-card">
          <div class="testimonial-content">
            <div class="quote-icon">"</div>
            <p class="testimonial-text">The predictive scoring alone has saved us millions in customer retention costs. This platform pays for itself.</p>
          </div>
          <div class="testimonial-author">
            <img src="@/assets/img-2.png" alt="Akoldou Wel" class="author-avatar">
            <div class="author-info">
              <p class="author-name">Akoldou Wel</p>
              <p class="author-title">Director of Growth, GlobalRetail</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta-section">
      <div class="cta-content">
        <h2>Ready to revolutionize your customer strategy?</h2>
        <p>Join thousands of businesses using our platform to drive growth</p>
        <button class="primary-btn large-btn" @click="navigateToGetStarted">
          Get Started Today
        </button>
      </div>
    </section>

    <!-- Footer -->
    <footer class="main-footer">
      <div class="footer-grid">
        <div class="footer-brand">
          <h3>CustomerSeg</h3>
          <p>Intelligent customer segmentation for modern businesses</p>
          <div class="social-links">
            <a href="#"><span class="material-icons">twitter</span></a>
            <a href="#"><span class="material-icons">linkedin</span></a>
            <a href="#"><span class="material-icons">facebook</span></a>
          </div>
        </div>

        <div class="footer-links">
          <div class="link-column">
            <h4>Product</h4>
            <router-link to="/features">Features</router-link>
            <router-link to="/pricing">Pricing</router-link>
            <router-link to="/integrations">Integrations</router-link>
          </div>

          <div class="link-column">
            <h4>Resources</h4>
            <router-link to="/blog">Blog</router-link>
            <router-link to="/webinars">Webinars</router-link>
            <router-link to="/docs">Documentation</router-link>
          </div>

          <div class="link-column">
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

<script>
import { useRouter } from 'vue-router';

export default {
  setup() {
    const router = useRouter();

    const showLoginPrompt = () => router.push('/login');
    const navigateToGetStarted = () => router.push('/user-login');

    const features = [
      { title: "AI-Driven Insights", description: "Leverage cutting-edge AI to uncover deep customer behavior patterns with high precision." },
      { title: "Dynamic Segmentation", description: "Segment customers in real-time based on behavior, demographics, and more." },
      { title: "Real-Time Analytics", description: "Access live data through sleek, interactive dashboards for instant decision-making." },
      { title: "Campaign Automation", description: "Launch targeted campaigns automatically based on segment triggers." },
      { title: "Cross-Channel Sync", description: "Integrate seamlessly with your CRM, email, and social tools." },
      { title: "Predictive Scoring", description: "Pinpoint high-value customers and reduce churn with predictive analytics." },
    ];

    const featureIcons = ['insights', 'group_work', 'query_stats', 'campaign', 'sync_alt', 'score'];

    return { showLoginPrompt, navigateToGetStarted, features, featureIcons };
  },
};
</script>

<style scoped lang="scss">
:root {
  --primary-color: #4f46e5;
  --primary-light: #6366f1;
  --secondary-color: #4338ca;
  --accent-color: #10b981;
  --dark-color: #111827;
  --light-color: #f9fafb;
  --gray-color: #6b7280;
  --light-gray: #e5e7eb;
  --dark-gray: #374151;
  --white: #ffffff;
  --box-shadow: 0 6px 25px rgba(0, 0, 0, 0.1);
  --transition: all 0.3s ease-in-out;
}

/* Base Styles */
.landing-page {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  color: var(--dark-color);
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
  font-size: 3.5rem;
  line-height: 1.1;
}

h2 {
  font-size: 2.5rem;
}

p {
  margin: 0 0 1.5rem;
  color: var(--gray-color);
  font-size: 1.1rem;
  line-height: 1.7;
}

/* Button Styles */
button {
  cursor: pointer;
  transition: var(--transition);
  font-weight: 600;
  border-radius: 8px;
  border: none;
  font-size: 1rem;
  letter-spacing: 0.025em;
}

.primary-btn {
  background: var(--primary-color);
  color: var(--white);
  padding: 12px 24px;
  box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.3);
  
  &:hover {
    background: var(--secondary-color);
    transform: translateY(-2px);
    box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.4);
  }
}

.secondary-btn {
  background: transparent;
  color: var(--primary-color);
  padding: 12px 24px;
  border: 2px solid var(--primary-color);
  
  &:hover {
    background: rgba(79, 70, 229, 0.05);
    transform: translateY(-2px);
    box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.1);
  }
}

.large-btn {
  padding: 16px 40px;
  font-size: 1.1rem;
  border-radius: 12px;
}

/* Hero Section */
.hero-section {
  padding: 120px 5% 140px;
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -20%;
    width: 80%;
    height: 200%;
    background: radial-gradient(circle, rgba(79, 70, 229, 0.05) 0%, transparent 70%);
    z-index: 0;
  }
}

.hero-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 60px;
  position: relative;
  z-index: 1;
}

.hero-text {
  flex: 1;
  
  h1 {
    margin-bottom: 1.5rem;
    
    span {
      color: var(--primary-color);
      background: linear-gradient(90deg, var(--primary-color) 0%, var(--accent-color) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      text-fill-color: transparent;
    }
  }
  
  .subtitle {
    font-size: 1.25rem;
    max-width: 500px;
    margin-bottom: 2.5rem;
    color: var(--dark-gray);
  }
}

.cta-buttons {
  display: flex;
  gap: 16px;
}

.hero-image {
  flex: 1;
  position: relative;
  
  .dashboard-preview {
    width: 100%;
    max-width: 600px;
    border-radius: 16px;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
    position: relative;
    z-index: 1;
    border: 1px solid var(--light-gray);
  }
}

.floating-elements {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  z-index: 2;
}

.floating-card {
  position: absolute;
  background: var(--white);
  padding: 16px 20px;
  border-radius: 12px;
  box-shadow: var(--box-shadow);
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.95rem;
  font-weight: 600;
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.2);

  .material-icons {
    color: var(--primary-color);
    font-size: 1.5rem;
  }

  &.card-1 {
    top: 20%;
    right: 5%;
    animation: float 4s ease-in-out infinite;
    background: rgba(255, 255, 255, 0.9);
  }

  &.card-2 {
    bottom: 20%;
    left: 5%;
    animation: float 4s ease-in-out infinite 0.5s;
    background: rgba(255, 255, 255, 0.9);
  }
}

/* Features Section */
.features-section {
  padding: 120px 5%;
  background: var(--white);
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 1px;
    background: linear-gradient(90deg, transparent 0%, var(--light-gray) 50%, transparent 100%);
  }
}

.section-intro {
  text-align: center;
  max-width: 800px;
  margin: 0 auto 80px;

  h2 {
    font-size: 2.75rem;
    margin-bottom: 1.5rem;
    background: linear-gradient(90deg, var(--dark-color) 0%, var(--gray-color) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-fill-color: transparent;
  }

  p {
    font-size: 1.25rem;
    color: var(--gray-color);
  }
}

.features-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 40px;
  max-width: 1200px;
  margin: 0 auto;
}

.feature-card {
  background: var(--light-color);
  border-radius: 16px;
  padding: 40px 30px;
  transition: var(--transition);
  border: 1px solid var(--light-gray);
  
  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    border-color: rgba(79, 70, 229, 0.2);
  }
  
  p {
    color: var(--dark-gray);
    font-size: 1rem;
  }
}

.feature-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;

  .icon-circle {
    width: 56px;
    height: 56px;
    border-radius: 16px;
    background: linear-gradient(135deg, rgba(79, 70, 229, 0.1) 0%, rgba(16, 185, 129, 0.1) 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;

    .material-icons {
      color: var(--primary-color);
      font-size: 28px;
    }
  }

  h3 {
    font-size: 1.4rem;
    margin: 0;
    color: var(--dark-color);
  }
}

/* Testimonials Section */
.testimonials-section {
  padding: 120px 5%;
  background: var(--light-color);
}

.testimonials-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 40px;
  max-width: 1200px;
  margin: 0 auto;
}

.testimonial-card {
  background: var(--white);
  border-radius: 16px;
  padding: 40px;
  box-shadow: var(--box-shadow);
  transition: var(--transition);
  
  &:hover {
    transform: translateY(-5px);
  }
}

.testimonial-content {
  position: relative;
  margin-bottom: 30px;
  
  .quote-icon {
    position: absolute;
    top: -20px;
    left: -10px;
    font-size: 80px;
    color: rgba(79, 70, 229, 0.1);
    font-family: serif;
    font-weight: bold;
    line-height: 1;
    z-index: 0;
  }
  
  .testimonial-text {
    position: relative;
    z-index: 1;
    font-size: 1.1rem;
    color: var(--dark-gray);
    font-style: italic;
    line-height: 1.8;
  }
}

.testimonial-author {
  display: flex;
  align-items: center;
  gap: 16px;
  
  .author-avatar {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    object-fit: cover;
    border: 3px solid var(--light-gray);
  }
  
  .author-name {
    font-weight: 700;
    color: var(--dark-color);
    margin-bottom: 4px;
  }
  
  .author-title {
    font-size: 0.9rem;
    color: var(--gray-color);
    margin: 0;
  }
}

/* CTA Section */
.cta-section {
  padding: 140px 5%;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
  color: var(--white);
  text-align: center;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -20%;
    width: 80%;
    height: 200%;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
    z-index: 0;
  }
}

.cta-content {
  max-width: 800px;
  margin: 0 auto;
  position: relative;
  z-index: 1;

  h2 {
    font-size: 2.75rem;
    margin-bottom: 1.5rem;
  }

  p {
    font-size: 1.25rem;
    color: rgba(255, 255, 255, 0.9);
    margin-bottom: 2.5rem;
  }
  
  .large-btn {
    background: var(--white);
    color: var(--primary-color);
    
    &:hover {
      background: rgba(255, 255, 255, 0.9);
      transform: translateY(-2px);
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2);
    }
  }
}

/* Footer */
.main-footer {
  background: var(--dark-color);
  color: var(--white);
  padding: 100px 5% 40px;
  position: relative;
}

.footer-grid {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 80px;
  max-width: 1200px;
  margin: 0 auto 60px;
}

.footer-brand {
  h3 {
    font-size: 1.8rem;
    margin-bottom: 1.5rem;
    color: var(--white);
  }

  p {
    color: var(--gray-color);
    margin-bottom: 2rem;
  }
}

.social-links {
  display: flex;
  gap: 16px;
  
  a {
    color: var(--gray-color);
    transition: var(--transition);
    
    &:hover {
      color: var(--white);
      transform: translateY(-2px);
    }
    
    .material-icons {
      font-size: 1.5rem;
    }
  }
}

.footer-links {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 60px;
}

.link-column {
  h4 {
    font-size: 1.1rem;
    margin-bottom: 1.5rem;
    color: var(--white);
  }

  a {
    display: block;
    margin-bottom: 16px;
    color: var(--gray-color);
    text-decoration: none;
    transition: var(--transition);
    font-size: 0.95rem;

    &:hover {
      color: var(--white);
      transform: translateX(4px);
    }
  }
}

.footer-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  padding-top: 40px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);

  p {
    color: var(--gray-color);
    margin: 0;
    font-size: 0.9rem;
  }
}

.legal-links {
  display: flex;
  gap: 20px;

  a {
    color: var(--gray-color);
    text-decoration: none;
    font-size: 0.9rem;
    transition: var(--transition);

    &:hover {
      color: var(--white);
    }
  }
}

/* Animations */
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

/* Responsive Design */
@media (max-width: 1024px) {
  .hero-container {
    flex-direction: column;
    text-align: center;
    gap: 40px;
  }

  .hero-text {
    .subtitle {
      margin-left: auto;
      margin-right: auto;
    }
  }

  .cta-buttons {
    justify-content: center;
  }

  .footer-grid {
    grid-template-columns: 1fr;
    gap: 40px;
  }
  
  .footer-links {
    gap: 40px;
  }
}

@media (max-width: 768px) {
  h1 {
    font-size: 2.75rem;
  }
  
  h2 {
    font-size: 2.25rem;
  }

  .hero-section, 
  .features-section,
  .testimonials-section,
  .cta-section {
    padding: 80px 5%;
  }

  .section-intro h2 {
    font-size: 2.25rem;
  }

  .cta-content h2 {
    font-size: 2.25rem;
  }

  .footer-links {
    grid-template-columns: 1fr 1fr;
  }

  .footer-bottom {
    flex-direction: column;
    gap: 20px;
    text-align: center;
  }
}

@media (max-width: 480px) {
  h1 {
    font-size: 2.25rem;
  }
  
  h2 {
    font-size: 1.75rem;
  }

  .cta-buttons {
    flex-direction: column;
  }

  .features-container {
    grid-template-columns: 1fr;
  }

  .footer-links {
    grid-template-columns: 1fr;
  }
  
  .testimonial-card {
    padding: 30px;
  }
}
</style>