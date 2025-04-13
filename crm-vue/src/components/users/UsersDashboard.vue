<!-- UsersDashboard.vue -->
<template>
  <div class="dashboard-wrapper">
    <!-- Navigation Bar -->
    <nav class="navbar">
      <div class="navbar-left">
        <button class="sidebar-toggle" @click="toggleSidebar">
          <span class="material-icons">menu</span>
        </button>
        <h1 class="logo">Customer Insights</h1>
      </div>

      <div class="navbar-center">
        <div class="time-range-selector">
          <select v-model="timeRange" @change="fetchData">
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
          <span class="material-icons">arrow_drop_down</span>
        </div>
        <button class="refresh-btn" @click="fetchData" :disabled="loading">
          <span class="material-icons">refresh</span>
          <span>Refresh</span>
        </button>
      </div>

      <div class="navbar-right">
        <button class="icon-btn notification-btn" @click="toggleNotifications">
          <span class="material-icons">notifications</span>
          <span v-if="unreadNotifications > 0" class="badge">{{ unreadNotifications }}</span>
        </button>

        <div class="user-menu">
          <div class="user-avatar" @click="toggleDropdown">
            {{ userInitials }}
          </div>
          <div v-if="showDropdown" class="dropdown-menu">
            <div class="user-info">
              <div class="user-name">{{ user?.name || 'User' }}</div>
              <div class="user-email">{{ user?.email || 'user@example.com' }}</div>
            </div>
            <div class="dropdown-divider"></div>
            <button class="dropdown-item" @click="goToProfile">
              <span class="material-icons">person</span>
              Profile
            </button>
            <button class="dropdown-item" @click="goToSettings">
              <span class="material-icons">settings</span>
              Settings
            </button>
            <div class="dropdown-divider"></div>
            <button class="dropdown-item" @click="logout">
              <span class="material-icons">logout</span>
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- Sidebar -->
    <aside class="sidebar" :class="{ 'collapsed': !sidebarOpen }">
      <div class="sidebar-header">
        <h2>Navigation</h2>
        <button class="close-sidebar" @click="toggleSidebar">
          <span class="material-icons">close</span>
        </button>
      </div>

      <nav class="sidebar-nav">
        <router-link to="/users-dashboard" class="nav-item" @click="toggleSidebar">
          <span class="material-icons">dashboard</span>
          <span class="nav-text">Overview</span>
        </router-link>

        <router-link to="/clients" class="nav-item" @click="toggleSidebar">
          <span class="material-icons">people</span>
          <span class="nav-text">Clients</span>
        </router-link>

        <router-link to="/analytics" class="nav-item" @click="toggleSidebar">
          <span class="material-icons">insights</span>
          <span class="nav-text">Analytics</span>
        </router-link>

        <router-link to="/settings" class="nav-item" @click="toggleSidebar">
          <span class="material-icons">settings</span>
          <span class="nav-text">Settings</span>
        </router-link>
      </nav>

      <div class="sidebar-footer">
        <button class="logout-btn" @click="logout">
          <span class="material-icons">logout</span>
          <span>Sign Out</span>
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="dashboard-content" :class="{ 'content-expanded': !sidebarOpen }">
      <!-- Analytics Section -->
      <section class="analytics-section">
        <div class="analytics-card">
          <h3>Total Customers</h3>
          <p class="value">{{ stats ? formatNumber(stats.totalCustomers) : '0' }}</p>
          <p class="trend">+{{ stats?.customerTrend || 0 }}% from last period</p>
        </div>
        <div class="analytics-card">
          <h3>Total Revenue</h3>
          <p class="value">{{ stats ? formatCurrency(stats.totalRevenue) : '$0' }}</p>
          <p class="trend">+{{ stats?.revenueTrend || 0 }}% from last period</p>
        </div>
        <div class="analytics-card">
          <h3>Active Customers</h3>
          <p class="value">{{ stats ? formatNumber(stats.activeCustomers) : '0' }}</p>
          <p class="trend">+{{ stats?.activeTrend || 0 }}% from last period</p>
        </div>
        <div class="analytics-card">
          <h3>Churn Risk</h3>
          <p class="value">{{ stats ? stats.churnRiskPercentage : '0' }}%</p>
          <p class="trend">{{ stats?.churnTrend || 0 }}% from last period</p>
        </div>
      </section>

      <!-- Chart Section -->
      <section class="chart-section">
        <h2>Revenue Trends</h2>
        <div class="chart-container">
          <canvas ref="revenueChart"></canvas>
        </div>
      </section>

      <!-- Top Customers -->
      <section class="top-customers-section">
        <h2>Top Clients by Value</h2>
        <table v-if="topCustomers.length">
          <thead>
            <tr>
              <th>Name</th>
              <th>Lifetime Value</th>
              <th>Last Purchase</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="customer in topCustomers" :key="customer.id">
              <td>{{ customer.name }}</td>
              <td>{{ formatCurrency(customer.lifetimeValue) }}</td>
              <td>{{ formatDate(customer.lastPurchase) }}</td>
            </tr>
          </tbody>
        </table>
        <div v-else class="placeholder">No top clients found.</div>
      </section>

      <!-- Customer List -->
      <section class="customer-section">
        <div class="table-header">
          <h2>All Clients</h2>
          <div class="table-actions">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search by name or ID..."
              @input="debouncedFilter"
              aria-label="Search clients"
            />
            <button
              class="export-btn"
              @click="exportData"
              :disabled="loading || exportLoading"
              aria-label="Export client data"
            >
              <span class="material-icons">download</span>
              {{ exportLoading ? 'Exporting...' : 'Export' }}
            </button>
          </div>
        </div>
        <div class="table-container">
          <table v-if="paginatedCustomers.length">
            <thead>
              <tr>
                <th
                  @click="sortCustomers('name')"
                  :aria-sort="sortBy === 'name' ? sortOrder : 'none'"
                  role="columnheader"
                >
                  Name
                </th>
                <th
                  @click="sortCustomers('lifetimeValue')"
                  :aria-sort="sortBy === 'lifetimeValue' ? sortOrder : 'none'"
                  role="columnheader"
                >
                  Lifetime Value
                </th>
                <th
                  @click="sortCustomers('lastPurchase')"
                  :aria-sort="sortBy === 'lastPurchase' ? sortOrder : 'none'"
                  role="columnheader"
                >
                  Last Purchase
                </th>
                <th
                  @click="sortCustomers('churnRisk')"
                  :aria-sort="sortBy === 'churnRisk' ? sortOrder : 'none'"
                  role="columnheader"
                >
                  Churn Risk
                </th>
                <th aria-hidden="true">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="customer in paginatedCustomers" :key="customer.id">
                <td>
                  <div class="customer-info">
                    <span class="customer-name">{{ customer.name }}</span>
                    <span class="customer-id">ID: {{ customer.id }}</span>
                  </div>
                </td>
                <td>{{ formatCurrency(customer.lifetimeValue) }}</td>
                <td>{{ formatDate(customer.lastPurchase) }}</td>
                <td>{{ customer.churnRisk }}%</td>
                <td>
                  <button
                    class="action-btn"
                    @click="viewCustomer(customer.id)"
                    aria-label="View client details"
                  >
                    <span class="material-icons">visibility</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
          <div v-else class="placeholder">No clients found.</div>
        </div>
        <div class="table-footer" v-if="filteredCustomers.length">
          <span
            >Showing {{ pagination.start }} to {{ pagination.end }} of
            {{ filteredCustomers.length }}</span
          >
          <div class="pagination">
            <button
              @click="prevPage"
              :disabled="pagination.currentPage === 1"
              aria-label="Previous page"
            >
              Previous
            </button>
            <span>Page {{ pagination.currentPage }} of {{ pagination.totalPages }}</span>
            <button
              @click="nextPage"
              :disabled="pagination.currentPage === pagination.totalPages"
              aria-label="Next page"
            >
              Next
            </button>
          </div>
        </div>
      </section>
    </div>

    <!-- Loading Overlay -->
    <div v-if="loading" class="loading-overlay">
      <div class="spinner"></div>
      <p>Loading...</p>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="error-message">
      {{ error }}
      <button @click="fetchData" aria-label="Retry loading data">Retry</button>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { format, parseISO } from 'date-fns';
