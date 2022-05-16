class Hero {

    constructor(map, x, y, speed, spriteName, state) {
        this.map = map;
        this.x = x;
        this.y = y;
        this.speed = speed
        this.width = map.getTsize();
        this.height = map.getTsize();

        this.spriteName = spriteName;
        this.state = state;

        this.count = 0;

        this.direction = "down";
        this.lastDirection = "down";
        this.spriteSpeed = 5; //Plus petit = plus rapide

        this.scale = 1; //Sprite grossissement
    }

    initStates() {
        this.state.generateState("up", 0, 3, 0);
        this.state.generateState("down", 0, 3, 1);
        this.state.generateState("left", 0, 3, 2);
        this.state.generateState("right", 0, 3, 3);
    }

    move(delta, dirx, diry) { //dirx diry (vaux soit 0 1 ou -1) corresponds à la direction du déplacement en cours
        /*console.log("delta : ", delta);
        console.log("dirx : ", dirx);
        console.log("diry : ", diry);
        console.log("this.x : ", this.x);
        console.log("this.y : ", this.y);*/

        //delta est environs égale à 0.01

        // move hero
        //this.x et this.y correponds à la position du hero
        //console.log("BEFORE this.x = ", this.x)
        //console.log("BEFORE this.y = ", this.y)
        this.x += dirx * this.speed * delta;
        this.y += diry * this.speed * delta;  
        //console.log("AFTER this.x = ", this.x)
        //console.log("AFTER this.y = ", this.y)

        // vérifier si on a marché dans une dalle non praticable
      /*  console.log("X = ", Math.floor(this.x / this.width))
        console.log("Y = ", Math.floor(this.y / this.height) + 1)
        console.log(this.map.getTile(4, Math.floor(this.y / this.height) + 1, Math.floor(this.x / this.width)));*/

        this._collide(dirx, diry);

        // clamp values
        var maxX = this.map.getCols() * this.map.getTsize();
        var maxY = this.map.getRows() * this.map.getTsize();
        this.x = Math.max(0, Math.min(this.x, maxX));
        this.y = Math.max(0, Math.min(this.y, maxY));
    };

    isRedirect(){
        return this.map.getTile(4, this.map.getCol(this.x) , this.map.getCol(this.y) );
    }

    _collide(dirx, diry) { //dirx diry (vaux soit 0 1 ou -1) corresponds à la direction du déplacement en cours
        var row, col;
        // -1 à droite et en bas est parce que l'image varie de 0..63
        // et non jusqu'à 64

        var left = this.x - this.width / 2; //exemple positon 251.73503999999912 = 283.7350399999991 - 64 / 2 = 283.7350399999991 - 32
     /* console.log("this.x : ", this.x); // 283.7350399999991
        console.log("this.width : ", this.width); //64
        console.log("left : ", left); // 251.73503999999912 */
        var right = this.x + this.width / 2 - 1;
        var top = this.y - (this.height / 2 - 20);
        var bottom = this.y + this.height / 2 - 1;

        // vérification des collisions sur les diagonales
        var collision =
            this.map.isSolidTileAtXY(left, top) ||
            this.map.isSolidTileAtXY(right, top) ||
            this.map.isSolidTileAtXY(right, bottom) ||
            this.map.isSolidTileAtXY(left, bottom);
        if (!collision) { return; }

        //On arrive ici SI COLLISION 

        // vérification des collisions sur les côtés
        if (diry > 0) {
            //console.log("1")
            row = this.map.getRow(bottom);
            this.y = -this.height / 2 + this.map.getY(row);
        }
        else if (diry < 0) {
            //console.log("2")
            row = this.map.getRow(top);
            this.y =  (this.height / 2 - 20) + this.map.getY(row + 1);
        }
        else if (dirx > 0) {
            col = this.map.getCol(right);
            this.x = -this.width / 2 + this.map.getX(col); //HERE ICI !!!! //this.width est la largeur de la map
        }
        else if (dirx < 0) {    
            col = this.map.getCol(left); // col = 3
            this.x = this.width / 2 + this.map.getX(col + 1); // 288 = 64 / 2 + 256 = 32 + 256
           /* console.log('---------');
            console.log('col = ', col);
            console.log('this.width = ', this.width);
            console.log('this.x = ', this.x);
            console.log('this.map.getX(col + 1) = ', this.map.getX(col + 1));*/
        }
        //console.log("#######################")

        /*
        ####################### Hero.js:101:17
        this.x :  283.7350399999991 Hero.js:60:17
        this.width :  64 Hero.js:61:17
        left :  251.73503999999912 Hero.js:62:17
        --------- Hero.js:95:21
        col =  3 Hero.js:96:21
        this.width =  64 Hero.js:97:21
        this.x =  288 Hero.js:98:21
        this.map.getX(col + 1) =  256 Hero.js:99:21
        #######################
*/
    };

}