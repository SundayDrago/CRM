<template>
  <div class="dashboard-container">
    <!-- Header -->
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

    <!-- Loading State -->
    <div v-if="loading" class="loading-indicator">
      <div class="spinner-container">
        <div class="spinner"></div>
        <p>Processing customer segments...</p>
        <p class="loading-subtext">This may take a few moments depending on dataset size</p>
      </div>
    </div>

    <!-- Main Dashboard Content -->
    <div v-if="data" class="dashboard-content">
      <!-- Summary Cards -->
      <div class="summary-cards">
        <div class="card card-primary">
          <div class="card-icon"><i class="fas fa-users"></i></div>
          <div class="card-content">
            <h3>Total Customers</h3>
            <p class="value">{{ data.rows.toLocaleString() }}</p>
            <p class="card-trend"><i class="fas fa-arrow-up"></i> 12% from last month</p>
          </div>
        </div>
        <div class="card card-secondary">
          <div class="card-icon"><i class="fas fa-boxes"></i></div>
          <div class="card-content">
            <h3>Segments</h3>
            <p class="value">{{ data.clusters.length }}</p>
            <p class="card-trend"><i class="fas fa-arrow-down"></i> 3 refined segments</p>
          </div>
        </div>
        <div class="card card-tertiary">
          <div class="card-icon"><i class="fas fa-tags"></i></div>
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
          <h2><i class="fas fa-chart-bar"></i> Segment Distribution by Category</h2>
          <div class="section-actions">
            <button class="action-button" @click="exportChart('clusterDistribution')">
              <i class="fas fa-file-export"></i> Export
            </button>
            <div class="carousel-controls">
              <button 
                class="action-button" 
                @click="prevClusterCharts" 
                :disabled="currentClusterIndex === 0"
              >
                <i class="fas fa-chevron-left"></i> Previous
              </button>
              <button 
                class="action-button" 
                @click="nextClusterCharts" 
                :disabled="currentClusterIndex >= data.clusters.length - 2"
              >
                <i class="fas fa-chevron-right"></i> Next
              </button>
            </div>
          </div>
        </div>
        <div class="chart-container chart-cluster-distribution">
          <div class="cluster-charts-grid">
            <div 
              v-for="cluster in displayedClusters" 
              :key="cluster" 
              class="cluster-chart"
            >
              <DonutChart
                :labels="chartLabels[cluster]"
                :values="chartValues[cluster]"
                :colors="chartColors"
                :title="`Cluster ${cluster} Distribution`"
                :showPercentages="true"
              />
            </div>
          </div>
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
                <td v-for="(percentage, cluster) in categoryData" :key="cluster">Segment {{ cluster }}</td>
                <td v-for="(percentage, cluster) in categoryData" :key="cluster">{{ percentage.toFixed(1) }}%</td>
                <td v-for="(percentage, cluster) in categoryData" :key="cluster">{{ Math.round((percentage / 100) * data.rows) }}</td>
                <td v-for="(percentage, cluster) in categoryData" :key="cluster">
                  <div class="percentage-visual">
                    <div class="percentage-fill" :style="{ width: percentage + '%' }"></div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Segment Patterns Section -->
      <div class="section">
        <div class="section-header">
          <h2><i class="fas fa-project-diagram"></i> Segment Patterns</h2>
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
              <h3>Category {{ cluster.replace('cluster_', '') }}</h3>
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
            <div class="carousel-controls">
              <button 
                class="action-button" 
                @click="prevAttributeCharts" 
                :disabled="currentAttributeIndex === 0"
              >
                <i class="fas fa-chevron-left"></i> Previous
              </button>
              <button 
                class="action-button" 
                @click="nextAttributeCharts" 
                :disabled="currentAttributeIndex >= Object.keys(data.Attributes_of_top_clusters[activeCategory]).length - 2"
              >
                <i class="fas fa-chevron-right"></i> Next
              </button>
            </div>
          </div>
        </div>
        <div class="tabs">
          <button 
            v-for="category in data.categories" 
            :key="category" 
            @click="activeCategory = category; currentAttributeIndex = 0"
            :class="{ active: activeCategory === category }"
          >
            <i class="fas" :class="getCategoryIcon(category)"></i> {{ category }}
          </button>
        </div>
        <div v-if="activeCategory" class="attributes-container">
          <div 
            v-for="cluster in displayedAttributes" 
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
                v-for="(value, attr) in filteredAttributes(data.Attributes_of_top_clusters[activeCategory][cluster])" 
                :key="attr"
                class="attribute-item"
              >
                <div class="attribute-info">
                  <span class="attribute-name">{{ attr }}</span>
                  <span class="attribute-value">{{ formatAttributeValue(value) }}</span>
                </div>
                <div class="attribute-chart">
                  <HorizontalBarChart
                    :labels="Object.keys(value)"
                    :values="Object.values(value)"
                    :colors="chartColors"
                    :title="`${attr} Distribution`"
                    :options="chartOptions"
                    :showPercentages="true"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p>Customer Segmentation Dashboard v2.0 • Powered by AI Analytics</p>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import HorizontalBarChart from '@/components/Constants/HorizontalBarChart.vue';
