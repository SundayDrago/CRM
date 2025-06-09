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
                v-for="(value, attr) in filteredAttributes(attributes)" 
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
      chartColors: ['#1abc9c', '#f39c12', '#8e44ad', '#3498db', '#e74c3c', '#2ecc71'],
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
        labels.push(...categories);
        const datasets = clusters.map(cluster => {
          return categories.map(category => {
            return this.data.category_distribution_by_cluster[category][`cluster_${cluster}`] || 0;
          });
        });
        values.push(...datasets[0]);
      } else {
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
        // Instead of JSON.stringify, show the dominant category or total count
        const entries = Object.entries(value);
        if (entries.length === 0) return 'No data';
        // Find the category with the highest value
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
        this.$toast.info('Attribute guide will help you understand the metrics', { position: 'top-right', duration: 3000 });
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

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Roboto', sans-serif;
  background-color: var(--light-color);
  color: var(--dark-color);
}

.dashboard-container {
  max-width: 100%;
  margin: 0 auto;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 1rem;
}

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

.section {
  background: white;
  padding: 1.25rem;
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
  margin-bottom: 1rem;
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
  gap: 0.5rem;
  flex-wrap: wrap;
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
  gap: 0.25rem;
  transition: var(--transition);
}

.action-button:hover {
  background-color: #e5e7eb;
}

.chart-type-selector,
.view-selector {
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--light-gray);
  border-radius: 6px;
  font-size: 0.875rem;
}

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

.chart-container,
.radar-chart-container {
  position: relative;
  width: 100%;
  min-height: 300px;
}

.chart-segment-patterns {
  min-height: 250px;
}

.top-clusters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
}

.category-card {
  padding: 1rem;
  border: 1px solid var(--light-gray);
  border-radius: var(--border-radius);
}

.category-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.category-header h3 {
  font-size: 1rem;
  font-weight: 500;
}

.cluster-count {
  font-size: 0.75rem;
  background-color: rgba(59, 130, 246, 0.1);
  color: var(--primary-color);
  padding: 0.25rem 0.5rem;
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

.cluster-insights {
  margin-top: 0.75rem;
}

.cluster-insights h4 {
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.cluster-insights li {
  font-size: 0.75rem;
  margin-bottom: 0.25rem;
}

.cluster-insights li strong {
  color: var(--primary-color);
}

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

.footer {
  text-align: center;
  padding: 1rem;
  color: var(--gray-color);
  font-size: 0.875rem;
  margin-top: auto;
}

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
    min-height: 280px;
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
    min-height: 260px;
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
    min-height: 240px;
  }

  .attribute-chart {
    height: 100px;
  }
}
</style>