<template>
  <div class="dashboard">
    <header class="dashboard-header">
      <h1>AI-Powered Customer Insights</h1>
      <p class="subtitle">Powered by predictive analytics and machine learning models</p>
    </header>

    <!-- Controls Section -->
    <section class="controls-section">
      <div class="controls">
        <button @click="refreshData" class="refresh-button">
          <span class="icon">⟳</span> Refresh Predictions
        </button>
        <div class="time-selector">
          <label for="timeRange">Forecast Period:</label>
          <select v-model="timeRange" @change="fetchModelData" id="timeRange" class="time-range">
            <option value="7d">7 Days</option>
            <option value="30d">30 Days</option>
            <option value="90d">90 Days</option>
          </select>
        </div>
        <div class="model-info">
          <span class="model-version">Model v{{ modelVersion }}</span>
          <span class="accuracy">Accuracy: {{ modelAccuracy }}%</span>
        </div>
      </div>
    </section>

    <!-- Key Predictive Metrics -->
    <section class="metrics-section">
      <h2 class="section-title">Predictive KPIs</h2>
      <div class="metrics-grid" v-if="!isLoading">
        <div class="metric-card" v-for="metric in keyMetrics" :key="metric.title" @click="showMetricDetails(metric)">
          <div class="metric-header">
            <h3>{{ metric.title }}</h3>
            <span class="confidence" :class="getConfidenceClass(metric.confidence)">
              {{ metric.confidence }}% confidence
            </span>
          </div>
          <div class="metric-value">
            {{ metric.title === 'Churn Risk' ? metric.value : formatCurrency(parseCurrency(metric.value)) }}
          </div>
          <div class="metric-trend">
            <span class="trend-indicator" :class="{ 'up': metric.trend > 0, 'down': metric.trend < 0 }">
              {{ metric.trend > 0 ? '↑' : '↓' }} {{ Math.abs(metric.trend) }}%
            </span>
            <span class="trend-period">vs previous period</span>
          </div>
          <div class="metric-description">{{ metric.shortDescription }}</div>
        </div>
      </div>
      <div v-else class="loading-predictions">
        <div class="spinner"></div>
        <p>Generating predictions from ML model...</p>
      </div>
    </section>

    <!-- Actionable Recommendations -->
    <section class="recommendations-section">
      <h2 class="section-title">AI Recommendations</h2>
      <div class="recommendations-grid">
        <div class="recommendation-card" v-for="(rec, index) in recommendations" :key="index">
          <div class="rec-header">
            <span class="rec-priority" :class="'priority-' + rec.priority.toLowerCase()">{{ rec.priority }}</span>
            <h3>{{ rec.title }}</h3>
          </div>
          <p class="rec-description">{{ rec.description }}</p>
          <div class="rec-metrics">
            <span class="rec-metric">
              <strong>Impact:</strong> {{ rec.impact }}
            </span>
            <span class="rec-metric">
              <strong>Confidence:</strong> {{ rec.confidence }}%
            </span>
          </div>
          <button @click="implementRecommendation(rec.id)" class="rec-action">Implement</button>
        </div>
      </div>
    </section>

    <!-- Model Insights Section -->
    <section class="insights-section">
      <h2 class="section-title">Model Insights</h2>
      <div class="insights-grid">
        <div class="insight-card" v-for="graph in insightGraphs" :key="graph.id">
          <h3>{{ graph.title }}</h3>
          <img :src="graph.src" :alt="graph.title" class="insight-image" />
          <p class="insight-description">{{ graph.description }}</p>
        </div>
      </div>
    </section>

    <!-- Customer Predictions Section with Form -->
    <section class="predictions-section">
      <h2 class="section-title">Individual Customer Predictions</h2>

      <!-- Customer Input Form -->
      <div class="form-container">
        <form @submit.prevent="segmentCustomer" class="segment-form">
          <div class="form-grid">
            <div class="form-group">
              <label>Name:</label>
              <input v-model="newCustomer.name" type="text" placeholder="e.g., John Doe" required />
            </div>
            <div class="form-group">
              <label>Age:</label>
              <select v-model="newCustomer.Age" required>
                <option value="18-24">18-24</option>
                <option value="25-34">25-34</option>
                <option value="35-44">35-44</option>
                <option value="45-54">45-54</option>
                <option value="55+">55+</option>
              </select>
            </div>
            <div class="form-group">
              <label>Gender:</label>
              <select v-model="newCustomer.Gender" required>
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div class="form-group">
              <label>Monthly Income:</label>
              <select v-model="newCustomer['Monthly Income']" required>
                <option value="<450,000">&gt;450,000</option>
                <option value="450,000-1,000,000">450,000-1,000,000</option>
                <option value="1,000,000-2,000,000">1,000,000-2,000,000</option>
                <option value=">2,000,000">&lt;2,000,000</option>
              </select>
            </div>
            <div class="form-group">
              <label>Average Spending:</label>
              <select v-model="newCustomer['Average spending']" required>
                <option value="<50,000">&gt;50,000</option>
                <option value="50,000-100,000">50,000-100,000</option>
                <option value="100,000-200,000">100,000-200,000</option>
                <option value=">200,000">&lt;200,000</option>
              </select>
            </div>
            <div class="form-group">
              <label>Frequency (Regular):</label>
              <select v-model="newCustomer['Frequency of Shopping(Regular)']" required>
                <option value="Daily">Daily</option>
                <option value="Weekly">Weekly</option>
                <option value="Monthly">Monthly</option>
                <option value="Rarely">Rarely</option>
              </select>
            </div>
            <div class="form-group">
              <label>Satisfaction (1-5):</label>
              <input v-model.number="newCustomer['Rate of Satisfaction']" type="number" min="1" max="5" required />
            </div>
            <div class="form-group">
              <label>Availability (1-5):</label>
              <input v-model.number="newCustomer['Rate of availability of products']" type="number" min="1" max="5" required />
            </div>
          </div>
          <button type="submit" class="submit-button">Add & Segment</button>
        </form>
      </div>

      <!-- Predictions Table -->
      <div class="table-container">
        <table class="predictions-table">
          <thead>
            <tr>
              <th @click="sortCustomers('name')">Customer <span v-if="sortBy === 'name'" class="sort-icon">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span></th>
              <th @click="sortCustomers('segment')">Segment <span v-if="sortBy === 'segment'" class="sort-icon">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span></th>
              <th @click="sortCustomers('churnRisk')">Churn Risk <span v-if="sortBy === 'churnRisk'" class="sort-icon">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span></th>
              <th @click="sortCustomers('predictedValue')">Predicted Value <span v-if="sortBy === 'predictedValue'" class="sort-icon">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span></th>
              <th @click="sortCustomers('nextPurchase')">Next Purchase <span v-if="sortBy === 'nextPurchase'" class="sort-icon">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span></th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="customer in sortedCustomers" :key="customer.id">
              <td class="customer-name">
                <span class="name">{{ customer.name }}</span>
                <span class="customer-id">#{{ customer.id }}</span>
              </td>
              <td>
                <span class="segment-tag" :class="'segment-' + customer.segment.toLowerCase().replace(/[, ]+/g, '-')">
                  {{ customer.segment }}
                </span>
              </td>
              <td>
                <div class="risk-meter">
                  <div class="risk-bar" :style="{ width: customer.churnRisk + '%' }" :class="getRiskClass(customer.churnRisk)"></div>
                  <span class="risk-value">{{ customer.churnRisk }}%</span>
                </div>
              </td>
              <td class="predicted-value">{{ formatCurrency(customer.predictedValue) }}</td>
              <td>{{ formatDate(customer.nextPurchase) }}</td>
              <td>
                <button @click="viewCustomerDetails(customer)" class="action-button">Details</button>
              </td>
            </tr>
          </tbody>
        </table>
        <div class="pagination">
          <button @click="prevPage" :disabled="currentPage === 1">Previous</button>
          <span>Page {{ currentPage }} of {{ totalPages }}</span>
          <button @click="nextPage" :disabled="currentPage === totalPages">Next</button>
        </div>
      </div>
    </section>

