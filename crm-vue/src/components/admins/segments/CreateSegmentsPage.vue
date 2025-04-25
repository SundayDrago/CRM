<template>
  <div class="segment-management-container">
    <div class="header">
      <h1 class="page-title">Customer Segmentation</h1>
      <p class="page-subtitle">Create, manage, and analyze customer segments</p>
    </div>

    <div class="management-grid">
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
          >
            <span v-if="!isCreating">
              <i class="fas fa-save"></i> Create Segment
            </span>
            <span v-else><i class="fas fa-spinner fa-spin"></i> Creating...</span>
          </button>
        </form>
      </div>

      <!-- Import/Export Card -->
      <div class="management-card">
        <div class="card-header">
          <h2><i class="fas fa-file-import"></i> Import/Export Segments</h2>
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
              <p>Drag & drop files here or click to browse</p>
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

          <div class="export-options">
            <h3>Export Segments</h3>
            <div class="export-buttons">
              <button @click="exportAllSegments('csv')" class="btn btn-outline">
                <i class="fas fa-file-csv"></i> Export as CSV
              </button>
              <button @click="exportAllSegments('json')" class="btn btn-outline">
                <i class="fas fa-file-code"></i> Export as JSON
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- View Segments Card -->
      <div class="management-card">
        <div class="card-header">
          <h2><i class="fas fa-list-ul"></i> Customer Segments</h2>
          <div class="card-actions">
            <button @click="refreshSegments" class="btn-icon" title="Refresh" aria-label="Refresh segments">
              <i class="fas fa-sync-alt"></i>
            </button>
          </div>
        </div>

        <div class="search-box">
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Search segments..."
            @input="filterSegments"
            aria-label="Search segments"
          />
          <i class="fas fa-search"></i>
        </div>

        <div class="segment-list">
          <div v-if="isLoading" class="loading-state">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Loading segments...</p>
          </div>
          <div v-else-if="filteredSegments.length === 0" class="empty-state">
            <i class="fas fa-inbox"></i>
            <p>No segments found</p>
            <button @click="refreshSegments" class="btn btn-outline">
              <i class="fas fa-sync-alt"></i> Refresh
            </button>
          </div>

          <ul v-else>
            <li v-for="segment in paginatedSegments" :key="segment.id" class="segment-item">
              <div class="segment-info">
                <div class="segment-header">
                  <h3>{{ segment.name }}</h3>
                  <span class="segment-badge">
                    {{ segment.source }}
                  </span>
                </div>
                <p class="segment-criteria">{{ formatCriteria(segment.criteria) }}</p>
                <div class="segment-stats">
                  <span class="stat">
                    <i class="fas fa-users"></i> {{ segment.count }} customers
                  </span>
                  <span class="stat">
                    <i class="fas fa-calendar-alt"></i> {{ formatDate(segment.createdAt) }}
                  </span>
                </div>
              </div>
              <div class="segment-actions">
                <button
                  @click="viewSegmentDetails(segment)"
                  class="btn-icon"
                  title="View Details"
                  aria-label="View segment details"
                >
                  <i class="fas fa-eye"></i>
                </button>
                <button
                  @click="downloadSegment(segment, 'json')"
                  class="btn-icon"
                  title="Download JSON"
                  aria-label="Download segment as JSON"
                >
                  <i class="fas fa-file-code"></i>
                </button>
                <button
                  @click="downloadSegment(segment, 'csv')"
                  class="btn-icon"
                  title="Download CSV"
                  aria-label="Download segment as CSV"
                >
                  <i class="fas fa-file-csv"></i>
                </button>
                <button
                  v-if="segment.source === 'Custom'"
                  @click="confirmDelete(segment)"
                  class="btn-icon danger"
                  title="Delete"
                  aria-label="Delete segment"
                >
                  <i class="fas fa-trash-alt"></i>
                </button>
              </div>
            </li>
          </ul>
        </div>

        <div class="pagination" v-if="filteredSegments.length > itemsPerPage">
          <button @click="prevPage" :disabled="currentPage === 1" aria-label="Previous page">
            <i class="fas fa-chevron-left"></i>
          </button>
          <span>Page {{ currentPage }} of {{ totalPages }}</span>
          <button @click="nextPage" :disabled="currentPage === totalPages" aria-label="Next page">
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>

      <!-- Segment Analytics Card -->
      <div class="management-card">
        <div class="card-header">
          <h2><i class="fas fa-chart-bar"></i> Segment Analytics</h2>
        </div>

        <div class="analytics-content">
          <div v-if="!selectedSegment" class="analytics-placeholder">
            <i class="fas fa-chart-pie"></i>
            <p>Select a segment to view analytics</p>
          </div>

          <div v-else class="segment-analytics">
            <h3 class="analytics-title">{{ selectedSegment.name }}</h3>

            <div class="analytics-grid">
              <div class="metric-card">
                <div class="metric-value">{{ selectedSegment.count }}</div>
                <div class="metric-label">Total Customers</div>
              </div>
              <div class="metric-card">
                <div class="metric-value">{{ calculateGrowthRate(selectedSegment) }}%</div>
                <div class="metric-label">Growth Rate</div>
              </div>
              <div class="metric-card">
                <div class="metric-value">{{ formatDate(selectedSegment.createdAt) }}</div>
                <div class="metric-label">Created On</div>
              </div>
            </div>

            <div class="action-buttons">
              <button @click="exportSegmentData(selectedSegment, 'csv')" class="btn btn-secondary">
                <i class="fas fa-file-csv"></i> Export as CSV
              </button>
              <button @click="exportSegmentData(selectedSegment, 'json')" class="btn btn-secondary">
                <i class="fas fa-file-code"></i> Export as JSON
              </button>
              <button @click="createCampaign(selectedSegment)" class="btn btn-primary">
                <i class="fas fa-bullhorn"></i> Create Campaign
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Segment Details Modal -->
    <div v-if="showDetailsModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ selectedSegment.name }}</h3>
          <button @click="closeModal" class="modal-close" aria-label="Close modal">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="segment-details">
            <div class="detail-row">
              <span class="detail-label">Segment Type:</span>
              <span class="detail-value">{{ selectedSegment.source }}</span>
            </div>

            <div class="detail-row">
              <span class="detail-label">Creation Date:</span>
              <span class="detail-value">{{ formatDate(selectedSegment.createdAt) }}</span>
            </div>

            <div class="detail-row">
              <span class="detail-label">Customer Count:</span>
              <span class="detail-value">{{ selectedSegment.count }}</span>
            </div>

            <div class="detail-row">
              <span class="detail-label">Segment Criteria:</span>
              <div class="criteria-details">
                <div
                  v-for="(criterion, index) in parseCriteria(selectedSegment.criteria)"
                  :key="index"
                  class="criterion-item"
                >
                  <span class="criterion-field">{{ criterion.field }}</span>
                  <span class="criterion-operator">{{ criterion.operator }}</span>
                  <span class="criterion-value">{{ criterion.value }}</span>
                </div>
              </div>
            </div>

            <div class="detail-row" v-if="selectedSegment.description">
              <span class="detail-label">Description:</span>
              <span class="detail-value">{{ selectedSegment.description }}</span>
            </div>
          </div>

          <div class="modal-actions">
            <button @click="closeModal" class="btn btn-outline">
              Close
            </button>
            <button
              @click="downloadSegment(selectedSegment, 'json')"
              class="btn btn-secondary"
            >
              <i class="fas fa-file-code"></i> Export JSON
            </button>
            <button
              @click="downloadSegment(selectedSegment, 'csv')"
              class="btn btn-secondary"
            >
              <i class="fas fa-file-csv"></i> Export CSV
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content confirm-modal">
        <div class="modal-header">
          <h3>Confirm Deletion</h3>
          <button @click="closeModal" class="modal-close" aria-label="Close modal">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <p>Are you sure you want to delete the segment "{{ segmentToDelete?.name }}"?</p>
          <p class="warning-text">
            <i class="fas fa-exclamation-triangle"></i> This will remove the segment and all associated data.
          </p>
          <div class="modal-actions">
            <button @click="closeModal" class="btn btn-outline">
              Cancel
            </button>
            <button @click="deleteSegment" class="btn btn-danger" :disabled="isDeleting">
              <span v-if="!isDeleting">Delete Segment</span>
              <span v-else><i class="fas fa-spinner fa-spin"></i> Deleting...</span>
            </button>
          </div>
        </div>
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
      segments: [],
      filteredSegments: [],
      searchQuery: '',
      currentPage: 1,
      itemsPerPage: 5,
      isCreating: false,
      isLoading: false,
      showEditModal: false,
      editingSegment: {
        id: null,
        name: '',
        criteria: '',
        description: '',
        count: 0,
        source: 'Custom'
      },
      isUpdating: false,
      showDeleteModal: false,
      segmentToDelete: null,
      isDeleting: false,
      selectedSegment: null,
      showDetailsModal: false,
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
    totalPages() {
      return Math.ceil(this.filteredSegments.length / this.itemsPerPage);
    },
    paginatedSegments() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.filteredSegments.slice(start, end);
    },
    criteriaString() {
      return this.buildCriteriaString();
    }
  },
  created() {
    this.loadSegments();
  },
  methods: {
    async loadSegments() {
      this.isLoading = true;
      try {
        const response = await axios.get('http://127.0.0.1:5000/segments');
        this.segments = response.data;
        this.filteredSegments = [...this.segments];
      } catch (error) {
        console.error('Failed to load segments:', error);
        this.showError('Failed to load segments. Please try again.');
      } finally {
        this.isLoading = false;
      }
    },
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
      this.criteria[index].valueTo ='';
      this.criteria[index].errors = {};
    },
    hasPredefinedValues(field) {
      return field in this.valueOptions;
    },
    getAvailableOperators(field) {
      const numericFields = ['Monthly Income', 'Average spending', 'Rate of Satisfaction', 'Rate of availability of products'];
      const rangeFields = ['Age', 'Monthly Income', 'Average spending', 'Rate of Satisfaction', 'Rate of availability of products'];

      // Base operators for all fields
      const operators = [{ value: 'equals', label: 'equals' }];

      // Add range operators for fields that support 'between'
      if (rangeFields.includes(field)) {
        operators.push({ value: 'between', label: 'between' });
      }

      // Add greater/less operators for numeric fields
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
    parseCriteria(criteriaString) {
      if (!criteriaString) return [];
      try {
        return criteriaString.split(', ').map((part) => {
          const betweenMatch = part.match(/^(.+?) (\d+)-(\d+)$/);
          if (betweenMatch) {
            return {
              field: betweenMatch[1],
              operator: 'between',
              value: `${betweenMatch[2]}-${betweenMatch[3]}`,
              valueFrom: betweenMatch[2],
              valueTo: betweenMatch[3]
            };
          }

          const operatorMatch = part.match(/^(.+?) ([<>])?(.+)$/);
          if (operatorMatch) {
            const operator = operatorMatch[2];
            return {
              field: operatorMatch[1],
              operator: operator === '>' ? 'greater' : operator === '<' ? 'less' : 'equals',
              value: operatorMatch[2] ? operatorMatch[3] : operatorMatch[2]
            };
          }

          return {
            field: part.split(' ')[0],
            operator: 'equals',
            value: part.split(' ').slice(1).join(' ')
          };
        });
      } catch (error) {
        console.error('Failed to parse criteria:', error);
        return [];
      }
    },
    formatCriteria(value) {
      if (!value || typeof value !== 'string') return '';
      return value.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
    },
    filterSegments() {
      const query = this.searchQuery.toLowerCase();
      let filtered = this.segments;

      if (query) {
        filtered = filtered.filter(
          (segment) =>
            segment.name.toLowerCase().includes(query) ||
            segment.criteria.toLowerCase().includes(query) ||
            (segment.description && segment.description.toLowerCase().includes(query))
        );
      }

      this.filteredSegments = filtered;
      this.currentPage = 1;
    },
    async createSegment() {
      this.isCreating = true;
      try {
        if (this.segments.some((s) => s.name.toLowerCase() === this.newSegment.name.toLowerCase())) {
          throw new Error('Segment name already exists');
        }
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

        const newSegment = {
          id: response.data.id,
          name: this.newSegment.name,
          criteria: criteriaString,
          description: this.newSegment.description,
          count: response.data.count || 0,
          source: 'Custom',
          createdAt: new Date().toISOString()
        };

        this.segments.unshift(newSegment);
        this.filterSegments();
        this.resetForm();
        this.showSuccess(`Segment "${newSegment.name}" created with ${newSegment.count} customers!`);
      } catch (error) {
        console.error('Failed to create segment:', error);
        const message = error.response?.data?.error || error.message || 'An unexpected error occurred';
        this.showError(`Failed to create segment: ${message}`);
      } finally {
        this.isCreating = false;
      }
    },
    resetForm() {
      this.newSegment = {
        name: '',
        description: ''
      };
      this.criteria = [{ field: '', operator: '', value: '', valueFrom: '', valueTo: '', errors: {} }];
    },
    viewSegmentDetails(segment) {
      this.selectedSegment = segment;
      this.showDetailsModal = true;
    },
    editSegment(segment) {
      this.closeModal();
      this.editingSegment = { ...segment };
      this.showEditModal = true;
    },
    async updateSegment() {
      this.isUpdating = true;
      try {
        const response = await axios.put(
          `http://127.0.0.1:5000/segments/${this.editingSegment.id}`,
          this.editingSegment
        );

        const index = this.segments.findIndex((s) => s.id === this.editingSegment.id);
        if (index !== -1) {
          this.segments[index] = {
            ...this.editingSegment,
            count: response.data.count || this.editingSegment.count
          };
          this.filterSegments();
          this.closeModal();
          this.showSuccess('Segment updated successfully!');
        }
      } catch (error) {
        console.error('Failed to update segment:', error);
        const message = error.response?.data?.error || error.message || 'An unexpected error occurred';
        this.showError(`Failed to update segment: ${message}`);
      } finally {
        this.isUpdating = false;
      }
    },
    confirmDelete(segment) {
      this.segmentToDelete = segment;
      this.showDeleteModal = true;
    },
    async deleteSegment() {
      this.isDeleting = true;
      try {
        await axios.delete(`http://127.0.0.1:5000/segments/${this.segmentToDelete.id}`);
        this.segments = this.segments.filter((s) => s.id !== this.segmentToDelete.id);
        if (this.selectedSegment?.id === this.segmentToDelete.id) {
          this.selectedSegment = null;
        }
        this.filterSegments();
        this.closeModal();
        this.showSuccess('Segment deleted successfully!');
      } catch (error) {
        console.error('Failed to delete segment:', error);
        const message = error.response?.data?.error || error.message || 'An unexpected error occurred';
        this.showError(`Failed to delete segment: ${message}`);
      } finally {
        this.isDeleting = false;
      }
    },
    exportSegmentData(segment, format = 'json') {
      try {
        const data = {
          segment: segment.name,
          criteria: segment.criteria,
          customerCount: segment.count,
          description: segment.description,
          createdAt: segment.createdAt,
          exportDate: new Date().toISOString()
        };

        let blob, filename;
        if (format === 'csv') {
          const csv = Papa.unparse([data]);
          blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
          filename = `segment_${segment.id}_export.csv`;
        } else {
          blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
          filename = `segment_${segment.id}_export.json`;
        }

        saveAs(blob, filename);
        this.showSuccess(`Segment data exported as ${format.toUpperCase()} successfully!`);
      } catch (error) {
        console.error('Failed to export segment data:', error);
        this.showError('Failed to export segment data');
      }
    },
    downloadSegment(segment, format) {
      this.exportSegmentData(segment, format);
    },
    async exportAllSegments(format) {
      try {
        const data = this.segments.map((segment) => ({
          id: segment.id,
          name: segment.name,
          criteria: segment.criteria,
          customerCount: segment.count,
          description: segment.description,
          createdAt: segment.createdAt,
          source: segment.source
        }));

        let blob, filename;
        if (format === 'csv') {
          const csv = Papa.unparse(data);
          blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
          filename = `all_segments_export_${new Date().toISOString().split('T')[0]}.csv`;
        } else {
          blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
          filename = `all_segments_export_${new Date().toISOString().split('T')[0]}.json`;
        }

        saveAs(blob, filename);
        this.showSuccess(`All segments exported as ${format.toUpperCase()} successfully!`);
      } catch (error) {
        console.error('Failed to export all segments:', error);
        this.showError('Failed to export segments');
      }
    },
    createCampaign(segment) {
      this.showSuccess(`Campaign creation initiated for segment: ${segment.name}`);
    },
    refreshSegments() {
      this.loadSegments();
      this.searchQuery = '';
    },
    closeModal() {
      this.showEditModal = false;
      this.showDeleteModal = false;
      this.showDetailsModal = false;
      this.segmentToDelete = null;
      this.selectedSegment = null;
    },
    nextPage() {
      if (this.currentPage < this.totalPages) this.currentPage++;
    },
    prevPage() {
      if (this.currentPage > 1) this.currentPage--;
    },
    formatDate(dateString) {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    },
    calculateGrowthRate(segment) {
      if (!segment.count || !segment.createdAt) return 0;

      const createdDate = new Date(segment.createdAt);
      const daysSinceCreation = (Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24);

      const baseGrowth = Math.min(segment.count / 100, 20);
      const timeFactor = Math.min(daysSinceCreation / 30, 2);
      const growthRate = baseGrowth * timeFactor;

      return Math.round(growthRate * 10) / 10;
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
          this.loadSegments();
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
/* Base Styles */
.segment-management-container {
  width: 100%;
  max-width: min(98vw, 1400px);
  margin: 0 auto;
  padding: clamp(12px, 2vw, 16px);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  color: #333;
  box-sizing: border-box;
}

.header {
  margin-bottom: clamp(16px, 3vw, 24px);
  text-align: center;
}

.page-title {
  font-size: clamp(1.8rem, 5vw, 2rem);
  color: #2c3e50;
  margin-bottom: 8px;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.page-subtitle {
  font-size: clamp(0.9rem, 2.5vw, 1rem);
  color: #7f8c8d;
  margin-top: 0;
  font-weight: 400;
}

/* Grid Layout */
.management-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(280px, 100%), 1fr));
  gap: clamp(12px, 2vw, 16px);
  width: 100%;
}

