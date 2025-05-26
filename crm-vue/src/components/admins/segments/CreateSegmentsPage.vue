<template>
  <div class="segment-management-container">
    <div class="header">
      <h1 class="page-title">Customer Segmentation</h1>
      <p class="page-subtitle">Upload your dataset and create customer segments</p>
      <div class="header-actions">
        <button @click="exportSegmentsAsCSV" class="export-button">
          <i class="fas fa-file-csv"></i> Export as CSV
        </button>
        <button @click="exportSegmentsAsJSON" class="export-button">
          <i class="fas fa-file-code"></i> Export as JSON
        </button>
      </div>
    </div>

    <div class="management-grid">
      <!-- Import/Export Card -->
      <div class="management-card">
        <div class="card-header">
          <h2><i class="fas fa-file-import"></i> Upload Customer Data</h2>
        </div>
        <div class="file-upload-container">
          <div
            class="upload-area"
            @click="triggerFileInput"
            @dragover.prevent="dragOver"
            @dragleave.prevent="dragLeave"
            @drop.prevent="handleDrop"
          >
            <input
              type="file"
              ref="fileInput"
              @change="handleFileUpload"
              accept=".csv,.json,.xlsx,.xls"
              style="display: none;"
            />
            <div class="upload-content" :class="{ 'drag-active': isDragOver }">
              <i class="fas fa-cloud-upload-alt"></i>
              <p>Drag & drop your customer data file here or click to browse</p>
              <small>Supported formats: CSV, JSON, XLSX, XLS (Max 5MB)</small>
            </div>
          </div>
          <div v-if="uploadProgress > 0" class="upload-progress">
            <div class="progress-bar" :style="{ width: uploadProgress + '%' }"></div>
            <span>{{ uploadProgress }}% uploaded</span>
          </div>
          <div v-if="uploadError" class="upload-error">
            <i class="fas fa-exclamation-circle"></i> {{ uploadError }}
          </div>

          <div class="upload-instructions">
            <h3>File Requirements</h3>
            <ul>
              <li><i class="fas fa-check-circle"></i> File size should not exceed 5MB</li>
              <li><i class="fas fa-check-circle"></i> Should contain customer attributes</li>
              <li><i class="fas fa-check-circle"></i> First row should contain headers</li>
              <li><i class="fas fa-check-circle"></i> Supported columns: Age, Gender, Income, etc.</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Create Segment Card -->
      <div class="management-card">
        <div class="card-header">
          <h2><i class="fas fa-chart-pie"></i> Create New Segment</h2>
        </div>
        <form @submit.prevent="createSegment" class="segment-form">
          <div class="form-group">
            <label for="segment-name">Segment Name</label>
            <input
              type="text"
              id="segment-name"
              v-model="newSegment.name"
              placeholder="e.g. Loyal Urban Shoppers"
              required
              maxlength="50"
              aria-describedby="segment-name-char-count"
              class="form-control"
            />
            <span id="segment-name-char-count" class="char-count">{{ newSegment.name.length }}/50</span>
          </div>

          <div class="form-group">
            <label>Segment Criteria</label>
            <div class="criteria-selector">
              <div class="criteria-row" v-for="(criterion, index) in criteria" :key="index">
                <!-- Field Dropdown -->
                <div class="criteria-field">
                  <select
                    v-model="criterion.field"
                    @change="resetCriterionValue(index)"
                    class="field-select"
                    required
                    aria-label="Select field"
                  >
                    <option value="" disabled>Select field...</option>
                    <option v-for="field in availableFields" :value="field" :key="field">
                      {{ formatFieldName(field) }}
                    </option>
                  </select>
                </div>

                <!-- Operator Dropdown -->
                <div class="criteria-operator" v-if="criterion.field">
                  <select
                    v-model="criterion.operator"
                    class="operator-select"
                    @change="resetCriterionValue(index)"
                    aria-label="Select operator"
                  >
                    <option value="" disabled>Select operator...</option>
                    <option
                      v-for="op in getAvailableOperators(criterion.field)"
                      :value="op.value"
                      :key="op.value"
                    >
                      {{ op.label }}
                    </option>
                  </select>
                </div>

                <!-- Value Input -->
                <div class="criteria-value" v-if="criterion.field && criterion.operator">
                  <!-- Predefined Values for Categorical Fields -->
                  <select
                    v-if="hasPredefinedValues(criterion.field)"
                    v-model="criterion.value"
                    class="value-select"
                    required
                    aria-label="Select value"
                  >
                    <option value="" disabled>Select value...</option>
                    <option
                      v-for="value in valueOptions[criterion.field]"
                      :key="value"
                      :value="value"
                    >
                      {{ value }}
                    </option>
                  </select>

                  <!-- Range Inputs for 'between' Operator -->
                  <div v-else-if="criterion.operator === 'between'" class="range-inputs">
                    <input
                      v-model="criterion.valueFrom"
                      :type="getInputType(criterion.field)"
                      placeholder="From"
                      class="range-input"
                      :class="{ 'input-error': criterion.errors?.valueFrom }"
                      @input="validateCriterion(index)"
                      required
                      aria-label="Range from"
                    />
                    <span class="range-separator">to</span>
                    <input
                      v-model="criterion.valueTo"
                      :type="getInputType(criterion.field)"
                      placeholder="To"
                      class="range-input"
                      :class="{ 'input-error': criterion.errors?.valueTo }"
                      @input="validateCriterion(index)"
                      required
                      aria-label="Range to"
                    />
                  </div>

                  <!-- Single Value Input -->
                  <input
                    v-else
                    v-model="criterion.value"
                    :type="getInputType(criterion.field)"
                    :placeholder="getPlaceholder(criterion.field)"
                    class="value-input"
                    :class="{ 'input-error': criterion.errors?.value }"
                    @input="validateCriterion(index)"
                    required
                    aria-label="Value input"
                  />
                </div>

                <!-- Remove Criterion Button -->
                <button
                  type="button"
                  @click="removeCriterion(index)"
                  class="btn-icon danger"
                  title="Remove"
                  v-if="criteria.length > 1"
                  aria-label="Remove criterion"
                >
                  <i class="fas fa-times"></i>
                </button>
              </div>

              <!-- Criteria Validation Errors -->
              <div
                v-for="(criterion, index) in criteria"
                :key="'error-' + index"
                class="criteria-error"
              >
                <span v-if="criterion.errors?.value" class="error-text">
                  {{ criterion.errors.value }}
                </span>
                <span v-if="criterion.errors?.valueFrom" class="error-text">
                  {{ criterion.errors.valueFrom }}
                </span>
                <span v-if="criterion.errors?.valueTo" class="error-text">
                  {{ criterion.errors.valueTo }}
                </span>
              </div>
            </div>

            <!-- Add Criterion Button -->
            <button type="button" @click="addCriterion" class="btn btn-outline btn-sm">
              <i class="fas fa-plus"></i> Add Criteria
            </button>

            <!-- Criteria Preview -->
            <div class="criteria-preview" v-if="criteriaString">
              <label>Criteria Preview:</label>
              <p>{{ criteriaString }}</p>
            </div>
          </div>

          <button
            type="submit"
            class="btn btn-primary"
            :disabled="isCreating || !isFormValid"
            aria-label="Create segment"
          >
            <span v-if="!isCreating">
              <i class="fas fa-save"></i> Create Segment
            </span>
            <span v-else><i class="fas fa-spinner fa-spin"></i> Creating...</span>
          </button>
        </form>
      </div>
    </div>

    <!-- Notification Container -->
    <div class="notification-container">
      <transition-group name="notification" tag="div">
        <div
          v-for="notification in notifications"
          :key="notification.id"
          class="notification"
          :class="notification.type"
          role="alert"
          @click="removeNotification(notification.id)"
        >
          <i :class="getNotificationIcon(notification.type)"></i>
          <span>{{ notification.message }}</span>
          <button
            class="notification-close"
            @click.stop="removeNotification(notification.id)"
            aria-label="Close notification"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>
      </transition-group>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { saveAs } from 'file-saver';
