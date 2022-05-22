window.onload = function () {
  const canvas = document.getElementById("canvas");
  const context = canvas.getContext("2d");
  canvas.width = 512;
  canvas.height = 512;

  let keyboard = new Keyboard();
  let loader = new Loader();
  let map = maps[1];

  for(var pnj of pnjs){
    pnj.setWidth(map.getTsize());
    pnj.setHeight(map.getTsize());
    maps[pnj.getMapId()].addPnj(pnj);
  }

  let hero = new Hero(map, 160, 160, "Romano", "H", map.getTsize(), 256, 'man', state);
  let camera = new Camera(map, canvas.width , canvas.height);
  let game = new Game(keyboard, map, camera, loader, hero, context);

  game.run();
};


/* TODO LIST :
EFFET DE TRANSITION QUAND REDIRECTION
TRANSPARENT CONTOUR TILE BOTTOM TREE
[OK] ADD PNJ
[OK] PNJ PER MAP
[OK] LE PNJ ne doit pas traverser un joueur
[OK] GET TEXT PNJ
EXPORT BOX DIALOGUE
PNJ TOURNE QUAND GET TEXT
[OK] DARW BOX DIALOGUE PNJ
[OK] ENTER IN HOUSE
ANIMATE TILE
Changement TILEMAP en fonction de l'heure de la journée
[OK] AFFICHER ET CALCULER QUE LES PNJ PRESENT SUR LECRAN
*/