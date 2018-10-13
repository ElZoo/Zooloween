module.exports.io = false;
module.exports.items_mundo = [];
module.exports.tiles_mundo = [];
module.exports.mobs = {};
module.exports.server_jugador = false;
module.exports.id_mob = 0;
module.exports.drops = {};
module.exports.id_drop = 0;

module.exports.setInfo = function(io, tiles_mundo, items_mundo, server_jugador) {
  this.io = io;
  this.items_mundo = items_mundo;
  this.tiles_mundo = tiles_mundo;
  this.server_jugador = server_jugador;
}

module.exports.crearMob = function(nivel) {
  var num_mobs = Object.keys(this.mobs).length;
  var num_players = Object.keys(this.server_jugador.jugadores).length;
  if(num_mobs >= num_players * 3) {
    return;
  }

  var id = this.id_mob;
  this.id_mob++;
  var mob = getMobRandom(nivel, id);
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
    if(mob.x < target.x - mob.rango*0.5) {
      mob.x += mob.vel;
      mob.dir = 'derecha';
    } else if(mob.x > target.x + mob.rango*0.5) {
      mob.x -= mob.vel;
      mob.dir = 'izquierda';
    }
    if(mob.y < target.y - mob.rango*0.5) {
      mob.y += mob.vel;
    } else if(mob.y > target.y + mob.rango*0.5) {
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
    if(distancia <= mob.rango) {
      return true;
    }
  }

  return false;
}

module.exports.mob_atacar = function(mob, target) {
  if(mob.tickAtaque < mob.delayAtaque || target.vida <= 0) {
    mob.fase = 'volar';
    if(mob.tickAtaque > mob.delayAtaque/2) {
      mob.fase = 'cargar';
    }
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

  if(mob.drop) {
    var rnd = Math.random();
    if(rnd < mob.dropRate) {
      this.crearDrop(mob.x, mob.y, mob.drop);
    }
  }
}

module.exports.tickMobs = function() {
  for(var id in this.mobs) {
    var mob = this.mobs[id];
    if(!mob.target || !this.server_jugador.jugadores[mob.target]) {
      continue;
    }


    var target = this.server_jugador.jugadores[mob.target];
    var distancia = calcularDistancia(mob, target);
    if(distancia > mob.rango) {
      mob.tickAtaque = 0;
      mob.fase = 'volar';
      continue;
    }

    mob.tickAtaque++;
    this.mob_atacar(mob, target);
  }
}

module.exports.borrarDrop = function(drop_id) {
  this.io.emit('borrar_drop', drop_id);
  delete this.drops[drop_id];
}

module.exports.crearDrop = function(x, y, item) {
  var id = this.id_drop;
  this.id_drop++;
  var drop = {
    id: id,
    item: item,
    x: x,
    y: y,
    ticks: 0,
    vidaMax: 5,
    rango: 0.01
  };

  this.drops[drop.id] = drop;
  this.io.emit('nuevo_drop', drop);
}

module.exports.tickDrops = function() {
  for(var drop_id in this.drops) {
    var drop = this.drops[drop_id];
    drop.ticks++;
    if(drop.ticks >= drop.vidaMax) {
      this.borrarDrop(drop.id);
    }
  }
}

function calcularDistancia(ent1, ent2) {
  return Math.sqrt(Math.pow(ent1.x - ent2.x, 2) + Math.pow(ent1.y - ent2.y, 2));
}

function getMobRandom(nivel_max, id) {
  var rnd = Math.random() * 100;
  var mobs = ["murcielago"];
  if(nivel_max >= 5 && rnd < 5) {
    mobs.push("murcielago_boss");
  }

  return getMob(mobs[Math.floor(Math.random() * mobs.length)], id);
}

function getMob(mob_id, id) {
  var mob = { ... lista_mobs[mob_id]};
  mob.id = id;
  mob.vida = mob.vidaMax;
  mob.x = Math.random() * 16;
  mob.y = Math.random() * 16;
  mob.dir = 'derecha';
  mob.tickAtaque = 0;

  if(!mob.escala) {
    mob.escala = 1;
  }
  if(!mob.tinte) {
    mob.tinte = false;
  }

  return mob;
}

var lista_mobs = {
  "murcielago": {
    fase: 'volar',
    tipo: "murcielago",
    vidaMax: 30,
    vel: 0.01,
    delayAtaque: 10,
    fuerzaAtaque: 3,
    rango: 0.5,
    exp: 5,
    drop: 'pocion',
    dropRate: 0.2
  },
  "murcielago_boss": {
    fase: 'volar',
    tipo: "murcielago",
    vidaMax: 100,
    vel: 0.0075,
    delayAtaque: 30,
    fuerzaAtaque: 15,
    rango: 1,
    exp: 15,
    drop: 'pocion',
    dropRate: 1,
    escala: 2,
    tinte: 0x673ab7
  }
};