import FourBarChart from '@/components/Constants/FourBarChart.vue';
import DonutChart from '@/components/Constants/DonutChart.vue';
import PolarAreaChart from '@/components/Constants/PolarAreaChart.vue';
import RadarChart from '@/components/Constants/RadarChart.vue';

export default {
  name: 'DashboardPage',
  components: {
    HorizontalBarChart,
    FourBarChart,
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
      attributeSearch: '',
      patternExpanded: false,
      currentClusterIndex: 0,
      currentAttributeIndex: 0,
      chartsPerPage: 2,
      chartLabels: {},
      chartValues: {},
      chartColors: ['#1abc9c', '#f39c12', '#8e44ad', '#3498db', '#e74c3c', '#2ecc71', '#f1c40f', '#e67e22'],
      chartOptions: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleFont: { size: 12 },
            bodyFont: { size: 11 }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { font: { size: 10 } }
          },
          y: {
            grid: { color: 'rgba(0, 0, 0, 0.05)' },
            ticks: { font: { size: 10 } }
          }
        }
      }
    };
  },
  computed: {
    patternChartComponent() {
      switch (this.selectedPatternView) {
        case 'bar': return 'HorizontalBarChart'; // Changed from 'ThreeBarChart' to 'HorizontalBarChart'
        case 'polar': return 'PolarAreaChart';
        case 'radar': return 'RadarChart';
        default: return 'RadarChart';
      }
    },
    displayedClusters() {
      return this.data?.clusters.slice(
        this.currentClusterIndex,
        this.currentClusterIndex + this.chartsPerPage
      ) || [];
    },
    displayedAttributes() {
      if (!this.activeCategory || !this.data?.Attributes_of_top_clusters[this.activeCategory]) {
        return [];
      }
      return Object.keys(this.data.Attributes_of_top_clusters[this.activeCategory]).slice(
        this.currentAttributeIndex,
        this.currentAttributeIndex + this.chartsPerPage
      );
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
    filteredAttributes(attributes) {
      if (!this.attributeSearch) return attributes;
      const searchTerm = this.attributeSearch.toLowerCase();
      return Object.fromEntries(
        Object.entries(attributes).filter(([attr]) => attr.toLowerCase().includes(searchTerm))
      );
    },
    updateChartData() {
      if (!this.data) return;

      const clusterData = this.transformClusterDistributionData();
      this.chartLabels = clusterData.labels;
      this.chartValues = clusterData.values;
    },
    exportChart(refName) {
      const canvases = this.$refs[refName]?.querySelectorAll('canvas');
      if (canvases && canvases.length > 0) {
        canvases.forEach((canvas, index) => {
          const link = document.createElement('a');
          link.href = canvas.toDataURL('image/png');
          link.download = `${refName}-cluster-${index + 1}.png`;
          link.click();
        });
        if (this.$toast) {
          this.$toast.success(`Exported ${refName} charts as PNG`, { position: 'top-right', duration: 3000 });
        }
      }
    },
    transformClusterDistributionData() {
      if (!this.data || !this.data.category_distribution_by_cluster) return { labels: {}, values: {} };

      const labels = {};
      const values = {};
      const maxCategories = 8;
      const categories = this.data.categories.slice(0, maxCategories);
      const clusters = this.data.clusters;

      clusters.forEach(cluster => {
        labels[cluster] = categories;
        values[cluster] = categories.map(category => {
          return this.data.category_distribution_by_cluster[category][`cluster_${cluster}`] || 0;
        });
      });

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
    prevClusterCharts() {
      if (this.currentClusterIndex > 0) {
        this.currentClusterIndex -= this.chartsPerPage;
      }
    },
    nextClusterCharts() {
      if (this.currentClusterIndex < this.data.clusters.length - this.chartsPerPage) {
        this.currentClusterIndex += this.chartsPerPage;
      }
    },
    prevAttributeCharts() {
      if (this.currentAttributeIndex > 0) {
        this.currentAttributeIndex -= this.chartsPerPage;
      }
    },
    nextAttributeCharts() {
      if (this.currentAttributeIndex < Object.keys(this.data.Attributes_of_top_clusters[this.activeCategory]).length - this.chartsPerPage) {
        this.currentAttributeIndex += this.chartsPerPage;
      }
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
        const entries = Object.entries(value);
        if (entries.length === 0) return 'No data';
        const [topCategory, topValue] = entries.reduce((max, entry) => 
          entry[1] > max[1] ? entry : max, entries[0]);
        const total = Object.values(value).reduce((sum, val) => sum + val, 0);
        return `${topCategory}: ${topValue} (${((topValue / total) * 100).toFixed(1)}%)`;
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
    this.$toast.info(
      `Attribute_sampling guide will help you understand the metrics`,
      { position: 'top-right', duration: 3000 }
    );
  }
},
    resizeCharts() {
      // Chart.js handles resizing automatically
    }
  },
  watch: {
    data() {
      this.updateChartData();
    },
    activeCategory() {
      this.currentAttributeIndex = 0;
    }
  }
};
</script>

