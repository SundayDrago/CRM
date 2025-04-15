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
          <div class="user-avatar" :style="{ backgroundImage: `url(${user?.avatar || defaultAvatar})` }" @click="toggleDropdown">
            <span v-if="!user?.avatar">{{ userInitials }}</span>
          </div>
          <div v-if="showDropdown" class="dropdown-menu">
            <div class="user-info">
              <div class="avatar-container">
                <input
                  type="file"
                  accept="image/*"
                  ref="avatarInput"
                  style="display: none"
                  @change="handleAvatarChange"
                />
                <img
                  :src="user?.avatar || defaultAvatar"
                  alt="User avatar"
                  class="profile-avatar"
                  @click="triggerAvatarUpload"
                />
                <button class="change-avatar-btn" @click="triggerAvatarUpload">
                  Change
                </button>
              </div>
              <div class="user-details">
                <div class="user-name">{{ user?.name || 'User' }}</div>
                <div class="user-email">{{ user?.email || 'user@example.com' }}</div>
              </div>
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
      <span>{{ error }}</span>
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
    const unreadNotifications = ref(3);
    const showDropdown = ref(false);
    const sidebarOpen = ref(true);
    const defaultAvatar = ref('https://via.placeholder.com/40');
    const avatarInput = ref(null);
    let chartInstance = null;

    // Computed
    const userInitials = computed(() => {
      if (!user.value?.name) return 'U';
      const names = user.value.name.split(' ');
      return names.length > 1
        ? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
        : names[0][0].toUpperCase();
    });

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
          customerTrend: 5.2,
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
        user.value = userRes.data;
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
      console.log('View customer:', id);
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
      console.log('Show notifications');
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
      router.push('/setting');
    };

    const toggleSidebar = () => {
      sidebarOpen.value = !sidebarOpen.value;
    };

    const triggerAvatarUpload = () => {
      avatarInput.value.click();
    };

    const handleAvatarChange = async (event) => {
      const file = event.target.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append('avatar', file);

      try {
        const res = await axios.post('http://localhost:5000/api/user/avatar', formData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'multipart/form-data',
          },
        });
        user.value.avatar = res.data.avatarUrl;
      } catch (err) {
        error.value = 'Failed to update avatar.';
        console.error('Avatar upload error:', err);
      }
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
      if (!event.target.closest('.user-menu')) {
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
      userInitials,
      unreadNotifications,
      showDropdown,
      sidebarOpen,
      defaultAvatar,
      avatarInput,
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
      triggerAvatarUpload,
      handleAvatarChange,
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
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background-color: #f8fafc;
}

.dashboard-wrapper {
  display: flex;
  min-height: 100vh;
}

/* Navbar Styles */
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  display: flex;
  align-items: center;
  padding: 0 1.5rem;
  z-index: 1000;
}

.navbar-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.navbar-center {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-grow: 1;
  justify-content: center;
}

.navbar-right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-left: auto;
}

.logo {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
  letter-spacing: -0.025em;
}

.sidebar-toggle {
  background: none;
  border: none;
  cursor: pointer;
  color: #475569;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.sidebar-toggle:hover {
  background-color: #f1f5f9;
  color: #1e293b;
}

.time-range-selector {
  position: relative;
  display: flex;
  align-items: center;
}

.time-range-selector select {
  appearance: none;
  padding: 0.5rem 2.5rem 0.5rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.875rem;
  background-color: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.time-range-selector select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.time-range-selector .material-icons {
  position: absolute;
  right: 0.75rem;
  color: #64748b;
  pointer-events: none;
}

.refresh-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.refresh-btn:hover {
  background-color: #2563eb;
}

.refresh-btn:disabled {
  background-color: #cbd5e1;
  cursor: not-allowed;
}

.icon-btn {
  background: none;
  border: none;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #475569;
  position: relative;
  transition: all 0.2s ease;
}

.icon-btn:hover {
  background-color: #f1f5f9;
  color: #1e293b;
}

.notification-btn .badge {
  position: absolute;
  top: -2px;
  right: -2px;
  background-color: #ef4444;
  color: white;
  font-size: 0.625rem;
  font-weight: 600;
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid white;
}

.user-menu {
  position: relative;
}

.user-avatar {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background-size: cover;
  background-position: center;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.75rem;
  cursor: pointer;
  user-select: none;
  background-color: #e5e7eb;
  border: 1px solid #d1d5db;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.user-avatar:hover {
  border-color: #1877f2;
  box-shadow: 0 0 0 2px #1877f2;
}

.dropdown-menu {
  position: absolute;
  right: 0;
  top: 2.5rem;
  width: 18rem;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  padding: 0.5rem 0;
  z-index: 1100;
  border: 1px solid #e2e8f0;
}

.user-info {
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.avatar-container {
  position: relative;
}

.profile-avatar {
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid #d1d5db;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.profile-avatar:hover {
  border-color: #1877f2;
  box-shadow: 0 0 0 2px #1877f2;
}

.change-avatar-btn {
  position: absolute;
  bottom: 0;
  right: 0;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.change-avatar-btn:hover {
  background-color: #2563eb;
}

.user-details {
  flex: 1;
}

.user-name {
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.25rem;
}

.user-email {
  font-size: 0.875rem;
  color: #64748b;
}

.dropdown-divider {
  height: 1px;
  background-color: #e2e8f0;
  margin: 0.5rem 0;
}

.dropdown-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: none;
  border: none;
  text-align: left;
  font-size: 0.875rem;
  color: #1e293b;
  cursor: pointer;
  transition: all 0.2s ease;
}

.dropdown-item:hover {
  background-color: #f8fafc;
}

.dropdown-item .material-icons {
  font-size: 1.25rem;
  color: #64748b;
}

/* Sidebar Styles */
.sidebar {
  position: fixed;
  top: 60px;
  left: 0;
  bottom: 0;
  width: 16rem;
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  transition: transform 0.3s ease;
  z-index: 900;
}

.sidebar.collapsed {
  transform: translateX(-100%);
}

.sidebar-header {
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e2e8f0;
}

.sidebar-header h2 {
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
}

.close-sidebar {
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.close-sidebar:hover {
  background-color: #f1f5f9;
  color: #1e293b;
}

.sidebar-nav {
  flex: 1;
  padding: 0.5rem 0;
  overflow-y: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  text-decoration: none;
  color: #1e293b;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.nav-item:hover {
  background-color: #f1f5f9;
}

.nav-item.router-link-active {
  background-color: #eff6ff;
  color: #3b82f6;
}

.nav-item.router-link-active .material-icons {
  color: #3b82f6;
}

.nav-item .material-icons {
  font-size: 1.5rem;
  color: #64748b;
}

.nav-text {
  font-size: 0.875rem;
}

.sidebar-footer {
  padding: 1rem;
  border-top: 1px solid #e2e8f0;
}

.logout-btn {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: none;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  color: #64748b;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.logout-btn:hover {
  background-color: #f1f5f9;
  color: #1e293b;
}

/* Dashboard Content */
.dashboard-content {
  flex: 1;
  padding: 5rem 2rem 2rem;
  margin-left: 16rem;
  transition: margin-left 0.3s ease;
}

.content-expanded {
  margin-left: 0;
}

/* Analytics Section */
.analytics-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.analytics-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
}

.analytics-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.08);
}

