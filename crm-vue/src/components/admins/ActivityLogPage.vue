<template>
  <div class="activity-log">
    <h1>Activity Logs</h1>
    <div class="controls">
      <input v-model="searchQuery" type="text" placeholder="Search by action or user..." class="search-input" />
      <select v-model="actionFilter" class="sort-select">
        <option value="">All Actions</option>
        <option value="Login">Login</option>
        <option value="Logout">Logout</option>
        <option value="Failed Login">Failed Login</option>
      </select>
      <select v-model="sortBy" class="sort-select">
        <option value="timestamp-desc">Newest First</option>
        <option value="timestamp-asc">Oldest First</option>
        <option value="action">Action (A-Z)</option>
        <option value="user">User (A-Z)</option>
      </select>
    </div>
    <div v-if="isLoading" class="loading">Loading logs...</div>
    <div v-else class="log-container">
      <table>
        <thead>
          <tr>
            <th>Action</th>
            <th>User</th>
            <th>Timestamp</th>
            <th>Details</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(log, index) in paginatedLogs" :key="index" :class="{ 'failed-login': log.action === 'Failed Login' }">
            <td>{{ log.action }}</td>
            <td>{{ log.user }}</td>
            <td>{{ formatTimestamp(log.timestamp) }}</td>
            <td>{{ log.details || 'N/A' }}</td>
          </tr>
        </tbody>
      </table>
      <div v-if="filteredLogs.length" class="pagination">
        <button @click="currentPage--" :disabled="currentPage === 1" class="pagination-button">Previous</button>
        <span>Page {{ currentPage }} of {{ totalPages }}</span>
        <button @click="currentPage++" :disabled="currentPage === totalPages" class="pagination-button">Next</button>
      </div>
    </div>
    <p v-if="!filteredLogs.length && !isLoading" class="no-results">No activity logs found.</p>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: "ActivityLogPage",
  data() {
    return {
      activityLogs: [],
      searchQuery: "",
      actionFilter: "",
      sortBy: "timestamp-desc",
      currentPage: 1,
      itemsPerPage: 5,
      isLoading: false,
    };
  },
  computed: {
    filteredLogs() {
      let logs = [...this.activityLogs];
      if (this.actionFilter) {
        logs = logs.filter(log => log.action === this.actionFilter);
      }
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        logs = logs.filter(
          (log) =>
            (log.action?.toLowerCase().includes(query) || '') ||
            (log.user?.toLowerCase().includes(query) || '')
        );
      }
      switch (this.sortBy) {
        case "timestamp-asc":
          logs.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
          break;
        case "timestamp-desc":
          logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
          break;
        case "action":
          logs.sort((a, b) => (a.action || '').localeCompare(b.action || ''));
          break;
        case "user":
          logs.sort((a, b) => (a.user || '').localeCompare(b.user || ''));
          break;
      }
      return logs;
    },
    paginatedLogs() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.filteredLogs.slice(start, end);
    },
    totalPages() {
      return Math.ceil(this.filteredLogs.length / this.itemsPerPage);
    },
  },
  methods: {
    formatTimestamp(timestamp) {
      return new Date(timestamp).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    },
    async fetchLogs() {
      this.isLoading = true;
      try {
        const response = await axios.get('http://127.0.0.1:5000/api/admin/activity-logs', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          },
        });
        this.activityLogs = response.data;
      } catch (err) {
        const errorMessage = err.response?.data?.message || err.message || 'Unknown error occurred';
        console.error("Error fetching logs:", errorMessage);
        if (this.$toast) {
          this.$toast.error("Failed to load activity logs: " + errorMessage);
        } else {
          console.warn("Toast notification not available; error:", errorMessage);
        }
      } finally {
        this.isLoading = false;
      }
    },
  },
  mounted() {
    this.fetchLogs();
  },
};
</script>

<style scoped>
.activity-log {
  max-width: 1000px;
  margin: 40px auto;
  padding: 20px;
  background: #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  font-family: Arial, sans-serif;
}
h1 {
  text-align: center;
  font-size: 28px;
  color: #333;
  margin-bottom: 20px;
}
.controls {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}
.search-input, .sort-select {
  flex: 1;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 14px;
}
.sort-select {
  flex: 0 1 auto;
  background: #fff;
}
.loading {
  text-align: center;
  padding: 20px;
  color: #666;
}
.log-container {
  overflow-x: auto;
}
table {
  width: 100%;
  border-collapse: collapse;
  background: #fafafa;
  border-radius: 8px;
  overflow: hidden;
}
th, td {
  padding: 14px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}
th {
  background: #007bff;
  color: white;
  font-weight: bold;
  position: sticky;
  top: 0;
  z-index: 1;
}
tr:hover {
  background: #f1f3f5;
  transition: background 0.2s ease-in-out;
}
.failed-login {
  background: #ffe6e6;
}
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin-top: 20px;
}
.pagination-button {
  padding: 8px 12px;
  border: 1px solid #007bff;
  border-radius: 5px;
  background: #fff;
  color: #007bff;
  cursor: pointer;
  transition: background 0.3s;
}
.pagination-button:disabled {
  border-color: #ccc;
  color: #ccc;
  cursor: not-allowed;
}
.pagination-button:hover:not(:disabled) {
  background: #007bff;
  color: white;
}
.no-results {
  text-align: center;
  color: #666;
  padding: 20px;
}
@media (max-width: 600px) {
  .activity-log {
    margin: 20px;
    padding: 15px;
  }
  table, .search-input, .sort-select {
    font-size: 12px;
  }
  th, td {
    padding: 10px;
  }
}
</style>