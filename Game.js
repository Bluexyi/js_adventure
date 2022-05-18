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
        this.keyboard.listenForEvents(
            [this.keyboard.LEFT, this.keyboard.RIGHT, this.keyboard.UP, this.keyboard.DOWN, this.keyboard.ACTION]);

        //PNJS
        for (var pnj of this.map.getPnjs()) {
            pnj.setImage(this.loader.getImage(pnj.getSpriteName()))
            pnj.setWidth(pnj.getImage().width / pnj.getImage().nbSpriteRow)
            pnj.height = pnj.getImage().height / pnj.getImage().nbSpriteCol //TODO class image
            pnj.initStates()
        }

        //HERO
        this.tileMap = this.loader.getImage('tiles')
        this.hero.setImage(this.loader.getImage(this.hero.getSpriteName()))
        this.hero.setWidth(this.hero.getImage().width / this.hero.getImage().nbSpriteRow)
        this.hero.setHeight(this.hero.getImage().height / this.hero.getImage().nbSpriteCol)
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
        this.hero.setMap(newMap);
        this.camera.changeMap(newMap);
        for (var pnj of this.map.getPnjs()) {
            if (pnj.getMapId() == newMap.getId()) {
                pnj.setImage(this.loader.getImage(pnj.getSpriteName()))
                pnj.setWidth(pnj.getImage().width / pnj.getImage().nbSpriteRow)
                pnj.setHeight(pnj.getImage().height / pnj.getImage().nbSpriteCol)
            }
        }
        this.hero.setX(newHeroPosition[0]);
        this.hero.setY(newHeroPosition[1]);

    }

    startTransition() {
        this.context.fillRect(0, 0, this.width, this.height) //TODO
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
        if (this.hero.getDirection() != "static") {
            this.hero.setLastDirection(this.hero.getDirection());
        }

        if (this.keyboard.isDown(this.keyboard.LEFT)) {
            this.currentDialogue = "";
            this.isBoxDialogueOpen = false;
            dirx = -1;
            this.hero.setDirection("left"); //TODO ENUM DIRECTION
        }
        else if (this.keyboard.isDown(this.keyboard.RIGHT)) {
            this.currentDialogue = "";
            this.isBoxDialogueOpen = false;
            dirx = 1;
            this.hero.setDirection("right");
        }
        else if (this.keyboard.isDown(this.keyboard.UP)) {
            this.currentDialogue = "";
            this.isBoxDialogueOpen = false;
            diry = -1;
            this.hero.setDirection("up");
        }
        else if (this.keyboard.isDown(this.keyboard.DOWN)) {
            this.currentDialogue = "";
            this.isBoxDialogueOpen = false;
            diry = 1;
            this.hero.setDirection("down");
        }
        else {
            this.hero.setDirection("static");
        }

        this.hero.move(delta, dirx, diry);
        this.camera.update();
        let redirectionNumber = this.hero.isRedirect();
        if (redirectionNumber > 0) {
            this.redirectionMap(redirectionNumber);
        }

        if (this.keyboard.isDown(this.keyboard.ACTION) && !this.isBoxDialogueOpen) {
            if (this.hero.getIdPnjCollision() > 0) {
                this.isBoxDialogueOpen = true;
                for (var pnj of this.map.getPnjs()) {
                    if (pnj.getId() == this.hero.getIdPnjCollision()) {
                        this.typeWritter(pnj.getName() + " : " + pnj.getText());
                    }
                }
            }
        }
    };

    _drawBoxDialogue(text) {
        CanvasRenderingContext2D.prototype.roundRect = function (x, y, width, height, radius) {
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
        }

        this.context.roundRect(10, canvas.height - 150, canvas.width - 20, 140, 8);

        this.context.fillStyle = 'rgba(45, 45, 45, 0.7)';
        this.context.fill();

        this.context.roundRect(5, canvas.height - 160, canvas.width - 25, 140, 8);
        this.context.fillStyle = 'rgba(255, 255, 255, 1)';
        this.context.fill();

        this._drawTextDialogue(text);
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async typeWritter(txt) {
        for (let i = 0; i < txt.length; i++) {
            if(this.isBoxDialogueOpen){
                this.currentDialogue += txt.charAt(i);
                await this.sleep(i * 0.3);
            }else{
                this.currentDialogue = "";
                break
            }
        }
    }

    _drawTextDialogue(text) {
        let textSize = 20;
        this.context.fillStyle = "#1c2833";
        this.context.font = textSize + 'px serif';

        var lineheight = textSize;
        var lines = text.split('\n');

        for (var i = 0; i < lines.length; i++) {
            this.context.fillText(lines[i], textSize, canvas.height - 130 + (i * lineheight));
        }
        //this.context.fillText(lines[i], textSize, canvas.height - 130 + (i * lineheight));

        // this.context.fillText(text, 20, canvas.height - 115, canvas.width - 50);
    }

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
                        pnj.getImage(), //Image
                        pnj.getImage().width / pnj.getImage().nbSpriteRow, //La coordonnée x du bord en haut à gauche de la partie de l'image source à dessiner dans le contexte du canvas.
                        pnj.getImage().height / pnj.getImage().nbSpriteCol, // La coordonnée y du bord en haut à gauche de la partie de l'image source à dessiner dans le contexte du canvas.
                        pnj.getImage().width / pnj.getImage().nbSpriteRow, // Largeur de l'image source
                        pnj.getImage().height / pnj.getImage().nbSpriteCol, // Hauteur de l'image source
                        (pnj.getX()) - this.camera.x, // La coordonnée x dans le canvas de destination où placer le coin supérieur gauche de l'image source.
                        (pnj.getY()) - this.camera.y, // La coordonnée y dans le canvas de destination où placer le coin supérieur gauche de l'image source.
                        (pnj.getImage().width / pnj.getImage().nbSpriteRow) * pnj.getScale(), // La largeur de l'image dessinée
                        (pnj.getImage().height / pnj.getImage().nbSpriteCol) * pnj.getScale() // La hauteur de l'image dessinée
                    );
                }
            }
        }
    };

    _drawHero(stateName) {
        if (this.hero.getDirection() != 'static') {
            this.context.drawImage(
                this.hero.getImage(), //Image
                this.hero.getState().getByName(stateName).frameIndex * (this.hero.getImage().width / this.hero.getImage().nbSpriteRow), //La coordonnée x du bord en haut à gauche de la partie de l'image source à dessiner dans le contexte du canvas.
                this.hero.getState().getByName(stateName).colIndex * (this.hero.getImage().height / this.hero.getImage().nbSpriteCol), // La coordonnée y du bord en haut à gauche de la partie de l'image source à dessiner dans le contexte du canvas.
                this.hero.getImage().width / this.hero.getImage().nbSpriteRow, // Largeur de l'image source
                this.hero.getImage().height / this.hero.getImage().nbSpriteCol, // Hauteur de l'image source 
                this.hero.screenX - this.hero.width / 2, // La coordonnée x dans le canvas de destination où placer le coin supérieur gauche de l'image source.
                this.hero.screenY - this.hero.height / 2, // La coordonnée y dans le canvas de destination où placer le coin supérieur gauche de l'image source.
                (this.hero.getImage().width / this.hero.getImage().nbSpriteRow) * this.hero.scale, // La largeur de l'image dessinée
                (this.hero.getImage().height / this.hero.getImage().nbSpriteCol) * this.hero.scale // La hauteur de l'image dessinée
            );


            //Pour boucler sur les sprite
            this.hero.count++;
            if (this.hero.count > this.hero.spriteSpeed) {
                this.hero.getState().getByName(stateName).frameIndex++;
                this.hero.count = 0;
            }

            //Quand on arrive à la dernière on recommence à 0
            if (this.hero.getState().getByName(stateName).frameIndex > this.hero.getState().getByName(stateName).endRowIndex) {
                this.hero.getState().getByName(stateName).frameIndex = this.hero.getState().getByName(stateName).startRowIndex;
            }
        } else {
            this.context.drawImage(
                this.hero.getImage(), //Image
                this.hero.getState().getByName(this.hero.lastDirection).frameIndex * (this.hero.getImage().width / this.hero.getImage().nbSpriteRow), //La coordonnée x du bord en haut à gauche de la partie de l'image source à dessiner dans le contexte du canvas.
                this.hero.getState().getByName(this.hero.lastDirection).colIndex * (this.hero.getImage().height / this.hero.getImage().nbSpriteCol), // La coordonnée y du bord en haut à gauche de la partie de l'image source à dessiner dans le contexte du canvas.
                this.hero.getImage().width / this.hero.getImage().nbSpriteRow, // Largeur de l'image source
                this.hero.getImage().height / this.hero.getImage().nbSpriteCol, // Hauteur de l'image source 
                this.hero.screenX - this.hero.width / 2, // La coordonnée x dans le canvas de destination où placer le coin supérieur gauche de l'image source.
                this.hero.screenY - this.hero.height / 2, // La coordonnée y dans le canvas de destination où placer le coin supérieur gauche de l'image source.
                (this.hero.getImage().width / this.hero.getImage().nbSpriteRow) * this.hero.scale, // La largeur de l'image dessinée
                (this.hero.getImage().height / this.hero.getImage().nbSpriteCol) * this.hero.scale // La hauteur de l'image dessinée
            );
        }

        this.context.beginPath();
        this.context.strokeStyle = '#f00';  // some color/style
        this.context.lineWidth = 2;         // thickness
        this.context.strokeRect(
            this.hero.screenX - this.hero.width / 2,
            this.hero.screenY - this.hero.height / 2,
            this.hero.getImage().width / this.hero.getImage().nbSpriteRow,
            this.hero.getImage().height / this.hero.getImage().nbSpriteCol
        );
    };

    _drawBoxCollision() {
        this.context.strokeRect(
            this.hero.screenX - this.hero.getWidth() / 2,
            this.hero.screenY - this.hero.getHeight() / 2,
            this.hero.getWidth(),
            this.hero.getHeight()
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
        this._drawHero(this.hero.getDirection());

        // dessine les elements au second plan
        this._drawLayer(2);

        //pour afficher la grille (debug)
        this._drawGrid();

        //Afficher la box collision du Hero
        this._drawBoxCollision();

        if (this.currentDialogue != "") {
            this._drawBoxDialogue(this.currentDialogue);
        }
    };

}
