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
    io.emit('get socket id', socket.id)

    heros[socket.id] = null;

    //Delete disconnected player
    socket.on('disconnect', function () {
        console.log(`Déconnecté au client ${socket.id}`)
        delete heros[socket.id];
    });
})

// envoyez l'état du jeu à tous les joueurs connectés, 60 fois par secondes 
function update() {
    //console.log("heros = ", heros)
    io.volatile.emit('hero list', Object.values(heros)); //Le flag volatile signifie que le paquet de données peut être perdu (à cause d'une latence, d'une déconnexion, etc...).
}

setInterval(update, 1000 / 60);

io.on('connection', function (socket) {
    socket.on('init hero', function (myhero) {
        if (heros != {}) {
            heros[socket.id] = myhero
            heros[socket.id].hero.id = socket.id
        }
    });

    socket.on('move hero', function (position) {
        if (heros != {}) {
            heros[socket.id].hero.x = position.x
            heros[socket.id].hero.y = position.y
        }
    });

    socket.on('Change hero direction', function (data) {
        if (heros != {}) {
            heros[socket.id].hero.direction = data.direction
        }
    });

    socket.on('Change hero last direction', function (data) {
        if (heros != {}) {
            heros[socket.id].hero.lastDirection = data.lastDirection
        }
    });

    socket.on('Move state', function (data) {
        if (heros != {}) {
            heros[socket.id].hero.state = data.state
        }
    });

});













// on change app par server
server.listen(3003, function () {
    console.log('Votre app est disponible sur localhost:3000 !')
})
