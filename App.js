window.onload = function () {
  const canvas = document.getElementById("canvas");
  const context = canvas.getContext("2d");
  canvas.width = 512;
  canvas.height = 512;

  let keyboard = new Keyboard();
  let map = maps[1];
 // console.log("ttttt ", map_1.getRedirection(2)[0])
  let loader = new Loader();
  let state = new State();
  let pnj1 = new PNJ(1, 1, map, 200, 200, 256, 'hero', state, ["U","U","L","B","B","D"]);
  let pnj2 = new PNJ(2, 1, map, 400, 250, 256, 'hero', state, ["U","U","L","B","B","D"]);
  let pnj3 = new PNJ(3, 2, map, 544, 74, 256, 'hero', state, ["U","U","L","B","B","D"]);
  let pnjs = [pnj1, pnj2, pnj3]
  let hero = new Hero(map, 160, 160, 256, 'hero', state);
  let camera = new Camera(map, canvas.width , canvas.height);
  let game = new Game(keyboard, map, camera, loader, pnjs, hero, context);

  game.run();
};


/* TODO LIST :
EFFET DE TRANSITION QUAND REDIRECTION
TRANSPARENT CONTOUR TILE BOTTOM TREE
[OK] ADD PNJ
[OK] PNJ PER MAP
LE PNJ ne doit pas traverser un joueur
INTERACTION WITH PNJ
DARW BOX DIALOGUE PNJ
[OK] ENTER IN HOUSE
ANIMATE TILE
Changement TILEMAP en fonction de l'heure de la journée
[OK] AFFICHER ET CALCULER QUE LES PNJ PRESENT SUR LECRAN
*/