<template>
  <div class="analytics-page">
    <div class="header">
      <h1>Analytics Dashboard</h1>
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
        <h2>Monthly Performance</h2>
        <div class="chart-wrapper">
          <canvas id="analyticsChart"></canvas>
        </div>
      </div>
      <div class="secondary-chart">
        <h2>Traffic Sources</h2>
        <div class="chart-wrapper">
          <canvas id="trafficChart"></canvas>
        </div>
      </div>
    </div>

    <div class="data-table">
      <h2>Recent Activity</h2>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Page</th>
            <th>Users</th>
            <th>Bounce Rate</th>
            <th>Duration</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in recentActivity" :key="index">
            <td>{{ item.date }}</td>
            <td>{{ item.page }}</td>
            <td>{{ item.users }}</td>
            <td>{{ item.bounceRate }}</td>
            <td>{{ item.duration }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { onMounted, ref } from 'vue';
import Chart from 'chart.js/auto';

export default {
  name: 'AnalyticsPage',
  setup() {
    const timeRange = ref('30d');
    const metrics = ref([
      {
        label: 'Total Users',
        value: '12,845',
        trendValue: '+12.5%',
        trendIcon: 'fas fa-arrow-up',
        trendClass: 'positive',
        icon: 'fas fa-users'
      },
      {
        label: 'Sessions',
        value: '34,210',
        trendValue: '+8.2%',
        trendIcon: 'fas fa-arrow-up',
        trendClass: 'positive',
        icon: 'fas fa-globe'
      },
      {
        label: 'Bounce Rate',
        value: '32.1%',
        trendValue: '-4.3%',
        trendIcon: 'fas fa-arrow-down',
        trendClass: 'negative',
        icon: 'fas fa-signal'
      },
      {
        label: 'Conversion Rate',
        value: '2.8%',
        trendValue: '+1.1%',
        trendIcon: 'fas fa-arrow-up',
        trendClass: 'positive',
        icon: 'fas fa-percentage'
      }
    ]);

    const recentActivity = ref([
      { date: '2023-05-15', page: '/home', users: 1245, bounceRate: '28%', duration: '2m 45s' },
      { date: '2023-05-15', page: '/products', users: 876, bounceRate: '35%', duration: '3m 12s' },
      { date: '2023-05-14', page: '/blog', users: 1023, bounceRate: '42%', duration: '4m 8s' },
      { date: '2023-05-14', page: '/contact', users: 432, bounceRate: '31%', duration: '1m 56s' },
      { date: '2023-05-13', page: '/about', users: 765, bounceRate: '38%', duration: '2m 23s' }
    ]);

    const updateChart = () => {
      // In a real app, you would fetch new data based on timeRange
      console.log('Time range changed to:', timeRange.value);
    };

    onMounted(() => {
      // Main chart
      const ctx = document.getElementById('analyticsChart');
      new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
          datasets: [
            {
              label: 'Unique Visitors',
              data: [6500, 5900, 8000, 8100, 8600, 9250, 10200],
              borderColor: '#4e73df',
              backgroundColor: 'rgba(78, 115, 223, 0.05)',
              borderWidth: 2,
              fill: true,
              tension: 0.4
            },
            {
              label: 'Page Views',
              data: [12500, 11800, 14000, 14200, 15200, 16800, 18400],
              borderColor: '#1cc88a',
              backgroundColor: 'rgba(28, 200, 138, 0.05)',
              borderWidth: 2,
              fill: true,
              tension: 0.4
            }
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
            },
            tooltip: {
              mode: 'index',
              intersect: false,
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                color: 'rgba(0, 0, 0, 0.05)',
              }
            },
            x: {
              grid: {
                display: false
              }
            }
          },
        },
      });

      // Traffic chart
      const trafficCtx = document.getElementById('trafficChart');
      new Chart(trafficCtx, {
        type: 'doughnut',
        data: {
          labels: ['Direct', 'Social', 'Referral', 'Organic', 'Email'],
          datasets: [{
            data: [35, 15, 20, 25, 5],
            backgroundColor: [
              '#4e73df',
              '#1cc88a',
              '#36b9cc',
              '#f6c23e',
              '#e74a3b'
            ],
            hoverBackgroundColor: [
              '#2e59d9',
              '#17a673',
              '#2c9faf',
              '#dda20a',
              '#be2617'
            ],
            hoverBorderColor: "rgba(234, 236, 244, 1)",
          }],
        },
        options: {
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'right',
            },
          },
          cutout: '70%',
        },
      });
    });

    return {
      metrics,
      recentActivity,
      timeRange,
      updateChart
    };
  },
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
  --dark: #5a5c69;
  --light: #f8f9fc;
  --gray: #d1d3e2;
}

.analytics-page {
  padding: 2rem;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  color: #333;
  max-width: 1600px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

h1 {
  font-size: 1.75rem;
  font-weight: 600;
  color: var(--dark);
  margin: 0;
}

h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--dark);
  margin-bottom: 1rem;
}

.time-range select {
  padding: 0.5rem 1rem;
  border-radius: 0.35rem;
  border: 1px solid var(--gray);
  background-color: white;
  font-size: 0.875rem;
  color: var(--dark);
  cursor: pointer;
  transition: all 0.3s;
}

.time-range select:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 0.2rem var(--primary-light);
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.metric-card {
  background: white;
  border-radius: 0.5rem;
  padding: 1.5rem;
  box-shadow: 0 0.15rem 1.75rem 0 rgba(58, 59, 69, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: transform 0.3s;
  border-left: 0.25rem solid transparent;
}

.metric-card:hover {
  transform: translateY(-5px);
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
}

.metric-label {
  font-size: 0.875rem;
  color: var(--dark);
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.metric-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--dark);
  margin-bottom: 0.5rem;
}

.metric-trend {
  display: flex;
  align-items: center;
  font-size: 0.75rem;
}

.trend-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 50%;
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
  color: #6c757d;
}

.metric-icon {
  font-size: 2rem;
  opacity: 0.3;
  color: var(--primary);
}

.charts-container {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

@media (max-width: 992px) {
  .charts-container {
    grid-template-columns: 1fr;
  }
}

.main-chart, .secondary-chart {
  background: white;
  border-radius: 0.5rem;
  padding: 1.5rem;
  box-shadow: 0 0.15rem 1.75rem 0 rgba(58, 59, 69, 0.1);
}

.chart-wrapper {
  position: relative;
  height: 300px;
  width: 100%;
}

.data-table {
  background: white;
  border-radius: 0.5rem;
  padding: 1.5rem;
  box-shadow: 0 0.15rem 1.75rem 0 rgba(58, 59, 69, 0.1);
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 0.75rem 1rem;
  text-align: left;
  border-bottom: 1px solid #e3e6f0;
}

th {
  font-weight: 600;
  color: var(--dark);
  background-color: #f8f9fc;
  text-transform: uppercase;
  font-size: 0.7rem;
  letter-spacing: 0.05em;
}

tbody tr:hover {
  background-color: #f8f9fc;
}
</style>