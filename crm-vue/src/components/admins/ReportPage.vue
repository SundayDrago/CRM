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

    <!-- Email Send Modal -->
    <div v-if="showEmailModal" class="modal-overlay">
      <div class="email-modal">
        <div class="modal-header">
          <h3>Send Report via Email</h3>
          <button @click="closeEmailModal" class="modal-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Recipients</label>
            <v-select
              v-model="emailRecipients"
              multiple
              :options="recipientOptions"
              placeholder="Select recipients"
              class="recipient-select"
            ></v-select>
          </div>
          <div class="form-group">
            <label>Subject</label>
            <input
              v-model="emailSubject"
              type="text"
              class="form-input"
              placeholder="Email subject"
            />
          </div>
          <div class="form-group">
            <label>Message</label>
            <textarea
              v-model="emailMessage"
              class="form-textarea"
              placeholder="Add a custom message..."
              rows="4"
            ></textarea>
          </div>
          <div class="form-group">
            <label>Attachment Options</label>
            <div class="checkbox-group">
              <label class="checkbox-label">
                <input
                  type="checkbox"
                  v-model="includePdf"
                  class="checkbox-input"
                />
                <span class="checkbox-custom"></span>
                Include PDF
              </label>
              <label class="checkbox-label">
                <input
                  type="checkbox"
                  v-model="includeExcel"
                  class="checkbox-input"
                />
                <span class="checkbox-custom"></span>
                Include Excel
              </label>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="closeEmailModal" class="modal-button cancel-button">
            Cancel
          </button>
          <button @click="sendEmailWithReport" class="modal-button send-button">
            <i class="fas fa-paper-plane"></i> Send Email
          </button>
        </div>
      </div>
    </div>

    <!-- Notification Toasts -->
    <div class="toast-container">
      <transition-group name="toast">
        <div 
          v-for="toast in toasts" 
          :key="toast.id" 
          class="toast" 
          :class="toast.type"
          @click="removeToast(toast.id)"
        >
          <i class="toast-icon" :class="getToastIcon(toast.type)"></i>
          <div class="toast-content">
            <p class="toast-title">{{ toast.title }}</p>
            <p class="toast-message">{{ toast.message }}</p>
          </div>
          <button class="toast-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </transition-group>
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
            <button @click="goToEmailPage" class="email-button">
              <i class="fas fa-paper-plane"></i> Send Email
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
import vSelect from 'vue-select';
import 'vue-select/dist/vue-select.css';

export default {
  name: 'ReportsPage',
  components: {
    vSelect
  },
  data() {
    return {
      reports: [],
      isLoading: false,
      toasts: [],
      nextToastId: 0,
      showEmailModal: false,
      currentReport: null,
      emailRecipients: [],
      emailSubject: '',
      emailMessage: '',
      includePdf: true,
      includeExcel: true,
      recipientOptions: [
        { label: 'Management Team', value: 'management@company.com' },
        { label: 'Sales Department', value: 'sales@company.com' },
        { label: 'Marketing Team', value: 'marketing@company.com' },
        { label: 'Finance Department', value: 'finance@company.com' },
        { label: 'Customer Support', value: 'support@company.com' }
      ]
    };
  },
  methods: {
    async fetchReports() {
      this.isLoading = true;
      try {
        const response = await axios.get('http://127.0.0.1:5000/reports');
        this.reports = response.data.reports || [];
        this.showToast('success', 'Reports Loaded', 'Your reports have been successfully loaded.');
      } catch (error) {
        console.error('Error fetching reports:', error, { response: error.response });
        this.reports = [];
        const errorMessage = error.response?.data?.error || error.message || 'Failed to fetch reports';
        this.showToast('error', 'Error Loading Reports', errorMessage);
      } finally {
        this.isLoading = false;
      }
    },

    async generateReport() {
      this.isLoading = true;
      try {
        const response = await axios.post('http://127.0.0.1:5000/reports/generate', {
          type: 'Segmentation',
        });
        this.reports.push(response.data);
        this.showToast('success', 'Report Generated', 'Your report has been successfully generated.');
      } catch (error) {
        console.error('Error generating report:', error, { response: error.response });
        const errorMessage = error.response?.data?.error || error.message || 'Failed to generate report';
        this.showToast('error', 'Generation Failed', errorMessage);
      } finally {
        this.isLoading = false;
      }
    },
    goToEmailPage(){
    this.$router.push('/send');

    },

    downloadReport(fileUrl) {
      const fullUrl = `http://127.0.0.1:5000${fileUrl}`;
      const link = document.createElement('a');
      link.href = fullUrl;
      link.download = fileUrl.split('/').pop();
      link.click();
      this.showToast('info', 'Download Started', 'Your report download has started.');
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

    showToast(type, title, message) {
      const toast = {
        id: this.nextToastId++,
        type,
        title,
        message,
        timeout: setTimeout(() => {
          this.removeToast(toast.id);
        }, 5000),
      };
      this.toasts.push(toast);
    },

    removeToast(id) {
      const index = this.toasts.findIndex(t => t.id === id);
      if (index !== -1) {
        clearTimeout(this.toasts[index].timeout);
        this.toasts.splice(index, 1);
      }
    },

    getToastIcon(type) {
      const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle',
      };
      return icons[type] || 'fas fa-info-circle';
    },
  },
  created() {
    this.fetchReports();
  },
  beforeUnmount() {
    this.toasts.forEach(toast => clearTimeout(toast.timeout));
  },
};
</script>

