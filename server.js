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
var mobs = {};
var id_mob = 0;

function crearJugador(socket) {
  console.log(`Se ha conectado un jugador (${socket.id})`);

  jugadores[socket.id] = {
    id: socket.id,
    x: 2,
    y: 2,
    vida: 100,
    dir: 'quieto',
    vel: 0.02
  }

  socket.emit('datosMapa', [jugadores, mobs, tiles_mundo, items_mundo]);
  socket.broadcast.emit('nuevoJugador', jugadores[socket.id]);
}

function borrarJugador(socket) {
  console.log(`Se ha desconectado un jugador (${socket.id})`);

  delete jugadores[socket.id];
  io.emit('disconnect', socket.id);
}

function moverJugador(socket, teclas) {
  var jugador = jugadores[socket.id];
  if(!jugador) {
    return;
  }

  if(jugador.vida <= 0) {
    jugador.dir = 'quieto';
    return;
  }

  var cambioPos = [0,0];
  if(teclas['abajo']) {
    jugador.dir = 'abajo';
    cambioPos[1] += 1;
  }
  if(teclas['arriba']) {
    jugador.dir = 'arriba';
    cambioPos[1] -= 1;
  }

  if(teclas['izquierda']) {
    jugador.dir = 'izquierda';
    cambioPos[0] -= 1;
  }
  if(teclas['derecha']) {
    jugador.dir = 'derecha';
    cambioPos[0] += 1;
  }

  if(cambioPos[0] == 0 && cambioPos[1] == 0) {
    jugador.dir = 'quieto';
  }
}

setInterval(function() {
  crearMob();
}, 10000);

function crearMob() {
  var num_mobs = Object.keys(mobs).length;
  var num_players = Object.keys(jugadores).length;
  if(num_mobs >= num_players * 3) {
    return;
  }

  var id = id_mob;
  id_mob++;

  var mob = {
    id: id,
    tipo: 'murcielago',
    x: Math.random() * 16,
    y: Math.random() * 16,
    vida: 100,
    dir: 'derecha',
    vel: 0.01,
    tickAtaque: 0,
    delayAtaque: 10,
    fuerzaAtaque: 5
  }
  mobs[id] = mob;

  console.log(`Nuevo mob: ${mob.tipo} (${id})`);
  io.emit('nuevoMob', mob);
}

setInterval(function() {
  updateJugadores();
  updateMobs();

  io.emit('update', [jugadores, mobs]);
}, 10);

function updateJugadores() {
  for(var id in jugadores) {
    var jugador = jugadores[id];
    if(jugador.vida <= 0) {
      continue;
    }

    var old_coords = [jugador.x, jugador.y];
    switch(jugador.dir) {
      case 'abajo':
        jugador.y += jugador.vel;
        break;
      case 'arriba':
        jugador.y -= jugador.vel;
        break;
      case 'izquierda':
        jugador.x -= jugador.vel;
        break;
      case 'derecha':
        jugador.x += jugador.vel;
        break;
    }

    if(check_colision(jugador.x, jugador.y)) {
      jugador.x = old_coords[0];
      jugador.y = old_coords[1];
    }
  }
}

function updateMobs() {
  for(var id in mobs) {
    var mob = mobs[id];
    buscarTarget(mob);

    if(!mob.target) {
      continue;
    }

    var target = jugadores[mob.target];
    var old_coords = [mob.x, mob.y];
    if(mob.x < target.x - 0.2) {
      mob.x += mob.vel;
      mob.dir = 'derecha';
    } else if(mob.x > target.x + 0.2) {
      mob.x -= mob.vel;
      mob.dir = 'izquierda';
    }
    if(mob.y < target.y - 0.2) {
      mob.y += mob.vel;
    } else if(mob.y > target.y + 0.2) {
      mob.y -= mob.vel;
    }

    if(check_colision_mob(mob)) {
      mob.x = old_coords[0];
      mob.y = old_coords[1];
    }
  }
}

function buscarTarget(mob) {
  if(mob.target) {
    if(jugadores[mob.target] && jugadores[mob.target].vida > 0) {
      return;
    }
    mob.target = false;
  }
  distancia_min = 999999;
  id_min = -1;
  for(var id in jugadores) {
    var jugador = jugadores[id];
    if(jugador.vida <= 0) {
      continue;
    }
    var distancia = Math.sqrt(Math.pow(jugador.x - mob.x, 2) + Math.pow(jugador.y - mob.y, 2));
    if(distancia < distancia_min) {
      distancia_min = distancia;
      id_min = id;
    }
  }
  if(id_min == -1) {
    return;
  }
  mob.target = id_min;
}

function check_colision(x, y) {
  var tile_mundo = tiles_mundo[Math.round(y)][Math.round(x)];
  var item_mundo = items_mundo[Math.round(y)][Math.round(x)];

  if(tiles_barrera.indexOf(tile_mundo) > -1) {
    if(item_mundo == 1 && Math.round(y)-y >= -0.2 && Math.round(y)-y <= 0.3) {
      return false;
    }
    return true;
  }

  return false;
}

function check_colision_mob(mob) {
  for(var id in mobs) {
    var target = mobs[id];
    if(target.id == mob.id) {
      continue;
    }

    var distancia = Math.sqrt(Math.pow(mob.x - target.x, 2) + Math.pow(mob.y - target.y, 2));
    if(distancia <= 0.2) {
      return true;
    }
  }

  return false;
}

setInterval(function() {
  for(var id in mobs) {
    var mob = mobs[id];
    if(!mob.target || !jugadores[mob.target]) {
      mob.tickAtaque = 0;
      continue;
    }
    mob.tickAtaque++;

    var target = jugadores[mob.target];
    var distancia = Math.sqrt(Math.pow(mob.x - target.x, 2) + Math.pow(mob.y - target.y, 2));
    if(distancia > 0.3) {
      continue;
    }

    mob_atacar(mob, target);
  }
}, 100);

function mob_atacar(mob, target) {
  if(mob.tickAtaque < mob.delayAtaque || target.vida <= 0) {
    return;
  }
  mob.tickAtaque = 0;
  target.vida -= mob.fuerzaAtaque;

  io.emit('mob_atacar', [mob.id, target.id]);

  if(target.vida <= 0) {
    matarJugador(target);
  }
}

function matarJugador(jugador) {
  jugador.vida = 0;
  delete jugadores[jugador.id];
  io.emit('matarJugador', jugador.id);
}

server.listen(8081, function() {
  console.log(`Escuchando en ${server.address().port}`);
});

var tiles_barrera = [0, 10, 11, 12, 13, 14, 15];

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
