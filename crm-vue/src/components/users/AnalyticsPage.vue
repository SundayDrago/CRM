<template>
  <div class="analytics-page">
    <div class="header">
      <div class="header-content">
        <h1>Regional Performance Dashboard</h1>
        <p class="subtitle">Key metrics and regional insights</p>
      </div>
      <div class="time-range">
        <select v-model="timeRange" @change="updateChart">
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last quarter</option>
          <option value="12m">Last 12 months</option>
        </select>
      </div>
    </div>

    <div class="metrics-grid">
      <div class="metric-card" v-for="(metric, index) in metrics" :key="index" :class="metric.trendClass">
        <div class="metric-info">
          <span class="metric-label">{{ metric.label }}</span>
          <span class="metric-value">{{ metric.value }}</span>
          <div class="metric-trend">
            <span :class="['trend-icon', metric.trendClass]">
              <i :class="metric.trendIcon"></i>
            </span>
            <span class="trend-value">{{ metric.trendValue }}</span>
            <span class="trend-label">vs previous period</span>
          </div>
        </div>
        <div class="metric-icon">
          <i :class="metric.icon"></i>
        </div>
      </div>
    </div>

    <div class="charts-container">
      <div class="main-chart">
        <div class="chart-header">
          <h2>Regional Performance Trends</h2>
          <div class="chart-legend">
            <span v-for="(region, index) in regions" :key="index" class="legend-item">
              <span class="legend-color" :style="{backgroundColor: regionColors[index]}"></span>
              {{ region }}
            </span>
          </div>
        </div>
        <div class="chart-wrapper">
          <canvas id="analyticsChart"></canvas>
        </div>
      </div>
      <div class="secondary-chart">
        <h2>Regional Distribution</h2>
        <div class="chart-wrapper">
          <canvas id="trafficChart"></canvas>
        </div>
      </div>
    </div>

    <div class="bottom-section">
      <div class="top-regions">
        <h2>Top Performing Regions</h2>
        <div class="region-list">
          <div v-for="(region, index) in topRegions" :key="index" class="region-item">
            <div class="region-rank">{{ index + 1 }}</div>
            <div class="region-info">
              <div class="region-name">{{ region.name }}</div>
              <div class="region-stats">
                <span class="stat-value">{{ region.value }}</span>
                <span class="stat-change" :class="region.change >= 0 ? 'positive' : 'negative'">
                  <i :class="region.change >= 0 ? 'fas fa-arrow-up' : 'fas fa-arrow-down'"></i>
                  {{ Math.abs(region.change) }}%
                </span>
              </div>
            </div>
            <div class="region-progress">
              <div class="progress-bar" :style="{width: region.percentage + '%', backgroundColor: regionColors[index]}"></div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="conversion-card">
        <h2>Conversion Funnel</h2>
        <div class="funnel-container">
          <div v-for="(step, index) in funnelSteps" :key="index" class="funnel-step">
            <div class="step-name">{{ step.name }}</div>
            <div class="step-value">{{ step.value }}</div>
            <div class="step-bar" :style="{width: step.percentage + '%', backgroundColor: funnelColors[index]}"></div>
            <div class="step-conversion" v-if="index > 0">
              {{ step.conversion }}% <i class="fas fa-arrow-down"></i>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { onMounted, ref } from 'vue';
import Chart from 'chart.js/auto';
import axios from 'axios';

