<template>
    <div>
      <nav class="navbar">
        <ul>
          <li><a href="#">Dashboard</a></li>
          <li><a href="#">Users</a></li>
          <li><a href="#">Settings</a></li>
          <li><a href="#">Logout</a></li>
        </ul>
      </nav>
      <div class="dashboard">
        <h1>Admin Dashboard is here</h1>
      </div>
    </div>
</template>

<script>
export default {
  name: 'DashboardPage'
};
</script>

<style scoped>
.navbar {
  background-color: #333;
  padding: 15px;
  display: flex;
  justify-content: center;
}

.navbar ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  gap: 20px;
}

.navbar ul li {
  display: inline;
}

.navbar ul li a {
  color: white;
  text-decoration: none;
  font-size: 16px;
  padding: 10px 15px;
  border-radius: 5px;
  transition: background 0.3s;
}

.navbar ul li a:hover {
  background-color: #575757;
}

.dashboard {
  padding: 30px;
  background-color: #f4f7fc;
  font-family: 'Arial', sans-serif;
  text-align: center;
}

h1 {
  color: #333;
  font-size: 24px;
}
</style>
