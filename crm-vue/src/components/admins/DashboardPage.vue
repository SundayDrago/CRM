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

    <!-- Model Visualization Section -->
    <section class="visualization-section">
      <h2 class="section-title">Model Insights</h2>
      <div class="chart-grid">
        <div class="chart-card importance-card">
          <h3>Feature Importance</h3>
          <div class="feature-list">
            <div v-for="(feature, index) in featureImportance" :key="index" class="feature-item">
              <span class="feature-name">{{ feature.name }}</span>
              <div class="feature-bar-container">
                <div class="feature-bar" :style="{ width: feature.importance + '%' }"></div>
              </div>
              <span class="feature-value">{{ feature.importance }}%</span>
            </div>
          </div>
        </div>

        <div class="chart-card">
          <h3>Customer Segmentation</h3>
          <p class="chart-subtitle">Predicted cluster distribution</p>
          <div class="chart-container">
            <canvas id="segmentChart"></canvas>
          </div>
        </div>

        <div class="chart-card">
          <h3>Spending Forecast</h3>
          <p class="chart-subtitle">Next {{ timeRange }} prediction</p>
          <div class="chart-container">
            <canvas id="spendingChart"></canvas>
          </div>
        </div>

        <div class="chart-card">
          <h3>Churn Risk Analysis</h3>
          <p class="chart-subtitle">Customer count by risk level</p>
          <div class="chart-container">
            <canvas id="churnChart"></canvas>
          </div>
        </div>
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
          <button class="rec-action">Implement</button>
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
                  <option value="<450,000">&lt;450,000</option>
                  <option value="450,000-1,000,000">450,000-1,000,000</option>
                  <option value="1,000,000-2,000,000">1,000,000-2,000,000</option>
                  <option value=">2,000,000">&gt;2,000,000</option>
                </select>
            </div>
            <div class="form-group">
              <label>Average Spending:</label>
                <select v-model="newCustomer['Average spending']" required>
                  <option value="<50,000">&lt;50,000</option>
                  <option value="50,000-100,000">50,000-100,000</option>
                  <option value="100,000-200,000">100,000-200,000</option>
                  <option value=">200,000">&gt;200,000</option>
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