<style scoped>
.reports-page {
  padding: 30px;
  font-family: 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
  background-color: #f9fafb;
  min-height: 100vh;
  max-width: 1400px;
  margin: 0 auto;
}

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
  display: flex;
  justify-content: flex-end;
  gap: 10px;
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

.email-button {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
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

.email-button:hover {
  background: linear-gradient(135deg, #7c3aed, #6d28d9);
  transform: translateY(-1px);
}

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

/* Toast Notifications */
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 350px;
  width: 100%;
}

.toast {
  display: flex;
  align-items: flex-start;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  opacity: 0.95;
  overflow: hidden;
  position: relative;
}

.toast:hover {
  opacity: 1;
  transform: translateY(-2px);
}

.toast-icon {
  font-size: 1.2rem;
  margin-right: 12px;
  margin-top: 2px;
}

.toast-content {
  flex: 1;
}

.toast-title {
  font-weight: 600;
  margin: 0 0 4px 0;
  font-size: 0.95rem;
}

.toast-message {
  margin: 0;
  font-size: 0.85rem;
  line-height: 1.4;
}

.toast-close {
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  padding: 0;
  margin-left: 10px;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.toast-close:hover {
  opacity: 1;
}

.toast.success {
  background: linear-gradient(135deg, #10b981, #059669);
}

.toast.error {
  background: linear-gradient(135deg, #ef4444, #dc2626);
}

.toast.warning {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}

.toast.info {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
}

/* Toast animations */
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-leave-active {
  position: absolute;
}

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

  .download-button, .email-button {
    padding: 6px 12px;
    font-size: 0.8rem;
  }

  .card-footer {
    flex-direction: column;
    gap: 8px;
  }
  
  .download-button, .email-button {
    width: 100%;
    margin-left: 0;
    justify-content: center;
  }
  
  .toast-container {
    max-width: calc(100% - 40px);
    left: 20px;
    right: 20px;
    top: 10px;
  }
}

/* Email Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1001;
  backdrop-filter: blur(2px);
}

.email-modal {
  background-color: white;
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  animation: modalFadeIn 0.3s ease;
}

@keyframes modalFadeIn {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}

.modal-header {
  padding: 20px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  color: #1f2937;
}

.modal-close {
  background: none;
  border: none;
  color: #6b7280;
  font-size: 1.2rem;
  cursor: pointer;
  transition: color 0.2s;
}

.modal-close:hover {
  color: #ef4444;
}

.modal-body {
  padding: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #374151;
}

.form-input, .form-textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.95rem;
  transition: border-color 0.2s;
}

.form-input:focus, .form-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-textarea {
  min-height: 100px;
  resize: vertical;
}

.checkbox-group {
  display: flex;
  gap: 20px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
}

.checkbox-input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

.checkbox-custom {
  height: 18px;
  width: 18px;
  background-color: white;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  margin-right: 8px;
  position: relative;
  transition: all 0.2s;
}

.checkbox-input:checked ~ .checkbox-custom {
  background-color: #3b82f6;
  border-color: #3b82f6;
}

.checkbox-custom:after {
  content: "";
  position: absolute;
  display: none;
  left: 6px;
  top: 2px;
  width: 5px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.checkbox-input:checked ~ .checkbox-custom:after {
  display: block;
}

.modal-footer {
  padding: 20px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.modal-button {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-button {
  background-color: #f3f4f6;
  color: #4b5563;
}

.cancel-button:hover {
  background-color: #e5e7eb;
}

.send-button {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  color: white;
  display: flex;
  align-items: center;
  gap: 8px;
}

.send-button:hover {
  background: linear-gradient(135deg, #7c3aed, #6d28d9);
  transform: translateY(-1px);
}

/* Vue Select Customization */
:deep(.vs__dropdown-toggle) {
  border: 1px solid #d1d5db;
  padding: 8px;
  border-radius: 6px;
}

:deep(.vs__search) {
  margin: 0;
  padding: 0;
}

:deep(.vs__selected) {
  background-color: #e0f2fe;
  border-color: #bae6fd;
  color: #0369a1;
}

:deep(.vs__dropdown-option) {
  padding: 8px 12px;
}

:deep(.vs__dropdown-option--highlight) {
  background: #3b82f6;
  color: white;
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .email-modal {
    width: 95%;
    margin: 0 auto;
  }
  
  .checkbox-group {
    flex-direction: column;
    gap: 10px;
  }
  
  .modal-footer {
    flex-direction: column;
  }
  
  .modal-button {
    width: 100%;
  }
}

</style>