<section class="query-section">
    <h2 class="section-title">Customer Query</h2>
    <div class="query-filters">
      <div class="form-group">
        <label for="ageFilter">Age:</label>
        <select v-model="queryFilters.age" @change="fetchQueryData" id="ageFilter">
          <option value="">All Ages</option>
          <option value="18-24">18-24</option>
          <option value="25-34">25-34</option>
          <option value="35-44">35-44</option>
          <option value="45-54">45-54</option>
          <option value="55+">55+</option>
        </select>
      </div>
      <div class="form-group">
        <label for="genderFilter">Gender:</label>
        <select v-model="queryFilters.gender" @change="fetchQueryData" id="genderFilter">
          <option value="">All Genders</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
      </div>
      <div class="form-group">
        <label for="regionFilter">Region:</label>
        <select v-model="queryFilters.region" @change="fetchQueryData" id="regionFilter">
        <option value="">All Regions</option>
        <option value="Central">Central</option>
        <option value="Eastern">Eastern</option>
        <option value="Western">Western</option>
        <option value="Northern">Northern</option>
      </select>
      </div>
      <div class="form-group">
        <label for="spendingFilter">Average Spending:</label>
        <select v-model="queryFilters.spending" @change="fetchQueryData" id="spendingFilter">
          <option value="">All Spending</option>
          <option value="<50,000">&gt;50,000</option>
          <option value="50,000-100,000">50,000-100,000</option>
          <option value="100,000-200,000">100,000-200,000</option>
          <option value=">200,000">&lt;200,000</option>
        </select>
      </div>
      <button @click="resetFilters" class="reset-button">Reset Filters</button>
    </div>

    <div v-if="queryLoading" class="query-loading">
      <div class="spinner"></div>
      <p>Loading customer data...</p>
    </div>

    <div v-else class="query-results">
      <div class="chart-container">
        <canvas id="queryChart"></canvas>
      </div>
      <div class="query-summary-card">
        <h3 class="query-total">
          <strong>Total Customers:</strong> {{ queryData?.total || 0 }}
        </h3>
        <div v-if="activeFilterCount === 1 && queryData" class="query-details">
          <h4 class="query-filter-title">
            Details for {{ queryData.filter_key }}: {{ queryData.filter_value }}
          </h4>
          <p class="query-filter-breakdown">
            {{ queryData.filter_value }}: {{ queryData.total }} ({{ queryData.percentage }})
          </p>
          <div class="query-metrics">
            <div class="metric-item">
              <span class="metric-label">Most Frequent Category:</span>
              <span class="metric-value">{{ queryData.most_frequent_category || 'Unknown' }}</span>
            </div>
            <div class="metric-item">
              <span class="metric-label">Average Spending:</span>
              <span class="metric-value">{{ queryData.average_spending ? formatCurrency(queryData.average_spending) : 'UGX 0' }}</span>
            </div>
            <div class="metric-item">
              <span class="metric-label">Highest Spender:</span>
              <ul class="highest-spender-list">
                <li>
                  Region: {{ queryData.highest_spender?.Region?.name || 'Unknown' }}
                  ({{ queryData.highest_spender?.Region?.spending ? formatCurrency(queryData.highest_spender.Region.spending) : 'UGX 0' }})
                </li>
                <li>
                  Age Group: {{ queryData.highest_spender?.Age?.name || 'Unknown' }}
                  ({{ queryData.highest_spender?.Age?.spending ? formatCurrency(queryData.highest_spender.Age.spending) : 'UGX 0' }})
                </li>
                <li>
                  Gender: {{ queryData.highest_spender?.Gender?.name || 'Unknown' }}
                  ({{ queryData.highest_spender?.Gender?.spending ? formatCurrency(queryData.highest_spender.Gender.spending) : 'UGX 0' }})
                </li>
              </ul>
            </div>
            <div class="metric-item">
              <span class="metric-label">Most Purchased Category:</span>
              <span class="metric-value">{{ queryData.most_purchased_category || 'Unknown' }}</span>
            </div>
          </div>
        </div>
        <div v-else-if="queryData" class="query-details">
          <h4 class="query-filter-title">Query Insights</h4>
          <div class="query-metrics">
            <div class="metric-item">
              <span class="metric-label">Most Frequent Category:</span>
              <span class="metric-value">{{ queryData.most_frequent_category || 'Unknown' }}</span>
            </div>
            <div class="metric-item">
              <span class="metric-label">Average Spending:</span>
              <span class="metric-value">{{ queryData.average_spending ? formatCurrency(queryData.average_spending) : 'UGX 0' }}</span>
            </div>
            <div class="metric-item">
              <span class="metric-label">Most Purchased Category:</span>
              <span class="metric-value">{{ queryData.most_purchased_category || 'Unknown' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
    <!-- Modal for Metric Details -->
    <div v-if="selectedMetric" class="modal-overlay" @click.self="selectedMetric = null">
      <div class="metric-modal">
        <div class="modal-header">
          <h2>{{ selectedMetric.title }} Details</h2>
          <button class="close-modal" @click="selectedMetric = null">×</button>
        </div>
        <div class="modal-body">
          <div class="metric-summary">
            <div class="summary-item">
              <span class="summary-label">Current Value</span>
              <span class="summary-value">
                {{ selectedMetric.title === 'Churn Risk' ? selectedMetric.value : formatCurrency(parseCurrency(selectedMetric.value)) }}
              </span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Trend</span>
              <span class="summary-value summary-trend" :class="{ 'up': selectedMetric.trend > 0, 'down': selectedMetric.trend < 0 }">
                {{ selectedMetric.trend > 0 ? '↑' : '↓' }} {{ Math.abs(selectedMetric.trend) }}%
              </span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Confidence</span>
              <span class="summary-value summary-confidence" :class="getConfidenceClass(selectedMetric.confidence)">
                {{ selectedMetric.confidence }}%
              </span>
            </div>
          </div>
          <div class="metric-chart">
            <canvas :id="'modalChart-' + selectedMetric.id"></canvas>
          </div>
          <div class="metric-details">
            <h3>Model Explanation</h3>
            <p>{{ selectedMetric.modelExplanation }}</p>
            <h3>Key Influencers</h3>
            <ul class="influencers-list">
              <li v-for="(influencer, index) in selectedMetric.influencers" :key="index">
                <span class="factor-name">{{ influencer.name }}</span>
                <span class="factor-impact" :class="{ 'positive': influencer.impact > 0, 'negative': influencer.impact < 0 }">
                  {{ influencer.impact > 0 ? '+' : '' }}{{ influencer.impact }}%
                </span>
              </li>
            </ul>
          </div>
        </div>
        <div class="modal-footer">
          <button class="modal-close-btn" @click="selectedMetric = null">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Chart from "chart.js/auto";
import axios from "axios";

export default {
  name: "AICustomerDashboard",
  data() {
    return {
      keyMetrics: [],
      recommendations: [],
      customerPredictions: [],
      timeRange: "30d",
      isLoading: false,
      selectedMetric: null,
      charts: {},
      sortBy: "predictedValue",
      sortOrder: "desc",
      currentPage: 1,
      rowsPerPage: 10,
      modelVersion: "2.4.1",
      modelAccuracy: 92.4,
      newCustomer: {
        name: "",
        Age: "18-24",
        Gender: "Female",
        "Monthly Income": "<450,000",
        Region: "Central",
        "Frequency of Shopping(Regular)": "Monthly",
        "Average spending": "<50,000",
        Categories: "Fashion",
        "Means of Payment": "Cash on Delivery",
        "Enrolled on Jumia Prime or any loyalty program": "No",
        "Frequency of shopping(Occassional)": "Occasionally",
        "Reason for your purchase": "Price",
        "Device to shop": "Smart phones",
        "Internet connection used": "Mobile data",
        "Recommendation to others": "Yes",
        "Rate of Satisfaction": 3,
        "Rate of availability of products": 3,
      },
      insightGraphs: [
        { id: 1, title: "Age Distribution", src: "http://127.0.0.1:5000/static/img/age_distribution.png", description: "Distribution of customers by age group" },
        { id: 2, title: "Average Spending Distribution", src: "http://127.0.0.1:5000/static/img/avg_spending_distribution.png", description: "Spending patterns across customer segments" },
        { id: 3, title: "Cluster Characteristics", src: "http://127.0.0.1:5000/static/img/cluster_characteristics.png", description: "Key traits defining each cluster" },
        { id: 4, title: "Region Distribution", src: "http://127.0.0.1:5000/static/img/region_distribution.png", description: "Geographical spread of customers" },
        { id: 5, title: "Shopping Frequency", src: "http://127.0.0.1:5000/static/img/shopping_frequency.png", description: "How often customers shop" },
        { id: 6, title: "Silhouette Analysis", src: "http://127.0.0.1:5000/static/img/silhouette_analysis.png", description: "Cluster quality assessment" },
      ],
      queryFilters: {
        age: "",
        gender: "",
        region: "",
        spending: "",
      },
      queryData: null,
      queryLoading: false,
    };
  },
  computed: {
    sortedCustomers() {
      const sorted = [...this.customerPredictions];
      sorted.sort((a, b) => {
        if (a[this.sortBy] < b[this.sortBy]) return this.sortOrder === "asc" ? -1 : 1;
        if (a[this.sortBy] > b[this.sortBy]) return this.sortOrder === "asc" ? 1 : -1;
        return 0;
      });
      const start = (this.currentPage - 1) * this.rowsPerPage;
      const end = start + this.rowsPerPage;
      return sorted.slice(start, end);
    },
    totalPages() {
      return Math.ceil(this.customerPredictions.length / this.rowsPerPage);
    },
    activeFilterCount() {
      return Object.values(this.queryFilters).filter(Boolean).length;
    },
    activeFilterName() {
      const activeFilters = Object.keys(this.queryFilters).filter(
        (key) => this.queryFilters[key]
      );
      return activeFilters.length === 1
        ? activeFilters[0].charAt(0).toUpperCase() + activeFilters[0].slice(1)
        : "";
    },
  },
  beforeMount() {
    this.createCharts();
  },
  async mounted() {
    await Promise.all([this.fetchModelData(), this.fetchRecommendations(), this.fetchQueryData()]);
  },
  methods: {
    async fetchModelData() {
      this.isLoading = true;
      try {
        const response = await axios.get("http://127.0.0.1:5000/dashboard");
        this.keyMetrics = response.data.keyMetrics || [];
        this.customerPredictions = response.data.customerPredictions || [];
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        this.showError("Failed to load dashboard data: " + error.message);
      } finally {
        this.isLoading = false;
      }
    },
    async fetchRecommendations() {
      try {
        const response = await axios.get("http://127.0.0.1:5000/recommendations");
        this.recommendations = response.data || [];
      } catch (error) {
        console.error("Error fetching recommendations:", error);
        this.showError("Failed to load recommendations: " + error.message);
      }
    },
    async implementRecommendation(id) {
      try {
        await axios.post("http://127.0.0.1:5000/implement-recommendation", { id });
        this.recommendations = this.recommendations.filter(rec => rec.id !== id);
        this.showSuccess("Recommendation implemented successfully!");
      } catch (error) {
        console.error("Error implementing recommendation:", error);
        this.showError("Failed to implement recommendation: " + error.message);
      }
    },
    createCharts() {
      const chartConfigs = [
        {
          id: "queryChart",
          type: "bar",
          options: {
            responsive: true,
            scales: {
              y: {
                beginAtZero: true,
                title: { display: true, text: "Customer Count" }
              }
            },
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: {
                  label: (context) => `${context.raw} customers`
                }
              }
            }
          }
        }
      ];

      chartConfigs.forEach(({ id, type, options }) => {
        const ctx = document.getElementById(id);
        if (!ctx) {
          console.error(`Canvas #${id} not found in DOM`);
          return;
        }
        if (!this.charts[id]) {
          this.charts[id] = new Chart(ctx, {
            type,
            data: { labels: [], datasets: [] },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              ...options
            }
          });
        }
      });
    },
    async fetchQueryData() {
      this.queryLoading = true;
      try {
        const params = {};
        if (this.queryFilters.age) params.age = this.queryFilters.age;
        if (this.queryFilters.gender) params.gender = this.queryFilters.gender;
        if (this.queryFilters.region) params.region = this.queryFilters.region;
        if (this.queryFilters.spending) params.spending = this.queryFilters.spending;

        const response = await axios.get("http://127.0.0.1:5000/query", { params });
        this.queryData = response.data || {
          total: 0,
          counts: {},
          most_frequent_category: null,
          average_spending: 0,
          highest_spender: null,
          most_purchased_category: null
        };
        this.updateQueryChart();
      } catch (error) {
        console.error("fetchQueryData Error:", error);
        this.showError("Failed to fetch query data: " + error.message);
        this.queryData = null;
      } finally {
        this.queryLoading = false;
      }
    },
    updateQueryChart() {
      if (!this.queryData || !this.charts["queryChart"]) return;

      let labels, data;
      if (this.activeFilterCount === 0) {
        labels = ["All Customers"];
        data = [this.queryData.total || 0];
      } else if (this.activeFilterCount === 1) {
        const key = this.activeFilterName.toLowerCase();
        labels = Object.keys(this.queryData.counts[key] || {});
        data = Object.values(this.queryData.counts[key] || {});
      } else {
        labels = ["Filtered Customers"];
        data = [this.queryData.total || 0];
      }

      this.charts["queryChart"].data.labels = labels;
      this.charts["queryChart"].data.datasets = [
        {
          label: "Customer Count",
          data,
          backgroundColor: "#4e79a7",
          borderColor: "#2b5b8e",
          borderWidth: 1
        }
      ];
      this.charts["queryChart"].update();
    },
    resetFilters() {
      this.queryFilters.age = "";
      this.queryFilters.gender = "";
      this.queryFilters.region = "";
      this.queryFilters.spending = "";
      this.fetchQueryData();
    },
    async segmentCustomer() {
      try {
        const customerData = { ...this.newCustomer };
        const response = await axios.post("http://127.0.0.1:5000/segment", customerData);
        if (response.data.status === "success") {
          const newPrediction = {
            id: response.data.id,
            name: this.newCustomer.name,
            segment: response.data.description,
            churnRisk: response.data.cluster === 3 ? 50 : response.data.cluster === 0 ? 20 : 10,
            predictedValue: this.estimatePredictedValue(this.newCustomer["Average spending"]),
            nextPurchase: response.data.nextPurchase
          };
          this.customerPredictions.unshift(newPrediction);
          this.newCustomer.name = "";
          this.showSuccess("Customer segmented successfully!");
        } else {
          this.showError("Segmentation failed: " + response.data.error);
        }
      } catch (error) {
        console.error("Error segmenting customer:", error);
        this.showError("Failed to segment customer: " + error.message);
      }
    },
    estimatePredictedValue(spendingRange) {
      const ranges = {
        "<50,000": 500,
        "50,000-100,000": 1500,
        "100,000-200,000": 3000,
        ">200,000": 5000
      };
      return ranges[spendingRange] || 1000;
    },
    formatCurrency(value) {
      return `UGX ${Number(value).toLocaleString()}`;
    },
    parseCurrency(value) {
      if (typeof value === "string") {
        return parseFloat(value.replace(/[^0-9,.]/g, "").replace(",", ""));
      }
      return value;
    },
    refreshData() {
      this.fetchModelData();
      this.fetchRecommendations();
      this.fetchQueryData();
    },
    formatDate(dateString) {
      const options = { month: "short", day: "numeric" };
      return new Date(dateString).toLocaleDateString("en-US", options);
    },
    showMetricDetails(metric) {
      this.selectedMetric = metric;
      this.$nextTick(() => this.updateModalChart(metric));
    },
    sortCustomers(column) {
      if (this.sortBy === column) {
        this.sortOrder = this.sortOrder === "asc" ? "desc" : "asc";
      } else {
        this.sortBy = column;
        this.sortOrder = "desc";
      }
    },
    nextPage() {
      if (this.currentPage < this.totalPages) this.currentPage++;
    },
    prevPage() {
      if (this.currentPage > 1) this.currentPage--;
    },
    getConfidenceClass(confidence) {
      if (confidence >= 90) return "high";
      if (confidence >= 75) return "medium";
      return "low";
    },
    getRiskClass(risk) {
      if (risk < 20) return "low";
      if (risk < 50) return "medium";
      return "high";
    },
    showError(message) {
      alert(message);
    },
    showSuccess(message) {
      alert(message);
    },
    hexToRgba(hex, alpha) {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    },
    updateModalChart(metric) {
      const ctx = document.getElementById(`modalChart-${metric.id}`);
      if (!ctx) return;
      if (ctx.chart) ctx.chart.destroy();

      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
      const historicalData = months.map((_, i) => {
        const baseValue = 100000 + i * 20000;
        const randomFactor = Math.random() * 20000 - 10000;
        return Math.round(baseValue + randomFactor);
      });
      const nextMonth = "Jul";
      months.push(nextMonth);
      historicalData.push(Math.round(historicalData[historicalData.length - 1] * (1 + metric.trend / 100)));

      ctx.chart = new Chart(ctx, {
        type: "line",
        data: {
          labels: months,
          datasets: [
            {
              label: "Historical Data",
              data: historicalData.slice(0, -1),
              borderColor: "#4e79a7",
              backgroundColor: this.hexToRgba("#4e79a7", 0.1),
              borderWidth: 2,
              tension: 0.3
            },
            {
              label: "Model Prediction",
              data: [...Array(historicalData.length - 1).fill(null), historicalData[historicalData.length - 1]],
              borderColor: "#e15759",
              backgroundColor: this.hexToRgba("#e15759", 0.1),
              borderWidth: 2,
              borderDash: [5, 5],
              pointBackgroundColor: "#e15759",
              pointRadius: 5
            }
          ]
        },
        options: {
          responsive: true,
          plugins: {
            tooltip: {
              callbacks: {
                label: (context) => {
                  let label = context.dataset.label || "";
                  if (label) label += ": ";
                  if (context.raw !== null) label += `UGX ${context.raw.toLocaleString()}`;
                  return label;
                }
              }
            }
          },
          scales: {
            y: {
              beginAtZero: false,
              ticks: { callback: (value) => `UGX ${(value / 1000).toLocaleString()}K` }
            }
          }
        }
      });
    },
    viewCustomerDetails(customer) {
      alert(`Details for ${customer.name} (ID: ${customer.id})\nSegment: ${customer.segment}\nChurn Risk: ${customer.churnRisk}%\nPredicted Value: ${this.formatCurrency(customer.predictedValue)}\nNext Purchase: ${this.formatDate(customer.nextPurchase)}`);
    }
  }
};
</script>

