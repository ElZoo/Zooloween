var scenePrecarga = new Phaser.Scene('precarga');
scenePrecarga.active = true;

scenePrecarga.preload = function() {
  //precargar las imágenes generales
  this.load.atlas('hud', 'res/hud.png', 'res/hud.json');
  this.load.atlas('dungeon', 'res/dungeon.png', 'res/dungeon.json');
  this.load.atlas('pj_base', 'res/pj_base.png', 'res/pj_base.json');

  //precargar las imágenes de los items
  this.load.atlas('item_mano', 'res/item_mano.png', 'res/item_mano.json');
  this.load.atlas('item_daga', 'res/item_daga.png', 'res/item_daga.json');
  this.load.atlas('item_espada', 'res/item_espada.png', 'res/item_espada.json');
  this.load.atlas('item_espada_plus', 'res/item_espada_plus.png', 'res/item_espada_plus.json');

  //precargar las imágenes de los mobs
  this.load.atlas('murcielago', 'res/murcielago.png', 'res/murcielago.json');
}

scenePrecarga.create = function() {
  var self = this;

  //crear conexión con el servidor
  this.game.datos = {};
  this.game.datos.socket = io();

  //al recibir los datos del server (items, tiles, players y mobs), lanzar los scenes
  this.game.datos.socket.on('datosMapa', function(datos) {
    self.game.datos.jugadores = datos[0];
    self.game.datos.mobs = datos[1];
    self.game.datos.tiles_mundo = datos[2];
    self.game.datos.items_mundo = datos[3];

    self.scene.launch('principal');
    self.scene.launch('hud');
  });

  //crear las animaciones
  this.crearPj();
  this.crearItems();
  this.crearMobs();
}

scenePrecarga.crearPj = function() {
  //animaciones del jugador
  this.anims.create({key: 'pj_quieto', frames: [0], repeat: -1});
  this.anims.create({key: 'pj_arriba', frames: this.anims.generateFrameNames('pj_base', {prefix: 'arriba_', end: 7}), repeat: -1, frameRate: 8});
  this.anims.create({key: 'pj_abajo', frames: this.anims.generateFrameNames('pj_base', {prefix: 'abajo_', end: 7}), repeat: -1, frameRate: 8});
  this.anims.create({key: 'pj_izquierda', frames: this.anims.generateFrameNames('pj_base', {prefix: 'izquierda_', end: 7}), repeat: -1, frameRate: 8});
  this.anims.create({key: 'pj_derecha', frames: this.anims.generateFrameNames('pj_base', {prefix: 'derecha_', end: 7}), repeat: -1, frameRate: 8});
  this.anims.create({key: 'pj_atacar_arriba', frames: this.anims.generateFrameNames('pj_base', {prefix: 'atacar_arriba_', end: 5}), repeat: 0, frameRate: 16});
  this.anims.create({key: 'pj_atacar_abajo', frames: this.anims.generateFrameNames('pj_base', {prefix: 'atacar_abajo_', end: 5}), repeat: 0, frameRate: 16});
  this.anims.create({key: 'pj_atacar_izquierda', frames: this.anims.generateFrameNames('pj_base', {prefix: 'atacar_izquierda_', end: 5}), repeat: 0, frameRate: 16});
  this.anims.create({key: 'pj_atacar_derecha', frames: this.anims.generateFrameNames('pj_base', {prefix: 'atacar_derecha_', end: 5}), repeat: 0, frameRate: 16});
}

scenePrecarga.crearItems = function() {
  var self = this;

  //items y direcciones de las animaciones
  var items = ['item_mano', 'item_daga', 'item_espada', 'item_espada_plus'];
  var anims = ['abajo', 'arriba', 'izquierda', 'derecha'];

  //configuración para las animaciones de correr
  var configAnim = {
    end: 7,
    repeat: -1,
    frameRate: 8
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
        frames: self.anims.generateFrameNames(item, {prefix: `ataque_${anim}_`, end: configAtaque.end}),
        repeat: configAtaque.end,
        frameRate: configAtaque.frameRate
      });
    });
  });
}

scenePrecarga.crearMobs = function() {
  //animaciones del murciélago
  this.anims.create({key: 'murcielago_volar', frames: this.anims.generateFrameNames('murcielago', {prefix: 'volar_', end: 4}), repeat: -1, frameRate: 8});
  this.anims.create({key: 'murcielago_morir', frames: this.anims.generateFrameNames('murcielago', {prefix: 'morir_', end: 4}), repeat: 0, frameRate: 8});
}
