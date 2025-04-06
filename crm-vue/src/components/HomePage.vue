<template>
  <div class="landing-page">
    <!-- Hero Section -->
     <section class="hero-section">
  <div class="hero-content">
    <h1>Empower Your Business with <span>Intelligent Segmentation</span></h1>
    <p class="subtitle">Leverage AI-driven insights to understand your customers and drive growth effortlessly.</p>
    <div class="cta-buttons">
      <button class="primary-btn" @click="showLoginPrompt">Get Started Now</button>
      <button class="secondary-btn" @click="navigateToGetStarted">Explore Features</button>
    </div>
  </div>
  <div class="hero-visual">
    <div class="data-visualization">
      <!-- Main image with decorative graphics -->
      <img
        src="@/assets/img-3.png"
        alt="Data visualization dashboard"
        class="dashboard-image"
        loading="eager"
      >
      <div class="chart-circle"></div>
      <div class="chart-bars">
        <span v-for="n in 5" :key="n" :class="'bar-' + n"></span>
      </div>
    </div>
  </div>
</section>

    <!-- Features Section -->
    <section class="features-section">
      <div class="section-header">
        <h2>Why Choose Us?</h2>
        <p class="section-subtitle">Discover the tools that transform customer data into actionable strategies.</p>
      </div>
      <div class="features-grid">
        <div
          v-for="(feature, index) in features"
          :key="index"
          class="feature-card"
          :style="{ 'transition-delay': `${index * 0.1}s` }"
        >
          <div class="feature-icon">
            <div class="icon-wrapper">
              <span class="material-icons">{{ featureIcons[index] }}</span>
            </div>
          </div>
          <h3>{{ feature.title }}</h3>
          <p>{{ feature.description }}</p>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta-section">
      <div class="cta-container">
        <h2>Ready to Elevate Your Customer Insights?</h2>
        <p>Start your free trial today and join a community of forward-thinking businesses.</p>
        <button class="primary-btn large-btn" @click="navigateToGetStarted">Try It Free</button>
      </div>
    </section>

    <!-- Footer -->
    <footer class="main-footer">
      <div class="footer-content">
        <div class="footer-brand">
          <h3>Customer Segmentation</h3>
          <p>Smarter insights for smarter growth</p>
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
            <router-link to="/about">About Us</router-link>
            <router-link to="/careers">Careers</router-link>
            <router-link to="/contact-us">Contact</router-link>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <p>© 2025 Customer Segmentation System. All rights reserved.</p>
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
    const navigateToGetStarted = () => router.push('/get-started');

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

.landing-page {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  color: var(--dark-color);
  line-height: 1.6;
  background: var(--light-color);
}

/* Typography */
h1, h2, h3, h4 { font-weight: 700; margin: 0 0 1rem; }
p { margin: 0 0 1.5rem; color: var(--gray-color); }

/* Buttons */
button {
  cursor: pointer;
  transition: var(--transition);
  font-weight: 600;
  border-radius: 10px;
  border: none;
}

.primary-btn {
  background: var(--primary-color);
  color: var(--white);
  padding: 14px 28px;
  font-size: 1.1rem;
  &:hover {
    background: var(--secondary-color);
    transform: translateY(-3px);
    box-shadow: 0 6px 15px rgba(67, 97, 238, 0.3);
  }
}

.secondary-btn {
  background: transparent;
  color: var(--primary-color);
  padding: 14px 28px;
  font-size: 1.1rem;
  border: 2px solid var(--primary-color);
  &:hover {
    background: rgba(67, 97, 238, 0.1);
    transform: translateY(-3px);
  }
}

.large-btn { padding: 16px 36px; font-size: 1.2rem; }

.hero-section {
  display: flex;
  align-items: center;
  min-height: 90vh;
  padding: 100px 6%;
  background: linear-gradient(120deg, #f9fafc 0%, #e5e7eb 100%);

  @media (max-width: 1024px) {
    flex-direction: column;
    padding: 80px 5%;
  }
}

.hero-content {
  flex: 1;
  max-width: 650px;

  @media (max-width: 1024px) {
    max-width: 100%;
    margin-bottom: 50px;
    text-align: center;
  }

  .cta-buttons {
    display: flex;
    gap: 20px;
    margin-top: 2.5rem;

    @media (max-width: 768px) {
      flex-direction: column;
      gap: 15px;
    }
  }
}

.hero-visual {
  flex: 1;
  display: flex;
  justify-content: center;
  position: relative;
}

.data-visualization {
  position: relative;
  width: 100%;
  max-width: 600px;
  height: 400px;

  .dashboard-image {
    width: 100%;
    height: 100%;
    object-fit: contain;
    position: relative;
    z-index: 1;
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  }

  .chart-circle {
    position: absolute;
    top: 15%;
    right: 10%;
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: conic-gradient(
      var(--primary-color) 0% 65%,
      var(--primary-light) 65% 100%
    );
    z-index: 2;
    animation: pulse 2s infinite alternate;
  }

  .chart-bars {
    position: absolute;
    bottom: 15%;
    left: 10%;
    display: flex;
    align-items: flex-end;
    gap: 8px;
    height: 60px;
    z-index: 2;

    span {
      width: 12px;
      background: var(--primary-color);
      border-radius: 4px;

      @for $i from 1 through 5 {
        &.bar-#{$i} {
          height: percentage($i/7);
          animation: grow#{$i} 1.5s ease-in-out infinite alternate;
          animation-delay: $i * 0.1s;
        }
      }
    }
  }
}

