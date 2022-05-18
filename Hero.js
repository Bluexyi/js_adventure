class Hero {

    constructor(map, x, y, size, speed, spriteName, state) {
        this.map = map;
        this.x = x;
        this.y = y;
        this.speed = speed
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

    getMap(){
        return this.map;
    }

    getId(){
        return this.id;
    }

    getName(){
        return this.name;
    }

    getText(){
        return this.text;
    }

    getMapId(){
        return this.mapId;
    }

    getX(){
        return this.x;
    }

    getY(){
        return this.y;
    }

    getSpeed(){
        return this.speed;
    }

    getWidth(){
        return this.width
    }

    getImage(){
        return this.image;
    }

    getHeight(){
        return this.height;
    }

    getSpriteName(){
        return this.spriteName;
    }

    getMovementPattern(){
        return this.movementPattern;
    }

    getCount(){
        return this.count;
    }

    getDirection(){
        return this.direction;
    }

    getLastDirection(){
        return this.lastDirection;
    }

    getSpriteSpeed(){
        return this.spriteSpeed;
    }

    getScale(){
        return this.scale;
    }

    getIdPnjCollision(){
        return this.idPnjCollision;
    }

    getState(){
        return this.state;
    }

    setX(x){
        this.x = x;
    }

    setY(y){
        this.y = y;
    }

    setImage(image){
        this.image = image;
    }

    setWidth(width){
        this.width = width;
    }

    setHeight(height){
        this.height = height;
    }

    setDirection(direction){
        this.direction = direction;
    }

    setLastDirection(lastDirection){
        this.lastDirection = lastDirection;
    }

    setMap(map){
        this.map = map;
    }

    setIdPnjCollision(idPnjCollision){
        this.idPnjCollision = idPnjCollision;
    }

    initStates() {
        this.state.generateState("up", 0, 3, 0);
        this.state.generateState("down", 0, 3, 1);
        this.state.generateState("left", 0, 3, 2);
        this.state.generateState("right", 0, 3, 3);
    }

    move(delta, dirx, diry) { //dirx diry (vaux soit 0 1 ou -1) corresponds à la direction du déplacement en cours

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
    };

    isRedirect() {
        return this.map.getTile(4, this.map.getCol(this.x), this.map.getCol(this.y));
    }

    pnjCollision(dirx, diry, beforeX, beforeY) {

        let centerLeftX = (this.x + 10) - this.width / 2;
        let centerRightX = this.x + this.width / 2;
        let centerTopY = this.y - this.height / 2;
        let centerBottomY = this.y + this.height / 2;

        if (diry > 0) {
            this.idPnjCollision = this.map.pnjCollision(this.x, centerBottomY);
            if(this.idPnjCollision > 0){
                this.y = beforeY;
            }
        }
        else if (diry < 0) {
            this.idPnjCollision = this.map.pnjCollision(this.x, centerTopY);
            if(this.idPnjCollision > 0){
                this.y = beforeY;
            }
        }
        else if (dirx > 0) {
            this.idPnjCollision = this.map.pnjCollision(centerRightX, this.y);
            if(this.idPnjCollision > 0){
                this.x = beforeX;
            }
        }
        else if (dirx < 0) {
            this.idPnjCollision = this.map.pnjCollision(centerLeftX, this.y);
            if(this.idPnjCollision > 0){
                this.x = beforeX;
            }
        }

    }

    _collide(dirx, diry) { //dirx diry (vaux soit 0 1 ou -1) corresponds à la direction du déplacement en cours
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
        if (!collision) { return; }

        //On arrive ici SI COLLISION 

        if (diry > 0) {
            row = this.map.getRow(bottom);
            this.y = -this.height / 2 + this.map.getY(row);
        }
        else if (diry < 0) {
            row = this.map.getRow(top);
            this.y = (this.height / 2 - 20) + this.map.getY(row + 1);
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