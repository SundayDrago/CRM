<template>
  <div class="dashboard-container">
    <!-- Mobile Menu Toggle Button -->
    <button
      v-if="isMobile"
      class="mobile-menu-toggle"
      @click="toggleSidebar"
      :aria-expanded="sidebarOpen"
      aria-label="Toggle sidebar menu"
    >
      <i class="material-icons">{{ sidebarOpen ? 'close' : 'menu' }}</i>
    </button>

    <!-- Sidebar Backdrop for Mobile -->
    <div
      v-if="sidebarOpen && isMobile"
      class="sidebar-backdrop"
      @click="toggleSidebar(false)"
      aria-hidden="true"
    ></div>

    <!-- Side Navigation -->
    <nav class="side-nav" :class="{ 'expanded': sidebarOpen }" aria-label="Main navigation">
      <div class="nav-header">
        <h1 class="logo">
          <span v-if="sidebarOpen || !isMobile">CustomerInsights</span>
          <span v-else>CI</span>
        </h1>
        <button
          class="nav-toggle"
          @click="toggleSidebar"
          aria-label="Toggle sidebar"
          :aria-expanded="sidebarOpen"
        >
          <i class="material-icons">{{ sidebarOpen ? 'chevron_left' : 'chevron_right' }}</i>
        </button>
      </div>

      <div class="nav-menu">
        <router-link
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="nav-item"
          active-class="active"
          @click="toggleSidebar(false)"
          aria-current="page"
        >
          <i class="material-icons">{{ item.icon }}</i>
          <span class="nav-text">{{ item.text }}</span>
          <span v-if="item.badge" class="nav-badge">{{ item.badge }}</span>
        </router-link>
      </div>

      <div class="nav-footer">
        <div class="user-profile">
          <div class="avatar" :style="{ backgroundImage: `url(${user.avatar})` }">
            <span v-if="!user.avatar">{{ userInitials }}</span>
          </div>
          <div class="user-info" v-if="sidebarOpen || !isMobile">
            <div class="name">{{ user.name }}</div>
            <div class="role">{{ user.role }}</div>
          </div>
        </div>
        <button class="logout-btn" @click="logout" aria-label="Sign out">
          <i class="material-icons">logout</i>
          <span v-if="sidebarOpen || !isMobile">Sign Out</span>
        </button>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="main-content" :class="{ 'sidebar-expanded': sidebarOpen && isMobile }">
      <!-- Top Bar -->
      <header class="top-bar">
        <div class="search-bar">
          <i class="material-icons">search</i>
          <input
            type="text"
            placeholder="Search customers, reports..."
            v-model="searchQuery"
            @input="handleSearch"
            aria-label="Search customers and reports"
          />
        </div>

        <div class="top-bar-actions">
          <button
            class="action-btn"
            @click="refreshData"
            :disabled="loading"
            aria-label="Refresh data"
          >
            <i class="material-icons">refresh</i>
            <span>Refresh</span>
          </button>

          <div class="time-filter">
            <select v-model="timeRange" @change="fetchData" aria-label="Select time range">
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
          </div>

          <button
            class="notification-btn"
            @click="toggleNotifications"
            aria-label="View notifications"
          >
            <i class="material-icons">notifications</i>
            <span v-if="unreadNotifications" class="badge">{{ unreadNotifications }}</span>
          </button>
        </div>
      </header>

      <!-- Dashboard Content -->
      <div class="content-wrapper">
        <!-- Stats Overview -->
        <section class="stats-section" aria-label="Key metrics">
          <div class="stat-card" v-for="stat in stats" :key="stat.title">
            <div class="stat-content">
              <div class="stat-header">
                <h3>{{ stat.title }}</h3>
                <div class="stat-trend" :class="stat.trend > 0 ? 'positive' : 'negative'">
                  <i class="material-icons">{{ stat.trend > 0 ? 'trending_up' : 'trending_down' }}</i>
                  {{ Math.abs(stat.trend) }}%
                </div>
              </div>
              <div class="stat-value">{{ stat.value }}</div>
              <div class="stat-description">{{ stat.description }}</div>
            </div>
            <div class="stat-icon">
              <i class="material-icons">{{ stat.icon }}</i>
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
                <i class="material-icons">{{ activity.icon }}</i>
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
                <i class="material-icons">download</i>
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
                    <i class="material-icons sort-icon">
                      {{ sortBy === column.key && sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward' }}
                    </i>
                  </th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="paginatedCustomers.length === 0">
                  <td :colspan="tableColumns.length + 1" style="text-align: center; padding: 1rem;">
                    No customers found.
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
                        <i class="material-icons">visibility</i>
                      </button>
                      <button
                        class="icon-btn"
                        @click="editCustomer(customer.id)"
                        aria-label="Edit customer"
                      >
                        <i class="material-icons">edit</i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="pagination-controls">
            <button
              class="pagination-btn"
              @click="prevPage"
              :disabled="pagination.currentPage === 1"
              aria-label="Previous page"
            >
              <i class="material-icons">chevron_left</i>
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
              <i class="material-icons">chevron_right</i>
            </button>
          </div>
        </section>
      </div>
    </main>

    <!-- Loading Overlay -->
    <div v-if="loading" class="loading-overlay" role="status" aria-live="polite">
      <div class="spinner"></div>
      <p>Loading data...</p>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { Chart, registerables } from 'chart.js';
import { format, subDays, subWeeks, subMonths, startOfWeek, parseISO } from 'date-fns';
import { debounce } from 'lodash';
import axios from 'axios';

export default {
  name: 'DashboardRedesign',
  setup() {
    Chart.register(...registerables);

    const router = useRouter();

    // State
    const sidebarOpen = ref(false);
    const isMobile = ref(window.innerWidth < 1024);
    const loading = ref(false);
    const error = ref(null);
    const searchQuery = ref('');
    const timeRange = ref('30d');
    const unreadNotifications = ref(3);
    const sortBy = ref('predictedValue');
    const sortOrder = ref('desc');
    const activeChartPeriod = ref('30d');
    let pollInterval = null;

    // User data
    const user = ref({
      name: 'Geri Sun',
      role: 'Advisor',
      avatar: '',
    });

    // Navigation items
    const navItems = ref([
      { path: '/dashboard', text: 'Overview', icon: 'dashboard', badge: 0 },
      { path: '/customers', text: 'Customers', icon: 'people', badge: 0 },
      { path: '/segments', text: 'Segments', icon: 'category', badge: 2 },
      { path: '/analytics', text: 'Analytics', icon: 'insights', badge: 0 },
      { path: '/reports', text: 'Reports', icon: 'description', badge: 1 },
      { path: '/settings', text: 'Settings', icon: 'settings', badge: 0 },
    ]);

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
        icon: 'attach_money',
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
        icon: 'shopping_cart',
        message: 'New purchase recorded',
        time: '2 min ago',
      },
      {
        id: 2,
        type: 'segment',
        icon: 'category',
        message: 'Segment updated',
        time: '15 min ago',
      },
      {
        id: 3,
        type: 'alert',
        icon: 'notifications',
        message: 'High churn risk detected',
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

    // Pagination
    const pagination = ref({
      currentPage: 1,
      itemsPerPage: 5,
      totalItems: 0,
      start: 1,
      end: 5,
      totalPages: 1,
    });

    // Computed properties
    const userInitials = computed(() => {
      const names = user.value.name.split(' ');
      return names.map(name => name[0]).join('').toUpperCase();
    });

    const filteredCustomers = computed(() => {
      let result = [...customers.value];
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
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
      const start = (pagination.value.currentPage - 1) * pagination.value.itemsPerPage;
      const end = start + pagination.value.itemsPerPage;
      return filteredCustomers.value.slice(start, end);
    });

    const visiblePages = computed(() => {
      const pages = [];
      const maxVisible = 5;
      let start = Math.max(1, pagination.value.currentPage - Math.floor(maxVisible / 2));
      let end = Math.min(pagination.value.totalPages, start + maxVisible - 1);
      if (end - start + 1 < maxVisible) {
        start = Math.max(1, end - maxVisible + 1);
      }
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      return pages;
    });

    // Methods
    const toggleSidebar = (state = null) => {
      console.log('Toggling sidebar, current state:', sidebarOpen.value, 'new state:', state);
      sidebarOpen.value = state !== null ? state : !sidebarOpen.value;
      console.log('Sidebar state after toggle:', sidebarOpen.value);
    };

 const fetchData = async () => {
  if (loading.value) return;
  loading.value = true;
  error.value = null;

  let response;
  let keyMetrics = [];
  let customerPredictions = [];

  try {
    response = await axios.get("http://127.0.0.1:5000/dashboard", { timeout: 5000 });
    keyMetrics = response.data.keyMetrics || [];
    customerPredictions = response.data.customerPredictions || [];

    if (!Array.isArray(customerPredictions) || customerPredictions.length === 0) {
      console.warn('No customers found. Try adding customers via the admin dashboard.');
    }

    customers.value = customerPredictions.map(customer => ({
      id: customer.id || Math.random().toString(36).substr(2, 9),
      name: customer.name || 'Unknown',
      segment: customer.segment || 'N/A',
      predictedValue: Number(customer.predictedValue) || 0,
      nextPurchase: customer.nextPurchase || '',
      churnRisk: Number(customer.churnRisk) || 0,
    }));

    const totalCustomers = customers.value.length;
    const churnRiskCount = customers.value.filter(c => c.churnRisk >= 50).length;
    const avgPredictedValue =
      totalCustomers > 0
        ? customers.value.reduce((sum, c) => sum + c.predictedValue, 0) / totalCustomers
        : 0;

    stats.value = [
      {
        title: 'Total Customers',
        value: totalCustomers.toLocaleString(),
        trend: keyMetrics?.[0]?.trend || 0,
        description: 'From last period',
        icon: 'group',
      },
      {
        title: 'Avg. Value',
        value: `UGX ${Math.round(avgPredictedValue).toLocaleString()}`,
        trend: keyMetrics?.[2]?.trend || 0,
        description: 'Per customer',
        icon: 'attach_money',
      },
      {
        title: 'Churn Risk',
        value: totalCustomers > 0 ? `${((churnRiskCount / totalCustomers) * 100).toFixed(1)}%` : '0.0%',
        trend: keyMetrics?.[1]?.trend || 0,
        description: 'At risk customers',
        icon: 'warning',
      },
    ];
  } catch (err) {
    console.error(
      err.response
        ? `Failed to load data: ${err.response.status} ${err.response.statusText}`
        : 'Failed to connect to the backend. Please ensure the server is running.'
    );

    customers.value = [
      {
        id: 1000,
        name: 'Customer 1',
        segment: 'Middle-Aged High Spenders',
        predictedValue: 1500,
        nextPurchase: '2025-04-13',
        churnRisk: 10,
      },
      {
        id: 1001,
        name: 'Customer',
        segment: 'Young, Moderate-Income Shoppers',
        predictedValue: 500,
        nextPurchase: '2025-05-05',
        churnRisk: 10,
      },
    ];
    updateStatsForMockData();
  } finally {
    loading.value = false;
    updatePagination();
  }
};


    const updateStatsForMockData = () => {
      const totalCustomers = customers.value.length;
      const churnRiskCount = customers.value.filter(c => c.churnRisk >= 50).length;
      const avgPredictedValue =
        totalCustomers > 0
          ? customers.value.reduce((sum, c) => sum + c.predictedValue, 0) / totalCustomers
          : 0;

      stats.value = [
        {
          title: 'Total Customers',
          value: totalCustomers.toLocaleString(),
          trend: 8.2,
          description: 'From last period',
          icon: 'group',
        },
        {
          title: 'Avg. Value',
          value: `UGX ${Math.round(avgPredictedValue).toLocaleString()}`,
          trend: 5.5,
          description: 'Per customer',
          icon: 'attach_money',
        },
        {
          title: 'Churn Risk',
          value: totalCustomers > 0 ? `${((churnRiskCount / totalCustomers) * 100).toFixed(1)}%` : '0.0%',
          trend: -1.2,
          description: 'At risk customers',
          icon: 'warning',
        },
      ];
    };

    const startPolling = () => {
      if (pollInterval) return;
      pollInterval = setInterval(fetchData, 10000);
    };

    const stopPolling = () => {
      if (pollInterval) {
        clearInterval(pollInterval);
        pollInterval = null;
      }
    };

    const handleSearch = debounce(() => {
      pagination.value.currentPage = 1;
      updatePagination();
    }, 300);

    const refreshData = () => {
      fetchData();
    };

    const toggleNotifications = () => {
      unreadNotifications.value = 0;
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
      pagination.value.totalItems = filteredCustomers.value.length;
      pagination.value.totalPages = Math.ceil(
        pagination.value.totalItems / pagination.value.itemsPerPage
      ) || 1;
      pagination.value.currentPage = Math.min(
        pagination.value.currentPage,
        pagination.value.totalPages
      );
      pagination.value.start = (pagination.value.currentPage - 1) * pagination.value.itemsPerPage + 1;
      pagination.value.end = Math.min(
        pagination.value.currentPage * pagination.value.itemsPerPage,
        pagination.value.totalItems
      );
    };

    const prevPage = () => {
      if (pagination.value.currentPage > 1) {
        pagination.value.currentPage--;
        updatePagination();
      }
    };

    const nextPage = () => {
      if (pagination.value.currentPage < pagination.value.totalPages) {
        pagination.value.currentPage++;
        updatePagination();
      }
    };

    const goToPage = page => {
      pagination.value.currentPage = page;
      updatePagination();
    };

    const setChartPeriod = period => {
      activeChartPeriod.value = period;
      initChart();
    };

    const viewCustomer = id => {
      router.push(`/customers/${id}`);
    };

    const editCustomer = id => {
      console.log('Editing customer:', id);
    };

    const exportData = async () => {
      try {
        const response = await axios.post('http://localhost:5000/reports/generate', {
          type: 'Segmentation',
        });
        window.open(response.data.file_url, '_blank');
      } catch (err) {
        console.error('Failed to generate report:', err);
      }
    };

    const viewAllActivities = () => {
      router.push('/activities');
    };

    const logout = () => {
      stopPolling();
      router.push('/user-login');
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

        const today = new Date(2025, 3, 18);
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
              labels.push(`${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d')}`);
              data.push(Math.round(40 + Math.random() * 40));
            }
            break;
          case '90d':
            for (let i = 2; i >= 0; i--) {
              const date = subMonths(today, i);
              labels.push(format(date, 'MMM'));
              data.push(Math.round(50 + Math.random() * 30));
            }
            break;
          case '1y':
            for (let i = 11; i >= 0; i--) {
              const date = subMonths(today, i);
              labels.push(format(date, 'MMM yyyy'));
              data.push(Math.round(20 + Math.random() * 60));
            }
            break;
          default:
            labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
            data = [65, 59, 80, 81, 56, 72];
        }

        chartInstance = new Chart(ctx, {
          type: 'line',
          data: {
            labels,
            datasets: [
              {
                label: 'Churn Risk',
                data,
                borderColor: '#4f46e5',
                backgroundColor: 'rgba(79, 70, 229, 0.1)',
                borderWidth: 2,
                tension: 0.3,
                fill: true,
                pointBackgroundColor: '#4f46e5',
                pointRadius: 4,
                pointHoverRadius: 6,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
              y: {
                beginAtZero: true,
                max: 100,
                grid: { drawBorder: false, color: 'rgba(0, 0, 0, 0.05)' },
                ticks: { callback: value => `${value}%` },
              },
              x: { grid: { display: false } },
            },
          },
        });
      } catch (err) {
        console.error('Failed to render chart:', err);
      }
    };

    // Lifecycle hooks
    onMounted(async () => {
      searchQuery.value = '';
      await fetchData();
      await initChart();
      startPolling();

      const handleResize = () => {
        isMobile.value = window.innerWidth < 1024;
        if (!isMobile.value) {
          sidebarOpen.value = true;
        } else {
          sidebarOpen.value = false;
        }
      };
      window.addEventListener('resize', handleResize);
      handleResize();
      onUnmounted(() => window.removeEventListener('resize', handleResize));
    });

    onUnmounted(() => {
      stopPolling();
      if (chartInstance) {
        chartInstance.destroy();
        chartInstance = null;
      }
    });

    watch(filteredCustomers, updatePagination, { deep: true });
    watch(searchQuery, handleSearch);

    return {
      sidebarOpen,
      isMobile,
      loading,
      error,
      searchQuery,
      timeRange,
      unreadNotifications,
      sortBy,
      sortOrder,
      activeChartPeriod,
      user,
      navItems,
      stats,
      chartPeriods,
      recentActivities,
      tableColumns,
      customers,
      pagination,
      engagementChart,
      userInitials,
      filteredCustomers,
      paginatedCustomers,
      visiblePages,
      toggleSidebar,
      fetchData,
      handleSearch,
      refreshData,
      toggleNotifications,
      formatCurrency,
      formatDate,
      getInitials,
      stringToColor,
      getEngagementClass,
      sortTable,
      prevPage,
      nextPage,
      goToPage,
      setChartPeriod,
      viewCustomer,
      editCustomer,
      exportData,
      viewAllActivities,
      logout,
    };
  },
};
</script>

