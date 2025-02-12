<template>
  <div>
    <router-view></router-view> <!-- This will render the current route component -->
  </div>
</template>

<script>
// You no longer need to include HomePage globally here if it's handled by routes
export default {
  name: 'App',
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
