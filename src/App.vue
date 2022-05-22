<template>
<nav>
  <router-link to="/">Accueil</router-link> | 
  <router-link :to="{name: 'game', params: {name: 'hero'}}">Le jeu</router-link>
</nav>
<router-view /> <!--Permet de charger et d'affiche la vue du router -->
</template>

<script>

export default {
  name: 'App',
  components: {
  }
}
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
