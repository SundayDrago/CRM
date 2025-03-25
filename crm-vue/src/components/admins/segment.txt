<template>
    <div class="segmentation-page">
      <!-- Create Segment Button -->
      <div class="controls">
        <button @click="createNewSegment" class="action-button">Create New Segment</button>
        <button @click="fetchAllSegments" class="action-button">View All Segments</button>
        <button @click="exportSegments" class="action-button">Export Segments</button>
        <button @click="importSegments" class="action-button">Import Segments</button>
      </div>
  
      <!-- Segment List -->
      <div class="segment-list" v-if="segments.length">
        <h3>Existing Segments</h3>
        <ul>
          <li v-for="segment in segments" :key="segment.id">
            {{ segment.name }} - {{ segment.count }} Customers
            <button @click="editSegment(segment.id)" class="edit-button">Edit</button>
            <button @click="deleteSegment(segment.id)" class="delete-button">Delete</button>
          </li>
        </ul>
      </div>
      <div v-else>
        <p>No segments available. Create a new segment to get started.</p>
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
      };
    },
    methods: {
      async createNewSegment() {
        try {
          const response = await axios.post('/api/segments/generate');
          this.fetchAllSegments();
          alert('New segment created successfully');
        } catch (error) {
          console.error('Error creating segment:', error);
        }
      },
      async fetchAllSegments() {
        try {
          const response = await axios.get('/api/segments');
          this.segments = response.data;
        } catch (error) {
          console.error('Error fetching segments:', error);
        }
      },
      async exportSegments() {
        try {
          const response = await axios.get('/api/segments/export', { responseType: 'blob' });
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', 'segments.json');
          document.body.appendChild(link);
          link.click();
          alert('Segments exported successfully');
        } catch (error) {
          console.error('Error exporting segments:', error);
        }
      },
      async importSegments() {
        alert('Import functionality to be implemented with file upload');
      },
      async editSegment(segmentId) {
        alert(`Editing segment ID: ${segmentId}`);
      },
      async deleteSegment(segmentId) {
        try {
          await axios.delete(`/api/segments/${segmentId}`);
          this.fetchAllSegments();
          alert('Segment deleted successfully');
        } catch (error) {
          console.error('Error deleting segment:', error);
        }
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
  
  .segment-list {
    margin-top: 20px;
  }
  
  ul {
    list-style: none;
    padding: 0;
  }
  
  li {
    margin: 10px 0;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 5px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .edit-button,
  .delete-button {
    background-color: #28a745;
    color: white;
    border: none;
    padding: 5px 10px;
    border-radius: 5px;
    cursor: pointer;
    margin-left: 5px;
  }
  
  .edit-button:hover {
    background-color: #218838;
  }
  
  .delete-button {
    background-color: #dc3545;
  }
  
  .delete-button:hover {
    background-color: #c82333;
  }
  </style>
