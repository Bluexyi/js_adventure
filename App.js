window.onload = function () {
  const canvas = document.getElementById("canvas");
  const context = canvas.getContext("2d");
  canvas.width = 512;
  canvas.height = 512;

  let keyboard = new Keyboard();
  let loader = new Loader();
  let state = new State();
  let hero = new Hero(map, 160, 160, 256, 'hero', state);
  let camera = new Camera(map, canvas.width , canvas.height);
  let game = new Game(keyboard, camera, loader, hero, context);

  game.run();
};
