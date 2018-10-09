var scenePrecarga = {
  key: 'precarga',
  active: true,

  init: function() {

  },

  preload: function() {
    this.load.atlas('hud', 'res/hud.png', 'res/hud.json');
    this.load.atlas('dungeon', 'res/dungeon.png', 'res/dungeon.json');

    this.load.atlas('pj_base', 'res/pj_base.png', 'res/pj_base.json');
    this.load.atlas('item_mano', 'res/item_mano.png', 'res/item_mano.json');
    this.load.atlas('item_daga', 'res/item_daga.png', 'res/item_daga.json');
    this.load.atlas('item_espada', 'res/item_espada.png', 'res/item_espada.json');
    this.load.atlas('item_espada_plus', 'res/item_espada_plus.png', 'res/item_espada_plus.json');

    this.load.atlas('murcielago', 'res/murcielago.png', 'res/murcielago.json');
  },

  create: function() {
    var self = this;

    this.game.datos = {};
    this.game.datos.socket = io();
    this.game.datos.socket.on('datosMapa', function(datos) {
      self.game.datos.jugadores = datos[0];
      self.game.datos.mobs = datos[1];
      self.game.datos.tiles_mundo = datos[2];
      self.game.datos.items_mundo = datos[3];

      self.scene.launch('principal');
      self.scene.launch('hud');
    });

    this.anims.create({key: 'pj_quieto', frames: [0], repeat: -1});
    this.anims.create({key: 'pj_arriba', frames: this.anims.generateFrameNames('pj_base', {prefix: 'arriba_', end: 7}), repeat: -1, frameRate: 8});
    this.anims.create({key: 'pj_abajo', frames: this.anims.generateFrameNames('pj_base', {prefix: 'abajo_', end: 7}), repeat: -1, frameRate: 8});
    this.anims.create({key: 'pj_izquierda', frames: this.anims.generateFrameNames('pj_base', {prefix: 'izquierda_', end: 7}), repeat: -1, frameRate: 8});
    this.anims.create({key: 'pj_derecha', frames: this.anims.generateFrameNames('pj_base', {prefix: 'derecha_', end: 7}), repeat: -1, frameRate: 8});
    this.anims.create({key: 'pj_atacar_arriba', frames: this.anims.generateFrameNames('pj_base', {prefix: 'atacar_arriba_', end: 5}), repeat: 0, frameRate: 16});
    this.anims.create({key: 'pj_atacar_abajo', frames: this.anims.generateFrameNames('pj_base', {prefix: 'atacar_abajo_', end: 5}), repeat: 0, frameRate: 16});
    this.anims.create({key: 'pj_atacar_izquierda', frames: this.anims.generateFrameNames('pj_base', {prefix: 'atacar_izquierda_', end: 5}), repeat: 0, frameRate: 16});
    this.anims.create({key: 'pj_atacar_derecha', frames: this.anims.generateFrameNames('pj_base', {prefix: 'atacar_derecha_', end: 5}), repeat: 0, frameRate: 16});

    this.anims.create({key: 'item_mano_abajo', frames: this.anims.generateFrameNames('item_mano', {prefix: 'abajo_', end: 7}), repeat: -1, frameRate: 8});
    this.anims.create({key: 'item_mano_arriba', frames: this.anims.generateFrameNames('item_mano', {prefix: 'arriba_', end: 7}), repeat: -1, frameRate: 8});
    this.anims.create({key: 'item_mano_izquierda', frames: this.anims.generateFrameNames('item_mano', {prefix: 'izquierda_', end: 7}), repeat: -1, frameRate: 8});
    this.anims.create({key: 'item_mano_derecha', frames: this.anims.generateFrameNames('item_mano', {prefix: 'derecha_', end: 7}), repeat: -1, frameRate: 8});
    this.anims.create({key: 'item_mano_ataque_abajo', frames: this.anims.generateFrameNames('item_mano', {prefix: 'ataque_abajo_', end: 5}), repeat: 0, frameRate: 16});
    this.anims.create({key: 'item_mano_ataque_arriba', frames: this.anims.generateFrameNames('item_mano', {prefix: 'ataque_arriba_', end: 5}), repeat: 0, frameRate: 16});
    this.anims.create({key: 'item_mano_ataque_izquierda', frames: this.anims.generateFrameNames('item_mano', {prefix: 'ataque_izquierda_', end: 5}), repeat: 0, frameRate: 16});
    this.anims.create({key: 'item_mano_ataque_derecha', frames: this.anims.generateFrameNames('item_mano', {prefix: 'ataque_derecha_', end: 5}), repeat: 0, frameRate: 16});

    this.anims.create({key: 'item_daga_abajo', frames: this.anims.generateFrameNames('item_daga', {prefix: 'abajo_', end: 7}), repeat: -1, frameRate: 8});
    this.anims.create({key: 'item_daga_arriba', frames: this.anims.generateFrameNames('item_daga', {prefix: 'arriba_', end: 7}), repeat: -1, frameRate: 8});
    this.anims.create({key: 'item_daga_izquierda', frames: this.anims.generateFrameNames('item_daga', {prefix: 'izquierda_', end: 7}), repeat: -1, frameRate: 8});
    this.anims.create({key: 'item_daga_derecha', frames: this.anims.generateFrameNames('item_daga', {prefix: 'derecha_', end: 7}), repeat: -1, frameRate: 8});
    this.anims.create({key: 'item_daga_ataque_abajo', frames: this.anims.generateFrameNames('item_daga', {prefix: 'ataque_abajo_', end: 5}), repeat: 0, frameRate: 16});
    this.anims.create({key: 'item_daga_ataque_arriba', frames: this.anims.generateFrameNames('item_daga', {prefix: 'ataque_arriba_', end: 5}), repeat: 0, frameRate: 16});
    this.anims.create({key: 'item_daga_ataque_izquierda', frames: this.anims.generateFrameNames('item_daga', {prefix: 'ataque_izquierda_', end: 5}), repeat: 0, frameRate: 16});
    this.anims.create({key: 'item_daga_ataque_derecha', frames: this.anims.generateFrameNames('item_daga', {prefix: 'ataque_derecha_', end: 5}), repeat: 0, frameRate: 16});

    this.anims.create({key: 'item_espada_abajo', frames: this.anims.generateFrameNames('item_espada', {prefix: 'abajo_', end: 7}), repeat: -1, frameRate: 8});
    this.anims.create({key: 'item_espada_arriba', frames: this.anims.generateFrameNames('item_espada', {prefix: 'arriba_', end: 7}), repeat: -1, frameRate: 8});
    this.anims.create({key: 'item_espada_izquierda', frames: this.anims.generateFrameNames('item_espada', {prefix: 'izquierda_', end: 7}), repeat: -1, frameRate: 8});
    this.anims.create({key: 'item_espada_derecha', frames: this.anims.generateFrameNames('item_espada', {prefix: 'derecha_', end: 7}), repeat: -1, frameRate: 8});
    this.anims.create({key: 'item_espada_ataque_abajo', frames: this.anims.generateFrameNames('item_espada', {prefix: 'ataque_abajo_', end: 5}), repeat: 0, frameRate: 16});
    this.anims.create({key: 'item_espada_ataque_arriba', frames: this.anims.generateFrameNames('item_espada', {prefix: 'ataque_arriba_', end: 5}), repeat: 0, frameRate: 16});
    this.anims.create({key: 'item_espada_ataque_izquierda', frames: this.anims.generateFrameNames('item_espada', {prefix: 'ataque_izquierda_', end: 5}), repeat: 0, frameRate: 16});
    this.anims.create({key: 'item_espada_ataque_derecha', frames: this.anims.generateFrameNames('item_espada', {prefix: 'ataque_derecha_', end: 5}), repeat: 0, frameRate: 16});

    this.anims.create({key: 'item_espada_plus_abajo', frames: this.anims.generateFrameNames('item_espada_plus', {prefix: 'abajo_', end: 7}), repeat: -1, frameRate: 8});
    this.anims.create({key: 'item_espada_plus_arriba', frames: this.anims.generateFrameNames('item_espada_plus', {prefix: 'arriba_', end: 7}), repeat: -1, frameRate: 8});
    this.anims.create({key: 'item_espada_plus_izquierda', frames: this.anims.generateFrameNames('item_espada_plus', {prefix: 'izquierda_', end: 7}), repeat: -1, frameRate: 8});
    this.anims.create({key: 'item_espada_plus_derecha', frames: this.anims.generateFrameNames('item_espada_plus', {prefix: 'derecha_', end: 7}), repeat: -1, frameRate: 8});
    this.anims.create({key: 'item_espada_plus_ataque_abajo', frames: this.anims.generateFrameNames('item_espada_plus', {prefix: 'ataque_abajo_', end: 5}), repeat: 0, frameRate: 16});
    this.anims.create({key: 'item_espada_plus_ataque_arriba', frames: this.anims.generateFrameNames('item_espada_plus', {prefix: 'ataque_arriba_', end: 5}), repeat: 0, frameRate: 16});
    this.anims.create({key: 'item_espada_plus_ataque_izquierda', frames: this.anims.generateFrameNames('item_espada_plus', {prefix: 'ataque_izquierda_', end: 5}), repeat: 0, frameRate: 16});
    this.anims.create({key: 'item_espada_plus_ataque_derecha', frames: this.anims.generateFrameNames('item_espada_plus', {prefix: 'ataque_derecha_', end: 5}), repeat: 0, frameRate: 16});

    this.anims.create({key: 'murcielago_volar', frames: this.anims.generateFrameNames('murcielago', {prefix: 'volar_', end: 4}), repeat: -1, frameRate: 8});
    this.anims.create({key: 'murcielago_morir', frames: this.anims.generateFrameNames('murcielago', {prefix: 'morir_', end: 4}), repeat: 0, frameRate: 8});
  },
}
