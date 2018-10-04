var scenePrecarga = {
  key: 'precarga',
  active: true,

  init: function() {
    this.socket = io();
  },

  preload: function() {
    this.load.atlas('dungeon', 'res/dungeon.png', 'res/dungeon.json');
  },

  create: function() {
    this.scene.launch('principal');
  },
}
