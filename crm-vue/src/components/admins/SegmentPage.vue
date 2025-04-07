<template>
  <div class="segmentation-page">
    <div class="header">
      <h1>Customer Segments</h1>
      <div class="header-actions">
        <button @click="fetchAllSegments" class="refresh-button">
          <span>Refresh Segments</span>
        </button>
        <button @click="loadModelSegments" class="model-button">
          <span>Load Model Segments</span>
        </button>
      </div>
    </div>

    <!-- Loading Indicator -->
    <div v-if="isLoading" class="loading">
      <div class="spinner"></div>
      <p>Loading segments...</p>
    </div>

    <!-- Segment List in Enhanced Table Format -->
    <div v-else class="segment-content">
      <div v-if="segments.length" class="segment-table">
        <table>
          <thead>
            <tr>
              <th>Segment Name</th>
              <th>Customer Count</th>
              <th>Criteria</th>
              <th>Source</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="segment in segments" :key="segment.id" class="segment-row">
              <td>{{ segment.name }}</td>
              <td>{{ segment.count.toLocaleString() }}</td>
              <td class="criteria-cell">{{ segment.criteria || 'N/A' }}</td>
              <td>
                <span class="source-tag" :class="segment.source.toLowerCase()">
                  {{ segment.source || 'Manual' }}
                </span>
              </td>
              <td class="actions-cell">
                <button @click="openEditModal(segment)" class="edit-button">
                  <i class="icon-edit"></i>
                </button>
                <button @click="confirmDelete(segment.id)" class="delete-button">
                  <i class="icon-delete"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="no-segments">
        <div class="empty-state">
          <i class="icon-segment"></i>
          <h3>No segments available</h3>
          <p>Create new segments or load model segments to get started</p>
          <button @click="loadModelSegments" class="primary-button">
            Load Model Segments
          </button>
        </div>
      </div>
    </div>

    <!-- Edit Segment Modal -->
    <div v-if="showEditModal" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Edit Segment Criteria</h3>
          <button @click="closeEditModal" class="close-button">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Segment Name</label>
            <input type="text" v-model="editSegmentData.name" readonly>
          </div>
          <div class="form-group">
            <label>Criteria</label>
            <textarea
              v-model="editSegmentData.criteria"
              placeholder="Enter segment criteria (e.g., age > 30 AND income < 50000)"
              rows="5"
            ></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="closeEditModal" class="cancel-button">Cancel</button>
          <button @click="saveSegmentChanges" class="save-button">Save Changes</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'SegmentationPage',
  data() {
    return {
      segments: [],
      isLoading: false,
      showEditModal: false,
      editSegmentData: {
        id: null,
        name: '',
        criteria: ''
      }
    };
  },
  methods: {
    async fetchAllSegments() {
      this.isLoading = true;
      try {
        const response = await axios.get('http://127.0.0.1:5000/segments');
        this.segments = response.data;
      } catch (error) {
        console.error("Error fetching segments:", error);
        this.segments = [];
        // Handle both response errors and network errors
        const errorMessage = error.response?.data?.error || error.message || 'Failed to fetch segments';
        this.$toast.error(errorMessage);
      } finally {
        this.isLoading = false;
      }
    },

    async loadModelSegments() {
      this.isLoading = true;
      try {
        const response = await axios.get('http://127.0.0.1:5000/segments/model');
        this.segments = response.data;
        this.$toast.success('Model segments loaded successfully');
      } catch (error) {
        console.error("Error loading model segments:", error);
        // Handle both response errors and network errors
        const errorMessage = error.response?.data?.error || error.message || 'Failed to load model segments';
        this.$toast.error(errorMessage);
      } finally {
        this.isLoading = false;
      }
    },

    openEditModal(segment) {
      this.editSegmentData = {
        id: segment.id,
        name: segment.name,
        criteria: segment.criteria || ''
      };
      this.showEditModal = true;
    },

    closeEditModal() {
      this.showEditModal = false;
      this.editSegmentData = { id: null, name: '', criteria: '' };
    },

    async saveSegmentChanges() {
      if (!this.editSegmentData.criteria.trim()) {
        this.$toast.error('Criteria cannot be empty');
        return;
      }

      this.isLoading = true;
      try {
        await axios.put(`http://127.0.0.1:5000/segments/${this.editSegmentData.id}`, {
          criteria: this.editSegmentData.criteria
        });

        this.$toast.success('Segment updated successfully');
        this.closeEditModal();
        await this.fetchAllSegments();
      } catch (error) {
        console.error("Error updating segment:", error);
        const errorMessage = error.response?.data?.error || error.message || 'Failed to update segment';
        this.$toast.error(errorMessage);
      } finally {
        this.isLoading = false;
      }
    },

    async confirmDelete(id) {
      if (confirm('Are you sure you want to delete this segment?')) {
        try {
          await axios.delete(`http://127.0.0.1:5000/segments/${id}`);
          this.segments = this.segments.filter(segment => segment.id !== id);
          this.$toast.success('Segment deleted successfully');
        } catch (error) {
          console.error("Error deleting segment:", error);
          const errorMessage = error.response?.data?.error || error.message || 'Failed to delete segment';
          this.$toast.error(errorMessage);
        }
      }
    }
  },
  created() {
    this.fetchAllSegments();
  }
};
</script>