<style scoped>
/* Base Styles */
.dashboard {
  padding: 2vw;
  font-family: "Segoe UI", Roboto, "Helvetica Neue", sans-serif;
  color: #333;
  max-width: 1800px;
  margin: 0 auto;
  background-color: #f8fafc;
  min-height: 100vh;
}

/* Header */
.dashboard-header {
  text-align: center;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.dashboard-header h1 {
  font-size: clamp(1.6rem, 4.5vw, 2rem);
  font-weight: 600;
  color: #1a365d;
  margin-bottom: 0.5rem;
}

.subtitle {
  font-size: clamp(0.85rem, 2.2vw, 0.95rem);
  color: #718096;
  font-weight: 500;
}

/* Section Title */
.section-title {
  font-size: clamp(1.1rem, 3vw, 1.3rem);
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 1.25rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e2e8f0;
}

/* Controls Section */
.controls-section {
  margin-bottom: 1.5rem;
}

.controls {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: center;
  background: white;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 3px 5px -1px rgba(0, 0, 0, 0.05);
}

.refresh-button {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.6rem 1rem;
  background-color: #4299e1;
  color: white;
  border: none;
  border-radius: 5px;
  font-weight: 500;
  font-size: clamp(0.85rem, 2vw, 0.9rem);
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.refresh-button:hover,
.refresh-button:focus {
  background-color: #3182ce;
  outline: none;
}

.refresh-button:focus-visible {
  box-shadow: 0 0 0 2px rgba(66, 153, 225, 0.5);
}

.icon {
  font-size: clamp(0.9rem, 1.8vw, 1rem);
}

.time-selector {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.time-selector label {
  font-weight: 500;
  color: #4a5568;
  font-size: clamp(0.8rem, 1.8vw, 0.85rem);
}

.time-range {
  padding: 0.5rem 0.75rem;
  border: 1px solid #cbd5e0;
  border-radius: 5px;
  background-color: white;
  font-size: clamp(0.8rem, 1.8vw, 0.85rem);
  cursor: pointer;
  transition: border-color 0.2s ease;
}

.time-range:focus {
  border-color: #4299e1;
  outline: none;
  box-shadow: 0 0 0 2px rgba(66, 153, 225, 0.3);
}

.model-info {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  font-size: clamp(0.75rem, 1.6vw, 0.8rem);
}

.model-version,
.accuracy {
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
}

.model-version {
  background-color: #edf2f7;
  color: #4a5568;
}

.accuracy {
  background-color: #ebf8ff;
  color: #3182ce;
}

/* Metrics Grid */
.metrics-section {
  margin-bottom: 1.5rem;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(260px, 100%), 1fr));
  gap: 1rem;
}

.metric-card {
  background: white;
  border-radius: 8px;
  padding: 1.25rem;
  box-shadow: 0 3px 5px -1px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  cursor: pointer;
}

.metric-card:hover,
.metric-card:focus-within {
  transform: translateY(-2px);
  box-shadow: 0 8px 12px -2px rgba(0, 0, 0, 0.1);
}

.metric-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
}