<!-- Updated Query Section -->
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
      <label for="spendingFilter">Spending:</label>
       <select v-model="queryFilters.spending" @change="fetchQueryData" id="spendingFilter">
         <option value="">All Spending</option>
         <option value="<50,000">&lt;50,000</option>
         <option value="50,000-100,000">50,000-100,000</option>
         <option value="100,000-200,000">100,000-200,000</option>
         <option value=">200,000">&gt;200,000</option>
       </select>
    </div>
    <button @click="resetFilters" class="reset-button">Reset Filters</button>
  </div>

  <div v-if="queryLoading" class="query-loading">
    <div class="spinner"></div>
    <p>Loading customer data...</p>
  </div>

  <div v-else class="chart-container">
    <canvas id="queryChart"></canvas>
    <div v-if="queryData" class="query-summary">
      <p>Showing: <strong>{{ queryData.total }}</strong> customers matching your filters</p>
      <div v-if="activeFilterCount === 1" class="breakdown">
        <h4>Breakdown by {{ activeFilterName }}:</h4>
        <ul>
          <li v-for="(count, value) in queryData.counts[activeFilterName]" :key="value">
            {{ value }}: {{ count }} ({{ Math.round((count / queryData.total) * 100) }}%)
          </li>
        </ul>
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
      featureImportance: [],
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
      queryFilters: {
        age: "",
        gender: "",
        region: "",
        spending: "",
      },
      queryData: null,
      queryLoading: false, // Added queryLoading
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
    await Promise.all([this.fetchModelData(), this.fetchQueryData()]);
  },
  methods: {
    async fetchModelData() {
      this.isLoading = true;
      try {
        const response = await axios.get("http://127.0.0.1:5000/dashboard");
        console.log("API Response:", response.data);
        this.keyMetrics = response.data.keyMetrics || [];
        this.featureImportance = response.data.featureImportance || [];
        this.recommendations = response.data.recommendations || [];
        this.customerPredictions = response.data.customerPredictions || [];
        this.updateCharts(response.data.chartData || {});
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        this.showError("Failed to load dashboard data: " + error.message);
      } finally {
        this.isLoading = false;
      }
    },
    createCharts() {
      const chartConfigs = [
        {
          id: "segmentChart",
          type: "doughnut",
          options: {
            plugins: {
              tooltip: {
                callbacks: {
                  label: (context) => {
                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                    const value = context.raw;
                    const percentage = Math.round((value / total) * 100);
                    return `${context.label}: ${value} (${percentage}%)`;
                  },
                },
              },
            },
          },
        },
        {
          id: "spendingChart",
          type: "line",
          options: {
            scales: {
              y: {
                beginAtZero: false,
                ticks: { callback: (value) => `UGX ${(value / 1000).toLocaleString()}K` },
              },
            },
            plugins: {
              tooltip: { callbacks: { label: (context) => `UGX ${context.raw.toLocaleString()}` } },
            },
          },
        },
        {
          id: "churnChart",
          type: "bar",
          options: {
            scales: { y: { beginAtZero: true } },
          },
        },
        {
          id: "queryChart",
          type: "bar",
          options: {
            responsive: true,
            scales: { y: { beginAtZero: true, title: { display: true, text: "Customer Count" } } },
            plugins: { legend: { display: false } },
          },
        },
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
              plugins: { legend: { position: "bottom" } },
              ...options,
            },
          });
          console.log(`Chart ${id} initialized`);
        }
      });
    },
    updateCharts(chartData) {
      if (!chartData || !this.charts["segmentChart"] || !this.charts["spendingChart"] || !this.charts["churnChart"]) {
        console.error("Chart data or chart instances missing");
        return;
      }

      this.charts["segmentChart"].data.labels = chartData.segments.labels || [];
      this.charts["segmentChart"].data.datasets = [
        { data: chartData.segments.data || [], backgroundColor: chartData.segments.colors || [], borderWidth: 1 },
      ];
      this.charts["segmentChart"].update();

      this.charts["spendingChart"].data.labels = chartData.spending.labels || [];
      this.charts["spendingChart"].data.datasets = [
        {
          label: "Predicted Spending",
          data: chartData.spending.data || [],
          borderColor: chartData.spending.color || "#4e79a7",
          backgroundColor: this.hexToRgba(chartData.spending.color || "#4e79a7", 0.1),
          borderWidth: 2,
          tension: 0.4,
          fill: true,
        },
      ];
      this.charts["spendingChart"].update();

      this.charts["churnChart"].data.labels = chartData.churn.labels || [];
      this.charts["churnChart"].data.datasets = [
        { label: "Customers", data: chartData.churn.data || [], backgroundColor: chartData.churn.colors || [], borderWidth: 1 },
      ];
      this.charts["churnChart"].update();
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
        this.queryData = response.data;
        this.updateQueryChart();
      } catch (error) {
        console.error("fetchQueryData Error:", error.message);
        this.showError("Failed to fetch query data: " + error.message);
      } finally {
        this.queryLoading = false;
      }
    },
    updateQueryChart() {
      if (!this.queryData || !this.charts["queryChart"]) return;

      let labels, data;
      const activeFilters = Object.keys(this.queryFilters).filter((key) => this.queryFilters[key]);
      if (activeFilters.length === 0) {
        labels = ["All Customers"];
        data = [this.queryData.total || 0];
      } else if (activeFilters.length === 1) {
        const key = activeFilters[0];
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
          data: data,
          backgroundColor: "#4e79a7",
          borderWidth: 1,
        },
      ];
      this.charts["queryChart"].update();
      console.log("Query chart updated:", this.charts["queryChart"].data);
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
        const response = await axios.post("http://127.0.0.1:5000/segment", customerData, {
          headers: { "Content-Type": "application/json" },
        });
        if (response.data.status === "success") {
          const newPrediction = {
            id: this.customerPredictions.length + 1000,
            name: this.newCustomer.name,
            segment: response.data.description,
            churnRisk: response.data.cluster === 3 ? 50 : response.data.cluster === 0 ? 20 : 10,
            predictedValue: this.estimatePredictedValue(this.newCustomer["Average spending"]),
            nextPurchase: response.data.nextPurchase || new Date(Date.now() + Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          };
          this.customerPredictions.unshift(newPrediction);
          this.updateSegmentChart();
          this.newCustomer.name = "";
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
        ">200,000": 5000,
      };
      return ranges[spendingRange] || 1000;
    },
    updateSegmentChart() {
      const segmentCounts = this.customerPredictions.reduce((acc, curr) => {
        acc[curr.segment] = (acc[curr.segment] || 0) + 1;
        return acc;
      }, {});
      const labels = Object.keys(segmentCounts);
      const data = Object.values(segmentCounts);
      const colors = labels.map((_, i) => ["#4e79a7", "#f28e2b", "#e15759", "#76b7b2"][i % 4]);

      this.charts["segmentChart"].data.labels = labels;
      this.charts["segmentChart"].data.datasets = [
        { data, backgroundColor: colors, borderWidth: 1 },
      ];
      this.charts["segmentChart"].update();
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
              tension: 0.3,
            },
            {
              label: "Model Prediction",
              data: [...Array(historicalData.length - 1).fill(null), historicalData[historicalData.length - 1]],
              borderColor: "#e15759",
              backgroundColor: this.hexToRgba("#e15759", 0.1),
              borderWidth: 2,
              borderDash: [5, 5],
              pointBackgroundColor: "#e15759",
              pointRadius: 5,
            },
          ],
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
                },
              },
            },
          },
          scales: {
            y: {
              beginAtZero: false,
              ticks: { callback: (value) => `UGX ${(value / 1000).toLocaleString()}K` },
            },
          },
        },
      });
    },
    viewCustomerDetails(customer) {
      alert(`Details for ${customer.name} (ID: ${customer.id})\nSegment: ${customer.segment}\nChurn Risk: ${customer.churnRisk}%\nPredicted Value: ${this.formatCurrency(customer.predictedValue)}\nNext Purchase: ${this.formatDate(customer.nextPurchase)}`);
    },
  },
};
</script>
<style scoped>
/* Base Styles */
.dashboard {
  padding: 20px;
  font-family: "Segoe UI", Roboto, "Helvetica Neue", sans-serif;
  color: #333;
  max-width: 1800px;
  margin: 0 auto;
  background-color: #f8fafc;
}

