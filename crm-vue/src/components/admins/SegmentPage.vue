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

    <!-- No Segments Message -->
    <div v-else-if="!segments.length" class="no-segments">
      <div class="empty-state">
        <i class="icon-segment"></i>
        <h3>No segments available</h3>
        <p>Create new segments or load model segments to get started</p>
        <button @click="loadModelSegments" class="primary-button">
          Load Model Segments
        </button>
      </div>
    </div>

    <!-- Segment List -->
    <div v-else class="segment-list">
      <div 
        class="segment-card" 
        v-for="(segment, index) in segments" 
        :key="segment.id" 
        :class="{ 
          'model-segment': segment.source === 'Model',
          'has-divider': index < segments.length - 1
        }"
      >
        <div class="segment-info">
          <div class="segment-header">
            <h3>{{ segment.name }}</h3>
            <span v-if="segment.source === 'Model'" class="model-badge">Model</span>
          </div>
          <p class="segment-criteria">{{ segment.criteria || 'No criteria specified' }}</p>
          <p class="segment-meta">
            <span>Customers: {{ segment.count || 0 }}</span>
            <span>Created: {{ formatDate(segment.createdAt) }}</span>
            <span>Source: {{ segment.source }}</span>
          </p>
        </div>
        <div class="segment-actions">
          <button 
            @click="openEditModal(segment)" 
            class="edit-button"
            :disabled="segment.source === 'Model' && !isAdmin"
          >
            Edit
          </button>
          <button 
            @click="confirmDelete(segment.id)" 
            class="delete-button"
            :disabled="segment.source === 'Model' && !isAdmin"
          >
            Delete
          </button>
        </div>
        <div 
          v-if="segment.source === 'Model' && !isAdmin" 
          class="admin-restriction"
        >
          <i class="lock-icon"></i>
          <span>Only admin can edit or delete models</span>
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
              placeholder="Enter segment criteria (e.g., Age=18-24,Gender=Male)"
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
import { toast } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';

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
      },
      pollingInterval: null,
      isAdmin: false // This should be set based on your auth system
    };
  },
  methods: {
    async fetchAllSegments() {
      this.isLoading = true;
      try {
        const response = await axios.get('http://127.0.0.1:5000/segments');
        this.segments = response.data.map(segment => ({
          ...segment,
          count: segment.count || 0,
          createdAt: segment.createdAt || segment.created_at || new Date().toISOString(),
          source: segment.source || 'Custom'
        }));
      } catch (error) {
        console.error('Error fetching segments:', error);
        this.segments = [];
        const errorMessage = error.response?.data?.error || error.message || 'Failed to fetch segments';
        if (error.response?.status === 400 && errorMessage.includes('No dataset uploaded')) {
          toast.error('No dataset available. Please upload a dataset first.');
        } else {
          toast.error(errorMessage);
        }
      } finally {
        this.isLoading = false;
      }
    },

    async loadModelSegments() {
      this.isLoading = true;
      try {
        const response = await axios.get('http://127.0.0.1:5000/segments/model');
        this.segments = response.data.map(segment => ({
          ...segment,
          count: segment.count || 0,
          createdAt: segment.createdAt || new Date().toISOString(),
          source: 'Model'
        }));
        toast.success('Model segments loaded successfully');
      } catch (error) {
        console.error('Error loading model segments:', error);
        const errorMessage = error.response?.data?.error || error.message || 'Failed to load model segments';
        toast.error(errorMessage);
      } finally {
        this.isLoading = false;
      }
    },

    formatDate(dateString) {
      if (!dateString) return 'N/A';
      try {
        return new Date(dateString).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      } catch {
        return 'Invalid Date';
      }
    },

    openEditModal(segment) {
      if (segment.source === 'Model' && !this.isAdmin) {
        toast.error('Only admin can edit model segments');
        return;
      }
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
        toast.error('Criteria cannot be empty');
        return;
      }
      this.isLoading = true;
      try {
        await axios.put(`http://127.0.0.1:5000/segments/${this.editSegmentData.id}`, {
          criteria: this.editSegmentData.criteria
        });
        toast.success('Segment updated successfully');
        this.closeEditModal();
        await this.fetchAllSegments();
      } catch (error) {
        console.error('Error updating segment:', error);
        const errorMessage = error.response?.data?.error || error.message || 'Failed to update segment';
        toast.error(errorMessage);
      } finally {
        this.isLoading = false;
      }
    },

    async confirmDelete(id) {
      const segment = this.segments.find(s => s.id === id);
      if (segment && segment.source === 'Model' && !this.isAdmin) {
        toast.error('Only admin can delete model segments');
        return;
      }
      if (confirm('Are you sure you want to delete this segment?')) {
        try {
          await axios.delete(`http://127.0.0.1:5000/segments/${id}`);
          this.segments = this.segments.filter(segment => segment.id !== id);
          toast.success('Segment deleted successfully');
        } catch (error) {
          console.error('Error deleting segment:', error);
          const errorMessage = error.response?.data?.error || error.message || 'Failed to delete segment';
          toast.error(errorMessage);
        }
      }
    },

    startPolling() {
      this.pollingInterval = setInterval(() => {
        this.fetchAllSegments();
      }, 30000); // Poll every 30 seconds
    },

    stopPolling() {
      if (this.pollingInterval) {
        clearInterval(this.pollingInterval);
        this.pollingInterval = null;
      }
    }
  },
  created() {
    // In a real app, you would check the user's role here
    // this.isAdmin = checkIfUserIsAdmin();
    this.fetchAllSegments();
    this.startPolling();
  },
  beforeUnmount() {
    this.stopPolling();
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
.segmentation-page {
  animation: fadeInUp var(--transition-slow) var(--ease-out);
}

.segment-card,
.no-segments,
.modal-content {
  transition: transform var(--transition-fast) var(--ease-out), box-shadow var(--transition-fast) var(--ease-out);
}

.segment-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.15);
}

