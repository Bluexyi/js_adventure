class Camera {
    constructor(map, width, height) {
        this.SPEED = 150
        this.x = 0;
        this.y = 0;
        this.width = width;
        this.height = height;
        this.maxX = map.cols * map.tsize - width;
        this.maxY = map.rows * map.tsize - height;
    }

    follow(sprite) {
        this.following = sprite;
        sprite.screenX = 0; //Nouveaux attribut pour le hero (sprite)
        sprite.screenY = 0;
    };

    update() {
        //this.following = le hero

        // supposez que le sprite suivi doit être placé au centre de l'écran
        // quand c'est possible
        this.following.screenX = this.width / 2; //centre de largeur
        this.following.screenY = this.height / 2; //centre de hauteur

        // faire en sorte que la caméra suive le sprite
        this.x = this.following.x - this.width / 2;
        this.y = this.following.y - this.height / 2;

        // valeurs de serrage pour pour que la camera ne suive plus quand on est sur les bord
        this.x = Math.max(0, Math.min(this.x, this.maxX));
        this.y = Math.max(0, Math.min(this.y, this.maxY));

        // dans les coins de la carte, le sprite ne peut pas être placé au centre de l'écran
        // et nous devons changer ses coordonnées d'écran

        // côtés gauche et droit
        if (this.following.x < this.width / 2 ||
            this.following.x > this.maxX + this.width / 2) {
            this.following.screenX = this.following.x - this.x;
        }
        // côtés supérieur et inférieur
        if (this.following.y < this.height / 2 ||
            this.following.y > this.maxY + this.height / 2) {
            this.following.screenY = this.following.y - this.y;
        }
    };
    
}
