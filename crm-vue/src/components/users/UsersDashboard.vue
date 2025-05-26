<template>
  <div>
    <!-- Stats Overview -->
    <section class="stats-section" aria-label="Key metrics">
      <div class="stat-card" v-for="stat in stats" :key="stat.title">
        <div class="stat-content">
          <div class="stat-header">
            <h3>{{ stat.title }}</h3>
            <div class="stat-trend" :class="stat.trend > 0 ? 'positive' : 'negative'">
              <span v-html="SvgIcons[stat.trend > 0 ? 'trendingUp' : 'trendingDown']"></span>
              {{ Math.abs(stat.trend) }}%
            </div>
          </div>
          <div class="stat-value">{{ stat.value }}</div>
          <div class="stat-description">{{ stat.description }}</div>
        </div>
        <div class="stat-icon">
          <span v-html="SvgIcons[stat.icon]"></span>
        </div>
      </div>
    </section>

    <!-- Main Chart -->
    <section class="chart-section" aria-label="Customer engagement chart">
      <div class="section-header">
        <h2>Customer Engagement</h2>
        <div class="chart-actions">
          <button
            v-for="period in chartPeriods"
            :key="period"
            @click="setChartPeriod(period)"
            :class="{ active: activeChartPeriod === period }"
            :aria-pressed="activeChartPeriod === period"
          >
            {{ period }}
          </button>
        </div>
      </div>
      <div class="chart-container">
        <canvas ref="engagementChart" aria-label="Churn risk over time"></canvas>
      </div>
    </section>

    <!-- Recent Activity -->
    <section class="activity-section" aria-label="Recent activity">
      <div class="section-header">
        <h2>Recent Activity</h2>
        <button class="view-all" @click="viewAllActivities" aria-label="View all activities">
          View All
        </button>
      </div>
      <ul class="activity-list">
        <li v-for="activity in recentActivities" :key="activity.id" class="activity-item">
          <div class="activity-icon" :class="activity.type">
            <span v-html="SvgIcons[activity.icon]"></span>
          </div>
          <div class="activity-details">
            <p class="activity-message">{{ activity.message }}</p>
            <span class="activity-time">{{ activity.time }}</span>
          </div>
        </li>
      </ul>
    </section>

    <!-- Customer Table -->
    <section class="customer-section" aria-label="Customer segments table">
      <div class="section-header">
        <h2>Customer Segments</h2>
        <div class="table-controls">
          <button class="export-btn" @click="exportData" aria-label="Export customer data">
            <span v-html="SvgIcons.download"></span>
            <span>Export</span>
          </button>
          <div class="records-count">
            Showing {{ pagination.start }}-{{ pagination.end }} of {{ filteredCustomers.length }}
          </div>
        </div>
      </div>

      <div class="table-wrapper">
        <table role="grid">
          <thead>
            <tr>
              <th
                v-for="column in tableColumns"
                :key="column.key"
                @click="sortTable(column.key)"
                :class="{ active: sortBy === column.key, [sortOrder]: sortBy === column.key }"
                scope="col"
                tabindex="0"
                @keydown.enter="sortTable(column.key)"
                :aria-sort="sortBy === column.key ? sortOrder : 'none'"
              >
                {{ column.label }}
                <span class="sort-icon" v-html="sortBy === column.key && sortOrder === 'asc' ? SvgIcons.arrowUp : SvgIcons.arrowDown"></span>
              </th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="paginatedCustomers.length === 0">
              <td :colspan="tableColumns.length + 1" class="empty-table-message">
                No customers found matching your criteria.
              </td>
            </tr>
            <tr v-for="customer in paginatedCustomers" :key="customer.id">
              <td>
                <div class="customer-cell">
                  <div
                    class="customer-avatar"
                    :style="{ backgroundColor: stringToColor(customer.name) }"
                  >
                    {{ getInitials(customer.name) }}
                  </div>
                  <div class="customer-info">
                    <span class="name">{{ customer.name }}</span>
                    <span class="id">ID: {{ customer.id }}</span>
                  </div>
                </div>
              </td>
              <td>{{ customer.segment }}</td>
              <td>{{ formatCurrency(customer.predictedValue) }}</td>
              <td>{{ formatDate(customer.nextPurchase) }}</td>
              <td>
                <div class="progress-cell">
                  <div class="progress-bar">
                    <div
                      class="progress-fill"
                      :style="{ width: `${customer.churnRisk}%` }"
                      :class="getEngagementClass(customer.churnRisk)"
                    ></div>
                  </div>
                  <span>{{ customer.churnRisk }}%</span>
                </div>
              </td>
              <td>
                <div class="action-buttons">
                  <button
                    class="icon-btn"
                    @click="viewCustomer(customer.id)"
                    aria-label="View customer details"
                  >
                    <span v-html="SvgIcons.visibility"></span>
                  </button>
                  <button
                    class="icon-btn"
                    @click="editCustomer(customer.id)"
                    aria-label="Edit customer"
                  >
                    <span v-html="SvgIcons.edit"></span>
                  </button>
                  <button
                    class="icon-btn"
                    @click="showCustomerActions(customer.id, $event)"
                    aria-label="More actions"
                  >
                    <span v-html="SvgIcons.moreVert"></span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="pagination-controls">
        <div class="rows-per-page">
          <label for="rows-per-page">Rows per page:</label>
          <select
            id="rows-per-page"
            v-model="pagination.itemsPerPage"
            @change="updatePagination"
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
          </select>
        </div>
        <div class="pagination-buttons">
          <button
            class="pagination-btn"
            @click="prevPage"
            :disabled="pagination.currentPage === 1"
            aria-label="Previous page"
          >
            <span v-html="SvgIcons.chevronLeft"></span>
          </button>
          <div class="page-numbers">
            <button
              v-for="page in visiblePages"
              :key="page"
              @click="goToPage(page)"
              :class="{ active: page === pagination.currentPage }"
              :aria-current="page === pagination.currentPage ? 'page' : null"
              :aria-label="`Page ${page}`"
            >
              {{ page }}
            </button>
          </div>
          <button
            class="pagination-btn"
            @click="nextPage"
            :disabled="pagination.currentPage === pagination.totalPages"
            aria-label="Next page"
          >
            <span v-html="SvgIcons.chevronRight"></span>
          </button>
        </div>
      </div>
    </section>

    <!-- Customer Actions Dropdown -->
    <transition name="fade">
      <div
        v-if="customerActionsOpen"
        class="customer-actions-dropdown"
        :style="customerActionsPosition"
        @click.stop
      >
        <button class="dropdown-item" @click="viewCustomer(selectedCustomerId)">
          <span class="dropdown-icon" v-html="SvgIcons.visibility"></span>
          <span>View Details</span>
        </button>
        <button class="dropdown-item" @click="editCustomer(selectedCustomerId)">
          <span class="dropdown-icon" v-html="SvgIcons.edit"></span>
          <span>Edit Customer</span>
        </button>
        <button class="dropdown-item" @click="sendMessage(selectedCustomerId)">
          <span class="dropdown-icon" v-html="SvgIcons.email"></span>
          <span>Send Message</span>
        </button>
        <div class="dropdown-divider"></div>
        <button class="dropdown-item danger" @click="flagCustomer(selectedCustomerId)">
          <span class="dropdown-icon" v-html="SvgIcons.flag"></span>
          <span>Flag for Review</span>
        </button>
      </div>
    </transition>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, watch, nextTick, reactive } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { Chart, registerables } from 'chart.js';