/* Card Styles */
.management-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  padding: clamp(14px, 2vw, 18px);
  transition: transform 0.2s, box-shadow 0.2s;
  display: flex;
  flex-direction: column;
}

.management-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #eee;
}

.card-header h2 {
  font-size: clamp(1.1rem, 3vw, 1.2rem);
  color: #2c3e50;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
}

.card-header i {
  color: #3498db;
}

.card-actions {
  display: flex;
  gap: 8px;
}

/* Form Styles */
.segment-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex-grow: 1;
}

.form-group {
  position: relative;
  margin-bottom: 8px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  color: #2c3e50;
  font-size: clamp(0.85rem, 2.2vw, 0.9rem);
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: clamp(8px, 1.8vw, 10px);
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: clamp(0.9rem, 2.5vw, 0.95rem);
  transition: all 0.3s;
  background-color: #f9fafb;
  box-sizing: border-box;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
  background-color: white;
}

.form-group textarea {
  resize: vertical;
  min-height: 80px;
}

.char-count {
  position: absolute;
  right: 10px;
  bottom: 10px;
  font-size: clamp(0.7rem, 2vw, 0.75rem);
  color: #95a5a6;
}

.criteria-selector {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 10px;
}

.criteria-row {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}

.field-select,
.operator-select,
.value-input {
  flex: 1;
  min-width: min(120px, 100%);
}

