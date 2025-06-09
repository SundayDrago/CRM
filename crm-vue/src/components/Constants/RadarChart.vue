<template>
  <div>
    <canvas ref="radarChart"></canvas>
  </div>
</template>

<script>
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

export default {
  name: 'RadarChart',
  props: {
    labels: {
      type: Array,
      required: true
    },
    values: {
      type: Array,
      required: true
    },
    label: {
      type: String,
      default: 'Radar Data'
    },
    borderColor: {
      type: String,
      default: '#3498db'
    },
    backgroundColor: {
      type: String,
      default: 'rgba(52, 152, 219, 0.2)'
    }
  },
  mounted() {
    new Chart(this.$refs.radarChart, {
      type: 'radar',
      data: {
        labels: this.labels,
        datasets: [{
          label: this.label,
          data: this.values,
          borderColor: this.borderColor,
          backgroundColor: this.backgroundColor,
          pointBackgroundColor: this.borderColor
        }]
      },
      options: {
        responsive: true,
        scales: {
          r: {
            angleLines: { display: true },
            suggestedMin: 0,
            suggestedMax: 10
          }
        },
        plugins: {
          legend: {
            display: true
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
