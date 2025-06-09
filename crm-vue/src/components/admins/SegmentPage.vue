<template>
  <div ref="chartContainer" class="chart"></div>
</template>

<script>
import * as echarts from 'echarts';
import { onMounted, ref, watch } from 'vue';

export default {
  name: 'SegmentPage',
  props: {
    data: {
      type: Object,
      required: true
    }
  },
  setup(props) {
    const chartContainer = ref(null);
    let chart = null;

    const renderChart = () => {
      if (!props.data || !props.data.labels || !chartContainer.value) return;

      const option = {
        tooltip: {},
        radar: {
          indicator: props.data.labels.map(label => {
            return { name: label, max: Math.max(...props.data.datasets[0].data) * 1.2 };
          })
        },
        series: [{
          type: 'radar',
          data: props.data.datasets
        }]
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