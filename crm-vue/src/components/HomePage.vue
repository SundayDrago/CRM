```vue
<template>
  <Analytics />
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
            />
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
    <section class="stats-section">
      <div v-if="isLoading" class="loading">Loading statistics...</div>
      <div v-else-if="errorMessage" class="error">{{ errorMessage }}</div>
      <div v-else class="stats-container">
        <div class="stat-item">
          <div class="stat-number">{{ mostPurchasedCategory }}</div>
          <div class="stat-label">Most Purchased Category</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">{{ bestRegionPercentage }}</div>
          <div class="stat-label">Best Region</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">Model Accuracy</div>
          <canvas ref="stat3" id="stat3-canvas" width="200" height="200"></canvas>
        </div>
      </div>
    </section>

    <!-- Graphs Section (Model-Driven Visualizations) -->
    <section v-if="graphs && graphs.length" class="graphs-section">
      <div class="section-intro">
        <h2>Model Insights <span class="underline">Powered by AI</span></h2>
        <p class="section-subtitle">Visualize customer segments and clustering performance</p>
      </div>
      <div class="graphs-container">
        <div v-for="graph in graphs" :key="graph.filename" class="graph-card">
          <h3>{{ graph.title }}</h3>
          <img :src="graph.url" :alt="graph.title" class="graph-image" @error="handleImageError(graph.url)" />
        </div>
      </div>
    </section>

    <!-- Team Section -->
    <section class="team-content">
      <h2>Our Team Members</h2>
      <div class="team-members-container">
        <div class="team-member">
          <img src="@/assets/img-3.jpg" alt="Member One" class="member-img" />
          <div class="member-info">
            <h2 class="member-name">Geriga Sunday Drago</h2>
            <p class="member-skills">
              <strong>Skills:</strong> Frontend Development, UI/UX Design, Backend (FLASKAPI), ML Model
            </p>
            <p class="member-contribution">
              <strong>Contribution:</strong> Designed and implemented the user interface, ensuring responsive and accessible layouts using Vue.js and SCSS.
            </p>
          </div>
        </div>
        <div class="team-member">
          <img src="@/assets/img-2.jpg" alt="Member Two" class="member-img" />
          <div class="member-info">
            <h2 class="member-name">Akoldou Samuel Wel</h2>
            <p class="member-skills"><strong>Skills:</strong> Backend Development, Database Management</p>
            <p class="member-contribution">
              <strong>Contribution:</strong> Developed REST APIs with Node.js and Express, handled database integration with MySQL, and implemented secure authentication.
            </p>
          </div>
        </div>
      </div>
    </section>

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
            <a href="#" aria-label="Twitter"><i class="fab fa-twitter"></i></a>
            <a href="#" aria-label="LinkedIn"><i class="fab fa-linkedin"></i></a>
            <a href="#" aria-label="Facebook"><i class="fab fa-facebook"></i></a>
          </div>
        </div>
        <div class="footer-links">
          <div class="links-group">
            <h4>Product</h4>
            <router-link to="/features">Features</router-link>
            <router-link to="/pricing">Pricing</router-link>
            <router-link to="/integrations">Integrations</router-link>
          </div>
          <div class="links-group">
            <h4>Resources</h4>
            <a href="https://blog-vue-app-bse25-36.vercel.app" target="_blank" rel="noopener noreferrer">Blog</a>
            <router-link to="/webinars">Webinars</router-link>
            <router-link to="/docs">Documentation</router-link>
          </div>
          <div class="links-group">
            <h4>Connect</h4>
            <router-link to="/about-us">About Us</router-link>
            <router-link to="/careers">Careers</router-link>
            <router-link to="/contact-us">Contact</router-link>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; 2025 CustomerGroup. All rights reserved.</p>
        <div class="legal-links">
          <router-link to="/privacy">Privacy Policy</router-link>
          <router-link to="/terms">Terms of Service</router-link>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { Analytics } from '@vercel/analytics/vue';
import axios from 'axios';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

const router = useRouter();
const isAuthenticated = ref(false);
const isAdmin = ref(false);
const isLoading = ref(true);
const errorMessage = ref(null);
const mostPurchasedCategory = ref('Loading...');
const bestRegionPercentage = ref('Loading...');
const stat3 = ref(null);
const graphs = ref([]);
let silhouetteScore = 0; // Store for chart rendering

// Handle image loading errors
const handleImageError = (url) => {
  console.error('Failed to load image:', url);
  errorMessage.value = errorMessage.value || 'Failed to load one or more graphs';
};

// Animate percentage
const animatePercentage = (targetValue) => {
  const finalValue = parseFloat(targetValue) || 0;
  let current = 0;
  const duration = 2000;
  const increment = finalValue / (duration / 16);
  const timer = setInterval(() => {
    current += increment;
    if (current >= finalValue) {
      clearInterval(timer);
      current = finalValue;
    }
    bestRegionPercentage.value = `${Math.round(current * 10) / 10}%`;
  }, 16);
};

// Watch for percentage changes
watch(
  () => bestRegionPercentage.value,
  (newValue) => {
    if (newValue !== 'Loading...' && newValue !== '0%') {
      animatePercentage(newValue.replace('%', ''));
    }
  }
);

// Render chart
const renderChart = () => {
  if (!stat3.value) {
    console.error('Chart canvas not found. stat3:', stat3.value);
    errorMessage.value = 'Chart canvas not found';
    return;
  }
  console.log('Rendering Chart.js with silhouetteScore:', silhouetteScore);
  new Chart(stat3.value, {
    type: 'doughnut',
    data: {
      labels: ['Accuracy', 'Remaining'],
      datasets: [
        {
          data: [silhouetteScore, Math.max(100 - silhouetteScore, 0)],
          backgroundColor: ['#4CAF50', '#E0E0E0'],
          borderColor: ['#4CAF50', '#E0E0E0'],
          borderWidth: 2,
        },
      ],
    },
    options: {
      cutout: '80%',
      plugins: {
        title: {
          display: true,
          text: `Metric Score: ${Math.round(silhouetteScore)}%`,
          font: { size: 16 },
        },
        legend: { display: false },
      },
    },
  });
};

// Fetch stats and graphs
const fetchStatsAndGraphs = async () => {
  isLoading.value = true;
  errorMessage.value = null;

  // Fetch /api/query
  try {
    console.log('Fetching /api/query...');
    const queryResponse = await axios.get('/query', { params: { region: 'All' } });
    console.log('/api/query response:', JSON.stringify(queryResponse.data, null, 2));
    const queryData = queryResponse.data;
    mostPurchasedCategory.value = queryData.most_purchased_category || queryData.most_frequent_category || 'No Category Data';
    const percentage = parseFloat((queryData.percentage || '0').replace('%', '')) || 0;
    bestRegionPercentage.value = percentage > 0 ? `${percentage.toFixed(1)}%` : 'No Region Data';
    console.log('Set mostPurchasedCategory:', mostPurchasedCategory.value);
    console.log('Set bestRegionPercentage:', bestRegionPercentage.value);
  } catch (error) {
    console.error('/api/query error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      code: error.code,
    });
    mostPurchasedCategory.value = 'No Data Available';
    bestRegionPercentage.value = '0%';
    errorMessage.value = error.response?.data?.error || error.message || 'Failed to fetch query data';
  }

  // Fetch /model-metrics
  try {
    console.log('Fetching /model-metrics...');
    const modelResponse = await axios.get('/model-metrics');
    console.log('/model-metrics response:', JSON.stringify(modelResponse.data, null, 2));
    silhouetteScore = (modelResponse.data?.silhouette_score || 0) * 100;
    await nextTick();
    renderChart();
  } catch (error) {
    console.error('/model-metrics error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      code: error.code,
    });
    errorMessage.value = error.response?.data?.error || error.message || 'Failed to fetch model metrics';
  }

  // Fetch /graphs
  try {
    console.log('Fetching /graphs...');
    const graphsResponse = await axios.get('/graphs');
    console.log('/graphs response:', JSON.stringify(graphsResponse.data, null, 2));
    graphs.value = (graphsResponse.data.graphs || []).map((graph) => ({
      ...graph,
      url: graph.type === 'file' ? `http://127.0.0.1:5000${graph.url}` : graph.url,
      title: graph.title || graph.filename.replace(/\.[^/.]+$/, '').replace(/[_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    }));
    console.log('Set graphs:', JSON.stringify(graphs.value, null, 2));
  } catch (error) {
    console.error('/graphs error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      code: error.code,
    });
    graphs.value = [];
    errorMessage.value = error.response?.data?.error || error.message || 'Failed to fetch graphs';
  }

  isLoading.value = false;
  console.log('fetchStatsAndGraphs completed. State:', {
    mostPurchasedCategory: mostPurchasedCategory.value,
    bestRegionPercentage: bestRegionPercentage.value,
    errorMessage: errorMessage.value,
    graphs: graphs.value,
  });
};

