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


//Web socket connection
io.on('connection', (socket) => {
    console.log(`Connecté au client ${socket.id}`)
    //Emission d'un évènement
    io.emit('news', 'Voici un nouvel élément envoyé par le serveur')
})









// on change app par server
server.listen(3000, function () {
    console.log('Votre app est disponible sur localhost:3000 !')
})
