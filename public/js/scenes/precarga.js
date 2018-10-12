var scenePrecarga = new Phaser.Scene('precarga');
scenePrecarga.active = true;

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
  this.load.atlas('murcielago', 'res/murcielago.png', 'res/murcielago.json');

  //precargar efectos
  this.load.atlas('efecto_subir_lvl', 'res/efecto_subir_lvl.png', 'res/efecto_subir_lvl.json');
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
  this.crearEfectos();
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
    self.anims.create({key: `${armadura}_morir`, frames: self.anims.generateFrameNames(armadura, {prefix: 'morir_', end: 5}), repeat: -1, frameRate: 16});

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
  //animaciones del murciélago
  this.anims.create({key: 'murcielago_volar', frames: this.anims.generateFrameNames('murcielago', {prefix: 'volar_', end: 4}), repeat: -1, frameRate: 8});
  this.anims.create({key: 'murcielago_morir', frames: this.anims.generateFrameNames('murcielago', {prefix: 'morir_', end: 4}), repeat: 0, frameRate: 8});
  this.anims.create({key: 'murcielago_cargar', frames: this.anims.generateFrameNames('murcielago', {prefix: 'cargar_', end: 4}), repeat: 0, frameRate: 8});
  this.anims.create({key: 'murcielago_atacar', frames: this.anims.generateFrameNames('murcielago', {prefix: 'atacar_', end: 4}), reverse: true, repeat: 0, frameRate: 8});
}

scenePrecarga.crearEfectos = function() {
  //animaciones de efectos
  this.anims.create({key: 'efecto_subir_lvl', frames: this.anims.generateFrameNames('efecto_subir_lvl', {prefix: 'efecto_subir_lvl_', end: 48}), repeat: 0, frameRate: 60});
}