import { format, subDays, subWeeks, subMonths, startOfWeek, parseISO } from 'date-fns';
import axios from 'axios';
import { SvgIcons } from './icons';

Chart.register(...registerables);

export default {
  name: 'UsersDashboard',
  setup() {
    const router = useRouter();
    const route = useRoute();

    // State
    const loading = ref(false);
    const error = ref(null);
    const sortBy = ref('predictedValue');
    const sortOrder = ref('desc');
    const activeChartPeriod = ref('30d');
    const customerActionsOpen = ref(false);
    const selectedCustomerId = ref(null);
    const customerActionsPosition = ref({ top: '0', left: '0' });

    // Pagination state
    const pagination = reactive({
      currentPage: 1,
      itemsPerPage: 10,
      totalItems: 0,
      totalPages: 1,
      start: 1,
      end: 10,
    });

    // Stats data
    const stats = ref([
      {
        title: 'Total Customers',
        value: '0',
        trend: 0,
        description: 'From last period',
        icon: 'group',
      },
      {
        title: 'Avg. Value',
        value: 'UGX 0',
        trend: 0,
        description: 'Per customer',
        icon: 'attachMoney',
      },
      {
        title: 'Churn Risk',
        value: '0%',
        trend: 0,
        description: 'At risk customers',
        icon: 'warning',
      },
    ]);

    // Chart periods
    const chartPeriods = ref(['7d', '30d', '90d', '1y']);

    // Recent activities
    const recentActivities = ref([
      {
        id: 1,
        type: 'purchase',
        icon: 'shoppingCart',
        message: 'New high-value purchase recorded from customer #1005',
        time: '2 min ago',
      },
      {
        id: 2,
        type: 'segment',
        icon: 'category',
        message: 'Segment "High Potential" was updated with 12 new customers',
        time: '15 min ago',
      },
      {
        id: 3,
        type: 'alert',
        icon: 'notifications',
        message: 'High churn risk detected for 5 customers in "At Risk" segment',
        time: '1 hour ago',
      },
    ]);

    // Table columns
    const tableColumns = ref([
      { key: 'name', label: 'Customer' },
      { key: 'segment', label: 'Segment' },
      { key: 'predictedValue', label: 'Value' },
      { key: 'nextPurchase', label: 'Next Purchase' },
      { key: 'churnRisk', label: 'Churn Risk' },
    ]);

    // Customers data
    const customers = ref([]);

    // Computed properties
    const filteredCustomers = computed(() => {
      let result = [...customers.value];
      if (route.query.search) {
        const query = route.query.search.toLowerCase();
        result = result.filter(
          customer =>
            customer.name?.toLowerCase().includes(query) ||
            customer.segment?.toLowerCase().includes(query) ||
            customer.id?.toString().includes(query)
        );
      }
      return result.sort((a, b) => {
        const valA = a[sortBy.value] ?? '';
        const valB = b[sortBy.value] ?? '';
        const modifier = sortOrder.value === 'asc' ? 1 : -1;
        if (typeof valA === 'string') {
          return valA.localeCompare(valB) * modifier;
        }
        return (valA - valB) * modifier;
      });
    });

    const paginatedCustomers = computed(() => {
      const start = (pagination.currentPage - 1) * pagination.itemsPerPage;
      const end = start + pagination.itemsPerPage;
      return filteredCustomers.value.slice(start, end);
    });

    const visiblePages = computed(() => {
      const pages = [];
      const maxVisible = 5;
      let start = Math.max(1, pagination.currentPage - Math.floor(maxVisible / 2));
      let end = Math.min(pagination.totalPages, start + maxVisible - 1);
      if (end - start + 1 < maxVisible) {
        start = Math.max(1, end - maxVisible + 1);
      }
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      return pages;
    });

    // Methods
    const fetchData = async () => {
      if (loading.value) return;
      loading.value = true;
      error.value = null;

      try {
        const response = await axios.get('http://127.0.0.1:5000/dashboard', { timeout: 5000 });
        const keyMetrics = response.data.keyMetrics || [];
        const customerPredictions = response.data.customerPredictions || [];

        customers.value = customerPredictions.map(customer => ({
          id: customer.id || Math.random().toString(36).substr(2, 9),
          name: customer.name || 'Unknown',
          segment: customer.segment || 'N/A',
          predictedValue: Number(customer.predictedValue) || 0,
          nextPurchase: customer.nextPurchase || '',
          churnRisk: Number(customer.churnRisk) || 0,
        }));

        updateStats(keyMetrics, customerPredictions);
        initChart();
      } catch (err) {
        console.error('Failed to fetch data:', err);
        loadMockData();
      } finally {
        loading.value = false;
        updatePagination();
      }
    };

    const updateStats = (keyMetrics, customerPredictions) => {
      const totalCustomers = customerPredictions.length;
      const churnRiskCount = customerPredictions.filter(c => c.churnRisk >= 50).length;
      const avgPredictedValue = totalCustomers > 0
        ? customerPredictions.reduce((sum, c) => sum + c.predictedValue, 0) / totalCustomers
        : 0;

      stats.value = [
        {
          title: 'Total Customers',
          value: totalCustomers.toLocaleString(),
          trend: keyMetrics[0]?.trend || 0,
          description: 'From last period',
          icon: 'group',
        },
        {
          title: 'Avg. Value',
          value: `UGX ${Math.round(avgPredictedValue).toLocaleString()}`,
          trend: keyMetrics[2]?.trend || 0,
          description: 'Per customer',
          icon: 'attachMoney',
        },
        {
          title: 'Churn Risk',
          value: totalCustomers > 0 ? `${((churnRiskCount / totalCustomers) * 100).toFixed(1)}%` : '0.0%',
          trend: keyMetrics[1]?.trend || 0,
          description: 'At risk customers',
          icon: 'warning',
        },
      ];
    };

    const loadMockData = () => {
      customers.value = [
        {
          id: 1000,
          name: 'John Mwesigwa',
          segment: 'Middle-Aged High Spenders',
          predictedValue: 1500000,
          nextPurchase: '2025-04-13',
          churnRisk: 10,
        },
        // ... other mock customers as in original
      ];

      updateStats(
        [
          { trend: 8.2 },
          { trend: -1.2 },
          { trend: 5.5 },
        ],
        customers.value
      );
      initChart();
    };

    const showCustomerActions = (customerId, event) => {
      selectedCustomerId.value = customerId;
      customerActionsOpen.value = true;
      if (event) {
        const rect = event.target.getBoundingClientRect();
        customerActionsPosition.value = {
          top: `${rect.bottom + window.scrollY + 5}px`,
          left: `${rect.left + window.scrollX - 150}px`,
        };
      }
    };

    const formatCurrency = amount => {
      return `UGX ${Math.round(amount).toLocaleString()}`;
    };

    const formatDate = dateString => {
      try {
        return format(parseISO(dateString), 'MMM d, yyyy');
      } catch {
        return 'Invalid Date';
      }
    };

    const getInitials = name => {
      return name
        .split(' ')
        .map(part => part[0])
        .join('')
        .toUpperCase();
    };

    const stringToColor = str => {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
      }
      const h = hash % 360;
      return `hsl(${h}, 70%, 65%)`;
    };

    const getEngagementClass = churnRisk => {
      if (churnRisk >= 70) return 'high';
      if (churnRisk >= 30) return 'medium';
      return 'low';
    };

    const sortTable = column => {
      if (sortBy.value === column) {
        sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
      } else {
        sortBy.value = column;
        sortOrder.value = 'desc';
      }
    };

    const updatePagination = () => {
      pagination.totalItems = filteredCustomers.value.length;
      pagination.totalPages = Math.ceil(
        pagination.totalItems / pagination.itemsPerPage
      ) || 1;
      pagination.currentPage = Math.min(
        pagination.currentPage,
        pagination.totalPages
      );
      pagination.start = (pagination.currentPage - 1) * pagination.itemsPerPage + 1;
      pagination.end = Math.min(
        pagination.currentPage * pagination.itemsPerPage,
        pagination.totalItems
      );
    };

    const prevPage = () => {
      if (pagination.currentPage > 1) {
        pagination.currentPage--;
        updatePagination();
      }
    };

    const nextPage = () => {
      if (pagination.currentPage < pagination.totalPages) {
        pagination.currentPage++;
        updatePagination();
      }
    };

    const goToPage = page => {
      pagination.currentPage = page;
      updatePagination();
    };

    const setChartPeriod = period => {
      activeChartPeriod.value = period;
      initChart();
    };

    const viewCustomer = id => {
      router.push(`/customers/${id}`);
      customerActionsOpen.value = false;
    };

    const editCustomer = id => {
      router.push(`/customers/${id}/edit`);
      customerActionsOpen.value = false;
    };

    const sendMessage = id => {
      console.log('Sending message to customer:', id);
      customerActionsOpen.value = false;
    };

    const flagCustomer = id => {
      console.log('Flagging customer for review:', id);
      customerActionsOpen.value = false;
    };

    const exportData = async () => {
      try {
        loading.value = true;
        const response = await axios.post(
          'http://localhost:5000/reports/generate',
          {
            type: 'Segmentation',
            filters: {
              search: route.query.search,
              timeRange: route.query.timeRange,
            },
          },
          { timeout: 5000 }
        );
        window.open(response.data.file_url, '_blank');
      } catch (err) {
        console.error('Failed to generate report:', err);
        error.value = 'Failed to export data. Please try again.';
      } finally {
        loading.value = false;
      }
    };

    const viewAllActivities = () => {
      router.push('/activities');
    };

    // Chart initialization
    const engagementChart = ref(null);
    let chartInstance = null;

    const initChart = async () => {
      if (chartInstance) {
        chartInstance.destroy();
        chartInstance = null;
      }

      await nextTick();

      if (!engagementChart.value) {
        console.error('Failed to initialize chart: Canvas element not found.');
        return;
      }

      try {
        const ctx = engagementChart.value.getContext('2d');
        if (!ctx) {
          console.error('Failed to initialize chart context.');
          return;
        }

        const today = new Date();
        let labels = [];
        let data = [];

        switch (activeChartPeriod.value) {
          case '7d':
            for (let i = 6; i >= 0; i--) {
              const date = subDays(today, i);
              labels.push(format(date, 'MMM d'));
              data.push(Math.round(30 + Math.random() * 50));
            }
            break;
          case '30d':
            for (let i = 3; i >= 0; i--) {
              const weekEnd = subWeeks(today, i);
              const weekStart = startOfWeek(weekEnd, { weekStartsOn: 1 });
              labels.push(`Week of ${format(weekStart, 'MMM d')}`);
              data.push(Math.round(200 + Math.random() * 300));
            }
            break;
          case '90d':
            for (let i = 2; i >= 0; i--) {
              const month = subMonths(today, i);
              labels.push(format(month, 'MMM yyyy'));
              data.push(Math.round(600 + Math.random() * 400));
            }
            break;
          case '1y':
            for (let i = 11; i >= 0; i--) {
              const month = subMonths(today, i);
              labels.push(format(month, 'MMM yyyy'));
              data.push(Math.round(2000 + Math.random() * 1000));
            }
            break;
        }

        chartInstance = new Chart(ctx, {
          type: 'line',
          data: {
            labels,
            datasets: [
              {
                label: 'Churn Risk (%)',
                data,
                borderColor: route.query.darkMode ? '#60a5fa' : '#3b82f6',
                backgroundColor: route.query.darkMode ? 'rgba(96, 165, 250, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                fill: true,
                tension: 0.4,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: true,
                labels: {
                  color: route.query.darkMode ? '#e5e7eb' : '#1f2937',
                },
              },
            },
            scales: {
              x: {
                ticks: {
                  color: route.query.darkMode ? '#e5e7eb' : '#1f2937',
                },
                grid: {
                  color: route.query.darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                },
              },
              y: {
                beginAtZero: true,
                ticks: {
                  color: route.query.darkMode ? '#e5e7eb' : '#1f2937',
                },
                grid: {
                  color: route.query.darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                },
              },
            },
          },
        });
      } catch (err) {
        console.error('Failed to initialize chart:', err);
      }
    };

    // Lifecycle hooks
    onMounted(() => {
      fetchData();
      initChart();
    });

    onUnmounted(() => {
      if (chartInstance) {
        chartInstance.destroy();
      }
    });

    // Watchers
    watch(() => route.query.search, () => {
      pagination.currentPage = 1;
      updatePagination();
    });

    watch(filteredCustomers, () => {
      updatePagination();
    });

    return {
      loading,
      error,
      sortBy,
      sortOrder,
      activeChartPeriod,
      customerActionsOpen,
      selectedCustomerId,
      customerActionsPosition,
      stats,
      chartPeriods,
      recentActivities,
      tableColumns,
      customers,
      pagination,
      engagementChart,
      filteredCustomers,
      paginatedCustomers,
      visiblePages,
      SvgIcons,
      fetchData,
      updateStats,
      loadMockData,
      showCustomerActions,
      formatCurrency,
      formatDate,
      getInitials,
      stringToColor,
      getEngagementClass,
      sortTable,
      updatePagination,
      prevPage,
      nextPage,
      goToPage,
      setChartPeriod,
      viewCustomer,
      editCustomer,
      sendMessage,
      flagCustomer,
      exportData,
      viewAllActivities,
    };
  },
};
</script>