.range-inputs {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.range-input {
  flex: 1;
  min-width: min(100px, 100%);
}

.range-separator {
  color: #7f8c8d;
  font-size: clamp(0.8rem, 2.2vw, 0.85rem);
}

.criteria-display {
  background-color: #f8f9fa;
  border-radius: 6px;
  padding: 10px;
  margin-bottom: 10px;
}

.criterion-display {
  padding: 6px 10px;
  background-color: white;
  border-radius: 4px;
  margin-bottom: 6px;
  border-left: 3px solid #3498db;
  font-family: 'Courier New', monospace;
  font-size: clamp(0.85rem, 2.2vw, 0.9rem);
}

/* File Upload Styles */
.file-upload-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex-grow: 1;
}

.upload-area {
  border: 2px dashed #bdc3c7;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  background-color: #f8f9fa;
  flex-grow: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-area:hover,
.upload-area.drag-active {
  border-color: #3498db;
  background-color: rgba(52, 152, 219, 0.05);
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: #7f8c8d;
}

.upload-content i {
  font-size: clamp(1.5rem, 5vw, 2rem);
  color: #bdc3c7;
}

.upload-content p {
  margin: 0;
  font-size: clamp(0.9rem, 2.5vw, 1rem);
}

.upload-content small {
  font-size: clamp(0.75rem, 2.2vw, 0.8rem);
}

.upload-progress {
  width: 100%;
  background-color: #ecf0f1;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  height: 24px;
}

.progress-bar {
  height: 100%;
  background-color: #3498db;
  transition: width 0.3s;
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
  color: white;
  font-size: clamp(0.75rem, 2.2vw, 0.8rem);
  font-weight: 500;
}

.upload-error {
  color: #e74c3c;
  background-color: #fdedec;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: clamp(0.8rem, 2.2vw, 0.85rem);
  display: flex;
  align-items: center;
  gap: 6px;
}

.export-options {
  margin-top: 16px;
}

.export-options h3 {
  font-size: clamp(0.95rem, 2.8vw, 1rem);
  color: #2c3e50;
  margin-bottom: 10px;
}

.export-buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

/* Button Styles */
.btn {
  padding: clamp(8px, 1.8vw, 10px) clamp(12px, 2.2vw, 14px);
  border: none;
  border-radius: 6px;
  font-size: clamp(0.9rem, 2.5vw, 0.95rem);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  touch-action: manipulation;
  min-height: 44px;
}

.btn-sm {
  padding: clamp(6px, 1.2vw, 7px) clamp(8px, 1.8vw, 10px);
  font-size: clamp(0.8rem, 2.2vw, 0.85rem);
  min-height: 36px;
}

.btn-primary {
  background-color: #3498db;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #2980b9;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(41, 128, 185, 0.3);
}

.btn-primary:disabled {
  background-color: #bdc3c7;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: #ecf0f1;
  color: #2c3e50;
}

.btn-secondary:hover {
  background-color: #d5dbdb;
  box-shadow: 0 2px 8px rgba(189, 195, 199, 0.3);
}

.btn-outline {
  background: transparent;
  border: 1px solid #bdc3c7;
  color: #2c3e50;
}

.btn-outline:hover {
  border-color: #95a5a6;
  background-color: #f8f9fa;
  box-shadow: 0 2px 8px rgba(189, 195, 199, 0.2);
}

.btn-danger {
  background-color: #e74c3c;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background-color: #c0392b;
  box-shadow: 0 2px 8px rgba(231, 76, 60, 0.3);
}

.btn-icon {
  background: transparent;
  border: none;
  color: #7f8c8d;
  cursor: pointer;
  font-size: clamp(0.9rem, 2.5vw, 0.95rem);
  padding: clamp(6px, 1.2vw, 8px);
  border-radius: 4px;
  transition: all 0.3s;
  min-width: 36px;
  min-height: 36px;
}

.btn-icon:hover {
  background-color: #f1f1f1;
  color: #3498db;
}

.btn-icon.danger {
  color: #e74c3c;
}

.btn-icon.danger:hover {
  background-color: #fdedec;
}

/* Search Box */
.search-box {
  position: relative;
  margin-bottom: 12px;
}

.search-box input {
  width: 100%;
  padding: clamp(8px, 1.8vw, 10px) clamp(8px, 1.8vw, 10px) clamp(8px, 1.8vw, 10px) 36px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: clamp(0.9rem, 2.5vw, 0.95rem);
  transition: all 0.3s;
}

.search-box input:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
}

