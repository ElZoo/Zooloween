var scenePrecarga = new Phaser.Scene('precarga');
scenePrecarga.active = true;

scenePrecarga.init = function() {
  //crear lista de mobs
  this.lista_mobs = {
    "murcielago": {
      "volar": {
        end: 4,
        repeat: -1,
        frameRate: 8,
        reverse: false
      },
      "atacar": {
        end: 4,
        repeat: 0,
        frameRate: 8,
        reverse: true
      },
      "cargar": {
        end: 4,
        repeat: 0,
        frameRate: 8,
        reverse: false
      },
      "morir": {
        end: 4,
        repeat: 0,
        frameRate: 8,
        reverse: false
      },
    },
    "tostada": {
      "andar": {
        end: 3,
        repeat: -1,
        frameRate: 8,
        reverse: false
      },
      "atacar": {
        end: 6,
        repeat: 0,
        frameRate: 8,
        reverse: false
      },
      "cargar": {
        end: 3,
        repeat: 0,
        frameRate: 8,
        reverse: false
      },
      "morir": {
        end: 11,
        repeat: 0,
        frameRate: 8,
        reverse: false
      },
    },
    "araña": {
      "andar": {
        end: 5,
        repeat: -1,
        frameRate: 8,
        reverse: false
      },
      "atacar": {
        end: 4,
        repeat: 0,
        frameRate: 8,
        reverse: false
      },
      "cargar": {
        end: 0,
        repeat: 0,
        frameRate: 8,
        reverse: false
      },
      "morir": {
        end: 3,
        repeat: 0,
        frameRate: 8,
        reverse: false
      },
    },

    "calabaza": {
      "andar": {
        end: 2,
        repeat: -1,
        frameRate: 4,
        reverse: false
      },
      "atacar": {
        end: 2,
        repeat: 0,
        frameRate: 4,
        reverse: false
      },
      "cargar": {
        end: 2,
        repeat: 0,
        frameRate: 4,
        reverse: false
      },
      "morir": {
        end: 2,
        repeat: 0,
        frameRate: 4,
        reverse: false
      },
    },

    "fantasma": {
      "volar": {
        end: 4,
        repeat: -1,
        frameRate: 8,
        reverse: false
      },
      "atacar": {
        end: 4,
        repeat: 0,
        frameRate: 8,
        reverse: true
      },
      "cargar": {
        end: 4,
        repeat: 0,
        frameRate: 8,
        reverse: false
      },
      "morir": {
        end: 7,
        repeat: 0,
        frameRate: 8,
        reverse: false
      },
    },

    "zombie": {
      "andar": {
        end: 19,
        repeat: -1,
        frameRate: 16,
        reverse: false
      },
      "atacar": {
        end: 19,
        repeat: 0,
        frameRate: 32,
        reverse: false
      },
      "cargar": {
        end: 17,
        repeat: 0,
        frameRate: 16,
        reverse: false
      },
      "morir": {
        end: 12,
        repeat: 0,
        frameRate: 16,
        reverse: false
      },
    },
  };
}

scenePrecarga.preload = function() {
  //precargar las imágenes generales
  this.load.atlas('hud', 'res/hud.png', 'res/hud.json');
  this.load.atlas('dungeon', 'res/dungeon.png', 'res/dungeon.json');

  //precargar las imágenes de las armaduras
  this.load.atlas('pj_tela', 'res/pj/pj_tela.png', 'res/pj/pj_base.json');
  this.load.atlas('pj_cuero', 'res/pj/pj_cuero.png', 'res/pj/pj_base.json');
  this.load.atlas('pj_chain', 'res/pj/pj_chain.png', 'res/pj/pj_base.json');
  this.load.atlas('pj_hierro', 'res/pj/pj_hierro.png', 'res/pj/pj_base.json');
  this.load.atlas('pj_oro', 'res/pj/pj_oro.png', 'res/pj/pj_base.json');

  //precargar las imágenes de los items
  this.load.atlas('item_mano', 'res/items/item_mano.png', 'res/pj/pj_base.json');
  this.load.atlas('item_daga', 'res/items/item_daga.png', 'res/pj/pj_base.json');
  this.load.atlas('item_lanza', 'res/items/item_lanza.png', 'res/pj/pj_base.json');
  this.load.atlas('item_hacha', 'res/items/item_hacha.png', 'res/pj/pj_base.json');
  this.load.atlas('item_martillo', 'res/items/item_martillo.png', 'res/pj/pj_base.json');

  //precargar las imágenes de los mobs
  for(var mob in this.lista_mobs) {
    this.load.atlas(mob, 'res/mobs/'+mob+'.png', 'res/mobs/'+mob+'.json');
  }

  //precargar efectos
  this.load.atlas('efecto_subir_lvl', 'res/efectos/efecto_subir_lvl.png', 'res/efectos/efecto_subir_lvl.json');
  this.load.atlas('efecto_curar', 'res/efectos/efecto_curar.png', 'res/efectos/efecto_curar.json');

  //precargar sonidos
  this.load.audio('cancion', 'res/sonidos/cancion.ogg');
  this.load.audio('beber_pocion', 'res/sonidos/beber_pocion.ogg');
  this.load.audio('coger_item', 'res/sonidos/coger_item.ogg');
  this.load.audio('mob_dano', 'res/sonidos/mob_dano.ogg');
  this.load.audio('mob_muere', 'res/sonidos/mob_muere.ogg');
  this.load.audio('subir_lvl', 'res/sonidos/subir_lvl.ogg');
  this.load.audio('pj_dano', 'res/sonidos/pj_dano.ogg');
}

