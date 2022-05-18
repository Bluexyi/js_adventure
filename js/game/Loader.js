class Loader {
    images = {}

    constructor() {
    }

    loadImage(key, src, nbSpriteRow, nbSpriteCol) {
        let img = new Image();

        let d = new Promise(function (resolve, reject) {
            img.onload = function () {
                this.images[key] = img;
                this.images[key].nbSpriteRow = nbSpriteRow;
                this.images[key].nbSpriteCol = nbSpriteCol;
                resolve(img);
            }.bind(this);

            img.onerror = function () {
                reject('Could not load image: ' + src);
            };
        }.bind(this));

        img.src = src;

        return d;
    };

    getImage(key) {
        return (key in this.images) ? this.images[key] : null;
    };

}