.metric-header h3 {
  font-size: clamp(0.95rem, 2.2vw, 1rem);
  font-weight: 600;
  color: #2d3748;
  margin: 0;
}

.confidence {
  font-size: clamp(0.65rem, 1.4vw, 0.7rem);
  padding: 0.15rem 0.4rem;
  border-radius: 8px;
  font-weight: 500;
}

.confidence.high {
  background-color: #ebf8f2;
  color: #38a169;
}

.confidence.medium {
  background-color: #feebc8;
  color: #dd6b20;
}

.confidence.low {
  background-color: #fed7d7;
  color: #e53e3e;
}

.metric-value {
  font-size: clamp(1.3rem, 3.5vw, 1.8rem);
  font-weight: 700;
  color: #1a365d;
  margin-bottom: 0.5rem;
}

.metric-trend {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin-bottom: 0.75rem;
}

.trend-indicator {
  font-weight: 600;
  font-size: clamp(0.75rem, 1.8vw, 0.8rem);
}

.trend-indicator.up {
  color: #38a169;
}

.trend-indicator.down {
  color: #e53e3e;
}

.trend-period {
  font-size: clamp(0.7rem, 1.6vw, 0.75rem);
  color: #718096;
}

.metric-description {
  font-size: clamp(0.75rem, 1.8vw, 0.8rem);
  color: #718096;
  line-height: 1.4;
}

