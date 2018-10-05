var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.hmtl');
});

io.sockets.on('connection', function(socket) {
  crearJugador(socket);

  socket.on('disconnect', function() {
    borrarJugador(socket);
  });

  socket.on('moverJugador', function(teclas) {
    moverJugador(socket, teclas);
  });
});

var jugadores = {};

function crearJugador(socket) {
  console.log(`Se ha conectado un jugador (${socket.id})`);

  jugadores[socket.id] = {
    id: socket.id,
    x: 2,
    y: 2,
    vida: 100,
    dir: 'quieto',
    vel: 0.033
  }

  socket.emit('datosMapa', [jugadores, tiles_mundo, items_mundo]);
  socket.broadcast.emit('nuevoJugador', jugadores[socket.id]);
}

function borrarJugador(socket) {
  console.log(`Se ha desconectado un jugador (${socket.id})`);

  delete jugadores[socket.id];
  io.emit('disconnect', socket.id);
}

function moverJugador(socket, teclas) {
  var jugador = jugadores[socket.id];
  var cambioPos = [0,0];
  if(teclas['abajo']) {
    jugador.y += jugador.vel;
    jugador.dir = 'abajo';
    cambioPos[1] += 1;
  }
  if(teclas['arriba']) {
    jugador.y -= jugador.vel;
    jugador.dir = 'arriba';
    cambioPos[1] -= 1;
  }

  if(teclas['izquierda']) {
    jugador.x -= jugador.vel;
    jugador.dir = 'izquierda';
    cambioPos[0] -= 1;
  }
  if(teclas['derecha']) {
    jugador.x += jugador.vel;
    jugador.dir = 'derecha';
    cambioPos[0] += 1;
  }

  if(cambioPos[0] == 0 && cambioPos[1] == 0) {
    jugador.dir = 'quieto';
  }
}

setInterval(function() {
  io.emit('updateJugadores', jugadores);
}, 5);

server.listen(8081, function() {
  console.log(`Escuchando en ${server.address().port}`);
});

var tiles_mundo = [
  [0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0],
  [0, 13,  0, 14,  0, 15,  0,  0, 13,  0, 14,  0, 14, 15,  0,  0],
  [0,  1,  2,  2,  2,  2,  3,  0,  1,  2,  2,  2,  2,  2,  3,  0],
  [0,  4,  5,  5,  5,  5,  6,  0,  4,  5,  5,  5,  5,  5,  6,  0],
  [0,  7,  8,  8,  8,  8,  9,  0,  4,  5,  5,  5,  5,  5,  6,  0],
  [0, 10, 11, 11, 11, 11, 12,  0,  4,  5,  5,  5,  5,  5,  6,  0],
  [0,  0,  0,  0,  0,  0,  0,  0,  4,  5,  5,  5,  5,  5,  6,  0],
  [0,  0,  0,  1,  2,  2,  2,  2,  5,  5,  5,  5,  5,  5,  6,  0],
  [0,  0,  0,  4,  5,  5,  5,  5,  5,  5,  5,  5,  5,  5,  6,  0],
  [0,  0,  0,  7,  8,  8,  8,  8,  8,  8,  8,  8,  8,  8,  9,  0],
  [0,  0,  0, 10, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11,  12,  0],
  [0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0],
  [0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0],
  [0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0],
  [0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0],
  [0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0],
];

var items_mundo = [
  [0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0],
  [0,  2,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  2,  0,  0],
  [0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0],
  [0,  0,  0,  0,  0,  0,  0,  1,  0,  0,  0,  0,  0,  0,  0,  0],
  [0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0],
  [0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0],
  [0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0],
  [0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0],
  [0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0],
  [0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0],
  [0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0],
  [0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0],
  [0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0],
  [0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0],
  [0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0],
  [0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0]
];
