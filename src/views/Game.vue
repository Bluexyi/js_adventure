<template>
  <h1>A toi de jouer {{ name }} !</h1>
  <canvas id="canvas"></canvas>
</template>

<script>
import { io } from "socket.io-client";
export default {
  name: "Game",
  props: ["name", "sexe"],
  methods: {},
  components: {},
  mounted() {
    var socket = io.connect("http://localhost:3003");

    let heros = [];

    //Écoutez l'événement players list et mettez à jour la liste des joueurs à chaque fois qu'il survient.
    socket.on("hero list", function (list) {
      heros = list;
    });

    let heroName = this.name;
    let heroSexe = this.sexe;
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

    //#############################################
    //LOADER
    //#############################################
    class Loader {
      images = {};

      constructor() {}

      loadImage(key, src, nbSpriteRow, nbSpriteCol) {
        let img = new Image();

        let d = new Promise(
          function (resolve, reject) {
            img.onload = function () {
              this.images[key] = img;
              this.images[key].nbSpriteRow = nbSpriteRow;
              this.images[key].nbSpriteCol = nbSpriteCol;
              resolve(img);
            }.bind(this);

            img.onerror = function () {
              reject("Could not load image: " + src);
            };
          }.bind(this)
        );

        img.src = src;

        return d;
      }

      getImage(key) {
        return key in this.images ? this.images[key] : null;
      }
    }

    //#############################################
    //STATE
    //#############################################
    class State {
      states = {};

      generateState(name, startRowIndex, endRowIndex, colIndex) {
        if (!this.states[name]) {
          this.states[name] = {
            frameIndex: startRowIndex,
            startRowIndex: startRowIndex,
            endRowIndex: endRowIndex,
            colIndex: colIndex,
          };
        }
      }

      getByName(name) {
        if (this.states[name]) {
          return this.states[name];
        }
      }
    }

    //#############################################
    //PNJ
    //#############################################
    class PNJ {
      constructor(
        id,
        name,
        text,
        mapId,
        size,
        x,
        y,
        speed,
        spriteName,
        state,
        movementPattern
      ) {
        this.id = id;
        this.name = name;
        this.text = text;
        this.mapId = mapId;
        this.x = x;
        this.y = y;
        this.speed = speed;
        this.width = size;
        this.height = size;
        this.image = null;
        this.spriteName = spriteName;
        this.state = state;
        this.movementPattern = movementPattern;
        this.count = 0;
        this.direction = "down";
        this.lastDirection = "down";
        this.spriteSpeed = 5; //Plus petit = plus rapide
        this.scale = 1; //Sprite grossissement
      }

      getId() {
        return this.id;
      }

      getName() {
        return this.name;
      }

      getText() {
        return this.text;
      }

      getMapId() {
        return this.mapId;
      }

      getX() {
        return this.x;
      }

      getY() {
        return this.y;
      }

      getSpeed() {
        return this.speed;
      }

      getWidth() {
        return this.width;
      }

      getImage() {
        return this.image;
      }

      getHeight() {
        return this.height;
      }

      getSpriteName() {
        return this.spriteName;
      }

      getMovementPattern() {
        return this.movementPattern;
      }

      getCount() {
        return this.count;
      }

      getDirection() {
        return this.direction;
      }

      getLastDirection() {
        return this.lastDirection;
      }

      getSpriteSpeed() {
        return this.spriteSpeed;
      }

      getScale() {
        return this.scale;
      }

      setImage(image) {
        this.image = image;
      }

      setWidth(width) {
        this.width = width;
      }

      setHeight(height) {
        this.height = height;
      }

      initStates() {
        this.state.generateState("up", 0, 3, 0);
        this.state.generateState("down", 0, 3, 1);
        this.state.generateState("left", 0, 3, 2);
        this.state.generateState("right", 0, 3, 3);
      }

      isVisible(cameraX, cameraY) {
        return !(
          this.x + this.width / 2 - cameraX < 0 ||
          this.y + this.height / 2 - cameraY < 0
        );
      }
    }

    //#############################################
    //LOAD PNJ
    //#############################################
    let state = new State();

    let pnj1 = new PNJ(
      1,
      "Jordan",
      "Salut frero, je suis ton demi-frere. \nNous nous sommes rencontré quand j'avais 12ans et toi \ntu en avais 10.",
      1,
      64,
      250,
      250,
      256,
      "neutre",
      state,
      ["U", "U", "L", "B", "B", "D"]
    );

    let pnj2 = new PNJ(
      2,
      "Maxime",
      "I collect old video games consoles and I'm \ntoo stupid to have the power cables to play them.. \nBut I speak English",
      1,
      64,
      320,
      320,
      256,
      "neutre",
      state,
      ["U", "U", "L", "B", "B", "D"]
    );

    let pnj3 = new PNJ(
      3,
      "Régina",
      "Je t'aime <3",
      2,
      64,
      544,
      74,
      256,
      "woman",
      state,
      ["U", "U", "L", "B", "B", "D"]
    );

    let pnjs = [pnj1, pnj2, pnj3];

    //#############################################
    //MAP
    //#############################################
    class Map {
      constructor(id, name, cols, rows, tsize, redirections, layers) {
        (this.id = id),
          (this.name = name),
          (this.cols = cols),
          (this.rows = rows),
          (this.tsize = tsize),
          (this.redirections = redirections),
          (this.layers = layers),
          (this.pnjs = []);
      }

      getId() {
        return this.id;
      }

      getName() {
        return this.name;
      }

      getCols() {
        return this.cols;
      }

      getRows() {
        return this.rows;
      }

      getTsize() {
        return this.tsize;
      }

      getRedirections() {
        return this.redirections;
      }

      getLayers() {
        return this.layers;
      }

      getPnjs() {
        return this.pnjs;
      }

      getRedirection(idRedirection) {
        return this.redirections[idRedirection];
      }

      addPnj(pnj) {
        this.pnjs.push(pnj);
      }

      getTile(layer, col, row) {
        return this.layers[layer][row * this.cols + col];
      }

      isSolidTileAtXY(x, y) {
        var col = Math.floor(x / this.tsize);
        var row = Math.floor(y / this.tsize);

        // Boucle à travers toutes le layer de collision et retourne VRAI si 1 est trouvé.
        return this.layers.reduce(
          function (res) {
            var tile = this.getTile(3, col, row);
            var isSolid = tile === 1;
            return res || isSolid;
          }.bind(this),
          false
        );
      }

      pnjCollision(x, y) {
        for (var pnj of this.pnjs) {
          if (
            x > pnj.getX() &&
            x < pnj.getX() + pnj.getWidth() &&
            y > pnj.getY() &&
            y < pnj.getY() + pnj.getHeight()
          ) {
            return pnj.getId();
          }
        }
        return 0;
      }

      getCol(x) {
        return Math.floor(x / this.tsize);
      }

      getRow(y) {
        return Math.floor(y / this.tsize);
      }

      getX(col) {
        return col * this.tsize;
      }

      getY(row) {
        return row * this.tsize;
      }
    }

    //#############################################
    //LOAD MAP
    //#############################################
    let maps = {};

    // 1 = herbe
    // 2 = terre
    // 3 = arbre bas
    // 4 = arbre haut
    // 5 = arbuste

    let map_1 = new Map(1, "bourgpalette", 12, 15, 64, { 2: [160, 64] }, [
      [
        //Texture sol
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
        1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1,
        1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1,
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 1, 1, 1,
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
        2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1,
        1, 1, 1, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 1, 1, 1, 1, 1, 1, 1,
        1, 1, 1, 2, 2, 1, 1, 1, 1, 1, 1, 1,
      ],
      [
        //Elements premier plan
        3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3,
        3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3,
        3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3,
        3, 0, 0, 5, 5, 0, 0, 0, 0, 5, 0, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3,
        3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3,
        3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 3,
        3, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3,
        3, 3, 3, 0, 0, 3, 3, 3, 3, 3, 3, 3,
      ],
      [
        //Element seconds plan
        4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4,
        4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4,
        4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4,
        4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4,
        4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4,
        4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4,
        4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 4, 0, 0, 4, 4, 4, 4, 4, 4, 4,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      ],
      [
        //Collision
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 1, 1, 0, 0, 0, 0, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1,
      ],
      [
        //Redirection
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0,
      ],
    ]);
    maps[1] = map_1;

    let map_2 = new Map(2, "home", 11, 5, 64, { 1: [224, 888] }, [
      [
        //Texture sol
        2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
        2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
        2, 2, 2, 2, 2, 2, 2,
      ],
      [
        //Elements premier plan
        3, 3, 0, 3, 3, 3, 3, 3, 3, 3, 3, 3, 5, 0, 5, 0, 0, 0, 0, 0, 0, 3, 3, 0,
        0, 0, 0, 5, 0, 0, 0, 0, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 3, 3,
        3, 3, 3, 3, 3, 3, 3,
      ],
      [
        //Element seconds plan
        4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4,
        4, 4, 4, 4, 4, 4, 4,
      ],
      [
        //Collision
        1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0,
        0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1,
        1, 1, 1, 1, 1, 1, 1,
      ],
      [
        //Redirection
        0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0,
      ],
    ]);
    maps[2] = map_2;

    //#############################################
    //HERO
    //#############################################
    class Hero {
      constructor(id, map, x, y, name, sexe, size, speed, spriteName, state) {
        this.id = id;
        this.map = map;
        this.x = x;
        this.y = y;
        this.name = name;
        this.sexe = sexe;
        this.speed = speed;
        this.image = null;
        this.width = size;
        this.height = size;
        this.spriteName = spriteName;
        this.state = state;
        this.count = 0;
        this.direction = "down";
        this.lastDirection = "down";
        this.spriteSpeed = 5; //Plus petit = plus rapide
        this.scale = 1; //Sprite grossissement
        this.idPnjCollision = 0;
      }

      getId() {
        return this.id;
      }

      getMap() {
        return this.map;
      }

      getId() {
        return this.id;
      }

      getName() {
        return this.name;
      }

      getSexe() {
        return this.sexe;
      }

      getText() {
        return this.text;
      }

      getMapId() {
        return this.mapId;
      }

      getX() {
        return this.x;
      }

      getY() {
        return this.y;
      }

      getSpeed() {
        return this.speed;
      }

      getWidth() {
        return this.width;
      }

      getImage() {
        return this.image;
      }

      getHeight() {
        return this.height;
      }

      getSpriteName() {
        return this.spriteName;
      }

      getMovementPattern() {
        return this.movementPattern;
      }

      getCount() {
        return this.count;
      }

      getDirection() {
        return this.direction;
      }

      getLastDirection() {
        return this.lastDirection;
      }

      getSpriteSpeed() {
        return this.spriteSpeed;
      }

      getScale() {
        return this.scale;
      }

      getIdPnjCollision() {
        return this.idPnjCollision;
      }

      getState() {
        return this.state;
      }

      setX(x) {
        this.x = x;
      }

      setY(y) {
        this.y = y;
      }

      setImage(image) {
        this.image = image;
      }

      setWidth(width) {
        this.width = width;
      }

      setHeight(height) {
        this.height = height;
      }

      setDirection(direction) {
        this.direction = direction;
      }

      setLastDirection(lastDirection) {
        this.lastDirection = lastDirection;
      }

      setMap(map) {
        this.map = map;
      }

      setIdPnjCollision(idPnjCollision) {
        this.idPnjCollision = idPnjCollision;
      }

      initStates() {
        this.state.generateState("up", 0, 3, 0);
        this.state.generateState("down", 0, 3, 1);
        this.state.generateState("left", 0, 3, 2);
        this.state.generateState("right", 0, 3, 3);
      }

      move(delta, dirx, diry) {
        //dirx diry (vaux soit 0 1 ou -1) corresponds à la direction du déplacement en cours

        let beforeX = this.x;
        let beforeY = this.y;

        this.x += dirx * this.speed * delta;
        this.y += diry * this.speed * delta;

        this.pnjCollision(dirx, diry, beforeX, beforeY);
        this._collide(dirx, diry);

        // clamp values
        var maxX = this.map.getCols() * this.map.getTsize();
        var maxY = this.map.getRows() * this.map.getTsize();
        this.x = Math.max(0, Math.min(this.x, maxX));
        this.y = Math.max(0, Math.min(this.y, maxY));

        socket.emit("move hero", { x: this.x, y: this.y });
      }

      isRedirect() {
        return this.map.getTile(
          4,
          this.map.getCol(this.x),
          this.map.getCol(this.y)
        );
      }

      pnjCollision(dirx, diry, beforeX, beforeY) {
        let centerLeftX = this.x + 10 - this.width / 2;
        let centerRightX = this.x + this.width / 2;
        let centerTopY = this.y - this.height / 2;
        let centerBottomY = this.y + this.height / 2;

        if (diry > 0) {
          this.idPnjCollision = this.map.pnjCollision(this.x, centerBottomY);
          if (this.idPnjCollision > 0) {
            this.y = beforeY;
          }
        } else if (diry < 0) {
          this.idPnjCollision = this.map.pnjCollision(this.x, centerTopY);
          if (this.idPnjCollision > 0) {
            this.y = beforeY;
          }
        } else if (dirx > 0) {
          this.idPnjCollision = this.map.pnjCollision(centerRightX, this.y);
          if (this.idPnjCollision > 0) {
            this.x = beforeX;
          }
        } else if (dirx < 0) {
          this.idPnjCollision = this.map.pnjCollision(centerLeftX, this.y);
          if (this.idPnjCollision > 0) {
            this.x = beforeX;
          }
        }
      }

      _collide(dirx, diry) {
        //dirx diry (vaux soit 0 1 ou -1) corresponds à la direction du déplacement en cours
        var row, col;

        // -1 à droite et en bas est parce que l'image varie de 0..63 et non jusqu'à 64
        var left = this.x - this.width / 2;
        var right = this.x + this.width / 2 - 1;
        var top = this.y - (this.height / 2 - 20);
        var bottom = this.y + this.height / 2 - 1;

        var collision =
          this.map.isSolidTileAtXY(left, top) ||
          this.map.isSolidTileAtXY(right, top) ||
          this.map.isSolidTileAtXY(right, bottom) ||
          this.map.isSolidTileAtXY(left, bottom);
        if (!collision) {
          return;
        }

        //On arrive ici SI COLLISION

        if (diry > 0) {
          row = this.map.getRow(bottom);
          this.y = -this.height / 2 + this.map.getY(row);
        } else if (diry < 0) {
          row = this.map.getRow(top);
          this.y = this.height / 2 - 20 + this.map.getY(row + 1);
        } else if (dirx > 0) {
          col = this.map.getCol(right);
          this.x = -this.width / 2 + this.map.getX(col);
        } else if (dirx < 0) {
          col = this.map.getCol(left);
          this.x = this.width / 2 + this.map.getX(col + 1);
        }
      }
    }

    //#############################################
    //CAMERA
    //#############################################
    class Camera {
      constructor(map, width, height) {
        this.SPEED = 150;
        this.x = 0;
        this.y = 0;
        this.width = width;
        this.height = height;
        this.maxX = map.getCols() * map.getTsize() - width;
        this.maxY = map.getRows() * map.getTsize() - height;
      }

      changeMap(map) {
        socket.emit("Change map", { map: map });
        this.maxX = map.getCols() * map.getTsize() - this.width;
        this.maxY = map.getRows() * map.getTsize() - this.height;
      }

      follow(sprite) {
        this.following = sprite;
        sprite.screenX = 0; //Nouveaux attribut pour le hero (sprite)
        sprite.screenY = 0;
      }

      update() {
        //this.following = le hero

        // supposez que le sprite suivi doit être placé au centre de l'écran
        // quand c'est possible
        this.following.screenX = this.width / 2; //centre de largeur
        this.following.screenY = this.height / 2; //centre de hauteur

        // faire en sorte que la caméra suive le sprite
        this.x = this.following.x - this.width / 2;
        this.y = this.following.y - this.height / 2;

        // valeurs de serrage pour pour que la camera ne suive plus quand on est sur les bord
        this.x = Math.max(0, Math.min(this.x, this.maxX));
        this.y = Math.max(0, Math.min(this.y, this.maxY));

        // dans les coins de la carte, le sprite ne peut pas être placé au centre de l'écran
        // et nous devons changer ses coordonnées d'écran

        // côtés gauche et droit
        if (
          this.following.x < this.width / 2 ||
          this.following.x > this.maxX + this.width / 2
        ) {
          this.following.screenX = this.following.x - this.x;
        }
        // côtés supérieur et inférieur
        if (
          this.following.y < this.height / 2 ||
          this.following.y > this.maxY + this.height / 2
        ) {
          this.following.screenY = this.following.y - this.y;
        }
      }
    }

    //#############################################
    //GAME
    //#############################################
    class Game {
      constructor(keyboard, map, camera, loader, hero, context) {
        this.keyboard = keyboard;
        this.map = map;
        this.camera = camera;
        this.loader = loader;
        this.hero = hero;
        this.context = context;
        this.tick = this.tick.bind(this);
        this.currentDialogue = "";
        this.isBoxDialogueOpen = false;
      }

      //Initialise les évenements du clavier
      //charge l'image de la map du dictionnaire loader
      init() {
        this.keyboard.listenForEvents([
          this.keyboard.LEFT,
          this.keyboard.RIGHT,
          this.keyboard.UP,
          this.keyboard.DOWN,
          this.keyboard.ACTION,
        ]);

        //PNJS
        for (var pnj of this.map.getPnjs()) {
          pnj.setImage(this.loader.getImage(pnj.getSpriteName()));
          pnj.setWidth(pnj.getImage().width / pnj.getImage().nbSpriteRow);
          pnj.height = pnj.getImage().height / pnj.getImage().nbSpriteCol; //TODO class image
          pnj.initStates();
        }

        //HERO
        this.tileMap = this.loader.getImage("tiles");
        this.hero.setImage(this.loader.getImage(this.hero.getSpriteName()));
        this.hero.setWidth(
          this.hero.getImage().width / this.hero.getImage().nbSpriteRow
        );
        this.hero.setHeight(
          this.hero.getImage().height / this.hero.getImage().nbSpriteCol
        );
        this.hero.initStates();
        this.camera.follow(this.hero);

        socket.emit("init hero", { hero: this.hero });
      }

      //Charge les images dans un dictionnaire
      load() {
        return [
          this.loader.loadImage("tiles", "../images/tiles.png", 0, 0),
          this.loader.loadImage("neutre", "../images/pnj.png", 4, 4),
          this.loader.loadImage("man", "../images/heroH.png", 4, 4),
          this.loader.loadImage("woman", "../images/heroF.png", 4, 4),
        ];
      }

      //
      run() {
        this._previousElapsed = 0; //précédent elapsed

        let p = this.load();
        Promise.all(p).then(
          function (loaded) {
            this.init();
            window.requestAnimationFrame(this.tick);
          }.bind(this)
        );
      }

      //Redirection vers une autre map
      redirectionMap(newMapId) {
        let newHeroPosition = this.map.getRedirection(newMapId);
        let newMap = maps[newMapId];
        this.map = newMap;
        this.hero.setMap(newMap);
        this.camera.changeMap(newMap);
        for (var pnj of this.map.getPnjs()) {
          if (pnj.getMapId() == newMap.getId()) {
            pnj.setImage(this.loader.getImage(pnj.getSpriteName()));
            pnj.setWidth(pnj.getImage().width / pnj.getImage().nbSpriteRow);
            pnj.setHeight(pnj.getImage().height / pnj.getImage().nbSpriteCol);
          }
        }
        this.hero.setX(newHeroPosition[0]);
        this.hero.setY(newHeroPosition[1]);
      }

      startTransition() {
        this.context.fillRect(0, 0, this.width, this.height); //TODO
      }

      tick(elapsed) {
        window.requestAnimationFrame(this.tick);

        // effacer l'image précédente
        this.context.clearRect(0, 0, 512, 512);

        // calcule le temps delta en secondes -- le plafonne également
        let delta = (elapsed - this._previousElapsed) / 1000.0;
        delta = Math.min(delta, 0.25); // delta maximum de 250 ms
        this._previousElapsed = elapsed;

        this.update(delta);
        this.render();
      }

      update(delta) {
        // gérer le mouvement du héros avec les touches fléchées
        var dirx = 0;
        var diry = 0;
        if (this.hero.getDirection() != "static") {
          this.hero.setLastDirection(this.hero.getDirection());
          socket.emit("Change hero last direction", {
            lastDirection: this.hero.getLastDirection(),
          });
        }

        if (this.keyboard.isDown(this.keyboard.LEFT)) {
          this.currentDialogue = "";
          this.isBoxDialogueOpen = false;
          dirx = -1;
          this.hero.setDirection("left"); //TODO ENUM DIRECTION
        } else if (this.keyboard.isDown(this.keyboard.RIGHT)) {
          this.currentDialogue = "";
          this.isBoxDialogueOpen = false;
          dirx = 1;
          this.hero.setDirection("right");
        } else if (this.keyboard.isDown(this.keyboard.UP)) {
          this.currentDialogue = "";
          this.isBoxDialogueOpen = false;
          diry = -1;
          this.hero.setDirection("up");
        } else if (this.keyboard.isDown(this.keyboard.DOWN)) {
          this.currentDialogue = "";
          this.isBoxDialogueOpen = false;
          diry = 1;
          this.hero.setDirection("down");
        } else {
          this.hero.setDirection("static");
        }
        socket.emit("Change hero direction", {
          direction: this.hero.getDirection(),
        });

        this.hero.move(delta, dirx, diry);
        this.camera.update();
        let redirectionNumber = this.hero.isRedirect();
        if (redirectionNumber > 0) {
          this.redirectionMap(redirectionNumber);
        }

        if (
          this.keyboard.isDown(this.keyboard.ACTION) &&
          !this.isBoxDialogueOpen
        ) {
          if (this.hero.getIdPnjCollision() > 0) {
            for (var pnj of this.map.getPnjs()) {
              if (pnj.getId() == this.hero.getIdPnjCollision()) {
                this.isBoxDialogueOpen = true;
                this.typeWritter(pnj.getName() + " : " + pnj.getText());
              }
            }
          }
        }
      }

      _drawBoxDialogue(text) {
        CanvasRenderingContext2D.prototype.roundRect = function (
          x,
          y,
          width,
          height,
          radius
        ) {
          if (width < 2 * radius) radius = width / 2;
          if (height < 2 * radius) radius = height / 2;
          this.beginPath();
          this.moveTo(x + radius, y);
          this.arcTo(x + width, y, x + width, y + height, radius);
          this.arcTo(x + width, y + height, x, y + height, radius);
          this.arcTo(x, y + height, x, y, radius);
          this.arcTo(x, y, x + width, y, radius);
          this.closePath();
          return this;
        };

        this.context.roundRect(
          10,
          canvas.height - 150,
          canvas.width - 20,
          140,
          8
        );

        this.context.fillStyle = "rgba(45, 45, 45, 0.7)";
        this.context.fill();

        this.context.roundRect(
          5,
          canvas.height - 160,
          canvas.width - 25,
          140,
          8
        );
        this.context.fillStyle = "rgba(255, 255, 255, 1)";
        this.context.fill();

        this._drawTextDialogue(text);
      }

      sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
      }

      async typeWritter(txt) {
        for (let i = 0; i < txt.length; i++) {
          if (this.isBoxDialogueOpen) {
            this.currentDialogue += txt.charAt(i);
            await this.sleep(i * 0.3);
          } else {
            this.currentDialogue = "";
            break;
          }
        }
      }

      _drawTextDialogue(text) {
        let textSize = 20;
        this.context.fillStyle = "#1c2833";
        this.context.textAlign = "left";
        this.context.font = textSize + "px serif";

        var lineheight = textSize;
        var lines = text.split("\n");

        for (var i = 0; i < lines.length; i++) {
          this.context.fillText(
            lines[i],
            textSize,
            canvas.height - 130 + i * lineheight
          );
        }
      }

      _drawLayer(layer) {
        let startCol = Math.floor(this.camera.x / this.map.getTsize());
        let endCol = startCol + this.camera.width / this.map.getTsize();
        let startRow = Math.floor(this.camera.y / this.map.getTsize());
        let endRow = startRow + this.camera.height / this.map.getTsize();
        let offsetX = -this.camera.x + startCol * this.map.getTsize();
        let offsetY = -this.camera.y + startRow * this.map.getTsize();

        for (let c = startCol; c <= endCol; c++) {
          for (let r = startRow; r <= endRow; r++) {
            let tile = this.map.getTile(layer, c, r);
            let x = (c - startCol) * this.map.getTsize() + offsetX;
            let y = (r - startRow) * this.map.getTsize() + offsetY;
            if (tile !== 0) {
              // 0 => tuile vide
              this.context.drawImage(
                this.tileMap, // image
                (tile - 1) * this.map.getTsize(), // source x
                0, // source y
                this.map.getTsize(), // largeur de la source
                this.map.getTsize(), // hauteur de la source
                Math.round(x), // cible x
                Math.round(y), // cible y
                this.map.getTsize(), // largeur cible
                this.map.getTsize() // hauteur de la cible
              );
            }
          }
        }
      }

      _drawPNJs() {
        for (var pnj of this.map.getPnjs()) {
          if (pnj.getMapId() == this.map.getId()) {
            if (pnj.isVisible(this.camera.x, this.camera.y)) {
              this.context.drawImage(
                pnj.getImage(), //Image
                pnj.getImage().width / pnj.getImage().nbSpriteRow, //La coordonnée x du bord en haut à gauche de la partie de l'image source à dessiner dans le contexte du canvas.
                pnj.getImage().height / pnj.getImage().nbSpriteCol, // La coordonnée y du bord en haut à gauche de la partie de l'image source à dessiner dans le contexte du canvas.
                pnj.getImage().width / pnj.getImage().nbSpriteRow, // Largeur de l'image source
                pnj.getImage().height / pnj.getImage().nbSpriteCol, // Hauteur de l'image source
                pnj.getX() - this.camera.x, // La coordonnée x dans le canvas de destination où placer le coin supérieur gauche de l'image source.
                pnj.getY() - this.camera.y, // La coordonnée y dans le canvas de destination où placer le coin supérieur gauche de l'image source.
                (pnj.getImage().width / pnj.getImage().nbSpriteRow) *
                  pnj.getScale(), // La largeur de l'image dessinée
                (pnj.getImage().height / pnj.getImage().nbSpriteCol) *
                  pnj.getScale() // La hauteur de l'image dessinée
              );
            }
          }
        }
      }

      _drawOtherHeros() {
        for (var heroWS of heros) {
          if (heroWS != null) {
            if (heroWS["hero"].id != socket.id) {
              if (heroWS["hero"].map.id == this.map.getId()) {

              let hero = new Hero();
              Object.assign(hero, heroWS["hero"]);
              hero.state = new State();
              Object.assign(hero.state, heroWS["hero"].state);
              Object.assign(hero.map, heroWS["hero"].map);
              hero.setImage(this.loader.getImage(hero.getSpriteName()));
              
              if (hero.getDirection() != "static") {
                context.drawImage(
                  hero.getImage(), //Image
                  hero.getState().getByName(hero.getDirection()).frameIndex *
                    (hero.getImage().width / hero.getImage().nbSpriteRow), //La coordonnée x du bord en haut à gauche de la partie de l'image source à dessiner dans le contexte du canvas.
                  hero.getState().getByName(hero.getDirection()).colIndex *
                    (hero.getImage().height / hero.getImage().nbSpriteCol), // La coordonnée y du bord en haut à gauche de la partie de l'image source à dessiner dans le contexte du canvas.
                  hero.getImage().width / hero.getImage().nbSpriteRow, // Largeur de l'image source
                  hero.getImage().height / hero.getImage().nbSpriteCol, // Hauteur de l'image source
                  hero.getX() - hero.width / 2 - camera.x, // La coordonnée x dans le canvas de destination où placer le coin supérieur gauche de l'image source.
                  hero.getY() - hero.height / 2 - camera.y, // La coordonnée y dans le canvas de destination où placer le coin supérieur gauche de l'image source.
                  (hero.getImage().width / hero.getImage().nbSpriteRow) *
                    hero.scale, // La largeur de l'image dessinée
                  (hero.getImage().height / hero.getImage().nbSpriteCol) *
                    hero.scale // La hauteur de l'image dessinée
                );

                //Pour boucler sur les sprite
                hero.count++;
                if (hero.count > hero.spriteSpeed) {
                  hero.getState().getByName(hero.getDirection()).frameIndex++;
                  hero.count = 0;
                }

                //Quand on arrive à la dernière on recommence à 0
                if (
                  hero.getState().getByName(hero.getDirection()).frameIndex >
                  hero.getState().getByName(hero.getDirection()).endRowIndex
                ) {
                  hero.getState().getByName(hero.getDirection()).frameIndex =
                    hero
                      .getState()
                      .getByName(hero.getDirection()).startRowIndex;
                }
              } else {
                this.context.drawImage(
                  hero.getImage(), //Image
                  hero.getState().getByName(hero.lastDirection).frameIndex *
                    (hero.getImage().width / hero.getImage().nbSpriteRow), //La coordonnée x du bord en haut à gauche de la partie de l'image source à dessiner dans le contexte du canvas.
                  hero.getState().getByName(hero.lastDirection).colIndex *
                    (hero.getImage().height / hero.getImage().nbSpriteCol), // La coordonnée y du bord en haut à gauche de la partie de l'image source à dessiner dans le contexte du canvas.
                  hero.getImage().width / hero.getImage().nbSpriteRow, // Largeur de l'image source
                  hero.getImage().height / hero.getImage().nbSpriteCol, // Hauteur de l'image source
                  hero.getX() - hero.width / 2 - this.camera.x, // La coordonnée x dans le canvas de destination où placer le coin supérieur gauche de l'image source.
                  hero.getY() - hero.height / 2 - this.camera.y, // La coordonnée y dans le canvas de destination où placer le coin supérieur gauche de l'image source.
                  (hero.getImage().width / hero.getImage().nbSpriteRow) *
                    hero.scale, // La largeur de l'image dessinée
                  (hero.getImage().height / hero.getImage().nbSpriteCol) *
                    hero.scale // La hauteur de l'image dessinée
                );
              }
              }
            }
          }
        }
      }

      _drawHero(stateName) {
        if (this.hero.getDirection() != "static") {
          this.context.drawImage(
            this.hero.getImage(), //Image
            this.hero.getState().getByName(stateName).frameIndex *
              (this.hero.getImage().width / this.hero.getImage().nbSpriteRow), //La coordonnée x du bord en haut à gauche de la partie de l'image source à dessiner dans le contexte du canvas.
            this.hero.getState().getByName(stateName).colIndex *
              (this.hero.getImage().height / this.hero.getImage().nbSpriteCol), // La coordonnée y du bord en haut à gauche de la partie de l'image source à dessiner dans le contexte du canvas.
            this.hero.getImage().width / this.hero.getImage().nbSpriteRow, // Largeur de l'image source
            this.hero.getImage().height / this.hero.getImage().nbSpriteCol, // Hauteur de l'image source
            this.hero.screenX - this.hero.width / 2, // La coordonnée x dans le canvas de destination où placer le coin supérieur gauche de l'image source.
            this.hero.screenY - this.hero.height / 2, // La coordonnée y dans le canvas de destination où placer le coin supérieur gauche de l'image source.
            (this.hero.getImage().width / this.hero.getImage().nbSpriteRow) *
              this.hero.scale, // La largeur de l'image dessinée
            (this.hero.getImage().height / this.hero.getImage().nbSpriteCol) *
              this.hero.scale // La hauteur de l'image dessinée
          );
          //Pour boucler sur les sprite
          this.hero.count++;
          if (this.hero.count > this.hero.spriteSpeed) {
            this.hero.getState().getByName(stateName).frameIndex++;
            socket.emit("Move state", { state: this.hero.state });
            this.hero.count = 0;
          }

          //Quand on arrive à la dernière on recommence à 0
          if (
            this.hero.getState().getByName(stateName).frameIndex >
            this.hero.getState().getByName(stateName).endRowIndex
          ) {
            this.hero.getState().getByName(stateName).frameIndex = this.hero
              .getState()
              .getByName(stateName).startRowIndex;
            socket.emit("Move state", { state: this.hero.state });
          }
        } else {
          this.context.drawImage(
            this.hero.getImage(), //Image
            this.hero.getState().getByName(this.hero.lastDirection).frameIndex *
              (this.hero.getImage().width / this.hero.getImage().nbSpriteRow), //La coordonnée x du bord en haut à gauche de la partie de l'image source à dessiner dans le contexte du canvas.
            this.hero.getState().getByName(this.hero.lastDirection).colIndex *
              (this.hero.getImage().height / this.hero.getImage().nbSpriteCol), // La coordonnée y du bord en haut à gauche de la partie de l'image source à dessiner dans le contexte du canvas.
            this.hero.getImage().width / this.hero.getImage().nbSpriteRow, // Largeur de l'image source
            this.hero.getImage().height / this.hero.getImage().nbSpriteCol, // Hauteur de l'image source
            this.hero.screenX - this.hero.width / 2, // La coordonnée x dans le canvas de destination où placer le coin supérieur gauche de l'image source.
            this.hero.screenY - this.hero.height / 2, // La coordonnée y dans le canvas de destination où placer le coin supérieur gauche de l'image source.
            (this.hero.getImage().width / this.hero.getImage().nbSpriteRow) *
              this.hero.scale, // La largeur de l'image dessinée
            (this.hero.getImage().height / this.hero.getImage().nbSpriteCol) *
              this.hero.scale // La hauteur de l'image dessinée
          );
        }
        /*     
          this.context.beginPath();
          this.context.strokeStyle = "#f00"; // some color/style
          this.context.lineWidth = 2; // thickness
          this.context.strokeRect(
            this.hero.screenX - this.hero.width / 2,
            this.hero.screenY - this.hero.height / 2,
            this.hero.getImage().width / this.hero.getImage().nbSpriteRow,
            this.hero.getImage().height / this.hero.getImage().nbSpriteCol
          ); 
        */
      }

      _drawOtherHeroName() {
        for (var heroWS of heros) {
          if (heroWS != null) {
            if (heroWS["hero"].id != socket.id) {
              if (heroWS["hero"].map.id == this.map.getId()) {
                let hero = new Hero();
                Object.assign(hero, heroWS["hero"]);

                let textSize = 20;
                if (hero.getSexe() == "M") {
                  this.context.fillStyle = "#358dff";
                } else {
                  this.context.fillStyle = "#e53bff";
                }
                this.context.textAlign = "center";
                this.context.font = textSize + "px serif";

                this.context.fillText(
                  hero.getName(),
                  hero.getX() - hero.width / 2 - camera.x + 20,
                  hero.getY() - hero.height / 2 - camera.y - 10
                );
              }
            }
          }
        }
      }

      _drawHeroName() {
        let textSize = 20;
        if (this.hero.getSexe() == "M") {
          this.context.fillStyle = "#358dff";
        } else {
          this.context.fillStyle = "#e53bff";
        }
        this.context.textAlign = "center";
        this.context.font = textSize + "px serif";

        this.context.fillText(
          this.hero.getName() + " [moi]",
          this.hero.screenX,
          this.hero.screenY - this.hero.height / 2 - 10
        );
      }

      _drawBoxCollision() {
        this.context.strokeRect(
          this.hero.screenX - this.hero.getWidth() / 2,
          this.hero.screenY - this.hero.getHeight() / 2,
          this.hero.getWidth(),
          this.hero.getHeight()
        );
      }

      _drawGrid() {
        var width = this.map.getCols() * this.map.getTsize();
        var height = this.map.getRows() * this.map.getTsize();
        var x, y;
        for (var r = 0; r < this.map.getRows(); r++) {
          x = -this.camera.x;
          y = r * this.map.getTsize() - this.camera.y;
          this.context.beginPath();
          this.context.moveTo(x, y);
          this.context.lineTo(width, y);
          this.context.stroke();
        }
        for (var c = 0; c < this.map.getCols(); c++) {
          x = c * this.map.getTsize() - this.camera.x;
          y = -this.camera.y;
          this.context.beginPath();
          this.context.moveTo(x, y);
          this.context.lineTo(x, height);
          this.context.stroke();
        }
      }

      render() {
        // dessiner le revetement du sol
        this._drawLayer(0);

        // dessiner les element au premier plan
        this._drawLayer(1);

        //Dessiner les PNJs
        this._drawPNJs();

        // dessiner personnage principal au centre de l'ecran
        this._drawHero(this.hero.getDirection());
        this._drawOtherHeros();

        // dessine les elements au second plan
        this._drawLayer(2);

        //pour afficher la grille (debug)
        // this._drawGrid();

        //Afficher la box collision du Hero
        // this._drawBoxCollision();

        this._drawHeroName();
        this._drawOtherHeroName();

        if (this.currentDialogue != "") {
          this._drawBoxDialogue(this.currentDialogue);
        }
      }
    }

    //#############################################
    //KEYBOARD
    //#############################################
    class Keyboard {
      LEFT = 37;
      RIGHT = 39;
      UP = 38;
      DOWN = 40;
      ACTION = 32;

      _keys = {};

      listenForEvents(keys) {
        window.addEventListener("keydown", this._onKeyDown.bind(this));
        window.addEventListener("keyup", this._onKeyUp.bind(this));

        keys.forEach(
          function (key) {
            this._keys[key] = false;
          }.bind(this)
        );
      }

      _onKeyDown(event) {
        let keyCode = event.keyCode;
        if (keyCode in this._keys) {
          event.preventDefault();
          this._keys[keyCode] = true;
        }
      }

      _onKeyUp(event) {
        let keyCode = event.keyCode;
        if (keyCode in this._keys) {
          event.preventDefault();
          this._keys[keyCode] = false;
        }
      }

      isDown(keyCode) {
        if (!keyCode in this._keys) {
          throw new Error("Keycode " + keyCode + " n'est pas écouté");
        }
        return this._keys[keyCode];
      }
    }

    //#############################################
    //APP
    //#############################################
    const canvas = document.getElementById("canvas");
    const context = canvas.getContext("2d");
    canvas.width = 512;
    canvas.height = 512;

    let keyboard = new Keyboard();
    let loader = new Loader();
    let map = maps[1];

    for (var pnj of pnjs) {
      pnj.setWidth(map.getTsize());
      pnj.setHeight(map.getTsize());
      maps[pnj.getMapId()].addPnj(pnj);
    }

    let heroSprite;
    if (heroSexe == "M") {
      heroSprite = "man";
    } else {
      heroSprite = "woman";
    }

    let hero = new Hero(
      socket.id,
      map,
      160,
      160,
      heroName,
      heroSexe,
      map.getTsize(),
      256,
      heroSprite,
      state
    );
    let camera = new Camera(map, canvas.width, canvas.height);
    let game = new Game(keyboard, map, camera, loader, hero, context);

    game.run();
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
