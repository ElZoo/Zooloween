var scenePrecarga = {
  key: 'precarga',
  active: true,

  init: function() {
    var self = this;

    this.game.datos = {};
    this.game.datos.socket = io();
    this.game.datos.socket.on('datosMapa', function(datos) {
      self.game.datos.jugadores = datos[0];
      self.game.datos.tiles_mundo = datos[1];
      self.game.datos.items_mundo = datos[2];
    });
  },

  preload: function() {
    this.load.atlas('dungeon', 'res/dungeon.png', 'res/dungeon.json');
  },

  create: function() {
    this.scene.launch('principal');
  },
}
