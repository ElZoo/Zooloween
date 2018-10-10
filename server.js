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

  socket.on('player_atacar', function() {
    player_atacar(socket.id);
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
    vidaMax : 100,
    vida: 100,
    nivel: 1,
    exp: 0,
    dirX: 'quieto_abajo',
    dirY: 'quieto_abajo',
    lastDir: 'quieto_abajo',
    vel: 0.02,
    tickAtaque: 0,
    probCrit: 0.05
  }
  ponerArma(socket.id, "item_mano");

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
    jugador.dirX = 'quieto_abajo';
    jugador.dirY = 'quieto_abajo';
    return;
  }

  var cambioPos = [0,0];

  if(teclas['izquierda']) {
    jugador.dirX = 'izquierda';
    jugador.lastDir = 'quieto_izquierda';
    cambioPos[0] -= 1;
    if(teclas['arriba']) {
      jugador.dirY = 'arriba';
      cambioPos[1] -= 1;
    }
    if(teclas['abajo']) {
      jugador.dirY = 'abajo';
      cambioPos[1] += 1;
    }
  } else if(teclas['derecha']) {
    jugador.dirX = 'derecha';
    jugador.lastDir = 'quieto_derecha';
    cambioPos[0] += 1;
    if(teclas['arriba']) {
      jugador.dirY = 'arriba';
      cambioPos[1] -= 1;
    }
    if(teclas['abajo']) {
      jugador.dirY = 'abajo';
      cambioPos[1] += 1;
    }
  } else if(teclas['abajo']) {
    jugador.dirY = 'abajo';
    jugador.lastDir = 'quieto_abajo';
    cambioPos[1] += 1;
  } else if(teclas['arriba']) {
    jugador.dirY = 'arriba';
    jugador.lastDir = 'quieto_arriba';
    cambioPos[1] -= 1;
  }

  if(cambioPos[0] == 0) {
    jugador.dirX = jugador.lastDir;
  }
  if(cambioPos[1] == 0) {
    jugador.dirY = jugador.lastDir;
  }
  if(cambioPos[0] == 0 && cambioPos[1] == 0) {
    jugador.dirX = jugador.lastDir;
    jugador.dirY = jugador.lastDir;
  }
}

setInterval(function() {
  for(var i=0, len=Math.floor(Object.keys(jugadores).length/2.0); i<len; i++) {
    crearMob();
  }
}, 5000);

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
    vidaMax: 15,
    vida: 15,
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
    jugador.tickAtaque++;

    var old_coords = [jugador.x, jugador.y];
    switch(jugador.dirY) {
      case 'abajo':
        jugador.y += jugador.vel;
        break;
      case 'arriba':
        jugador.y -= jugador.vel;
        break;
    }
    switch (jugador.dirX) {
      case 'izquierda':
        jugador.x -= jugador.vel;
        break;
      case 'derecha':
        jugador.x += jugador.vel;
        break;
    }

    if(check_colision(jugador.x, jugador.y)) {
      if(check_colision(jugador.x, old_coords[1])) {
        jugador.x = old_coords[0];
      }
      if(check_colision(old_coords[0], jugador.y)) {
        jugador.y = old_coords[1];
      }
    }
  }
}

