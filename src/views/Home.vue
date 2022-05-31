<template>
<div class="form">
  <p>Connecte toi</p>
  <div class="form-row">
    <input
      v-model="name"
      class="form-row__input"
      type="text"
      placeholder="Ton pseudo"
    />
  </div>

  <div class="radio">
    <input  label="Homme" type="radio" id="man" value="M" v-model="sexe" checked />
    <input  label="Femme" type="radio" id="woman" value="W" v-model="sexe"/>
  </div>

  <div class="begin_btn_c">
    <button @click="login()" :disabled="isDisable(name)" class="begin_btn">Commencer</button>
  </div>
</div>
</template>

<script>
export default {
  data: function () {
    return {
      name: "",
      sexe: "M",
    };
  },
  methods: {
    login: function () {
      console.log("select :", this.sexe);
      this.$router.push('/game/' + this.name + "/" + this.sexe);
    },
    isDisable(name) {
      return name.length < 2;
    }
  },
};
</script>

<style>
body{
  background: url('../assets/images/wallpaper-pokemon.png');
  background-size: cover;
  background-repeat: no-repeat;
  height: 100vh;
}

.form{
  margin: 30px;
  padding: 30px;
  width: min-content;
  background-color:rgba(0, 0, 0, 0.3);
  border: 2px solid white;
  border-radius: 3px;
}

.form p{
  margin-bottom: 30px;
  color: white;
}

.form-row__input{
  appearance: none;
	outline: none;
	cursor: pointer;

  padding: 5px;
  margin: 10px;

  background: transparent;
  color: white;
  border: 2px solid white;
  border-radius: 3px;
  font-family: 'retroGame';
}

.form-row__input:focus{
  -webkit-box-shadow: 3px 3px 0px 1px #CDCDCD; 
  box-shadow: 3px 3px 0px 1px #CDCDCD;
  transition: all 100ms linear;
}

.radio input{
  appearance: none;
	outline: none;
	cursor: pointer;

  margin: 10px;
	padding: 6px 10px;
	background: transparent;
	color: #bdbdbdbd;
  border: 2px solid #bdbdbdbd;
  border-radius: 3px;

  font-family: 'retroGame';

  transition: all 100ms linear;
}


.radio #woman:checked {
	background-image: linear-gradient(180deg, rgb(255, 0, 238), rgb(255, 117, 246));
	color: #fff;
  border: 2px solid white;
  border-radius: 3px;
}

.radio #man:checked {
	background-image: linear-gradient(180deg, rgb(0, 106, 255), rgb(91, 157, 250));
	color: #fff;
  border: 2px solid white;
  border-radius: 3px;
}


.radio input:before {
	content: attr(label);
	display: inline-block;
	text-align: center;
	width: 100%;
}

.begin_btn{
appearance: none;
	outline: none;
	cursor: pointer;

    padding: 5px;
  margin: 10px;

  background: transparent;
  color: white;
  border: 2px solid white;
  border-radius: 3px;
  font-family: 'retroGame';
}

.begin_btn:hover{
  background-color: white;
  color: #3a3a3a;
  
  transition: all 100ms linear;
}


</style>

