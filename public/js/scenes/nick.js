var sceneNick = new Phaser.Scene('nick');

sceneNick.create = function() {
  var self = this;

  this.comenzando = false;

  var ct = this.add.container(0, 0);
  ct.add(this.add.image(0, 0, 'hud', 'boton_grande').setScale(8, 8).setAngle(90));
  ct.add(this.add.text(0, -60, 'Introduce tu nick:', {align: 'center', fontSize: '18px', strokeThickness: 1}).setOrigin(0.5, 0.5));
  ct.add(this.add.image(0, -20, 'hud', 'caja_texto').setScale(4, 4));
  this.texto = this.add.text(0, -20, '', {align: 'center', color: '#000000'}).setOrigin(0.5, 0.5);
  ct.add(this.texto);

  this.texto_error = this.add.text(0, 10, '', {align: 'center', color: '#ff9999'}).setOrigin(0.5, 0.5);
  ct.add(this.texto_error);

  var boton = this.add.sprite(0, 60, 'hud', 'boton_ancho').setScale(4, 4).setInteractive();
  ct.add(boton);
  ct.add(this.add.text(0, 60, 'Entrar', {align: 'center'}).setOrigin(0.5, 0.5));

  Phaser.Display.Align.In.Center(ct, this.add.zone(this.game.config.width*0.5, this.game.config.height*0.5, this.game.config.width, this.game.config.height));

  var borrar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.BACKSPACE);
  this.input.keyboard.on('keydown', function(event) {
    if(event.keyCode == 8 && self.texto.text.length > 0) {
      self.texto.text = self.texto.text.substr(0, self.texto.text.length - 1);
    } else if(event.keyCode >= 48 && event.keyCode < 90 && self.texto.text.length < 16) {
      self.texto.text += event.key;
    }
  });

  var nombre_cookie = Cookies.get('nick_zooloween');
  if(nombre_cookie) {
    this.texto.text = nombre_cookie;
  }

  boton.on('pointerdown', function(pointer) {
    self.comenzarJuego();
  });
  boton.on('pointerover', function(pointer) {
    this.setFrame('boton_ancho_sel');
  });
  boton.on('pointerout', function(pointer) {
    this.setFrame('boton_ancho');
  });
}

sceneNick.checkNick = function() {
  var texto = this.texto.text;
  return (texto && texto.length >= 3 && texto.length <= 16)
}

sceneNick.comenzarJuego = function() {
  var self = this;

  if(this.comenzando) {
    return;
  }

  if(!this.checkNick()) {
    this.texto_error.text = 'Nick no válido';
    return;
  }

  this.comenzando = true;

  //crear conexión con el servidor
  this.game.datos = {};
  this.game.datos.socket = io({query: "nick="+this.texto.text});
  this.texto_error.text = 'Conectando...';

  //al recibir los datos del server (items, tiles, players y mobs), lanzar los scenes
  this.game.datos.socket.on('datosMapa', function(datos) {
    if(!datos) {
      self.texto_error.text = 'Nick en uso';
      self.comenzando = false;
      return;
    }
    Cookies.set('nick_zooloween', self.texto.text, { expires: 30 });

    self.game.datos.jugadores = datos[0];
    self.game.datos.mobs = datos[1];
    self.game.datos.tiles_mundo = datos[2];
    self.game.datos.items_mundo = datos[3];
    self.game.datos.drops = datos[4];


    self.scene.launch('principal');
    self.scene.launch('hud');
    self.scene.stop('nick');
  });
}
