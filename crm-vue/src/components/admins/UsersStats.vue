<template>
  <div class="stats-page">
    <div class="stats-header">
      <h1>User Statistics</h1>
      <button class="back-button" @click="$router.go(-1)">
        <i class="fas fa-arrow-left"></i> Back to Users
      </button>
    </div>

    <!-- Custom Error Notification -->
    <transition name="fade">
      <div v-if="errorMessage" class="error-notification">
        <i class="fas fa-exclamation-circle"></i>
        <span>{{ errorMessage }}</span>
        <button class="close-button" @click="clearError">
          <i class="fas fa-times"></i>
        </button>
      </div>
    </transition>

    <div class="stats-container" :class="{ 'stats-loading': isLoading }">
      <div class="stat-card">
        <div class="stat-icon">
          <i class="fas fa-users"></i>
        </div>
        <div class="stat-content">
          <h3>Total Users</h3>
          <p class="stat-value">{{ totalUsers }}</p>
          <p class="stat-description">All registered users</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">
          <i class="fas fa-user-check"></i>
        </div>
        <div class="stat-content">
          <h3>Active Users</h3>
          <p class="stat-value">{{ activeUsers }}</p>
          <p class="stat-description">Last 30 days</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">
          <i class="fas fa-user-plus"></i>
        </div>
        <div class="stat-content">
          <h3>New Users</h3>
          <p class="stat-value">{{ newUsers }}</p>
          <p class="stat-description">Last 30 days</p>
        </div>
      </div>
    </div>

    <div class="chart-container">
      <div class="chart-header">
        <h2>User Growth Trend</h2>
        <span class="chart-subtitle">Monthly new user registrations</span>
      </div>
      <div class="chart-wrapper">
        <canvas ref="userGrowthChart"></canvas>
      </div>
    </div>
  </div>
</template>

<script>
import Chart from 'chart.js/auto';
import axios from 'axios';

export default {
  name: 'UsersStats',
  data() {
    return {
      totalUsers: 0,
      activeUsers: 0,
      newUsers: 0,
      growthData: [],
      isLoading: true,
      errorMessage: null,
      chart: null
    };
  },
  async created() {
    await this.fetchUserStats();
  },
  mounted() {
    this.renderChart();
  },
  beforeUnmount() {
    if (this.chart) {
      this.chart.destroy();
    }
  },
  methods: {
    async fetchUserStats() {
      try {
        this.errorMessage = null; // Clear any previous errors
        const token = localStorage.getItem('authToken');
        if (!token) {
          throw new Error('Authentication required');
        }

        const response = await axios.get('http://localhost:5000/api/user/stats', {
          headers: { Authorization: `Bearer ${token}` }
        });

        this.totalUsers = response.data.totalUsers || 0;
        this.activeUsers = response.data.activeUsers || 0;
        this.newUsers = response.data.newUsers || 0;
        this.growthData = response.data.growthData || [];
      } catch (error) {
        console.error('Error fetching user stats:', error);
        this.errorMessage = 'Unable to load user statistics. Please try again later.';
      } finally {
        this.isLoading = false;
      }
    },
    clearError() {
      this.errorMessage = null;
    },
    renderChart() {
      if (this.growthData.length === 0) return;

      const ctx = this.$refs.userGrowthChart.getContext('2d');
      const labels = this.growthData.map(item => item.month);
      const data = this.growthData.map(item => item.count);

      this.chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: 'New Users',
            data: data,
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
            borderColor: 'rgba(99, 102, 241, 1)',
            borderWidth: 2,
            tension: 0.4,
            fill: true,
            pointBackgroundColor: 'white',
            pointBorderColor: 'rgba(99, 102, 241, 1)',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              backgroundColor: 'rgba(17, 24, 39, 0.9)',
              borderColor: 'rgba(209, 213, 219, 0.2)',
              borderWidth: 1,
              padding: 12,
              titleFont: {
                size: 14
              },
              bodyFont: {
                size: 13
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                color: 'rgba(209, 213, 219, 0.2)'
              },
              ticks: {
                color: '#4B5563',
                font: {
                  size: 12
                }
              }
            },
            x: {
              grid: {
                display: false
              },
              ticks: {
                color: '#4B5563',
                font: {
                  size: 12
                }
              }
            }
          }
        }
      });
    }
  },
  watch: {
    growthData() {
      this.renderChart();
    }
  }
};
</script>

<style scoped>
.stats-page {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;
  background: #F3F4F6;
  min-height: 100vh;
}

.stats-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2.5rem;
}

.stats-header h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.back-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: white;
  border: 1px solid #D1D5DB;
  border-radius: 8px;
  color: #374151;
  font-weight: 500;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.back-button:hover {
  background: #F9FAFB;
  border-color: #9CA3AF;
  transform: translateY(-1px);
}

.error-notification {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: #FEE2E2;
  color: #B91C1C;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  border: 1px solid #FECACA;
  margin-bottom: 1.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
}

.error-notification i {
  font-size: 1rem;
}

.close-button {
  margin-left: auto;
  background: none;
  border: none;
  color: #B91C1C;
  cursor: pointer;
  font-size: 0.875rem;
  padding: 0.25rem;
}

.close-button:hover {
  color: #991B1B;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.stats-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2.5rem;
}

.stats-loading {
  opacity: 0.5;
  pointer-events: none;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 1.75rem;
  display: flex;
  align-items: center;
  gap: 1.25rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.stat-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-3px);
}

.stat-icon {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  font-size: 1.5rem;
}

.stat-card:nth-child(1) .stat-icon {
  background: #E0E7FF;
  color: #6366F1;
}

.stat-card:nth-child(2) .stat-icon {
  background: #D1FAE5;
  color: #10B981;
}

.stat-card:nth-child(3) .stat-icon {
  background: #FEF3C7;
  color: #F59E0B;
}

.stat-content h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #6B7280;
  margin: 0 0 0.5rem;
}

.stat-value {
  font-size: 2.25rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.stat-description {
  font-size: 0.875rem;
  color: #6B7280;
  margin: 0.5rem 0 0;
}

.chart-container {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.chart-header {
  margin-bottom: 1.5rem;
}

.chart-header h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.25rem;
}

.chart-subtitle {
  font-size: 0.875rem;
  color: #6B7280;
}

.chart-wrapper {
  position: relative;
  height: 360px;
}

@media (max-width: 768px) {
  .stats-page {
    padding: 1.5rem;
  }

  .stats-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .stats-header h1 {
    font-size: 1.75rem;
  }

  .stats-container {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .stat-card {
    padding: 1.25rem;
  }

  .stat-value {
    font-size: 1.875rem;
  }

  .chart-wrapper {
    height: 300px;
  }

  .error-notification {
    max-width: 100%;
  }
}
</style>