.search-box i {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #95a5a6;
  font-size: clamp(0.9rem, 2.5vw, 0.95rem);
}

/* Segment List Styles */
.segment-list {
  min-height: 200px;
  position: relative;
  flex-grow: 1;
}

.segment-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: clamp(10px, 1.8vw, 12px) 0;
  border-bottom: 1px solid #eee;
  transition: background-color 0.2s;
}

.segment-item:hover {
  background-color: #f9fafb;
}

.segment-info {
  flex: 1;
  min-width: 0;
  margin-right: 10px;
}

.segment-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.segment-header h3 {
  margin: 0;
  font-size: clamp(0.95rem, 2.8vw, 1rem);
  font-weight: 600;
  color: #2c3e50;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.segment-badge {
  font-size: clamp(0.6rem, 2vw, 0.65rem);
  padding: 3px 6px;
  border-radius: 10px;
  font-weight: 600;
  text-transform: uppercase;
  background-color: #e8f5e9;
  color: #388e3c;
  white-space: nowrap;
}

.segment-criteria {
  margin: 0 0 8px 0;
  color: #7f8c8d;
  font-size: clamp(0.8rem, 2.2vw, 0.85rem);
  word-break: break-word;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.segment-stats {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.stat {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: clamp(0.75rem, 2vw, 0.8rem);
  color: #7f8c8d;
}

.stat i {
  font-size: clamp(0.8rem, 2.2vw, 0.85rem);
}

.segment-actions {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

/* Loading & Empty States */
.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: clamp(20px, 5vw, 24px) 10px;
  text-align: center;
  color: #95a5a6;
  flex-grow: 1;
}

.loading-state i,
.empty-state i {
  font-size: clamp(1.5rem, 5vw, 2rem);
  margin-bottom: 10px;
  color: #bdc3c7;
}

.loading-state p,
.empty-state p {
  margin: 0 0 12px 0;
  font-size: clamp(0.9rem, 2.5vw, 0.95rem);
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #eee;
}

.pagination button {
  background: none;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: clamp(6px, 1.2vw, 7px) clamp(8px, 1.8vw, 10px);
  cursor: pointer;
  transition: all 0.3s;
  min-width: 36px;
  min-height: 36px;
}

.pagination button:hover:not(:disabled) {
  background-color: #f1f1f1;
  border-color: #95a5a6;
}

.pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination span {
  font-size: clamp(0.8rem, 2.2vw, 0.85rem);
  color: #7f8c8d;
}

/* Analytics Styles */
.analytics-content {
  min-height: 200px;
  flex-grow: 1;
}

.analytics-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #bdc3c7;
  text-align: center;
  flex-grow: 1;
}

.analytics-placeholder i {
  font-size: clamp(2rem, 5vw, 2.5rem);
  margin-bottom: 12px;
}

.analytics-placeholder p {
  font-size: clamp(0.95rem, 2.8vw, 1rem);
  margin: 0;
}

.analytics-title {
  margin-top: 0;
  color: #2c3e50;
  border-bottom: 1px solid #eee;
  padding-bottom: 8px;
  font-size: clamp(1.1rem, 3vw, 1.2rem);
}

.analytics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(120px, 100%), 1fr));
  gap: 12px;
  margin: 12px 0;
}

