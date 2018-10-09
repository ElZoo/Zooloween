var sceneHud = new Phaser.Scene('hud');

sceneHud.init = function() {
  var containerNivel;
}

sceneHud.create = function() {
  containerNivel = this.add.container(10, 10).setScale(1.5, 1.5);
  containerNivel.add(this.add.text(0, 0, "Nivel: " + this.game.datos.jugador.nivel));
  containerNivel.add(this.add.text(0, 15, "Experiencia: " + this.game.datos.jugador.exp + "/" + calcularExpMaxNivel(this.game.datos.jugador.exp)).setScale(0.8, 0.8));

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
  this.game.datos.socket.on('subirLvl', function(jugador) {
    containerNivel.getAt(0).text = 'Nivel: ' + jugador.nivel;
  });

  this.game.datos.socket.on('subirExp', function(jugador) {
    containerNivel.getAt(1).text = 'Experiencia: ' + jugador.exp + "/" + calcularExpMaxNivel(jugador.nivel);
  });
}

function calcularExpMaxNivel(nivel) {
  return Math.round(nivel + nivel*1.25 + 3);
}