.dashboard-header {
  text-align: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e2e8f0;
}

.dashboard-header h1 {
  font-size: 2.2rem;
  font-weight: 600;
  color: #1a365d;
  margin-bottom: 8px;
}

.subtitle {
  font-size: 1rem;
  color: #718096;
  font-weight: 500;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e2e8f0;
}

/* Controls Section */
.controls-section {
  margin-bottom: 30px;
}

.controls {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  align-items: center;
  justify-content: space-between;
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.refresh-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background-color: #4299e1;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.refresh-button:hover {
  background-color: #3182ce;
}

.icon {
  font-size: 1.1rem;
}

.time-selector {
  display: flex;
  align-items: center;
  gap: 10px;
}

.time-selector label {
  font-weight: 500;
  color: #4a5568;
}

.time-range {
  padding: 10px 15px;
  border: 1px solid #cbd5e0;
  border-radius: 6px;
  background-color: white;
  font-size: 0.95rem;
  cursor: pointer;
}

.model-info {
  display: flex;
  gap: 15px;
  font-size: 0.9rem;
}

.model-version {
  background-color: #edf2f7;
  padding: 5px 10px;
  border-radius: 4px;
  color: #4a5568;
}

.accuracy {
  background-color: #ebf8ff;
  padding: 5px 10px;
  border-radius: 4px;
  color: #3182ce;
}

/* Metrics Grid */
.metrics-section {
  margin-bottom: 30px;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.metric-card {
  background: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
}

.metric-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.metric-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
}

