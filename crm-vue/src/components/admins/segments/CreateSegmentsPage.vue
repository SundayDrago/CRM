<template>
  <div class="segment-management-container">
    <div class="header">
      <h1 class="page-title">Customer Segmentation</h1>
      <p class="page-subtitle">Create and manage customer segments</p>
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
              placeholder="e.g. Premium Urban Shoppers"
              required
              maxlength="50"
              aria-describedby="segment-name-char-count"
            />
            <span id="segment-name-char-count" class="char-count">{{ newSegment.name.length }}/50</span>
          </div>

          <div class="form-group">
            <label>Segment Criteria</label>
            <div class="criteria-selector">
              <div class="criteria-row" v-for="(criterion, index) in criteria" :key="index">
                <select v-model="criterion.field" @change="resetCriterionValue(index)" class="field-select">
                  <option value="">Select field...</option>
                  <option v-for="field in availableFields" :value="field" :key="field">{{ field }}</option>
                </select>

                <select v-model="criterion.operator" class="operator-select" v-if="criterion.field">
                  <option value="equals">equals</option>
                  <option value="contains">contains</option>
                  <option value="greater">greater than</option>
                  <option value="less">less than</option>
                  <option value="between">between</option>
                </select>

                <template v-if="criterion.field && criterion.operator">
                  <input
                    v-if="!isRangeField(criterion.field) || criterion.operator !== 'between'"
                    v-model="criterion.value"
                    :type="getInputType(criterion.field)"
                    :placeholder="getPlaceholder(criterion.field)"
                    class="value-input"
                  />
                  <div v-else class="range-inputs">
                    <input
                      v-model="criterion.valueFrom"
                      :type="getInputType(criterion.field)"
                      placeholder="From"
                      class="range-input"
                    />
                    <span class="range-separator">to</span>
                    <input
                      v-model="criterion.valueTo"
                      :type="getInputType(criterion.field)"
                      placeholder="To"
                      class="range-input"
                    />
                  </div>
                </template>

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
            </div>
            <button
              type="button"
              @click="addCriterion"
              class="btn btn-outline btn-sm"
            >
              <i class="fas fa-plus"></i> Add Criteria
            </button>
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
                  @click="editSegment(segment)"
                  class="btn-icon"
                  title="Edit"
                  aria-label="Edit segment"
                >
                  <i class="fas fa-edit"></i>
                </button>
                <button
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
            </div>

            <div class="action-buttons">
              <button @click="exportSegmentData(selectedSegment)" class="btn btn-secondary">
                <i class="fas fa-file-export"></i> Export Data
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
              <span class="detail-value">{{ selectedSegment.createdAt || 'N/A' }}</span>
            </div>

            <div class="detail-row">
              <span class="detail-label">Customer Count:</span>
              <span class="detail-value">{{ selectedSegment.count }}</span>
            </div>

            <div class="detail-row">
              <span class="detail-label">Segment Criteria:</span>
              <div class="criteria-details">
                <div v-for="(criterion, index) in parseCriteria(selectedSegment.criteria)"
                     :key="index" class="criterion-item">
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
              @click="editSegment(selectedSegment)"
              class="btn btn-primary"
            >
              <i class="fas fa-edit"></i> Edit Segment
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Segment Modal -->
    <div v-if="showEditModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Edit Segment</h3>
          <button @click="closeModal" class="modal-close" aria-label="Close modal">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="updateSegment">
            <div class="form-group">
              <label>Segment Name</label>
              <input type="text" v-model="editingSegment.name" required />
            </div>

            <div class="form-group">
              <label>Segment Criteria</label>
              <div class="criteria-display">
                <div v-for="(criterion, index) in parseCriteria(editingSegment.criteria)"
                     :key="index" class="criterion-display">
                  {{ criterion.field }} {{ criterion.operator }} {{ criterion.value }}
                </div>
              </div>
            </div>

            <div class="form-group">
              <label>Description (Optional)</label>
              <textarea v-model="editingSegment.description" rows="3"></textarea>
            </div>

            <div class="modal-actions">
              <button type="button" @click="closeModal" class="btn btn-outline">
                Cancel
              </button>
              <button type="submit" class="btn btn-primary" :disabled="isUpdating">
                <span v-if="!isUpdating">Save Changes</span>
                <span v-else><i class="fas fa-spinner fa-spin"></i> Saving...</span>
              </button>
            </div>
          </form>
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
  </div>