function updateMobs() {
  var mobs_ignorados = [];

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

    if(check_colision_mob(mob, mobs_ignorados)) {
      mobs_ignorados.push(mob.id);
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
    var distancia = calcularDistancia(jugador, mob);
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

function check_colision_mob(mob, mobs_ignorados) {
  for(var id in mobs) {
    var target = mobs[id];
    if(target.id == mob.id || mobs_ignorados.indexOf(target.id) > -1) {
      continue;
    }

    var distancia = calcularDistancia(mob, target);
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
    var distancia = calcularDistancia(mob, target);
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

function matarMob(mob) {
  mob.vida = 0;
  delete mobs[mob.id];
  io.emit('matarMob', mob.id);
}

function player_atacar(id) {
  var jugador = jugadores[id];
  if(!jugador || jugador.tickAtaque < jugador.delayAtaque || jugador.vida <= 0) {
    return;
  }
  jugador.tickAtaque = 0;

  var mobs_afectados = [];
  for(var idMob in mobs) {
    var mob = mobs[idMob];

    if(jugador.lastDir.includes('derecha') && mob.x < jugador.x) {
      continue;
    }
    if(jugador.lastDir.includes('izquierda') && mob.x > jugador.x) {
      continue;
    }
    if(jugador.lastDir.includes('arriba') && mob.y > jugador.y) {
      continue;
    }
    if(jugador.lastDir.includes('abajo') && mob.y < jugador.y) {
      continue;
    }

    var distancia = calcularDistancia(jugador, mob);
    if(distancia > jugador.rangoAtaque) {
      continue;
    }
    var random1 = Math.random();
    var danyo = jugador.probCrit>=random1?(jugador.fuerzaAtaque*2):jugador.fuerzaAtaque;
    mob.vida -= danyo;
    if(mob.vida <= 0) {
      matarMob(mob);
      subirExp(jugador, 5);
    }
    mob.target = jugador.id;
    mobs_afectados.push(idMob);
  }

  io.emit('ataque_player', [id, mobs_afectados]);
}

function ponerArma(id, arma_id) {
  var jugador = jugadores[id];
  var arma = armas[arma_id];

  jugador.arma = arma.nombre;
  jugador.delayAtaque = arma.delayAtaque;
  jugador.fuerzaAtaque = arma.fuerzaAtaque;
  jugador.rangoAtaque = arma.rangoAtaque;
  jugador.probCrit = arma.probCrit;
}

function subirExp(jugador, exp) {
    jugador.exp += exp;

    if(calcularExpMaxNivel(jugador.nivel) <= jugador.exp) {
      subirLvl(jugador, exp);
    }

    io.to(jugador.id).emit('subirExp', jugador.exp);
}

function subirLvl(jugador, exp) {
  jugador.exp -= calcularExpMaxNivel(jugador.nivel);
  jugador.nivel++;
  recompensa(jugador);
  curarPlayer(jugador, 100);
  io.to(jugador.id).emit('subirLvl', jugador.nivel);
}

server.listen(8081, function() {
  console.log(`Escuchando en ${server.address().port}`);
});

function calcularDistancia(ent1, ent2) {
  return Math.sqrt(Math.pow(ent1.x - ent2.x, 2) + Math.pow(ent1.y - ent2.y, 2));
}

function calcularExpMaxNivel(nivel) {
  return Math.round(nivel + nivel*1.25 + 3);
}

function curarPlayer(jugador, cantidad){
  jugador.vida = cantidad;
}

function recompensa(jugador){
  switch(jugador.nivel){
    case 5:
      ponerArma(jugador.id, "item_daga");
      break;
    case 15:
      ponerArma(jugador.id, "item_espada");
      break;
    case 30:
      ponerArma(jugador.id, "item_espada_plus");
      break;
    default:
  }
}

var armas = {
  item_mano: {
    nombre: "item_mano",
    delayAtaque: 60,
    fuerzaAtaque: 5,
    rangoAtaque: 0.3,
    probCrit: 0.05
  },
  item_daga: {
    nombre: "item_daga",
    delayAtaque: 25,
    fuerzaAtaque: 4,
    rangoAtaque: 0.3,
    probCrit: 0.2
  },
  item_espada: {
    nombre: "item_espada",
    delayAtaque: 50,
    fuerzaAtaque: 10,
    rangoAtaque: 0.7,
    probCrit: 0.1
  },
  item_espada_plus: {
    nombre: "item_espada_plus",
    delayAtaque: 50,
    fuerzaAtaque: 20,
    rangoAtaque: 0.7,
    probCrit: 0.15
  }
};

var tiles_barrera = [0, 10, 11, 12, 13, 14, 15];

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
