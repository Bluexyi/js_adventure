<template>
  <h1>Le monde de {{ name }} !</h1>
  <canvas id="canvas"></canvas>
</template>

<script>
export default {
  name: "Game",
  props: ['name'],
  methods: {},
  components: {},
  mounted() {
 //   const jsFiles = [["Loader"],["State"],["PNJ"],["LoadPNJ"],["Map"],["LoadMap"],["Hero"],["Camera"],["Keyboard"],"App"];

 //   for (const jsFile of jsFiles) {
      let plugin = document.createElement("script");
      let script = require("../assets/js/All.js");
     // console.log("Load : ../assets/js/" + jsFile + ".js");
      plugin.setAttribute("href", 'type="text/javascript', script);
      plugin.async = true;
      document.head.appendChild(plugin);
  //  }
  },
};
</script>

<style>
canvas {
  background: black;
  display: block;
  margin: 0 auto;
  border: solid 6px #aaa;
  border-radius: 10px;
}
</style>
