//#############################################
   
  
  
      //#############################################
      //HERO
      //#############################################
      class Hero {
        constructor(map, x, y, name, sexe, size, speed, spriteName, state) {
          this.map = map;
          this.x = x;
          this.y = y;
          this.name = name;
          this.sexe = sexe;
          this.speed = speed;
          this.image = null;
          this.width = size;
          this.height = size;
          this.spriteName = spriteName;
          this.state = state;
        }
      }

//############################################################################################################################


const express = require('express')
const bodyParser = require('body-parser')
const app = express()

// ajout de socket.io
const server = require('http').Server(app)

const io = require('socket.io')(server, {
    cors: {
        origin: '*',
    }
});

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.get('/json', function (req, res) {
    res.status(200).json({ "message": "ok" })
})


let heros = {};

//Web socket connection
io.on('connection', (socket) => {
    console.log(`Connecté au client ${socket.id}`)
    //Emission d'un évènement
    io.emit('news', 'Voici un nouvel élément envoyé par le serveur')

    heros[socket.id] = new Hero(null, 160, 160, null, null, null, null, null, null);

    //Delete disconnected player
    socket.on('disconnect', function () {
        delete heros[socket.id];
    });
})

// envoyez l'état du jeu à tous les joueurs connectés, 60 fois par secondes 
function update() {
    //console.log("heros = ", heros)
    io.volatile.emit('hero list', Object.values(heros)); //Le flag volatile signifie que le paquet de données peut être perdu (à cause d'une latence, d'une déconnexion, etc...).
}

setInterval(update, 1000 / 6);


io.on('connection', function (socket) {
    socket.on('init hero', function (myhero) {
        heros[socket.id] = myhero
    });
});













// on change app par server
server.listen(3003, function () {
    console.log('Votre app est disponible sur localhost:3000 !')
})
