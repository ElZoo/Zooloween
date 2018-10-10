var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);
var server_mob = require('./server_mob.js');
var server_jugador = require('./server_jugador.js');

var jugadores = server_jugador.jugadores;
var mobs = server_mob.mobs;

var tiles_mundo = [
  [0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0],
  [0, 13,  0, 14,  0, 14,  0, 14, 14,  0, 14,  0, 14,  0, 15,  0,  0],
  [0,  1,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  3,  0],
  [0,  4,  5,  5,  5,  5,  5,  5,  5,  5,  5,  5,  5,  5,  5,  6,  0],
  [0,  4,  5,  8,  8,  8,  5,  8,  5,  5,  5,  8,  8,  5,  5,  6,  0],
  [0,  4,  5,  6, 11,  4,  6, 11,  5,  5,  5, 10, 11,  4,  5,  6,  0],
  [0,  4,  5,  6,  0,  4,  6,  0,  5,  5,  5,  3,  0,  4,  5,  6,  0],
  [0,  4,  5,  6,  0,  4,  6,  0,  5,  8,  5,  6,  0,  4,  5,  6,  0],
  [0,  4,  5,  6,  0,  4,  6,  0, 10, 11,  4,  6,  0,  4,  5,  6,  0],
  [0,  4,  5,  6,  0,  4,  5,  2,  3,  0,  4,  6,  0,  4,  5,  6,  0],
  [0,  4,  5,  6,  0,  7,  5,  5,  6,  0,  4,  6,  0,  4,  5,  6,  0],
  [0,  4,  5,  6,  0, 11,  5,  5,  6,  0,  4,  6,  0,  4,  5,  6,  0],
  [0,  4,  5,  5,  2,  2,  5,  5,  5,  2,  5,  5,  2,  5,  5,  6,  0],
  [0,  4,  5,  5,  5,  5,  5,  5,  5,  5,  5,  5,  5,  5,  5,  6,  0],
  [0,  7,  8,  8,  8,  8,  8,  8,  5,  8,  8,  8,  8,  8,  8,  9,  0],
  [0, 10, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 12,  0],
  [0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0]
];

var items_mundo = [
  [0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0],
  [0,  0,  0,  5,  0,  3,  0,  2,  0,  0,  4,  0,  6,  0,  2,  0,  0],
  [0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0],
  [0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0],
  [0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0],
  [0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0],
  [0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0],
  [0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0],
  [0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0],
  [0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  1,  0,  0,  0,  0],
  [0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0],
  [0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0],
  [0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0],
  [0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0],
  [0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0],
  [0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0],
  [0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0]
];

server_jugador.setInfo(io, tiles_mundo, items_mundo, server_mob);
server_mob.setInfo(io, tiles_mundo, items_mundo, server_jugador);

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.hmtl');
});

io.sockets.on('connection', function(socket) {
  server_jugador.crearJugador(socket);

  socket.emit('datosMapa', [jugadores, mobs, tiles_mundo, items_mundo]);
  socket.broadcast.emit('nuevoJugador', jugadores[socket.id]);

  socket.on('disconnect', function() {
    server_jugador.borrarJugador(socket);
  });

  socket.on('moverJugador', function(teclas) {
    server_jugador.moverJugador(socket, teclas);
  });

  socket.on('player_atacar', function() {
    server_jugador.player_atacar(socket.id);
  });
});

setInterval(function() {
  for(var i=0, len=Math.ceil(Object.keys(jugadores).length/2.0); i<len; i++) {
    server_mob.crearMob();
  }
}, 5000);

setInterval(function() {
  server_jugador.updateJugadores();
  server_mob.updateMobs();

  io.emit('update', [jugadores, mobs]);
}, 10);

setInterval(function() {
  server_mob.tickMobs();
}, 100);

server.listen(8081, function() {
  console.log(`Escuchando en ${server.address().port}`);
});

function calcularDistancia(ent1, ent2) {
  return Math.sqrt(Math.pow(ent1.x - ent2.x, 2) + Math.pow(ent1.y - ent2.y, 2));
}
