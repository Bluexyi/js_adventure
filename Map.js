class Map {

    constructor(id, name, cols, rows, tsize, layers) {
            this.id = id,
            this.name = name,
            this.cols = cols,
            this.rows = rows,
            this.tsize = tsize,
            // 1 = herbe
            // 2 = terre
            // 3 = arbre bas
            // 4 = arbre haut
            // 5 = arbuste
            this.layers = layers
    };

    getId(){
        return this.id;
    }

    getName(){
        return this.name;
    }

    getCols(){
        return this.cols;
    }

    getRows(){
        return this.rows;
    }

    getTsize(){
        return this.tsize;
    }

    getLayers(){
        return this.layers;
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
        return this.layers.reduce(function (res, layer, index) {
            var tile = this.getTile(3, col, row);
            var isSolid = tile === 1;
            return res || isSolid;
        }.bind(this), false);
    };

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
