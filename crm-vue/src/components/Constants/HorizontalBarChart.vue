<template>
  <Bar :data="chartData" :options="chartOptions" style="max-width: 700px;" />
</template>

<script>
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
} from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

export default {
  name: 'HorizontalBarChart',
  components: { Bar },
  props: {
    title: {
      type: String,
      default: 'Horizontal Bar Chart'
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
      default: () => []
    }
  },
  computed: {
    chartData() {
      const dynamicColors = this.generateColors(this.labels.length)

      return {
        labels: this.labels,
        datasets: [
          {
            label: this.title,
            backgroundColor: dynamicColors,
            data: this.values
          }
        ]
      }
    },
    chartOptions() {
      return {
        indexAxis: 'y',
        responsive: true,
        plugins: {
          legend: { display: false },
          title: {
            display: true,
            text: this.title
          }
        },
        scales: {
          x: { beginAtZero: true }
        }
      }
    }
  },
  methods: {
    generateColors(count) {
      // Use provided colors or generate from fallback palette
      const fallbackColors = [
        '#3498db', '#e74c3c', '#2ecc71', '#f1c40f',
        '#9b59b6', '#34495e', '#1abc9c', '#e67e22',
        '#7f8c8d', '#16a085'
      ]
      const finalColors = [...this.colors]

      while (finalColors.length < count) {
        finalColors.push(fallbackColors[finalColors.length % fallbackColors.length])
      }

      return finalColors.slice(0, count)
    }
  }
}
</script>
