<template>
  <div class="reports-page">
    <!-- Header -->
    <div class="header">
      <h1>Reports Dashboard</h1>
      <div class="header-actions">
        <button @click="fetchReports" class="action-button refresh-button">
          <i class="fas fa-sync-alt"></i> Refresh Reports
        </button>
        <button @click="generateReport" class="action-button generate-button">
          <i class="fas fa-file-alt"></i> Generate New Report
        </button>
      </div>
    </div>

    <!-- Loading Indicator -->
    <div v-if="isLoading" class="loading">
      <div class="spinner"></div>
      <p>Loading reports...</p>
    </div>

    <!-- Reports Content -->
    <div v-else class="reports-content">
      <div v-if="reports.length" class="reports-grid">
        <div v-for="report in reports" :key="report.id" class="report-card">
          <div class="card-header">
            <h3>{{ report.title }}</h3>
            <span class="report-type" :class="report.type.toLowerCase()">{{ report.type }}</span>
          </div>
          <div class="card-body">
            <p class="generated-date">
              Generated: {{ formatDate(report.generated_at) }}
            </p>
            <div class="metrics">
              <div v-for="(value, key) in report.metrics" :key="key" class="metric-item">
                <span class="metric-label">{{ formatMetricLabel(key) }}</span>
                <span class="metric-value">{{ value }}</span>
              </div>
            </div>
          </div>
          <div class="card-footer">
            <button @click="downloadReport(report.file_url)" class="download-button">
              <i class="fas fa-download"></i> Download
            </button>
          </div>
        </div>
      </div>
      <div v-else class="no-reports">
        <div class="empty-state">
          <i class="fas fa-file-alt"></i>
          <h3>No Reports Available</h3>
          <p>Generate a new report or check back later.</p>
          <button @click="generateReport" class="action-button generate-button">
            Generate Report
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'ReportsPage',
  data() {
    return {
      reports: [],
      isLoading: false,
    };
  },
  methods: {
    async fetchReports() {
      this.isLoading = true;
      try {
        const response = await axios.get('http://127.0.0.1:5000/reports');
        this.reports = response.data;
      } catch (error) {
        console.error('Error fetching reports:', error);
        this.reports = [];
        const errorMessage = error.response?.data?.error || error.message || 'Failed to fetch reports';
        this.$toast.error(errorMessage);
      } finally {
        this.isLoading = false;
      }
    },

    async generateReport() {
      this.isLoading = true;
      try {
        const response = await axios.post('http://127.0.0.1:5000/reports/generate', {
          type: 'Segmentation' // Adjust payload based on your API
        });
        this.$toast.success('Report generated successfully');
        this.reports.push(response.data); // Add new report to the list
      } catch (error) {
        console.error('Error generating report:', error);
        // Robust error handling: safely extract message or fallback
        const errorMessage = error.response?.data?.error || error.message || 'Failed to generate report';
        this.$toast.error(errorMessage);
      } finally {
        this.isLoading = false;
      }
    },

    downloadReport(fileUrl) {
      const fullUrl = `http://127.0.0.1:5000${fileUrl}`; // Adjust base URL if needed
      const link = document.createElement('a');
      link.href = fullUrl;
      link.download = fileUrl.split('/').pop(); // Extract filename
      link.click();
    },

    formatDate(dateString) {
      return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    },

    formatMetricLabel(key) {
      return key
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    },
  },
  created() {
    this.fetchReports();
  },
};
</script>

<style scoped>
/* General Page Styling */
.reports-page {
  padding: 30px;
  font-family: 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
  background-color: #f9fafb;
  min-height: 100vh;
  max-width: 1400px;
  margin: 0 auto;
}

/* Header */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
  flex-wrap: wrap;
  gap: 15px;
}

h1 {
  font-size: 2rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 15px;
}

.action-button {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.3s ease, transform 0.1s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 8px;
}

.refresh-button {
  background: linear-gradient(135deg, #6b7280, #4b5563);
  color: white;
}

.refresh-button:hover {
  background: linear-gradient(135deg, #4b5563, #374151);
  transform: translateY(-1px);
}

.generate-button {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
}

.generate-button:hover {
  background: linear-gradient(135deg, #2563eb, #1e40af);
  transform: translateY(-1px);
}

/* Loading Indicator */
.loading {
  text-align: center;
  padding: 40px;
  background: #ffffff;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  margin-bottom: 40px;
}

.spinner {
  width: 2.5rem;
  height: 2.5rem;
  border: 3px solid rgba(59, 130, 246, 0.2);
  border-radius: 50%;
  border-top-color: #3b82f6;
  animation: spin 1s ease-in-out infinite;
  margin: 0 auto 15px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading p {
  font-size: 1.1rem;
  color: #6b7280;
  margin: 0;
}

/* Reports Grid */
.reports-content {
  margin-bottom: 40px;
}

.reports-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.report-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.report-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.card-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.report-type {
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
  text-transform: uppercase;
}

.report-type.segmentation {
  background-color: #e0f2fe;
  color: #0369a1;
}

.report-type.sales {
  background-color: #ecfdf5;
  color: #047857;
}

.card-body {
  margin-bottom: 20px;
}

.generated-date {
  font-size: 0.9rem;
  color: #6b7280;
  margin-bottom: 15px;
}

.metrics {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.metric-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #e5e7eb;
}

.metric-label {
  font-size: 0.95rem;
  font-weight: 500;
  color: #374151;
}

.metric-value {
  font-size: 0.95rem;
  color: #4b5563;
  font-weight: 600;
}

.card-footer {
  text-align: right;
}

.download-button {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.3s ease, transform 0.1s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.download-button:hover {
  background: linear-gradient(135deg, #059669, #047857);
  transform: translateY(-1px);
}

/* No Reports State */
.no-reports {
  text-align: center;
  padding: 40px;
  background: #ffffff;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.empty-state {
  max-width: 400px;
  margin: 0 auto;
}

.empty-state i {
  font-size: 2.5rem;
  color: #9ca3af;
  margin-bottom: 15px;
}

.empty-state h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 10px;
}

.empty-state p {
  font-size: 1rem;
  color: #6b7280;
  margin-bottom: 20px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .header {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-actions {
    width: 100%;
    flex-direction: column;
    gap: 10px;
  }

  .action-button {
    width: 100%;
  }

  .reports-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  h1 {
    font-size: 1.5rem;
  }

  .report-card {
    padding: 15px;
  }

  .card-header h3 {
    font-size: 1.1rem;
  }

  .metric-label, .metric-value {
    font-size: 0.85rem;
  }

  .download-button {
    padding: 6px 12px;
    font-size: 0.8rem;
  }
}
</style>