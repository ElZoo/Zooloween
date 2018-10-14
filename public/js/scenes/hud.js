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

  var boton2 = this.add.image(8+1, 0, 'hud', 'boton').setInteractive();
  var boton1 = this.add.image(-8-1, 0, 'hud', 'boton').setInteractive();
  container.add(boton2);
  container.add(boton1);

  this.ataque_principal = this.add.sprite(-8-1, 0, 'hud', this.game.datos.jugador.arma).setScale(0.25, 0.25);
  container.add(this.ataque_principal);
  container.add(this.add.text(-16-1, 8+1, "Clic Izq.",  {align: 'center'}).setScale(0.2, 0.2));

  this.circulo_principal = this.add.graphics();
  container.add(this.circulo_principal);

  this.armadura = this.add.sprite(8+1, 0, 'hud', this.game.datos.jugador.armadura).setScale(0.25, 0.25);
  container.add(this.armadura);

  var infoDano = this.add.container(0, 0).setScale(1.5, 1.5);

  infoDano.add(this.add.sprite(0, 0, 'hud', 'boton_grande').setScale(6, 2));
  infoDano.visible = false;
  infoDano.getAt(0).alpha = 0.8;

  var nombresArma = {
    'item_mano': 'Puño',
    'item_daga': 'Daga',
    'item_lanza': 'Lanza',
    'item_hacha': 'Hacha',
    'item_martillo': 'Martillo'
  };
  var velocidades = {
    'item_mano': 'normal',
    'item_daga': 'muy rápida',
    'item_lanza': 'rápida',
    'item_hacha': 'rápida',
    'item_martillo': 'lenta'
  };

  infoDano.add(this.add.text(-78, -28, nombresArma[self.game.datos.jugador.arma], {strokeThickness: 0.75}).setScale(0.8, 0.8));
  infoDano.add(this.add.text(-78, -18, 'Velocidad: ' + velocidades[self.game.datos.jugador.arma]).setScale(0.8, 0.8));
  infoDano.add(this.add.text(-78, -8, 'Daño: ' + self.game.datos.jugador.fuerzaAtaque).setScale(0.8, 0.8));
  infoDano.add(this.add.text(-78, 2, 'Prob. crítico: ' + self.game.datos.jugador.probCrit * 100 + '%').setScale(0.8, 0.8));
  infoDano.add(this.add.text(-78, 12, 'Rango: ' + self.game.datos.jugador.rangoAtaque).setScale(0.8, 0.8));

  var infoArmadura = this.add.container(0, 0).setScale(1.5, 1.5);

  infoArmadura.add(this.add.sprite(0, 0, 'hud', 'boton_grande').setScale(5, 2));
  infoArmadura.visible = false;
  infoArmadura.getAt(0).alpha = 0.8;

  var nombresArmaduras = {
    'pj_tela': 'Ropa protectora',
    'pj_cuero': 'Jugón',
    'pj_chain': 'Armadura de cota',
    'pj_hierro': 'Armadura metálica',
    'pj_oro': 'Armadura dorada'
  };

  infoArmadura.add(this.add.text(-64, -28, nombresArmaduras[self.game.datos.jugador.armadura], {strokeThickness: 0.75}).setScale(0.8, 0.8));
  infoArmadura.add(this.add.text(-64, -16, 'Defensa: ' + self.game.datos.jugador.defensa * 100 + '%').setScale(0.8, 0.8));
  infoArmadura.add(this.add.text(-64, -4, 'Vida máxima: ' + self.game.datos.jugador.vidaMax).setScale(0.8, 0.8));

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
    this.containerArribaIzq.getAt(1).text = 'Experiencia: ' + this.game.datos.jugador.exp + "/" + calcularExpMaxNivel(this.game.datos.jugador.nivel);
  }, this);

  this.scene.get('principal').events.on('subirExp', function(exp) {
    this.containerArribaIzq.getAt(1).text = 'Experiencia: ' + this.game.datos.jugador.exp + "/" + calcularExpMaxNivel(this.game.datos.jugador.nivel);
  }, this);

  this.scene.get('principal').events.on('nuevoJugador', function() {
    this.containerArribaDer.getAt(0).text = 'Jugadores: ' + Object.keys(this.game.datos.jugadores).length;
  }, this);

  this.scene.get('principal').events.on('matarJugador', function() {
    this.containerArribaDer.getAt(0).text = 'Jugadores: ' + Object.keys(this.game.datos.jugadores).length;
  }, this);

  this.input.on('pointerover', function(event, objects) {
    if(objects[0] == boton1) {
      infoDano.x = this.input.mousePointer.x;
      infoDano.y = this.input.mousePointer.y;

      infoDano.getAt(1).text = nombresArma[self.game.datos.jugador.arma];
      infoDano.getAt(2).text = 'Velocidad: ' + velocidades[self.game.datos.jugador.arma];
      infoDano.getAt(3).text = 'Daño: ' + self.game.datos.jugador.fuerzaAtaque;
      infoDano.getAt(4).text = 'Prob. crítico: ' + self.game.datos.jugador.probCrit * 100 + '%';
      infoDano.getAt(5).text = 'Rango: ' + self.game.datos.jugador.rangoAtaque;

      infoDano.visible = true;
    } else {
      infoArmadura.x = this.input.mousePointer.x;
      infoArmadura.y = this.input.mousePointer.y;

      infoArmadura.getAt(1).text = nombresArmaduras[self.game.datos.jugador.armadura];
      infoArmadura.getAt(2).text = 'Defensa: ' + self.game.datos.jugador.defensa * 100 + '%';
      infoArmadura.getAt(3).text = 'Vida máxima: ' + self.game.datos.jugador.vidaMax;

      infoArmadura.visible = true;
    }
  }, this);

  this.input.on('pointerout', function(event, objects) {
    if(objects[0] == boton1) {
      infoDano.visible = false;
    } else {
      infoArmadura.visible = false;
    }
  }, this)

}

function calcularExpMaxNivel(nivel) {
  return Math.round(nivel + nivel*1.25 + 3);
}
