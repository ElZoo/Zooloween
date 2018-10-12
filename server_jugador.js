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
    probCrit: 0.1
  },
  item_lanza: {
    nombre: "item_lanza",
    delayAtaque: 50,
    fuerzaAtaque: 8,
    rangoAtaque: 0.5,
    probCrit: 0.05
  },
  item_hacha: {
    nombre: "item_hacha",
    delayAtaque: 50,
    fuerzaAtaque: 15,
    rangoAtaque: 0.7,
    probCrit: 0.075
  },
  item_martillo: {
    nombre: "item_martillo",
    delayAtaque: 75,
    fuerzaAtaque: 50,
    rangoAtaque: 0.7,
    probCrit: 0.15
  }
}

module.exports.armaduras = {
  pj_tela: {
    nombre: "pj_tela",
    defensa: 0,
    vidaMax: 50
  },
  pj_cuero: {
    nombre: "pj_cuero",
    defensa: 0.1,
    vidaMax: 60
  },
  pj_chain: {
    nombre: "pj_chain",
    defensa: 0.2,
    vidaMax: 70
  },
  pj_hierro: {
    nombre: "pj_hierro",
    defensa: 0.3,
    vidaMax: 80
  },
  pj_oro: {
    nombre: "pj_oro",
    defensa: 0.5,
    vidaMax: 100
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
    nivel: 1,
    vida: 50,
    exp: 0,
    dirX: 'quieto_abajo',
    dirY: 'quieto_abajo',
    lastDir: 'quieto_abajo',
    vel: 0.02,
    tickAtaque: 0,
  }
  this.ponerArma(socket.id, "item_mano");
  this.ponerArmadura(socket.id, "pj_tela");
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

  this.io.emit('ataque_player', [id, mobs_afectados, danyo, jugador.probCrit > random1]);
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

module.exports.ponerArmadura = function(id, armadura_id) {
  var jugador = this.jugadores[id];
  var armadura = this.armaduras[armadura_id];

  jugador.armadura = armadura.nombre;
  jugador.defensa = armadura.defensa;
  if(jugador.vida == jugador.vidaMax) {
    jugador.vida = armadura.vidaMax;
  }
  jugador.vidaMax = armadura.vidaMax;
}

module.exports.subirExp = function(jugador, exp) {
    var exp = exp;
    jugador.exp += exp;

    if(calcularExpMaxNivel(jugador.nivel) <= jugador.exp) {
      this.subirLvl(jugador, exp);
    }

    this.io.to(jugador.id).emit('subirExp', [jugador.exp, exp]);
},

module.exports.subirLvl = function(jugador, exp) {
  jugador.exp -= calcularExpMaxNivel(jugador.nivel);
  jugador.nivel++;
  this.recompensa(jugador);
  this.curarPlayer(jugador, 100);
  nivelMedio(this.jugadores);
  this.io.emit('subirLvl', [jugador.id, jugador.nivel]);
}

module.exports.recompensa = function(jugador) {
  switch(jugador.nivel){
    case 5:
      this.ponerArma(jugador.id, "item_daga");
      break;
    case 10:
      this.ponerArmadura(jugador.id, "pj_cuero");
      break;
    case 15:
      this.ponerArma(jugador.id, "item_lanza");
      break;
    case 20:
      this.ponerArmadura(jugador.id, "pj_chain");
      break;
    case 30:
      this.ponerArma(jugador.id, "item_hacha");
      break;
    case 50:
      this.ponerArmadura(jugador.id, "pj_hierro");
      break;
    case 75:
      this.ponerArma(jugador.id, "item_martillo");
      break;
    case 100:
      this.ponerArmadura(jugador.id, "pj_oro");
      break;
  }
}

module.exports.curarPlayer = function(jugador, cantidad) {
  jugador.vida = Math.min(cantidad, jugador.vidaMax);
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


/* */
function nivelMedio(jugadores) {
  var sum = 0;
  for(var id in jugadores) {
    sum += jugadores[id].nivel;
  }
  console.log(sum);
}