<style scoped lang="scss">
/* SCSS for ProfessionalDashboard.vue - Optimized for All Device Sizes */
$primary: #3b82f6;
$primary-dark: #60a5fa;
$background: #f9fafb;
$background-dark: #1f2937;
$text: #1f2937;
$text-dark: #e5e7eb;
$border: #e5e7eb;
$border-dark: #374151;
$success: #22c55e;
$warning: #f59e0b;
$danger: #ef4444;
$muted: #6b7280;
$muted-dark: #9ca3af;

/* Base Styles */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

/* Main Container */
.dashboard-container {
  width: 100%;
  max-width: 100vw;
  overflow-x: hidden;
  padding: 0 0.5rem; /* Reduced padding for smaller screens */
  margin: 0 auto;
}

/* SVG Icon Styles */
.stat-icon > span,
.activity-icon > span,
.icon-btn > span,
.sort-icon {
  display: inline-block;
  width: 20px; /* Slightly smaller for better fit */
  height: 20px;
  vertical-align: middle;
  color: inherit;
}

/* Stats Section */
.stats-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); /* Adjusted for smaller screens */
  gap: 0.75rem; /* Reduced gap */
  margin-bottom: 1rem;
  width: 100%;
  max-width: 1400px; /* Slightly larger max-width for big screens */
  margin-left: auto;
  margin-right: auto;

  .stat-card {
    background-color: white;
    border-radius: 6px;
    padding: 0.75rem; /* Reduced padding */
    display: flex;
    align-items: center;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    min-width: 0;

    .dark-mode & {
      background-color: $background-dark;
      border: 1px solid $border-dark;
    }

    .stat-content {
      flex-grow: 1;
      min-width: 0;

      .stat-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.25rem;

        h3 {
          font-size: 0.875rem; /* Smaller font for better fit */
          font-weight: 600;
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .stat-trend {
          display: flex;
          align-items: center;
          gap: 0.2rem;
          font-size: 0.75rem; /* Smaller for responsiveness */
          flex-shrink: 0;

          &.positive {
            color: $success;
          }

          &.negative {
            color: $danger;
          }
        }
      }

      .stat-value {
        font-size: 1.25rem; /* Slightly smaller */
        font-weight: 600;
        margin-bottom: 0.25rem;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .stat-description {
        font-size: 0.75rem;
        color: $muted;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;

        .dark-mode & {
          color: $muted-dark;
        }
      }
    }

    .stat-icon {
      margin-left: 0.5rem;
      color: $primary;
      flex-shrink: 0;

      .dark-mode & {
        color: $primary-dark;
      }
    }
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
}

/* Chart Section */
.chart-section {
  background-color: white;
  border-radius: 6px;
  padding: 0.75rem;
  margin-bottom: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  width: 100%;
  max-width: 1400px;
  margin-left: auto;
  margin-right: auto;

  .dark-mode & {
    background-color: $background-dark;
    border: 1px solid $border-dark;
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
    flex-wrap: wrap;
    gap: 0.5rem;

    h2 {
      font-size: 1.125rem;
      font-weight: 600;
      margin: 0;
    }

    .chart-actions {
      display: flex;
      gap: 0.25rem;
      flex-wrap: wrap;

      button {
        background: none;
        border: 1px solid $border;
        border-radius: 6px;
        padding: 0.4rem 0.75rem;
        cursor: pointer;
        font-size: 0.75rem;
        color: $text;
        white-space: nowrap;

        .dark-mode & {
          border-color: $border-dark;
          color: $text-dark;
        }

        &.active,
        &:hover {
          background-color: $primary;
          border-color: $primary;
          color: white;

          .dark-mode & {
            background-color: $primary-dark;
            border-color: $primary-dark;
          }
        }
      }
    }
  }

  .chart-container {
    height: 250px; /* Reduced height for smaller screens */
    width: 100%;
    min-width: 0;
  }

  @media (max-width: 640px) {
    .chart-container {
      height: 200px;
    }
  }
}

/* Activity Section */
.activity-section {
  background-color: white;
  border-radius: 6px;
  padding: 0.75rem;
  margin-bottom: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  width: 100%;
  max-width: 1400px;
  margin-left: auto;
  margin-right: auto;

  .dark-mode & {
    background-color: $background-dark;
    border: 1px solid $border-dark;
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
    flex-wrap: wrap;
    gap: 0.5rem;

    h2 {
      font-size: 1.125rem;
      font-weight: 600;
      margin: 0;
    }

    .view-all {
      background: none;
      border: none;
      color: $primary;
      cursor: pointer;
      font-size: 0.75rem;
      white-space: nowrap;

      .dark-mode & {
        color: $primary-dark;
      }

      &:hover {
        text-decoration: underline;
      }
    }
  }

  .activity-list {
    list-style: none;
    padding: 0;
    margin: 0;

    .activity-item {
      display: flex;
      align-items: flex-start;
      padding: 0.4rem 0;

      .activity-icon {
        margin-right: 0.4rem;
        flex-shrink: 0;

        &.purchase {
          color: $success;
        }

        &.segment {
          color: $primary;
        }

        &.alert {
          color: $danger;
        }
      }

      .activity-details {
        flex-grow: 1;
        min-width: 0;

        .activity-message {
          margin: 0;
          font-size: 0.75rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .activity-time {
          font-size: 0.675rem;
          color: $muted;

          .dark-mode & {
            color: $muted-dark;
          }
        }
      }
    }
  }
}

/* Customer Section */
.customer-section {
  background-color: white;
  border-radius: 6px;
  padding: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  width: 100%;
  max-width: 1400px;
  margin-left: auto;
  margin-right: auto;

  .dark-mode & {
    background-color: $background-dark;
    border: 1px solid $border-dark;
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
    flex-wrap: wrap;
    gap: 0.5rem;

    h2 {
      font-size: 1.125rem;
      font-weight: 600;
      margin: 0;
    }

    .table-controls {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-wrap: wrap;

      .export-btn {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        background-color: $primary;
        color: white;
        border: none;
        border-radius: 6px;
        padding: 0.4rem 0.75rem;
        cursor: pointer;
        font-size: 0.75rem;
        white-space: nowrap;

        .dark-mode & {
          background-color: $primary-dark;
        }

        &:hover {
          background-color: darken($primary, 10%);

          .dark-mode & {
            background-color: darken($primary-dark, 10%);
          }
        }
      }

      .records-count {
        font-size: 0.75rem;
        color: $muted;
        white-space: nowrap;

        .dark-mode & {
          color: $muted-dark;
        }
      }
    }
  }

  .table-wrapper {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    width: 100%;
    max-width: 100%;

    table {
      width: 100%;
      min-width: 600px; /* Adjusted for smaller screens */
      border-collapse: collapse;

      th {
        padding: 0.5rem;
        text-align: left;
        font-weight: 600;
        font-size: 0.75rem;
        color: $text;
        cursor: pointer;
        border-bottom: 1px solid $border;
        white-space: nowrap;

        .dark-mode & {
          color: $text-dark;
          border-bottom-color: $border-dark;
        }

        &.active {
          color: $primary;

          .dark-mode & {
            color: $primary-dark;
          }
        }

        .sort-icon {
          margin-left: 0.2rem;
        }

        &:hover {
          background-color: rgba($primary, 0.05);

          .dark-mode & {
            background-color: rgba($primary-dark, 0.05);
          }
        }

        &:focus {
          outline: 2px solid $primary;
          outline-offset: 2px;
        }
      }

      td {
        padding: 0.5rem;
        font-size: 0.75rem;
        border-bottom: 1px solid $border;
        white-space: nowrap;

        .dark-mode & {
          border-bottom-color: $border-dark;
        }
      }

      .customer-cell {
        display: flex;
        align-items: center;
        min-width: 150px; /* Adjusted for smaller screens */

        .customer-avatar {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
          font-size: 0.75rem;
          margin-right: 0.4rem;
          flex-shrink: 0;
        }

        .customer-info {
          min-width: 0;

          .name {
            font-weight: 600;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .id {
            font-size: 0.675rem;
            color: $muted;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;

            .dark-mode & {
              color: $muted-dark;
            }
          }
        }
      }

      .progress-cell {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        min-width: 120px;

        .progress-bar {
          width: 80px; /* Smaller for better fit */
          height: 6px;
          background-color: $border;
          border-radius: 3px;
          overflow: hidden;
          flex-shrink: 0;

          .dark-mode & {
            background-color: $border-dark;
          }

          .progress-fill {
            height: 100%;
            transition: width 0.3s ease;

            &.low {
              background-color: $success;
            }

            &.medium {
              background-color: $warning;
            }

            &.high {
              background-color: $danger;
            }
          }
        }
      }

      .action-buttons {
        display: flex;
        gap: 0.4rem;

        .icon-btn {
          background: none;
          border: none;
          cursor: pointer;
          padding: 0.2rem;
          color: $muted;

          .dark-mode & {
            color: $muted-dark;
          }

          &:hover {
            color: $primary;

            .dark-mode & {
              color: $primary-dark;
            }
          }
        }
      }

      .empty-table-message {
        text-align: center;
        padding: 1.5rem;
        color: $muted;

        .dark-mode & {
          color: $muted-dark;
        }
      }
    }
  }

.pagination-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.75rem;
  flex-wrap: wrap;
  gap: 0.5rem;

  .rows-per-page {
    display: flex;
    align-items: center;
    gap: 0.4rem;

    label {
      font-size: 0.75rem;
      color: $text;
      white-space: nowrap;
    }

    select {
      padding: 0.4rem;
      border: 1px solid $border;
      border-radius: 6px;
      background-color: white;
      color: $text;
      font-size: 0.75rem;
    }
  }

  .pagination-buttons {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    flex-wrap: wrap;

    .pagination-btn {
      background: none;
      border: 1px solid $border;
      border-radius: 6px;
      padding: 0.4rem;
      cursor: pointer;
      color: $text;
      min-width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;

      &:hover {
        background-color: $primary;
        border-color: $primary;
        color: white;
      }

      &:disabled {
        color: $muted;
        border-color: $border;
        cursor: not-allowed;
      }
    }

    .page-numbers {
      display: flex;
      gap: 0.2rem;
      flex-wrap: wrap;

      button {
        background: none;
        border: 1px solid $border;
        border-radius: 6px;
        padding: 0.4rem 0.75rem;
        cursor: pointer;
        font-size: 0.75rem;
        color: $text;
        min-width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;

        &.active,
        &:hover {
          background-color: $primary;
          border-color: $primary;
          color: white;
        }
      }
    }
  }
}

// Dark mode overrides
.dark-mode {
  .pagination-controls {
    .rows-per-page {
      label {
        color: $text-dark;
      }

      select {
        background-color: $background-dark;
        border-color: $border-dark;
        color: $text-dark;
      }
    }

    .pagination-buttons {
      .pagination-btn {
        border-color: $border-dark;
        color: $text-dark;

        &:hover {
          background-color: $primary-dark;
          border-color: $primary-dark;
        }

        &:disabled {
          color: $muted-dark;
          border-color: $border-dark;
        }
      }

      .page-numbers {
        button {
          border-color: $border-dark;
          color: $text-dark;

          &.active,
          &:hover {
            background-color: $primary-dark;
            border-color: $primary-dark;
          }
        }
      }
    }
  }
}
}
/* Customer Actions Dropdown */
.customer-actions-dropdown {
  position: absolute;
  background-color: white;
  border-radius: 6px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
  padding: 0.4rem;
  z-index: 10;
  width: 180px; /* Slightly smaller */
  max-width: calc(100vw - 1rem);

  .dark-mode & {
    background-color: $background-dark;
    border: 1px solid $border-dark;
  }

  .dropdown-item {
    display: flex;
    align-items: center;
    padding: 0.4rem;
    background: none;
    border: none;
    width: 100%;
    text-align: left;
    color: $text;
    cursor: pointer;
    font-size: 0.75rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    .dark-mode & {
      color: $text-dark;
    }

    &:hover {
      background-color: rgba($primary, 0.1);
      color: $primary;

      .dark-mode & {
        background-color: rgba($primary-dark, 0.1);
        color: $primary-dark;
      }
    }

    &.danger {
      color: $danger;

      &:hover {
        background-color: rgba($danger, 0.1);
      }
    }

    .dropdown-icon {
      margin-right: 0.4rem;
      flex-shrink: 0;
    }
  }

  .dropdown-divider {
    height: 1px;
    background-color: $border;
    margin: 0.4rem 0;

    .dark-mode & {
      background-color: $border-dark;
    }
  }
}

/* Responsive Adjustments */
@media (max-width: 1024px) {
  .stats-section,
  .chart-section,
  .activity-section,
  .customer-section {
    max-width: 100%;
    padding: 0.5rem;
  }
}

@media (max-width: 768px) {
  .dashboard-container {
    padding: 0 0.25rem;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .table-controls,
  .chart-actions,
  .pagination-controls {
    width: 100%;
    justify-content: flex-start;
  }

  .table-wrapper table {
    min-width: 500px; /* Further reduced for medium screens */
  }

  .customer-cell {
    min-width: 120px;
  }

  .progress-cell {
    min-width: 100px;
  }
}

@media (max-width: 640px) {
  .table-wrapper table {
    min-width: 400px; /* Minimum for small screens */
  }

  .customer-cell {
    min-width: 100px;
  }

  .progress-cell {
    min-width: 80px;
    .progress-bar {
      width: 60px;
    }
  }

  .customer-actions-dropdown {
    width: 160px;
  }
}
</style>