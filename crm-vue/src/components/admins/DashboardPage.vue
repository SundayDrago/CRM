<template>
  <div class="dashboard-container">
    <!-- Header (unchanged) -->
    <div class="header">
      <div class="header-content">
        <h1>Customer Segmentation Analytics</h1>
        <p class="subtitle">Advanced clustering visualization for data-driven marketing decisions</p>
      </div>
      <div class="upload-section">
        <div class="file-upload-wrapper">
          <label class="file-upload-label">
            <input type="file" ref="fileInput" @change="handleFileUpload" accept=".csv,.xlsx" />
            <span class="file-upload-button">
              <i class="fas fa-file-import"></i> Import Dataset
            </span>
            <span class="file-upload-name">{{ file ? file.name : 'No file selected' }}</span>
          </label>
          <button 
            @click="uploadFile" 
            :disabled="!file || isUploading"
            class="upload-button"
          >
            <span v-if="!isUploading">
              <i class="fas fa-chart-pie"></i> Analyze
            </span>
            <span v-else>
              <i class="fas fa-spinner fa-spin"></i> Processing...
            </span>
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State (unchanged) -->
    <div v-if="loading" class="loading-indicator">
      <div class="spinner-container">
        <div class="spinner"></div>
        <p>Processing customer segments...</p>
        <p class="loading-subtext">This may take a few moments depending on your dataset size</p>
      </div>
    </div>

    <!-- Main Dashboard Content -->
    <div v-if="data" class="dashboard-content">
      <!-- Summary Cards -->
      <div class="summary-cards">
        <div class="card card-primary">
          <div class="card-icon">
            <i class="fas fa-users"></i>
          </div>
          <div class="card-content">
            <h3>Total Customers</h3>
            <p class="value">{{ data.rows.toLocaleString() }}</p>
            <p class="card-trend"><i class="fas fa-arrow-up"></i> 12% from last month</p>
          </div>
        </div>
        <div class="card card-secondary">
          <div class="card-icon">
            <i class="fas fa-boxes"></i>
          </div>
          <div class="card-content">
            <h3>Segments</h3>
            <p class="value">{{ data.clusters.length }}</p>
            <p class="card-trend"><i class="fas fa-arrow-down"></i> 3 refined segments</p>
          </div>
        </div>
        <div class="card card-tertiary">
          <div class="card-icon">
            <i class="fas fa-tags"></i>
          </div>
          <div class="card-content">
            <h3>Categories</h3>
            <p class="value">{{ data.categories.length }}</p>
            <p class="card-trend">Covering all product lines</p>
          </div>
        </div>
      </div>

      <!-- Segment Distribution Section -->
      <div class="section">
        <div class="section-header">
          <h2><i class="fas fa-chart-bar"></i> Segment Distribution</h2>
          <div class="section-actions">
            <select v-model="selectedChartType" class="chart-type-selector">
              <option value="bar">Bar Chart</option>
              <option value="pie">Pie Chart</option>
              <option value="donut">Donut Chart</option>
              <option value="polar">Polar Area</option>
              <option value="radar">Radar</option>
            </select>
            <button class="action-button" @click="exportChart('clusterDistribution')">
              <i class="fas fa-file-export"></i> Export
            </button>
          </div>
        </div>
        <div class="chart-container chart-cluster-distribution" ref="clusterDistributionChart">
          <component
            :is="currentChartComponent"
            :labels="chartLabels"
            :values="chartValues"
            :colors="chartColors"
            title="Segment Distribution by Category"
          />
        </div>
      </div>

      <!-- Top Segments Section -->
      <div class="section">
        <div class="section-header">
          <h2><i class="fas fa-medal"></i> Key Customer Segments</h2>
          <div class="section-actions">
            <button class="action-button" @click="toggleTableView">
              <i class="fas" :class="tableView ? 'fa-th-large' : 'fa-list'"></i> 
              {{ tableView ? 'Grid View' : 'Table View' }}
            </button>
            <button class="action-button" @click="showSegmentInsights">
              <i class="fas fa-lightbulb"></i> Insights
            </button>
          </div>
        </div>
        <div v-if="!tableView" class="top-clusters-grid">
          <div v-for="(categoryData, category) in data.Top_clusters" :key="category" class="category-card">
            <div class="category-header">
              <h3>{{ category }}</h3>
              <span class="cluster-count">{{ Object.keys(categoryData).length }} segments</span>
            </div>
            <FourBarChart
              :labels="Object.keys(categoryData).map(cluster => `Cluster ${cluster}`)"
              :values="Object.values(categoryData)"
              :colors="chartColors"
              :title="`${category} Top Segments`"
            />
          </div>
        </div>
        <div v-else class="top-clusters-table">
          <table>
            <thead>
              <tr>
                <th>Category</th>
                <th>Segment</th>
                <th>Percentage</th>
                <th>Customers</th>
                <th>Visual</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(categoryData, category) in data.Top_clusters" :key="category">
                <td :rowspan="Object.keys(categoryData).length" class="category-cell">{{ category }}</td>
                <template v-for="(percentage, cluster) in categoryData" :key="cluster">
                  <td :class="{ 'first-row': cluster === Object.keys(categoryData)[0] }">
                    Segment {{ cluster }}
                  </td>
                  <td :class="{ 'first-row': cluster === Object.keys(categoryData)[0] }">
                    {{ percentage.toFixed(1) }}%
                  </td>
                  <td :class="{ 'first-row': cluster === Object.keys(categoryData)[0] }">
                    {{ Math.round((percentage / 100) * data.rows) }}
                  </td>
                  <td :class="{ 'first-row': cluster === Object.keys(categoryData)[0] }">
                    <div class="percentage-visual">
                      <div 
                        class="percentage-fill"
                        :style="{ width: percentage + '%' }"
                      ></div>
                    </div>
                  </td>
                </template>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Segment Patterns Section -->
      <div class="section">
        <div class="section-header">
          <h2><i class="fas fa-project-diagram"></i> Segment Characteristics</h2>
          <div class="section-actions">
            <select v-model="selectedPatternView" class="view-selector">
              <option value="radar">Radar View</option>
              <option value="bar">Bar Chart</option>
              <option value="polar">Polar Area</option>
            </select>
            <button class="action-button" @click="togglePatternExpand">
              <i class="fas" :class="patternExpanded ? 'fa-compress' : 'fa-expand'"></i>
              {{ patternExpanded ? 'Collapse' : 'Expand' }}
            </button>
          </div>
        </div>
        <div class="cluster-patterns" :class="{ 'expanded-view': patternExpanded }">
          <div v-for="(patterns, cluster) in data.patterns_of_each_cluster" :key="cluster" class="cluster-card">
            <div class="cluster-header">
              <h3>Segment {{ cluster.replace('cluster_', '') }}</h3>
              <div class="cluster-meta">
                <span class="meta-item">
                  <i class="fas fa-users"></i> {{ calculateSegmentSize(cluster) }} customers
                </span>
                <span class="meta-item">
                  <i class="fas fa-percentage"></i> {{ calculateSegmentPercentage(cluster).toFixed(1) }}%
                </span>
              </div>
            </div>
            <div class="radar-chart-container chart-segment-patterns" :ref="'segmentChart-' + cluster">
              <component
                :is="patternChartComponent"
                :labels="Object.keys(patterns)"
                :values="Object.values(patterns)"
                :colors="chartColors"
                :title="`Segment ${cluster.replace('cluster_', '')} Patterns`"
              />
            </div>
            <div class="cluster-insights">
              <h4>Key Insights</h4>
              <ul>
                <li v-for="(value, attr) in getTopAttributes(patterns, 3)" :key="attr">
                  <strong>{{ attr }}:</strong> {{ value }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- Segment Attributes Section -->
      <div class="section">
        <div class="section-header">
          <h2><i class="fas fa-chart-pie"></i> Segment Attributes</h2>
          <div class="section-actions">
            <div class="search-box">
              <i class="fas fa-search"></i>
              <input 
                v-model="attributeSearch" 
                placeholder="Search attributes..."
              />
            </div>
            <button class="action-button" @click="showAttributeGuide">
              <i class="fas fa-question-circle"></i> Guide
            </button>
          </div>
        </div>
        <div class="tabs">
          <button 
            v-for="category in data.categories" 
            :key="category" 
            @click="activeCategory = category"
            :class="{ active: activeCategory === category }"
          >
            <i class="fas" :class="getCategoryIcon(category)"></i> {{ category }}
          </button>
        </div>
        <div v-if="activeCategory" class="attributes-container">
          <div 
            v-for="(attributes, cluster) in data.Attributes_of_top_clusters[activeCategory]" 
            :key="cluster" 
            class="attribute-card"
          >
            <div class="attribute-header">
              <h3>Segment {{ cluster }}</h3>
              <div class="attribute-meta">
                <span class="meta-item">
                  <i class="fas fa-percentage"></i> {{ calculateClusterPercentage(activeCategory, cluster).toFixed(1) }}%
                </span>
                <span class="meta-item">
                  <i class="fas fa-users"></i> {{ calculateClusterSize(activeCategory, cluster) }} customers
                </span>
              </div>
            </div>
            <div class="attribute-grid">
              <div 
                v-for="(value, attr) in attributes" 
                :key="attr"
                v-show="attr.toLowerCase().includes(attributeSearch.toLowerCase())"
                class="attribute-item"
              >
                <span class="attribute-name">{{ attr }}</span>
                <span class="attribute-value">{{ formatAttributeValue(value) }}</span>
                <HorizontalBarChart
                  :labels="Object.keys(value)"
                  :values="Object.values(value)"
                  :colors="['#4285F4', '#FF7139', '#34C759', '#FF2D55', '#5856D6']"
                  :title="`${attr} Distribution`"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer (unchanged) -->
    <div class="footer">
      <p>Customer Segmentation Dashboard v2.0 • Powered by AI Analytics</p>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import ThreeBarChart from '@/components/Constants/ThreeBarChart.vue';
import HorizontalBarChart from '@/components/Constants/HorizontalBarChart.vue';
import FourBarChart from '@/components/Constants/FourBarChart.vue';
import PieChart from '@/components/Constants/PieChart.vue';
import DonutChart from '@/components/Constants/DonutChart.vue';
import PolarAreaChart from '@/components/Constants/PolarAreaChart.vue';
import RadarChart from '@/components/Constants/RadarChart.vue';
import { ref } from 'vue';

export default {
  name: 'DashboardPage',
  components: {
    ThreeBarChart,
    HorizontalBarChart,
    FourBarChart,
    PieChart,
    DonutChart,
    PolarAreaChart,
    RadarChart
  },
  data() {
    return {
      file: null,
      isUploading: false,
      loading: false,
      data: null,
      activeCategory: null,
      tableView: false,
      selectedPatternView: 'radar',
      selectedChartType: 'bar',
      attributeSearch: '',
      patternExpanded: false,
      clusterDistributionChart: ref(null),
      segmentCharts: {},
      chartLabels: [],
      chartValues: [],
      chartColors: ['#1abc9c', '#f39c12', '#8e44ad', '#3498db', '#e74c3c', '#2ecc71']
    };
  },
  computed: {
    currentChartComponent() {
      switch (this.selectedChartType) {
        case 'bar': return 'ThreeBarChart';
        case 'pie': return 'PieChart';
        case 'donut': return 'DonutChart';
        case 'polar': return 'PolarAreaChart';
        case 'radar': return 'RadarChart';
        default: return 'ThreeBarChart';
      }
    },
    patternChartComponent() {
      switch (this.selectedPatternView) {
        case 'bar': return 'ThreeBarChart';
        case 'polar': return 'PolarAreaChart';
        case 'radar': return 'RadarChart';
        default: return 'RadarChart';
      }
    }
  },
  mounted() {
    window.addEventListener('resize', this.resizeCharts);
    if (this.data) {
      this.updateChartData();
    }
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.resizeCharts);
  },
  methods: {
    handleFileUpload(event) {
      this.file = event.target.files[0];
    },
    async uploadFile() {
      if (!this.file) {
        const errorMsg = 'Please select a file to upload.';
        console.error(errorMsg);
        if (this.$toast) {
          this.$toast.error(errorMsg, { position: 'top-right', duration: 5000 });
        } else {
          alert(errorMsg);
        }
        return;
      }

      this.isUploading = true;
      this.loading = true;

      const formData = new FormData();
      formData.append('file', this.file);

      try {
        const response = await axios.post('http://localhost:8000/cluster', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 15000
        });

        this.data = response.data;
        if (this.data.categories && this.data.categories.length > 0) {
          this.activeCategory = this.data.categories[0];
        }
        this.updateChartData();
        if (this.$toast) {
          this.$toast.success('File uploaded and processed successfully!', {
            position: 'top-right',
            duration: 5000
          });
        }
      } catch (err) {
        console.error('Error uploading file:', err);
        let errorMessage = 'Error processing file. Please check the format and try again.';
        if (err.code === 'ERR_NETWORK') {
          errorMessage = 'Network Error: Failed to connect to server. Ensure the backend is running.';
        } else if (err.response) {
          errorMessage = err.response.data?.detail || err.message || errorMessage;
        } else if (err.message) {
          errorMessage = err.message;
        }
        if (this.$toast) {
          this.$toast.error(errorMessage, { position: 'top-right', duration: 5000 });
        } else {
          alert(errorMessage);
        }
      } finally {
        this.isUploading = false;
        this.loading = false;
      }
    },
    updateChartData() {
      if (!this.data) return;

      // Segment Distribution Chart
      const clusterData = this.transformClusterDistributionData();
      this.chartLabels = clusterData.labels;
      this.chartValues = clusterData.values;
    },
    exportChart(refName) {
      const canvas = this.$refs[refName]?.querySelector('canvas');
      if (canvas) {
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = `${refName}.png`;
        link.click();
        if (this.$toast) {
          this.$toast.success(`Exported ${refName} as PNG`, { position: 'top-right', duration: 3000 });
        }
      }
    },
    transformClusterDistributionData() {
      if (!this.data || !this.data.category_distribution_by_cluster) return { labels: [], values: [] };

      const labels = [];
      const values = [];
      const categories = this.data.categories;
      const clusters = this.data.clusters;

      if (this.selectedChartType === 'bar') {
        // For bar chart, stack by category
        labels.push(...categories);
        const datasets = clusters.map(cluster => {
          return categories.map(category => {
            return this.data.category_distribution_by_cluster[category][`cluster_${cluster}`] || 0;
          });
        });
        values.push(...datasets[0]); // Use first dataset for simplicity; adjust if multiple datasets needed
      } else {
        // For pie/donut/polar/radar, aggregate by category-cluster combination
        categories.forEach(category => {
          clusters.forEach(cluster => {
            const value = this.data.category_distribution_by_cluster[category][`cluster_${cluster}`] || 0;
            if (value > 0) {
              labels.push(`${category} - Cluster ${cluster}`);
              values.push(value);
            }
          });
        });
      }

      return { labels, values };
    },
    transformPatternData(patterns) {
      return {
        labels: Object.keys(patterns),
        values: Object.values(patterns)
      };
    },
    getCategoryIcon(category) {
      const icons = {
        'Electronics': 'fa-laptop',
        'Fashion': 'fa-tshirt',
        'Health & Beauty': 'fa-spa',
        'Groceries': 'fa-shopping-basket',
        'Home & Living': 'fa-home',
        'Shoes': 'fa-shoe-prints'
      };
      return icons[category] || 'fa-tag';
    },
    toggleTableView() {
      this.tableView = !this.tableView;
    },
    togglePatternExpand() {
      this.patternExpanded = !this.patternExpanded;
    },
    calculateSegmentSize(cluster) {
      if (!this.data || !this.data.patterns_of_each_cluster[cluster]) return 0;
      return Object.values(this.data.patterns_of_each_cluster[cluster]).reduce((sum, val) => sum + val, 0);
    },
    calculateSegmentPercentage(cluster) {
      const size = this.calculateSegmentSize(cluster);
      return this.data && this.data.rows ? (size / this.data.rows) * 100 : 0;
    },
    calculateClusterPercentage(category, cluster) {
      if (!this.data || !this.data.category_distribution_by_cluster[category][`cluster_${cluster}`]) return 0;
      return this.data.category_distribution_by_cluster[category][`cluster_${cluster}`];
    },
    calculateClusterSize(category, cluster) {
      const percentage = this.calculateClusterPercentage(category, cluster);
      return Math.round((percentage / 100) * this.data.rows);
    },
    getTopAttributes(patterns, count) {
      const entries = Object.entries(patterns);
      entries.sort((a, b) => b[1] - a[1]);
      return Object.fromEntries(entries.slice(0, count));
    },
    formatAttributeValue(value) {
      if (typeof value === 'number') {
        if (value < 1) return value.toFixed(3);
        if (value < 10) return value.toFixed(2);
        if (value < 100) return value.toFixed(1);
        return Math.round(value).toLocaleString();
      } else if (typeof value === 'object') {
        return JSON.stringify(value); // Simplified for display; adjust as needed
      }
      return value;
    },
    showSegmentInsights() {
      if (this.$toast) {
        this.$toast.info('Segment insights feature coming soon!', { position: 'top-right', duration: 3000 });
      }
    },
    showAttributeGuide() {
      if (this.$toast) {
        this.$toast.info('Attribute guide will help you understand the metrics', { position: 'top-right', duration: 3000 });
      }
    },
    resizeCharts() {
      // No eCharts-specific resizing needed; Chart.js handles resizing automatically
    }
  },
  watch: {
    data() {
      this.updateChartData();
    },
    selectedChartType() {
      this.updateChartData();
    },
    selectedPatternView() {
      // Pattern charts update automatically via component binding
    }
  }
};
</script>



