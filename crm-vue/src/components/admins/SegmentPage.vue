<template>
  <div class="segmentation-page">
    <h1>Customer Segmentation</h1>
    
    <!-- Controls -->
    <div class="controls">
      <button @click="showModal = true" class="action-button">Create New Segment</button>
      <button @click="fetchAllSegments" class="action-button">View All Segments</button>
      <button @click="exportSegments" class="action-button">Export Segments</button>
      <button @click="importSegments" class="action-button">Import Segments</button>
    </div>

    <!-- Segment List in Table Format -->
    <div v-if="segments.length" class="segment-table">
      <h3>Existing Segments</h3>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Customers</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="segment in segments" :key="segment.id">
            <td>{{ segment.id }}</td>
            <td>{{ segment.name }}</td>
            <td>{{ segment.count }}</td>
            <td>
              <button @click="editSegment(segment.id)" class="edit-button">Edit</button>
              <button @click="confirmDelete(segment.id)" class="delete-button">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else>
      <p>No segments available. Create a new segment to get started.</p>
    </div>

    <!-- Create Segment Modal -->
    <div v-if="showModal" class="modal">
      <div class="modal-content">
        <h2>Create New Segment</h2>
        <input type="text" v-model="newSegment.name" placeholder="Segment Name" class="input-field" />
        <input type="number" v-model="newSegment.count" placeholder="Customer Count" class="input-field" />
        <div class="modal-buttons">
          <button @click="createNewSegment" class="confirm-button">Create</button>
          <button @click="showModal = false" class="cancel-button">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SegmentationPage',
  data() {
    return {
      segments: [],
      showModal: false,
      newSegment: {
        name: '',
        count: 0,
      },
    };
  },
  methods: {
    fetchAllSegments() {
      this.segments = [
        { id: 1, name: 'High Spenders', count: 150 },
        { id: 2, name: 'Frequent Shoppers', count: 300 },
        { id: 3, name: 'New Customers', count: 200 },
      ];
    },
    createNewSegment() {
      if (!this.newSegment.name || this.newSegment.count <= 0) {
        alert('Please enter valid segment details.');
        return;
      }
      const newId = this.segments.length + 1;
      this.segments.push({ id: newId, ...this.newSegment });
      this.newSegment = { name: '', count: 0 };
      this.showModal = false;
    },
    confirmDelete(segmentId) {
      if (confirm(`Are you sure you want to delete segment ID: ${segmentId}?`)) {
        this.deleteSegment(segmentId);
      }
    },
    deleteSegment(segmentId) {
      this.segments = this.segments.filter(segment => segment.id !== segmentId);
    },
    exportSegments() {
      alert('Export Segments functionality not implemented yet.');
    },
    importSegments() {
      alert('Import Segments functionality not implemented yet.');
    },
  },
};
</script>

<style scoped>
.segmentation-page {
  padding: 20px;
}

.controls {
  margin-bottom: 20px;
}

.action-button {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 5px;
  cursor: pointer;
  transition: background 0.3s;
  margin-right: 10px;
}

.action-button:hover {
  background-color: #0056b3;
}

.segment-table table {
  width: 100%;
  border-collapse: collapse;
}

.segment-table th, .segment-table td {
  border: 1px solid #ddd;
  padding: 10px;
  text-align: left;
}

.segment-table th {
  background-color: #f4f4f4;
}

.edit-button, .delete-button {
  padding: 5px 10px;
  border-radius: 5px;
  cursor: pointer;
  margin-left: 5px;
}

.edit-button {
  background-color: #28a745;
  color: white;
}

.edit-button:hover {
  background-color: #218838;
}

.delete-button {
  background-color: #dc3545;
  color: white;
}

.delete-button:hover {
  background-color: #c82333;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 300px;
  text-align: center;
}

.input-field {
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.modal-buttons {
  display: flex;
  justify-content: space-between;
}

.confirm-button {
  background-color: #28a745;
  color: white;
  padding: 10px 15px;
  border-radius: 5px;
  border: none;
  cursor: pointer;
}

.cancel-button {
  background-color: #dc3545;
  color: white;
  padding: 10px 15px;
  border-radius: 5px;
  border: none;
  cursor: pointer;
}
</style>