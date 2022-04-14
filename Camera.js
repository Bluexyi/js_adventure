class Camera {
    constructor(map, width, height) {
        this.SPEED = 256
        this.x = 0;
        this.y = 0;
        this.width = width;
        this.height = height;
        this.maxX = map.cols * map.tsize - width;
        this.maxY = map.rows * map.tsize - height;
    }

    move(delta, dirx, diry) {
        // déplacement de la caméra
        this.x += dirx * this.SPEED * delta ;
        this.y += diry * this.SPEED * delta ;
        // fixez les valeurs
        this.x = Math.max(0, Math.min(this.x, this.maxX)) ;
        this.y = Math.max(0, Math.min(this.y, this.maxY)) ;
    } ;
}
  