<style lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap');
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css');

:root {
  --primary-color: #3b82f6;
  --secondary-color: #8b5cf6;
  --tertiary-color: #ec4899;
  --success-color: #10b981;
  --danger-color: #ef4444;
  --warning-color: #facc15;
  --light-color: #f8fafc;
  --dark-color: #1e293b;
  --gray-color: #64748b;
  --light-gray: #e2e8f0;
  --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --border-radius: 8px;
  --transition: all 0.3s ease;
}

/* Base Styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Roboto', sans-serif;
  background-color: var(--light-color);
  color: var(--dark-color);
  line-height: 1.6;
}

/* Dashboard Layout */
.dashboard-container {
  max-width: 100%;
  margin: 0 auto;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 1rem;
}

/* Header Styles */
.header {
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: white;
  padding: 1.5rem;
  border-radius: var(--border-radius);
  margin-bottom: 1.5rem;
  box-shadow: var(--shadow);
  position: relative;
}

.header-content h1 {
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.subtitle {
  font-size: 0.95rem;
  opacity: 0.9;
}

/* Upload Section */
.upload-section {
  margin-top: 1rem;
}

.file-upload-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.file-upload-label {
  flex: 1;
  display: flex;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  overflow: hidden;
}

.file-upload-label input[type="file"] {
  display: none;
}

.file-upload-button {
  padding: 0.75rem 1.25rem;
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: var(--transition);
}

.file-upload-button:hover {
  background-color: rgba(255, 255, 255, 0.3);
}

.file-upload-name {
  padding: 0.75rem;
  color: white;
  opacity: 0.8;
  font-size: 0.875rem;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
}

.upload-button {
  padding: 0.75rem 1.5rem;
  background-color: white;
  color: var(--primary-color);
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: var(--transition);
}

.upload-button:hover:not(:disabled) {
  background-color: #f1f5f9;
}

.upload-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Loading State */
.loading-indicator {
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;
}

.spinner-container {
  text-align: center;
  padding: 2rem;
  background: white;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow);
}