.analytics-card h3 {
  font-size: 0.875rem;
  font-weight: 500;
  color: #64748b;
  margin-bottom: 0.75rem;
}

.analytics-card .value {
  font-size: 1.875rem;
  font-weight: 700;
  color: #1e293b;
}

.analytics-card .trend {
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

.analytics-card .trend:not(.negative) {
  color: #10b981;
}

.analytics-card .trend.negative {
  color: #ef4444;
}

/* Chart Section */
.chart-section {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  margin-bottom: 2rem;
}

.chart-section h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 1rem;
}

.chart-container {
  height: 20rem;
}

/* Top Customers Section */
.top-customers-section {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  margin-bottom: 2rem;
}

.top-customers-section h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 1rem;
}

.top-customers-section table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

.top-customers-section th,
.top-customers-section td {
  padding: 0.75rem 1rem;
  text-align: left;
  font-size: 0.875rem;
  color: #475569;
}

.top-customers-section th {
  font-weight: 600;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.top-customers-section td {
  border-bottom: 1px solid #e2e8f0;
}

.top-customers-section tr:last-child td {
  border-bottom: none;
}

/* Customer Section */
.customer-section {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.table-header h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
}

.table-actions {
  display: flex;
  gap: 1rem;
}

.table-actions input {
  padding: 0.75rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.875rem;
  width: 16rem;
  transition: all 0.2s ease;
}

.table-actions input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.export-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.export-btn:hover:not(:disabled) {
  background: #059669;
}

.export-btn:disabled {
  background: #cbd5e1;
  cursor: not-allowed;
}

.table-container {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

th,
td {
  padding: 0.75rem 1rem;
  text-align: left;
  font-size: 0.875rem;
}

th {
  font-weight: 600;
  color: #1e293b;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  cursor: pointer;
  transition: all 0.2s ease;
}

th:hover {
  background: #f1f5f9;
}

td {
  border-bottom: 1px solid #e2e8f0;
  color: #475569;
}

tr:last-child td {
  border-bottom: none;
}

.customer-info {
  display: flex;
  flex-direction: column;
}

.customer-name {
  font-weight: 500;
  color: #1e293b;
}

.customer-id {
  font-size: 0.75rem;
  color: #64748b;
}

.action-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #3b82f6;
  transition: all 0.2s ease;
}

.action-btn:hover {
  color: #2563eb;
}

/* Table Footer */
.table-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  font-size: 0.875rem;
  color: #64748b;
}

.pagination {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.pagination button {
  padding: 0.5rem 1rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.pagination button:disabled {
  background: #cbd5e1;
  cursor: not-allowed;
}

.pagination button:hover:not(:disabled) {
  background: #2563eb;
}

.pagination span {
  font-weight: 500;
}

/* Placeholder */
.placeholder {
  padding: 2rem;
  text-align: center;
  font-size: 0.875rem;
  color: #64748b;
  background: #f8fafc;
  border-radius: 8px;
}

/* Loading Overlay */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(17, 24, 39, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.spinner {
  border: 4px solid #f1f5f9;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  width: 3rem;
  height: 3rem;
  animation: spin 0.8s linear infinite;
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
  color: white;
  font-size: 1rem;
  font-weight: 500;
  margin-top: 1rem;
}

/* Error Message */
.error-message {
  background: white;
  color: #b91c1c;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  margin: 1.5rem 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  border: 1px solid #fecaca;
}

.error-message button {
  padding: 0.5rem 1rem;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.error-message button:hover {
  background: #dc2626;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .sidebar {
    transform: translateX(-100%);
  }

  .sidebar.open {
    transform: translateX(0);
  }

  .dashboard-content {
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
    padding: 0 1rem;
  }

  .logo {
    font-size: 1.125rem;
  }

  .dashboard-content {
    padding: 4.5rem 1rem 1rem;
  }

  .analytics-section {
    grid-template-columns: 1fr;
  }

  .table-actions {
    flex-direction: column;
    align-items: flex-end;
  }

  .table-actions input {
    width: 100%;
  }
}
</style>