<style scoped>
/* Font Imports */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
@import url('https://fonts.googleapis.com/icon?family=Material+Icons');

/* CSS Variables */
:root {
  --primary: #4f46e5;
  --primary-light: #6366f1;
  --primary-dark: #4338ca;
  --secondary: #10b981;
  --danger: #ef4444;
  --warning: #f59e0b;
  --text-primary: #111827;
  --text-secondary: #6b7280;
  --text-tertiary: #9ca3af;
  --bg-primary: #ffffff;
  --bg-secondary: #f9fafb;
  --bg-tertiary: #f3f4f6;
  --border-light: #e5e7eb;
  --border-dark: #d1d5db;
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Reset and Base Styles */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Inter', sans-serif;
  color: var(--text-primary);
  background-color: var(--bg-secondary);
  line-height: 1.5;
}

/* Dashboard Layout */
.dashboard-container {
  display: flex;
  min-height: 100vh;
  position: relative;
}

/* Mobile Menu Toggle Button */
.mobile-menu-toggle {
  position: fixed;
  top: 1rem;
  left: 1rem;
  z-index: 1000;
  width: 40px;
  height: 40px;
  background-color: var(--bg-primary);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: var(--transition);
}

.mobile-menu-toggle:hover,
.mobile-menu-toggle:focus {
  background-color: var(--bg-tertiary);
  outline: none;
}

