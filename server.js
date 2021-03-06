var express = require('express');
var app = express();
var fs = require('fs');

var https = require('https');
var server = https.createServer({
  key: fs.readFileSync('./claves/www.elzoo.es_private_key.key'),
  cert: fs.readFileSync('./claves/www.elzoo.es_ssl_certificate.cer'),
  requestCert: true,
  rejectUnauthorized: false
}, app);

var http = require('http');
http.createServer(function (req, res) {
    res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
    res.end();
}).listen(80);

var mysql = require('mysql');
var io = require('socket.io').listen(server);
var server_mob = require('./server_mob.js');
var server_jugador = require('./server_jugador.js');
var readline = require('readline');
var ZooLog = require('./zoolog.js');

var configMysql = JSON.parse(fs.readFileSync("conexion.json"));
var con = mysql.createConnection({
  host: configMysql.host,
  database: configMysql.database,
  user: configMysql.user,
  password: configMysql.password
});

con.connect(function(err) {
  if(err) throw err;
  ZooLog.log("Conectado a MySQL");
});

setInterval(function () {
    con.query('SELECT 1');
}, 5000);

var jugadores = server_jugador.jugadores;
var mobs = server_mob.mobs;
var drops = server_mob.drops;

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

server_jugador.setInfo(io, con, tiles_mundo, items_mundo, server_mob);
server_mob.setInfo(io, con, tiles_mundo, items_mundo, server_jugador);

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.hmtl');
});

io.sockets.on('connection', function(socket) {
  if(!comprobarNick(socket.request._query["nick"])) {
    socket.emit('datosMapa', false);
    socket.disconnect();
    return;
  }

  server_jugador.crearJugador(socket, socket.request._query["nick"]);

  socket.emit('datosMapa', [jugadores, mobs, tiles_mundo, items_mundo, drops]);
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

  socket.on('konami', function() {
    jugadores[socket.id].alt = !jugadores[socket.id].alt;
  });

  socket.on('enviarChat', function(msg) {
    if(!msg || msg.lenght == 0 || !jugadores[socket.id]) {
      return;
    }

    msg = msg.substring(0, 64);

    var nick =  jugadores[socket.id].nick
    ZooLog.log("Chat: "+nick+" -> "+msg);
    socket.broadcast.emit('nuevoChat', [nick, msg]);
  });
});

setInterval(function() {
  var nivel = nivelMedio(jugadores);
  for(var i=0, len=Math.ceil(Object.keys(jugadores).length/2.0); i<len; i++) {
    server_mob.crearMob(nivel);
  }
}, 5000);


setInterval(function() {
  server_mob.tickDrops();
}, 1000);

setInterval(function() {
  server_jugador.updateJugadores();
  server_mob.updateMobs();

  io.emit('update', [jugadores, mobs]);
}, 10);

setInterval(function() {
  server_mob.tickMobs();
}, 100);

server.listen(443, function() {
  ZooLog.log(`Escuchando en ${server.address().port}`);
});

function calcularDistancia(ent1, ent2) {
  return Math.sqrt(Math.pow(ent1.x - ent2.x, 2) + Math.pow(ent1.y - ent2.y, 2));
}

function nivelMedio(jugadores) {
  var filtrados = [];
  for(var id in jugadores) {
    filtrados.push(jugadores[id]);
  }
  if(filtrados[0]) {
    return filtrados[Math.floor(Math.random()*filtrados.length)].nivel;
  }
  return 1;
}

function comprobarNick(nick) {
  if(!nick || nick.length < 3 || nick.lengt > 16) {
    return false;
  }

  for(var id in jugadores) {
    if(jugadores[id].nick.toLowerCase() == nick.toLowerCase()) {
      return false;
    }
  }

  return true;
}

function buscarPlayerPorNick(nick) {
  for(var id in jugadores) {
    if(jugadores[id].nick.toLowerCase().includes(nick.toLowerCase())) {
      return jugadores[id];
    }
  }
  return false;
}

var leerConsola = readline.createInterface({
  input: process.stdin
});

leerConsola.on('line', function (line) {
  var comando = line.split(" ");
  if(comando[0].toLowerCase() == 'darexp') {
    if(!comando[1]) {
      ZooLog.log("darexp <nick> <nivel>");
      return;
    }

    var jugador = buscarPlayerPorNick(comando[1]);
    if(!jugador) {
      ZooLog.log("Jugador no encontrado");
      return;
    }

    if(!comando[2]) {
      ZooLog.log("darexp "+jugador.nick+" <nivel>");
      return;
    }

    server_jugador.subirExp(jugador, comando[2]);
    ZooLog.log("Dando " + comando[2] + " exp a " + jugador.nick);
    return;
  }

  if(comando[0].toLowerCase() == 'spawn') {
    if(!comando[1]) {
      ZooLog.log("spawn <mob>");
      return;
    }

    server_mob.crearMob(9999, true, comando[1])
    return;
  }

  if(comando[0].toLowerCase() == 'alt') {
    if(!comando[1]) {
      ZooLog.log("alt <nick>");
      return;
    }

    var jugador = buscarPlayerPorNick(comando[1]);
    if(!jugador) {
      ZooLog.log("Jugador no encontrado");
      return;
    }

    jugador.alt = !jugador.alt
    ZooLog.log("Skin cambiada");
    return;
  }

  ZooLog.log("Comando no encontrado");
});
