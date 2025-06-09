<template>
  <div class="bar-graph-container">
    <canvas ref="barChartCanvas"></canvas>
  </div>
</template>

<script>
import {
  Chart,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
} from 'chart.js';

Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default {
  name: 'ThreeBarGraph',
  props: {
    title: {
      type: String,
      default: 'Three Bar Graph'
    },
    labels: {
      type: Array,
      required: true,
      validator: val => val.length === 3
    },
    values: {
      type: Array,
      required: true,
      validator: val => val.length === 3 && val.every(v => typeof v === 'number')
    },
    colors: {
      type: Array,
      default: () => ['#3498db', '#2ecc71', '#e74c3c'],
      validator: val => val.length === 3
    }
  },
  data() {
    return {
      chart: null
    };
  },
  watch: {
    values: 'updateChart',
    labels: 'updateChart',
    colors: 'updateChart'
  },
  mounted() {
    this.renderChart();
  },
  methods: {
    renderChart() {
      if (this.chart) this.chart.destroy();

      this.chart = new Chart(this.$refs.barChartCanvas, {
        type: 'bar',
        data: {
          labels: this.labels,
          datasets: [{
            label: this.title,
            data: this.values,
            backgroundColor: this.colors
          }]
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true
            }
          },
          plugins: {
            legend: {
              display: true
            }
          }
        }
      });
    },
    updateChart() {
      if (this.chart) {
        this.chart.data.labels = this.labels;
        this.chart.data.datasets[0].data = this.values;
        this.chart.data.datasets[0].backgroundColor = this.colors;
        this.chart.update();
      }
    }
  },
  beforeUnmount() {
    if (this.chart) {
      this.chart.destroy();
    }
  }
};
</script>

<style scoped>
.bar-graph-container {
  max-width: 500px;
  margin: 20px auto;
}
</style>
