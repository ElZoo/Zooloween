module.exports.io = false;
module.exports.items_mundo = [];
module.exports.tiles_mundo = [];
module.exports.jugadores = {};
module.exports.server_mob = false;

module.exports.armas = {
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
    fuerzaAtaque: 15,
    rangoAtaque: 0.7,
    probCrit: 0.075
  },
  item_espada_plus: {
    nombre: "item_espada_plus",
    delayAtaque: 50,
    fuerzaAtaque: 30,
    rangoAtaque: 0.7,
    probCrit: 0.15
  }
}

module.exports.setInfo = function(io, tiles_mundo, items_mundo, server_mob) {
  this.io = io;
  this.items_mundo = items_mundo;
  this.tiles_mundo = tiles_mundo;
  this.server_mob = server_mob
}

module.exports.crearJugador = function(socket) {
  console.log(`Se ha conectado un jugador (${socket.id})`);

  this.jugadores[socket.id] = {
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
  this.ponerArma(socket.id, "item_mano");
}

module.exports.borrarJugador = function(socket) {
  console.log(`Se ha desconectado un jugador (${socket.id})`);

  delete this.jugadores[socket.id];
  this.io.emit('disconnect', socket.id);
}

module.exports.moverJugador = function(socket, teclas) {
  var jugador = this.jugadores[socket.id];
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

module.exports.updateJugadores = function() {
  var tiles_mundo = this.tiles_mundo;
  var items_mundo = this.items_mundo;

  for(var id in this.jugadores) {
    var jugador = this.jugadores[id];
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

    if(this.check_colision(jugador.x, jugador.y)) {
      if(this.check_colision(jugador.x, old_coords[1])) {
        jugador.x = old_coords[0];
      }
      if(this.check_colision(old_coords[0], jugador.y)) {
        jugador.y = old_coords[1];
      }
    }
  }
}

module.exports.matarJugador = function(jugador) {
  jugador.vida = 0;
  delete this.jugadores[jugador.id];
  this.io.emit('matarJugador', jugador.id);
}

module.exports.player_atacar = function(id) {
  var jugador = this.jugadores[id];
  if(!jugador || jugador.tickAtaque < jugador.delayAtaque || jugador.vida <= 0) {
    return;
  }
  jugador.tickAtaque = 0;

  var mobs_afectados = [];
  for(var idMob in this.server_mob.mobs) {
    var mob = this.server_mob.mobs[idMob];

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
      this.server_mob.matarMob(mob);
      this.subirExp(jugador, 5);
    }
    mob.target = jugador.id;
    mobs_afectados.push(idMob);
  }

  this.io.emit('ataque_player', [id, mobs_afectados]);
}

module.exports.ponerArma = function(id, arma_id) {
  var jugador = this.jugadores[id];
  var arma = this.armas[arma_id];

  jugador.arma = arma.nombre;
  jugador.delayAtaque = arma.delayAtaque;
  jugador.fuerzaAtaque = arma.fuerzaAtaque;
  jugador.rangoAtaque = arma.rangoAtaque;
  jugador.probCrit = arma.probCrit;
}

module.exports.subirExp = function(jugador, exp) {
    jugador.exp += exp;

    if(calcularExpMaxNivel(jugador.nivel) <= jugador.exp) {
      this.subirLvl(jugador, exp);
    }

    this.io.to(jugador.id).emit('subirExp', jugador.exp);
},

module.exports.subirLvl = function(jugador, exp) {
  jugador.exp -= calcularExpMaxNivel(jugador.nivel);
  jugador.nivel++;
  this.recompensa(jugador);
  this.curarPlayer(jugador, 100);
  this.io.to(jugador.id).emit('subirLvl', jugador.nivel);
}

module.exports.recompensa = function(jugador) {
  switch(jugador.nivel){
    case 5:
      this.ponerArma(jugador.id, "item_daga");
      break;
    case 15:
      this.ponerArma(jugador.id, "item_espada");
      break;
    case 30:
      this.ponerArma(jugador.id, "item_espada_plus");
      break;
    default:
  }
}

module.exports.curarPlayer = function(jugador, cantidad) {
  jugador.vida = cantidad;
}

module.exports.check_colision = function(x, y) {
  var tiles_mundo = this.tiles_mundo;
  var items_mundo = this.items_mundo;
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

var tiles_barrera = [0, 10, 11, 12, 13, 14, 15];

function calcularDistancia(ent1, ent2) {
  return Math.sqrt(Math.pow(ent1.x - ent2.x, 2) + Math.pow(ent1.y - ent2.y, 2));
}

function calcularExpMaxNivel(nivel) {
  return Math.round(nivel + nivel*1.25 + 3);
}
