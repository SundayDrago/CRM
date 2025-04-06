<template>
  <div class="segmentation-page">
    <h1>Customer Segmentation</h1>
    
    <!-- Controls -->
    <div class="controls">
      <button @click="loadModelSegments" class="action-button">Load Model Segments</button>
      <button @click="fetchAllSegments" class="action-button">View All Segments</button>
      <button @click="exportSegments" class="action-button">Export Segments</button>
      <div class="file-upload-wrapper">
        <input 
          type="file" 
          id="fileUpload" 
          ref="fileInput" 
          @change="handleFileUpload" 
          accept=".csv,.xlsx,.json"
          style="display: none"
        >
        <button @click="triggerFileUpload" class="action-button" :disabled="isUploading">
          <span v-if="!isUploading">Upload Dataset</span>
          <span v-else>Uploading...</span>
        </button>
        <div v-if="uploadMessage" class="upload-message" :class="{ success: uploadSuccess, error: !uploadSuccess }">
          {{ uploadMessage }}
          <span v-if="uploadSuccess && targetFolder">Saved to: {{ targetFolder }}</span>
        </div>
      </div>
    </div>

    <!-- Folder Selection Modal -->
    <div v-if="showFolderDialog" class="modal-overlay">
      <div class="modal-content">
        <h3>Select Destination Folder</h3>
        <div class="folder-options">
          <label v-for="folder in availableFolders" :key="folder" class="folder-option">
            <input type="radio" v-model="selectedFolder" :value="folder">
            <span>{{ folder }}</span>
          </label>
        </div>
        <div class="modal-actions">
          <button @click="confirmUpload" class="confirm-button">Confirm</button>
          <button @click="cancelUpload" class="cancel-button">Cancel</button>
        </div>
      </div>
    </div>

    <!-- Edit Segment Modal -->
    <div v-if="showEditModal" class="modal-overlay">
      <div class="modal-content">
        <h3>Edit Segment</h3>
        <div class="edit-form">
          <label for="editCriteria">Criteria:</label>
          <textarea
            id="editCriteria"
            v-model="editSegmentData.criteria"
            placeholder="Enter new criteria (e.g., age > 30 AND income < 50000)"
            rows="4"
          ></textarea>
        </div>
        <div class="modal-actions">
          <button @click="saveSegmentChanges" class="confirm-button">Save</button>
          <button @click="closeEditModal" class="cancel-button">Cancel</button>
        </div>
      </div>
    </div>

    <!-- Loading Indicator -->
    <div v-if="isLoading" class="loading">
      <p>Loading segments...</p>
    </div>

    <!-- Segment List in Enhanced Table Format -->
    <div v-else-if="segments.length" class="segment-table">
      <h3>Existing Segments</h3>
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Customers</th>
              <th>Criteria</th>
              <th>Source</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="segment in segments" :key="segment.id" class="segment-row">
              <td>{{ segment.id }}</td>
              <td>{{ segment.name }}</td>
              <td>{{ segment.count }}</td>
              <td>{{ segment.criteria || 'N/A' }}</td>
              <td>{{ segment.source || 'Manual' }}</td>
              <td class="actions-cell">
                <div class="action-buttons">
                  <button @click="openEditModal(segment)" class="edit-button">
                    <span>Edit</span>
                  </button>
                  <button @click="confirmDelete(segment.id)" class="delete-button">
                    <span>Delete</span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div v-else class="no-segments">
      <p>No segments available. Upload a dataset and load from model to get started.</p>
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
      isUploading: false,
      showFolderDialog: false,
      selectedFile: null,
      availableFolders: [
        'customer_data/raw',
        'customer_data/processed',
        'customer_data/segmented',
        'customer_data/archived'
      ],
      selectedFolder: 'customer_data/raw',
      uploadMessage: '',
      uploadSuccess: false,
      targetFolder: '',
      showEditModal: false,
      editSegmentData: {
        id: null,
        criteria: ''
      }
    };
  },
  methods: {
    triggerFileUpload() {
      this.$refs.fileInput.click();
    },
    
    handleFileUpload(event) {
      const files = event.target.files;
      if (files.length === 0) return;
      this.selectedFile = files[0];
      this.showFolderDialog = true;
    },
    
    async confirmUpload() {
      if (!this.selectedFile) return;
      this.showFolderDialog = false;
      this.isUploading = true;
      this.uploadMessage = '';
      
      try {
        const formData = new FormData();
        formData.append('file', this.selectedFile);
        
        const response = await axios.post('http://127.0.0.1:5000/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        this.uploadSuccess = true;
        this.targetFolder = response.data.path;
        this.uploadMessage = 'File uploaded successfully!';
        
        this.$refs.fileInput.value = '';
        this.selectedFile = null;
        
        await this.loadModelSegments();
      } catch (error) {
        this.uploadSuccess = false;
        this.uploadMessage = error.response?.data?.error || error.message || 'Upload failed';
      } finally {
        this.isUploading = false;
        setTimeout(() => {
          this.uploadMessage = '';
          this.targetFolder = '';
        }, 5000);
      }
    },
    
    cancelUpload() {
      this.showFolderDialog = false;
      this.selectedFile = null;
      this.$refs.fileInput.value = '';
    },
    
    async fetchAllSegments() {
      this.isLoading = true;
      try {
        const response = await axios.get('http://127.0.0.1:5000/segments');
        this.segments = response.data;
      } catch (error) {
        console.error("Error fetching segments:", error);
        this.segments = [];
        this.$toast.error(error.response?.data?.error || error.message || 'Failed to fetch segments');
      } finally {
        this.isLoading = false;
      }
    },

    async loadModelSegments() {
      this.isLoading = true;
      try {
        const response = await axios.get('http://127.0.0.1:5000/segments');
        this.segments = response.data.filter(segment => segment.source === "Model");
      } catch (error) {
        console.error("Error loading model segments:", error);
        this.segments = [];
        this.$toast.error(error.response?.data?.error || error.message || 'Failed to load model segments');
      } finally {
        this.isLoading = false;
      }
    },

    exportSegments() {
      if (!this.segments.length) {
        this.$toast.warning('No segments to export');
        return;
      }
      const csv = ['ID,Name,Customers,Criteria,Source', ...this.segments.map(s => 
        `${s.id},${s.name},${s.count},"${s.criteria || 'N/A'}",${s.source || 'Manual'}`)].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'segments.csv';
      link.click();
    },

    openEditModal(segment) {
      this.editSegmentData = {
        id: segment.id,
        criteria: segment.criteria || ''
      };
      this.showEditModal = true;
    },

    closeEditModal() {
      this.showEditModal = false;
      this.editSegmentData = { id: null, criteria: '' };
    },

    async saveSegmentChanges() {
      if (!this.editSegmentData.id || !this.editSegmentData.criteria.trim()) {
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
        
        // Refresh the segments list to reflect the updated clustering
        await this.fetchAllSegments();
      } catch (error) {
        console.error("Error updating segment:", error);
        this.$toast.error(error.response?.data?.error || error.message || 'Failed to update segment');
      } finally {
        this.isLoading = false;
      }
    },

    confirmDelete(id) {
      if (confirm(`Are you sure you want to delete segment ${id}?`)) {
        this.segments = this.segments.filter(segment => segment.id !== id);
        this.$toast.success(`Segment ${id} deleted`);
      }
    }
  }
};
</script>