.spinner {
  border: 4px solid var(--light-gray);
  border-top-color: var(--primary-color);
  border-radius: 50%;
  width: 48px;
  height: 48px;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-subtext {
  color: var(--gray-color);
  font-size: 0.875rem;
}

/* Dashboard Content */
.dashboard-content {
  flex: 1;
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.card {
  background: white;
  padding: 1.25rem;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow);
  display: flex;
  align-items: center;
  transition: var(--transition);
}

.card:hover {
  transform: translateY(-2px);
}

.card-icon {
  font-size: 24px;
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
}

.card-primary .card-icon { background-color: rgba(59, 130, 246, 0.1); color: var(--primary-color); }
.card-secondary .card-icon { background-color: rgba(139, 92, 246, 0.1); color: var(--secondary-color); }
.card-tertiary .card-icon { background-color: rgba(236, 72, 153, 0.1); color: var(--tertiary-color); }

.card-content h3 {
  font-size: 0.875rem;
  color: var(--gray-color);
  margin-bottom: 0.25rem;
}

.card-content .value {
  font-size: 1.5rem;
  font-weight: 600;
}

.card-trend {
  font-size: 0.75rem;
  color: var(--gray-color);
}

/* Section Styles */
.section {
  background: white;
  padding: 1.5rem;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow);
  margin-bottom: 1.5rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.section-header h2 {
  font-size: 1.25rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.section-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.carousel-controls {
  display: flex;
  gap: 0.5rem;
}

.action-button {
  padding: 0.5rem 1rem;
  background-color: var(--light-gray);
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: var(--transition);
}

.action-button:hover:not(:disabled) {
  background-color: #e5e7eb;
}

.action-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Chart Type Selector */
.chart-type-selector,
.view-selector {
  padding: 0.5rem 1rem;
  border: 1px solid var(--light-gray);
  border-radius: 6px;
  font-size: 0.875rem;
  background-color: white;
  color: var(--dark-color);
  cursor: pointer;
  transition: var(--transition);
}

.chart-type-selector:hover {
  border-color: var(--primary-color);
}

.chart-type-selector:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

/* Search Box */
.search-box {
  position: relative;
  flex: 1;
  max-width: 200px;
}

.search-box input {
  width: 100%;
  padding: 0.5rem 0.75rem 0.5rem 2rem;
  border: 1px solid var(--light-gray);
  border-radius: 6px;
  font-size: 0.875rem;
}

.search-box i {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--gray-color);
}

/* Chart Container Styles */
.chart-container {
  position: relative;
  width: 100%;
  min-height: 350px;
  background-color: white;
  border-radius: var(--border-radius);
  padding: 1.5rem;
  border: 1px solid var(--light-gray);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  transition: var(--transition);
  animation: fadeIn 0.6s ease-out;
}

.chart-container:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.cluster-charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}

.cluster-chart {
  max-width: 400px;
  margin: 0 auto;
}

.chart-container canvas {
  width: 100% !important;
  height: auto !important;
  max-height: 400px;
  transition: transform 0.3s ease;
  animation: slideUp 0.8s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { 
    opacity: 0;
    transform: translateY(20px);
  }
  to { 
    opacity: 1;
    transform: translateY(0);
  }
}

/* Chart Specific Styles */
.donut-chart-container {
  position: relative;
  max-width: 400px;
  margin: 0 auto;
  min-height: 300px;
}

.donut-chart-container .chart-center-label {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.donut-chart-container .center-value {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--dark-color);
  margin-bottom: 0.25rem;
}

.donut-chart-container .center-title {
  font-size: 0.875rem;
  color: var(--gray-color);
}

.radar-chart-container {
  background-color: rgba(255, 255, 255, 0.7);
  padding: 1.5rem;
  border-radius: var(--border-radius);
}

.radar-chart-container canvas {
  background: white;
  border-radius: var(--border-radius);
  padding: 1rem;
}

.chart-cluster-distribution .chart-title {
  text-align: center;
  margin-bottom: 1rem;
  font-size: 1rem;
  color: var(--gray-color);
  font-weight: 500;
}

.chart-segment-patterns {
  min-height: 250px;
}

/* Cluster Insights */
.cluster-insights {
  margin-top: 1rem;
  padding: 0.75rem;
  background-color: #f8fafc;
  border-radius: 6px;
  border: 1px solid var(--light-gray);
}

.cluster-insights h4 {
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--dark-color);
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.cluster-insights h4::before {
  content: '\f0eb';
  font-family: 'Font Awesome 5 Free';
  font-weight: 900;
  color: var(--primary-color);
  font-size: 0.9rem;
}

.cluster-insights ul {
  list-style: none;
}

.cluster-insights li {
  font-size: 0.85rem;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--dark-color);
}

.cluster-insights li::before {
  content: '\f058';
  font-family: 'Font Awesome 5 Free';
  font-weight: 900;
  color: var(--success-color);
  font-size: 0.8rem;
}

.cluster-insights li strong {
  color: var(--primary-color);
  font-weight: 500;
}

/* Top Segments Section */
.top-clusters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.category-card {
  padding: 1.25rem;
  border: 1px solid var(--light-gray);
  border-radius: var(--border-radius);
  background-color: white;
  transition: var(--transition);
}

.category-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.08);
}

.category-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.category-header h3 {
  font-size: 1rem;
  font-weight: 500;
}

