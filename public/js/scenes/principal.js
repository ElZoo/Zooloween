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
  this.pintarMobs();

  this.game.datos.socket.on('update', function(datos) {
    var jugadores = datos[0];
    for(var id in jugadores) {
      var jugador = jugadores[id];
      var j = self.game.datos.jugadores[id];
      j.x = jugador.x;
      j.y = jugador.y;
      j.vida = jugador.vida;
      j.dir = jugador.dir;
    }

    var mobs = datos[1];
    for(var id in mobs) {
      var mob = mobs[id];
      var m = self.game.datos.mobs[id];
      m.x = mob.x;
      m.y = mob.y;
      m.vida = mob.vida;
      m.dir = mob.dir;
    }
  });
  this.game.datos.socket.on('nuevoJugador', function(jugador) {
    jugador.sprite = self.add.sprite(jugador.x * 32, jugador.y * 32, 'pj_base', 'abajo_0').setFrame('quieto');
    self.game.datos.jugadores[jugador.id] = jugador;
  });
  this.game.datos.socket.on('nuevoMob', function(mob) {
    if(mob.tipo == 'murcielago') {
      mob.sprite = self.add.sprite(mob.x * 32, mob.y * 32, 'murcielago', 'volar_0').play('murcielago_volar');
      self.game.datos.mobs[mob.id] = mob;
    }
  });
  this.game.datos.socket.on('disconnect', function(id) {
    self.game.datos.jugadores[id].sprite.destroy();
    delete self.game.datos.jugadores[id];
  });

  this.game.datos.socket.on('mob_atacar', function(datos) {
    var mob = self.game.datos.mobs[datos[0]];
    var jugador = self.game.datos.jugadores[datos[1]];

    self.tweens.addCounter({
      from: 0,
      to: 255,
      yoyo: true,
      duration: 50,
      onUpdate: function (tween) {
          var value = Math.floor(tween.getValue());
          jugador.sprite.setTint(Phaser.Display.Color.GetColor(value, 0, 0));
      },
      onComplete: function(tween) {
        jugador.sprite.setTint();
      }
    });
  });

  setInterval(function() {
    datos_teclas = {
      "arriba": self.tecla_arriba.isDown,
      "abajo": self.tecla_abajo.isDown,
      "izquierda": self.tecla_izquierda.isDown,
      "derecha": self.tecla_derecha.isDown,
    };

    self.game.datos.socket.emit('moverJugador', datos_teclas);
  }, 50);
}

scenePrincipal.update = function(time, delta) {
  var pj = this.game.datos.jugador;
  pj.barra_vida.x = pj.x * 32;
  pj.barra_vida.y = pj.y * 32 - 16;
  pj.barra_vida.getAt(1).width = Math.round(pj.vida / 100 * 32);
  if(pj.vida < 33) {
    pj.barra_vida.getAt(1).fillColor = 0xff0000;
  } else if(pj.vida < 66) {
    pj.barra_vida.getAt(1).fillColor = 0xffff00;
  } else {
    pj.barra_vida.getAt(1).fillColor = 0x00ff00;
  }

  var jugadores = this.game.datos.jugadores;
  for(var id in jugadores) {
    var jugador = jugadores[id];

    jugador.sprite.x = jugador.x * 32;
    jugador.sprite.y = jugador.y * 32;
    jugador.sprite.depth = jugador.sprite.y;

    switch(jugador.dir) {
      case 'arriba':
        jugador.sprite.anims.play('pj_arriba', true);
        break;
      case 'abajo':
        jugador.sprite.anims.play('pj_abajo', true);
        break;
      case 'izquierda':
        jugador.sprite.anims.play('pj_izquierda', true);
        break;
      case 'derecha':
        jugador.sprite.anims.play('pj_derecha', true);
        break;
      case 'quieto':
        jugador.sprite.anims.stop();
        jugador.sprite.setFrame('quieto');
        break;
    }
  }

  var mobs = this.game.datos.mobs;
  for(var id in mobs) {
    var mob = mobs[id];
    mob.sprite.x = mob.x * 32;
    mob.sprite.y = mob.y * 32;
    mob.sprite.depth = mob.sprite.y;

    mob.sprite.flipX = (mob.dir == 'izquierda');
  }
}

scenePrincipal.pintarJugadores = function() {
  var jugadores = this.game.datos.jugadores;
  for(var id in jugadores) {
    var jugador = jugadores[id];

    jugador.sprite = this.add.sprite(jugador.x * 32, jugador.y * 32, 'pj_base').setOrigin(0.5, 0.75).setFrame('quieto');
    if(id == this.game.datos.socket.id) {
      this.game.datos.jugador = jugador;
      this.cameras.main.setBounds(-32, -32, 544, 544).setZoom(3);
      this.cameras.main.startFollow(jugador.sprite);

      this.tecla_arriba = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
      this.tecla_abajo = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
      this.tecla_izquierda = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
      this.tecla_derecha = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

      var vida_borde = this.add.image(0, 0, 'hud', 'vida_borde');
      var vida_fondo = this.add.image(0, 0, 'hud', 'vida_fondo');
      var vida_color = this.add.rectangle(-15, 2, 1, 5, 0xffffff).setOrigin(0.5, 1);
      jugador.barra_vida = this.add.container(0, 0, [vida_fondo, vida_color, vida_borde]).setScale(0.5, 0.5);
    }
  }
}

scenePrincipal.pintarMobs = function() {
  var mobs = this.game.datos.mobs;
  for(var id in mobs) {
    var mob = mobs[id];
    if(mob.tipo == 'murcielago') {
      mob.sprite = this.add.sprite(mob.x * 32, mob.y * 32, 'murcielago', 'volar_0').play('murcielago_volar');
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