// Check authentication and fetch stats
onMounted(async () => {
  console.log('Component mounted, checking canvas:', stat3.value);
  try {
    const token = localStorage.getItem('authToken');
    if (token) {
      const response = await axios.get('/api/admin/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      isAuthenticated.value = true;
      isAdmin.value = response.data.isAdmin;
      console.log('Auth check successful:', { isAdmin: isAdmin.value, isAuthenticated: isAuthenticated.value });
    }
  } catch (error) {
    console.error('Auth check failed:', error.message);
    localStorage.removeItem('authToken');
  }
  await fetchStatsAndGraphs();
});

// Watch for canvas availability
watch(stat3, (newVal) => {
  if (newVal && silhouetteScore > 0) {
    console.log('stat3 canvas available, rendering chart');
    renderChart();
  }
});

// Features data
const features = [
  {
    title: 'AI-Powered Segmentation',
    description: 'Our machine learning algorithms automatically identify meaningful customer groups based on behavior patterns.',
  },
  {
    title: 'Real-Time Analytics',
    description: 'Get up-to-the-minute insights with our interactive dashboards and reporting tools.',
  },
  {
    title: 'Predictive Scoring',
    description: 'Identify high-value customers and predict churn before it happens with our advanced scoring system.',
  },
  {
    title: 'Campaign Automation',
    description: 'Launch targeted campaigns that automatically adjust based on segment performance and engagement.',
  },
  {
    title: 'Cross-Channel Integration',
    description: 'Seamlessly connect with your existing CRM, email, and advertising platforms.',
  },
  {
    title: 'Custom Reporting',
    description: 'Create tailored reports that highlight exactly the metrics that matter to your business.',
  },
];

const featureIcons = ['🧠', '📊', '🔮', '⚡', '🔄', '📈'];

// Navigation functions
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

<style scoped>
.landing-page {
  font-family: 'Inter', sans-serif;
  color: #333;
  background: #f5f7fa;
}

/* Hero Section */
.hero-section {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  padding: 0 20px;
}

.gradient-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.2), rgba(33, 150, 243, 0.2));
  z-index: 1;
}

