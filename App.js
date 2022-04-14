window.onload = function () {
  const canvas = document.getElementById("canvas");
  const context = canvas.getContext("2d");
  canvas.width = 512;
  canvas.height = 512;

  let camera = new Camera(map, canvas.width, canvas.height);
  let loader = new Loader();
  let game = new Game(camera, loader, context);

  game.run();
};
