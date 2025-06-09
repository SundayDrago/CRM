<template>
  <div>
    <canvas ref="polarChart"></canvas>
  </div>
</template>

<script>
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

export default {
  name: 'PolarAreaChart',
  props: {
    labels: {
      type: Array,
      required: true
    },
    values: {
      type: Array,
      required: true
    },
    colors: {
      type: Array,
      default: () => ['#3498db', '#1abc9c', '#f39c12', '#e74c3c', '#9b59b6']
    },
    title: {
      type: String,
      default: ''
    }
  },
  mounted() {
    new Chart(this.$refs.polarChart, {
      type: 'polarArea',
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
        plugins: {
          legend: {
            position: 'right'
          },
          title: {
            display: !!this.title,
            text: this.title
          }
        }
      }
    });
  }
};
</script>

<style scoped>
canvas {
  max-width: 100%;
}
</style>