<style lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css');

:root {
  --primary-color: #3a86ff;
  --primary-light: #e6f0ff;
  --secondary-color: #8338ec;
  --tertiary-color: #ff006e;
  --success-color: #06d6a0;
  --danger-color: #ef476f;
  --warning-color: #ffd166;
  --light-color: #f8f9fa;
  --dark-color: #212529;
  --gray-color: #6c757d;
  --light-gray: #e9ecef;
  --white: #ffffff;
  --shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 8px 20px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 15px 30px rgba(0, 0, 0, 0.15);
  --border-radius: 10px;
  --border-radius-sm: 6px;
  --transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  background-color: #f8fafc;
  font-family: 'Inter', sans-serif;
  color: var(--dark-color);
  line-height: 1.6;
}

.dashboard-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

/* Header Styles */
.header {
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: var(--white);
  padding: 1.5rem 2.5rem;
  box-shadow: var(--shadow);
  margin-bottom: 2rem;
  border-radius: 0 0 var(--border-radius) var(--border-radius);
  position: relative;
  overflow: hidden;
}

.header::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 300px;
  height: 100%;
  background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="rgba(255,255,255,0.1)"><circle cx="25" cy="25" r="15"/><circle cx="75" cy="75" r="15"/><circle cx="75" cy="25" r="10"/><circle cx="25" cy="75" r="10"/></svg>');
  opacity: 0.3;
}

