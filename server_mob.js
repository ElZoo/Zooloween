var PF = require('pathfinding');
var finder = new PF.AStarFinder({allowDiagonal: true, dontCrossCorners: true});

module.exports.io = false;
module.exports.items_mundo = [];
module.exports.tiles_mundo = [];
module.exports.mobs = {};
module.exports.server_jugador = false;
module.exports.id_mob = 0;
module.exports.drops = {};
module.exports.id_drop = 0;

module.exports.setInfo = function(io, con, tiles_mundo, items_mundo, server_jugador) {
  this.io = io;
  this.con = con;
  this.items_mundo = items_mundo;
  this.tiles_mundo = tiles_mundo;
  this.server_jugador = server_jugador;
}

module.exports.crearMob = function(nivel, ignoreMax=false, mob=false) {
  var num_mobs = Object.keys(this.mobs).length;
  var num_players = Object.keys(this.server_jugador.jugadores).length;
  if(!ignoreMax && num_mobs >= num_players * 5) {
    return;
  }
  if(!this.gridPath) {
    this.crearGridPath();
  }

  var id = this.id_mob;
  this.id_mob++;
  if(!mob) {
    mob = this.getMobRandom(nivel, id);
  } else {
    mob = this.getMob(mob, nivel, id);
  }
  this.mobs[id] = mob;

  console.log(`Nuevo mob: ${mob.tipo}-${mob.nivel} (id: ${id})`);
  this.io.emit('nuevoMob', mob);
}

module.exports.updateMobs = function() {
  var mobs_ignorados = [];

  for(var id in this.mobs) {
    var mob = this.mobs[id];
    this.buscarTarget(mob);

    if(!mob.target || mob.fase == 'cargar') {
      continue;
    }
    var target = this.server_jugador.jugadores[mob.target];

    //Si está en la misma casilla que el target, ir directo hacia el
    //Si no, usar pathfinding e ir a la casilla más próxima
    var casilla_mob = [Math.round(mob.x), Math.round(mob.y)];
    var casilla_target = [Math.round(target.x), Math.round(target.y)];
    if(!casilla_mob || !casilla_target) {
      continue;
    }

    if(mob.volador || (casilla_mob[0] == casilla_target[0] && casilla_mob[1] == casilla_target[1])) {
      this.irDondeTarget(mob, target, mobs_ignorados);
    } else {
      var nuevoGrid = this.gridPath.clone();

      for(var mob_id in this.mobs) {
        if(mob_id == mob.id) {
          continue;
        }
        var mob_path = this.mobs[mob_id];
        if(mob_path.volador) {
          continue;
        }
        var casilla_path = [Math.round(mob_path.x), Math.round(mob_path.y)];
        if(casilla_path[0] == casilla_target[0] && casilla_path[1] == casilla_target[1]) {
          continue;
        }
        nuevoGrid.setWalkableAt(casilla_path[0], casilla_path[1], false);
      }

      var camino = finder.findPath(casilla_mob[0], casilla_mob[1], casilla_target[0], casilla_target[1], nuevoGrid);
      this.irDondePath(mob, camino[1], mobs_ignorados, target);
    }

  }
}

module.exports.irDondePath = function(mob, casilla, mobs_ignorados, target) {
  if(!casilla) {
    return;
  }

  var old_coords = [mob.x, mob.y];
  if(mob.x < casilla[0]-0.1) {
    mob.x += mob.vel;
  } else if(mob.x > casilla[0]+0.1) {
    mob.x -= mob.vel;
  }
  if(mob.y < casilla[1]-0.1) {
    mob.y += mob.vel;
  } else if(mob.y > casilla[1]+0.1) {
    mob.y -= mob.vel;
  }

  if(mob.x < target.x-0.1) {
    mob.dir = 'derecha';
  } else if(mob.x > target.x+0.1) {
    mob.dir = 'izquierda';
  }

  if(this.check_colision_mob(mob, mobs_ignorados)) {
    mobs_ignorados.push(mob.id);
    mob.x = old_coords[0];
    mob.y = old_coords[1];
  }
}

