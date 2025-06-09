<template>
  <Doughnut :data="chartData" :options="chartOptions" style="max-width: 400px;" />
</template>

<script>
import { Doughnut } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, ArcElement)

export default {
  name: 'DonutChart',
  components: {
    Doughnut
  },
  props: {
    title: {
      type: String,
      default: 'Donut Chart'
    },
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
      default: () => ['#3498db', '#e74c3c', '#2ecc71']
    }
  },
  computed: {
    chartData() {
      return {
        labels: this.labels,
        datasets: [
          {
            label: this.title,
            backgroundColor: this.colors,
            data: this.values,
            borderWidth: 1
          }
        ]
      }
    },
    chartOptions() {
      return {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom'
          },
          title: {
            display: true,
            text: this.title
          }
        }
      }
    }
  }
}
</script>
