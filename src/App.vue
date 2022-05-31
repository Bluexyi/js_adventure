<template>
<h1>JS Adventure</h1>
<!--
<nav>
  <router-link to="/">Accueil</router-link> | 
  <router-link :to="{name: 'game', params: {name: 'hero', sexe: 'f'}}">Le jeu</router-link>
</nav> -->
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

@font-face {
  font-family: "rainyHearts";
  src: local("rainyHearts"),   url(./assets/fonts/rainyHearts.ttf) format("truetype");
}

@font-face {
  font-family: "retroGame";
  src: local("retroGame"),   url(./assets/fonts/retroGame.ttf) format("truetype");
}

*{
  margin: 0;
  padding: 0;
}

h1{
  margin-top: 20px;
  margin-bottom: 20px;
}

#app {
  font-family: 'retroGame';
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;

  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
}
</style>
