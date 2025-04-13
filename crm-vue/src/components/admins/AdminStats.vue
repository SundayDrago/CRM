<template>
  <div class="stats-page">
    <div class="stats-header">
      <h1>Admin User Statistics</h1>
      <button class="back-button" @click="$router.go(-1)">
        <i class="fas fa-arrow-left"></i> Back to Home
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
          <h3>Total Users Created</h3>
          <p class="stat-value">{{ totalUsersCreated }}</p>
          <p class="stat-description">All users created by you</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">
          <i class="fas fa-user-clock"></i>
        </div>
        <div class="stat-content">
          <h3>Pending Users</h3>
          <p class="stat-value">{{ pendingUsers }}</p>
          <p class="stat-description">Users awaiting approval</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">
          <i class="fas fa-user-slash"></i>
        </div>
        <div class="stat-content">
          <h3>Inactive Users</h3>
          <p class="stat-value">{{ inactiveUsers }}</p>
          <p class="stat-description">Users inactive for 30+ days</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">
          <i class="fas fa-user-check"></i>
        </div>
        <div class="stat-content">
          <h3>Active Users</h3>
          <p class="stat-value">{{ activeUsers }}</p>
          <p class="stat-description">Users active in last 30 days</p>
        </div>
      </div>
    </div>

    <div class="chart-container">
      <div class="chart-header">
        <h2>User Creation Trend</h2>
        <span class="chart-subtitle">Monthly users created by you</span>
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
  name: 'AdminUserStats',
  data() {
    return {
      totalUsersCreated: 0,
      pendingUsers: 0,
      inactiveUsers: 0,
      activeUsers: 0,
      growthData: [],
      isLoading: true,
      errorMessage: null,
      chart: null,
      adminId: null
    };
  },
  async created() {
    await this.fetchAdminId();
    if (this.adminId) {
      await this.fetchAdminUserStats();
    }
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
    async fetchAdminId() {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          throw new Error('Authentication required');
        }

        // Fetch admin ID from token or user profile endpoint
        const response = await axios.get('http://localhost:5000/api/admin/user/stats', {
          headers: { Authorization: `Bearer ${token}` }
        });

        this.adminId = response.data.id;
      } catch (error) {
        console.error('Error fetching admin ID:', error);
        this.errorMessage = 'Unable to authenticate. Please log in again.';
        this.isLoading = false;
      }
    },
    async fetchAdminUserStats() {
      try {
        this.errorMessage = null; // Clear any previous errors
        const token = localStorage.getItem('authToken');
        if (!token) {
          throw new Error('Authentication required');
        }

        // Pass adminId as a query parameter to filter by created_by
        const response = await axios.get('http://localhost:5000/api/admin/user/stats', {
          headers: { Authorization: `Bearer ${token}` },
          params: { created_by: this.adminId }
        });

        this.totalUsersCreated = response.data.totalUsersCreated || 0;
        this.pendingUsers = response.data.pendingUsers || 0;
        this.inactiveUsers = response.data.inactiveUsers || 0;
        this.activeUsers = response.data.activeUsers || 0;
        this.growthData = response.data.growthData || [];
      } catch (error) {
        console.error('Error fetching admin user stats:', error);
        this.errorMessage = 'Unable to load statistics. Please try again later.';
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
            label: 'Users Created',
            data: data,
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderColor: 'rgba(59, 130, 246, 1)',
            borderWidth: 2,
            tension: 0.4,
            fill: true,
            pointBackgroundColor: 'white',
            pointBorderColor: 'rgba(59, 130, 246, 1)',
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
              backgroundColor: 'rgba(31, 41, 55, 0.9)',
              borderColor: 'rgba(229, 231, 235, 0.2)',
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
                color: 'rgba(229, 231, 235, 0.3)'
              },
              ticks: {
                color: '#6B7280',
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
                color: '#6B7280',
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
  background: #F9FAFB;
  min-height: 100vh;
}

.stats-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2.5rem;
}

.stats-header h1 {
  font-size: 1.875rem;
  font-weight: 700;
  color: #1F2A44;
  margin: 0;
}

.back-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  color: #4B5563;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.back-button:hover {
  background: #F3F4F6;
  border-color: #D1D5DB;
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
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
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
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
}

.stat-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  font-size: 1.25rem;
}

.stat-card:nth-child(1) .stat-icon {
  background: #DBEAFE;
  color: #3B82F6;
}

.stat-card:nth-child(2) .stat-icon {
  background: #FEF3C7;
  color: #F59E0B;
}

.stat-card:nth-child(3) .stat-icon {
  background: #FEE2E2;
  color: #EF4444;
}

.stat-card:nth-child(4) .stat-icon {
  background: #D1FAE5;
  color: #10B981;
}

.stat-content h3 {
  font-size: 1rem;
  font-weight: 500;
  color: #6B7280;
  margin: 0 0 0.25rem;
}

.stat-value {
  font-size: 1.875rem;
  font-weight: 700;
  color: #1F2A44;
  margin: 0;
}

.stat-description {
  font-size: 0.875rem;
  color: #6B7280;
  margin: 0.25rem 0 0;
}

.chart-container {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.chart-header {
  margin-bottom: 1.5rem;
}

.chart-header h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1F2A44;
  margin: 0 0 0.25rem;
}

.chart-subtitle {
  font-size: 0.875rem;
  color: #6B7280;
}

.chart-wrapper {
  position: relative;
  height: 350px;
}

@media (max-width: 768px) {
  .stats-page {
    padding: 1rem;
  }

  .stats-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .stats-header h1 {
    font-size: 1.5rem;
  }

  .stats-container {
    grid-template-columns: 1fr;
  }

  .chart-wrapper {
    height: 300px;
  }

  .error-notification {
    max-width: 100%;
  }
}
</style>