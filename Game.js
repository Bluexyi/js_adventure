class Game {

    constructor(camera, loader, context) {
        this.camera = camera;
        this.loader = loader;
        this.context = context;

        this.tick = this.tick.bind(this)
    }

    //Initialise les évenements du clavier
    //charge l'image de la map du dictionnaire loader
    init() {
        Keyboard.listenForEvents(
            [Keyboard.LEFT, Keyboard.RIGHT, Keyboard.UP, Keyboard.DOWN]);
        this.tileMap = this.loader.getImage('tiles');
    };

    //Charge les images dans un dictionnaire
    load() {
        return [
            this.loader.loadImage('tiles', './images/tiles.png'),
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
        // gérer le mouvement de la caméra avec les touches fléchées
        let dirx = 0;
        let diry = 0;
        if (Keyboard.isDown(Keyboard.LEFT)) { dirx = -1; }
        if (Keyboard.isDown(Keyboard.RIGHT)) { dirx = 1; }
        if (Keyboard.isDown(Keyboard.UP)) { diry = -1; }
        if (Keyboard.isDown(Keyboard.DOWN)) { diry = 1; }

        this.camera.move(delta, dirx, diry);
    };

    _drawLayer(layer) {
        let startCol = Math.floor(this.camera.x / map.tsize);
        let endCol = startCol + (this.camera.width / map.tsize);
        let startRow = Math.floor(this.camera.y / map.tsize);
        let endRow = startRow + (this.camera.height / map.tsize);
        let offsetX = -this.camera.x + startCol * map.tsize;
        let offsetY = -this.camera.y + startRow * map.tsize;

        for (let c = startCol; c <= endCol; c++) {
            for (let r = startRow; r <= endRow; r++) {
                let tile = map.getTile(layer, c, r);
                let x = (c - startCol) * map.tsize + offsetX;
                let y = (r - startRow) * map.tsize + offsetY;
                if (tile !== 0) { // 0 => tuile vide
                    this.context.drawImage(
                        this.tileMap, // image
                        (tile - 1) * map.tsize, // source x
                        0, // source y
                        map.tsize, // largeur de la source
                        map.tsize, // hauteur de la source
                        Math.round(x), // cible x
                        Math.round(y), // cible y
                        map.tsize, // largeur cible
                        map.tsize // hauteur de la cible
                    );
                }
            }
        }
    };

    render() {
        // dessiner la couche de fond de carte
        this._drawLayer(0);
        // dessine la couche supérieure de la carte
        this._drawLayer(1);
    };

}
 