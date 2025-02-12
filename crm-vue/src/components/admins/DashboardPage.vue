<template>
    <div class="dashboard">
      <h1>Admin Dashboard</h1>
      
      <!-- Overview Cards -->
      <div class="overview">
        <div class="card" v-for="card in overviewCards" :key="card.title">
          <i :class="card.icon"></i>
          <div>
            <h3>{{ card.title }}</h3>
            <p>{{ card.value }}</p>
          </div>
        </div>
      </div>
      
      <!-- Charts Section -->
      <div class="charts">
        <div class="chart">
          <h3>Customer Segmentation</h3>
          <canvas ref="segmentationChart"></canvas>
        </div>
        <div class="chart">
          <h3>Spending Behavior</h3>
          <canvas ref="spendingChart"></canvas>
        </div>
      </div>
      
      <!-- Recent Activity -->
      <div class="activity">
        <h3>Recent Activity</h3>
        <ul>
          <li v-for="activity in recentActivity" :key="activity.id">
            {{ activity.message }} - <small>{{ activity.time }}</small>
          </li>
        </ul>
      </div>
    </div>
  </template>
  
  <script>
  import Chart from 'chart.js/auto';
  
  export default {
    name: 'DashboardPage',
    data() {
      return {
        overviewCards: [
          { title: 'Total Customers', value: 1200, icon: 'fas fa-users' },
          { title: 'Segmented Customers', value: 850, icon: 'fas fa-chart-pie' },
          { title: 'Active Customers', value: 740, icon: 'fas fa-user-check' },
        ],
        recentActivity: [
          { id: 1, message: 'Segment "Premium Users" updated', time: '10 mins ago' },
          { id: 2, message: 'New customer added to "Frequent Buyers"', time: '30 mins ago' },
          { id: 3, message: 'Segment "Inactive Users" refreshed', time: '1 hour ago' },
        ],
      };
    },
    mounted() {
      this.renderCharts();
    },
    methods: {
      renderCharts() {
        new Chart(this.$refs.segmentationChart, {
          type: 'doughnut',
          data: {
            labels: ['High Value', 'Medium Value', 'Low Value'],
            datasets: [{
              data: [300, 400, 500],
              backgroundColor: ['#007bff', '#ffc107', '#dc3545'],
            }],
          },
        });
        
        new Chart(this.$refs.spendingChart, {
          type: 'bar',
          data: {
            labels: ['Low', 'Medium', 'High'],
            datasets: [{
              label: 'Spending Behavior',
              data: [200, 500, 700],
              backgroundColor: ['#28a745', '#17a2b8', '#6610f2'],
            }],
          },
        });
      },
    },
  };
  </script>
  
  <style scoped>
  .dashboard {
    padding: 30px;
    background-color: #f4f7fc;
    font-family: 'Arial', sans-serif;
  }
  
  h1 {
    color: #333;
    margin-bottom: 30px;
  }
  
  .overview {
    display: flex;
    gap: 20px;
    justify-content: space-between;
    margin-bottom: 30px;
  }
  
  .card {
    background: #fff;
    padding: 20px;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    width: 30%;
    transition: transform 0.3s ease;
  }
  
  .card:hover {
    transform: translateY(-5px);
  }
  
  .card i {
    font-size: 36px;
    color: #007bff;
    margin-right: 15px;
  }
  
  .card h3 {
    margin: 0;
    color: #333;
    font-size: 20px;
  }
  
  .card p {
    margin: 5px 0;
    color: #666;
    font-size: 16px;
  }
  
  .charts {
    display: flex;
    justify-content: space-between;
    margin-bottom: 30px;
  }
  
  .chart {
    width: 48%;
    background: #fff;
    padding: 20px;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  .activity {
    background: #fff;
    padding: 20px;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  .activity h3 {
    margin-bottom: 15px;
    color: #333;
  }
  
  .activity ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  
  .activity li {
    padding: 12px;
    border-bottom: 1px solid #eee;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 14px;
  }
  
  .activity li:last-child {
    border-bottom: none;
  }
  
  .activity li small {
    color: #aaa;
  }
  
  .activity li:hover {
    background-color: #f9f9f9;
    cursor: pointer;
  }
  </style>
  