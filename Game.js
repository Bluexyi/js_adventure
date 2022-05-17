class Game {

    constructor(keyboard, map, camera, loader, hero, context) {
        this.keyboard = keyboard;
        this.map = map;
        this.camera = camera;
        this.loader = loader;
        this.hero = hero;
        this.context = context;

        this.tick = this.tick.bind(this)
    }

    //Initialise les évenements du clavier
    //charge l'image de la map du dictionnaire loader
    init() {
        this.keyboard.listenForEvents(
            [this.keyboard.LEFT, this.keyboard.RIGHT, this.keyboard.UP, this.keyboard.DOWN]);

        //MAP
        //this.map = new Map(1, "bourgpalette", 12, 12, 64, "todo"),

        //PNJS
        for (var pnj of this.map.getPnjs()) {
            pnj.image = this.loader.getImage(pnj.spriteName)
            pnj.width = pnj.image.width / pnj.image.nbSpriteRow
            pnj.height = pnj.image.height / pnj.image.nbSpriteCol
            pnj.initStates()
        }

        //HERO
        this.tileMap = this.loader.getImage('tiles')
        this.hero.image = this.loader.getImage(this.hero.spriteName)
        this.hero.width = this.hero.image.width / this.hero.image.nbSpriteRow
        this.hero.height = this.hero.image.height / this.hero.image.nbSpriteCol
        this.hero.initStates()
        this.camera.follow(this.hero)
    };

    //Charge les images dans un dictionnaire
    load() {
        return [
            this.loader.loadImage('tiles', './images/tiles.png', 0, 0),
            this.loader.loadImage('hero', './images/player.png', 4, 4),
        ];
    };

    //
    run() {
        this._previousElapsed = 0; //précédent elapsed

        let p = this.load();
        Promise.all(p).then(function (loaded) {
            this.init();
            window.requestAnimationFrame(this.tick);
        }.bind(this));
    };

    //Redirection vers une autre map
    redirectionMap(newMapId) {
        let newHeroPosition = this.map.getRedirection(newMapId);
        let newMap = maps[newMapId];
        this.map = newMap;
        this.hero.map = newMap;
        this.camera.changeMap(newMap);
        for (var pnj of this.map.getPnjs()) {
            if (pnj.getMapId() == newMap.getId()) {
                pnj.map = newMap;
                pnj.image = this.loader.getImage(pnj.spriteName)
                pnj.width = pnj.image.width / pnj.image.nbSpriteRow
                pnj.height = pnj.image.height / pnj.image.nbSpriteCol
                console.log(pnj.height)
                console.log(pnj.width)
            }
        }
        this.hero.x = newHeroPosition[0];
        this.hero.y = newHeroPosition[1];

    }

    startTransition() {
        this.context.fillRect(0, 0, this.width, this.height)
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
    };

    update(delta) {
        // gérer le mouvement du héros avec les touches fléchées
        var dirx = 0;
        var diry = 0;
        if (this.hero.direction != "static") {
            this.hero.lastDirection = this.hero.direction;
        }
        if (this.keyboard.isDown(this.keyboard.LEFT)) {
            dirx = -1;
            this.hero.direction = "left";
        }
        else if (this.keyboard.isDown(this.keyboard.RIGHT)) {
            dirx = 1;
            this.hero.direction = "right";
        }
        else if (this.keyboard.isDown(this.keyboard.UP)) {
            diry = -1;
            this.hero.direction = "up";
        }
        else if (this.keyboard.isDown(this.keyboard.DOWN)) {
            diry = 1;
            this.hero.direction = "down";
        }
        else {
            this.hero.direction = "static";
        }

        this.hero.move(delta, dirx, diry);
        this.camera.update();
        let redirectionNumber = this.hero.isRedirect();
        if (redirectionNumber > 0) {
            this.redirectionMap(redirectionNumber);
        }
    };

    _drawLayer(layer) {
        let startCol = Math.floor(this.camera.x / this.map.getTsize());
        let endCol = startCol + (this.camera.width / this.map.getTsize());
        let startRow = Math.floor(this.camera.y / this.map.getTsize());
        let endRow = startRow + (this.camera.height / this.map.getTsize());
        let offsetX = -this.camera.x + startCol * this.map.getTsize();
        let offsetY = -this.camera.y + startRow * this.map.getTsize();

        /*       console.log("startCol = ", startCol);
               console.log("endCol = ", endCol);
               console.log("startRow = ", startRow);
               console.log("endRow = ", endRow);*/

        for (let c = startCol; c <= endCol; c++) {
            for (let r = startRow; r <= endRow; r++) {
                let tile = this.map.getTile(layer, c, r);
                let x = (c - startCol) * this.map.getTsize() + offsetX;
                let y = (r - startRow) * this.map.getTsize() + offsetY;
                if (tile !== 0) { // 0 => tuile vide
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
    };

    _drawPNJs() {
        for (var pnj of this.map.getPnjs()) {
            if (pnj.getMapId() == this.map.getId()) {
                if (pnj.isVisible(this.camera.x, this.camera.y)) {
                    this.context.drawImage(
                        pnj.image, //Image
                        pnj.image.width / pnj.image.nbSpriteRow, //La coordonnée x du bord en haut à gauche de la partie de l'image source à dessiner dans le contexte du canvas.
                        pnj.image.height / pnj.image.nbSpriteCol, // La coordonnée y du bord en haut à gauche de la partie de l'image source à dessiner dans le contexte du canvas.
                        pnj.image.width / pnj.image.nbSpriteRow, // Largeur de l'image source
                        pnj.image.height / pnj.image.nbSpriteCol, // Hauteur de l'image source
                        (pnj.x) - this.camera.x, // La coordonnée x dans le canvas de destination où placer le coin supérieur gauche de l'image source.
                        (pnj.y) - this.camera.y, // La coordonnée y dans le canvas de destination où placer le coin supérieur gauche de l'image source.
                        (pnj.image.width / pnj.image.nbSpriteRow) * pnj.scale, // La largeur de l'image dessinée
                        (pnj.image.height / pnj.image.nbSpriteCol) * pnj.scale // La hauteur de l'image dessinée
                    );
                }
            }
        }
    };

    _drawHero(stateName) {
        if (this.hero.direction != 'static') {
            this.context.drawImage(
                this.hero.image, //Image
                this.hero.state.getState(stateName).frameIndex * (this.hero.image.width / this.hero.image.nbSpriteRow), //La coordonnée x du bord en haut à gauche de la partie de l'image source à dessiner dans le contexte du canvas.
                this.hero.state.getState(stateName).colIndex * (this.hero.image.height / this.hero.image.nbSpriteCol), // La coordonnée y du bord en haut à gauche de la partie de l'image source à dessiner dans le contexte du canvas.
                this.hero.image.width / this.hero.image.nbSpriteRow, // Largeur de l'image source
                this.hero.image.height / this.hero.image.nbSpriteCol, // Hauteur de l'image source 
                this.hero.screenX - this.hero.width / 2, // La coordonnée x dans le canvas de destination où placer le coin supérieur gauche de l'image source.
                this.hero.screenY - this.hero.height / 2, // La coordonnée y dans le canvas de destination où placer le coin supérieur gauche de l'image source.
                (this.hero.image.width / this.hero.image.nbSpriteRow) * this.hero.scale, // La largeur de l'image dessinée
                (this.hero.image.height / this.hero.image.nbSpriteCol) * this.hero.scale // La hauteur de l'image dessinée
            );


            //Pour boucler sur les sprite
            this.hero.count++;
            if (this.hero.count > this.hero.spriteSpeed) {
                this.hero.state.getState(stateName).frameIndex++;
                this.hero.count = 0;
            }

            //Quand on arrive à la dernière on recommence à 0
            if (this.hero.state.getState(stateName).frameIndex > this.hero.state.getState(stateName).endRowIndex) {
                this.hero.state.getState(stateName).frameIndex = this.hero.state.getState(stateName).startRowIndex;
            }
        } else {
            this.context.drawImage(
                this.hero.image, //Image
                this.hero.state.getState(this.hero.lastDirection).frameIndex * (this.hero.image.width / this.hero.image.nbSpriteRow), //La coordonnée x du bord en haut à gauche de la partie de l'image source à dessiner dans le contexte du canvas.
                this.hero.state.getState(this.hero.lastDirection).colIndex * (this.hero.image.height / this.hero.image.nbSpriteCol), // La coordonnée y du bord en haut à gauche de la partie de l'image source à dessiner dans le contexte du canvas.
                this.hero.image.width / this.hero.image.nbSpriteRow, // Largeur de l'image source
                this.hero.image.height / this.hero.image.nbSpriteCol, // Hauteur de l'image source 
                this.hero.screenX - this.hero.width / 2, // La coordonnée x dans le canvas de destination où placer le coin supérieur gauche de l'image source.
                this.hero.screenY - this.hero.height / 2, // La coordonnée y dans le canvas de destination où placer le coin supérieur gauche de l'image source.
                (this.hero.image.width / this.hero.image.nbSpriteRow) * this.hero.scale, // La largeur de l'image dessinée
                (this.hero.image.height / this.hero.image.nbSpriteCol) * this.hero.scale // La hauteur de l'image dessinée
            );
        }

        this.context.beginPath();
        this.context.strokeStyle = '#f00';  // some color/style
        this.context.lineWidth = 2;         // thickness
        this.context.strokeRect(
            this.hero.screenX - this.hero.width / 2,
            this.hero.screenY - this.hero.height / 2,
            this.hero.image.width / this.hero.image.nbSpriteRow,
            this.hero.image.height / this.hero.image.nbSpriteCol
        );
    };

    _drawBoxCollision() {
        this.context.strokeRect(
            this.hero.screenX - this.hero.width / 2,
            this.hero.screenY - this.hero.height / 2,
            this.hero.width,
            this.hero.height
        );
    };

    _drawGrid() {
        var width = this.map.getCols() * this.map.getTsize();
        var height = this.map.getRows() * this.map.getTsize();
        var x, y;
        for (var r = 0; r < this.map.getRows(); r++) {
            x = - this.camera.x;
            y = r * this.map.getTsize() - this.camera.y;
            this.context.beginPath();
            this.context.moveTo(x, y);
            this.context.lineTo(width, y);
            this.context.stroke();
        }
        for (var c = 0; c < this.map.getCols(); c++) {
            x = c * this.map.getTsize() - this.camera.x;
            y = - this.camera.y;
            this.context.beginPath();
            this.context.moveTo(x, y);
            this.context.lineTo(x, height);
            this.context.stroke();
        }
    };

    render() {
        // dessiner le revetement du sol
        this._drawLayer(0);

        // dessiner les element au premier plan
        this._drawLayer(1);

        //Dessiner les PNJs
        this._drawPNJs();
        //console.log("x = " + this.camera.x + " y = " + this.camera.y)

        // dessiner personnage principal au centre de l'ecran
        this._drawHero(this.hero.direction);

        // dessine les elements au second plan
        this._drawLayer(2);

        //pour afficher la grille (debug)
        this._drawGrid();

        //Afficher la box collision du Hero
        this._drawBoxCollision();
    };

}
