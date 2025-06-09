<template>
  <div ref="chartContainer" class="chart"></div>
</template>

<script>
import * as echarts from 'echarts';
import { onMounted, ref, watch } from 'vue';

export default {
  name: 'CreateSegmentsPage',
  props: {
    data: {
      type: Array,
      required: true
    }
  },
  setup(props) {
    const chartContainer = ref(null);
    let chart = null;

    const renderChart = () => {
      if (!props.data.length || !chartContainer.value) return;

      // Process data for ECharts
      const categories = [...new Set(props.data.map(item => item.category))];
      const clusters = [...new Set(props.data.map(item => item.cluster))].sort();
      
      const series = clusters.map(cluster => {
        return {
          name: `Cluster ${cluster}`,
          type: 'bar',
          stack: 'total',
          emphasis: {
            focus: 'series'
          },
          data: categories.map(category => {
            const item = props.data.find(d => d.category === category && d.cluster === cluster);
            return item ? item.value : 0;
          })
        };
      });

      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        legend: {
          data: clusters.map(c => `Cluster ${c}`)
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'value'
        },
        yAxis: {
          type: 'category',
          data: categories
        },
        series: series
      };

      if (!chart) {
        chart = echarts.init(chartContainer.value);
      }
      chart.setOption(option);
    };

    onMounted(() => {
      renderChart();
    });

    watch(() => props.data, () => {
      renderChart();
    }, { deep: true });

    return {
      chartContainer
    };
  }
};
</script>

<style scoped>
.chart {
  width: 100%;
  height: 100%;
}
</style>