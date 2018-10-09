var sceneHud = new Phaser.Scene('hud');

sceneHud.init = function() {

}

sceneHud.create = function() {
  var container = this.add.container(640, 650).setScale(4, 4);

  container.add(this.add.image(8+1, 0, 'hud', 'boton'));
  container.add(this.add.image(-8-1, 0, 'hud', 'boton'));

  var ataque_principal = this.add.image(-8-1, 0, 'hud', this.game.datos.jugador.arma).setScale(0.25, 0.25);
  container.add(ataque_principal);
  container.add(this.add.text(-16-1, 8+1, "Clic Izq.",  {align: 'center'}).setScale(0.2, 0.2));

  this.circulo_principal = this.add.graphics();
  container.add(this.circulo_principal);

  this.scene.get('principal').events.on('click_principal', function() {
    this.tweens.addCounter({
      from: 0.25,
      to: 0.2,
      yoyo: true,
      duration: self.game.datos.jugador.delayAtaque * 5,
      onUpdate: function(tween) {
        ataque_principal.setScale(tween.getValue(), tween.getValue());
      },
    });
  }, this);

  this.scene.get('principal').events.on('ataque_principal', function() {
    var self = this;
    this.tweens.addCounter({
      from: 0,
      to: 360,
      duration: self.game.datos.jugador.delayAtaque * 10,
      onUpdate: function(tween) {
        var t = tween.getValue();
        self.circulo_principal.clear();
        self.circulo_principal.fillStyle(0x000000, 0.5);
        self.circulo_principal.slice(-8-1, 0, 6, 0, Phaser.Math.DegToRad(t), true);
        self.circulo_principal.fillPath();
      },
      onComplete: function(tween) {
        self.circulo_principal.clear();
      }
    });
  }, this);
}

sceneHud.update = function() {

}
