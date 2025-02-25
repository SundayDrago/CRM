<template>
    <div class="activity-log">
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
  </template>
  
  <script>
  export default {
    name: 'ActivityLogPage',
    data() {
      return {
        activityLogs: [
          { action: 'Logged in', user: 'Admin', timestamp: '2025-02-25T10:00:00Z' },
          { action: 'Updated user information', user: 'Admin', timestamp: '2025-02-25T10:05:00Z' },
          { action: 'Viewed segmentation data', user: 'Admin', timestamp: '2025-02-25T10:10:00Z' },
          { action: 'Logged out', user: 'Admin', timestamp: '2025-02-25T10:15:00Z' },
          // Add more logs as needed
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
    padding: 20px;
  }
  
  h2 {
    margin-bottom: 20px;
  }
  
  table {
    width: 100%;
    border-collapse: collapse;
  }
  
  th, td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: left;
  }
  
  th {
    background-color: #f4f4f9;
  }
  
  tr:hover {
    background-color: #f1f1f1;
  }
  </style>
  