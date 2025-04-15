<template>
  <div class="users-page">
    <!-- Toast Notifications -->
    <div v-if="toast.show" class="toast" :class="toast.type">
      <span>{{ toast.message }}</span>
      <button class="close-toast" @click="toast.show = false">&times;</button>
    </div>

    <!-- Confirmation Dialog -->
    <div v-if="showDeleteConfirmation" class="confirmation-dialog-overlay">
      <div class="confirmation-dialog">
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
      <div class="modal">
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
    };
  },
  watch: {
    searchQuery(newQuery) {
      this.search(newQuery);
    },
    users() {
      this.search(this.searchQuery);
    },
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
  },
  methods: {
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
        await axios.delete(`http://localhost:5000/api/admin/users/${this.userToDelete}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
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
        await axios.put(
          `http://localhost:5000/api/admin/users/${this.form.id}`,
          {
            username: this.form.username,
            email: this.form.email,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
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
  mounted() {
    this.fetchUsers();
  },
};
</script>

<style scoped>
/* Mobile-First Base Styles */
.users-page {
  padding: clamp(8px, 2vw, 12px);
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
  font-family: 'Inter', sans-serif;
  max-width: 1400px;
  margin: 0 auto;
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
  color: #2c3e50;
  margin: 0;
}

.header-buttons {
  display: flex;
  flex-direction: column;
  gap: clamp(6px, 1.5vw, 8px);
  width: 100%;
}

.stats-button,
.invite-user {
  background: #4361ee;
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
  transition: background 0.2s ease;
  min-height: 40px;
  width: 100%;
}

.stats-button {
  background: #34495e;
}

.stats-button:hover {
  background: #2c3e50;
}

.invite-user:hover {
  background: #3b54d9;
}

.icon {
  font-size: clamp(0.9rem, 2vw, 1rem);
}

.table-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  min-width: 600px;
}

th,
td {
  padding: clamp(4px, 1vw, 6px) clamp(6px, 1.5vw, 8px);
  text-align: left;
  font-size: clamp(0.7rem, 1.8vw, 0.75rem);
  color: #2c3e50;
}

th {
  background: #34495e;
  color: white;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

td {
  border-bottom: 1px solid #ecf0f1;
}

td.email {
  word-break: break-word;
  max-width: 120px;
}

.status {
  padding: clamp(2px, 0.5vw, 3px) clamp(4px, 1vw, 6px);
  border-radius: 10px;
  font-size: clamp(0.65rem, 1.5vw, 0.7rem);
  font-weight: 500;
  display: inline-block;
}

.status.pending {
  background: #f1c40f;
  color: #fff;
}

.status.active {
  background: #2ecc71;
  color: #fff;
}

.status.inactive {
  background: #95a5a6;
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
  transition: background 0.2s ease;
  min-height: 40px;
  min-width: 60px;
}

.edit-button {
  background: #2ecc71;
  color: white;
}

.edit-button:hover {
  background: #27ae60;
}

.delete-button {
  background: #e74c3c;
  color: white;
}

.delete-button:hover {
  background: #c0392b;
}

.no-data,
.loading {
  text-align: center;
  color: #7f8c8d;
  padding: clamp(12px, 3vw, 16px);
  font-size: clamp(0.75rem, 1.8vw, 0.8rem);
  font-style: italic;
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
  background: white;
  padding: clamp(8px, 2vw, 10px);
  border-radius: 8px;
  width: 100%;
  max-width: clamp(240px, 90vw, 280px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.modal h3 {
  font-size: clamp(0.9rem, 2vw, 1rem);
  font-weight: 600;
  color: #2c3e50;
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
  color: #34495e;
  margin-bottom: clamp(4px, 1vw, 6px);
}

input {
  width: 100%;
  padding: clamp(4px, 1vw, 6px) clamp(6px, 1.5vw, 8px);
  border: 1px solid #dcdcdc;
  border-radius: 6px;
  font-size: clamp(0.7rem, 1.5vw, 0.75rem);
  color: #2c3e50;
  box-sizing: border-box;
}

input:focus {
  border-color: #3498db;
  outline: none;
}

.info-text {
  font-size: clamp(0.65rem, 1.5vw, 0.7rem);
  color: #7f8c8d;
  margin-top: clamp(4px, 1vw, 6px);
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
  transition: background 0.2s ease;
  min-height: 40px;
  width: 100%;
}

.submit-button {
  background: #3498db;
  color: white;
}

.submit-button:hover:not(:disabled) {
  background: #2980b9;
}

.cancel-button {
  background: #95a5a6;
  color: white;
}

.cancel-button:hover:not(:disabled) {
  background: #7f8c8d;
}

.submit-button:disabled,
.cancel-button:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}

.error-message {
  color: #e74c3c;
  font-size: clamp(0.65rem, 1.5vw, 0.7rem);
  text-align: center;
  margin-top: clamp(4px, 1vw, 6px);
}

.success-message {
  color: #2ecc71;
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
  background: #2ecc71;
}

.toast.error {
  background: #e74c3c;
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
  background: white;
  padding: clamp(8px, 2vw, 10px);
  border-radius: 8px;
  width: 100%;
  max-width: clamp(240px, 90vw, 280px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.confirmation-dialog h3 {
  font-size: clamp(0.9rem, 2vw, 1rem);
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: clamp(6px, 1.5vw, 8px);
  text-align: center;
}

.confirmation-dialog p {
  color: #7f8c8d;
  font-size: clamp(0.7rem, 1.5vw, 0.75rem);
  margin-bottom: clamp(6px, 1.5vw, 8px);
  line-height: 1.4;
}

.dialog-buttons {
  display: flex;
  flex-direction: column;
  gap: clamp(6px, 1.5vw, 8px);
}

.confirm-button {
  padding: clamp(4px, 1vw, 6px) clamp(6px, 1.5vw, 8px);
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: clamp(0.7rem, 1.5vw, 0.75rem);
  font-weight: 500;
  transition: background 0.2s ease;
  min-height: 40px;
  width: 100%;
}

.confirm-button:hover {
  background: #c0392b;
}

.cancel-button:not(.form-buttons .cancel-button) {
  padding: clamp(4px, 1vw, 6px) clamp(6px, 1.5vw, 8px);
  background: #95a5a6;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: clamp(0.7rem, 1.5vw, 0.75rem);
  font-weight: 500;
  transition: background 0.2s ease;
  min-height: 40px;
  width: 100%;
}

.cancel-button:hover:not(.form-buttons .cancel-button) {
  background: #7f8c8d;
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
  .invite-user {
    padding: clamp(8px, 2vw, 10px) clamp(12px, 3vw, 16px);
    font-size: clamp(0.8rem, 2vw, 0.85rem);
  }

  .icon {
    font-size: clamp(1rem, 2.5vw, 1.1rem);
  }

  table {
    min-width: 500px;
  }

  th,
  td {
    padding: clamp(6px, 1.5vw, 8px) clamp(8px, 2vw, 10px);
    font-size: clamp(0.75rem, 1.8vw, 0.8rem);
  }

  td.email {
    max-width: 150px;
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
    font-size: clamp(1.75rem, 4vw, 2rem);
  }

  .header-buttons {
    flex-direction: row;
    width: auto;
    gap: clamp(12px, 2.5vw, 16px);
  }

  .stats-button,
  .invite-user {
    padding: clamp(10px, 2vw, 12px) clamp(16px, 3.5vw, 20px);
    font-size: clamp(0.85rem, 2vw, 0.9rem);
    min-width: 120px;
    width: auto;
  }

  .icon {
    font-size: clamp(1.1rem, 2.5vw, 1.25rem);
  }

  table {
    min-width: 0;
  }

  th,
  td {
    padding: clamp(12px, 2.5vw, 16px) clamp(16px, 3.5vw, 20px);
    font-size: clamp(0.85rem, 2vw, 0.9rem);
  }

  td.email {
    max-width: 200px;
  }

  .status {
    padding: clamp(4px, 1vw, 6px) clamp(8px, 2vw, 10px);
    font-size: clamp(0.75rem, 1.8vw, 0.8rem);
  }

  .edit-button,
  .delete-button {
    padding: clamp(8px, 2vw, 10px) clamp(12px, 3vw, 16px);
    font-size: clamp(0.8rem, 2vw, 0.85rem);
    min-width: 80px;
  }

  .no-data,
  .loading {
    padding: clamp(24px, 4vw, 30px);
    font-size: clamp(0.9rem, 2vw, 0.95rem);
  }

  .modal {
    padding: clamp(20px, 3.5vw, 24px);
    max-width: clamp(400px, 50vw, 500px);
  }

  .modal h3 {
    font-size: clamp(1.25rem, 3vw, 1.5rem);
    margin-bottom: clamp(12px, 3vw, 16px);
  }

  .form-group {
    margin-bottom: clamp(12px, 3vw, 16px);
  }

  label {
    font-size: clamp(0.85rem, 2vw, 0.9rem);
    margin-bottom: clamp(8px, 2vw, 10px);
  }

  input {
    padding: clamp(10px, 2.5vw, 12px) clamp(12px, 3vw, 16px);
    font-size: clamp(0.85rem, 2vw, 0.9rem);
  }

  .info-text {
    font-size: clamp(0.8rem, 2vw, 0.85rem);
  }

  .form-buttons {
    gap: clamp(12px, 3vw, 16px);
    margin-top: clamp(12px, 3vw, 16px);
  }

  .submit-button,
  .cancel-button {
    padding: clamp(10px, 2.5vw, 12px) clamp(16px, 3.5vw, 20px);
    font-size: clamp(0.85rem, 2vw, 0.9rem);
    min-width: 120px;
  }

  .error-message,
  .success-message {
    font-size: clamp(0.8rem, 2vw, 0.85rem);
    margin-top: clamp(10px, 2.5vw, 12px);
  }

  .confirmation-dialog {
    padding: clamp(20px, 3.5vw, 24px);
    max-width: clamp(400px, 50vw, 450px);
  }

  .confirmation-dialog h3 {
    font-size: clamp(1.25rem, 3vw, 1.5rem);
    margin-bottom: clamp(10px, 2.5vw, 12px);
  }

  .confirmation-dialog p {
    font-size: clamp(0.85rem, 2vw, 0.9rem);
    margin-bottom: clamp(12px, 3vw, 16px);
  }

  .dialog-buttons {
    gap: clamp(12px, 3vw, 16px);
  }

  .confirm-button,
  .cancel-button:not(.form-buttons .cancel-button) {
    padding: clamp(10px, 2.5vw, 12px) clamp(16px, 3.5vw, 20px);
    font-size: clamp(0.85rem, 2vw, 0.9rem);
    min-width: 120px;
  }

  .toast {
    bottom: auto;
    top: clamp(16px, 3vw, 20px);
    right: clamp(16px, 3vw, 20px);
    left: auto;
    width: clamp(240px, 50vw, 300px);
    padding: clamp(12px, 3vw, 16px) clamp(16px, 3.5vw, 20px);
    font-size: clamp(0.85rem, 2vw, 0.9rem);
  }

  .close-toast {
    font-size: clamp(1.25rem, 3vw, 1.5rem);
    min-width: 44px;
    min-height: 44px;
  }
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  .toast,
  .modal,
  .confirmation-dialog,
  .submit-button,
  .cancel-button,
  .edit-button,
  .delete-button,
  .confirm-button,
  .stats-button,
  .invite-user {
    transition: none;
  }
}
</style>