<style scoped>
/* Base Styles */
.segmentation-page {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

/* Header Styles */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.header h1 {
  font-size: 1.8rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
}

.refresh-button, .model-button {
  padding: 0.6rem 1rem;
  border-radius: 6px;
  font-weight: 500;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.refresh-button {
  background-color: #f3f4f6;
  color: #4b5563;
  border: 1px solid #e5e7eb;
}

.refresh-button:hover {
  background-color: #e5e7eb;
}

.model-button {
  background-color: #3b82f6;
  color: white;
  border: none;
}

.model-button:hover {
  background-color: #2563eb;
}

/* Loading Indicator */
.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  gap: 1rem;
}

.spinner {
  width: 2.5rem;
  height: 2.5rem;
  border: 3px solid rgba(59, 130, 246, 0.2);
  border-radius: 50%;
  border-top-color: #3b82f6;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading p {
  color: #6b7280;
  font-size: 0.95rem;
}

/* Segment Table */
.segment-content {
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.segment-table {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  min-width: 800px;
}

thead {
  background-color: #f9fafb;
}

th {
  padding: 1rem;
  text-align: left;
  font-size: 0.8rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid #e5e7eb;
}

td {
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
  color: #1f2937;
  font-size: 0.9rem;
}

.criteria-cell {
  max-width: 300px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.source-tag {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
}

.source-tag.model {
  background-color: #e0f2fe;
  color: #0369a1;
}

.source-tag.manual {
  background-color: #ecfdf5;
  color: #047857;
}

.actions-cell {
  display: flex;
  gap: 0.5rem;
}

.edit-button, .delete-button {
  width: 2rem;
  height: 2rem;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.edit-button {
  background-color: #fef3c7;
  color: #d97706;
}

.edit-button:hover {
  background-color: #fde68a;
}

.delete-button {
  background-color: #fee2e2;
  color: #ef4444;
}

.delete-button:hover {
  background-color: #fecaca;
}

/* Empty State */
.no-segments {
  padding: 3rem;
  text-align: center;
}

.empty-state {
  max-width: 400px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.empty-state i {
  font-size: 2.5rem;
  color: #9ca3af;
}

.empty-state h3 {
  font-size: 1.25rem;
  color: #1f2937;
  margin: 0;
}

.empty-state p {
  color: #6b7280;
  margin: 0;
  font-size: 0.95rem;
}

.primary-button {
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.primary-button:hover {
  background-color: #2563eb;
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
  width: 100%;
  max-width: 500px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.modal-header {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  font-size: 1.25rem;
  margin: 0;
  color: #1f2937;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #9ca3af;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.modal-body {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #4b5563;
}

.form-group input, .form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 0.9rem;
  transition: border-color 0.2s ease;
}

.form-group input:focus, .form-group textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-group input {
  background-color: #f9fafb;
}

.modal-footer {
  padding: 1.25rem 1.5rem;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.cancel-button, .save-button {
  padding: 0.6rem 1.25rem;
  border-radius: 6px;
  font-weight: 500;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cancel-button {
  background-color: #f3f4f6;
  color: #4b5563;
  border: 1px solid #e5e7eb;
}

.cancel-button:hover {
  background-color: #e5e7eb;
}

.save-button {
  background-color: #10b981;
  color: white;
  border: none;
}

.save-button:hover {
  background-color: #059669;
}

/* Responsive Design */
@media (max-width: 768px) {
  .header {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-actions {
    width: 100%;
  }

  .refresh-button, .model-button {
    flex: 1;
    justify-content: center;
  }

  .modal-content {
    margin: 1rem;
    width: calc(100% - 2rem);
  }
}

/* Icons (using Unicode for simplicity - replace with actual icon components if available) */
.icon-edit::before { content: "✏️"; }
.icon-delete::before { content: "🗑️"; }
.icon-segment::before { content: "👥"; }
</style>