.metric-header h3 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2d3748;
  margin: 0;
}

.confidence {
  font-size: 0.75rem;
  padding: 3px 8px;
  border-radius: 10px;
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
  font-size: 2rem;
  font-weight: 700;
  color: #1a365d;
  margin-bottom: 10px;
}

.metric-trend {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 15px;
}

.trend-indicator {
  font-weight: 600;
  font-size: 0.9rem;
}

.trend-indicator.up {
  color: #38a169;
}

.trend-indicator.down {
  color: #e53e3e;
}

.trend-period {
  font-size: 0.8rem;
  color: #718096;
}

.metric-description {
  font-size: 0.85rem;
  color: #718096;
  line-height: 1.5;
}

.loading-predictions {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e2e8f0;
  border-top-color: #4299e1;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Chart Grid */
.visualization-section {
  margin-bottom: 30px;
}

.chart-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
}

.chart-card {
  background: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.chart-card h3 {
  font-size: 1.2rem;
  font-weight: 600;
  color: #2d3748;
  margin-top: 0;
  margin-bottom: 5px;
}

.chart-subtitle {
  font-size: 0.85rem;
  color: #718096;
  margin-bottom: 20px;
}

.chart-container canvas {
  width: 100% !important;
  height: 300px !important;
}

.importance-card {
  grid-column: 1 / -1;
}

.feature-list {
  display: grid;
  gap: 15px;
}

.feature-item {
  display: grid;
  grid-template-columns: 200px 1fr 60px;
  align-items: center;
  gap: 15px;
}

.feature-name {
  font-weight: 500;
  color: #4a5568;
}

.feature-bar-container {
  height: 20px;
  background-color: #edf2f7;
  border-radius: 4px;
  overflow: hidden;
}

.feature-bar {
  height: 100%;
  background-color: #4299e1;
  border-radius: 4px;
  transition: width 0.5s ease;
}

.feature-value {
  font-size: 0.85rem;
  color: #718096;
  text-align: right;
}

/* Recommendations */
.recommendations-section {
  margin-bottom: 30px;
}

.recommendations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.recommendation-card {
  background: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
}

.rec-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
}

.rec-priority {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  padding: 3px 8px;
  border-radius: 4px;
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
  font-size: 1.1rem;
  font-weight: 600;
  color: #2d3748;
  margin: 0;
}

.rec-description {
  font-size: 0.9rem;
  color: #4a5568;
  line-height: 1.5;
  margin-bottom: 20px;
  flex-grow: 1;
}

.rec-metrics {
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
  font-size: 0.85rem;
}

.rec-metric {
  background-color: #f7fafc;
  padding: 5px 10px;
  border-radius: 4px;
}

.rec-metric strong {
  color: #4a5568;
}