.metric-card {
  background: white;
  border-radius: 6px;
  padding: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  text-align: center;
}

.metric-value {
  font-size: clamp(1.2rem, 3.8vw, 1.4rem);
  font-weight: 600;
  color: #3498db;
  margin-bottom: 5px;
}

.metric-label {
  font-size: clamp(0.75rem, 2.2vw, 0.8rem);
  color: #7f8c8d;
}

.action-buttons {
  display: flex;
  gap: 10px;
  margin-top: 12px;
  flex-wrap: wrap;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 12px;
  backdrop-filter: blur(2px);
}

.modal-content {
  background: white;
  border-radius: 8px;
  width: min(92vw, 500px);
  max-height: min(92vh, 700px);
  overflow-y: auto;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
  animation: fadeIn 0.3s ease;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: clamp(12px, 2vw, 16px);
  border-bottom: 1px solid #eee;
  position: sticky;
  top: 0;
  background: white;
  z-index: 10;
}

.modal-header h3 {
  margin: 0;
  font-size: clamp(1.2rem, 3.2vw, 1.3rem);
  color: #2c3e50;
}

.modal-close {
  background: none;
  border: none;
  font-size: clamp(1rem, 2.8vw, 1.1rem);
  cursor: pointer;
  color: #7f8c8d;
  padding: 4px;
}

