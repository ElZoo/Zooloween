var scenePrincipal = new Phaser.Scene('principal');

scenePrincipal.init = function() {
  this.tiles_mundo = this.game.datos.tiles_mundo;
  this.items_mundo = this.game.datos.items_mundo;
  this.size_mundo = this.items_mundo.length;
}

scenePrincipal.create = function() {
  var self = this;

  this.pintarMundo();
  this.pintarJugadores();

  this.game.datos.socket.on('updateJugadores', function(jugadores) {
    for(var id in jugadores) {
      var jugador = jugadores[id];
      var j = self.game.datos.jugadores[id];
      j.x = jugador.x;
      j.y = jugador.y;
      j.vida = jugador.vida;
    }
  });
  this.game.datos.socket.on('nuevoJugador', function(jugador) {
    jugador.sprite = self.add.image(jugador.x * 32, jugador.y * 32, 'pj_base', 'abajo_0');
    self.game.datos.jugadores[jugador.id] = jugador;
  });
  this.game.datos.socket.on('disconnect', function(id) {
    self.game.datos.jugadores[id].sprite.destroy();
    delete self.game.datos.jugadores[id];
  });
}

scenePrincipal.update = function(time, delta) {
  var jugadores = this.game.datos.jugadores;
  for(var id in jugadores) {
    var jugador = jugadores[id];

    jugador.sprite.x = jugador.x * 32;
    jugador.sprite.y = jugador.y * 32;
  }

  datos_teclas = {
    "arriba": this.tecla_arriba.isDown,
    "abajo": this.tecla_abajo.isDown,
    "izquierda": this.tecla_izquierda.isDown,
    "derecha": this.tecla_derecha.isDown,
  };
  if(this.tecla_arriba.isDown || this.tecla_abajo.isDown || this.tecla_izquierda.isDown || this.tecla_derecha.isDown) {
      this.game.datos.socket.emit('moverJugador', datos_teclas);
  }
}

scenePrincipal.pintarJugadores = function() {
  var jugadores = this.game.datos.jugadores;
  for(var id in jugadores) {
    var jugador = jugadores[id];

    jugador.sprite = this.add.image(jugador.x * 32, jugador.y * 32, 'pj_base', 'abajo_0');
    if(id == this.game.datos.socket.id) {
      this.game.datos.jugador = jugador;
      this.cameras.main.setBounds(-32, -32, 544, 544).setZoom(3);
      this.cameras.main.startFollow(jugador.sprite);
      //this.cameras.main.followOffset.set(-300, -300);

      this.tecla_arriba = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
      this.tecla_abajo = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
      this.tecla_izquierda = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
      this.tecla_derecha = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    }
  }
}

scenePrincipal.pintarMundo = function() {
  for(var x=0; x<this.size_mundo; x++) {
    for(var y=0; y<this.size_mundo; y++) {
      var coordX = x*32;
      var coordY = y*32;
      var textura = "aire";
      var or = [0.5, 0.5];
      var rnd = Math.random() > 0.5 ? 0 : 1;

      var tile = this.tiles_mundo[y][x];
      switch(tile) {
        case 1:
          textura = "suelo_arriba_izq";
          break;
        case 2:
          textura = "suelo_arriba_"+rnd;
          break;
        case 3:
          textura = "suelo_arriba_drc";
          break;
        case 4:
          textura = "suelo_medio_izq";
          break;
        case 5:
          textura = "suelo_medio_"+rnd;
          break;
        case 6:
          textura = "suelo_medio_drc";
          break;
        case 7:
          textura = "suelo_abajo_izq";
          break;
        case 8:
          textura = "suelo_abajo_"+rnd;
          break;
        case 9:
          textura = "suelo_abajo_drc";
          break;
        case 10:
          textura = "suelo_borde_izq";
          break;
        case 11:
          textura = "suelo_borde_"+rnd;
          break;
        case 12:
          textura = "suelo_borde_drc";
          break;
        case 13:
          textura = "muro_izq";
          or = [0.25, 0.75];
          break;
        case 14:
          textura = "muro_medio";
          or = [0.25, 0.75];
          break;
        case 15:
          textura = "muro_drc";
          or = [0.25, 0.75];
          break;
      }

      if(textura != "aire") {
          this.add.image(coordX, coordY, 'dungeon', textura).setOrigin(or[0], or[1]);
      }
    }
  }

  for(var x=0; x<this.size_mundo; x++) {
    for(var y=0; y<this.size_mundo; y++) {
      var coordX = x*32;
      var coordY = y*32;
      var textura = "aire";
      var or = [0.5, 0.5];
      var rnd = Math.random() > 0.5 ? 0 : 1;

      var item = this.items_mundo[y][x];
      switch(item) {
        case 1:
          textura = "puente";
          break;
        case 2:
          textura = "cadena";
          or = [0.5, 0.75];
          break;
      }

      if(textura != "aire") {
        this.add.image(coordX, coordY, 'dungeon', textura).setOrigin(or[0], or[1]);
      }
    }
  }
}
