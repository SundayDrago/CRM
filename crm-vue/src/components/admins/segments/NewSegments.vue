<template>
  <div class="container">
    <!-- Header Section - Improved with better gradient and typography -->
    <div class="header">
      <div class="header-content">
        <div>
          <h1>Recently Created Segments</h1>
          <p>Showing segments created in the last 30 minutes</p>
        </div>
        <div class="header-actions">
          <button 
            @click="fetchRecentSegments" 
            class="refresh-button"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd" />
            </svg>
            Refresh
          </button>
          <div class="last-updated">
            <div class="pulse-indicator"></div>
            <span>Last updated: {{ lastUpdated }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Loading State - More elegant spinner -->
    <div v-if="loading" class="loading-state">
      <div class="loading-content">
        <div class="spinner-container">
          <div class="spinner-background"></div>
          <div class="spinner"></div>
        </div>
        <div class="loading-text">
          <p>Loading segments</p>
          <p>We're fetching the latest data for you</p>
        </div>
      </div>
    </div>
    
    <!-- Error State - More professional alert -->
    <div v-else-if="error" class="error-state">
      <div class="error-content">
        <div class="error-icon">
          <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="error-message">
          <div class="error-header">
            <h3>Error loading segments</h3>
            <button @click="error = null" class="close-error">
              <svg class="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="error-text">
            <p>{{ error }}</p>
          </div>
          <div class="error-action">
            <button 
              @click="fetchRecentSegments"
              class="retry-button"
            >
              Retry
              <svg class="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Empty State - More visually appealing -->
    <div v-else-if="recentSegments.length === 0" class="empty-state">
      <div class="empty-content">
        <div class="empty-icon">
          <svg xmlns="http://www.w3.org/2000/svg" class="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3>No recent segments</h3>
        <p>No segments have been created in the last 30 minutes. Check back later or create a new segment.</p>
        <div class="empty-action">
          <button 
            @click="fetchRecentSegments"
            class="refresh-button"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>
    </div>
    
    <!-- Segments Table - More polished design -->
    <div v-else class="table-container">
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Criteria</th>
              <th>Count</th>
              <th>Source</th>
              <th>Created At</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="segment in recentSegments" 
              :key="segment.id" 
              @click="showSegmentDetails(segment)"
            >
              <td class="font-mono">{{ segment.id }}</td>
              <td>{{ segment.name }}</td>
              <td>
                <div class="criteria-text">{{ segment.criteria }}</div>
              </td>
              <td>
                <span 
                  class="count-badge"
                  :class="{
                    'count-high': segment.count > 1000,
                    'count-medium': segment.count <= 1000 && segment.count > 100,
                    'count-low': segment.count <= 100
                  }"
                >
                  {{ segment.count.toLocaleString() }}
                </span>
              </td>
              <td>
                <div class="source-container">
                  <span>{{ segment.source }}</span>
                  <span 
                    class="source-badge"
                    :class="{ 'source-api': segment.source === 'API', 'source-ui': segment.source !== 'API' }"
                  >
                    {{ segment.source === 'API' ? 'API' : 'UI' }}
                  </span>
                </div>
              </td>
              <td>{{ formatDate(segment.createdAt) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Segment Details Modal - More polished design -->
    <div v-if="selectedSegment" class="modal">
      <div class="modal-overlay" @click="selectedSegment = null"></div>
      <div class="modal-content">
        <div class="modal-header">
          <div>
            <h3>{{ selectedSegment.name }}</h3>
            <p>Segment details</p>
          </div>
          <button @click="selectedSegment = null" class="close-modal">
            <svg class="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div class="modal-body">
          <div class="modal-grid">
            <div class="modal-grid-item">
              <p class="modal-label">Segment ID</p>
              <p class="modal-value font-mono">{{ selectedSegment.id }}</p>
            </div>
            <div class="modal-grid-item">
              <p class="modal-label">Source</p>
              <p class="modal-value">{{ selectedSegment.source }}</p>
            </div>
            <div class="modal-grid-item">
              <p class="modal-label">Count</p>
              <p class="modal-value">{{ selectedSegment.count.toLocaleString() }}</p>
            </div>
          </div>
          
          <div class="modal-section">
            <p class="modal-label">Created At</p>
            <p class="modal-value">{{ formatDate(selectedSegment.createdAt) }}</p>
          </div>
          
          <div class="modal-section">
            <p class="modal-label">Criteria</p>
            <div class="modal-criteria">
              <pre>{{ selectedSegment.criteria }}</pre>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button 
            type="button" 
            class="cancel-button"
            @click="selectedSegment = null"
          >
            Cancel
          </button>
          <button 
            type="button" 
            class="done-button"
            @click="selectedSegment = null"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';

// Reactive state
const recentSegments = ref([]);
const loading = ref(true);
const error = ref(null);
const selectedSegment = ref(null);
const lastFetchTime = ref(null);

// Computed property for last updated time
const lastUpdated = computed(() => {
  if (!lastFetchTime.value) return 'Never';
  return formatDate(lastFetchTime.value);
});

// Fetch segments created in the last 30 minutes
const fetchRecentSegments = async () => {
  try {
    loading.value = true;
    error.value = null;

    // Make API call to Flask backend using /recent-segments endpoint
    const response = await axios.get('http://127.0.0.1:5000/recent-segments', {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    recentSegments.value = response.data;
    lastFetchTime.value = new Date().toISOString();

  } catch (err) {
    error.value = `Failed to fetch recent segments: ${err.response?.data?.error || err.message}`;
    console.error('Error fetching recent segments:', err);
  } finally {
    loading.value = false;
  }
};

// Show segment details in modal
const showSegmentDetails = (segment) => {
  selectedSegment.value = segment;
};

// Format ISO date to a readable string
const formatDate = (isoString) => {
  const date = new Date(isoString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
};

// Fetch segments on component mount
onMounted(() => {
  fetchRecentSegments();
});
</script>
<style scoped>
/* Flat CSS for a professional and visually appealing design */

/* General Reset */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

/* Container */
.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 24px;
}

/* Header Section */
.header {
  background: linear-gradient(to right, #94b1f0, #a5a1f5);
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 32px;
}

.header-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.header-content h1 {
  font-size: 30px;
  font-weight: 700;
  color: #ffffff;
  line-height: 1.2;
}

.header-content p {
  font-size: 16px;
  color: #e0f2fe;
  opacity: 0.9;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 16px;
}

.refresh-button {
  display: flex;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.9);
  color: #1e40af;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s, box-shadow 0.2s, transform 0.2s;
}

.refresh-button:hover {
  background-color: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transform: scale(1.05);
}

.refresh-button .icon {
  width: 20px;
  height: 20px;
  margin-right: 8px;
}

.last-updated {
  display: flex;
  align-items: center;
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
}

.pulse-indicator {
  width: 10px;
  height: 10px;
  background-color: #34d399;
  border-radius: 50%;
  margin-right: 8px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.4; }
  100% { opacity: 1; }
}

/* Loading State */
.loading-state {
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  padding: 32px;
  text-align: center;
  border: 1px solid #f3f4f6;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.spinner-container {
  position: relative;
  width: 48px;
  height: 48px;
}

.spinner-background {
  position: absolute;
  width: 48px;
  height: 48px;
  border: 2px solid #e5e7eb;
  border-radius: 50%;
}

.spinner {
  position: absolute;
  width: 48px;
  height: 48px;
  border: 2px solid #3b82f6;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text p:first-child {
  font-size: 16px;
  font-weight: 500;
  color: #374151;
}

.loading-text p:last-child {
  font-size: 14px;
  color: #6b7280;
}

/* Error State */
.error-state {
  background-color: #ffffff;
  border-radius: 8px;
  border: 1px solid #fee2e2;
  overflow: hidden;
  margin-bottom: 24px;
}

.error-content {
  display: flex;
  padding: 16px;
}

.error-icon {
  flex-shrink: 0;
}

.error-icon .icon {
  width: 20px;
  height: 20px;
  color: #ef4444;
}

.error-message {
  flex: 1;
  margin-left: 12px;
}

.error-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.error-header h3 {
  font-size: 14px;
  font-weight: 500;
  color: #991b1b;
}

.close-error {
  background: none;
  border: none;
  cursor: pointer;
  color: #ef4444;
  transition: color 0.2s;
}

.close-error:hover {
  color: #dc2626;
}

.close-error .icon {
  width: 16px;
  height: 16px;
}

.error-text p {
  font-size: 14px;
  color: #b91c1c;
  margin-top: 4px;
}

.error-action {
  margin-top: 12px;
}

.retry-button {
  display: flex;
  align-items: center;
  background-color: #dc2626;
  color: #ffffff;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.2s;
}

.retry-button:hover {
  background-color: #b91c1c;
  transform: scale(1.05);
}

.retry-button .icon {
  width: 12px;
  height: 12px;
  margin-left: 4px;
}

/* Empty State */
.empty-state {
  background-color: #ffffff;
  border-radius: 12px;
  border: 1px solid #f3f4f6;
  text-align: center;
  overflow: hidden;
}

.empty-content {
  padding: 48px;
}

.empty-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 96px;
  height: 96px;
  background-color: #eff6ff;
  border-radius: 50%;
  margin: 0 auto 16px;
}

.empty-icon .icon {
  width: 48px;
  height: 48px;
  color: #60a5fa;
}

.empty-content h3 {
  font-size: 18px;
  font-weight: 500;
  color: #111827;
}

.empty-content p {
  font-size: 14px;
  color: #6b7280;
  max-width: 448px;
  margin: 8px auto 0;
}

.empty-action {
  margin-top: 24px;
}

.empty-action .refresh-button {
  background-color: #2563eb;
  color: #ffffff;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  display: flex;
  align-items: center;
  transition: background-color 0.2s, transform 0.2s;
}

.empty-action .refresh-button:hover {
  background-color: #1d4ed8;
  transform: scale(1.05);
}

.empty-action .refresh-button .icon {
  width: 16px;
  height: 16px;
  margin-right: 8px;
}

/* Table Styling */
.table-container {
  background-color: #ffffff;
  border-radius: 12px;
  border: 1px solid #f3f4f6;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.table-wrapper {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th {
  padding: 12px 24px;
  text-align: left;
  font-size: 12px;
  font-weight: 500;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background-color: #f9fafb;
}

td {
  padding: 16px 24px;
  font-size: 14px;
  color: #374151;
}

tbody tr {
  border-bottom: 1px solid #f3f4f6;
  transition: background-color 0.15s;
}

tbody tr:hover {
  background-color: #f9fafb;
  cursor: pointer;
}

td.font-mono {
  font-family: 'Courier New', Courier, monospace;
  font-weight: 500;
  color: #111827;
}

.criteria-text {
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.count-badge {
  display: inline-flex;
  padding: 2px 10px;
  font-size: 12px;
  font-weight: 600;
  border-radius: 9999px;
}

.count-high {
  background-color: #d1fae5;
  color: #065f46;
}

.count-medium {
  background-color: #dbeafe;
  color: #1e40af;
}

.count-low {
  background-color: #f3f4f6;
  color: #374151;
}

.source-container {
  display: flex;
  align-items: center;
  gap: 8px;
}

.source-badge {
  display: inline-flex;
  padding: 2px 8px;
  font-size: 12px;
  font-weight: 500;
  border-radius: 4px;
}

.source-api {
  background-color: #e0e7ff;
  color: #4f46e5;
}

.source-ui {
  background-color: #d1fae5;
  color: #065f46;
}

/* Modal Styling */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow-y: auto;
  z-index: 50;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(107, 114, 128, 0.75);
  backdrop-filter: blur(4px);
  transition: opacity 0.3s ease-out;
}

.modal-content {
  position: relative;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  margin: 32px auto;
  max-width: 672px;
  width: 100%;
  transform: translateY(0);
  transition: opacity 0.3s ease-out, transform 0.3s ease-out;
}

.modal-content[aria-hidden="true"] {
  opacity: 0;
  transform: translateY(16px);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 24px 24px 16px;
}

.modal-header h3 {
  font-size: 20px;
  font-weight: 600;
  color: #111827;
}

.modal-header p {
  font-size: 14px;
  color: #6b7280;
  margin-top: 4px;
}

.close-modal {
  background: none;
  border: none;
  cursor: pointer;
  color: #9ca3af;
  transition: color 0.2s;
}

.close-modal:hover {
  color: #6b7280;
}

.close-modal .icon {
  width: 24px;
  height: 24px;
}

.modal-body {
  padding: 0 24px 24px;
}

.modal-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 20px;
}

.modal-grid-item {
  background-color: #f9fafb;
  padding: 16px;
  border-radius: 8px;
  transition: box-shadow 0.2s;
}

.modal-grid-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.modal-label {
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  margin-bottom: 8px;
}

.modal-value {
  font-size: 14px;
  color: #111827;
}

.modal-section {
  margin-bottom: 20px;
}

.modal-criteria {
  background-color: #f9fafb;
  padding: 16px;
  border-radius: 8px;
  max-height: 240px;
  overflow-y: auto;
}

.modal-criteria pre {
  font-size: 14px;
  font-family: 'Courier New', Courier, monospace;
  color: #111827;
  white-space: pre-wrap;
}

.modal-footer {
  background-color: #f9fafb;
  padding: 16px 24px;
  border-radius: 0 0 12px 12px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.cancel-button {
  padding: 8px 16px;
  background-color: #ffffff;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.2s;
}

.cancel-button:hover {
  background-color: #f9fafb;
  transform: scale(1.05);
}

.done-button {
  padding: 8px 16px;
  background-color: #2563eb;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  color: #ffffff;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.2s;
}

.done-button:hover {
  background-color: #89a4f0;
  transform: scale(1.05);
}

/* Responsive Adjustments */
@media (max-width: 640px) {
  .container {
    padding: 16px;
  }

  .header {
    padding: 16px;
  }

  .header-content {
    flex-direction: column;
  }

  .header-actions {
    flex-direction: column;
    align-items: flex-start;
    margin-top: 12px;
  }

  .header-content h1 {
    font-size: 24px;
  }

  th, td {
    padding: 12px 16px;
  }

  .modal-grid {
    grid-template-columns: 1fr;
  }

  .modal-content {
    margin: 16px;
  }
}

/* Accessibility Enhancements */
button:focus,
.cancel-button:focus,
.done-button:focus,
.refresh-button:focus,
.retry-button:focus,
.close-error:focus,
.close-modal:focus {
  outline: none;
  box-shadow: 0 0 0 2px #3b82f6;
}

tr:focus {
  outline: none;
  box-shadow: 0 0 0 2px #3b82f6;
  background-color: #f9fafb;
}

/* Custom Scrollbar for Modal Criteria */
.modal-criteria::-webkit-scrollbar {
  width: 8px;
}

.modal-criteria::-webkit-scrollbar-track {
  background-color: #f3f4f6;
  border-radius: 4px;
}

.modal-criteria::-webkit-scrollbar-thumb {
  background-color: #9ca3af;
  border-radius: 4px;
}

.modal-criteria::-webkit-scrollbar-thumb:hover {
  background-color: #6b7280;
}
</style>