.modal-close:hover {
  color: #e74c3c;
}

.modal-body {
  padding: clamp(12px, 2vw, 16px);
}

.segment-details .detail-row {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.detail-label {
  font-weight: 500;
  color: #2c3e50;
  flex: 0 0 clamp(100px, 30vw, 120px);
  font-size: clamp(0.85rem, 2.2vw, 0.9rem);
}

.detail-value {
  color: #34495e;
  flex: 1;
  word-break: break-word;
  font-size: clamp(0.85rem, 2.2vw, 0.9rem);
}

.criteria-details {
  background: #f8f9fa;
  padding: 8px;
  border-radius: 6px;
  margin-top: 5px;
}

.criterion-item {
  padding: 6px 0;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
}

.criterion-field {
  font-weight: 500;
  font-size: clamp(0.8rem, 2.2vw, 0.85rem);
}

.criterion-operator {
  color: #7f8c8d;
  font-size: clamp(0.8rem, 2.2vw, 0.85rem);
}

.criterion-value {
  color: #3498db;
  font-size: clamp(0.8rem, 2.2vw, 0.85rem);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: clamp(8px, 1.8vw, 12px) clamp(12px, 2.2vw, 16px);
  border-top: 1px solid #eee;
  flex-wrap: wrap;
  position: sticky;
  bottom: 0;
  background: white;
}

.confirm-modal .warning-text {
  color: #e74c3c;
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 10px 0;
  font-size: clamp(0.85rem, 2.2vw, 0.9rem);
}

/* Notification Styles */
.notification-container {
  position: fixed;
  top: 16px;
  right: 16px;
  z-index: 2000;
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: min(90vw, 320px);
}

.notification {
  background: white;
  border-radius: 6px;
  padding: clamp(10px, 1.8vw, 12px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: clamp(0.85rem, 2.2vw, 0.9rem);
  color: #2c3e50;
  cursor: pointer;
  transition: all 0.3s;
  border-left: 4px solid;
}

.notification.success {
  border-left-color: #2ecc71;
}

.notification.success i {
  color: #2ecc71;
}

.notification.error {
  border-left-color: #e74c3c;
}

.notification.error i {
  color: #e74c3c;
}

.notification span {
  flex: 1;
  word-break: break-word;
}

.notification-close {
  background: none;
  border: none;
  color: #95a5a6;
  cursor: pointer;
  padding: 4px;
  font-size: clamp(0.8rem, 2.2vw, 0.85rem);
  transition: color 0.3s;
}

.notification-close:hover {
  color: #e74c3c;
}

/* Notification Animations */
.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from,
.notification-leave-to {
  opacity: 0;
  transform: translateX(100px);
}

.notification-leave-active {
  position: absolute;
}

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Responsive Breakpoints */
@media (max-width: 1024px) {
  .management-grid {
    grid-template-columns: repeat(auto-fit, minmax(min(280px, 100%), 1fr));
  }
}

@media (max-width: 768px) {
  .management-grid {
    grid-template-columns: 1fr;
  }
  .criteria-row {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }
  .field-select,
  .operator-select,
  .value-input,
  .range-inputs {
    min-width: 100%;
  }
  .segment-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  .segment-actions {
    width: 100%;
    justify-content: flex-end;
  }
  .modal-content {
    width: min(94vw, 400px);
  }
}

@media (max-width: 480px) {
  .segment-management-container {
    padding: 8px;
  }
  .management-card {
    padding: 12px;
  }
  .export-buttons {
    flex-direction: column;
  }
  .export-buttons .btn {
    width: 100%;
  }
  .action-buttons {
    flex-direction: column;
  }
  .action-buttons .btn {
    width: 100%;
  }
  .modal-actions {
    flex-direction: column-reverse;
  }
  .modal-actions .btn {
    width: 100%;
  }
  .notification-container {
    top: 8px;
    right: 8px;
    width: min(92vw, 280px);
  }
  .notification {
    font-size: clamp(0.8rem, 2vw, 0.85rem);
  }
}

@media (min-width: 1440px) {
  .segment-management-container {
    max-width: min(90vw, 1600px);
  }
  .management-grid {
    grid-template-columns: repeat(3, minmax(320px, 1fr));
  }
}

/* High-DPI Displays */
@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
  .management-card,
  .modal-content,
  .notification {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  }
}

/* Touch Devices */
@media (hover: none) {
  .btn-icon {
    min-width: 44px;
    min-height: 44px;
    padding: 8px;
  }
  .btn {
    padding: clamp(10px, 2.2vw, 12px) clamp(14px, 2.8vw, 16px);
    min-height: 48px;
  }
  .segment-actions .btn-icon {
    min-width: 40px;
    min-height: 40px;
  }
  .notification {
    padding: clamp(12px, 2.2vw, 14px);
  }
  .notification-close {
    min-width: 40px;
    min-height: 40px;
    padding: 8px;
  }
}
</style>