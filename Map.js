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
        return this.layers[layer][row * this.cols + col];
    };

    isSolidTileAtXY(x, y) {
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
            if((x > pnj.getX() && x < (pnj.getX() + pnj.getWidth())) && (y > pnj.getY() && y < (pnj.getY()+ pnj.getHeight()))){
                return pnj.getId()
            }
        }
        return 0;
    }

    getCol(x) {
        return Math.floor(x / this.tsize);
    };

    getRow(y) {
        return Math.floor(y / this.tsize);
    };

    getX(col) {
        return col * this.tsize;
    };

    getY(row) {
        return row * this.tsize;
    };

};
