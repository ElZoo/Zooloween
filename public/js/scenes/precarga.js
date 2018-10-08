var scenePrecarga = {
  key: 'precarga',
  active: true,

  init: function() {

  },

  preload: function() {
    this.load.atlas('hud', 'res/hud.png', 'res/hud.json');
    this.load.atlas('dungeon', 'res/dungeon.png', 'res/dungeon.json');
    this.load.atlas('pj_base', 'res/pj_base.png', 'res/pj_base.json');
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
    this.anims.create({key: 'pj_arriba', frames: this.anims.generateFrameNames('pj_base', {prefix: 'arriba_', end: 3}), repeat: -1, frameRate: 4});
    this.anims.create({key: 'pj_abajo', frames: this.anims.generateFrameNames('pj_base', {prefix: 'abajo_', end: 3}), repeat: -1, frameRate: 4});
    this.anims.create({key: 'pj_izquierda', frames: this.anims.generateFrameNames('pj_base', {prefix: 'izquierda_', end: 3}), repeat: -1, frameRate: 4});
    this.anims.create({key: 'pj_derecha', frames: this.anims.generateFrameNames('pj_base', {prefix: 'derecha_', end: 3}), repeat: -1, frameRate: 4});
    this.anims.create({key: 'pj_atacar_arriba', frames: this.anims.generateFrameNames('pj_base', {prefix: 'atacar_arriba_', end: 1}), repeat: 0, frameRate: 4});
    this.anims.create({key: 'pj_atacar_abajo', frames: this.anims.generateFrameNames('pj_base', {prefix: 'atacar_abajo_', end: 1}), repeat: 0, frameRate: 4});
    this.anims.create({key: 'pj_atacar_izquierda', frames: this.anims.generateFrameNames('pj_base', {prefix: 'atacar_izquierda_', end: 1}), repeat: 0, frameRate: 4});
    this.anims.create({key: 'pj_atacar_derecha', frames: this.anims.generateFrameNames('pj_base', {prefix: 'atacar_derecha_', end: 1}), repeat: 0, frameRate: 4});

    this.anims.create({key: 'murcielago_volar', frames: this.anims.generateFrameNames('murcielago', {prefix: 'volar_', end: 4}), repeat: -1, frameRate: 8});
    this.anims.create({key: 'murcielago_morir', frames: this.anims.generateFrameNames('murcielago', {prefix: 'morir_', end: 4}), repeat: 0, frameRate: 8});
  },
}
