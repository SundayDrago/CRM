<template>
    <div class="users-page">
      <h1>Users Management</h1>
      <div class="actions">
        <button class="add-user" @click="showAddUserModal">Add User</button>
      </div>
      
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id">
            <td>{{ user.id }}</td>
            <td>{{ user.name }}</td>
            <td>{{ user.email }}</td>
            <td>
              <button class="edit-button" @click="editUser(user)">Edit</button>
              <button class="delete-button" @click="deleteUser(user.id)">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
  
      <div v-if="showAddUserForm || showEditUserForm" class="form-container">
        <h3>{{ isEditing ? 'Edit User' : 'Add User' }}</h3>
        <form @submit.prevent="isEditing ? updateUser() : createUser()">
          <div class="form-group">
            <label>Name:</label>
            <input v-model="form.name" required />
          </div>
          <div class="form-group">
            <label>Email:</label>
            <input type="email" v-model="form.email" required />
          </div>
          <div class="form-buttons">
            <button type="submit" class="submit-button">{{ isEditing ? 'Update' : 'Create' }}</button>
            <button type="button" class="cancel-button" @click="cancel">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'UsersPage',
    data() {
      return {
        users: [],
        showAddUserForm: false,
        showEditUserForm: false,
        isEditing: false,
        form: {
          id: null,
          name: '',
          email: '',
        },
      };
    },
    methods: {
      fetchUsers() {
        this.users = [
          { id: 1, name: 'John Doe', email: 'john@example.com' },
          { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
        ]; // Sample data
      },
      showAddUserModal() {
        this.isEditing = false;
        this.form = { id: null, name: '', email: '' }; // Reset form for new user
        this.showAddUserForm = true; // Show add user form
        this.showEditUserForm = false; // Hide edit user form
      },
      createUser() {
        const newUser = { id: this.users.length + 1, ...this.form };
        this.users.push(newUser);
        this.showAddUserForm = false; // Hide add user form after creating
      },
      editUser(user) {
        this.isEditing = true;
        this.form = { ...user };
        this.showEditUserForm = true; // Show edit user form
        this.showAddUserForm = false; // Hide add user form
      },
      updateUser() {
        const index = this.users.findIndex(u => u.id === this.form.id);
        this.users[index] = { ...this.form };
        this.showEditUserForm = false; // Hide edit user form after updating
      },
      deleteUser(userId) {
        this.users = this.users.filter(user => user.id !== userId);
      },
      cancel() {
        this.showAddUserForm = false;
        this.showEditUserForm = false;
      },
    },
    mounted() {
      this.fetchUsers();
    },
  };
  </script>
  
  <style scoped>
  .users-page {
    padding: 20px;
    background-color: #f4f4f9;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }
  
  h2 {
    color: #333;
  }
  
  .actions {
    margin-bottom: 20px;
  }
  
  .add-user {
    background-color: #007bff;
    color: white;
    border: none;
    padding: 10px 15px;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s;
  }
  
  .add-user:hover {
    background-color: #0056b3; /* Darker shade on hover */
  }
  
  table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 20px;
  }
  
  th, td {
    padding: 10px;
    border: 1px solid #ccc;
    text-align: left;
  }
  
  th {
    background-color: #007bff;
    color: white;
  }
  
  td {
    background-color: white;
  }
  
  .edit-button,
  .delete-button {
    background-color: #28a745; /* Edit button color */
    color: white;
    border: none;
    padding: 5px 10px;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s;
  }
  
  .edit-button:hover {
    background-color: #218838; /* Darker shade on hover */
  }
  
  .delete-button {
    background-color: #dc3545; /* Delete button color */
    margin-left: 5px;
  }
  
  .delete-button:hover {
    background-color: #c82333; /* Darker shade on hover */
  }
  
  .form-container {
    margin-top: 20px;
    padding: 20px;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 400px; /* Set a maximum width for uniformity */
  }
  
  .form-group {
    margin-bottom: 15px;
  }
  
  label {
    display: block;
    margin-bottom: 5px;
    color: #333;
  }
  
  input {
    width: 100%;
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-sizing: border-box;
  }
  
  .form-buttons {
    display: flex;
    justify-content: space-between;
  }
  
  .submit-button {
    background-color: #007bff;
    color: white;
    border: none;
    padding: 10px 15px;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s;
  }
  
  .submit-button:hover {
    background-color: #0056b3; /* Darker shade on hover */
  }
  
  .cancel-button {
    background-color: #6c757d; /* Cancel button color */
    color: white;
    border: none;
    padding: 10px 15px;
    border-radius: 5px;
  }
  
  .cancel-button:hover {
    background-color: #5a6268; /* Darker shade on hover */
  }
  </style>
  