.header-content {
  margin-bottom: 1.5rem;
  position: relative;
  z-index: 1;
  max-width: 800px;
}

.header h1 {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.subtitle {
  font-size: 1rem;
  opacity: 0.9;
  font-weight: 400;
}

/* Upload Section */
.upload-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  z-index: 1;
}

.file-upload-wrapper {
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 100%;
  max-width: 800px;
}

.file-upload-label {
  display: flex;
  align-items: center;
  flex-grow: 1;
  position: relative;
}

.file-upload-label input[type="file"] {
  position: absolute;
  left: -9999px;
}

.file-upload-button {
  padding: 0.75rem 1.5rem;
  background-color: rgba(255, 255, 255, 0.15);
  color: var(--white);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  font-weight: 500;
  transition: var(--transition);
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  backdrop-filter: blur(5px);
}

.file-upload-button:hover {
  background-color: rgba(255, 255, 255, 0.25);
  border-color: rgba(255, 255, 255, 0.5);
}

.file-upload-name {
  margin-left: 1rem;
  font-size: 0.95rem;
  opacity: 0.9;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 250px;
}

.upload-button {
  padding: 0.75rem 2rem;
  background-color: var(--white);
  color: var(--primary-color);
  border: none;
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  font-weight: 600;
  transition: var(--transition);
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.upload-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.15);
}