<style scoped>
/* General Page Styling */
.segmentation-page {
  padding: 30px;
  font-family: 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
  background-color: #f9fafb;
  min-height: 100vh;
  max-width: 1400px;
  margin: 0 auto;
}

h1 {
  font-size: 2rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 30px;
  text-align: left;
}

h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 20px;
}

/* Controls Section */
.controls {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 40px;
  align-items: center;
}

.action-button {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.3s ease, transform 0.1s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.action-button:hover {
  background: linear-gradient(135deg, #2563eb, #1e40af);
  transform: translateY(-1px);
}

.action-button:disabled {
  background: #9ca3af;
  cursor: not-allowed;
  transform: none;
}

/* File Upload Wrapper */
.file-upload-wrapper {
  position: relative;
  display: inline-block;
}

.upload-message {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  padding: 10px 15px;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  width: max-content;
  max-width: 300px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 10;
}

.upload-message.success {
  background-color: #d1fae5;
  color: #065f46;
}

.upload-message.error {
  background-color: #fee2e2;
  color: #991b1b;
}

/* Modal Styling (Shared for Folder and Edit Modals) */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: #ffffff;
  padding: 25px;
  border-radius: 10px;
  width: 450px;
  max-width: 90%;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.modal-content h3 {
  font-size: 1.5rem;
  margin-bottom: 20px;
  color: #1f2937;
}

.folder-options {
  margin: 20px 0;
}

.folder-option {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.folder-option:hover {
  background-color: #f3f4f6;
}

.folder-option input[type="radio"] {
  margin: 0;
}

.folder-option span {
  font-size: 0.95rem;
  color: #4b5563;
}

.edit-form {
  margin: 20px 0;
}

.edit-form label {
  display: block;
  font-size: 1rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 8px;
}

.edit-form textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.95rem;
  color: #4b5563;
  resize: vertical;
  transition: border-color 0.2s ease;
}

.edit-form textarea:focus {
  border-color: #3b82f6;
  outline: none;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 20px;
}

.confirm-button {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.3s ease;
}

.confirm-button:hover {
  background: linear-gradient(135deg, #059669, #047857);
}

.cancel-button {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.3s ease;
}

.cancel-button:hover {
  background: linear-gradient(135deg, #dc2626, #b91c1c);
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

.loading p {
  font-size: 1.1rem;
  color: #6b7280;
  margin: 0;
}

/* Enhanced Segment Table */
.segment-table {
  background: #ffffff;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  margin-bottom: 40px;
}

.table-container {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

thead {
  background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
  color: #374151;
}

th {
  padding: 16px 20px;
  text-align: left;
  font-size: 0.9rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 2px solid #d1d5db;
}

tbody tr {
  transition: background-color 0.2s ease, transform 0.1s ease;
}

tbody tr:hover {
  background-color: #f9fafb;
  transform: translateY(-1px);
}

td {
  padding: 20px;
  font-size: 0.95rem;
  color: #4b5563;
  border-bottom: 1px solid #e5e7eb;
}

.actions-cell {
  padding: 20px;
}

.action-buttons {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.edit-button {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.3s ease, transform 0.1s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.edit-button:hover {
  background: linear-gradient(135deg, #d97706, #b45309);
  transform: translateY(-1px);
}

.delete-button {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.3s ease, transform 0.1s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.delete-button:hover {
  background: linear-gradient(135deg, #dc2626, #b91c1c);
  transform: translateY(-1px);
}

/* No Segments Message */
.no-segments {
  text-align: center;
  padding: 40px;
  background: #ffffff;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.no-segments p {
  font-size: 1.1rem;
  color: #6b7280;
  margin: 0;
}

/* Responsive Design */
@media (max-width: 768px) {
  .controls {
    flex-direction: column;
    align-items: stretch;
  }

  .action-button {
    width: 100%;
    margin-bottom: 10px;
  }

  .table-container {
    overflow-x: auto;
  }

  table {
    min-width: 600px;
  }

  .modal-content {
    width: 90%;
  }

  .action-buttons {
    flex-direction: column;
    gap: 8px;
  }
}

@media (max-width: 480px) {
  h1 {
    font-size: 1.5rem;
  }

  th, td {
    font-size: 0.85rem;
    padding: 12px;
  }

  .edit-button, .delete-button {
    padding: 6px 12px;
    font-size: 0.8rem;
  }
}
</style>