.loading-predictions {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 3px 5px -1px rgba(0, 0, 0, 0.05);
}

.spinner {
  width: 2rem;
  height: 2rem;
  border: 3px solid #e2e8f0;
  border-top-color: #4299e1;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 0.75rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Recommendations */
.recommendations-section {
  margin-bottom: 1.5rem;
}

.recommendations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(260px, 100%), 1fr));
  gap: 1rem;
}

.recommendation-card {
  background: white;
  border-radius: 8px;
  padding: 1.25rem;
  box-shadow: 0 3px 5px -1px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
}

.rec-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.rec-priority {
  font-size: clamp(0.6rem, 1.4vw, 0.65rem);
  font-weight: 700;
  text-transform: uppercase;
  padding: 0.15rem 0.4rem;
  border-radius: 3px;
}

.priority-high {
  background-color: #fed7d7;
  color: #e53e3e;
}

.priority-medium {
  background-color: #feebc8;
  color: #dd6b20;
}

.priority-low {
  background-color: #ebf8f2;
  color: #38a169;
}

.rec-header h3 {
  font-size: clamp(0.95rem, 2.2vw, 1rem);
  font-weight: 600;
  color: #2d3748;
  margin: 0;
}

.rec-description {
  font-size: clamp(0.8rem, 1.8vw, 0.85rem);
  color: #4a5568;
  line-height: 1.4;
  margin-bottom: 0.75rem;
  flex-grow: 1;
}