.hero-container {
  position: relative;
  z-index: 2;
  max-width: 1200px;
  width: 100%;
}

.hero-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 40px;
}

.hero-text {
  flex: 1;
  min-width: 300px;
}

.hero-text h1 {
  font-size: 3rem;
  font-weight: 800;
  line-height: 1.2;
  margin-bottom: 20px;
  position: relative;
}

.gradient-text {
  background: linear-gradient(90deg, #4CAF50, #2196F3);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.highlight-circle {
  position: absolute;
  bottom: -10px;
  left: 0;
  width: 80px;
  height: 20px;
  background: rgba(76, 175, 80, 0.3);
  border-radius: 50%;
}

.subtitle {
  font-size: 1.25rem;
  color: #555;
  margin-bottom: 30px;
  max-width: 500px;
}

.cta-buttons {
  display: flex;
  gap: 15px;
}

.primary-btn, .secondary-btn {
  display: flex;
  align-items: center;
  padding: 12px 24px;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.primary-btn {
  background: #4CAF50;
  color: white;
  border: none;
}

.primary-btn:hover {
  background: #388E3C;
  transform: translateY(-2px);
}

.secondary-btn {
  background: transparent;
  color: #4CAF50;
  border: 2px solid #4CAF50;
}

.secondary-btn:hover {
  background: #4CAF50;
  color: white;
  transform: translateY(-2px);
}

.btn-icon {
  margin-right: 8px;
}

.hero-image {
  flex: 1;
  min-width: 300px;
  position: relative;
}

.floating-cards {
  position: absolute;
  top: 20px;
  left: -20px;
}

.card {
  background: white;
  padding: 15px;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
}

.card-1 {
  transform: translateX(-20px);
}

.card-2 {
  transform: translateX(20px);
}

.card-icon {
  font-size: 1.5rem;
}

.card p {
  font-size: 0.9rem;
  color: #333;
}

.dashboard-preview {
  width: 100%;
  max-width: 500px;
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.floating {
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.scrolling-brands {
  background: #fff;
  padding: 20px 0;
  overflow: hidden;
  white-space: nowrap;
}

.brands-track {
  display: inline-block;
  animation: scroll 20s linear infinite;
}

.brands-track span {
  font-size: 1rem;
  font-weight: 600;
  color: #4CAF50;
  margin-right: 30px;
}

.brand-logo {
  display: inline-block;
  font-size: 1rem;
  color: #333;
  margin: 0 30px;
}

@keyframes scroll {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

/* Features Section */
.features-section {
  padding: 80px 20px;
  background: #fff;
  text-align: center;
}

.section-intro {
  max-width: 800px;
  margin: 0 auto 40px;
}

.section-intro h2 {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 15px;
}

.underline {
  position: relative;
}

.underline::after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 0;
  width: 100%;
  height: 3px;
  background: #4CAF50;
}

.section-subtitle {
  font-size: 1.2rem;
  color: #666;
}

.features-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.feature-card {
  background: #f9f9f9;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  text-align: left;
  position: relative;
  overflow: hidden;
  animation: fadeInUp 0.6s ease-out forwards;
  animation-delay: var(--delay);
}

.feature-icon {
  font-size: 2rem;
  margin-bottom: 15px;
}

.feature-card h3 {
  font-size: 1.5rem;
  margin-bottom: 10px;
}

.feature-card p {
  font-size: 1rem;
  color: #666;
}

.feature-arrow {
  position: absolute;
  bottom: 20px;
  right: 20px;
  font-size: 1.5rem;
  color: #4CAF50;
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Stats Section */
.stats-section {
  padding: 80px 20px;
  background: #f5f7fa;
  text-align: center;
}

.stats-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.stat-item {
  background: #fff;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  animation: fadeInUp 0.6s ease-out;
}

.stat-number {
  font-size: 2.5rem;
  font-weight: 700;
  color: #4CAF50;
  margin-bottom: 10px;
}

.stat-label {
  font-size: 1rem;
  color: #666;
}

canvas {
  margin: 0 auto;
}

/* Graphs Section */
.graphs-section {
  padding: 80px 20px;
  background: #fff;
  text-align: center;
}

.graphs-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.graph-card {
  background: #f9f9f9;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  animation: fadeInUp 0.6s ease-out;
}

.graph-card h3 {
  font-size: 1.2rem;
  margin-bottom: 15px;
}

.graph-image {
  width: 100%;
  height: auto;
  border-radius: 4px;
}

/* Team Section */
.team-content {
  padding: 80px 20px;
  background: #f5f7fa;
  text-align: center;
}

.team-content h2 {
  font-size: 2.5rem;
  margin-bottom: 40px;
}

.team-members-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.team-member {
  display: flex;
  align-items: center;
  background: #fff;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.member-img {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 20px;
}

.member-info {
  text-align: left;
}

.member-name {
  font-size: 1.5rem;
  margin-bottom: 10px;
}

.member-skills, .member-contribution {
  font-size: 1rem;
  color: #666;
  margin-bottom: 5px;
}

/* CTA Section */
.cta-section {
  position: relative;
  padding: 80px 20px;
  text-align: center;
  color: white;
  overflow: hidden;
}

.parallax-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: url('@/assets/cta-bg.jpg') no-repeat center center/cover;
  z-index: -1;
  transform: translateZ(0);
}

.cta-content {
  position: relative;
  z-index: 1;
  max-width: 800px;
  margin: 0 auto;
}

.cta-content h2 {
  font-size: 2.5rem;
  margin-bottom: 20px;
}

.cta-content p {
  font-size: 1.2rem;
  margin-bottom: 30px;
}

.cta-button {
  background: #4CAF50;
  color: white;
  padding: 15px 30px;
  font-size: 1.1rem;
  font-weight: 600;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
}

.cta-button:hover {
  background: #388E3C;
  transform: translateY(-2px);
}

.arrow-icon {
  margin-left: 10px;
}

/* Footer */
.main-footer {
  background: #1a1a1a;
  color: #fff;
  padding: 60px 20px 20px;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  max-width: 1200px;
  margin: 0 auto 40px;
  gap: 20px;
}

.footer-brand {
  flex: 1;
  min-width: 250px;
}

.footer-brand .logo {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 15px;
}

.footer-brand p {
  font-size: 1rem;
  color: #aaa;
  margin-bottom: 20px;
}

.social-links a {
  color: #aaa;
  font-size: 1.2rem;
  margin-right: 15px;
  transition: color 0.3s ease;
}

.social-links a:hover {
  color: #4CAF50;
}

.footer-links {
  display: flex;
  flex-wrap: wrap;
  gap: 40px;
  flex: 2;
}

.links-group {
  min-width: 150px;
}

.links-group h4 {
  font-size: 1.2rem;
  margin-bottom: 15px;
}

.links-group a {
  display: block;
  color: #aaa;
  font-size: 1rem;
  margin-bottom: 10px;
  transition: color 0.3s ease;
}

.links-group a:hover {
  color: #4CAF50;
}

.footer-bottom {
  border-top: 1px solid #333;
  padding-top: 20px;
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  max-width: 1200px;
  margin: 0 auto;
  font-size: 0.9rem;
  color: #aaa;
}

.legal-links a {
  color: #aaa;
  margin-left: 20px;
  transition: color 0.3s ease;
}

.legal-links a:hover {
  color: #4CAF50;
}

/* Loading and Error States */
.loading {
  font-size: 1.2rem;
  color: #4CAF50;
  text-align: center;
  padding: 20px;
}

.error {
  font-size: 1.2rem;
  color: #f44336;
  text-align: center;
  padding: 20px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .hero-content {
    flex-direction: column;
    text-align: center;
  }

  .hero-text h1 {
    font-size: 2.5rem;
  }

  .cta-buttons {
    justify-content: center;
  }

  .hero-image {
    margin-top: 20px;
  }

  .features-container, .stats-container, .graphs-container, .team-members-container {
    grid-template-columns: 1fr;
  }

  .footer-content {
    flex-direction: column;
  }

  .footer-links {
    flex-direction: column;
    gap: 20px;
  }

  .footer-bottom {
    flex-direction: column;
    gap: 10px;
    text-align: center;
  }

  .legal-links a {
    margin: 0 10px;
  }
}
</style>
```