.rec-action {
  align-self: flex-start;
  padding: 8px 16px;
  background-color: #4299e1;
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.rec-action:hover {
  background-color: #3182ce;
}

/* Predictions Table and Form */
.predictions-section {
  margin-bottom: 30px;
}

.form-container {
  background: white;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.segment-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-size: 0.9rem;
  font-weight: 500;
  color: #4a5568;
  margin-bottom: 5px;
}

.form-group input,
.form-group select {
  padding: 8px;
  border: 1px solid #cbd5e0;
  border-radius: 4px;
  font-size: 0.9rem;
}

.submit-button {
  padding: 10px;
  background-color: #4299e1;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.submit-button:hover {
  background-color: #3182ce;
}

.table-container {
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.predictions-table {
  width: 100%;
  border-collapse: collapse;
}

.predictions-table th {
  text-align: left;
  padding: 15px;
  background-color: #f7fafc;
  font-weight: 600;
  color: #4a5568;
  cursor: pointer;
  user-select: none;
}

.predictions-table th:hover {
  background-color: #edf2f7;
}

.sort-icon {
  margin-left: 5px;
}

.predictions-table td {
  padding: 12px 15px;
  border-bottom: 1px solid #e2e8f0;
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
  font-size: 0.8rem;
  color: #718096;
}

.segment-tag {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
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
  gap: 8px;
}

.risk-bar {
  height: 8px;
  border-radius: 4px;
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
  font-size: 0.85rem;
  font-weight: 500;
  min-width: 40px;
  text-align: right;
}

.predicted-value {
  font-weight: 600;
  color: #1a365d;
}

.action-button {
  padding: 5px 10px;
  border: none;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  margin-right: 5px;
  background-color: #ebf8ff;
  color: #3182ce;
}

.action-button:hover {
  background-color: #d6e9ff;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 15px;
  background-color: #f7fafc;
  gap: 15px;
}

.pagination button {
  padding: 5px 10px;
  background-color: #edf2f7;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Query Section */
.query-section {
  margin-top: 40px;
  background: white;
  border-radius: 10px;
  padding: 25px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.query-filters {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 25px;
  align-items: end;
}

.reset-button {
  padding: 10px 15px;
  background-color: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  height: fit-content;
}

.reset-button:hover {
  background-color: #e9ecef;
}

.query-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.query-summary {
  margin-top: 20px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.query-summary p {
  font-size: 1.1rem;
  margin-bottom: 15px;
}

.breakdown {
  margin-top: 15px;
}

.breakdown h4 {
  margin-bottom: 10px;
  font-size: 1rem;
  color: #495057;
}

.breakdown ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.breakdown li {
  padding: 8px 0;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
}

.breakdown li:last-child {
  border-bottom: none;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.metric-modal {
  background: white;
  border-radius: 10px;
  width: 90%;
  max-width: 900px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e2e8f0;
}

.modal-header h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1a365d;
  margin: 0;
}

.close-modal {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #718096;
  padding: 5px;
}

.modal-body {
  padding: 20px;
}

.metric-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e2e8f0;
}

.summary-item {
  display: flex;
  flex-direction: column;
}

.summary-label {
  font-size: 0.85rem;
  color: #718096;
  margin-bottom: 5px;
}

.summary-value {
  font-size: 1.3rem;
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
  padding: 3px 8px;
  border-radius: 10px;
  font-size: 0.9rem;
  display: inline-block;
}

.summary-confidence.high { background-color: #ebf8f2; color: #38a169; }
.summary-confidence.medium { background-color: #feebc8; color: #dd6b20; }
.summary-confidence.low { background-color: #fed7d7; color: #e53e3e; }

.metric-chart {
  height: 300px;
  margin-bottom: 30px;
}

.metric-details h3 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2d3748;
  margin-top: 20px;
  margin-bottom: 10px;
}

.metric-details p {
  line-height: 1.6;
  color: #4a5568;
  margin-bottom: 20px;
}

.influencers-list {
  list-style: none;
  padding: 0;
}

.influencers-list li {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #e2e8f0;
}

.factor-name { color: #4a5568; }

.factor-impact {
  font-weight: 500;
}

.factor-impact.positive { color: #38a169; }
.factor-impact.negative { color: #e53e3e; }

.modal-footer {
  padding: 15px 20px;
  border-top: 1px solid #e2e8f0;
  text-align: right;
}

.modal-close-btn {
  padding: 8px 16px;
  background-color: #4299e1;
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
}

/* Responsive Adjustments */
@media (max-width: 1024px) {
  .chart-grid { grid-template-columns: 1fr; }
  .metrics-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 768px) {
  .controls { flex-direction: column; align-items: stretch; }
  .metrics-grid { grid-template-columns: 1fr; }
  .recommendations-grid { grid-template-columns: 1fr; }
  .predictions-table { display: block; overflow-x: auto; }
  .form-grid { grid-template-columns: 1fr; }
  .query-filters { grid-template-columns: 1fr; }
}

@media (max-width: 480px) {
  .dashboard { padding: 15px; }
  .dashboard-header h1 { font-size: 1.8rem; }
  .metric-modal { width: 95%; }
  .feature-item { grid-template-columns: 1fr; gap: 5px; }
  .feature-name { margin-bottom: 5px; }
}
</style>