.rec-metrics {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
  font-size: clamp(0.75rem, 1.6vw, 0.8rem);
}

.rec-metric {
  background-color: #f7fafc;
  padding: 0.3rem 0.6rem;
  border-radius: 3px;
}

.rec-metric strong {
  color: #4a5568;
}

.rec-action {
  align-self: flex-start;
  padding: 0.4rem 0.8rem;
  background-color: #4299e1;
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  font-size: clamp(0.75rem, 1.6vw, 0.8rem);
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.rec-action:hover,
.rec-action:focus {
  background-color: #3182ce;
}

.rec-action:focus-visible {
  box-shadow: 0 0 0 2px rgba(66, 153, 225, 0.5);
}

/* Insights Section */
.insights-section {
  margin-bottom: 1.5rem;
}

.insights-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(280px, 100%), 1fr));
  gap: 1rem;
}

.insight-card {
  background: white;
  border-radius: 8px;
  padding: 1.25rem;
  box-shadow: 0 3px 5px -1px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.insight-card h3 {
  font-size: clamp(0.95rem, 2.2vw, 1rem);
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 0.75rem;
}

.insight-image {
  max-width: 100%;
  height: auto;
  border-radius: 5px;
  margin-bottom: 0.75rem;
}

.insight-description {
  font-size: clamp(0.75rem, 1.8vw, 0.8rem);
  color: #718096;
}

/* Predictions Section */
.predictions-section {
  margin-bottom: 1.5rem;
}

.form-container {
  background: white;
  border-radius: 8px;
  padding: 1.25rem;
  margin-bottom: 1rem;
  box-shadow: 0 3px 5px -1px rgba(0, 0, 0, 0.05);
}

.segment-form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(180px, 100%), 1fr));
  gap: 0.75rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-size: clamp(0.8rem, 1.8vw, 0.85rem);
  font-weight: 500;
  color: #4a5568;
  margin-bottom: 0.25rem;
}

.form-group input,
.form-group select {
  padding: 0.4rem;
  border: 1px solid #cbd5e0;
  border-radius: 4px;
  font-size: clamp(0.8rem, 1.8vw, 0.85rem);
  transition: border-color 0.2s ease;
}

.form-group input:focus,
.form-group select:focus {
  border-color: #4299e1;
  outline: none;
  box-shadow: 0 0 0 2px rgba(66, 153, 225, 0.3);
}

.submit-button {
  padding: 0.6rem;
  background-color: #4299e1;
  color: white;
  border: none;
  border-radius: 5px;
  font-weight: 500;
  font-size: clamp(0.85rem, 2vw, 0.9rem);
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.submit-button:hover,
.submit-button:focus {
  background-color: #3182ce;
}

.submit-button:focus-visible {
  box-shadow: 0 0 0 2px rgba(66, 153, 225, 0.5);
}

.table-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 3px 5px -1px rgba(0, 0, 0, 0.05);
}

/* Table Styles for Larger Screens */
@media (min-width: 769px) {
  .predictions-table {
    width: 100%;
    border-collapse: collapse;
  }

  .predictions-table th {
    text-align: left;
    padding: clamp(0.6rem, 1.5vw, 0.8rem);
    background-color: #f7fafc;
    font-weight: 600;
    color: #4a5568;
    cursor: pointer;
  }

  .predictions-table th:hover {
    background-color: #edf2f7;
  }

  .sort-icon {
    margin-left: 0.25rem;
  }

  .predictions-table td {
    padding: clamp(0.6rem, 1.5vw, 0.8rem);
    border-bottom: 1px solid #e2e8f0;
  }
}

.customer-name {
  display: flex;
  flex-direction: column;
}

.name {
  font-weight: 500;
  color: #2d3748;
}

.customer-id {
  font-size: clamp(0.7rem, 1.6vw, 0.75rem);
  color: #718096;
}

.segment-tag {
  display: inline-block;
  padding: 0.2rem 0.4rem;
  border-radius: 3px;
  font-size: clamp(0.7rem, 1.6vw, 0.75rem);
  font-weight: 500;
}

.segment-young-low-income-occasional-shoppers {
  background-color: #fed7d7;
  color: #e53e3e;
}

.segment-young-moderate-income-shoppers {
  background-color: #feebc8;
  color: #dd6b20;
}

.segment-middle-aged-high-spenders {
  background-color: #ebf8ff;
  color: #3182ce;
}

.segment-older-value-seeking-shoppers {
  background-color: #ebf8f2;
  color: #38a169;
}

