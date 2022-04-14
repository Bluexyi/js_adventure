window.onload = function () {
  const canvas = document.getElementById("canvas");
  const context = canvas.getContext("2d");
  canvas.width = 512;
  canvas.height = 512;

  let loader = new Loader();
  let hero = new Hero(map, 160, 160, 256, 'hero');
  let camera = new Camera(map, canvas.width, canvas.height);
  let game = new Game(camera, loader, hero, context);

  game.run();
};