.refresh-button,
.model-button,
.primary-button,
.edit-button,
.delete-button,
.cancel-button,
.save-button,
.close-button {
  transition: background-color var(--transition-fast) var(--ease-out), transform 100ms var(--ease-out), color var(--transition-fast) var(--ease-out);
}

.refresh-button:active,
.model-button:active,
.primary-button:active,
.edit-button:active,
.delete-button:active,
.cancel-button:active,
.save-button:active,
.close-button:active {
  transform: scale(0.98);
}

.form-group input,
.form-group textarea {
  transition: border-color var(--transition-fast) var(--ease-out), box-shadow var(--transition-fast) var(--ease-out);
}

.spinner {
  animation: spin 1s linear infinite;
}

.modal-overlay {
  animation: fadeInUp var(--transition-medium) var(--ease-out);
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  :root {
    --transition-fast: 1ms;
    --transition-medium: 1ms;
    --transition-slow: 1ms;
  }
  .segmentation-page,
  .modal-overlay {
    animation: none;
  }
  .segment-card:hover {
    transform: none;
  }
  .spinner {
    animation: none;
    border: 4px solid #4CAF50;
  }
}

/* Base Styles */
.segmentation-page {
  font-family: 'Inter', sans-serif;
  padding: 2rem 1.5rem;
  color: #333;
  max-width: 1400px;
  margin: 0 auto;
  background: #f5f7fa; /* Matches SettingsPage.vue */
  min-height: 100vh;
}

/* Header */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2.5rem;
  flex-wrap: wrap;
  gap: 1.5rem;
  padding-bottom: 1.5rem;
  position: relative;
}

.header h1 {
  font-size: clamp(1.8rem, 4.5vw, 2.5rem);
  font-weight: 800; /* Matches SettingsPage.vue */
  color: #333;
  margin: 0;
}