.mobile-menu-toggle .material-icons {
  font-size: 1.5rem;
  color: var(--text-secondary);
}

/* Sidebar Backdrop */
.sidebar-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 998;
  cursor: pointer;
  transition: opacity 0.3s ease;
}

/* Side Navigation */
.side-nav {
  width: 260px;
  height: 100vh;
  background-color: #ffffff;
  border-right: 1px solid var(--border-light);
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 999;
  transition: transform 0.3s ease;
}

.side-nav.expanded {
  transform: translateX(0);
}

.nav-header {
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--border-light);
}

.logo {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.nav-toggle {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-tertiary);
  color: var(--text-secondary);
  border: none;
  cursor: pointer;
  transition: var(--transition);
}

.nav-toggle:hover,
.nav-toggle:focus {
  background-color: var(--border-light);
  color: var(--text-primary);
  outline: none;
}

.nav-menu {
  flex: 1;
  padding: 0.5rem 0;
  overflow-y: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  margin: 0 0.5rem;
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  text-decoration: none;
  transition: var(--transition);
  white-space: nowrap;
}

.nav-item:hover,
.nav-item:focus {
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
  outline: none;
}

.nav-item.active {
  background-color: rgba(79, 70, 229, 0.1);
  color: var(--primary);
  font-weight: 500;
}