import Papa from 'papaparse';

export default {
  name: 'CreateSegmentsPage',
  data() {
    return {
      newSegment: {
        name: '',
        description: ''
      },
      criteria: [
        { field: '', operator: '', value: '', valueFrom: '', valueTo: '', errors: {} }
      ],
      availableFields: [
        'Age',
        'Gender',
        'Monthly Income',
        'Region',
        'Frequency of Shopping(Regular)',
        'Average spending',
        'Categories',
        'Rate of Satisfaction',
        'Rate of availability of products',
        'Device to shop',
        'Internet connection used'
      ],
      valueOptions: {
        Gender: ['Male', 'Female'],
        Region: ['Northern', 'Southern', 'Eastern', 'Western', 'Central'],
        'Frequency of Shopping(Regular)': ['Daily', 'Weekly', 'Monthly', 'Rarely'],
        Categories: ['Electronics', 'Fashion', 'Groceries', 'Home'],
        'Device to shop': ['Mobile', 'Desktop', 'Tablet'],
        'Internet connection used': ['WiFi', 'Mobile Data']
      },
      isCreating: false,
      isDragOver: false,
      uploadProgress: 0,
      uploadError: null,
      notifications: []
    };
  },
  computed: {
    isFormValid() {
      return (
        this.newSegment.name.trim() &&
        this.criteria.every(
          (c) =>
            c.field &&
            c.operator &&
            !Object.keys(c.errors).length &&
            (c.operator === 'between'
              ? c.valueFrom && c.valueTo
              : c.value)
        )
      );
    },
    criteriaString() {
      return this.buildCriteriaString();
    }
  },
  methods: {
    addCriterion() {
      this.criteria.push({
        field: '',
        operator: '',
        value: '',
        valueFrom: '',
        valueTo: '',
        errors: {}
      });
    },
    removeCriterion(index) {
      this.criteria.splice(index, 1);
    },
    resetCriterionValue(index) {
      this.criteria[index].value = '';
      this.criteria[index].valueFrom = '';
      this.criteria[index].valueTo = '';
      this.criteria[index].errors = {};
    },
    hasPredefinedValues(field) {
      return field in this.valueOptions;
    },
    getAvailableOperators(field) {
      const numericFields = ['Monthly Income', 'Average spending', 'Rate of Satisfaction', 'Rate of availability of products'];
      const rangeFields = ['Age', 'Monthly Income', 'Average spending', 'Rate of Satisfaction', 'Rate of availability of products'];

      const operators = [{ value: 'equals', label: 'equals' }];

      if (rangeFields.includes(field)) {
        operators.push({ value: 'between', label: 'between' });
      }

      if (numericFields.includes(field)) {
        operators.push(
          { value: 'greater', label: 'greater than' },
          { value: 'less', label: 'less than' }
        );
      }

      return operators;
    },
    getInputType(field) {
      return ['Monthly Income', 'Average spending', 'Rate of Satisfaction', 'Rate of availability of products'].includes(field) ? 'number' : 'text';
    },
    getPlaceholder(field) {
      if (field === 'Age') return 'e.g. 18-24';
      if (field === 'Monthly Income') return 'e.g. 500000';
      if (field === 'Average spending') return 'e.g. 75000';
      if (field === 'Rate of Satisfaction') return 'e.g. 4.5';
      if (field === 'Rate of availability of products') return 'e.g. 3';
      return 'Enter value...';
    },
    validateCriterion(index) {
      const criterion = this.criteria[index];
      criterion.errors = {};

      if (criterion.operator === 'between') {
        if (criterion.field === 'Age') {
          const rangeRegex = /^\d+-\d+$/;
          if (criterion.valueFrom && !/^\d+$/.test(criterion.valueFrom)) {
            criterion.errors.valueFrom = 'Must be a number';
          }
          if (criterion.valueTo && !/^\d+$/.test(criterion.valueTo)) {
            criterion.errors.valueTo = 'Must be a number';
          }
          if (
            criterion.valueFrom &&
            criterion.valueTo &&
            !rangeRegex.test(`${criterion.valueFrom}-${criterion.valueTo}`)
          ) {
            criterion.errors.valueTo = 'Invalid range format';
          }
          if (
            criterion.valueFrom &&
            criterion.valueTo &&
            parseInt(criterion.valueFrom) >= parseInt(criterion.valueTo)
          ) {
            criterion.errors.valueTo = '"To" must be greater than "From"';
          }
        } else {
          if (criterion.valueFrom && isNaN(criterion.valueFrom)) {
            criterion.errors.valueFrom = 'Must be a number';
          }
          if (criterion.valueTo && isNaN(criterion.valueTo)) {
            criterion.errors.valueTo = 'Must be a number';
          }
          if (
            criterion.valueFrom &&
            criterion.valueTo &&
            parseFloat(criterion.valueFrom) >= parseFloat(criterion.valueTo)
          ) {
            criterion.errors.valueTo = '"To" must be greater than "From"';
          }
        }
      } else if (criterion.field === 'Age' && criterion.operator === 'equals') {
        const rangeRegex = /^\d+-\d+$/;
        if (criterion.value && !rangeRegex.test(criterion.value)) {
          criterion.errors.value = 'Age must be in range format (e.g., 18-24)';
        }
      } else if (['Monthly Income', 'Average spending', 'Rate of Satisfaction', 'Rate of availability of products'].includes(criterion.field)) {
        if (criterion.value && isNaN(criterion.value)) {
          criterion.errors.value = 'Must be a number';
        }
      }
    },
    buildCriteriaString() {
      return this.criteria
        .map((criterion) => {
          if (!criterion.field || !criterion.operator) return '';

          if (criterion.operator === 'between') {
            return `${criterion.field} ${criterion.valueFrom}-${criterion.valueTo}`;
          }

          let prefix = '';
          if (criterion.operator === 'greater') {
            prefix = '>';
          } else if (criterion.operator === 'less') {
            prefix = '<';
          }

          return `${criterion.field} ${prefix}${criterion.value}`;
        })
        .filter(Boolean)
        .join(', ');
    },
    formatFieldName(field) {
      return field.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
    },
    async createSegment() {
      this.isCreating = true;
      try {
        const criteriaString = this.buildCriteriaString();
        if (!criteriaString) {
          throw new Error('At least one valid criterion is required');
        }

        const response = await axios.post('http://127.0.0.1:5000/segment', {
          name: this.newSegment.name,
          criteria: criteriaString,
          description: this.newSegment.description,
          source: 'Custom'
        });

        this.showSuccess(`Segment "${this.newSegment.name}" created successfully with ID: ${response.data.id}`);
        this.resetForm();
      } catch (error) {
        console.error('Failed to create segment:', error);
        const message = error.response?.data?.error || error.message || 'An unexpected error occurred';
        this.showError(`Failed to create segment: ${message}`);
      } finally {
        this.isCreating = false;
      }
    },
    async exportSegmentsAsCSV() {
      try {
        const response = await axios.get('http://127.0.0.1:5000/segments');
        const segments = response.data;

        if (!segments || segments.length === 0) {
          this.showError('No segments available to export');
          return;
        }

        const csv = Papa.unparse(segments);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        saveAs(blob, 'all_segments.csv');
        this.showSuccess('Segments exported as CSV successfully');
      } catch (error) {
        console.error('Failed to export segments as CSV:', error);
        const message = error.response?.data?.error || error.message || 'Failed to export segments';
        this.showError(`Export failed: ${message}`);
      }
    },
    async exportSegmentsAsJSON() {
      try {
        const response = await axios.get('http://127.0.0.1:5000/segments');
        const segments = response.data;

        if (!segments || segments.length === 0) {
          this.showError('No segments available to export');
          return;
        }

        const json = JSON.stringify(segments, null, 2);
        const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
        saveAs(blob, 'all_segments.json');
        this.showSuccess('Segments exported as JSON successfully');
      } catch (error) {
        console.error('Failed to export segments as JSON:', error);
        const message = error.response?.data?.error || error.message || 'Failed to export segments';
        this.showError(`Export failed: ${message}`);
      }
    },
    resetForm() {
      this.newSegment = {
        name: '',
        description: ''
      };
      this.criteria = [{ field: '', operator: '', value: '', valueFrom: '', valueTo: '', errors: {} }];
    },
    triggerFileInput() {
      this.$refs.fileInput.click();
    },
    dragOver() {
      this.isDragOver = true;
    },
    dragLeave() {
      this.isDragOver = false;
    },
    handleDrop(e) {
      this.isDragOver = false;
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        this.handleFileUpload({ target: { files } });
      }
    },
    async handleFileUpload(event) {
      const file = event.target.files[0];
      if (!file) return;

      const validTypes = [
        'text/csv',
        'application/json',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ];
      const fileType = file.type;
      const fileExtension = file.name.split('.').pop().toLowerCase();

      if (
        (!validTypes.includes(fileType) && !['csv', 'json', 'xlsx', 'xls'].includes(fileExtension)) ||
        file.size > 5 * 1024 * 1024
      ) {
        this.uploadError = 'Please upload a CSV, JSON, XLSX, or XLS file under 5MB';
        this.showError('Invalid file: Please upload a CSV, JSON, XLSX, or XLS file under 5MB');
        return;
      }

      this.uploadError = null;
      this.uploadProgress = 0;

      try {
        if (fileType === 'text/csv' || fileExtension === 'csv') {
          const parsedData = await new Promise((resolve, reject) => {
            Papa.parse(file, {
              header: true,
              complete: (results) => resolve(results.data),
              error: (error) => reject(error)
            });
          });
          console.log('Parsed CSV data:', parsedData);
        }

        const formData = new FormData();
        formData.append('file', file);

        const config = {
          onUploadProgress: (progressEvent) => {
            this.uploadProgress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
          },
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        };

        const response = await axios.post(
          'http://127.0.0.1:5000/segments/import',
          formData,
          config
        );

        if (response.data.success) {
          this.showSuccess('File uploaded successfully!');
          if (response.data.importedSegments) {
            const csv = Papa.unparse(response.data.importedSegments);
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            saveAs(blob, 'imported_segments_report.csv');
          }
        } else {
          throw new Error(response.data.message || 'Failed to import segments');
        }
      } catch (error) {
        console.error('Import failed:', error);
        this.uploadError = error.response?.data?.error || error.message || 'Import failed';
        this.showError(this.uploadError);
      } finally {
        this.uploadProgress = 0;
        this.$refs.fileInput.value = '';
      }
    },
    addNotification(message, type = 'success', persistent = false) {
      if (this.notifications.length >= 3) {
        this.notifications.shift();
      }
      const id = Date.now() + Math.random();
      this.notifications.push({ id, message, type });
      if (!persistent) {
        setTimeout(() => {
          this.removeNotification(id);
        }, 5000);
      }
    },
    removeNotification(id) {
      this.notifications = this.notifications.filter((n) => n.id !== id);
    },
    getNotificationIcon(type) {
      switch (type) {
        case 'success':
          return 'fas fa-check-circle';
        case 'error':
          return 'fas fa-exclamation-circle';
        default:
          return 'fas fa-info-circle';
      }
    },
    showSuccess(message) {
      this.addNotification(message, 'success');
    },
    showError(message) {
      this.addNotification(message, 'error', true);
    }
  }
};
</script>