.header h1::after {
  content: '';
  position: absolute;
  bottom: 0.5rem;
  left: 0;
  width: 80px;
  height: 3px;
  background: #4CAF50; /* Matches SettingsPage.vue underline */
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.refresh-button,
.model-button {
  padding: 0.75rem 1.5rem;
  font-size: clamp(0.9rem, 2vw, 1rem);
  font-weight: 600;
  border-radius: 50px; /* Matches SettingsPage.vue btn-primary */
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
}

.refresh-button {
  background-color: #f9f9f9;
  color: #555;
  border: 1px solid #ddd;
}

.refresh-button:hover {
  background-color: #e0e0e0;
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.model-button {
  background-color: #4CAF50; /* Matches primary color */
  color: #fff;
  border: none;
}

.model-button:hover {
  background-color: #388E3C; /* Matches btn-primary:hover */
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* Loading State */
.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  gap: 1.5rem;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1); /* Matches SettingsPage.vue */
}

.spinner {
  width: 3rem;
  height: 3rem;
  border: 4px solid rgba(76, 175, 80, 0.1); /* Matches primary color */
  border-radius: 50%;
  border-top-color: #4CAF50;
}

.loading p {
  color: #666;
  font-size: clamp(0.9rem, 2vw, 1rem);
  font-weight: 500;
}

/* Empty State */
.no-segments {
  padding: 4rem 2rem;
  text-align: center;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1); /* Matches SettingsPage.vue */
  margin-top: 2rem;
  animation: fadeInUp 0.6s ease-out;
}

.empty-state {
  max-width: 450px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
}

.empty-state i.icon-segment {
  font-size: 3rem;
  color: #666;
}

.empty-state h3 {
  font-size: clamp(1.2rem, 3vw, 1.5rem);
  color: #333;
  margin: 0;
  font-weight: 700; /* Matches SettingsPage.vue */
}

.empty-state p {
  color: #666;
  margin: 0;
  font-size: clamp(0.85rem, 1.8vw, 0.9rem);
  line-height: 1.5;
}

.primary-button {
  margin-top: 1.5rem;
  padding: 0.75rem 2rem;
  background-color: #4CAF50; /* Matches primary color */
  color: #fff;
  border: none;
  border-radius: 50px; /* Matches SettingsPage.vue */
  font-weight: 600;
  font-size: clamp(0.9rem, 2vw, 1rem);
  cursor: pointer;
  transition: all 0.3s ease;
}

.primary-button:hover {
  background-color: #388E3C;
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* Segment List */
.segment-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-top: 1.5rem;
}

/* Segment Card */
.segment-card {
  background: #fff;
  border-radius: 10px; /* Matches SettingsPage.vue */
  padding: 1.75rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1); /* Matches SettingsPage.vue */
  display: flex;
  flex-direction: column;
  gap: 1rem;
  animation: fadeInUp 0.6s ease-out;
}

.segment-card.has-divider {
  border-bottom: 1px solid #ddd;
  margin-bottom: 1rem;
}

.segment-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.segment-info h3 {
  font-size: clamp(1.1rem, 2.5vw, 1.25rem);
  margin: 0;
  color: #333;
  font-weight: 700;
}

.model-badge {
  background-color: #e3f2fd; /* Matches secondary color background */
  color: #2196F3; /* Matches secondary color */
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
}

.segment-criteria {
  color: #555;
  font-size: clamp(0.85rem, 1.8vw, 0.9rem);
  margin: 0.75rem 0;
  line-height: 1.5;
  background: #f9f9f9; /* Matches SettingsPage.vue */
  padding: 0.75rem;
  border-radius: 4px;
  font-family: 'SF Mono', monospace;
}

.segment-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  font-size: clamp(0.8rem, 1.6vw, 0.85rem);
  color: #666;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #ddd;
}

.segment-meta span {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.segment-meta span::before {
  content: '';
  width: 4px;
  height: 4px;
  background-color: #666;
  border-radius: 50%;
}

.segment-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
}

.edit-button,
.delete-button {
  padding: 0.6rem 1.25rem;
  border-radius: 4px; /* Matches AICustomerDashboard.vue */
  font-size: clamp(0.85rem, 1.8vw, 0.9rem);
  font-weight: 600;
  cursor: pointer;
  flex: 1;
  transition: all 0.2s ease;
}

.edit-button {
  background-color: #e3f2fd; /* Matches secondary color background */
  color: #2196F3; /* Matches secondary color */
  border: 1px solid #bbdefb;
}

.edit-button:hover:not(:disabled) {
  background-color: #bbdefb;
  transform: translateY(-2px);
}

.edit-button:disabled {
  background-color: #f5f5f5;
  color: #999;
  cursor: not-allowed;
}

