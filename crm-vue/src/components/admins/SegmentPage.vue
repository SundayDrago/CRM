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
  export default {
    name: 'SegmentationPage',
    data() {
      return {
        segments: [], // Placeholder for segments
      };
    },
    methods: {
      createNewSegment() {
        alert('Create New Segment functionality not implemented yet.');
        // Logic for creating a new segment can be added here
      },
      fetchAllSegments() {
        // Mocked data fetching - replace with actual API call
        this.segments = [
          { id: 1, name: 'High Spenders', count: 150 },
          { id: 2, name: 'Frequent Shoppers', count: 300 },
          { id: 3, name: 'New Customers', count: 200 },
        ];
      },
      exportSegments() {
        alert('Export Segments functionality not implemented yet.');
        // Logic for exporting segments can be added here
      },
      importSegments() {
        alert('Import Segments functionality not implemented yet.');
        // Logic for importing segments can be added here
      },
      editSegment(segmentId) {
        alert(`Editing segment ID: ${segmentId}`);
        // Logic for editing the segment can be added here
      },
      deleteSegment(segmentId) {
        alert(`Deleting segment ID: ${segmentId}`);
        // Logic for deleting the segment can be added here
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
  