.upload-button:disabled {
  background-color: var(--light-gray);
  color: var(--gray-color);
  cursor: not-allowed;
  opacity: 0.8;
}

/* Loading Indicator */
.loading-indicator {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 50vh;
  flex-direction: column;
}

.spinner-container {
  text-align: center;
  max-width: 400px;
  padding: 2rem;
  background: var(--white);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow);
}

.spinner {
  border: 4px solid var(--primary-light);
  border-radius: 50%;
  border-top: 4px solid var(--primary-color);
  width: 60px;
  height: 60px;
  animation: spin 1s linear infinite;
  margin: 0 auto 1.5rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-subtext {
  font-size: 0.9rem;
  color: var(--gray-color);
  margin-top: 0.5rem;
}

/* Dashboard Content */
.dashboard-content {
  padding: 0 2.5rem 2rem;
  flex-grow: 1;
}

/* Summary Cards */
.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2.5rem;
}

.card {
  background: var(--white);
  border-radius: var(--border-radius);
  padding: 1.75rem;
  box-shadow: var(--shadow);
  display: flex;
  align-items: flex-start;
  transition: var(--transition);
  position: relative;
  overflow: hidden;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-md);
}

.card::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
}

.card-primary::after { background: var(--primary-color); }
.card-secondary::after { background: var(--secondary-color); }
.card-tertiary::after { background: var(--tertiary-color); }

