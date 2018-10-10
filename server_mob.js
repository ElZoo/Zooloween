var server_jugador = require('./server_jugador.js');
var jugadores = server_jugador.jugadores;

module.exports = {

  mobs: {},
  id_mob: 0,

  crearMob: function() {
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
  },

  updateMobs: function() {
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
  },

  buscarTarget: function(mob) {
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
  },

  check_colision_mob: function(mob, mobs_ignorados) {
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
  },

  mob_atacar: function(mob, target) {
    if(mob.tickAtaque < mob.delayAtaque || target.vida <= 0) {
      return;
    }
    mob.tickAtaque = 0;
    target.vida -= mob.fuerzaAtaque;

    io.emit('mob_atacar', [mob.id, target.id]);

    if(target.vida <= 0) {
      server_jugador.matarJugador(target);
    }
  },

  matarMob: function(mob) {
    mob.vida = 0;
    delete mobs[mob.id];
    io.emit('matarMob', mob.id);
  },

};

function calcularDistancia(ent1, ent2) {
  return Math.sqrt(Math.pow(ent1.x - ent2.x, 2) + Math.pow(ent1.y - ent2.y, 2));
}
