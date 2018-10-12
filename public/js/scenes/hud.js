var sceneHud = new Phaser.Scene('hud');

sceneHud.init = function() {
  this.containerArribaIzq;
  this.containerArribaDer;
}

sceneHud.create = function() {
  var self = this;

  this.containerArribaIzq = this.add.container(10, 10).setScale(1.5, 1.5);
  this.containerArribaIzq.add(this.add.text(0, 0, "Nivel: " + this.game.datos.jugador.nivel));
  this.containerArribaIzq.add(this.add.text(0, 15, "Experiencia: " + this.game.datos.jugador.exp + "/" + calcularExpMaxNivel(this.game.datos.jugador.exp)).setScale(0.8, 0.8));

  this.containerArribaDer = this.add.container(this.game.config.width-220, 10).setScale(1.5, 1.5);
  this.containerArribaDer.add(this.add.text(0, 0, "Jugadores: " + Object.keys(this.game.datos.jugadores).length));

  var container = this.add.container(640, 650).setScale(4, 4);

  container.add(this.add.image(8+1, 0, 'hud', 'boton'));
  container.add(this.add.image(-8-1, 0, 'hud', 'boton'));

  this.ataque_principal = this.add.sprite(-8-1, 0, 'hud', this.game.datos.jugador.arma).setScale(0.25, 0.25);
  container.add(this.ataque_principal);
  container.add(this.add.text(-16-1, 8+1, "Clic Izq.",  {align: 'center'}).setScale(0.2, 0.2));

  this.circulo_principal = this.add.graphics();
  container.add(this.circulo_principal);

  this.armadura = this.add.sprite(8+1, 0, 'hud', this.game.datos.jugador.armadura).setScale(0.25, 0.25);
  container.add(this.armadura);

  this.scene.get('principal').events.on('click_principal', function() {
    var self = this;
    this.tweens.addCounter({
      from: 0.25,
      to: 0.2,
      yoyo: true,
      duration: self.game.datos.jugador.delayAtaque * 5,
      onUpdate: function(tween) {
        self.ataque_principal.setScale(tween.getValue(), tween.getValue());
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

  this.scene.get('principal').events.on('cambio_de_arma', function(arma) {
    this.ataque_principal.setFrame(arma);
  }, this);
  this.scene.get('principal').events.on('cambio_de_armadura', function(armadura) {
    this.armadura.setFrame(armadura);
  }, this);

  this.scene.get('principal').events.on('subirLvl', function(lvl) {
    this.containerArribaIzq.getAt(0).text = 'Nivel: ' + lvl;
  }, this);

  this.scene.get('principal').events.on('subirExp', function(exp) {
    this.containerArribaIzq.getAt(1).text = 'Experiencia: ' + exp + "/" + calcularExpMaxNivel(this.game.datos.jugador.nivel);
  }, this);

  this.scene.get('principal').events.on('nuevoJugador', function() {
    this.containerArribaDer.getAt(0).text = 'Jugadores: ' + Object.keys(this.game.datos.jugadores).length;
  }, this);

  this.scene.get('principal').events.on('matarJugador', function() {
    this.containerArribaDer.getAt(0).text = 'Jugadores: ' + Object.keys(this.game.datos.jugadores).length;
  }, this);
}

function calcularExpMaxNivel(nivel) {
  return Math.round(nivel + nivel*1.25 + 3);
}
