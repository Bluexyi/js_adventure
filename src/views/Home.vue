<template>
  <h1>Accueil</h1>

  <div class="form-row">
    <input
      v-model="name"
      class="form-row__input"
      type="text"
      placeholder="Ton pseudo"
    />
  </div>

  <div class="form-row">
    <input type="radio" id="moman" value="W" v-model="sexe" />
    <label for="woman">Femme</label>
    <br />
    <input type="radio" id="man" value="M" v-model="sexe" />
    <label for="man">Homme</label>
    <br />
  </div>

  <div class="form-row">
    <button @click="login()" class="button">Commencer</button>
  </div>
</template>

<script>
export default {
  data: function () {
    return {
      name: "",
      sexe: "",
    };
  },
  methods: {
    login: function () {
      console.log("select :", this.sexe);
      this.$router.push('/game/' + this.name + "/" + this.sexe);
    },
  },
};
</script>