</template>

<script>
import axios from 'axios';
import { saveAs } from 'file-saver';

export default {
  name: 'SegmentManagement',
  data() {
    return {
      newSegment: {
        name: '',
        description: ''
      },
      criteria: [
        { field: '', operator: '', value: '', valueFrom: '', valueTo: '' }
      ],
      availableFields: [
        'Age',
        'Gender',
        'Monthly Income',
        'Region',
        'Frequency of Shopping(Regular)',
        'Average spending',
        'Categories',
        'Means of Payment',
        'Enrolled on Jumia Prime or any loyalty program',
        'Reason for your purchase',
        'Device to shop',
        'Internet connection used'
      ],
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
      showDetailsModal: false
    };
  },
  computed: {
    isFormValid() {
      return (
        this.newSegment.name.trim() &&
        this.criteria.every(c => c.field && c.operator &&
          (c.value || (c.operator === 'between' && c.valueFrom && c.valueTo)))
      );
    },
    totalPages() {
      return Math.ceil(this.filteredSegments.length / this.itemsPerPage);
    },
    paginatedSegments() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.filteredSegments.slice(start, end);
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
      this.criteria.push({ field: '', operator: '', value: '', valueFrom: '', valueTo: '' });
    },

    removeCriterion(index) {
      this.criteria.splice(index, 1);
    },

    resetCriterionValue(index) {
      this.criteria[index].value = '';
      this.criteria[index].valueFrom = '';
      this.criteria[index].valueTo = '';
    },

    isRangeField(field) {
      return ['Age', 'Monthly Income', 'Average spending'].includes(field);
    },

    getInputType(field) {
      return ['Monthly Income', 'Average spending'].includes(field) ? 'number' : 'text';
    },

    getPlaceholder(field) {
      if (field === 'Age') return 'e.g. 18-24 or 45+';
      if (field === 'Monthly Income') return 'e.g. 500000';
      if (field === 'Average spending') return 'e.g. 75000';
      return 'Enter value...';
    },

    buildCriteriaString() {
      return this.criteria.map(criterion => {
        if (!criterion.field || !criterion.operator) return '';

        if (criterion.operator === 'between') {
          return `${criterion.field} ${criterion.valueFrom}-${criterion.valueTo}`;
        }

        let operatorSymbol = '';
        switch(criterion.operator) {
          case 'equals': operatorSymbol = '='; break;
          case 'contains': operatorSymbol = 'contains'; break;
          case 'greater': operatorSymbol = '>'; break;
          case 'less': operatorSymbol = '<'; break;
        }

        return `${criterion.field} ${operatorSymbol} ${criterion.value}`;
      }).filter(Boolean).join(', ');
    },

    parseCriteria(criteriaString) {
  if (!criteriaString) return [];
  try {
    return criteriaString.split(', ').map(part => {
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

      const operatorMatch = part.match(/^(.+?) ([<=>]+|contains) (.+)$/);
      if (operatorMatch) {
        let operator = operatorMatch[2];
        switch(operator) {
          case '=': operator = 'equals'; break;
          case '>': operator = 'greater'; break;
          case '<': operator = 'less'; break;
        }

        return {
          field: operatorMatch[1],
          operator: operator,
          value: operatorMatch[3]
        };
      }

      return {
        field: part,
        operator: 'contains',
        value: part
      };
    });
  } catch (error) {
    console.error('Failed to parse criteria:', error);
    return [];
  }
},
    formatCriteria(criteriaString) {
      return criteriaString.replace(/,/g, ', ');
    },

    filterSegments() {
      const query = this.searchQuery.toLowerCase();
      let filtered = this.segments;

      if (query) {
        filtered = filtered.filter(
          segment =>
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
        if (this.segments.some(s => s.name.toLowerCase() === this.newSegment.name.toLowerCase())) {
          throw new Error('Segment name already exists');
        }
        const criteriaString = this.buildCriteriaString();

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
        this.showSuccess('Segment created successfully!');
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
      this.criteria = [
        { field: '', operator: '', value: '', valueFrom: '', valueTo: '' }
      ];
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

        const index = this.segments.findIndex(s => s.id === this.editingSegment.id);
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
        this.segments = this.segments.filter(s => s.id !== this.segmentToDelete.id);
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

    exportSegmentData(segment) {
      try {
        const data = {
          segment: segment.name,
          criteria: segment.criteria,
          customerCount: segment.count,
          exportDate: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        saveAs(blob, `segment_${segment.id}_export.json`);
        this.showSuccess('Segment data exported successfully!');
      } catch (error) {
        console.error('Failed to export segment data:', error);
        this.showError('Failed to export segment data');
      }
    },

    createCampaign(segment) {
      this.showSuccess(`Campaign creation initiated for segment: ${segment.name}`);
      // Placeholder for future campaign integration
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

    showSuccess(message) {
      // Replace with toast notification in production
      alert(message);
    },

    showError(message) {
      // Replace with toast notification in production
      alert(message);
    }
  }
};
</script>

<style scoped>
/* Base Styles */
.segment-management-container {
  width: 100%;
  max-width: 1200px; /* Reduced from 1400px to better fit standard screens */
  margin: 0 auto;
  padding: 15px; /* Reduced padding for tighter fit */
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  color: #333;
  box-sizing: border-box;
}

.header {
  margin-bottom: 25px;
  text-align: center;
}

.page-title {
  font-size: 2rem; /* Slightly smaller for better fit */
  color: #2c3e50;
  margin-bottom: 6px;
  font-weight: 600;
}

.page-subtitle {
  font-size: 1rem;
  color: #7f8c8d;
  margin-top: 0;
  font-weight: 400;
}

/* Grid Layout */
.management-grid {
  display: grid;
  grid-template-columns: minmax(250px, 1fr) minmax(350px, 2fr) minmax(250px, 1fr); /* More flexible column sizing */
  gap: 15px; /* Reduced gap for tighter layout */
  width: 100%;
  box-sizing: border-box;
}

@media (max-width: 1024px) {
  .management-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 768px) {
  .management-grid {
    grid-template-columns: 1fr;
  }
}

/* Card Styles */
.management-card {
  background: white;
  border-radius: 8px; /* Slightly smaller radius */
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
  padding: 15px; /* Reduced padding */
  transition: transform 0.2s, box-shadow 0.2s;
  box-sizing: border-box;
}

.management-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.card-header h2 {
  font-size: 1.2rem; /* Smaller header */
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
  align-items: center;
}

/* Form Styles */
.segment-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.form-group {
  position: relative;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  color: #2c3e50;
  font-size: 0.9rem;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 0.95rem;
  transition: all 0.3s;
  background-color: #f9fafb;
  box-sizing: border-box;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
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
  font-size: 0.75rem;
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
  flex-wrap: wrap; /* Allow wrapping for better fit */
}

.field-select {
  flex: 2;
  min-width: 120px;
}

.operator-select {
  flex: 1;
  min-width: 100px;
}

.value-input {
  flex: 2;
}

.range-inputs {
  flex: 2;
  display: flex;
  align-items: center;
  gap: 6px;
}

.range-input {
  flex: 1;
}

.range-separator {
  color: #7f8c8d;
  font-size: 0.85rem;
}

.criteria-display {
  background-color: #f8f9fa;
  border-radius: 5px;
  padding: 10px;
}

.criterion-display {
  padding: 6px 10px;
  background-color: white;
  border-radius: 3px;
  margin-bottom: 6px;
  border-left: 2px solid #3498db;
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
}

/* Button Styles */
.btn {
  padding: 10px 15px;
  border: none;
  border-radius: 5px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.btn-sm {
  padding: 6px 10px;
  font-size: 0.85rem;
}

.btn-primary {
  background-color: #3498db;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #2980b9;
  transform: translateY(-1px);
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
}

.btn-outline {
  background: transparent;
  border: 1px solid #bdc3c7;
  color: #2c3e50;
}

.btn-outline:hover {
  border-color: #95a5a6;
  background-color: #f8f9fa;
}

.btn-danger {
  background-color: #e74c3c;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background-color: #c0392b;
}

.btn-icon {
  background: transparent;
  border: none;
  color: #7f8c8d;
  cursor: pointer;
  font-size: 0.95rem;
  padding: 5px;
  border-radius: 3px;
  transition: all 0.3s;
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
  margin-bottom: 15px;
}

.search-box input {
  width: 100%;
  padding: 10px 35px 10px 12px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 0.95rem;
  transition: all 0.3s;
}

.search-box input:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

.search-box i {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #95a5a6;
}

/* Segment List Styles */
.segment-list {
  min-height: 250px;
  position: relative;
}

.segment-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #eee;
  transition: background-color 0.2s;
}

.segment-item:hover {
  background-color: #f9fafb;
}

.segment-info {
  flex: 1;
  min-width: 0;
}

.segment-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.segment-header h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #2c3e50;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.segment-badge {
  font-size: 0.65rem;
  padding: 2px 6px;
  border-radius: 10px;
  font-weight: 600;
  text-transform: uppercase;
  background-color: #e8f5e9;
  color: #388e3c;
}

.segment-criteria {
  margin: 0 0 8px 0;
  color: #7f8c8d;
  font-size: 0.85rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.segment-stats {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.stat {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.8rem;
  color: #7f8c8d;
}

.stat i {
  font-size: 0.85rem;
}

.segment-actions {
  display: flex;
  gap: 6px;
}

/* Loading & Empty States */
.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px 15px;
  text-align: center;
  color: #95a5a6;
}

.loading-state i,
.empty-state i {
  font-size: 2rem;
  margin-bottom: 10px;
  color: #bdc3c7;
}

.loading-state p,
.empty-state p {
  margin: 0 0 10px 0;
  font-size: 0.95rem;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #eee;
}

.pagination button {
  background: none;
  border: 1px solid #ddd;
  border-radius: 3px;
  padding: 6px 10px;
  cursor: pointer;
  transition: all 0.3s;
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
  font-size: 0.85rem;
  color: #7f8c8d;
}

/* Analytics Styles */
.analytics-content {
  min-height: 250px;
}

.analytics-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 250px;
  color: #bdc3c7;
  text-align: center;
}

.analytics-placeholder i {
  font-size: 2.5rem;
  margin-bottom: 10px;
}

.analytics-placeholder p {
  font-size: 1rem;
  margin: 0;
}

.analytics-title {
  margin-top: 0;
  color: #2c3e50;
  border-bottom: 1px solid #eee;
  padding-bottom: 8px;
}

.analytics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 10px;
  margin: 15px 0;
}

.metric-card {
  background: white;
  border-radius: 6px;
  padding: 10px;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.05);
  text-align: center;
}

.metric-value {
  font-size: 1.5rem;
  font-weight: 600;
  color: #3498db;
  margin-bottom: 4px;
}

.metric-label {
  font-size: 0.8rem;
  color: #7f8c8d;
}

.action-buttons {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}

/* Modal Styles */
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
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  max-width: 500px; /* Slightly smaller modal */
  width: 90%;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 3px 15px rgba(0, 0, 0, 0.2);
  animation: fadeIn 0.3s ease;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid #eee;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.3rem;
  color: #2c3e50;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.1rem;
  cursor: pointer;
  color: #7f8c8d;
}

