window.onload = function () {
  const canvas = document.getElementById("canvas");
  const context = canvas.getContext("2d");
  canvas.width = 512;
  canvas.height = 512;

  let keyboard = new Keyboard();
  let loader = new Loader();
  let state = new State();
  let pnj1 = new PNJ(map, 200, 200, 256, 'hero', state, ["U","U","L","B","B","D"]);
  let hero = new Hero(map, 160, 160, 256, 'hero', state);
  let camera = new Camera(map, canvas.width , canvas.height);
  let game = new Game(keyboard, camera, loader,pnj1, hero, context);

  game.run();
};


/* TODO LIST :
TRANSPARENT CONTOUR TILE BOTTOM TREE
ADD PNJ
LE PNJ ne doit pas traverser un joueur
INTERACTION WITH PNJ
DARW BOX DIALOGUE PNJ
ENTER IN HOUSE
ANIMATE TILE
Changement TILEMAP en fonction de l'heure de la journée
AFFICHER ET CALCULER QUE LES PNJ PRESENT SUR LECRAN
*/