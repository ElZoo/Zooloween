var scenePrincipal = new Phaser.Scene('principal');

scenePrincipal.init = function() {
  this.tiles_mundo = this.game.datos.tiles_mundo;
  this.items_mundo = this.game.datos.items_mundo;
  this.size_mundo = this.items_mundo.length;
}

scenePrincipal.create = function() {
  var self = this;

  this.scene.stop('final');

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
      j.dirX = jugador.dirX;
      j.dirY = jugador.dirY;
    }

    var mobs = datos[1];
    for(var id in mobs) {
      var mob = mobs[id];
      var m = self.game.datos.mobs[id];
      if(!m) {
        continue;
      }
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
    var vida_borde = self.add.image(0, 0, 'hud', 'vida_borde');
    var vida_fondo = self.add.image(0, 0, 'hud', 'vida_fondo');
    var vida_color = self.add.rectangle(-15, 2, 1, 5, 0xffffff).setOrigin(0.5, 1);
    mob.barra_vida = self.add.container(0, 0, [vida_fondo, vida_color, vida_borde]).setScale(0.4, 0.4);
    mob.barra_vida.depth = 999999;
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

  this.game.datos.socket.on('matarJugador', function(id) {
    if(id == self.game.datos.jugador.id) {
      self.scene.launch('final');
    } else {
      self.game.datos.jugadores[id].sprite.destroy();
      delete self.game.datos.jugadores[id];
    }
  });

  this.game.datos.socket.on('matarMob', function(id) {
    self.game.datos.mobs[id].ticksMuerto = 0;
    self.game.datos.mobs[id].vida = 0;
    self.game.datos.mobs[id].sprite.play('murcielago_morir', true);
  });

  this.game.datos.socket.on('ataque_player', function(datos) {
    self.ataque_player(datos[0], datos[1]);
  });

  this.input.on('pointerdown', function(pointer) {
    self.game.datos.socket.emit('player_atacar');
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
  var self = this;

  var pj = this.game.datos.jugador;
  pj.barra_vida.x = pj.x * 32;
  pj.barra_vida.y = pj.y * 32 - 16;
  pj.barra_vida.getAt(1).width = Math.round(pj.vida / pj.vidaMax * 32);
  if(pj.vida < pj.vidaMax * 0.33) {
    pj.barra_vida.getAt(1).fillColor = 0xff0000;
  } else if(pj.vida < pj.vidaMax * 0.66) {
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

    var currentAnim = jugador.sprite.anims.currentAnim
    if(currentAnim && currentAnim.key.includes('pj_atacar') && jugador.sprite.anims.isPlaying) {
      continue;
    }
    switch (jugador.dirX) {
      case 'izquierda':
        jugador.sprite.anims.play('pj_izquierda', true);
        break;
      case 'derecha':
        jugador.sprite.anims.play('pj_derecha', true);
        break;
      default:
        switch(jugador.dirY) {
          case 'arriba':
            jugador.sprite.anims.play('pj_arriba', true);
            break;
          case 'abajo':
            jugador.sprite.anims.play('pj_abajo', true);
            break;
          case 'quieto':
            jugador.sprite.anims.stop();
            jugador.sprite.setFrame('quieto');
            break;
        }
    }
  }

  var mobs = this.game.datos.mobs;
  Object.keys(mobs).forEach(function(id) {
    var mob_id = id+0;
    var mob = mobs[id];
    mob.sprite.x = mob.x * 32;
    mob.sprite.y = mob.y * 32;
    mob.sprite.depth = mob.sprite.y;
    var distancia = calcularDistancia(pj, mob);
    if(distancia < 2) {
      mob.barra_vida.visible = true;
      mob.barra_vida.x = mob.x * 32;
      mob.barra_vida.y = mob.y * 32 - 12;
      mob.barra_vida.getAt(1).width = Math.round(mob.vida / mob.vidaMax * 32);
      if(mob.vida < mob.vidaMax * 0.33) {
        mob.barra_vida.getAt(1).fillColor = 0xff0000;
      } else if(mob.vida < mob.vidaMax * 0.66) {
        mob.barra_vida.getAt(1).fillColor = 0xffff00;
      } else {
        mob.barra_vida.getAt(1).fillColor = 0x00ff00;
      }
    } else {
      mob.barra_vida.visible = false;
    }

    mob.sprite.flipX = (mob.dir == 'izquierda');
    if(mob.vida <= 0) {
      mob.ticksMuerto++;
      if(mob.ticksMuerto == 75) {
        self.tweens.addCounter({
          from: 0,
          to: 50,
          duration: 500,
          onUpdate: function(tween) {
            var val = Math.round(tween.getValue());
            if(val % 10 == 0) {
              mobs[id].sprite.setVisible(mobs[id].sprite.visible != true);
            }
          },
          onComplete: function(tween) {
            mobs[id].sprite.destroy();
            mobs[id].barra_vida.destroy();
            delete self.game.datos.mobs[id];
          }
        });
      }
    }
  });
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
      jugador.barra_vida.depth = 999999;
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
    var vida_borde = this.add.image(0, 0, 'hud', 'vida_borde');
    var vida_fondo = this.add.image(0, 0, 'hud', 'vida_fondo');
    var vida_color = this.add.rectangle(-15, 2, 1, 5, 0xffffff).setOrigin(0.5, 1);
    mob.barra_vida = this.add.container(0, 0, [vida_fondo, vida_color, vida_borde]).setScale(0.4, 0.4);
    mob.barra_vida.depth = 999999;
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

scenePrincipal.ataque_player = function(player_id, mob_ids) {
  var self = this;
  var jugador = this.game.datos.jugadores[player_id];
  console.log("Atacar")
  jugador.sprite.play('pj_atacar');

  mob_ids.forEach(function(mob_id) {
    var mob = this.game.datos.mobs[mob_id];

    self.tweens.addCounter({
      from: 0,
      to: 255,
      yoyo: true,
      duration: 50,
      onUpdate: function (tween) {
        if(!mob) {
          return;
        }
        var value = Math.floor(tween.getValue());
        mob.sprite.setTintFill(Phaser.Display.Color.GetColor(value, 0, 0));
      },
      onComplete: function(tween) {
        if(!mob) {
          return;
        }
        mob.sprite.setTint();
      }
    });
  });
}