.cluster-count {
  font-size: 0.75rem;
  background-color: rgba(59, 130, 246, 0.1);
  color: var(--primary-color);
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
}

.top-clusters-table {
  overflow-x: auto;
}

.top-clusters-table table {
  width: 100%;
  border-collapse: collapse;
}

.top-clusters-table th,
.top-clusters-table td {
  padding: 0.75rem;
  border-bottom: 1px solid var(--light-gray);
}

.top-clusters-table th {
  background-color: var(--light-gray);
  font-size: 0.75rem;
  text-transform: uppercase;
}

.top-clusters-table tr:hover {
  background-color: rgba(59, 130, 246, 0.03);
}

.category-cell {
  font-weight: 500;
  color: var(--primary-color);
}

.first-row {
  border-top: 1px solid var(--light-gray);
}

.percentage-visual {
  width: 100px;
  height: 6px;
  background-color: var(--light-gray);
  border-radius: 3px;
  overflow: hidden;
}

.percentage-fill {
  height: 100%;
  background-color: var(--primary-color);
  transition: width 0.3s ease;
}

.cluster-patterns {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
}

.cluster-patterns.expanded-view {
  grid-template-columns: 1fr;
}

.cluster-card {
  padding: 1rem;
  border: 1px solid var(--light-gray);
  border-radius: var(--border-radius);
}

.cluster-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.cluster-header h3 {
  font-size: 1rem;
  font-weight: 500;
}

.cluster-meta {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.meta-item {
  font-size: 0.75rem;
  background-color: var(--light-gray);
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

/* Tabs */
.tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
  border-bottom: 1px solid var(--light-gray);
}

.tabs button {
  padding: 0.5rem 1rem;
  border: none;
  background: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  font-size: 0.875rem;
  color: var(--gray-color);
  display: flex;
  align-items: center;
  gap: 0.25rem;
  transition: var(--transition);
}

.tabs button:hover {
  color: var(--primary-color);
}

.tabs button.active {
  color: var(--primary-color);
  border-bottom-color: var(--primary-color);
}

/* Attributes Section */
.attributes-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1rem;
}

.attribute-card {
  padding: 1.25rem;
  border: 1px solid var(--light-gray);
  border-radius: var(--border-radius);
  background-color: white;
}

.attribute-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.attribute-header h3 {
  font-size: 1rem;
  font-weight: 500;
}

.attribute-meta {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.attribute-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.attribute-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.75rem;
  background-color: #f8fafc;
  border-radius: 6px;
}

.attribute-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.attribute-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--dark-color);
}

.attribute-value {
  font-size: 0.875rem;
  color: var(--gray-color);
}

.attribute-chart {
  height: 120px;
  padding: 0.5rem;
  background-color: white;
  border-radius: 6px;
  border: 1px solid var(--light-gray);
}

/* Footer */
.footer {
  text-align: center;
  padding: 1.5rem;
  color: var(--gray-color);
  font-size: 0.875rem;
  margin-top: auto;
}

/* Responsive Styles */
@media (max-width: 1024px) {
  .dashboard-container {
    padding: 0.75rem;
  }

  .attributes-container {
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .section-actions {
    width: 100%;
  }

  .chart-container,
  .radar-chart-container {
    min-height: 320px;
  }
}

@media (max-width: 768px) {
  .header h1 {
    font-size: 1.5rem;
  }

  .subtitle {
    font-size: 0.875rem;
  }

  .summary-cards {
    grid-template-columns: 1fr;
  }

  .file-upload-wrapper {
    flex-direction: column;
  }

  .file-upload-button,
  .upload-button {
    width: 100%;
    justify-content: center;
  }

  .tabs {
    flex-direction: column;
  }

  .tabs button {
    width: 100%;
    justify-content: flex-start;
  }

  .chart-container,
  .radar-chart-container {
    min-height: 300px;
    padding: 1rem;
  }

  .cluster-charts-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .dashboard-container {
    padding: 0.5rem;
  }

  .header {
    padding: 1rem;
  }

  .section {
    padding: 1rem;
  }

  .attributes-container,
  .top-clusters-grid,
  .cluster-patterns {
    grid-template-columns: 1fr;
  }

  .file-upload-name {
    font-size: 0.75rem;
  }

  .chart-container,
  .radar-chart-container {
    min-height: 280px;
  }

  .attribute-chart {
    height: 100px;
  }
}
</style>