<template>
  <div class="dashboard">
    <!-- Key Metrics -->
     <h1>Dashboard</h1>
    <div class="metrics">
      <div class="card" v-for="metric in keyMetrics" :key="metric.title">
        <h2>{{ metric.title }}</h2>
        <p>{{ metric.value }}</p>
      </div>
    </div>

    <!-- Charts Section -->
    <div class="charts">
      <div class="chart-container">
        <h3>Customer Segments</h3>
        <canvas id="segmentChart"></canvas>
      </div>
      <div class="chart-container">
        <h3>Spending Trends</h3>
        <canvas id="spendingChart"></canvas>
      </div>
    </div>

    <!-- Additional Insights -->
    <div class="extra-insights">
      <div class="chart-container">
        <h3>Top Shopping Categories</h3>
        <canvas id="categoryChart"></canvas>
      </div>
      <div class="chart-container">
        <h3>Customer Retention Rate</h3>
        <canvas id="retentionChart"></canvas>
      </div>
    </div>

    <!-- Recent Customer Activity -->
    <div class="activity">
      <h3>Recent Customer Activity</h3>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Segment</th>
            <th>Last Purchase</th>
            <th>Amount ($)</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="customer in recentCustomers" :key="customer.name">
            <td>{{ customer.name }}</td>
            <td class="segment">{{ customer.segment }}</td>
            <td>{{ customer.lastPurchase }}</td>
            <td class="amount">${{ customer.amount }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import Chart from "chart.js/auto";

export default {
  name: "DashboardPage",
  data() {
    return {
      keyMetrics: [
        { title: "Total Customers", value: "1,200" },
        { title: "Segments Identified", value: "5" },
        { title: "Avg Monthly Spending", value: "$150" },
        { title: "Customer Retention", value: "78%" },
      ],
      recentCustomers: [
        { name: "John Doe", segment: "High Spender", lastPurchase: "Feb 25", amount: 250 },
        { name: "Jane Smith", segment: "Frequent Buyer", lastPurchase: "Feb 24", amount: 120 },
        { name: "Mike Johnson", segment: "Occasional Shopper", lastPurchase: "Feb 23", amount: 80 },
      ],
    };
  },
  mounted() {
    this.createCharts();
  },
  methods: {
    createCharts() {
      const chartConfigs = [
        {
          id: "segmentChart",
          type: "doughnut",
          labels: ["High Spenders", "Frequent Buyers", "Occasional Shoppers", "Discount Seekers", "New Customers"],
          data: [30, 25, 20, 15, 10],
          backgroundColor: ["#ff6384", "#36a2eb", "#ffce56", "#4bc0c0", "#9966ff"],
        },
        {
          id: "spendingChart",
          type: "line",
          labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
          data: [120, 140, 130, 160, 150, 170],
          borderColor: "#36a2eb",
          fill: true,
          backgroundColor: "rgba(54, 162, 235, 0.2)",
        },
        {
          id: "categoryChart",
          type: "bar",
          labels: ["Electronics", "Fashion", "Home & Kitchen", "Beauty", "Sports"],
          data: [400, 350, 300, 250, 200],
          backgroundColor: ["#ff6384", "#36a2eb", "#ffce56", "#4bc0c0", "#9966ff"],
        },
        {
          id: "retentionChart",
          type: "polarArea",
          labels: ["Loyal Customers", "Churned Customers", "New Customers"],
          data: [78, 15, 7],
          backgroundColor: ["#4caf50", "#f44336", "#ff9800"],
        },
      ];

      chartConfigs.forEach(({ id, ...config }) => {
        new Chart(document.getElementById(id), {
          type: config.type,
          data: {
            labels: config.labels,
            datasets: [{
              data: config.data,
              backgroundColor: config.backgroundColor,
              borderColor: config.borderColor || undefined,
              fill: config.fill || false,
            }],
          },
          options: {
            responsive: true,
            plugins: {
              legend: { position: "bottom" },
            },
          },
        });
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

/* Metrics Section */
.metrics {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-bottom: 30px;
}

.card {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  min-width: 180px;
  text-align: center;
  transition: transform 0.3s ease-in-out;
}

.card:hover {
  transform: scale(1.05);
}

.card h2 {
  font-size: 18px;
  color: #555;
}

.card p {
  font-size: 24px;
  font-weight: bold;
  color: #36a2eb;
}

/* Charts Section */
.charts, .extra-insights {
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
  margin-bottom: 30px;
}

.chart-container {
  background: white;
  padding: 15px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 45%;
  height: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.chart-container h3 {
  font-size: 18px;
  color: #333;
  margin-bottom: 10px;
}

canvas {
  width: 250px !important;
  height: 250px !important;
}

/* Recent Customer Activity */
.activity {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-top: 30px;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
  text-align: center;
}

.activity h3 {
  font-size: 20px;
  color: #333;
  margin-bottom: 15px;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 12px;
  border-bottom: 1px solid #ddd;
  text-align: center;
}

th {
  background: #f0f0f0;
  font-weight: bold;
}

tr:hover {
  background: #f9f9f9;
}

.segment {
  font-weight: bold;
  color: #4bc0c0;
}

.amount {
  font-weight: bold;
  color: #ff6384;
}
</style>
<!----------------------------------------------------



<template>
  <div class="dashboard">
    <h1>Customer Analytics Dashboard</h1>
    
    Key Model-Based Metrics
    <div class="metrics">
      <div class="card" v-for="metric in keyMetrics" :key="metric.title">
        <h2>{{ metric.title }}</h2>
        <p>{{ metric.value }}</p>
      </div>
    </div>
    
    Model-Generated Insights
    <div class="charts">
      <div class="chart-container">
        <h3>Customer Segmentation Distribution</h3>
        <canvas id="segmentChart"></canvas>
      </div>
      <div class="chart-container">
        <h3>Spending Pattern Forecast</h3>
        <canvas id="spendingChart"></canvas>
      </div>
    </div>
    
    Additional Predictive Insights
    <div class="extra-insights">
      <div class="chart-container">
        <h3>Predicted Top Categories</h3>
        <canvas id="categoryChart"></canvas>
      </div>
      <div class="chart-container">
        <h3>Retention Rate Forecast</h3>
        <canvas id="retentionChart"></canvas>
      </div>
    </div>
    
    Recent Customer Behavior from Model -->
    <!-- <div class="activity">
      <h3>Recent Customer Activity</h3>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Segment</th>
            <th>Last Purchase</th>
            <th>Predicted Next Purchase</th>
            <th>Amount ($)</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="customer in recentCustomers" :key="customer.name">
            <td>{{ customer.name }}</td>
            <td class="segment">{{ customer.segment }}</td>
            <td>{{ customer.lastPurchase }}</td>
            <td>{{ customer.predictedNextPurchase }}</td>
            <td class="amount">${{ customer.amount }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import Chart from "chart.js/auto";

export default {
  name: "DashboardPage",
  data() {
    return {
      keyMetrics: [],
      recentCustomers: []
    };
  }, -->
  <!-- async mounted() {
    await this.fetchModelData();
    this.createCharts();
  },
  methods: {
    async fetchModelData() {
      // Fetching metrics and customer data from the trained model
      const response = await fetch("/api/model-analytics");
      const data = await response.json();
      this.keyMetrics = data.keyMetrics;
      this.recentCustomers = data.recentCustomers;
    },
    createCharts() {
      const chartConfigs = [
        { id: "segmentChart", type: "doughnut", labels: ["High", "Medium", "Low"], data: [45, 35, 20], backgroundColor: ["#ff6384", "#36a2eb", "#ffce56"] },
        { id: "spendingChart", type: "line", labels: ["Jan", "Feb", "Mar", "Apr"], data: [120, 140, 130, 160], borderColor: "#36a2eb", fill: true, backgroundColor: "rgba(54, 162, 235, 0.2)" },
        { id: "categoryChart", type: "bar", labels: ["Electronics", "Fashion", "Beauty"], data: [400, 350, 200], backgroundColor: ["#ff6384", "#36a2eb", "#ffce56"] },
        { id: "retentionChart", type: "polarArea", labels: ["Loyal", "Churned", "New"], data: [70, 20, 10], backgroundColor: ["#4caf50", "#f44336", "#ff9800"] }
      ];
      
      chartConfigs.forEach(({ id, ...config }) => {
        new Chart(document.getElementById(id), {
          type: config.type,
          data: {
            labels: config.labels,
            datasets: [{
              data: config.data,
              backgroundColor: config.backgroundColor,
              borderColor: config.borderColor || undefined,
              fill: config.fill || false,
            }],
          },
          options: { responsive: true, plugins: { legend: { position: "bottom" } } },
        });
      });
    }
  }
};
</script> -->