<style scoped>
/* Transition Variables */
:root {
  --transition-fast: 150ms;
  --transition-medium: 250ms;
  --transition-slow: 400ms;
  --ease-out: cubic-bezier(0.25, 1, 0.5, 1);
}

/* Animations */
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Element Transitions */
.segment-management-container,
.management-card,
.notification {
  animation: fadeInUp var(--transition-slow) var(--ease-out);
}

.management-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.15);
}

.btn,
.btn-icon,
.notification-close,
.form-group input,
.form-group select,
.upload-area {
  transition: background-color var(--transition-fast) var(--ease-out), transform var(--transition-fast) var(--ease-out), box-shadow var(--transition-fast) var(--ease-out), border-color var(--transition-fast) var(--ease-out);
}

.btn:active,
.btn-icon:active,
.notification-close:active {
  transform: scale(0.98);
}

.upload-area.drag-active {
  border-color: #4CAF50;
  background-color: rgba(76, 175, 80, 0.05);
}

.spinner {
  animation: spin 1s linear infinite;
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  :root {
    --transition-fast: 1ms;
    --transition-medium: 1ms;
    --transition-slow: 1ms;
  }
  .segment-management-container,
  .management-card,
  .notification {
    animation: none;
  }
  .management-card:hover {
    transform: none;
  }
  .spinner {
    animation: none;
    border: 4px solid #4CAF50;
  }
}