scenePrecarga.create = function() {
  //crear las animaciones
  this.crearPj();
  this.crearItems();
  this.crearMobs();
  this.crearEfectos();

  this.scene.launch('nick');
}

scenePrecarga.crearPj = function() {
  var self = this;

  //armaduras y direcciones de las animaciones
  var armaduras = ['pj_tela', 'pj_cuero', 'pj_chain', 'pj_hierro', 'pj_oro'];
  var anims = ['arriba', 'abajo', 'izquierda', 'derecha'];

  //configuración para las animaciones de correr
  var configAnim = {
    end: 8,
    repeat: -1,
    frameRate: 12
  };

  //configuración para las animaciones de atacar
  var configAtaque = {
    end: 5,
    repeat: 0,
    frameRate: 16
  }

  //crear animaciones para cada armadura
  armaduras.forEach(function(armadura) {
    //crear animaciones misc
    self.anims.create({key: `${armadura}_quieto`, frames: [0], repeat: -1});
    self.anims.create({key: `${armadura}_morir`, frames: self.anims.generateFrameNames(armadura, {prefix: 'morir_', end: 5}), repeat: 0, frameRate: 16});

    //crear animaciones para cada dirección
    anims.forEach(function(anim) {
      //animaciones de correr
      self.anims.create({
        key: `${armadura}_${anim}`,
        frames: self.anims.generateFrameNames(armadura, {prefix: `${anim}_`, end: configAnim.end}),
        repeat: configAnim.repeat,
        frameRate: configAnim.frameRate
      });

      //animaciones de atacar
      self.anims.create({
        key: `${armadura}_atacar_${anim}`,
        frames: self.anims.generateFrameNames(armadura, {prefix: `atacar_${anim}_`, end: configAtaque.end}),
        repeat: configAtaque.repeat,
        frameRate: configAtaque.frameRate
      });

      //animaciones de lanzas
      self.anims.create({
        key: `${armadura}_lanza_${anim}`,
        frames: self.anims.generateFrameNames(armadura, {prefix: `lanza_${anim}_`, end: 7}),
        repeat: configAtaque.repeat,
        frameRate: configAtaque.frameRate
      });
    });
  });
}

scenePrecarga.crearItems = function() {
  var self = this;

  //items y direcciones de las animaciones
  var items = ['item_mano', 'item_daga', 'item_lanza', 'item_hacha', 'item_martillo'];
  var anims = ['abajo', 'arriba', 'izquierda', 'derecha'];

  //configuración para las animaciones de correr
  var configAnim = {
    end: 8,
    repeat: -1,
    frameRate: 12
  };

  //configuración para las animaciones de atacar
  var configAtaque = {
    end: 5,
    repeat: 0,
    frameRate: 16
  }

  //crear animaciones para cada item
  items.forEach(function(item) {
    //crear animaciones para cada dirección
    anims.forEach(function(anim) {
      //animaciones de correr
      self.anims.create({
        key: `${item}_${anim}`,
        frames: self.anims.generateFrameNames(item, {prefix: `${anim}_`, end: configAnim.end}),
        repeat: configAnim.repeat,
        frameRate: configAnim.frameRate
      });

      //animaciones de atacar
      self.anims.create({
        key: `${item}_ataque_${anim}`,
        frames: self.anims.generateFrameNames(item, {prefix: `atacar_${anim}_`, end: configAtaque.end}),
        repeat: configAtaque.end,
        frameRate: configAtaque.frameRate
      });

      //animaciones de lanzas
      self.anims.create({
        key: `${item}_lanza_${anim}`,
        frames: self.anims.generateFrameNames(item, {prefix: `lanza_${anim}_`, end: 7}),
        repeat: configAtaque.repeat,
        frameRate: configAtaque.frameRate
      });
    });
  });
}

scenePrecarga.crearMobs = function() {
  //generar animaciones de los mobs
  for(var mob_id in this.lista_mobs) {
    var mob = this.lista_mobs[mob_id];
    for(var anim_id in mob) {
      var anim = mob[anim_id];
      this.anims.create({
        key: mob_id+"_"+anim_id,
        frames: this.anims.generateFrameNames(mob_id, {prefix: anim_id+"_", end: anim.end}),
        repeat: anim.repeat,
        frameRate: anim.frameRate,
        reverse: anim.reverse
      });
    }
  }
}

scenePrecarga.crearEfectos = function() {
  //animaciones de efectos
  this.anims.create({key: 'efecto_subir_lvl', frames: this.anims.generateFrameNames('efecto_subir_lvl', {prefix: 'efecto_subir_lvl_', end: 48}), repeat: 0, frameRate: 60});
  this.anims.create({key: 'efecto_curar', frames: this.anims.generateFrameNames('efecto_curar', {prefix: 'curar_', end: 3}), repeat: 0, frameRate: 8});
  this.anims.create({key: 'boost_velocidad', frames: this.anims.generateFrameNames('efecto_curar', {prefix: 'boost_velocidad_', end: 3}), repeat: 0, frameRate: 8});
  this.anims.create({key: 'boost_fuerza', frames: this.anims.generateFrameNames('efecto_curar', {prefix: 'boost_fuerza_', end: 3}), repeat: 0, frameRate: 8});
  this.anims.create({key: 'boost_defensa', frames: this.anims.generateFrameNames('efecto_curar', {prefix: 'boost_defensa_', end: 3}), repeat: 0, frameRate: 8});
}