.card-icon {
  font-size: 1.5rem;
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1.5rem;
  flex-shrink: 0;
}

.card-primary .card-icon { background-color: rgba(58, 134, 255, 0.1); color: var(--primary-color); }
.card-secondary .card-icon { background-color: rgba(131, 56, 236, 0.1); color: var(--secondary-color); }
.card-tertiary .card-icon { background-color: rgba(255, 0, 110, 0.1); color: var(--tertiary-color); }

.card-content { flex-grow: 1; }

.card h3 {
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--gray-color);
  margin-bottom: 0.5rem;
}

.card .value {
  font-size: 2rem;
  font-weight: 700;
  margin: 0.25rem 0;
  color: var(--dark-color);
  line-height: 1;
}

.card-trend {
  font-size: 0.85rem;
  color: var(--gray-color);
  margin-top: 0.5rem;
}

.card-trend i { margin-right: 0.25rem; }
.card-primary .card-trend i { color: var(--success-color); }
.card-secondary .card-trend i { color: var(--warning-color); }

/* Sections */
.section {
  background: var(--white);
  border-radius: var(--border-radius);
  padding: 1.75rem;
  box-shadow: var(--shadow);
  margin-bottom: 2rem;
  transition: var(--transition);
}

.section:hover { box-shadow: var(--shadow-md); }

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.75rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.section-header h2 {
  font-size: 1.4rem;
  font-weight: 600;
  color: var(--dark-color);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0;
}