export default {
  name: 'AnalyticsPage',
  setup() {
    // Reactive state
    const timeRange = ref('30d');
    const regions = ref([]);
    const regionColors = ref(['#4e73df', '#1cc88a', '#f6c23e', '#e74a3b']);
    const funnelColors = ref(['#4e73df', '#36b9cc', '#1cc88a', '#f6c23e']);
    const metrics = ref([]);
    const topRegions = ref([]);
    const funnelSteps = ref([]);
    const chartData = ref({
      labels: [],
      datasets: []
    });
    const trafficChartData = ref({
      labels: [],
      datasets: []
    });

    // Backend API base URL
    const API_BASE_URL = 'http://localhost:5000';

    // Fetch dashboard data
    const fetchDashboardData = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/dashboard`);
        const { keyMetrics } = response.data;

        // Map key metrics
        metrics.value = keyMetrics.map((metric) => ({
          label: metric.title,
          value: metric.value,
          trendValue: `${metric.trend >= 0 ? '+' : ''}${metric.trend}%`,
          trendIcon: metric.trend >= 0 ? 'fas fa-arrow-up' : 'fas fa-arrow-down',
          trendClass: metric.trend >= 0 ? 'positive' : 'negative',
          icon: ['fas fa-dollar-sign', 'fas fa-users', 'fas fa-star'][metrics.value.length % 3]
        }));

        // Fetch region and funnel data
        await fetchRegionData();
        await fetchFunnelData();
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    // Fetch region-specific data using /query endpoint
    const fetchRegionData = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/query`, {
          params: { region: 'All' }
        });
        const { counts, total, average_spending } = response.data;

        // Update regions
        regions.value = ['Western', 'Eastern', 'Northern', 'Central']; // Fallback
        if (counts.region) {
          regions.value = Object.keys(counts.region);
        }

        // Map top regions, using average_spending
        topRegions.value = regions.value.map((region) => {
          const count = counts.region?.[region] || 0;
          const regionPercentage = total ? (count / total * 100) : 0;
          const change = (average_spending / 100000 * (Math.random() * 2 - 1)).toFixed(1); // Simulate trend
          return {
            name: region,
            value: count.toLocaleString(),
            change,
            percentage: regionPercentage
          };
        }).sort((a, b) => b.percentage - a.percentage);

        // Update traffic chart (Regional Distribution)
        trafficChartData.value = {
          labels: regions.value,
          datasets: [{
            data: regions.value.map(region => counts.region?.[region] || 0),
            backgroundColor: regionColors.value,
            hoverBackgroundColor: regionColors.value.map(color => adjustColor(color, -20)),
            hoverBorderColor: 'rgba(234, 236, 244, 1)',
            borderWidth: 0
          }]
        };

        // Update main chart (Regional Performance Trends)
        chartData.value = {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'], // Adjust based on time range
          datasets: regions.value.map((region, index) => ({
            label: region,
            data: Array(7).fill(0).map(() => (counts.region?.[region] || 0) * (0.8 + Math.random() * 0.4)),
            borderColor: regionColors.value[index],
            backgroundColor: `rgba(${hexToRgb(regionColors.value[index])}, 0.05)`,
            borderWidth: 2,
            fill: true,
            tension: 0.3
          }))
        };
      } catch (error) {
        console.error('Error fetching region data:', error);
      }
    };

    // Fetch funnel data from dataset
    const fetchFunnelData = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/query`);
        const { total, counts } = response.data;

        // Define funnel steps based on Average spending
        const totalVisits = total || 0;
        const leads = (counts['Average spending']?.['50,000-100,000'] || 0) +
                      (counts['Average spending']?.['100,000-200,000'] || 0) +
                      (counts['Average spending']?.['>200,000'] || 0);
        const opportunities = (counts['Average spending']?.['100,000-200,000'] || 0) +
                              (counts['Average spending']?.['>200,000'] || 0);
        const conversions = counts['Average spending']?.['>200,000'] || 0;

        funnelSteps.value = [
          { name: 'Visits', value: totalVisits.toLocaleString(), percentage: 100, conversion: 100 },
          { name: 'Leads', value: leads.toLocaleString(), percentage: totalVisits ? (leads / totalVisits * 100) : 0, conversion: totalVisits ? (leads / totalVisits * 100) : 0 },
          { name: 'Opportunities', value: opportunities.toLocaleString(), percentage: totalVisits ? (opportunities / totalVisits * 100) : 0, conversion: leads ? (opportunities / leads * 100) : 0 },
          { name: 'Customers', value: conversions.toLocaleString(), percentage: totalVisits ? (conversions / totalVisits * 100) : 0, conversion: opportunities ? (conversions / opportunities * 100) : 0 }
        ];
      } catch (error) {
        console.error('Error fetching funnel data:', error);
      }
    };

    // Helper function to adjust color brightness
    const adjustColor = (hex, amount) => {
      let usePound = false;
      if (hex[0] === '#') {
        hex = hex.slice(1);
        usePound = true;
      }
      const num = parseInt(hex, 16);
      let r = (num >> 16) + amount;
      let g = ((num >> 8) & 0x00FF) + amount;
      let b = (num & 0x0000FF) + amount;
      r = Math.max(Math.min(255, r), 0);
      g = Math.max(Math.min(255, g), 0);
      b = Math.max(Math.min(255, b), 0);
      return (usePound ? '#' : '') + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
    };

    // Helper function to convert hex to RGB
    const hexToRgb = (hex) => {
      const num = parseInt(hex.replace('#', ''), 16);
      return `${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}`;
    };

    // Update chart when time range changes
    const updateChart = async () => {
      console.log('Time range changed to:', timeRange.value);
      await fetchRegionData();
      await fetchFunnelData();
    };

    // Initialize charts
    const initializeCharts = () => {
      // Main chart - Regional Performance
      const ctx = document.getElementById('analyticsChart');
      if (ctx) {
        new Chart(ctx, {
          type: 'line',
          data: chartData.value,
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: { mode: 'index', intersect: false }
            },
            interaction: { intersect: false, mode: 'index' },
            scales: {
              y: {
                beginAtZero: true,
                grid: { color: 'rgba(0, 0, 0, 0.05)' },
                ticks: {
                  callback: function(value) {
                    return value >= 1000 ? (value / 1000) + 'k' : value;
                  }
                }
              },
              x: { grid: { display: false } }
            }
          }
        });
      }

      // Regional Distribution chart
      const trafficCtx = document.getElementById('trafficChart');
      if (trafficCtx) {
        new Chart(trafficCtx, {
          type: 'doughnut',
          data: trafficChartData.value,
          options: {
            maintainAspectRatio: false,
            plugins: { legend: { position: 'right' } },
            cutout: '75%'
          }
        });
      }
    };

    // Fetch data and initialize charts on mount
    onMounted(async () => {
      await fetchDashboardData();
      initializeCharts();
    });

    return {
      metrics,
      topRegions,
      funnelSteps,
      regions,
      regionColors,
      funnelColors,
      timeRange,
      updateChart
    };
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css');

:root {
  --primary: #4e73df;
  --primary-light: rgba(78, 115, 223, 0.1);
  --secondary: #1cc88a;
  --info: #36b9cc;
  --warning: #f6c23e;
  --danger: #e74a3b;
  --dark: #2e384d;
  --light: #f8f9fc;
  --gray: #d1d3e2;
  --border: #e0e3eb;
  --text-muted: #6c757d;
}

* {
  box-sizing: border-box;
}

.analytics-page {
  padding: 2rem;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  color: var(--dark);
  max-width: 1800px;
  margin: 0 auto;
  background-color: #f5f7fa;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1.5rem;
}

.header-content {
  flex: 1;
}

h1 {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--dark);
  margin: 0 0 0.25rem 0;
  line-height: 1.3;
}

.subtitle {
  font-size: 0.9375rem;
  color: var(--text-muted);
  margin: 0;
}

.time-range select {
  padding: 0.625rem 1.25rem;
  border-radius: 8px;
  border: 1px solid var(--border);
  background-color: white;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--dark);
  cursor: pointer;
  transition: all 0.3s;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 1rem;
  min-width: 180px;
}

.time-range select:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px var(--primary-light);
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.metric-card {
  background: white;
  border-radius: 12px;
  padding: 1.75rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.02);
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border-left: 4px solid transparent;
  position: relative;
  overflow: hidden;
}

.metric-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.metric-card::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background-color: var(--border);
  opacity: 0.2;
}

.metric-card.positive {
  border-left-color: var(--secondary);
}

.metric-card.negative {
  border-left-color: var(--danger);
}

.metric-info {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.metric-label {
  font-size: 0.875rem;
  color: var(--text-muted);
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.metric-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--dark);
  margin-bottom: 0.75rem;
  line-height: 1.2;
}

.metric-trend {
  display: flex;
  align-items: center;
  font-size: 0.8125rem;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.trend-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 6px;
  margin-right: 0.5rem;
}

.trend-icon.positive {
  background-color: rgba(28, 200, 138, 0.1);
  color: var(--secondary);
}

.trend-icon.negative {
  background-color: rgba(231, 74, 59, 0.1);
  color: var(--danger);
}

.trend-icon i {
  font-size: 0.75rem;
}

.trend-value {
  font-weight: 600;
  margin-right: 0.25rem;
}

.trend-value.positive {
  color: var(--secondary);
}

.trend-value.negative {
  color: var(--danger);
}

.trend-label {
  color: var(--text-muted);
  font-weight: 400;
}

.metric-icon {
  font-size: 2.5rem;
  opacity: 0.15;
  color: var(--primary);
  margin-left: 1rem;
}

.charts-container {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

@media (max-width: 1200px) {
  .charts-container {
    grid-template-columns: 1fr;
  }
}

.main-chart, .secondary-chart {
  background: white;
  border-radius: 12px;
  padding: 1.75rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.02);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.chart-legend {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--dark);
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 3px;
  margin-right: 0.5rem;
}

.chart-wrapper {
  position: relative;
  height: 320px;
  width: 100%;
}

.bottom-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

@media (max-width: 992px) {
  .bottom-section {
    grid-template-columns: 1fr;
  }
}

.top-regions, .conversion-card {
  background: white;
  border-radius: 12px;
  padding: 1.75rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.02);
}

.region-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1.5rem;
}

.region-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 0;
}

.region-rank {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background-color: var(--light);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: var(--dark);
  flex-shrink: 0;
}

.region-info {
  flex: 1;
  min-width: 0;
}

.region-name {
  font-weight: 600;
  color: var(--dark);
  margin-bottom: 0.25rem;
}

.region-stats {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.stat-value {
  font-weight: 500;
  color: var(--dark);
}

.stat-change {
  font-size: 0.8125rem;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.stat-change.positive {
  color: var(--secondary);
}

.stat-change.negative {
  color: var(--danger);
}

.stat-change i {
  font-size: 0.75rem;
}

.region-progress {
  flex: 0 0 120px;
  height: 6px;
  background-color: var(--light);
  border-radius: 3px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  border-radius: 3px;
  transition: width 0.6s ease;
}

.funnel-container {
  margin-top: 1.5rem;
}

.funnel-step {
  position: relative;
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
}

.funnel-step:not(:last-child)::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background-color: var(--border);
  opacity: 0.5;
}

.step-name {
  font-weight: 500;
  color: var(--dark);
  margin-bottom: 0.5rem;
}

.step-value {
  font-weight: 600;
  color: var(--dark);
  margin-bottom: 0.75rem;
}

.step-bar {
  height: 8px;
  border-radius: 4px;
  background-color: var(--primary);
  margin-bottom: 0.5rem;
  transition: width 0.6s ease;
}

.step-conversion {
  font-size: 0.8125rem;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.step-conversion i {
  color: var(--danger);
  font-size: 0.75rem;
}
</style>