import axios from 'axios';
import { Chart, registerables } from 'chart.js';
import { debounce } from 'lodash';

Chart.register(...registerables);

export default {
  name: 'UsersDashboard',
  setup() {
    const router = useRouter();

    // State
    const loading = ref(false);
    const exportLoading = ref(false);
    const error = ref('');
    const timeRange = ref('30d');
    const searchQuery = ref('');
    const sortBy = ref('lastPurchase');
    const sortOrder = ref('desc');
    const stats = ref(null);
    const customers = ref([]);
    const pagination = ref({
      currentPage: 1,
      rowsPerPage: 10,
      totalPages: 1,
      start: 1,
      end: 10,
    });
    const revenueChart = ref(null);
    const user = ref(null);
    const unreadNotifications = ref(3); // Mocked; replace with API data
    const showDropdown = ref(false);
    const sidebarOpen = ref(true);
    let chartInstance = null;

    // Computed
    const filteredCustomers = computed(() => {
      let result = [...customers.value];
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        result = result.filter(
          (c) =>
            c.name.toLowerCase().includes(query) ||
            c.id.toString().includes(query)
        );
      }
      return result.sort((a, b) => {
        const valA = a[sortBy.value];
        const valB = b[sortBy.value];
        if (sortBy.value === 'lastPurchase') {
          const dateA = valA ? valA.getTime() : 0;
          const dateB = valB ? valB.getTime() : 0;
          return sortOrder.value === 'asc' ? dateA - dateB : dateB - dateA;
        }
        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortOrder.value === 'asc' ? valA - valB : valB - valA;
        }
        const strA = valA ? valA.toString().toLowerCase() : '';
        const strB = valB ? valB.toString().toLowerCase() : '';
        if (strA < strB) return sortOrder.value === 'asc' ? -1 : 1;
        if (strA > strB) return sortOrder.value === 'asc' ? 1 : -1;
        return 0;
      });
    });

    const paginatedCustomers = computed(() => {
      const start = (pagination.value.currentPage - 1) * pagination.value.rowsPerPage;
      const end = start + pagination.value.rowsPerPage;
      return filteredCustomers.value.slice(start, end);
    });

    const topCustomers = computed(() => {
      return [...customers.value]
        .sort((a, b) => b.lifetimeValue - a.lifetimeValue)
        .slice(0, 5);
    });

    // Authentication Check
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/user-login');
        return false;
      }
      return true;
    };

    // Methods
    const fetchData = async () => {
      if (!checkAuth()) return;
      loading.value = true;
      error.value = '';
      try {
        const [statsRes, customersRes, userRes] = await Promise.all([
          axios.get(`http://localhost:5000/api/dashboard/stats?range=${timeRange.value}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          }),
          axios.get(`http://localhost:5000/api/customers?range=${timeRange.value}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          }),
          axios.get(`http://localhost:5000/api/user`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          }),
        ]);
        stats.value = {
          ...statsRes.data,
          churnRiskPercentage: customersRes.data.length
            ? (
                customersRes.data.reduce((sum, c) => sum + c.churnRisk, 0) /
                customersRes.data.length
              ).toFixed(1)
            : 0,
          customerTrend: 5.2, // Mocked
          revenueTrend: 8.1,
          activeTrend: 3.4,
          churnTrend: -1.5,
        };
        customers.value = customersRes.data.map((c) => ({
          id: c.id,
          name: c.name,
          lifetimeValue: c.predictedValue,
          lastPurchase: c.nextPurchase ? parseISO(c.nextPurchase) : null,
          churnRisk: c.churnRisk,
        }));
        user.value = userRes.data; // { id, name, email, avatar }
        updatePagination();
        updateChart();
      } catch (err) {
        error.value = err.response
          ? `Server error: ${err.response.status}`
          : 'Network error. Please check your connection.';
        console.error('Fetch error:', err);
      } finally {
        loading.value = false;
      }
    };

    const formatNumber = (num) => new Intl.NumberFormat().format(num || 0);
    const formatCurrency = (amount) =>
      new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);
    const formatDate = (date) => (date ? format(new Date(date), 'MMM d, yyyy') : 'N/A');

    const sortCustomers = (column) => {
      if (sortBy.value === column) {
        sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
      } else {
        sortBy.value = column;
        sortOrder.value = 'desc';
      }
    };

    const debouncedFilter = debounce(() => {
      pagination.value.currentPage = 1;
      updatePagination();
    }, 300);

    const updatePagination = () => {
      const totalPages = Math.ceil(filteredCustomers.value.length / pagination.value.rowsPerPage);
      pagination.value.totalPages = totalPages || 1;
      pagination.value.start = filteredCustomers.value.length
        ? (pagination.value.currentPage - 1) * pagination.value.rowsPerPage + 1
        : 0;
      pagination.value.end = filteredCustomers.value.length
        ? Math.min(
            pagination.value.currentPage * pagination.value.rowsPerPage,
            filteredCustomers.value.length
          )
        : 0;
    };

    const nextPage = () => {
      if (pagination.value.currentPage < pagination.value.totalPages) {
        pagination.value.currentPage++;
        updatePagination();
      }
    };

    const prevPage = () => {
      if (pagination.value.currentPage > 1) {
        pagination.value.currentPage--;
        updatePagination();
      }
    };

    const viewCustomer = (id) => {
      console.log('View customer:', id); // Replace with router.push if needed
    };

    const exportData = async () => {
      exportLoading.value = true;
      try {
        const res = await axios.get(
          `http://localhost:5000/api/customers/export?range=${timeRange.value}`,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            responseType: 'blob',
          }
        );
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `customers-${timeRange.value}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      } catch (err) {
        error.value = 'Failed to export data.';
        console.error('Export error:', err);
      } finally {
        exportLoading.value = false;
      }
    };

    const updateChart = () => {
      if (!revenueChart.value || !stats.value) return;
      if (chartInstance) chartInstance.destroy();
      const ctx = revenueChart.value.getContext('2d');
      const labels = ['7d', '14d', '30d', '60d', '90d'].slice(0, timeRange.value === '7d' ? 1 : timeRange.value === '30d' ? 3 : 5);
      const data = labels.map((_, i) => stats.value.totalRevenue * (1 - i * 0.1));
      chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
          labels,
          datasets: [
            {
              label: 'Revenue ($)',
              data,
              backgroundColor: 'rgba(33, 150, 243, 0.5)',
              borderColor: 'rgba(33, 150, 243, 1)',
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
              title: { display: true, text: 'Revenue ($)' },
            },
            x: { title: { display: true, text: 'Time Period' } },
          },
        },
      });
    };

    const logout = async () => {
      try {
        await axios.post(
          'http://localhost:5000/api/logout',
          {},
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        );
      } catch (err) {
        console.error('Logout error:', err);
      } finally {
        localStorage.removeItem('token');
        router.push('/user-login');
      }
    };

    const toggleNotifications = () => {
      console.log('Show notifications'); // Replace with modal or route
    };

    const toggleDropdown = () => {
      showDropdown.value = !showDropdown.value;
    };

    const goToProfile = () => {
      showDropdown.value = false;
      router.push('/profile');
    };

    const goToSettings = () => {
      showDropdown.value = false;
      router.push('/settings');
    };

    const toggleSidebar = () => {
      sidebarOpen.value = !sidebarOpen.value;
    };

    watch(timeRange, () => {
      fetchData();
    });

    onMounted(() => {
      checkAuth();
      fetchData();
      document.addEventListener('click', closeDropdownOutside);
    });

    onUnmounted(() => {
      if (chartInstance) chartInstance.destroy();
      document.removeEventListener('click', closeDropdownOutside);
    });

    const closeDropdownOutside = (event) => {
      if (!event.target.closest('.avatar-container')) {
        showDropdown.value = false;
      }
    };

    return {
      loading,
      exportLoading,
      error,
      timeRange,
      searchQuery,
      sortBy,
      sortOrder,
      stats,
      customers,
      pagination,
      filteredCustomers,
      paginatedCustomers,
      topCustomers,
      revenueChart,
      user,
      unreadNotifications,
      showDropdown,
      sidebarOpen,
      fetchData,
      formatNumber,
      formatCurrency,
      formatDate,
      sortCustomers,
      debouncedFilter,
      nextPage,
      prevPage,
      viewCustomer,
      exportData,
      logout,
      toggleNotifications,
      toggleDropdown,
      goToProfile,
      goToSettings,
      toggleSidebar,
    };
  },
};
</script>

<style scoped>
/* Material Icons */
@import url('https://fonts.googleapis.com/icon?family=Material+Icons');

/* Base Styles */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', sans-serif;
}

.dashboard-wrapper {
  display: flex;
  min-height: 100vh;
  background-color: #f5f7fa;
}

/* Navbar Styles */
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 64px;
  background-color: #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  z-index: 100;
}

.navbar-left, .navbar-center, .navbar-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.logo {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a237e;
}

.sidebar-toggle {
  background: none;
  border: none;
  cursor: pointer;
  color: #5f6368;
  padding: 8px;
  border-radius: 50%;
  transition: background-color 0.3s;
}

.sidebar-toggle:hover {
  background-color: #f1f3f4;
}

.time-range-selector {
  position: relative;
  display: flex;
  align-items: center;
}

.time-range-selector select {
  appearance: none;
  padding: 8px 32px 8px 12px;
  border: 1px solid #dadce0;
  border-radius: 4px;
  font-size: 14px;
  background-color: white;
  cursor: pointer;
}

.time-range-selector .material-icons {
  position: absolute;
  right: 8px;
  pointer-events: none;
  color: #5f6368;
}

.refresh-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background-color: #1a73e8;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.refresh-btn:hover {
  background-color: #1765cc;
}

.refresh-btn:disabled {
  background-color: #9aa0a6;
  cursor: not-allowed;
}

.icon-btn {
  background: none;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #5f6368;
  position: relative;
  transition: background-color 0.3s;
}

.icon-btn:hover {
  background-color: #f1f3f4;
}

.notification-btn .badge {
  position: absolute;
  top: 4px;
  right: 4px;
  background-color: #d93025;
  color: white;
  font-size: 10px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #1a73e8;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  cursor: pointer;
  user-select: none;
}

.dropdown-menu {
  position: absolute;
  right: 0;
  top: 56px;
  width: 280px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  padding: 8px 0;
  z-index: 110;
}

.user-info {
  padding: 12px 16px;
}

.user-name {
  font-weight: 500;
  margin-bottom: 4px;
}

.user-email {
  font-size: 14px;
  color: #5f6368;
}

.dropdown-divider {
  height: 1px;
  background-color: #e0e0e0;
  margin: 8px 0;
}

.dropdown-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 10px 16px;
  background: none;
  border: none;
  text-align: left;
  font-size: 14px;
  color: #202124;
  cursor: pointer;
  transition: background-color 0.3s;
}

.dropdown-item:hover {
  background-color: #f1f3f4;
}

.dropdown-item .material-icons {
  font-size: 20px;
  color: #5f6368;
}

/* Sidebar Styles */
.sidebar {
  position: fixed;
  top: 64px;
  left: 0;
  bottom: 0;
  width: 280px;
  background-color: white;
  box-shadow: 1px 0 4px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  transition: transform 0.3s ease;
  z-index: 90;
}

.sidebar.collapsed {
  transform: translateX(-100%);
}

.sidebar-header {
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e0e0e0;
}

.sidebar-header h2 {
  font-size: 1rem;
  font-weight: 500;
  color: #202124;
}

.close-sidebar {
  background: none;
  border: none;
  color: #5f6368;
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  display: none;
}

.close-sidebar:hover {
  background-color: #f1f3f4;
}

.sidebar-nav {
  flex: 1;
  padding: 8px 0;
  overflow-y: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
  text-decoration: none;
  color: #202124;
  transition: background-color 0.3s;
}

.nav-item:hover {
  background-color: #f1f3f4;
}

.nav-item.router-link-active {
  background-color: #e8f0fe;
  color: #1a73e8;
}

.nav-item.router-link-active .material-icons {
  color: #1a73e8;
}

.nav-item .material-icons {
  font-size: 24px;
  color: #5f6368;
}

.nav-text {
  font-size: 14px;
}

.sidebar-footer {
  padding: 16px;
  border-top: 1px solid #e0e0e0;
}

.logout-btn {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 10px 16px;
  background: none;
  border: none;
  border-radius: 4px;
  color: #5f6368;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.logout-btn:hover {
  background-color: #f1f3f4;
}

/* Main Content Styles */
.main-content {
  flex: 1;
  margin-top: 64px;
  margin-left: 280px;
  padding: 24px;
  transition: margin-left 0.3s ease;
}

.main-content.expanded {
  margin-left: 0;
}

/* Responsive Styles */
@media (max-width: 992px) {
  .sidebar {
    transform: translateX(-100%);
    z-index: 100;
  }

  .sidebar.collapsed {
    transform: translateX(-100%);
  }

  .sidebar.open {
    transform: translateX(0);
  }

  .main-content {
    margin-left: 0;
  }

  .close-sidebar {
    display: block;
  }

  .navbar-center {
    display: none;
  }
}

@media (max-width: 768px) {
  .navbar {
    padding: 0 16px;
  }

  .logo {
    font-size: 1.1rem;
  }

  .main-content {
    padding: 16px;
  }
}
/* Dashboard Content */
.dashboard-content {
  flex: 1;
  padding: 2rem;
  margin-left: 250px;
  transition: margin-left 0.3s ease;
}

.content-expanded {
  margin-left: 0;
}

/* Analytics Section */
.analytics-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.analytics-card {
  background: #ffffff;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s;
}

.analytics-card:hover {
  transform: translateY(-2px);
}

.analytics-card h3 {
  font-size: 1rem;
  font-weight: 500;
  color: #718096;
  margin-bottom: 0.75rem;
}

.analytics-card .value {
  font-size: 1.8rem;
  font-weight: 600;
  color: #1a202c;
}

.analytics-card .trend {
  font-size: 0.85rem;
  color: #48bb78;
  margin-top: 0.5rem;
}

.analytics-card .trend.negative {
  color: #f56565;
}

/* Chart Section */
.chart-section {
  background: #ffffff;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  margin-bottom: 2rem;
}

.chart-section h2 {
  font-size: 1.2rem;
  font-weight: 600;
  color: #1a202c;
  margin-bottom: 1rem;
}

.chart-container {
  height: 300px;
}

/* Top Customers Section */
.top-customers-section {
  background: #ffffff;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  margin-bottom: 2rem;
}

.top-customers-section h2 {
  font-size: 1.2rem;
  font-weight: 600;
  color: #1a202c;
  margin-bottom: 1rem;
}

.top-customers-section table {
  width: 100%;
  border-collapse: collapse;
}

.top-customers-section th,
.top-customers-section td {
  padding: 0.75rem;
  text-align: left;
  font-size: 0.9rem;
  color: #4a5568;
}

.top-customers-section th {
  font-weight: 600;
  background: #f7fafc;
}

.top-customers-section td {
  border-bottom: 1px solid #edf2f7;
}

/* Customer Section */
.customer-section {
  background: #ffffff;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.table-header h2 {
  font-size: 1.2rem;
  font-weight: 600;
  color: #1a202c;
}

.table-actions {
  display: flex;
  gap: 1rem;
}

.table-actions input {
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.9rem;
  width: 200px;
}

.export-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #48bb78;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background 0.2s;
}

.export-btn:hover:not(:disabled) {
  background: #38a169;
}

.export-btn:disabled {
  background: #b0bec5;
  cursor: not-allowed;
}

.table-container {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  padding: 0.75rem;
  text-align: left;
  font-size: 0.9rem;
}

th {
  font-weight: 600;
  color: #1a202c;
  background: #f7fafc;
  cursor: pointer;
  transition: background 0.2s;
}

th:hover {
  background: #edf2f7;
}

td {
  border-bottom: 1px solid #edf2f7;
  color: #4a5568;
}

.customer-info {
  display: flex;
  flex-direction: column;
}

.customer-name {
  font-weight: 500;
  color: #1a202c;
}

.customer-id {
  font-size: 0.8rem;
  color: #718096;
}

.action-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #2196f3;
  transition: color 0.2s;
}

.action-btn:hover {
  color: #1e88e5;
}

/* Table Footer */
.table-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  font-size: 0.9rem;
  color: #718096;
}

.pagination {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.pagination button {
  padding: 0.5rem 1rem;
  background: #2196f3;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background 0.2s;
}

.pagination button:disabled {
  background: #b0bec5;
  cursor: not-allowed;
}

.pagination button:hover:not(:disabled) {
  background: #1e88e5;
}

/* Placeholder */
.placeholder {
  padding: 2rem;
  text-align: center;
  font-size: 0.9rem;
  color: #718096;
}

/* Loading Overlay */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.spinner {
  border: 4px solid #e2e8f0;
  border-top: 4px solid #2196f3;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loading-overlay p {
  color: #ffffff;
  font-size: 1rem;
  margin-top: 1rem;
}

/* Error Message */
.error-message {
  background: #fed7d7;
  color: #9b2c2c;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  margin: 1.5rem 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.error-message button {
  padding: 0.5rem 1rem;
  background: #e53e3e;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background 0.2s;
}

.error-message button:hover {
  background: #c53030;
}

/* Responsive Design */
@media (max-width: 768px) {
  .sidebar {
    width: 200px;
  }

  .dashboard-content {
    margin-left: 0;
  }

  .content-expanded {
    margin-left: 0;
  }

  .navbar-brand h1 {
    font-size: 1.2rem;
  }

  .navbar-actions {
    gap: 0.5rem;
  }

  .navbar-actions select,
  .refresh-btn {
    font-size: 0.8rem;
    padding: 0.4rem 0.8rem;
  }

  .analytics-section {
    grid-template-columns: 1fr;
  }
}
</style>