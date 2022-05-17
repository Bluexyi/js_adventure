class PNJ {

    constructor(id, mapId, size, x, y, speed, spriteName, state, movementPattern) {
        this.id = id;
        this.mapId = mapId
        this.x = x;
        this.y = y;
        this.speed = speed
        this.width = size;
        this.height = size;

        this.spriteName = spriteName;
        this.state = state;
        
        this.movementPattern = movementPattern
        
        this.count = 0;
        
        this.direction = "down";
        this.lastDirection = "down";
        this.spriteSpeed = 5; //Plus petit = plus rapide

        this.scale = 1; //Sprite grossissement

    }

    getId(){
        return this.id;
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

    getWidth(){
        return this.width
    }

    getHeight(){
        return this.height;
    }

    initStates() {
        this.state.generateState("up", 0, 3, 0);
        this.state.generateState("down", 0, 3, 1);
        this.state.generateState("left", 0, 3, 2);
        this.state.generateState("right", 0, 3, 3);
    }

    isVisible(cameraX, cameraY) {
        return !(((this.x + this.width/ 2 ) - cameraX) < 0 || ((this.y + this.height / 2) - cameraY) < 0)
    }

}