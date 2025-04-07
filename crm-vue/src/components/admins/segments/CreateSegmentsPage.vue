<template>
  <div class="segment-management-container">
    <div class="header">
      <h1 class="page-title">Segment Management</h1>
      <p class="page-subtitle">Create, view, and manage customer segments</p>
    </div>

    <div class="management-grid">
      <!-- Create Segment Card -->
      <div class="management-card">
        <div class="card-header">
          <h2><i class="fas fa-plus-circle"></i> Create Segment</h2>
        </div>
        <form @submit.prevent="createSegment" class="segment-form">
          <div class="form-group">
            <label for="segment-name">Segment Name</label>
            <input
              type="text"
              id="segment-name"
              v-model="newSegment.name"
              placeholder="e.g. Premium Customers"
              required
              maxlength="50"
            />
            <span class="char-count">{{ newSegment.name.length }}/50</span>
          </div>

          <div class="form-group">
            <label for="segment-desc">Description</label>
            <textarea
              id="segment-desc"
              v-model="newSegment.description"
              placeholder="Describe this segment..."
              required
              rows="4"
              maxlength="200"
            ></textarea>
            <span class="char-count">{{ newSegment.description.length }}/200</span>
          </div>

          <button
            type="submit"
            class="btn btn-primary"
            :disabled="isCreating || !isFormValid"
          >
            <span v-if="!isCreating">Create Segment</span>
            <span v-else><i class="fas fa-spinner fa-spin"></i> Creating...</span>
          </button>
        </form>
      </div>

      <!-- View Segments Card -->
      <div class="management-card">
        <div class="card-header">
          <h2><i class="fas fa-list"></i> Segment List</h2>
          <div class="card-actions">
            <button @click="refreshSegments" class="btn-icon" title="Refresh">
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
          />
          <i class="fas fa-search"></i>
        </div>

        <div class="segment-list">
          <div v-if="filteredSegments.length === 0" class="empty-state">
            <i class="fas fa-inbox"></i>
            <p>No segments found</p>
          </div>

          <ul v-else>
            <li v-for="segment in filteredSegments" :key="segment.id" class="segment-item">
              <div class="segment-info">
                <h3>{{ segment.name }}</h3>
                <p>{{ segment.description }}</p>
                <span class="segment-meta">Created: {{ formatDate(segment.createdAt) }}</span>
              </div>
              <div class="segment-actions">
                <button @click="editSegment(segment)" class="btn-icon" title="Edit">
                  <i class="fas fa-edit"></i>
                </button>
                <button @click="confirmDelete(segment)" class="btn-icon danger" title="Delete">
                  <i class="fas fa-trash-alt"></i>
                </button>
              </div>
            </li>
          </ul>
        </div>

        <div class="pagination" v-if="filteredSegments.length > 0">
          <button @click="prevPage" :disabled="currentPage === 1">
            <i class="fas fa-chevron-left"></i>
          </button>
          <span>Page {{ currentPage }} of {{ totalPages }}</span>
          <button @click="nextPage" :disabled="currentPage === totalPages">
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>

      <!-- Import/Export Card -->
      <div class="management-card">
        <div class="card-header">
          <h2><i class="fas fa-file-import"></i> Import/Export</h2>
        </div>

        <div class="import-export-section">
          <div class="import-section">
            <h3><i class="fas fa-file-import"></i> Import Segments</h3>
            <div class="file-upload">
              <label for="file-upload" class="file-upload-label">
                <i class="fas fa-cloud-upload-alt"></i>
                <span v-if="!importFile">Choose CSV file</span>
                <span v-else>{{ importFile.name }}</span>
                <input
                  id="file-upload"
                  type="file"
                  accept=".csv"
                  @change="handleFileSelect"
                  hidden
                />
              </label>
              <button
                @click="importSegments"
                class="btn btn-secondary"
                :disabled="!importFile || isImporting"
              >
                <span v-if="!isImporting">Import</span>
                <span v-else><i class="fas fa-spinner fa-spin"></i> Importing...</span>
              </button>
            </div>
            <p class="file-hint">CSV format with Name,Description columns</p>
          </div>

          <div class="export-section">
            <h3><i class="fas fa-file-export"></i> Export Segments</h3>
            <div class="export-options">
              <button @click="exportSegments('csv')" class="btn btn-secondary">
                <i class="fas fa-file-csv"></i> Export as CSV
              </button>
              <button @click="exportSegments('json')" class="btn btn-secondary">
                <i class="fas fa-file-code"></i> Export as JSON
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Segment Modal -->
    <div v-if="showEditModal" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Edit Segment</h3>
          <button @click="closeModal" class="modal-close">
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
              <label>Description</label>
              <textarea v-model="editingSegment.description" required></textarea>
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
    <div v-if="showDeleteModal" class="modal-overlay">
      <div class="modal-content confirm-modal">
        <div class="modal-header">
          <h3>Confirm Deletion</h3>
        </div>
        <div class="modal-body">
          <p>Are you sure you want to delete "{{ segmentToDelete?.name }}"?</p>
          <p class="warning-text">
            <i class="fas fa-exclamation-triangle"></i> This action cannot be undone.
          </p>
          <div class="modal-actions">
            <button @click="closeModal" class="btn btn-outline">
              Cancel
            </button>
            <button @click="deleteSegment" class="btn btn-danger" :disabled="isDeleting">
              <span v-if="!isDeleting">Delete</span>
              <span v-else><i class="fas fa-spinner fa-spin"></i> Deleting...</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { saveAs } from 'file-saver';