.section-header h2 i { color: var(--primary-color); }

.section-actions {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.action-button {
  padding: 0.6rem 1.2rem;
  background-color: var(--light-color);
  color: var(--dark-color);
  border: none;
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: var(--transition);
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.action-button:hover {
  background-color: var(--primary-light);
  color: var(--primary-color);
}

.chart-type-selector,
.view-selector {
  padding: 0.6rem 1rem;
  border: 1px solid var(--light-gray);
  border-radius: var(--border-radius-sm);
  background-color: var(--white);
  font-size: 0.9rem;
  cursor: pointer;
  min-width: 120px;
  transition: var(--transition);
}

.chart-type-selector:hover,
.view-selector:hover {
  border-color: var(--primary-color);
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
}

.search-box i {
  position: absolute;
  left: 12px;
  color: var(--gray-color);
  font-size: 0.9rem;
}

.search-box input {
  padding: 0.6rem 1rem 0.6rem 2.25rem;
  border: 1px solid var(--light-gray);
  border-radius: var(--border-radius-sm);
  font-size: 0.9rem;
  width: 220px;
  transition: var(--transition);
}

.search-box input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(58, 134, 255, 0.2);
}

/* Chart Containers */
.chart-container,
.radar-chart-container {
  margin-top: 1rem;
  background-color: var(--white);
  border-radius: var(--border-radius-sm);
  padding: 1rem;
  border: 1px solid var(--light-gray);
  width: 100%;
}

.chart-cluster-distribution {
  min-height: 400px;
}

.chart-segment-patterns {
  min-height: 280px;
}

/* Top Clusters */
.top-clusters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

.category-card {
  background: var(--white);
  border-radius: var(--border-radius-sm);
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid var(--light-gray);
  transition: var(--transition);
}

.category-card:hover {
  border-color: var(--primary-color);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.category-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
}

.category-header h3 {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
  color: var(--dark-color);
}

.cluster-count {
  font-size: 0.85rem;
  background-color: var(--primary-light);
  color: var(--primary-color);
  padding: 0.3rem 0.75rem;
  border-radius: 20px;
  font-weight: 500;
}

.cluster-percentages {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.percentage-bar {
  height: 36px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1rem;
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--white);
  position: relative;
  overflow: hidden;
  transition: width 0.5s ease;
}

.percentage-label {
  z-index: 1;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.percentage-value {
  z-index: 1;
  font-size: 0.8rem;
  opacity: 0.9;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.bar-color-0 { background-color: var(--primary-color); }
.bar-color-1 { background-color: var(--secondary-color); }
.bar-color-2 { background-color: var(--success-color); }
.bar-color-3 { background-color: var(--warning-color); }
.bar-color-4 { background-color: var(--danger-color); }

/* Table View */
.top-clusters-table {
  overflow-x: auto;
  border-radius: var(--border-radius-sm);
  border: 1px solid var(--light-gray);
}

.top-clusters-table table {
  width: 100%;
  border-collapse: collapse;
  min-width: 800px;
}

.top-clusters-table th, 
.top-clusters-table td {
  padding: 0.85rem 1.25rem;
  text-align: left;
  border-bottom: 1px solid var(--light-gray);
}

.top-clusters-table th {
  background-color: var(--light-color);
  font-weight: 600;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--gray-color);
}

.top-clusters-table tr:hover {
  background-color: rgba(58, 134, 255, 0.03);
}

.category-cell {
  font-weight: 600;
  color: var(--primary-color);
  vertical-align: top;
  padding-top: 1.25rem;
}

.first-row {
  border-top: 1px solid var(--light-gray);
}

.percentage-visual {
  width: 120px;
  height: 8px;
  background-color: var(--light-gray);
  border-radius: 4px;
  overflow: hidden;
}

.percentage-fill {
  height: 100%;
  background-color: var(--primary-color);
  border-radius: 4px;
  transition: width 0.5s ease;
}

/* Cluster Patterns */
.cluster-patterns {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
  transition: var(--transition);
}

.cluster-patterns.expanded-view {
  grid-template-columns: 1fr;
}

.cluster-card {
  background: var(--white);
  border-radius: var(--border-radius-sm);
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid var(--light-gray);
  transition: var(--transition);
}

.cluster-card:hover {
  border-color: var(--primary-color);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.cluster-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.cluster-header h3 {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
  color: var(--dark-color);
}

.cluster-meta {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.meta-item {
  font-size: 0.85rem;
  color: var(--gray-color);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: var(--light-gray);
  padding: 0.3rem 0.75rem;
  border-radius: 20px;
}

.meta-item i { color: var(--primary-color); }

.cluster-insights {
  margin-top: 1rem;
}

.cluster-insights h4 {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: var(--dark-color);
}

.cluster-insights ul {
  list-style: none;
  padding: 0;
}

.cluster-insights li {
  font-size: 0.9rem;
  color: var(--dark-color);
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.cluster-insights li strong { color: var(--primary-color); }

/* Attributes Section */
.tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid var(--light-gray);
}

.tabs button {
  padding: 0.75rem 1.5rem;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--gray-color);
  cursor: pointer;
  transition: var(--transition);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.tabs button:hover { color: var(--primary-color); }
.tabs button.active { color: var(--primary-color); border-bottom: 2px solid var(--primary-color); }

.attributes-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.attribute-card {
  background: var(--white);
  border-radius: var(--border-radius-sm);
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid var(--light-gray);
  transition: var(--transition);
}

.attribute-card:hover {
  border-color: var(--primary-color);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.attribute-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.attribute-header h3 {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
  color: var(--dark-color);
}

.attribute-meta {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.attribute-grid {
  display: grid;
  gap: 0.75rem;
}

.attribute-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--light-gray);
}

.attribute-name {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--dark-color);
}

.attribute-value {
  font-size: 0.9rem;
  color: var(--gray-color);
}

/* Footer */
.footer {
  text-align: center;
  padding: 1rem;
  background-color: var(--light-color);
  color: var(--gray-color);
  font-size: 0.85rem;
  border-top: 1px solid var(--light-gray);
  margin-top: auto;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .dashboard-content { padding: 0 1.5rem 1.5rem; }
  .summary-cards { grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); }
  .top-clusters-grid, .cluster-patterns, .attributes-container { grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); }
  .header { padding: 1rem 1.5rem; }
  .file-upload-wrapper { flex-direction: column; align-items: flex-start; gap: 0.75rem; }
  .file-upload-name { max-width: 100%; }
  .chart-cluster-distribution { min-height: 350px; }
  .chart-segment-patterns { min-height: 250px; }
}

@media (max-width: 768px) {
  .header h1 { font-size: 1.6rem; }
  .subtitle { font-size: 0.9rem; }
  .section-header { flex-direction: column; align-items: flex-start; }
  .section-actions { width: 100%; flex-wrap: wrap; }
  .search-box input { width: 100%; }
  .tabs { flex-direction: column; align-items: flex-start; }
  .tabs button { width: 100%; justify-content: flex-start; }
  .chart-cluster-distribution, .chart-segment-patterns { min-height: 300px; }
  .card .value { font-size: 1.6rem; }
}

@media (max-width: 480px) {
  .dashboard-content { padding: 0 1rem 1rem; }
  .header { padding: 0.75rem 1rem; }
  .section { padding: 1rem; }
  .summary-cards, .top-clusters-grid, .cluster-patterns, .attributes-container { grid-template-columns: 1fr; }
.file-upload-button,
.upload-button {
  display: inline-block;
  width: 100%;
  justify-content: center;
  text-align: center;
}

  .top-clusters-table table { min-width: 600px auto; }
  .chart-cluster-distribution { min-height: 250px; }
  .chart-segment-patterns { min-height: 200px; }
}
</style>