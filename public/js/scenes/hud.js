var sceneHud = new Phaser.Scene('hud');

sceneHud.init = function() {

}

sceneHud.create = function() {
  var ataque_principal = this.add.image(-8-1, 0, 'hud', 'boton')
  var ataque_secundario = this.add.image(8+1, 0, 'hud', 'boton')
  var container = this.add.container(640, 650, [ataque_principal, ataque_secundario]).setScale(4, 4);
}

sceneHud.update = function() {

}
