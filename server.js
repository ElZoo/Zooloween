var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.hmtl');
});

io.on('connection', function(socket) {
  crearJugador(socket);

  socket.on('disconnect', function() {
    borrarJugador(socket);
  });
});

var jugadores = {};

function crearJugador(socket) {
  console.log(`Se ha conectado un jugador (${socket.id})`);

  jugadores[socket.id] = {
    playerId: socket.id
  }

  socket.emit('listaJugadores', jugadores);
  socket.broadcast.emit('nuevoJugador', jugadores[socket.id]);
}

function borrarJugador(socket) {
  console.log(`Se ha desconectado un jugador (${socket.id})`);

  delete jugadores[socket.id];
  io.emit('disconnect', socket.id);
}

server.listen(8081, function() {
  console.log(`Escuchando en ${server.address().port}`);
});