@keyframes pulse {
  0% { transform: scale(1); }
  100% { transform: scale(1.05); }
}

@for $i from 1 through 5 {
  @keyframes grow#{$i} {
    0% { height: percentage(($i/7) - 0.05); }
    100% { height: percentage(($i/7) + 0.05); }
  }
}

/* Features Section */
.features-section {
  padding: 120px 6%;
  background: var(--white);
}

.section-header {
  text-align: center;
  margin-bottom: 70px;
  h2 { font-size: 2.8rem; }
  .section-subtitle { font-size: 1.3rem; max-width: 800px; margin: 0 auto; }
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 40px;
  max-width: 1300px;
  margin: 0 auto;
}

.feature-card {
  background: var(--light-color);
  border-radius: 16px;
  padding: 35px;
  box-shadow: var(--box-shadow);
  transition: var(--transition);
  &:hover {
    transform: translateY(-12px);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.12);
  }
  h3 { font-size: 1.6rem; margin: 25px 0 15px; }
  p { font-size: 1.05rem; }
}

.feature-icon .icon-wrapper {
  width: 70px;
  height: 70px;
  border-radius: 14px;
  background: rgba(67, 97, 238, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  span { font-size: 34px; color: var(--primary-color); }
}

/* CTA Section */
.cta-section {
  padding: 120px 6%;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
  color: var(--white);
  text-align: center;
}

.cta-container {
  max-width: 900px;
  margin: 0 auto;
  h2 { font-size: 2.8rem; }
  p { font-size: 1.4rem; max-width: 600px; margin: 0 auto 40px; opacity: 0.9; }
}

/* Footer */
.main-footer {
  background: var(--dark-color);
  color: var(--white);
  padding: 80px 6% 40px;
  a { color: var(--gray-color); text-decoration: none; transition: var(--transition); &:hover { color: var(--white); } }
}

.footer-content {
  display: flex;
  justify-content: space-between;
  max-width: 1300px;
  margin: 0 auto 60px;
  flex-wrap: wrap;
  gap: 50px;
}

.footer-brand {
  flex: 1;
  min-width: 280px;
  h3 { font-size: 1.7rem; }
  p { color: var(--gray-color); }
}

.footer-links {
  display: flex;
  gap: 70px;
  flex-wrap: wrap;
}

.link-group {
  min-width: 160px;
  h4 { font-size: 1.2rem; margin-bottom: 1.5rem; }
  a { display: block; margin-bottom: 14px; &:hover { transform: translateX(5px); } }
}

.footer-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1300px;
  margin: 0 auto;
  padding-top: 40px;
  border-top: 1px solid rgba(255, 255, 255, 0.15);
  flex-wrap: wrap;
  gap: 25px;
  p { color: var(--gray-color); margin: 0; }
  .legal-links { display: flex; gap: 25px; a { font-size: 0.95rem; } }
}

/* Animations */
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-15px); }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Responsive Design */
@media (max-width: 1024px) {
  .hero-section {
    flex-direction: column;
    text-align: center;
    padding: 80px 5%;
    .hero-content { max-width: 100%; margin-bottom: 50px; }
    .cta-buttons { justify-content: center; }
  }
  .data-visualization { width: 380px; height: 380px; }
}

@media (max-width: 768px) {
  .hero-section h1 { font-size: 2.8rem; }
  .hero-section .subtitle { font-size: 1.3rem; }
  .features-section { padding: 80px 5%; }
  .section-header h2 { font-size: 2.2rem; }
  .features-grid { grid-template-columns: 1fr; }
  .cta-section { padding: 80px 5%; }
  .cta-container h2 { font-size: 2.2rem; }
  .footer-links { flex-direction: column; gap: 40px; }
  .footer-bottom { flex-direction: column; text-align: center; }
}

@media (max-width: 480px) {
  .hero-section h1 { font-size: 2.2rem; }
  .hero-section .subtitle { font-size: 1.1rem; }
  .data-visualization { width: 300px; height: 300px; }
  .primary-btn, .secondary-btn { padding: 12px 20px; font-size: 1rem; }
}
</style>