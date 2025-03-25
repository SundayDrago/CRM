<template>
  <div class="activity-log">
    <h1>Activity Logs</h1>
    <div class="log-container">
      <table>
        <thead>
          <tr>
            <th>Action</th>
            <th>User</th>
            <th>Timestamp</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(log, index) in activityLogs" :key="index">
            <td>{{ log.action }}</td>
            <td>{{ log.user }}</td>
            <td>{{ formatTimestamp(log.timestamp) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
export default {
  name: "ActivityLogPage",
  data() {
    return {
      activityLogs: [
        { action: "Logged in", user: "Admin", timestamp: "2025-02-25T10:00:00Z" },
        { action: "Updated user information", user: "Admin", timestamp: "2025-02-25T10:05:00Z" },
        { action: "Viewed segmentation data", user: "Admin", timestamp: "2025-02-25T10:10:00Z" },
        { action: "Logged out", user: "Admin", timestamp: "2025-02-25T10:15:00Z" },
      ],
    };
  },
  methods: {
    formatTimestamp(timestamp) {
      return new Date(timestamp).toLocaleString(); // Format timestamp to local date string
    },
  },
};
</script>

<style scoped>
.activity-log {
  max-width: 800px;
  margin: 40px auto;
  padding: 20px;
  background: #fff;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
}

h2 {
  text-align: center;
  font-size: 24px;
  color: #333;
  margin-bottom: 20px;
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
  padding: 12px;
  text-align: left;
}

th {
  background: #007bff;
  color: white;
  font-weight: bold;
}

td {
  border-bottom: 1px solid #ddd;
}

tr:hover {
  background: #f8f9fa;
  transition: background 0.3s ease-in-out;
}

@media (max-width: 600px) {
  table {
    font-size: 14px;
  }
}
</style>
