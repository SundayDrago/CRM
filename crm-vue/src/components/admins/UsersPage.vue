<template>
  <div class="users-page">
    <div class="header">
      <h1>Users Management</h1>
      <button class="add-user" @click="showAddUserModal">
        <span class="icon">+</span> Add User
      </button>
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
          <tr v-for="user in users" :key="user.id">
            <td>{{ user.id }}</td>
            <td>{{ user.username }}</td>
            <td>{{ user.email }}</td>
            <td>
              <span :class="['status', user.status.toLowerCase()]">{{ user.status }}</span>
            </td>
            <td class="actions">
              <button class="edit-button" @click="editUser(user)">Edit</button>
              <button class="delete-button" @click="confirmDelete(user.id)">Delete</button>
            </td>
          </tr>
          <tr v-if="!users.length && !isLoading">
            <td colspan="5" class="no-data">No users found.</td>
          </tr>
          <tr v-if="isLoading">
            <td colspan="5" class="loading">Loading users...</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal for Add/Edit User -->
    <div v-if="showAddUserForm || showEditUserForm" class="modal-overlay">
      <div class="modal">
        <h3>{{ isEditing ? 'Edit User' : 'Add User' }}</h3>
        <form @submit.prevent="isEditing ? updateUser() : createUser()">
          <div class="form-group">
            <label for="username">Username</label>
            <input id="username" v-model="form.username" placeholder="Enter username" required />
          </div>
          <div class="form-group">
            <label for="email">Email</label>
            <input id="email" type="email" v-model="form.email" placeholder="Enter email" required />
          </div>
          <div v-if="!isEditing" class="form-group">
            <p class="info-text">An invitation email with a temporary password and setup link will be sent to the user.</p>
          </div>
          <div class="form-buttons">
            <button type="submit" class="submit-button" :disabled="isSubmitting">
              {{ isEditing ? 'Update' : 'Send Invitation' }}
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
  data() {
    return {
      users: [],
      showAddUserForm: false,
      showEditUserForm: false,
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
    };
  },
  methods: {
    async fetchUsers() {
      this.isLoading = true;
      try {
        const response = await axios.get('http://localhost:3000/api/users');
        this.users = response.data.map(user => ({
          id: user.id,
          username: user.username,
          email: user.email,
          status: user.status.charAt(0).toUpperCase() + user.status.slice(1), // Capitalize status
        }));
      } catch (error) {
        console.error('Error fetching users:', error);
        this.errorMessage = 'Failed to load users. Please try again later.';
      } finally {
        this.isLoading = false;
      }
    },
    showAddUserModal() {
      this.isEditing = false;
      this.form = { id: null, username: '', email: '' };
      this.showAddUserForm = true;
      this.showEditUserForm = false;
      this.errorMessage = '';
      this.successMessage = '';
    },
    async createUser() {
      this.isSubmitting = true;
      this.errorMessage = '';
      this.successMessage = '';
      try {
        const response = await axios.post('http://localhost:3000/api/users/create', {
          username: this.form.username,
          email: this.form.email,
          created_by: 1, // Replace with actual admin ID from your auth system (e.g., from Vuex or localStorage)
        });

        this.users.push({
          id: response.data.userId,
          username: this.form.username,
          email: this.form.email,
          status: 'Pending',
        });

        this.successMessage = 'Invitation sent successfully!';
        setTimeout(() => {
          this.showAddUserForm = false;
          this.isSubmitting = false;
        }, 1500);
      } catch (error) {
        this.errorMessage = error.response?.data?.error || 'Failed to send invitation. Please try again.';
        console.error('Error creating user:', error);
        this.isSubmitting = false;
      }
    },
    editUser(user) {
      this.isEditing = true;
      this.form = { ...user };
      this.showEditUserForm = true;
      this.showAddUserForm = false;
      this.errorMessage = '';
      this.successMessage = '';
    },
    async updateUser() {
      this.isSubmitting = true;
      this.errorMessage = '';
      this.successMessage = '';
      try {
        await axios.put(`http://localhost:3000/api/users/${this.form.id}`, {
          username: this.form.username,
          email: this.form.email,
        });
        const index = this.users.findIndex(u => u.id === this.form.id);
        this.users[index] = { ...this.form };
        this.successMessage = 'User updated successfully!';
        setTimeout(() => {
          this.showEditUserForm = false;
          this.isSubmitting = false;
        }, 1500);
      } catch (error) {
        this.errorMessage = error.response?.data?.error || 'Failed to update user. Please try again.';
        console.error('Error updating user:', error);
        this.isSubmitting = false;
      }
    },
    confirmDelete(userId) {
      if (confirm('Are you sure you want to delete this user?')) {
        this.deleteUser(userId);
      }
    },
    async deleteUser(userId) {
      try {
        await axios.delete(`http://localhost:3000/api/users/${userId}`);
        this.users = this.users.filter(user => user.id !== userId);
      } catch (error) {
        console.error('Error deleting user:', error);
        this.errorMessage = 'Failed to delete user. Please try again.';
      }
    },
    cancel() {
      this.showAddUserForm = false;
      this.showEditUserForm = false;
      this.isSubmitting = false;
      this.errorMessage = '';
      this.successMessage = '';
    },
  },
  mounted() {
    this.fetchUsers();
  },
};
</script>

<style scoped>
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

.add-user {
  background: #3498db;
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

.add-user:hover {
  background: #2980b9;
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
  .modal {
    width: 90%;
    padding: 20px;
  }
}
</style>