.modal-close:hover {
  color: #e74c3c;
}

.modal-body {
  padding: 15px;
}

.segment-details .detail-row {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.detail-label {
  font-weight: 500;
  color: #2c3e50;
  flex: 0 0 100px;
}

.detail-value {
  color: #34495e;
  flex: 1;
}

.criteria-details {
  background: #f8f9fa;
  padding: 8px;
  border-radius: 5px;
}

.criterion-item {
  padding: 6px 0;
  display: flex;
  gap: 8px;
}

.criterion-field {
  font-weight: 500;
}

.criterion-operator {
  color: #7f8c8d;
}

.criterion-value {
  color: #3498db;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 10px 15px;
  border-top: 1px solid #eee;
}

.confirm-modal .warning-text {
  color: #e74c3c;
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 12px 0;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Responsive Adjustments */
@media (max-width: 768px) {
  .criteria-row {
    flex-direction: column;
    align-items: stretch;
  }
  .field-select,
  .operator-select,
  .value-input,
  .range-inputs {
    flex: none;
    width: 100%;
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
    width: 95%;
    max-width: 400px;
  }
}

@media (max-width: 480px) {
  .segment-management-container {
    padding: 10px;
  }
  .management-card {
    padding: 10px;
  }
  .btn {
    padding: 8px 12px;
    font-size: 0.9rem;
  }
}
</style>