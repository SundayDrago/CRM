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
            <td>{{ user.id }}</td>
            <td>{{ user.username }}</td>
            <td>{{ user.email }}</td>
            <td>
              <span :class="['status', user.status.toLowerCase()]">{{ user.status }}</span>
            </td>
            <td class="actions">
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
/* Previous styles remain the same, add these new styles at the end */

/* Toast Notification */
.toast {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 15px 25px;
  border-radius: 8px;
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-width: 250px;
  max-width: 350px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1001;
  animation: slideInRight 0.3s ease;
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
  font-size: 20px;
  cursor: pointer;
  margin-left: 15px;
  padding: 0 5px;
}

.close-toast:hover {
  opacity: 0.8;
}

/* Confirmation Dialog */
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
  padding: 30px;
  border-radius: 12px;
  width: 100%;
  max-width: 450px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
}

.confirmation-dialog h3 {
  font-size: 20px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 15px;
}

.confirmation-dialog p {
  color: #7f8c8d;
  margin-bottom: 25px;
  line-height: 1.5;
}

.dialog-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
}

.confirm-button {
  padding: 10px 20px;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.3s ease;
}

.confirm-button:hover {
  background: #c0392b;
}

/* Animations */
@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .toast {
    top: 10px;
    right: 10px;
    left: 10px;
    max-width: calc(100% - 20px);
  }

  .confirmation-dialog {
    width: 90%;
    padding: 20px;
  }
}

.users-page {
  padding: 40px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
  font-family: 'Inter', sans-serif;
  max-width: 1400px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
}

h1 {
  font-size: 32px;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
}

.header-buttons {
  display: flex;
  gap: 15px;
}

.invite-user {
  background: #4361ee;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.invite-user:hover {
  background: #3b54d9;
  transform: translateY(-2px);
}

.icon {
  font-size: 20px;
}

.table-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  padding: 16px 20px;
  text-align: left;
}

th {
  background: #34495e;
  color: white;
  font-weight: 600;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

td {
  font-size: 15px;
  color: #2c3e50;
  border-bottom: 1px solid #ecf0f1;
}

.status {
  padding: 6px 12px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 500;
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
  gap: 12px;
}

.edit-button,
.delete-button {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
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
  padding: 30px;
  font-size: 16px;
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
  animation: fadeIn 0.3s ease;
}

.modal {
  background: white;
  padding: 30px;
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  animation: slideIn 0.3s ease;
}

.modal h3 {
  font-size: 24px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 25px;
  text-align: center;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #34495e;
  margin-bottom: 8px;
}

input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #dcdcdc;
  border-radius: 8px;
  font-size: 15px;
  color: #2c3e50;
  box-sizing: border-box;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

input:focus {
  border-color: #3498db;
  box-shadow: 0 0 8px rgba(52, 152, 219, 0.2);
  outline: none;
}

.info-text {
  font-size: 13px;
  color: #7f8c8d;
  margin-top: 5px;
}

.form-buttons {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 25px;
}

.submit-button,
.cancel-button {
  padding: 12px 30px;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.submit-button {
  background: #3498db;
  color: white;
}

.submit-button:hover:not(:disabled) {
  background: #2980b9;
  transform: translateY(-2px);
}

.cancel-button {
  background: #95a5a6;
  color: white;
}

.cancel-button:hover:not(:disabled) {
  background: #7f8c8d;
  transform: translateY(-2px);
}

.submit-button:disabled,
.cancel-button:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}

.error-message {
  color: #e74c3c;
  font-size: 14px;
  text-align: center;
  margin-top: 15px;
}

.success-message {
  color: #2ecc71;
  font-size: 14px;
  text-align: center;
  margin-top: 15px;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideIn {
  from { transform: translateY(-20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@media (max-width: 768px) {
  .users-page {
    padding: 20px;
  }
  .header {
    flex-direction: column;
    gap: 20px;
    text-align: center;
  }
  .header-buttons {
    flex-direction: column;
    width: 100%;
  }
  .invite-user {
    width: 100%;
    justify-content: center;
  }
  .modal {
    width: 90%;
    padding: 20px;
  }
}
</style>