.risk-meter {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.risk-bar {
  height: 0.4rem;
  border-radius: 3px;
  flex-grow: 1;
  background-color: #e2e8f0;
  overflow: hidden;
  position: relative;
}

.risk-bar::after {
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  background-color: currentColor;
}

.risk-bar.low { color: #38a169; }
.risk-bar.medium { color: #dd6b20; }
.risk-bar.high { color: #e53e3e; }

.risk-value {
  font-size: clamp(0.75rem, 1.6vw, 0.8rem);
  font-weight: 500;
  min-width: 2rem;
  text-align: right;
}

.predicted-value {
  font-weight: 600;
  color: #1a365d;
}

.action-button {
  padding: 0.25rem 0.6rem;
  border: none;
  border-radius: 3px;
  font-size: clamp(0.7rem, 1.6vw, 0.75rem);
  font-weight: 500;
  cursor: pointer;
  background-color: #ebf8ff;
  color: #3182ce;
  transition: background-color 0.2s ease;
}

.action-button:hover,
.action-button:focus {
  background-color: #d6e9ff;
}

.action-button:focus-visible {
  box-shadow: 0 0 0 2px rgba(66, 153, 225, 0.5);
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0.75rem;
  background-color: #f7fafc;
  gap: 0.75rem;
}

.pagination button {
  padding: 0.3rem 0.6rem;
  background-color: #edf2f7;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  font-weight: 500;
  font-size: clamp(0.75rem, 1.6vw, 0.8rem);
  transition: background-color 0.2s ease;
}

.pagination button:hover:not(:disabled),
.pagination button:focus:not(:disabled) {
  background-color: #d6e9ff;
}

.pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Query Section */
.query-section {
  margin-top: 2rem;
  background: white;
  border-radius: 8px;
  padding: 1.25rem;
  box-shadow: 0 3px 5px -1px rgba(0, 0, 0, 0.05);
}

.query-filters {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(160px, 100%), 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
  align-items: end;
}

.reset-button {
  padding: 0.6rem 0.8rem;
  background-color: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-weight: 500;
  font-size: clamp(0.8rem, 1.8vw, 0.85rem);
  cursor: pointer;
  transition: all 0.2s ease;
  height: fit-content;
}

.reset-button:hover,
.reset-button:focus {
  background-color: #e9ecef;
}

.reset-button:focus-visible {
  box-shadow: 0 0 0 2px rgba(66, 153, 225, 0.5);
}

.query-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.query-results {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: stretch;
}

.chart-container {
  flex: 1 1 100%;
  min-width: 260px;
  position: relative;
  height: 280px;
}

.query-summary-card {
  flex: 1 1 100%;
  min-width: 260px;
  background: #f8f9fa;
  border-radius: 6px;
  padding: 1.25rem;
  box-shadow: 0 2px 3px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
}

.query-total {
  font-size: clamp(1.1rem, 2.8vw, 1.2rem);
  font-weight: 600;
  color: #1a365d;
  margin-bottom: 0.75rem;
  padding-bottom: 0.4rem;
  border-bottom: 1px solid #e2e8f0;
}

.query-total strong {
  color: #2d3748;
}

.query-filter-title {
  font-size: clamp(0.95rem, 2.2vw, 1rem);
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 0.5rem;
}

.query-filter-breakdown {
  font-size: clamp(0.85rem, 1.8vw, 0.9rem);
  font-weight: 500;
  color: #4a5568;
  background-color: #ebf8ff;
  padding: 0.4rem 0.75rem;
  border-radius: 5px;
  margin-bottom: 0.75rem;
}

.query-metrics {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  flex-grow: 1;
}

.metric-item {
  padding: 0.6rem;
  background: white;
  border-radius: 5px;
  border: 1px solid #e2e8f0;
  transition: box-shadow 0.2s ease;
}

.metric-item:hover {
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.metric-label {
  font-size: clamp(0.8rem, 1.8vw, 0.85rem);
  font-weight: 500;
  color: #718096;
  margin-bottom: 0.2rem;
}

.metric-value {
  font-size: clamp(0.85rem, 2vw, 0.9rem);
  font-weight: 600;
  color: #1a365d;
}

.highest-spender-list {
  list-style: none;
  padding: 0;
  margin: 0.4rem 0 0;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.highest-spender-list li {
  font-size: clamp(0.75rem, 1.6vw, 0.8rem);
  color: #4a5568;
  padding: 0.2rem 0;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 1rem;
}

.metric-modal {
  background: white;
  border-radius: 8px;
  width: 100%;
  max-width: clamp(280px, 95vw, 800px);
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #e2e8f0;
}

.modal-header h2 {
  font-size: clamp(1.1rem, 2.8vw, 1.2rem);
  font-weight: 600;
  color: #1a365d;
  margin: 0;
}

.close-modal {
  background: none;
  border: none;
  font-size: clamp(1.1rem, 2.5vw, 1.2rem);
  cursor: pointer;
  color: #718096;
  padding: 0.2rem;
  transition: color 0.2s ease;
}

.close-modal:hover,
.close-modal:focus {
  color: #2d3748;
}

.close-modal:focus-visible {
  outline: 2px solid #4299e1;
  outline-offset: 1px;
}

.modal-body {
  padding: 1rem;
}

.metric-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(160px, 100%), 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e2e8f0;
}

.summary-item {
  display: flex;
  flex-direction: column;
}

.summary-label {
  font-size: clamp(0.75rem, 1.6vw, 0.8rem);
  color: #718096;
  margin-bottom: 0.2rem;
}

.summary-value {
  font-size: clamp(1rem, 2.5vw, 1.1rem);
  font-weight: 600;
  color: #1a365d;
}

.summary-trend {
  font-weight: 600;
}

.summary-trend.up { color: #38a169; }
.summary-trend.down { color: #e53e3e; }

.summary-confidence {
  font-weight: 600;
  padding: 0.15rem 0.4rem;
  border-radius: 8px;
  font-size: clamp(0.75rem, 1.6vw, 0.8rem);
  display: inline-block;
}

.summary-confidence.high { background-color: #ebf8f2; color: #38a169; }
.summary-confidence.medium { background-color: #feebc8; color: #dd6b20; }
.summary-confidence.low { background-color: #fed7d7; color: #e53e3e; }

.metric-chart {
  height: clamp(180px, 45vw, 260px);
  margin-bottom: 1.5rem;
}

.metric-details h3 {
  font-size: clamp(0.95rem, 2.2vw, 1rem);
  font-weight: 600;
  color: #2d3748;
  margin-top: 1rem;
  margin-bottom: 0.5rem;
}

.metric-details p {
  line-height: 1.5;
  color: #4a5568;
  margin-bottom: 1rem;
}

.influencers-list {
  list-style: none;
  padding: 0;
}

.influencers-list li {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid #e2e8f0;
}

.factor-name { color: #4a5568; }

.factor-impact {
  font-weight: 500;
}

.factor-impact.positive { color: #38a169; }
.factor-impact.negative { color: #e53e3e; }

.modal-footer {
  padding: 0.75rem 1rem;
  border-top: 1px solid #e2e8f0;
  text-align: right;
}

.modal-close-btn {
  padding: 0.4rem 0.8rem;
  background-color: #4299e1;
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  font-size: clamp(0.8rem, 1.8vw, 0.85rem);
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.modal-close-btn:hover,
.modal-close-btn:focus {
  background-color: #3182ce;
}

.modal-close-btn:focus-visible {
  box-shadow: 0 0 0 2px rgba(66, 153, 225, 0.5);
}

/* Responsive Adjustments */

/* Tablets (481px - 768px) */
@media (max-width: 768px) {
  .dashboard {
    padding: 1rem;
  }

  .dashboard-header {
    margin-bottom: 1.25rem;
    padding-bottom: 1rem;
  }

  .controls {
    flex-direction: column;
    align-items: stretch;
    padding: 0.75rem;
  }

  .controls-section,
  .metrics-section,
  .recommendations-section,
  .insights-section,
  .predictions-section,
  .query-section {
    margin-bottom: 1rem;
  }

  .metrics-grid,
  .recommendations-grid,
  .insights-grid,
  .form-grid,
  .query-filters {
    grid-template-columns: 1fr;
  }

  .metric-card,
  .recommendation-card,
  .insight-card,
  .form-container,
  .query-section {
    padding: 1rem;
  }

  .chart-container {
    height: 240px;
  }

  .query-results {
    flex-direction: column;
    align-items: stretch;
  }

  .chart-container,
  .query-summary-card {
    flex: 1 1 100%;
    max-width: 100%;
    min-width: 0;
  }

  .metric-summary {
    grid-template-columns: 1fr;
  }

  .modal-header {
    padding: 0.75rem;
  }

  .modal-body {
    padding: 0.75rem;
  }

  .metric-chart {
    height: 200px;
  }
}

/* Phones (≤480px) */
@media (max-width: 480px) {
  .dashboard {
    padding: 0.75rem;
  }

  .dashboard-header h1 {
    font-size: clamp(1.4rem, 3.5vw, 1.6rem);
  }

  .subtitle {
    font-size: clamp(0.75rem, 2vw, 0.8rem);
  }

  .section-title {
    font-size: clamp(0.95rem, 2.5vw, 1rem);
  }

  .controls {
    gap: 0.5rem;
    padding: 0.5rem;
  }

  .refresh-button,
  .submit-button,
  .rec-action,
  .reset-button,
  .modal-close-btn,
  .action-button {
    padding: 0.4rem 0.75rem;
    font-size: clamp(0.75rem, 1.8vw, 0.8rem);
  }

  .time-selector {
    flex-direction: column;
    align-items: flex-start;
  }

  .time-range {
    width: 100%;
  }

  .model-info {
    flex-direction: column;
    align-items: flex-start;
  }

  .metrics-grid {
    gap: 0.75rem;
  }

  .metric-card {
    padding: 0.75rem;
  }

  .metric-value {
    font-size: clamp(1.1rem, 3vw, 1.3rem);
  }

  .metric-description {
    font-size: clamp(0.7rem, 1.6vw, 0.75rem);
  }

  .recommendation-card {
    padding: 0.75rem;
  }

  .rec-description {
    font-size: clamp(0.75rem, 1.6vw, 0.8rem);
  }

  .insight-card {
    padding: 0.75rem;
  }

  .form-container {
    padding: 0.75rem;
  }

  .form-grid {
    gap: 0.5rem;
  }

  .form-group label,
  .form-group input,
  .form-group select {
    font-size: clamp(0.75rem, 1.6vw, 0.8rem);
  }

  .query-filters {
    gap: 0.5rem;
  }

  .query-section {
    padding: 0.75rem;
  }

  .query-summary-card {
    padding: 0.75rem;
  }

  .query-total {
    font-size: clamp(1rem, 2.5vw, 1.1rem);
  }

  .query-filter-title {
    font-size: clamp(0.9rem, 2vw, 0.95rem);
  }

  .metric-item {
    padding: 0.5rem;
  }

  .metric-label,
  .metric-value,
  .highest-spender-list li {
    font-size: clamp(0.7rem, 1.6vw, 0.75rem);
  }

  .query-filter-breakdown {
    font-size: clamp(0.75rem, 1.6vw, 0.8rem);
    padding: 0.3rem 0.5rem;
  }

  .chart-container {
    height: 200px;
  }

  .modal-overlay {
    padding: 0.5rem;
  }

  .metric-modal {
    max-width: 90vw;
    max-height: 80vh;
  }

  .modal-header h2 {
    font-size: clamp(0.95rem, 2.5vw, 1rem);
  }

  .modal-header,
  .modal-body,
  .modal-footer {
    padding: 0.5rem;
  }

  .metric-summary {
    gap: 0.75rem;
  }

  .summary-value {
    font-size: clamp(0.9rem, 2.2vw, 1rem);
  }

  .metric-details h3 {
    font-size: clamp(0.9rem, 2vw, 0.95rem);
  }

  /* Mobile Table as Cards */
  .predictions-table {
    display: block;
    border: none;
  }

  .predictions-table thead {
    display: none;
  }

  .predictions-table tbody {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .predictions-table tr {
    display: block;
    background: white;
    border-radius: 6px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    padding: 0.75rem;
  }

  .predictions-table td {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.4rem 0;
    border: none;
    font-size: clamp(0.75rem, 1.6vw, 0.8rem);
  }

  .predictions-table td::before {
    content: attr(data-label);
    font-weight: 600;
    color: #4a5568;
    flex: 1;
    text-align: left;
  }

  .predictions-table td:not(.customer-name)::before {
    margin-right: 0.5rem;
  }

  .predictions-table td.customer-name {
    flex-direction: column;
    align-items: flex-start;
  }

  .predictions-table td.customer-name::before {
    display: none;
  }

  .predictions-table td.risk-meter {
    display: flex;
    flex-direction: row;
    align-items: center;
  }

  .predictions-table td.action-button {
    justify-content: flex-end;
  }

  .predictions-table td[data-label="Actions"]::before {
    display: none;
  }

  .pagination {
    padding: 0.5rem;
    gap: 0.5rem;
  }
}

/* Accessibility Enhancements */
@media (prefers-reduced-motion: reduce) {
  .metric-card,
  .refresh-button,
  .submit-button,
  .rec-action,
  .modal-close-btn,
  .action-button,
  .metric-item {
    transition: none;
  }

  .spinner {
    animation: none;
    border: 3px solid #4299e1;
  }
}
</style>