.delete-button {
  background-color: #ffebee; /* Matches error background */
  color: #f44336; /* Matches error color */
  border: 1px solid #ffcdd2;
}

.delete-button:hover:not(:disabled) {
  background-color: #ffcdd2;
  transform: translateY(-2px);
}

.delete-button:disabled {
  background-color: #f5f5f5;
  color: #999;
  cursor: not-allowed;
}

.admin-restriction {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: clamp(0.75rem, 1.6vw, 0.8rem);
  color: #666;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px dashed #ddd;
}

.lock-icon {
  width: 16px;
  height: 16px;
  background-color: #666;
  mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='11' width='18' height='11' rx='2' ry='2'%3E%3C/rect%3E%3Cpath d='M7 11V7a5 5 0 0 1 10 0v4'%3E%3C/path%3E%3C/svg%3E");
  mask-repeat: no-repeat;
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
  backdrop-filter: blur(4px);
}

.modal-content {
  background: #fff;
  border-radius: 10px; /* Matches SettingsPage.vue */
  width: 100%;
  max-width: 550px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15); /* Matches SettingsPage.vue */
  animation: fadeInUp 0.3s ease-out;
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #ddd;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  background: #f9f9f9; /* Matches SettingsPage.vue */
  z-index: 10;
}

.modal-header h3 {
  font-size: clamp(1.2rem, 3vw, 1.5rem);
  margin: 0;
  color: #333;
  font-weight: 700;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #666;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.close-button:hover {
  color: #2196F3; /* Matches secondary color */
}

.modal-body {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.75rem;
  font-size: clamp(0.85rem, 1.8vw, 0.9rem);
  font-weight: 600;
  color: #555;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px; /* Matches SettingsPage.vue */
  font-size: clamp(0.85rem, 1.8vw, 0.9rem);
  background-color: #fff;
  color: #333;
  line-height: 1.5;
}

.form-group input:focus,
.form-group textarea:focus {
  border-color: #4CAF50; /* Matches primary color */
  box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.2);
  outline: none;
}

.form-group textarea {
  min-height: 120px;
  resize: vertical;
}

.form-group input[readonly] {
  background-color: #f5f5f5;
  color: #666;
  cursor: not-allowed;
}

.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid #ddd;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  position: sticky;
  bottom: 0;
  background: #f9f9f9; /* Matches SettingsPage.vue */
}

.cancel-button,
.save-button {
  padding: 0.75rem 1.5rem;
  border-radius: 50px; /* Matches SettingsPage.vue */
  font-weight: 600;
  font-size: clamp(0.9rem, 2vw, 1rem);
  cursor: pointer;
  transition: all 0.3s ease;
}

.cancel-button {
  background-color: #f9f9f9;
  color: #555;
  border: 1px solid #ddd;
}

.cancel-button:hover {
  background-color: #e0e0e0;
  transform: translateY(-2px);
}

.save-button {
  background-color: #4CAF50; /* Matches primary color */
  color: #fff;
  border: none;
}

.save-button:hover {
  background-color: #388E3C;
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* Responsive Design */
@media (max-width: 768px) {
  .segmentation-page {
    padding: 1.5rem 1rem;
  }

  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1.25rem;
    margin-bottom: 2rem;
  }

  .header-actions {
    width: 100%;
    flex-direction: column;
    gap: 0.75rem;
  }

  .refresh-button,
  .model-button {
    width: 100%;
    justify-content: center;
  }

  .segment-card {
    padding: 1.5rem;
  }

  .segment-actions {
    flex-direction: column;
  }

  .edit-button,
  .delete-button {
    width: 100%;
  }

  .modal-content {
    margin: 1rem;
    width: calc(100% - 2rem);
  }
}

@media (max-width: 480px) {
  .segmentation-page {
    padding: 1rem;
  }

  .header h1 {
    font-size: clamp(1.6rem, 3.5vw, 2rem);
  }

  .segment-info h3 {
    font-size: clamp(1rem, 2.5vw, 1.1rem);
  }

  .segment-meta {
    flex-direction: column;
    gap: 0.5rem;
  }

  .no-segments {
    padding: 2rem 1rem;
  }

  .primary-button {
    width: 100%;
  }
}
</style>