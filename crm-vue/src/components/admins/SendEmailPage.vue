<template>
  <div class="send-email-page">
    <div class="header">
      <h1>Send Report via Email</h1>
      <router-link to="/report" class="back-button">
        <i class="fas fa-arrow-left"></i> Back to Reports
      </router-link>
    </div>

    <div v-if="isLoading" class="loading">
      <div class="spinner"></div>
      <p>Loading report details...</p>
    </div>

    <div v-else-if="error" class="error-message">
      <p>{{ error }}</p>
      <router-link to="/report" class="back-button">Return to Reports</router-link>
    </div>

    <div v-else class="email-form">
      <div class="form-section">
        <h2>Report Details</h2>
        <div class="report-info">
          <p><strong>Title:</strong> {{ report.title }}</p>
          <p><strong>Type:</strong> {{ report.type }}</p>
          <p><strong>Generated:</strong> {{ formatDate(report.generated_at) }}</p>
        </div>
      </div>

      <div class="form-section">
        <h2>Email Configuration</h2>
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
      </div>

      <div class="form-section">
        <h2>Attachment Options</h2>
        <div class="checkbox-group">
          <label class="checkbox-label">
            <input type="checkbox" v-model="includePdf" class="checkbox-input" />
            <span class="checkbox-custom"></span>
            Include PDF
          </label>
          <label class="checkbox-label">
            <input type="checkbox" v-model="includeExcel" class="checkbox-input" />
            <span class="checkbox-custom"></span>
            Include Excel
          </label>
        </div>
      </div>

      <div class="form-actions">
        <router-link to="/reports" class="action-button cancel-button">
          Cancel
        </router-link>
        <button 
          @click="sendEmail" 
          class="action-button send-button"
          :disabled="!canSend || sending"
        >
          <i class="fas fa-paper-plane"></i> 
          {{ sending ? 'Sending...' : 'Send Email' }}
        </button>
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
  </div>
</template>

<script>
import axios from 'axios';
import vSelect from 'vue-select';
import 'vue-select/dist/vue-select.css';

export default {
  name: 'SendEmailPage',
  components: { vSelect },
  data() {
    return {
      report: null,
      isLoading: false,
      error: null,
      sending: false,
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
        { label: 'Customer Support', value: 'support@company.com' },
      ],
      toasts: [],
      nextToastId: 0,
    };
  },
  computed: {
    canSend() {
      return (
        this.report && 
        this.emailRecipients.length > 0 && 
        (this.includePdf || this.includeExcel) &&
        !this.sending
      );
    }
  },
  async created() {
    const reportId = this.$route.query.reportId;
    if (!reportId) {
      this.error = 'No report ID provided.';
      return;
    }
    await this.fetchReport(reportId);
  },
  methods: {
    async fetchReport(reportId) {
      this.isLoading = true;
      try {
        const response = await axios.get(`http://127.0.0.1:5000/reports/${reportId}`);
        this.report = response.data;
        this.emailSubject = `${this.report.title} - ${this.report.type} Report`;
        this.emailMessage = `Please find attached the ${this.report.title} report.\n\nGenerated on: ${this.formatDate(this.report.generated_at)}`;
      } catch (error) {
        console.error('Error fetching report:', error);
        this.error = error.response?.data?.error || error.message || 'Failed to load report details';
        this.showToast('error', 'Error', this.error);
      } finally {
        this.isLoading = false;
      }
    },

    async sendEmail() {
      if (!this.canSend) return;

      this.sending = true;
      try {
        const response = await axios.post('http://127.0.0.1:5000/reports/send-email', {
          report_id: this.report.id,
          recipients: this.emailRecipients.map(r => r.value),
          subject: this.emailSubject,
          message: this.emailMessage,
          include_pdf: this.includePdf,
          include_excel: this.includeExcel,
        });
        console.log(response);

        this.showToast('success', 'Success', 'Report has been sent successfully');
        this.$router.push('/report');
      } catch (error) {
        console.error('Error sending email:', error);
        const errorMessage = error.response?.data?.error || error.message || 'Failed to send email';
        this.showToast('error', 'Error', errorMessage);
      } finally {
        this.sending = false;
      }
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
  beforeUnmount() {
    this.toasts.forEach(toast => clearTimeout(toast.timeout));
  },
};
</script>

<style scoped>
.send-email-page {
  padding: 30px;
  font-family: 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
  background-color: #f9fafb;
  min-height: 100vh;
  max-width: 800px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  flex-wrap: wrap;
  gap: 15px;
}

h1 {
  font-size: 1.8rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.back-button {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.3s ease, transform 0.1s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #6b7280, #4b5563);
  color: white;
  text-decoration: none;
}

.back-button:hover {
  background: linear-gradient(135deg, #4b5563, #374151);
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

.error-message {
  text-align: center;
  padding: 40px;
  background: #ffffff;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  color: #dc2626;
  font-size: 1.1rem;
}

.email-form {
  background: #ffffff;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.form-section {
  margin-bottom: 25px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e5e7eb;
}

.form-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

h2 {
  font-size: 1.3rem;
  color: #374151;
  margin-top: 0;
  margin-bottom: 15px;
}

.report-info {
  background: #f3f4f6;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 15px;
}

.report-info p {
  margin: 8px 0;
  color: #4b5563;
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
  padding: 12px;
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
  min-height: 120px;
  resize: vertical;
}

.checkbox-group {
  display: flex;
  gap: 20px;
  margin-top: 10px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
  font-size: 0.95rem;
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

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 30px;
}

.action-button {
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.cancel-button {
  background-color: #f3f4f6;
  color: #4b5563;
  text-decoration: none;
}

.cancel-button:hover {
  background-color: #e5e7eb;
}

.send-button {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  color: white;
}

.send-button:hover:not(:disabled) {
  background: linear-gradient(135deg, #7c3aed, #6d28d9);
  transform: translateY(-1px);
}

.send-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
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

/* Vue Select Customization */
:deep(.vs__dropdown-toggle) {
  border: 1px solid #d1d5db;
  padding: 10px;
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
@media (max-width: 768px) {
  .header {
    flex-direction: column;
    align-items: flex-start;
  }

  .form-actions {
    flex-direction: column;
  }

  .action-button {
    width: 100%;
  }

  .checkbox-group {
    flex-direction: column;
    gap: 10px;
  }
}

@media (max-width: 480px) {
  .send-email-page {
    padding: 20px;
  }

  h1 {
    font-size: 1.5rem;
  }

  .email-form {
    padding: 15px;
  }

  .form-input, .form-textarea {
    font-size: 0.85rem;
  }

  .action-button {
    padding: 10px 20px;
    font-size: 0.9rem;
  }

  .toast-container {
    max-width: calc(100% - 40px);
    left: 20px;
    right: 20px;
    top: 10px;
  }
}
</style>