module.exports.io = false;
module.exports.items_mundo = [];
module.exports.tiles_mundo = [];
module.exports.mobs = {};
module.exports.server_jugador = false;
module.exports.id_mob = 0;

module.exports.setInfo = function(io, tiles_mundo, items_mundo, server_jugador) {
  this.io = io;
  this.items_mundo = items_mundo;
  this.tiles_mundo = tiles_mundo;
  this.server_jugador = server_jugador;
}

module.exports.crearMob = function() {
  var num_mobs = Object.keys(this.mobs).length;
  var num_players = Object.keys(this.server_jugador.jugadores).length;
  if(num_mobs >= num_players * 3) {
    return;
  }

  var id = this.id_mob;
  this.id_mob++;

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
  this.mobs[id] = mob;

  console.log(`Nuevo mob: ${mob.tipo} (${id})`);
  this.io.emit('nuevoMob', mob);
}

module.exports.updateMobs = function() {
  var mobs_ignorados = [];

  for(var id in this.mobs) {
    var mob = this.mobs[id];
    this.buscarTarget(mob);

    if(!mob.target) {
      continue;
    }

    var target = this.server_jugador.jugadores[mob.target];
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

    if(this.check_colision_mob(mob, mobs_ignorados)) {
      mobs_ignorados.push(mob.id);
      mob.x = old_coords[0];
      mob.y = old_coords[1];
    }
  }
}

module.exports.buscarTarget = function(mob) {
  if(mob.target) {
    if(this.server_jugador.jugadores[mob.target] && this.server_jugador.jugadores[mob.target].vida > 0) {
      return;
    }
    mob.target = false;
  }
  var distancia_min = 999999;
  var id_min = -1;
  for(var id in this.server_jugador.jugadores) {
    var jugador = this.server_jugador.jugadores[id];
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

module.exports.check_colision_mob = function(mob, mobs_ignorados) {
  for(var id in this.mobs) {
    var target = this.mobs[id];
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

module.exports.mob_atacar = function(mob, target) {
  if(mob.tickAtaque < mob.delayAtaque || target.vida <= 0) {
    return;
  }
  mob.tickAtaque = 0;
  var daño = mob.fuerzaAtaque
  daño -= daño * target.defensa;
  target.vida -= daño;

  this.io.emit('mob_atacar', [mob.id, target.id]);

  if(target.vida <= 0) {
    this.server_jugador.matarJugador(target);
  }
}

module.exports.matarMob = function(mob) {
  mob.vida = 0;
  delete this.mobs[mob.id];
  this.io.emit('matarMob', mob.id);
}

module.exports.tickMobs = function() {
  for(var id in this.mobs) {
    var mob = this.mobs[id];
    if(!mob.target || !this.server_jugador.jugadores[mob.target]) {
      mob.tickAtaque = 0;
      continue;
    }
    mob.tickAtaque++;

    var target = this.server_jugador.jugadores[mob.target];
    var distancia = calcularDistancia(mob, target);
    if(distancia > 0.3) {
      continue;
    }

    this.mob_atacar(mob, target);
  }
}

function calcularDistancia(ent1, ent2) {
  return Math.sqrt(Math.pow(ent1.x - ent2.x, 2) + Math.pow(ent1.y - ent2.y, 2));
}
