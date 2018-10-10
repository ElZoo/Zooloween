var server_mob = require('./server_mob.js');
var mobs = server_mob.mobs;

module.exports = {

  jugadores: {},
  armas: {
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
  },

  crearJugador: function(socket) {
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
  },

  borrarJugador: function(socket) {
    console.log(`Se ha desconectado un jugador (${socket.id})`);

    delete jugadores[socket.id];
    io.emit('disconnect', socket.id);
  },

  moverJugador: function(socket, teclas) {
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
  },

  updateJugadores: function(tiles_mundo, items_mundo) {
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

      if(check_colision(jugador.x, jugador.y, tiles_mundo, items_mundo)) {
        if(check_colision(jugador.x, old_coords[1], tiles_mundo, items_mundo)) {
          jugador.x = old_coords[0];
        }
        if(check_colision(old_coords[0], jugador.y, tiles_mundo, items_mundo)) {
          jugador.y = old_coords[1];
        }
      }
    }
  },

  matarJugador: function(jugador) {
    jugador.vida = 0;
    delete jugadores[jugador.id];
    io.emit('matarJugador', jugador.id);
  },

  player_atacar: function(id) {
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
  },

  ponerArma: function(id, arma_id) {
    var jugador = jugadores[id];
    var arma = armas[arma_id];

    jugador.arma = arma.nombre;
    jugador.delayAtaque = arma.delayAtaque;
    jugador.fuerzaAtaque = arma.fuerzaAtaque;
    jugador.rangoAtaque = arma.rangoAtaque;
    jugador.probCrit = arma.probCrit;
  },

  subirExp: function(jugador, exp) {
      jugador.exp += exp;

      if(calcularExpMaxNivel(jugador.nivel) <= jugador.exp) {
        subirLvl(jugador, exp);
      }

      io.to(jugador.id).emit('subirExp', jugador.exp);
  },

  subirLvl: function(jugador, exp) {
    jugador.exp -= calcularExpMaxNivel(jugador.nivel);
    jugador.nivel++;
    recompensa(jugador);
    curarPlayer(jugador, 100);
    io.to(jugador.id).emit('subirLvl', jugador.nivel);
  },

};

var tiles_barrera = [0, 10, 11, 12, 13, 14, 15];

function check_colision(x, y, tiles_mundo, items_mundo) {
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

function calcularDistancia(ent1, ent2) {
  return Math.sqrt(Math.pow(ent1.x - ent2.x, 2) + Math.pow(ent1.y - ent2.y, 2));
}

function curarPlayer(jugador, cantidad){
  jugador.vida = cantidad;
}

function calcularExpMaxNivel(nivel) {
  return Math.round(nivel + nivel*1.25 + 3);
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
