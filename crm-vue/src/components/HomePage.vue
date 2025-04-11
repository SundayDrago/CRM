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
          <div class="floating-elements">
            <div class="floating-card card-1">
              <span class="material-icons">trending_up</span>
              <p>+32% Engagement</p>
            </div>
            <div class="floating-card card-2">
              <span class="material-icons">groups</span>
              <p>5 Customer Segments</p>
            </div>
          </div>
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
  --primary-color: #4361ee;
  --primary-light: #4895ef;
  --secondary-color: #3f37c9;
  --dark-color: #1a2a44;
  --light-color: #f9fafc;
  --gray-color: #6b7280;
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
  font-weight: 700;
  margin: 0 0 1rem;
  line-height: 1.2;
}

p {
  margin: 0 0 1.5rem;
  color: var(--gray-color);
}

/* Button Styles */
button {
  cursor: pointer;
  transition: var(--transition);
  font-weight: 600;
  border-radius: 8px;
  border: none;
  font-size: 1rem;
}

.primary-btn {
  background: var(--primary-color);
  color: var(--white);
  padding: 12px 24px;
  &:hover {
    background: var(--secondary-color);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(67, 97, 238, 0.3);
  }
}

.secondary-btn {
  background: transparent;
  color: var(--primary-color);
  padding: 12px 24px;
  border: 2px solid var(--primary-color);
  &:hover {
    background: rgba(67, 97, 238, 0.1);
    transform: translateY(-2px);
  }
}

.large-btn {
  padding: 14px 32px;
  font-size: 1.1rem;
}

/* Hero Section */
.hero-section {
  padding: 100px 5% 120px;
  background: linear-gradient(120deg, #f9fafc 0%, #e5e7eb 100%);
}

.hero-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 60px;
}

.hero-text {
  flex: 1;
  h1 {
    font-size: 3rem;
    margin-bottom: 1.5rem;
    span {
      color: var(--primary-color);
    }
  }
  .subtitle {
    font-size: 1.2rem;
    max-width: 500px;
    margin-bottom: 2.5rem;
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
    border-radius: 12px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
    position: relative;
    z-index: 1;
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
  padding: 12px 16px;
  border-radius: 8px;
  box-shadow: var(--box-shadow);
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  font-weight: 500;

  .material-icons {
    color: var(--primary-color);
  }

  &.card-1 {
    top: 20%;
    right: 10%;
    animation: float 4s ease-in-out infinite;
  }

  &.card-2 {
    bottom: 20%;
    left: 10%;
    animation: float 4s ease-in-out infinite 0.5s;
  }
}

/* Features Section */
.features-section {
  padding: 100px 5%;
  background: var(--white);
}

.section-intro {
  text-align: center;
  max-width: 800px;
  margin: 0 auto 60px;

  h2 {
    font-size: 2.5rem;
    margin-bottom: 1rem;
  }

  p {
    font-size: 1.2rem;
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
  background: var(--light-color);
  border-radius: 12px;
  padding: 30px;
  transition: var(--transition);

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.08);
  }
}

.feature-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;

  .icon-circle {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: rgba(67, 97, 238, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;

    .material-icons {
      color: var(--primary-color);
      font-size: 24px;
    }
  }

  h3 {
    font-size: 1.3rem;
    margin: 0;
  }
}

/* CTA Section */
.cta-section {
  padding: 100px 5%;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
  color: var(--white);
  text-align: center;
}

.cta-content {
  max-width: 800px;
  margin: 0 auto;

  h2 {
    font-size: 2.5rem;
    margin-bottom: 1rem;
  }

  p {
    font-size: 1.2rem;
    color: rgba(255, 255, 255, 0.9);
    margin-bottom: 2rem;
  }
}

/* Footer */
.main-footer {
  background: var(--dark-color);
  color: var(--white);
  padding: 80px 5% 40px;
}

.footer-grid {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 60px;
  max-width: 1200px;
  margin: 0 auto 60px;
}

.footer-brand {
  h3 {
    font-size: 1.8rem;
    margin-bottom: 1rem;
  }

  p {
    color: var(--gray-color);
  }
}

.footer-links {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 40px;
}

.link-column {
  h4 {
    font-size: 1.1rem;
    margin-bottom: 1.5rem;
    color: var(--white);
  }

  a {
    display: block;
    margin-bottom: 12px;
    color: var(--gray-color);
    text-decoration: none;
    transition: var(--transition);

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
  }
}

@media (max-width: 768px) {
  .hero-text h1 {
    font-size: 2.5rem;
  }

  .section-intro h2 {
    font-size: 2rem;
  }

  .cta-content h2 {
    font-size: 2rem;
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
  .hero-text h1 {
    font-size: 2rem;
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
}
</style>