export default {
  name: 'SegmentManagement',
  data() {
    return {
      newSegment: {
        name: '',
        description: ''
      },
      segments: [],
      filteredSegments: [],
      searchQuery: '',
      currentPage: 1,
      itemsPerPage: 5,
      isCreating: false,
      isImporting: false,
      importFile: null,
      showEditModal: false,
      editingSegment: {
        id: null,
        name: '',
        description: ''
      },
      isUpdating: false,
      showDeleteModal: false,
      segmentToDelete: null,
      isDeleting: false
    };
  },
  computed: {
    isFormValid() {
      return this.newSegment.name.trim() && this.newSegment.description.trim();
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
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        // Mock data - replace with actual API call
        this.segments = [
          {
            id: 1,
            name: 'Premium Customers',
            description: 'Customers with premium subscriptions',
            createdAt: new Date('2023-01-15')
          },
          {
            id: 2,
            name: 'Inactive Users',
            description: 'Users who have not logged in for 30+ days',
            createdAt: new Date('2023-02-20')
          },
          {
            id: 3,
            name: 'New Signups',
            description: 'Users who signed up in the last 7 days',
            createdAt: new Date('2023-03-10')
          }
        ];
        this.filteredSegments = [...this.segments];
      } catch (error) {
        console.error('Failed to load segments:', error);
        alert('Failed to load segments. Please try again.');
      }
    },
    filterSegments() {
      if (!this.searchQuery) {
        this.filteredSegments = [...this.segments];
        return;
      }
      const query = this.searchQuery.toLowerCase();
      this.filteredSegments = this.segments.filter(
        segment =>
          segment.name.toLowerCase().includes(query) ||
          segment.description.toLowerCase().includes(query)
      );
      this.currentPage = 1;
    },
    async createSegment() {
      this.isCreating = true;
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));

        const newSegment = {
          id: Date.now(),
          name: this.newSegment.name.trim(),
          description: this.newSegment.description.trim(),
          createdAt: new Date()
        };

        this.segments.unshift(newSegment);
        this.filterSegments();
        this.newSegment = { name: '', description: '' };
        alert('Segment created successfully!');
      } catch (error) {
        console.error('Failed to create segment:', error);
        alert('Failed to create segment. Please try again.');
      } finally {
        this.isCreating = false;
      }
    },
    editSegment(segment) {
      this.editingSegment = { ...segment };
      this.showEditModal = true;
    },
    async updateSegment() {
      this.isUpdating = true;
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));

        const index = this.segments.findIndex(s => s.id === this.editingSegment.id);
        if (index !== -1) {
          this.segments[index] = { ...this.editingSegment };
          this.filterSegments();
          this.closeModal();
          alert('Segment updated successfully!');
        }
      } catch (error) {
        console.error('Failed to update segment:', error);
        alert('Failed to update segment. Please try again.');
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
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));

        this.segments = this.segments.filter(s => s.id !== this.segmentToDelete.id);
        this.filterSegments();
        this.closeModal();
        alert('Segment deleted successfully!');
      } catch (error) {
        console.error('Failed to delete segment:', error);
        alert('Failed to delete segment. Please try again.');
      } finally {
        this.isDeleting = false;
      }
    },
    closeModal() {
      this.showEditModal = false;
      this.showDeleteModal = false;
      this.segmentToDelete = null;
    },
    handleFileSelect(event) {
      this.importFile = event.target.files[0];
    },
    async importSegments() {
      if (!this.importFile) {
        alert('Please select a file first');
        return;
      }

      this.isImporting = true;
      try {
        // Simulate file processing
        await new Promise(resolve => setTimeout(resolve, 1500));

        // In a real app, you would parse the CSV file here
        // For demo, we'll add some mock segments
        const newSegments = [
          {
            id: Date.now() + 1,
            name: 'Imported Segment 1',
            description: 'Imported from CSV file',
            createdAt: new Date()
          },
          {
            id: Date.now() + 2,
            name: 'Imported Segment 2',
            description: 'Imported from CSV file',
            createdAt: new Date()
          }
        ];

        this.segments = [...newSegments, ...this.segments];
        this.filterSegments();
        this.importFile = null;
        document.getElementById('file-upload').value = '';
        alert('Segments imported successfully!');
      } catch (error) {
        console.error('Failed to import segments:', error);
        alert('Failed to import segments. Please check the file format and try again.');
      } finally {
        this.isImporting = false;
      }
    },
    exportSegments(format) {
      try {
        let content, mimeType, extension;

        if (format === 'csv') {
          // Convert segments to CSV
          const headers = ['Name', 'Description', 'Created At'];
          const rows = this.segments.map(segment => [
            `"${segment.name.replace(/"/g, '""')}"`,
            `"${segment.description.replace(/"/g, '""')}"`,
            segment.createdAt.toISOString()
          ]);

          content = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
          mimeType = 'text/csv;charset=utf-8';
          extension = 'csv';
        } else {
          // JSON format
          content = JSON.stringify(this.segments, null, 2);
          mimeType = 'application/json';
          extension = 'json';
        }

        const blob = new Blob([content], { type: mimeType });
        saveAs(blob, `segments_export_${new Date().toISOString().slice(0, 10)}.${extension}`);
      } catch (error) {
        console.error('Failed to export segments:', error);
        alert('Failed to export segments. Please try again.');
      }
    },
    refreshSegments() {
      this.loadSegments();
      this.searchQuery = '';
    },
    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
      }
    },
    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
      }
    },
    formatDate(date) {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
  }
};
</script>