module.exports.irDondeTarget = function(mob, target, mobs_ignorados) {
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
    if(mob.volador) {
      mob.fase = 'volar';
    } else {
      mob.fase = 'andar';
    }
    if(mob.tickAtaque > 0) {
      mob.fase = 'cargar';
    }
    return;
  }
  mob.tickAtaque = 0;
  var daño = mob.fuerzaAtaque
  daño -= daño * target.defensa;
  if(target.boost && target.boost == 'boost_defensa') {
    daño -= daño * 0.25;
  }
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

  if(mob.drops) {
    var rnd = Math.random();
    if(rnd < mob.dropRate) {
      var item = mob.drops[Math.floor(Math.random() * mob.drops.length)];
      this.crearDrop(mob.x, mob.y, item);
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
      if(mob.volador) {
        mob.fase = 'volar';
      } else {
        mob.fase = 'andar';
      }
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
  var tile = this.tiles_mundo[Math.round(y)][Math.round(x)];
  if(tiles_barrera.indexOf(tile) > -1) {
    return;
  }

  var id = this.id_drop;
  this.id_drop++;
  var drop = {
    id: id,
    item: item,
    x: x,
    y: y,
    ticks: 0,
    vidaMax: 20,
    rango: 0.035
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

module.exports.crearGridPath = function() {
  var grid = [];
  for(var y=0,leny=this.tiles_mundo.length; y<leny; y++) {
    grid[y] = [];
    for(var x=0,lenx=this.tiles_mundo[y].length; x<lenx; x++) {
      var tile = 0;
      if(tiles_barrera.indexOf(this.tiles_mundo[y][x]) > -1 && this.items_mundo[y][x] != 1) {
        tile = 1;
      }
      grid[y][x] = tile;
    }
  }
  this.gridPath = new PF.Grid(grid);
}

function calcularDistancia(ent1, ent2) {
  return Math.sqrt(Math.pow(ent1.x - ent2.x, 2) + Math.pow(ent1.y - ent2.y, 2));
}

module.exports.getMobRandom = function(nivel, id) {
  var mobs_aptos = [];
  for(var mob_id in lista_mobs) {
    var mob = lista_mobs[mob_id];
    if(nivel >= mob.nivelMin && mob.spawnRate > Math.random()) {
      mobs_aptos.push(mob_id);
    }
  }

  return this.getMob(mobs_aptos[Math.floor(Math.random() * mobs_aptos.length)], nivel, id);
}

module.exports.getMob = function(mob_id, nivel, id) {
  var mob = { ... lista_mobs[mob_id]};
  mob.id = id;
  mob.vida = mob.vidaMax;
  mob.dir = 'derecha';
  mob.tickAtaque = 0;

  while(!spawnValido) {
    var spawnValido = false;
    mob.x = Math.random() * (this.tiles_mundo.length-1);
    mob.y = Math.random() * (this.tiles_mundo[0].length-1);

    var tile = this.tiles_mundo[Math.floor(mob.y)][Math.floor(mob.x)];
    if(tiles_barrera.indexOf(tile) == -1) {
      spawnValido = true;
    }
  }

  if(!mob.escala) {
    mob.escala = 1;
  }
  if(!mob.tinte) {
    mob.tinte = false;
  }
  if(!mob.offset) {
    mob.offset = [0.5, 0.5];
  }
  if(mob.volador) {
    mob.fase = 'volar';
  } else {
    mob.fase = 'andar';
  }

  if(mob.nivelMax) {
    nivel = Math.min(nivel, mob.nivelMax);
    nivel = Math.max(nivel, mob.nivelMin);
    nivel = nivel - mob.nivelMin;

    mob.nivel = nivel;
    mob.exp += mob.exp * 0.02 * nivel;
    mob.fuerzaAtaque += mob.fuerzaAtaque * 0.02 * nivel;
    mob.vidaMax += mob.vidaMax * 0.02 * nivel;
    mob.vida = mob.vidaMax;
  }

  return mob;
}

var lista_mobs = {
  "murcielago": {
    nivelMin: 1,
    nivelMax: 5,
    spawnRate: 1,
    volador: true,
    tipo: "murcielago",
    vidaMax: 30,
    vel: 0.01,
    delayAtaque: 10,
    fuerzaAtaque: 4,
    rango: 0.5,
    exp: 5,
    drops: ['pocion'],
    dropRate: 0.2
  },
  "murcielago_boss": {
    nivelMin: 5,
    nivelMax: 5,
    spawnRate: 0.05,
    volador: true,
    tipo: "murcielago",
    vidaMax: 100,
    vel: 0.0075,
    delayAtaque: 30,
    fuerzaAtaque: 40,
    rango: 1,
    exp: 25,
    drops: ['pocion'],
    dropRate: 1,
    escala: 2,
    tinte: 0x673ab7,
    isBoss: true,
  },

  "tostada": {
    nivelMin: 1,
    nivelMax: 1,
    spawnRate: 0.1,
    volador: false,
    tipo: "tostada",
    vidaMax: 1,
    vel: 0.03,
    delayAtaque: 5,
    fuerzaAtaque: 1,
    rango: 0.5,
    exp: 1,
    drops: ['boost_velocidad'],
    dropRate: 1,
    escala: 0.4,
    flipTextura: true,
    offset: [0.5, 1],
  },

  "araña": {
    nivelMin: 5,
    nivelMax: 10,
    spawnRate: 1,
    volador: false,
    tipo: "araña",
    vidaMax: 25,
    vel: 0.01,
    delayAtaque: 8,
    fuerzaAtaque: 8,
    rango: 0.5,
    exp: 8,
    drops: ['pocion'],
    dropRate: 0.2,
    escala: 0.5,
    flipTextura: true,
  },
  "araña_boss": {
    nivelMin: 10,
    nivelMax: 10,
    spawnRate: 0.05,
    volador: false,
    tipo: "araña",
    vidaMax: 120,
    vel: 0.01,
    delayAtaque: 20,
    fuerzaAtaque: 50,
    rango: 1,
    exp: 40,
    drops: ['pocion'],
    dropRate: 1,
    escala: 1,
    tinte: 0x673ab7,
    flipTextura: true,
    isBoss: true,
  },

  "calabaza": {
    nivelMin: 10,
    nivelMax: 15,
    spawnRate: 1,
    volador: false,
    tipo: "calabaza",
    vidaMax: 60,
    vel: 0.01,
    delayAtaque: 12,
    fuerzaAtaque: 6,
    rango: 0.5,
    exp: 12,
    drops: ['boost_defensa'],
    dropRate: 0.2,
    escala: 0.5,
    flipTextura: true,
  },

  "fantasma": {
    nivelMin: 15,
    nivelMax: 20,
    spawnRate: 1,
    volador: true,
    tipo: "fantasma",
    vidaMax: 50,
    vel: 0.01,
    delayAtaque: 6,
    fuerzaAtaque: 12,
    rango: 0.5,
    exp: 16,
    drops: ['pocion'],
    dropRate: 0.2,
    escala: 0.5,
    offset: [0.5, 1],
  },

  "zombie": {
    nivelMin: 20,
    nivelMax: 30,
    spawnRate: 1,
    volador: false,
    tipo: "zombie",
    vidaMax: 70,
    vel: 0.005,
    delayAtaque: 10,
    fuerzaAtaque: 12,
    rango: 0.5,
    exp: 20,
    drops: ['boost_defensa'],
    dropRate: 0.2,
    escala: 0.75,
    offset: [0.5, 1],
  },
  "zombie_boss": {
    nivelMin: 30,
    nivelMax: 30,
    spawnRate: 0.05,
    volador: false,
    tipo: "zombie",
    vidaMax: 200,
    vel: 0.005,
    delayAtaque: 25,
    fuerzaAtaque: 70,
    rango: 1,
    exp: 80,
    drops: ['boost_defensa'],
    dropRate: 1,
    escala: 1.25,
    offset: [0.5, 1],
    tinte: 0x673ab7,
    isBoss: true,
  },

  "esqueleto": {
    nivelMin: 30,
    nivelMax: 40,
    spawnRate: 1,
    volador: false,
    tipo: "esqueleto",
    vidaMax: 80,
    vel: 0.005,
    delayAtaque: 8,
    fuerzaAtaque: 16,
    rango: 0.5,
    exp: 30,
    drops: ['boost_fuerza'],
    dropRate: 0.2,
    escala: 0.85,
    offset: [0.5, 1],
  },
  "esqueleto_boss": {
    nivelMin: 40,
    nivelMax: 40,
    spawnRate: 0.05,
    volador: false,
    tipo: "esqueleto",
    vidaMax: 300,
    vel: 0.005,
    delayAtaque: 18,
    fuerzaAtaque: 80,
    rango: 1,
    exp: 100,
    drops: ['boost_fuerza'],
    dropRate: 1,
    escala: 1.25,
    offset: [0.5, 1],
    tinte: 0x673ab7,
    isBoss: true,
  },

  "imp": {
    nivelMin: 40,
    nivelMax: 60,
    spawnRate: 1,
    volador: false,
    tipo: "imp",
    vidaMax: 120,
    vel: 0.01,
    delayAtaque: 8,
    fuerzaAtaque: 25,
    rango: 0.5,
    exp: 45,
    drops: ['boost_resistencia'],
    dropRate: 0.2,
    escala: 0.6,
  },
  "imp_boss": {
    nivelMin: 60,
    nivelMax: 60,
    spawnRate: 0.05,
    volador: false,
    tipo: "imp",
    vidaMax: 400,
    vel: 0.01,
    delayAtaque: 20,
    fuerzaAtaque: 90,
    rango: 0.75,
    exp: 150,
    drops: ['boost_resistencia'],
    dropRate: 1,
    escala: 1,
    tinte: 0x673ab7,
    isBoss: true,
  },

  "golem": {
    nivelMin: 60,
    nivelMax: 80,
    spawnRate: 1,
    volador: false,
    tipo: "golem",
    vidaMax: 250,
    vel: 0.005,
    delayAtaque: 15,
    fuerzaAtaque: 80,
    rango: 0.5,
    exp: 60,
    drops: ['boost_velocidad'],
    dropRate: 0.2,
    escala: 0.75,
    offset: [0.5, 1],
  },
  "golem_boss": {
    nivelMin: 80,
    nivelMax: 80,
    spawnRate: 0.05,
    volador: false,
    tipo: "golem",
    vidaMax: 600,
    vel: 0.005,
    delayAtaque: 30,
    fuerzaAtaque: 9999,
    rango: 0.75,
    exp: 250,
    drops: ['boost_velocidad'],
    dropRate: 1,
    escala: 1.25,
    offset: [0.5, 1],
    tinte: 0x673ab7,
    isBoss: true,
  },
};

var tiles_barrera = [0, 10, 11, 12, 13, 14, 15];