.nav-item .material-icons {
  font-size: 1.25rem;
  margin-right: 0.75rem;
  flex-shrink: 0;
}

.nav-text {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
}

.nav-badge {
  background-color: var(--primary);
  color: white;
  font-size: 0.6875rem;
  padding: 0.125rem 0.375rem;
  border-radius: 9999px;
  margin-left: 0.5rem;
}

.nav-footer {
  padding: 1rem;
  border-top: 1px solid var(--border-light);
}

.user-profile {
  display: flex;
  align-items: center;
  margin-bottom: 0.75rem;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: var(--bg-tertiary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
  color: var(--primary);
  background-size: cover;
  background-position: center;
  flex-shrink: 0;
}

.user-info {
  margin-left: 0.75rem;
  overflow: hidden;
}

.user-info .name {
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-info .role {
  font-size: 0.75rem;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.logout-btn {
  width: 100%;
  display: flex;
  align-items: center;
  padding: 0.5rem;
  border-radius: var(--radius-sm);
  background-color: rgba(239, 68, 68, 0.1);
  color: var(--danger);
  border: none;
  cursor: pointer;
  transition: var(--transition);
}

.logout-btn:hover,
.logout-btn:focus {
  background-color: rgba(239, 68, 68, 0.2);
  color: var(--danger);
  outline: none;
}

.logout-btn .material-icons {
  font-size: 1.25rem;
  margin-right: 0.75rem;
}

/* Main Content */
.main-content {
  flex: 1;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  margin-left: 0;
  width: 100%;
  transition: margin-left 0.3s ease, transform 0.3s ease;
  z-index: 10;
}

/* Top Bar */
.top-bar {
  position: sticky;
  top: 0;
  z-index: 50;
  background-color: #ffffff;
  border-bottom: 1px solid var(--border-light);
  padding: 0.75rem 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.75rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.search-bar {
  position: relative;
  flex: 1;
  min-width: 180px;
  max-width: 400px;
}

.search-bar .material-icons {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-tertiary);
  pointer-events: none;
}

.search-bar input {
  width: 100%;
  padding: 0.5rem 0.75rem 0.5rem 2.25rem;
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  background-color: var(--bg-secondary);
  font-size: 0.875rem;
  transition: var(--transition);
}

.search-bar input:focus {
  outline: none;
  border-color: var(--primary-light);
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.top-bar-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.action-btn,
.export-btn {
  display: flex;
  align-items: center;
  padding: 0.5rem 0.75rem;
  background-color: var(--bg-tertiary);
  border: none;
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
}

.action-btn:hover,
.action-btn:focus,
.export-btn:hover,
.export-btn:focus {
  background-color: var(--border-light);
  color: var(--text-primary);
  outline: none;
}

.action-btn .material-icons,
.export-btn .material-icons {
  font-size: 1.125rem;
  margin-right: 0.375rem;
}

.time-filter select {
  padding: 0.5rem 2rem 0.5rem 0.75rem;
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  background-color: var(--bg-secondary);
  font-size: 0.875rem;
  cursor: pointer;
  transition: var(--transition);
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.5rem center;
  background-size: 1rem;
  appearance: none;
}

.time-filter select:focus {
  outline: none;
  border-color: var(--primary-light);
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.notification-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: transparent;
  border: none;
  border-radius: 50%;
  color: var(--text-secondary);
  cursor: pointer;
  position: relative;
  transition: var(--transition);
}

.notification-btn:hover,
.notification-btn:focus {
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
  outline: none;
}

.notification-btn .badge {
  position: absolute;
  top: -0.25rem;
  right: -0.25rem;
  background-color: var(--danger);
  color: white;
  font-size: 0.625rem;
  width: 1.125rem;
  height: 1.125rem;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Content Wrapper */
.content-wrapper {
  padding: 1rem;
  flex: 1;
  overflow-y: auto;
}

/* Stats Section */
.stats-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.stat-card {
  background-color: var(--bg-primary);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  padding: 0.75rem;
  display: flex;
  gap: 0.75rem;
  transition: var(--transition);
}

.stat-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.stat-content {
  flex: 1;
  min-width: 0;
}

.stat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.stat-header h3 {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.stat-trend {
  font-size: 0.75rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  white-space: nowrap;
}

.stat-trend.positive { color: var(--secondary); }
.stat-trend.negative { color: var(--danger); }

.stat-trend .material-icons {
  font-size: 1rem;
  margin-right: 0.125rem;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.stat-description {
  font-size: 0.75rem;
  color: var(--text-tertiary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.stat-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: rgba(79, 70, 229, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary);
  flex-shrink: 0;
}

.stat-icon .material-icons {
  font-size: 1.25rem;
}

/* Section Styles */
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.section-header h2 {
  font-size: 1rem;
  font-weight: 600;
}

.view-all {
  font-size: 0.875rem;
  color: var(--primary);
  background: none;
  border: none;
  cursor: pointer;
  font-weight: 500;
  transition: var(--transition);
}

.view-all:hover,
.view-all:focus {
  color: var(--primary-dark);
  outline: none;
  text-decoration: underline;
}

/* Chart Section */
.chart-section {
  background-color: var(--bg-primary);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  padding: 0.75rem;
  margin-bottom: 0.75rem;
  transition: var(--transition);
}

.chart-section:hover {
  box-shadow: var(--shadow-md);
}

.chart-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.chart-actions button {
  padding: 0.375rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 500;
  background-color: var(--bg-tertiary);
  color: var(--text-secondary);
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: var(--transition);
}

.chart-actions button:hover,
.chart-actions button:focus {
  background-color: var(--border-light);
  color: var(--text-primary);
  outline: none;
}

.chart-actions button.active {
  background-color: var(--primary);
  color: white;
}

.chart-container {
  height: 240px;
  margin-top: 0.75rem;
  transition: height 0.3s ease;
}

/* Activity Section */
.activity-section {
  background-color: var(--bg-primary);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  padding: 0.75rem;
  margin-bottom: 0.75rem;
  transition: var(--transition);
}

.activity-section:hover {
  box-shadow: var(--shadow-md);
}

.activity-list {
  list-style: none;
}

.activity-item {
  display: flex;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--border-light);
  transition: var(--transition);
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 0.5rem;
  flex-shrink: 0;
  transition: var(--transition);
}

.activity-icon.purchase { background-color: rgba(16, 185, 129, 0.1); color: var(--secondary); }
.activity-icon.segment { background-color: rgba(79, 70, 229, 0.1); color: var(--primary); }
.activity-icon.alert { background-color: rgba(239, 68, 68, 0.1); color: var(--danger); }

.activity-details {
  flex: 1;
  min-width: 0;
}

.activity-message {
  font-size: 0.75rem;
  margin-bottom: 0.25rem;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.activity-time {
  font-size: 0.6875rem;
  color: var(--text-tertiary);
}

/* Customer Section */
.customer-section {
  background-color: var(--bg-primary);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  padding: 0.75rem;
  transition: var(--transition);
}

.customer-section:hover {
  box-shadow: var(--shadow-md);
}

.table-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.records-count {
  font-size: 0.75rem;
  color: var(--text-tertiary);
}

.table-wrapper {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  margin: 0 -0.75rem;
  padding: 0 0.75rem;
  width: calc(100% + 1.5rem);
}

table {
  width: 100%;
  border-collapse: collapse;
  min-width: 600px;
}

th {
  text-align: left;
  padding: 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  background-color: var(--bg-tertiary);
  position: sticky;
  top: 0;
  z-index: 10;
  cursor: pointer;
  white-space: nowrap;
}

th:focus {
  outline: 2px solid var(--primary);
  outline-offset: -2px;
}

th.active { color: var(--primary); }

th.asc .sort-icon,
th.desc .sort-icon { color: var(--primary); }

.sort-icon {
  font-size: 1rem;
  margin-left: 0.25rem;
  vertical-align: middle;
  opacity: 0;
  transition: var(--transition);
}

th:hover .sort-icon,
th.active .sort-icon { opacity: 1; }

td {
  padding: 0.5rem;
  font-size: 0.75rem;
  border-bottom: 1px solid var(--border-light);
  white-space: nowrap;
}

.customer-cell {
  display: flex;
  align-items: center;
}

.customer-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.6875rem;
  color: white;
  margin-right: 0.5rem;
  flex-shrink: 0;
}

.customer-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.customer-info .name {
  font-weight: 500;
  font-size: 0.875rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.customer-info .id {
  font-size: 0.6875rem;
  color: var(--text-tertiary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.progress-cell {
  display: flex;
  align-items: center;
}

.progress-bar {
  width: 60px;
  height: 6px;
  background-color: var(--bg-tertiary);
  border-radius: 3px;
  margin-right: 0.5rem;
  overflow: hidden;
  flex-shrink: 0;
}

.progress-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.5s ease;
}

.progress-fill.high { background-color: var(--danger); }
.progress-fill.medium { background-color: var(--warning); }
.progress-fill.low { background-color: var(--secondary); }

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.icon-btn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-tertiary);
  color: var(--text-secondary);
  border: none;
  cursor: pointer;
  transition: var(--transition);
}

.icon-btn:hover,
.icon-btn:focus {
  background-color: var(--border-light);
  color: var(--text-primary);
  outline: none;
}

.icon-btn .material-icons {
  font-size: 1rem;
}

/* Pagination */
.pagination-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 0.5rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.pagination-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-tertiary);
  border: none;
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  cursor: pointer;
  transition: var(--transition);
}

.pagination-btn:hover:not(:disabled),
.pagination-btn:focus:not(:disabled) {
  background-color: var(--border-light);
  color: var(--text-primary);
  outline: none;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  gap: 0.25rem;
  flex-wrap: wrap;
}

.page-numbers button {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: transparent;
  border: none;
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  font-size: 0.75rem;
  cursor: pointer;
  transition: var(--transition);
}

.page-numbers button:hover,
.page-numbers button:focus {
  background-color: var(--bg-tertiary);
  outline: none;
}

.page-numbers button.active {
  background-color: var(--primary);
  color: white;
}

/* Loading Overlay */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  transition: opacity 0.3s ease;
}

.loading-overlay p {
  margin-top: 0.5rem;
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--primary-light);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Responsive Design */
@media (min-width: 1024px) {
  .side-nav {
    transform: translateX(0);
  }

  .side-nav:not(.expanded) {
    width: 72px;
  }

  .main-content {
    margin-left: 260px;
    width: calc(100% - 260px);
  }

  .side-nav:not(.expanded) + .main-content {
    margin-left: 72px;
    width: calc(100% - 72px);
  }

  .sidebar-backdrop {
    display: none;
  }

  .mobile-menu-toggle {
    display: none;
  }

  .side-nav:not(.expanded) .nav-text,
  .side-nav:not(.expanded) .user-info,
  .side-nav:not(.expanded) .logout-btn span {
    display: none;
  }

  .side-nav:not(.expanded) .nav-item {
    justify-content: center;
    padding: 0.75rem;
  }

  .side-nav:not(.expanded) .nav-item .material-icons {
    margin-right: 0;
  }

  .side-nav:not(.expanded) .nav-badge {
    position: absolute;
    top: 0.25rem;
    right: 0.25rem;
    margin-left: 0;
  }

  .side-nav:not(.expanded) .logout-btn {
    justify-content: center;
  }
}

@media (max-width: 1023px) {
  .side-nav {
    transform: translateX(-100%);
    box-shadow: 4px 0 15px rgba(0, 0, 0, 0.1);
  }

  .side-nav.expanded {
    transform: translateX(0);
  }

  .main-content {
    margin-left: 0;
  }

  .main-content.sidebar-expanded {
    transform: translateX(260px);
    width: calc(100% - 260px);
  }

  .sidebar-backdrop {
    opacity: 0;
    pointer-events: none;
  }

  .sidebar-backdrop.active {
    opacity: 1;
    pointer-events: auto;
  }
}

@media (max-width: 768px) {
  .top-bar {
    padding: 0.5rem;
  }

  .content-wrapper {
    padding: 0.75rem;
  }

  .stats-section {
    grid-template-columns: 1fr;
  }

  .table-wrapper {
    margin: 0 -0.75rem;
    width: calc(100% + 1.5rem);
  }

  .chart-container {
    height: 200px;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .table-controls {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .export-btn {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .content-wrapper {
    padding: 0.5rem;
  }

  .top-bar {
    gap: 0.5rem;
    padding: 0.5rem;
  }

  .search-bar {
    min-width: 100%;
  }

  .search-bar input,
  .action-btn,
  .export-btn,
  .time-filter select {
    font-size: 0.75rem;
    padding: 0.375rem 0.5rem;
  }

  .search-bar .material-icons,
  .action-btn .material-icons,
  .export-btn .material-icons {
    font-size: 1rem;
  }

  .time-filter select {
    padding-right: 1.5rem;
    background-size: 0.875rem;
  }

  .notification-btn {
    width: 32px;
    height: 32px;
  }

  .notification-btn .badge {
    width: 1rem;
    height: 1rem;
    font-size: 0.5625rem;
  }

  .section-header h2 {
    font-size: 0.875rem;
  }

  .view-all {
    font-size: 0.75rem;
  }

  .stat-value {
    font-size: 1rem;
  }

  .stat-description,
  .stat-header h3 {
    font-size: 0.6875rem;
  }

  .stat-trend {
    font-size: 0.6875rem;
  }

  .stat-icon {
    width: 36px;
    height: 36px;
  }

  .stat-icon .material-icons {
    font-size: 1rem;
  }

  .activity-icon {
    width: 28px;
    height: 28px;
  }

  .activity-icon .material-icons {
    font-size: 0.875rem;
  }

  .records-count {
    font-size: 0.6875rem;
  }

  .loading-overlay p {
    font-size: 0.75rem;
  }

  .spinner {
    width: 36px;
    height: 36px;
    border-width: 2px;
  }

  .pagination-controls {
    flex-direction: column;
    align-items: stretch;
  }

  .page-numbers {
    justify-content: center;
  }
}
</style>