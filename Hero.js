class Hero {

    constructor(map, x, y, speed, spriteName) {
        this.map = map;
        this.x = x;
        this.y = y;
        this.speed = speed
        this.width = map.tsize;
        this.height = map.tsize;
        this.spriteName = spriteName;
    }

    move(delta, dirx, diry) {
        // move hero
        this.x += dirx * this.speed * delta;
        this.y += diry * this.speed * delta;

        // vérifier si on a marché dans une dalle non praticable
        this._collide(dirx, diry);

        // clamp values
        var maxX = this.map.cols * this.map.tsize;
        var maxY = this.map.rows * this.map.tsize;
        this.x = Math.max(0, Math.min(this.x, maxX));
        this.y = Math.max(0, Math.min(this.y, maxY));
    };

    _collide(dirx, diry) {
        var row, col;
        // -1 à droite et en bas est parce que l'image varie de 0..63
        // et non jusqu'à 64
        var left = this.x - this.width / 2;
        var right = this.x + this.width / 2 - 1;
        var top = this.y - this.height / 2;
        var bottom = this.y + this.height / 2 - 1;

        // vérification des collisions sur les côtés du sprite
        var collision =
            this.map.isSolidTileAtXY(left, top) ||
            this.map.isSolidTileAtXY(right, top) ||
            this.map.isSolidTileAtXY(right, bottom) ||
            this.map.isSolidTileAtXY(left, bottom);
        if (!collision) { return; }

        if (diry > 0) {
            row = this.map.getRow(bottom);
            this.y = -this.height / 2 + this.map.getY(row);
        }
        else if (diry < 0) {
            row = this.map.getRow(top);
            this.y = this.height / 2 + this.map.getY(row + 1);
        }
        else if (dirx > 0) {
            col = this.map.getCol(right);
            this.x = -this.width / 2 + this.map.getX(col);
        }
        else if (dirx < 0) {
            col = this.map.getCol(left);
            this.x = this.width / 2 + this.map.getX(col + 1);
        }
    };

}