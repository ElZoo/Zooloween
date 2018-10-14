var sceneFinal = new Phaser.Scene('final');

sceneFinal.create = function() {
  var self = this;

  this.scene.stop('hud');
  this.scene.stop('precarga');
  this.scene.stop('principal');

  this.add.text(640, 360, 'Has perdido :(', {align: 'center'}).setOrigin(0.5, 0.5);

  var boton = this.add.sprite(640, 420, 'hud', 'boton_ancho').setScale(4, 4).setOrigin(0.5, 0.5).setInteractive();
  var texto = this.add.text(640, 420, '¿Reinciar?', {align: 'center'}).setOrigin(0.5, 0.5);

  boton.on('pointerdown', function(pointer) {
    location.reload();
  });
  boton.on('pointerin', function(pointer) {
    this.setFrame('boton_ancho_sel');
  });
  boton.on('pointerout', function(pointer) {
    this.setFrame('boton_ancho');
  });
}