/* Base Styles */
.segment-management-container {
  font-family: 'Inter', sans-serif;
  padding: 2rem 1.5rem;
  color: #333;
  max-width: 1200px;
  margin: 0 auto;
  background: #f5f7fa; /* Matches SegmentationPage.vue */
  min-height: 100vh;
}

/* Header */
.header {
  margin-bottom: 2.5rem;
  text-align: left;
  position: relative;
}

.page-title {
  font-size: clamp(1.8rem, 4.5vw, 2.5rem);
  font-weight: 800; /* Matches SegmentationPage.vue */
  color: #333;
  margin-bottom: 0.5rem;
}

.page-title::after {
  content: '';
  position: absolute;
  bottom: -0.5rem;
  left: 0;
  width: 80px;
  height: 3px;
  background: #4CAF50; /* Matches SegmentationPage.vue */
}

.page-subtitle {
  font-size: clamp(0.9rem, 2vw, 1rem);
  color: #666;
  margin: 0;
  font-weight: 400;
}

.header-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

.export-button {
  padding: 0.75rem 1.5rem;
  font-size: clamp(0.9rem, 2vw, 1rem);
  font-weight: 600;
  border-radius: 50px; /* Matches SegmentationPage.vue */
  cursor: pointer;
  background-color: #4CAF50;
  color: #fff;
  border: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.export-button:hover {
  background-color: #388E3C;
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* Grid Layout */
.management-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

/* Card Styles */
.management-card {
  background: #fff;
  border-radius: 10px; /* Matches SegmentationPage.vue */
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  padding: 1.75rem;
  display: flex;
  flex-direction: column;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #ddd;
}

.card-header h2 {
  font-size: clamp(1.2rem, 3vw, 1.4rem);
  color: #333;
  font-weight: 700; /* Matches SegmentationPage.vue */
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.card-header i {
  color: #2196F3; /* Matches secondary color */
  font-size: clamp(1rem, 2.5vw, 1.2rem);
}

/* Form Styles */
.segment-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  flex-grow: 1;
}

.form-group {
  position: relative;
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.75rem;
  font-size: clamp(0.85rem, 1.8vw, 0.9rem);
  font-weight: 600;
  color: #555;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px; /* Matches SegmentationPage.vue */
  font-size: clamp(0.85rem, 1.8vw, 0.9rem);
  background-color: #fff;
  color: #333;
}

.form-group input:focus,
.form-group select:focus {
  border-color: #4CAF50; /* Matches primary color */
  box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.2);
  outline: none;
}

.char-count {
  position: absolute;
  right: 0.75rem;
  bottom: 0.75rem;
  font-size: clamp(0.75rem, 1.6vw, 0.8rem);
  color: #666;
}

.criteria-selector {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.criteria-row {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  flex-wrap: wrap;
}

.field-select,
.operator-select,
.value-input,
.value-select {
  flex: 1;
  min-width: 140px;
}

.range-inputs {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.range-input {
  flex: 1;
  min-width: 120px;
}

.range-separator {
  color: #666;
  font-size: clamp(0.85rem, 1.8vw, 0.9rem);
}

.criteria-preview {
  background-color: #f9f9f9; /* Matches SegmentationPage.vue */
  border-radius: 4px;
  padding: 0.75rem;
  margin-top: 1rem;
}

.criteria-preview label {
  font-weight: 600;
  margin-bottom: 0.5rem;
  display: block;
  color: #555;
}

.criteria-preview p {
  margin: 0;
  font-family: 'SF Mono', monospace;
  font-size: clamp(0.85rem, 1.8vw, 0.9rem);
  color: #333;
}

.error-text {
  color: #f44336; /* Matches error color */
  font-size: clamp(0.75rem, 1.6vw, 0.8rem);
  margin-top: 0.25rem;
  display: block;
}

.input-error {
  border-color: #f44336 !important;
}

/* File Upload Styles */
.file-upload-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  flex-grow: 1;
}

.upload-area {
  border: 2px dashed #ddd;
  border-radius: 10px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  background-color: #fff;
  flex-grow:0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  color: #666;
}

.upload-content i {
  font-size: clamp(2rem, 40px, 3vw);
  color: #333;
}

.upload-content p {
  margin: 0;
  font-size: clamp(0.95rem, 2vw, 1rem);
}

.upload-content small {
  font-size: clamp(0.75rem, 1.6vw, 0.8rem);
}

.upload-progress {
  width: 100%;
  background-color: #f5f5f7;
  border-radius: 8px;
  overflow: hidden;
  height: 1.75rem;
  position: relative;
}

.progress-bar {
  height: 100%;
  background-color: #4CAF50; /* Matches primary color */
  transition: width 0.3s ease;
}

.upload-progress span {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: clamp(0.75rem, 1.6vw, 0.8rem);
  font-weight: 600;
}

.upload-error {
  color: #f44336;
  background-color: #ffebee; /* Matches error background */
  padding: 0.75rem;
  border-radius: 4px;
  font-size: clamp(0.85rem, 1.8vw, 0.9rem);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.upload-instructions {
  margin-top: 1rem;
  padding: 0;
  background-color: #fff;
}

.upload-instructions h3 {
  font-size: clamp(1rem, 2vw, 1.1rem);
  color: #333;
  margin-bottom: 1rem;
  font-weight: 700;
}

.upload-instructions ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.upload-instructions li {
  margin-bottom: 0.75rem;
  font-size: clamp(0.85rem, 1.8vw, 0.9rem);
  color: #333;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.upload-instructions li i {
  color: #4CAF50; /* Matches primary color */
  font-size: 1rem;
}

/* Button Styles */
.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  font-size: clamp(0.9rem, 2vw, 1rem);
  font-weight: bold;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  min-height: 2.75rem;
}

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: clamp(0.85rem, 1.8vw, 0.9rem);
  min-height: 2rem;
}

.btn-primary {
  background-color: #4CAF50; /* Matches primary color */
  color: #fff;
  border: none;
}

.btn-primary:hover:not(:disabled) {
  background-color: #388E3C;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.btn-primary:disabled {
  background-color: #ddd;
  color: #666;
  cursor: not-allowed;
}

.btn-outline {
  background-color: #f9f9f9;
  border: 1px solid #ccc;
  color: #333;
}

.btn-outline:hover {
  background-color: #e0e0e0;
  transform: translateY(-2px);
}

.btn-icon.danger {
  background: transparent;
  color: #f44336;
  border: none;
  font-size: 1rem;
  padding: 0.5rem;
  border-radius: 50%;
}

.btn-icon.danger:hover {
  background-color: #ffebee;
}

/* Notification Styles */
.notification-container {
  position: fixed;
  top: 2rem;
  right: 1.5rem;
  z-index: 2000;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 320px;
}

.notification {
  background: #fff;
  border-radius: 10px;
  padding: 0.75rem;
  box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: clamp(0.75rem, 1.8vw, 0.9rem);
  color: #333;
  cursor: pointer;
  border-left: 4px solid;
}

.notification.success {
  border-left-color: #4CAF50;
  background-color: #e8f5f5e9; /* Matches success background */
}

.notification.success .success i {
  background-color: #4CAF50;
  color: white;
}

.notification.error {
  border-left-color: #f44336;
  background-color: #ffebee; /* Matches error background */
}

.notification.error i {
  color: #f44336;
}

.notification span {
  flex: 1;
  word-break: break-word;
}

.notification-close {
  color: #666;
  background: none;
  border: none;
  padding: 0.25rem;
  font-size: 0.9rem;
  cursor: pointer;
}

.notification-close:hover {
  color: #f44336;
}

/* Notification Animations */
.notification-enter-active,
.alert-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from,
.alert-leave-to {
  opacity: 0;
  transform: translateX(100px);
}

/* Responsive Design */
@media (max-width: 768px) {
  .segment-management-container {
    padding: 1rem;
  }

  .management-grid {
    grid-template-columns: 1fr;
  }

  .header-actions {
    flex-direction: column;
    gap: 0.75rem;
  }

  .export-button {
    width: 100%;
    justify-content: center;
  }

  .criteria-row {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }

  .field-select,
  .operator-select,
  .value-input,
  .value-select,
  .range-inputs {
    min-width: 100%;
  }

  .notification-container {
    width: 280px;
    right: 10px;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: clamp(1.2rem, 32px, 2rem);
  }

  .management-card {
    padding: 1rem;
  }

  .card-header h2 {
    font-size: clamp(1.1rem, 2.5vw, 1.2rem);
  }

  .upload-area {
    font-size: 0.9rem;
  }

  .btn-primary {
    width: 100%;
  }
}
</style>