<style scoped>
/* Base Styles */
.segment-management-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.header {
  margin-bottom: 30px;
  text-align: center;
}

.page-title {
  font-size: 2.2rem;
  color: #2c3e50;
  margin-bottom: 5px;
}

.page-subtitle {
  font-size: 1rem;
  color: #7f8c8d;
  margin-top: 0;
}

/* Grid Layout */
.management-grid {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 20px;
}

@media (max-width: 992px) {
  .management-grid {
    grid-template-columns: 1fr;
  }
}

/* Card Styles */
.management-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  padding: 20px;
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.card-header h2 {
  font-size: 1.3rem;
  color: #2c3e50;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.card-header i {
  color: #3498db;
}

.card-actions {
  display: flex;
  gap: 10px;
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
  margin-bottom: 5px;
  font-weight: 500;
  color: #2c3e50;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

.form-group textarea {
  resize: vertical;
  min-height: 80px;
}

.char-count {
  position: absolute;
  right: 10px;
  bottom: 10px;
  font-size: 0.8rem;
  color: #95a5a6;
}

/* Button Styles */
.btn {
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-primary {
  background-color: #3498db;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #2980b9;
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
  font-size: 1rem;
  padding: 5px;
  border-radius: 4px;
  transition: all 0.2s;
}

.btn-icon:hover {
  color: #3498db;
  background: rgba(52, 152, 219, 0.1);
}

.btn-icon.danger:hover {
  color: #e74c3c;
  background: rgba(231, 76, 60, 0.1);
}

/* Search Box */
.search-box {
  position: relative;
  margin-bottom: 15px;
}

.search-box input {
  width: 100%;
  padding: 10px 10px 10px 35px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.search-box i {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #95a5a6;
}

/* Segment List */
.segment-list {
  max-height: 500px;
  overflow-y: auto;
}

.segment-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 0;
  border-bottom: 1px solid #eee;
}

.segment-item:last-child {
  border-bottom: none;
}

.segment-info h3 {
  margin: 0 0 5px 0;
  font-size: 1.1rem;
  color: #2c3e50;
}

.segment-info p {
  margin: 0 0 5px 0;
  color: #7f8c8d;
  font-size: 0.9rem;
}

.segment-meta {
  font-size: 0.8rem;
  color: #95a5a6;
}

.segment-actions {
  display: flex;
  gap: 10px;
}

.empty-state {
  text-align: center;
  padding: 30px;
  color: #95a5a6;
}

.empty-state i {
  font-size: 2rem;
  margin-bottom: 10px;
}

.empty-state p {
  margin: 0;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid #eee;
}

.pagination button {
  background: #f5f5f5;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination span {
  font-size: 0.9rem;
  color: #7f8c8d;
}

/* Import/Export Section */
.import-export-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.import-section,
.export-section {
  padding: 15px;
  border-radius: 4px;
  background: #f9f9f9;
}

.import-section h3,
.export-section h3 {
  margin-top: 0;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.1rem;
}

.file-upload {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.file-upload-label {
  flex: 1;
  padding: 10px;
  border: 1px dashed #bdc3c7;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  cursor: pointer;
  transition: all 0.3s;
}

.file-upload-label:hover {
  border-color: #3498db;
  background: rgba(52, 152, 219, 0.05);
}

.file-hint {
  font-size: 0.8rem;
  color: #95a5a6;
  margin: 0;
}

.export-options {
  display: flex;
  gap: 10px;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.confirm-modal {
  max-width: 400px;
}

.modal-header {
  padding: 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.3rem;
  color: #2c3e50;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: #95a5a6;
}

.modal-close:hover {
  color: #7f8c8d;
}

.modal-body {
  padding: 20px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.warning-text {
  color: #e74c3c;
  display: flex;
  align-items: center;
  gap: 5px;
  margin: 15px 0;
}
</style>