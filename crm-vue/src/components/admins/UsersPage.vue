<template>
  <div class="users-page" :class="mode">
    <!-- Toast Notifications -->
    <div v-if="toast.show" class="toast" :class="[toast.type, mode]">
      <span>{{ toast.message }}</span>
      <button class="close-toast" @click="toast.show = false">&times;</button>
    </div>

    <!-- Confirmation Dialog -->
    <div v-if="showDeleteConfirmation" class="confirmation-dialog-overlay">
      <div class="confirmation-dialog" :class="mode">
        <h3>Confirm Deletion</h3>
        <p>Are you sure you want to delete this user? This action cannot be undone.</p>
        <div class="dialog-buttons">
          <button class="confirm-button" @click="proceedDelete">Delete</button>
          <button class="cancel-button" @click="cancelDelete">Cancel</button>
        </div>
      </div>
    </div>

    <div class="header">
      <h1>Users Management</h1>
      <div class="header-buttons">
        <button class="stats-button" @click="viewAdminStats">
          <span class="icon"><i class="fas fa-user-shield"></i></span> View Admins
        </button>
        <button class="stats-button" @click="viewUserStats">
          <span class="icon"><i class="fas fa-users"></i></span> View Users
        </button>
        <button class="invite-user" @click="showInviteUserModal">
          <span class="icon"><i class="fas fa-user-plus"></i></span> Invite Users
        </button>
        <button class="mode-toggle" @click="toggleMode">
          <span class="icon"><i :class="modeIcon"></i></span> {{ modeText }}
        </button>
      </div>
    </div>

    <!-- Users Table -->
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Username</th>
            <th>Email</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in filteredUsers" :key="user.id">
            <td data-label="ID">{{ user.id }}</td>
            <td data-label="Username">{{ user.username }}</td>
            <td data-label="Email">{{ user.email }}</td>
            <td data-label="Status">
              <span :class="['status', user.status.toLowerCase()]">{{ user.status }}</span>
            </td>
            <td data-label="Actions" class="actions">
              <button class="edit-button" @click="editUser(user)">Edit</button>
              <button class="delete-button" @click="initiateDelete(user.id)">Delete</button>
            </td>
          </tr>
          <tr v-if="!filteredUsers.length && !isLoading">
            <td colspan="5" class="no-data">No users found.</td>
          </tr>
          <tr v-if="isLoading">
            <td colspan="5" class="loading">Loading users...</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal for Edit/Invite User -->
    <div v-if="showEditUserForm || showInviteUserForm" class="modal-overlay">
      <div class="modal" :class="mode">
        <h3>{{ modalTitle }}</h3>
        <form @submit.prevent="handleFormSubmit">
          <div class="form-group">
            <label for="username">Username</label>
            <input id="username" v-model="form.username" placeholder="Enter username" required />
          </div>
          <div class="form-group">
            <label for="email">Email</label>
            <input id="email" type="email" v-model="form.email" placeholder="Enter email" required />
          </div>
          <div v-if="showInviteUserForm" class="form-group">
            <p class="info-text">An invitation email with a temporary password and setup link will be sent to the user.</p>
          </div>
          <div class="form-buttons">
            <button type="submit" class="submit-button" :disabled="isSubmitting">
              {{ submitButtonText }}
            </button>
            <button type="button" class="cancel-button" @click="cancel" :disabled="isSubmitting">Cancel</button>
          </div>
          <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
          <p v-if="successMessage" class="success-message">{{ successMessage }}</p>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'UsersPage',
  props: {
    searchQuery: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      users: [],
      filteredUsers: [],
      showEditUserForm: false,
      showInviteUserForm: false,
      isEditing: false,
      isSubmitting: false,
      isLoading: false,
      errorMessage: '',
      successMessage: '',
      form: {
        id: null,
        username: '',
        email: '',
      },
      // Toast notification
      toast: {
        show: false,
        message: '',
        type: 'success', // 'success' or 'error'
      },
      // Delete confirmation
      showDeleteConfirmation: false,
      userToDelete: null,
      // Dark/Light mode
      mode: 'light',
    };
  },
  computed: {
    modalTitle() {
      if (this.isEditing) return 'Edit User';
      return 'Invite User';
    },
    submitButtonText() {
      if (this.isEditing) return 'Update';
      return 'Send Invitation';
    },
    modeIcon() {
      return this.mode === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    },
    modeText() {
      return this.mode === 'dark' ? 'Light Mode' : 'Dark Mode';
    },
  },
  watch: {
    searchQuery(newQuery) {
      this.search(newQuery);
    },
    users() {
      this.search(this.searchQuery);
    },
  },
  mounted() {
    // Check for saved mode preference
    const savedMode = localStorage.getItem('modePreference');
    if (savedMode) {
      this.mode = savedMode;
    } else {
      // Check system preference
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.mode = prefersDark ? 'dark' : 'light';
    }
    this.fetchUsers();
  },
  methods: {
    toggleMode() {
      this.mode = this.mode === 'light' ? 'dark' : 'light';
      localStorage.setItem('modePreference', this.mode);
    },
    viewAdminStats() {
      this.$router.push('/dashboard/admin-stats');
    },
    viewUserStats() {
      this.$router.push('/dashboard/user-stats');
    },
    showToast(message, type = 'success') {
      this.toast = {
        show: true,
        message,
        type,
      };
      setTimeout(() => {
        this.toast.show = false;
      }, 5000);
    },
    initiateDelete(userId) {
      this.userToDelete = userId;
      this.showDeleteConfirmation = true;
    },
    cancelDelete() {
      this.showDeleteConfirmation = false;
      this.userToDelete = null;
    },
    async proceedDelete() {
      try {
        const token = localStorage.getItem('authToken');
        const userToDelete = this.users.find(user => user.id === this.userToDelete);

        // First send the deletion notification email
        try {
          await axios.post(
            'http://localhost:5000/api/admin/users/send-notification',
            {
              email: userToDelete.email,
              type: 'account_deleted'
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        } catch (emailError) {
          console.error('Failed to send deletion notification email:', emailError);
          // Don't fail the deletion if email fails
        }

        // Then proceed with the deletion
        await axios.delete(
          `http://localhost:5000/api/admin/users/${this.userToDelete}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        this.users = this.users.filter(user => user.id !== this.userToDelete);
        this.search(this.searchQuery);
        this.showToast('User deleted successfully!');
      } catch (error) {
        console.error('Error deleting user:', error);
        this.showToast('Failed to delete user. Please try again.', 'error');
      } finally {
        this.showDeleteConfirmation = false;
        this.userToDelete = null;
      }
    },
    async fetchUsers() {
      this.isLoading = true;
      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get('http://localhost:5000/api/admin/users', {
          headers: { Authorization: `Bearer ${token}` },
        });
        this.users = response.data.map(user => ({
          id: user.id,
          username: user.username,
          email: user.email,
          status: user.status.charAt(0).toUpperCase() + user.status.slice(1),
        }));
        this.filteredUsers = [...this.users];
      } catch (error) {
        console.error('Error fetching users:', error);
        this.showToast('Failed to load users. Please try again later.', 'error');
      } finally {
        this.isLoading = false;
      }
    },
    search(query) {
      if (!query.trim()) {
        this.filteredUsers = [...this.users];
      } else {
        const lowerQuery = query.toLowerCase();
        this.filteredUsers = this.users.filter(
          user =>
            user.username.toLowerCase().includes(lowerQuery) ||
            user.email.toLowerCase().includes(lowerQuery)
        );
      }
      this.$emit('update-search', this.filteredUsers);
    },
    showInviteUserModal() {
      this.isEditing = false;
      this.showInviteUserForm = true;
      this.form = { id: null, username: '', email: '' };
      this.errorMessage = '';
      this.successMessage = '';
    },
    async handleFormSubmit() {
      if (this.isEditing) {
        this.updateUser();
      } else {
        this.inviteUser();
      }
    },
    async inviteUser() {
      this.isSubmitting = true;
      this.errorMessage = '';
      this.successMessage = '';
      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.post(
          'http://localhost:5000/api/admin/users/invite',
          {
            username: this.form.username,
            email: this.form.email,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const newUser = {
          id: response.data.userId,
          username: this.form.username,
          email: this.form.email,
          status: 'Pending',
        };
        this.users.push(newUser);
        this.search(this.searchQuery);

        this.showToast('Invitation sent successfully!');
        setTimeout(() => {
          this.showInviteUserForm = false;
          this.isSubmitting = false;
        }, 1500);
      } catch (error) {
        this.errorMessage = error.response?.data?.message || 'Failed to send invitation. Please try again.';
        console.error('Error inviting user:', error);
        this.isSubmitting = false;
      }
    },
    editUser(user) {
      this.isEditing = true;
      this.form = { ...user };
      this.showEditUserForm = true;
      this.showInviteUserForm = false;
      this.errorMessage = '';
      this.successMessage = '';
    },
    async updateUser() {
      this.isSubmitting = true;
      this.errorMessage = '';
      this.successMessage = '';
      try {
        const token = localStorage.getItem('authToken');
        const oldUserData = this.users.find(u => u.id === this.form.id);

        await axios.put(
          `http://localhost:5000/api/admin/users/${this.form.id}`,
          {
            username: this.form.username,
            email: this.form.email,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // Send email notification about the update
        try {
          await axios.post(
            'http://localhost:5000/api/admin/users/send-notification',
            {
              userId: this.form.id,
              email: oldUserData.email,
              type: 'account_updated',
              changes: {
                username: oldUserData.username !== this.form.username
                  ? { old: oldUserData.username, new: this.form.username }
                  : null,
                email: oldUserData.email !== this.form.email
                  ? { old: oldUserData.email, new: this.form.email }
                  : null
              }
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        } catch (emailError) {
          console.error('Failed to send update notification email:', emailError);
          // Don't fail the whole operation if email fails
        }

        const index = this.users.findIndex(u => u.id === this.form.id);
        this.users[index] = { ...this.form };
        this.search(this.searchQuery);

        this.showToast('User updated successfully!');
        setTimeout(() => {
          this.showEditUserForm = false;
          this.isSubmitting = false;
        }, 1500);
      } catch (error) {
        this.errorMessage = error.response?.data?.message || 'Failed to update user. Please try again.';
        console.error('Error updating user:', error);
        this.isSubmitting = false;
      }
    },
    cancel() {
      this.showEditUserForm = false;
      this.showInviteUserForm = false;
      this.isSubmitting = false;
      this.errorMessage = '';
      this.successMessage = '';
    },
  },
};
</script>

<style scoped>
/* Base Styles */
.users-page {
  padding: clamp(8px, 2vw, 12px);
  min-height: 100vh;
  font-family: 'Inter', sans-serif;
  width: 100%;
  max-width: 100%;
  margin: 0 auto;
  box-sizing: border-box;
  transition: background-color 0.3s ease, color 0.3s ease;
}

.users-page.light {
  background-color: #f5f7fa;
  color: #2c3e50;
}

.users-page.dark {
  background-color: #1a1a2e;
  color: #e6e6e6;
}

.header {
  display: flex;
  flex-direction: column;
  gap: clamp(8px, 2vw, 12px);
  align-items: center;
  margin-bottom: clamp(12px, 3vw, 16px);
  text-align: center;
}

h1 {
  font-size: clamp(1.25rem, 3.5vw, 1.5rem);
  font-weight: 700;
  margin: 0;
}

.users-page.light h1 {
  color: #2c3e50;
}

.users-page.dark h1 {
  color: #e6e6e6;
}

.header-buttons {
  display: flex;
  flex-direction: column;
  gap: clamp(6px, 1.5vw, 8px);
  width: 100%;
}

.stats-button,
.invite-user,
.mode-toggle {
  color: white;
  border: none;
  padding: clamp(6px, 1.5vw, 8px) clamp(10px, 2.5vw, 12px);
  border-radius: 8px;
  cursor: pointer;
  font-size: clamp(0.75rem, 1.8vw, 0.8rem);
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: clamp(6px, 1.5vw, 8px);
  transition: all 0.2s ease;
  min-height: 40px;
  width: 100%;
}

.stats-button {
  background: #4a6fa5;
}

.stats-button:hover {
  background: #3a5a80;
}

.invite-user {
  background: #5cb85c;
}

.invite-user:hover {
  background: #4cae4c;
}

.mode-toggle {
  background: #6c757d;
}

.mode-toggle:hover {
  background: #5a6268;
}

.icon {
  font-size: clamp(0.9rem, 2vw, 1rem);
}

.table-container {
  width: 100%;
  max-width: 100%;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: background-color 0.3s ease;
}

.users-page.light .table-container {
  background: white;
}

.users-page.dark .table-container {
  background: #16213e;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  padding: clamp(4px, 1vw, 6px) clamp(6px, 1.5vw, 8px);
  text-align: left;
  font-size: clamp(0.7rem, 1.8vw, 0.75rem);
  white-space: normal;
  word-break: break-word;
}

.users-page.light th,
.users-page.light td {
  color: #2c3e50;
}

.users-page.dark th,
.users-page.dark td {
  color: #e6e6e6;
}

th {
  background: #4a6fa5;
  color: white;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.users-page.dark th {
  background: #0f3460;
}

td {
  border-bottom: 1px solid;
}

.users-page.light td {
  border-bottom-color: #ecf0f1;
}

.users-page.dark td {
  border-bottom-color: #2a3a5e;
}

td.email {
  word-break: break-word;
  max-width: 200px;
}

.status {
  padding: clamp(2px, 0.5vw, 3px) clamp(4px, 1vw, 6px);
  border-radius: 10px;
  font-size: clamp(0.65rem, 1.5vw, 0.7rem);
  font-weight: 500;
  display: inline-block;
}

.status.pending {
  background: #f0ad4e;
  color: #fff;
}

.status.active {
  background: #5cb85c;
  color: #fff;
}

.status.inactive {
  background: #6c757d;
  color: #fff;
}

.actions {
  display: flex;
  gap: clamp(4px, 1vw, 6px);
}

.edit-button,
.delete-button {
  padding: clamp(4px, 1vw, 6px) clamp(6px, 1.5vw, 8px);
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: clamp(0.65rem, 1.5vw, 0.7rem);
  font-weight: 500;
  transition: all 0.2s ease;
  min-height: 40px;
  min-width: 60px;
}

.edit-button {
  background: #5cb85c;
  color: white;
}

.edit-button:hover {
  background: #4cae4c;
}

.delete-button {
  background: #d9534f;
  color: white;
}

.delete-button:hover {
  background: #c9302c;
}

.no-data,
.loading {
  text-align: center;
  padding: clamp(12px, 3vw, 16px);
  font-size: clamp(0.75rem, 1.8vw, 0.8rem);
  font-style: italic;
}

.users-page.light .no-data,
.users-page.light .loading {
  color: #7f8c8d;
}

.users-page.dark .no-data,
.users-page.dark .loading {
  color: #a8a8a8;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  padding: clamp(8px, 2vw, 10px);
  border-radius: 8px;
  width: 100%;
  max-width: clamp(240px, 90vw, 280px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: background-color 0.3s ease, color 0.3s ease;
}

.users-page.light .modal {
  background: white;
  color: #2c3e50;
}

.users-page.dark .modal {
  background: #16213e;
  color: #e6e6e6;
}

.modal h3 {
  font-size: clamp(0.9rem, 2vw, 1rem);
  font-weight: 600;
  margin-bottom: clamp(6px, 1.5vw, 8px);
  text-align: center;
}

.form-group {
  margin-bottom: clamp(6px, 1.5vw, 8px);
}

label {
  display: block;
  font-size: clamp(0.7rem, 1.5vw, 0.75rem);
  font-weight: 500;
  margin-bottom: clamp(4px, 1vw, 6px);
}

.users-page.light label {
  color: #34495e;
}

.users-page.dark label {
  color: #e6e6e6;
}

input {
  width: 100%;
  padding: clamp(4px, 1vw, 6px) clamp(6px, 1.5vw, 8px);
  border: 1px solid;
  border-radius: 6px;
  font-size: clamp(0.7rem, 1.5vw, 0.75rem);
  box-sizing: border-box;
  transition: all 0.3s ease;
}

.users-page.light input {
  border-color: #dcdcdc;
  color: #2c3e50;
  background: white;
}

.users-page.dark input {
  border-color: #3a4a6e;
  color: #e6e6e6;
  background: #0f3460;
}

.users-page.light input:focus {
  border-color: #4a6fa5;
  outline: none;
}

.users-page.dark input:focus {
  border-color: #5cb85c;
  outline: none;
}

.info-text {
  font-size: clamp(0.65rem, 1.5vw, 0.7rem);
  margin-top: clamp(4px, 1vw, 6px);
}

.users-page.light .info-text {
  color: #7f8c8d;
}

.users-page.dark .info-text {
  color: #a8a8a8;
}

.form-buttons {
  display: flex;
  flex-direction: column;
  gap: clamp(6px, 1.5vw, 8px);
  margin-top: clamp(6px, 1.5vw, 8px);
}

.submit-button,
.cancel-button {
  padding: clamp(4px, 1vw, 6px) clamp(6px, 1.5vw, 8px);
  border: none;
  border-radius: 6px;
  font-size: clamp(0.7rem, 1.5vw, 0.75rem);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 40px;
  width: 100%;
}

.submit-button {
  background: #4a6fa5;
  color: white;
}

.submit-button:hover:not(:disabled) {
  background: #3a5a80;
}

.cancel-button {
  background: #6c757d;
  color: white;
}

.cancel-button:hover:not(:disabled) {
  background: #5a6268;
}

.submit-button:disabled,
.cancel-button:disabled {
  background: #95a5a6;
  cursor: not-allowed;
}

.error-message {
  color: #d9534f;
  font-size: clamp(0.65rem, 1.5vw, 0.7rem);
  text-align: center;
  margin-top: clamp(4px, 1vw, 6px);
}

.success-message {
  color: #5cb85c;
  font-size: clamp(0.65rem, 1.5vw, 0.7rem);
  text-align: center;
  margin-top: clamp(4px, 1vw, 6px);
}

.toast {
  position: fixed;
  bottom: clamp(8px, 2vw, 10px);
  left: clamp(8px, 2vw, 10px);
  right: clamp(8px, 2vw, 10px);
  padding: clamp(6px, 1.5vw, 8px) clamp(8px, 2vw, 10px);
  border-radius: 8px;
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: clamp(160px, 90vw, 240px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 1001;
  font-size: clamp(0.7rem, 1.5vw, 0.75rem);
}

.toast.success {
  background: #5cb85c;
}

.toast.error {
  background: #d9534f;
}

.close-toast {
  background: transparent;
  border: none;
  color: white;
  font-size: clamp(1rem, 2vw, 1.1rem);
  cursor: pointer;
  padding: clamp(4px, 1vw, 6px);
  min-width: 36px;
  min-height: 36px;
}

.close-toast:hover {
  opacity: 0.8;
}

.confirmation-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.confirmation-dialog {
  padding: clamp(8px, 2vw, 10px);
  border-radius: 8px;
  width: 100%;
  max-width: clamp(240px, 90vw, 280px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: background-color 0.3s ease, color 0.3s ease;
}

.users-page.light .confirmation-dialog {
  background: white;
  color: #2c3e50;
}

.users-page.dark .confirmation-dialog {
  background: #16213e;
  color: #e6e6e6;
}

.confirmation-dialog h3 {
  font-size: clamp(0.9rem, 2vw, 1rem);
  font-weight: 600;
  margin-bottom: clamp(6px, 1.5vw, 8px);
  text-align: center;
}

.confirmation-dialog p {
  font-size: clamp(0.7rem, 1.5vw, 0.75rem);
  margin-bottom: clamp(6px, 1.5vw, 8px);
  line-height: 1.4;
}

.users-page.light .confirmation-dialog p {
  color: #7f8c8d;
}

.users-page.dark .confirmation-dialog p {
  color: #a8a8a8;
}

.dialog-buttons {
  display: flex;
  flex-direction: column;
  gap: clamp(6px, 1.5vw, 8px);
}

.confirm-button {
  padding: clamp(4px, 1vw, 6px) clamp(6px, 1.5vw, 8px);
  background: #d9534f;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: clamp(0.7rem, 1.5vw, 0.75rem);
  font-weight: 500;
  transition: all 0.2s ease;
  min-height: 40px;
  width: 100%;
}

.confirm-button:hover {
  background: #c9302c;
}

.cancel-button:not(.form-buttons .cancel-button) {
  padding: clamp(4px, 1vw, 6px) clamp(6px, 1.5vw, 8px);
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: clamp(0.7rem, 1.5vw, 0.75rem);
  font-weight: 500;
  transition: all 0.2s ease;
  min-height: 40px;
  width: 100%;
}

.cancel-button:hover:not(.form-buttons .cancel-button) {
  background: #5a6268;
}

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideIn {
  from { transform: translateY(-10px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@keyframes slideInRight {
  from { transform: translateX(50%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

/* Tablets (≥481px) */
@media (min-width: 481px) {
  .users-page {
    padding: clamp(12px, 2.5vw, 16px);
  }

  .header {
    gap: clamp(12px, 3vw, 16px);
    margin-bottom: clamp(16px, 3.5vw, 20px);
  }

  h1 {
    font-size: clamp(1.5rem, 3.5vw, 1.75rem);
  }

  .header-buttons {
    gap: clamp(8px, 2vw, 10px);
  }

  .stats-button,
  .invite-user,
  .mode-toggle {
    padding: clamp(8px, 2vw, 10px) clamp(12px, 3vw, 16px);
    font-size: clamp(0.8rem, 2vw, 0.85rem);
  }

  .icon {
    font-size: clamp(1rem, 2.5vw, 1.1rem);
  }

  th,
  td {
    padding: clamp(6px, 1.5vw, 8px) clamp(8px, 2vw, 10px);
    font-size: clamp(0.75rem, 1.8vw, 0.8rem);
  }

  td.email {
    max-width: 200px;
  }

  .status {
    padding: clamp(3px, 0.8vw, 4px) clamp(6px, 1.5vw, 8px);
    font-size: clamp(0.7rem, 1.8vw, 0.75rem);
  }

  .edit-button,
  .delete-button {
    padding: clamp(6px, 1.5vw, 8px) clamp(8px, 2vw, 10px);
    font-size: clamp(0.7rem, 1.8vw, 0.75rem);
    min-width: 70px;
  }

  .no-data,
  .loading {
    padding: clamp(16px, 3.5vw, 20px);
    font-size: clamp(0.8rem, 2vw, 0.85rem);
  }

  .modal {
    padding: clamp(12px, 3vw, 16px);
    max-width: clamp(320px, 80vw, 360px);
  }

  .modal h3 {
    font-size: clamp(1.1rem, 2.5vw, 1.25rem);
    margin-bottom: clamp(8px, 2vw, 10px);
  }

  .form-group {
    margin-bottom: clamp(8px, 2vw, 10px);
  }

  label {
    font-size: clamp(0.75rem, 1.8vw, 0.8rem);
    margin-bottom: clamp(6px, 1.5vw, 8px);
  }

  input {
    padding: clamp(6px, 1.5vw, 8px) clamp(8px, 2vw, 10px);
    font-size: clamp(0.75rem, 1.8vw, 0.8rem);
  }

  .info-text {
    font-size: clamp(0.7rem, 1.8vw, 0.75rem);
  }

  .form-buttons {
    flex-direction: row;
    gap: clamp(8px, 2vw, 10px);
    margin-top: clamp(8px, 2vw, 10px);
  }

  .submit-button,
  .cancel-button {
    padding: clamp(6px, 1.5vw, 8px) clamp(10px, 2.5vw, 12px);
    font-size: clamp(0.75rem, 1.8vw, 0.8rem);
    min-width: 100px;
    width: auto;
  }

  .error-message,
  .success-message {
    font-size: clamp(0.7rem, 1.8vw, 0.75rem);
    margin-top: clamp(6px, 1.5vw, 8px);
  }

  .confirmation-dialog {
    padding: clamp(12px, 3vw, 16px);
    max-width: clamp(320px, 80vw, 360px);
  }

  .confirmation-dialog h3 {
    font-size: clamp(1.1rem, 2.5vw, 1.25rem);
    margin-bottom: clamp(8px, 2vw, 10px);
  }

  .confirmation-dialog p {
    font-size: clamp(0.75rem, 1.8vw, 0.8rem);
    margin-bottom: clamp(8px, 2vw, 10px);
  }

  .dialog-buttons {
    flex-direction: row;
    gap: clamp(8px, 2vw, 10px);
  }

  .confirm-button,
  .cancel-button:not(.form-buttons .cancel-button) {
    padding: clamp(6px, 1.5vw, 8px) clamp(10px, 2.5vw, 12px);
    font-size: clamp(0.75rem, 1.8vw, 0.8rem);
    min-width: 100px;
    width: auto;
  }

  .toast {
    width: clamp(200px, 80vw, 280px);
    padding: clamp(8px, 2vw, 10px) clamp(12px, 3vw, 16px);
    font-size: clamp(0.75rem, 1.8vw, 0.8rem);
  }

  .close-toast {
    font-size: clamp(1.1rem, 2.5vw, 1.25rem);
    min-width: 40px;
    min-height: 40px;
  }
}

/* Desktop (≥769px) */
@media (min-width: 769px) {
  .users-page {
    padding: clamp(24px, 3vw, 40px);
  }

  .header {
    flex-direction: row;
    justify-content: space-between;
    gap: clamp(16px, 3.5vw, 24px);
    margin-bottom: clamp(24px, 4vw, 40px);
    text-align: left;
  }

  h1 {
    font-size: clamp(1.75rem, 3vw, 2rem);
    white-space: nowrap;
  }

  .header-buttons {
    flex-direction: row;
    justify-content: flex-end;
    gap: clamp(12px, 2vw, 16px);
    width: auto;
  }

  .stats-button,
  .invite-user,
  .mode-toggle {
    padding: clamp(8px, 1.5vw, 10px) clamp(12px, 2vw, 16px);
    font-size: clamp(0.85rem, 1.2vw, 0.9rem);
    width: auto;
  }

  .icon {
    font-size: clamp(1rem, 1.5vw, 1.1rem);
  }

  th,
  td {
    padding: clamp(8px, 1.5vw, 12px) clamp(12px, 2vw, 16px);
    font-size: clamp(0.85rem, 1.2vw, 0.9rem);
  }

  td.email {
    max-width: 200px;
  }

  .status {
    padding: clamp(4px, 0.8vw, 6px) clamp(8px, 1.5vw, 12px);
    font-size: clamp(0.8rem, 1.2vw, 0.85rem);
  }

  .actions {
    gap: clamp(8px, 1.5vw, 12px);
  }

  .edit-button,
  .delete-button {
    padding: clamp(6px, 1.2vw, 8px) clamp(10px, 1.8vw, 14px);
    font-size: clamp(0.8rem, 1.2vw, 0.85rem);
    min-width: 80px;
  }

  .no-data,
  .loading {
    padding: clamp(20px, 3vw, 24px);
    font-size: clamp(0.9rem, 1.2vw, 1rem);
  }

  .modal {
    padding: clamp(16px, 3vw, 24px);
    max-width: clamp(400px, 50vw, 500px);
  }

  .modal h3 {
    font-size: clamp(1.25rem, 2vw, 1.5rem);
    margin-bottom: clamp(12px, 2vw, 16px);
  }

  .form-group {
    margin-bottom: clamp(12px, 2vw, 16px);
  }

  label {
    font-size: clamp(0.85rem, 1.2vw, 0.9rem);
    margin-bottom: clamp(8px, 1.5vw, 12px);
  }

  input {
    padding: clamp(8px, 1.5vw, 12px) clamp(12px, 2vw, 16px);
    font-size: clamp(0.85rem, 1.2vw, 0.9rem);
  }

  .info-text {
    font-size: clamp(0.8rem, 1.2vw, 0.85rem);
  }

  .form-buttons {
    gap: clamp(12px, 2vw, 16px);
    margin-top: clamp(16px, 2.5vw, 20px);
  }

  .submit-button,
  .cancel-button {
    padding: clamp(8px, 1.5vw, 12px) clamp(12px, 2vw, 16px);
    font-size: clamp(0.85rem, 1.2vw, 0.9rem);
    min-width: 120px;
  }

  .error-message,
  .success-message {
    font-size: clamp(0.8rem, 1.2vw, 0.85rem);
    margin-top: clamp(12px, 2vw, 16px);
  }

  .confirmation-dialog {
    padding: clamp(16px, 3vw, 24px);
    max-width: clamp(400px, 50vw, 500px);
  }

  .confirmation-dialog h3 {
    font-size: clamp(1.25rem, 2vw, 1.5rem);
    margin-bottom: clamp(12px, 2vw, 16px);
  }

  .confirmation-dialog p {
    font-size: clamp(0.85rem, 1.2vw, 0.9rem);
    margin-bottom: clamp(12px, 2vw, 16px);
  }

  .dialog-buttons {
    gap: clamp(12px, 2vw, 16px);
  }

  .confirm-button,
  .cancel-button:not(.form-buttons .cancel-button) {
    padding: clamp(8px, 1.5vw, 12px) clamp(12px, 2vw, 16px);
    font-size: clamp(0.85rem, 1.2vw, 0.9rem);
    min-width: 120px;
  }

  .toast {
    width: clamp(280px, 30vw, 350px);
    padding: clamp(12px, 1.5vw, 14px) clamp(16px, 2vw, 20px);
    font-size: clamp(0.85rem, 1.2vw, 0.9rem);
  }

  .close-toast {
    font-size: clamp(1.25rem, 1.8vw, 1.5rem);
    min-width: 44px;
    min-height: 44px;
  }
}

/* Large Desktop (≥1200px) */
@media (min-width: 1200px) {
  .users-page {
    padding: clamp(24px, 2.5vw, 40px);
  }

  .header {
    margin-bottom: clamp(32px, 3vw, 48px);
  }

  .header-buttons {
    gap: clamp(16px, 1.5vw, 20px);
  }

  .modal {
    max-width: 500px;
  }

  .confirmation-dialog {
    max-width: 500px;
  }
}

/* Accessibility Focus Styles */
button:focus,
input:focus,
select:focus {
  outline: 2px solid #4a6fa5;
  outline-offset: 2px;
}

.users-page.dark button:focus,
.users-page.dark input:focus,
.users-page.dark select:focus {
  outline-color: #5cb85c;
}

/* Print Styles */
@media print {
  .users-page {
    padding: 0;
    background: white !important;
    color: black !important;
  }

  .header-buttons,
  .actions,
  .toast,
  .confirmation-dialog-overlay,
  .modal-overlay {
    display: none !important;
  }

  .table-container {
    box-shadow: none;
    overflow: visible;
  }

  table {
    border: 1px solid #ddd;
    width: 100%;
  }

  th {
    background: #f1f1f1 !important;
    color: black !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  td {
    border-bottom: 1px solid #ddd !important;
  }
}
</style>