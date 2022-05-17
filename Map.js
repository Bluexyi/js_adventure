class Map {

    constructor(id, name, cols, rows, tsize, redirections, layers) {
        this.id = id,
            this.name = name,
            this.cols = cols,
            this.rows = rows,
            this.tsize = tsize,
            this.redirections = redirections,
            this.layers = layers,
            this.pnjs = []
    };

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
        this.pnjs.push(pnj)
    }

    getTile(layer, col, row) {
        // todo

        return this.layers[layer][row * this.cols + col];
        // (1, 2, 2)
        // layers[1][2*8 + 2]
        // layers[1][16 + 2]
        // layers[1][20]
        // 1
    };

    isSolidTileAtXY(x, y) {
        //Math.floor(x) renvoie le plus grand entier qui est inférieur ou égal à un nombre x
        var col = Math.floor(x / this.tsize);
        var row = Math.floor(y / this.tsize);

        // Boucle à travers toutes le layer de collision et retourne VRAI si 1 est trouvé.
        return this.layers.reduce(function (res) {
            var tile = this.getTile(3, col, row);
            var isSolid = tile === 1;
            return res || isSolid;
        }.bind(this), false);
    };

    pnjCollision(x,y){
        for (var pnj of this.pnjs) {
            if((x > pnj.getX() && x < (pnj.getX() + pnj.getWidth())) && (y > pnj.getY() && y < (pnj.getY()+ pnj.getHeight()))){ //entre 250 et 298
                console.log("Collison with pnj : ", pnj.getId());
            }
        }
    }

  /*  pnjCollide(heroX, heroY, heroW, heroH) {
        for (var pnj of this.pnjs) {
            console.log("PNJ ID-X-Y-W-H : " + pnj.getId() + "-" + pnj.getX() + "-" + pnj.getY() + "-" + pnj.getWidth() + "-" + pnj.getHeight())
            console.log("HERO X-Y-W-H : " + heroX + "-" + heroY + "-" + heroW+ "-" + heroH)
            if (heroY > (pnj.getY() + pnj.getHeight()) || (heroY + heroH) < pnj.getY()) { //si on est sur la même colonne
                if (heroX > (pnj.getX() + pnj.getWidth())) { //
                    console.log("1")
                    return true
                }
                console.log("2") // je ne suis pas sur la même ligne
                return true
            }
            console.log("3") //je suis sur la même ligne
            return false
        }
    }*/
    /*
    PNJ ID-X-Y-W-H : 250-250-48-64
    HERO X-Y-W-H   : 300-250-48-64
*/
    getCol(x) {
        // x = 5
        // 5 / 64
        // return 0
        return Math.floor(x / this.tsize);
    };

    getRow(y) {
        return Math.floor(y / this.tsize);
    };

    getX(col) {
        // col = 4
        // 4 * 64
        // return 256
        return col * this.tsize;
    };

    getY(row) {
        return row * this.tsize;
    };

};
