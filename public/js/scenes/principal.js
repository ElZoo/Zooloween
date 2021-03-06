var scenePrincipal = new Phaser.Scene('principal');

scenePrincipal.init = function() {
  //referencias para usarlas de forma más cómoda luego
  this.tiles_mundo = this.game.datos.tiles_mundo;
  this.items_mundo = this.game.datos.items_mundo;
  this.drops = this.game.datos.drops;
  this.size_mundo = this.items_mundo.length;
}

scenePrincipal.create = function() {
  var self = this;

  this.game.datos.mute_pausa = false;
  this.game.events.on('blur', function() {
    this.game.datos.mute_pausa = true;
  }, this);
  this.game.events.on('focus', function() {
    this.game.datos.mute_pausa = false;
  }, this);

  //pintar el mundo, los jugadores y los mobs usando los datos del servidor
  this.pintarMundo();
  this.pintarDrops();
  this.pintarJugadores();
  this.pintarMobs();

  this.crearChat();

  //evento para cuando el server manda datos nuevos sobre los jugadores y los mobs
  this.game.datos.socket.on('update', function(datos) {
    self.onUpdateJugador(datos[0]);
    self.onUpdateMob(datos[1]);
  });

  //evento para cuando se conecta un nuevo jugador
  this.game.datos.socket.on('nuevoJugador', function(jugador) {
    self.crearJugador(jugador);
  });

  //evento para cuando spawnea un nuevo mob
  this.game.datos.socket.on('nuevoMob', function(mob) {
    self.onNuevoMob(mob);
  });

  //evento para cuando se desconecta un jugador
  this.game.datos.socket.on('disconnect', function(id) {
    self.onDisconnectJugador(id);
  });

  //evento para cuando un mob recibe daño
  this.game.datos.socket.on('mob_atacar', function(datos) {
    self.onMobAtacar(datos[0], datos[1]);
  });

  //evento para cuando un jugador muere
  this.game.datos.socket.on('matarJugador', function(id) {
    self.onMatarJugador(id);
  });

  //evento para cuando un mob muere
  this.game.datos.socket.on('matarMob', function(id) {
    self.onMatarMob(id);
  });

  //evento para cuando un jugador realiza un ataque
  this.game.datos.socket.on('ataque_player', function(datos) {
    self.events.emit('ataque_player', datos);
    self.ataque_player(datos[0], datos[1]);
  });

  //evento para cuando el jugador sube de nivel
  this.game.datos.socket.on('subirLvl', function(datos) {
    self.onSubirLvl(datos[0], datos[1], datos[2]);
  });

  //evento para cuando el jugador aumenta su experiencia
  this.game.datos.socket.on('subirExp', function(exp) {
    self.onSubirExp(exp);
  });

  //evento para cuando se crea un nuevo drop
  this.game.datos.socket.on('nuevo_drop', function(drop) {
    self.crearDrop(drop);
  });

  //evento para cuando se elimina un drop
  this.game.datos.socket.on('borrar_drop', function(drop_id) {
    self.borrarDrop(drop_id);
  });

  //evento para cuando el pj toma una poción
  this.game.datos.socket.on('boost', function(datos) {
    self.onBoost(datos[0], datos[1]);
  });

  //evento para cuando se recibe un nuevo mensaje de chat
  this.game.datos.socket.on('nuevoChat', function(datos) {
    self.crearMensaje(datos[0], datos[1]);
  })

  //listener del click del ratón
  this.input.on('pointerdown', function(pointer) {
    self.game.datos.socket.emit('player_atacar');
    self.events.emit('click_principal');
  });

  this.game.datos.socket.on('topTen', function(lineas) {
    self.game.datos.topTen = lineas;
    self.events.emit('topTen', lineas);
  });

  this.scene.get('principal').events.on('ataque_player', function(datos) {
    datos[1].forEach(function(mob_id) {
      var numero = self.add.container(0, 0).setScale(0.5, 0.5);
      var mob = self.game.datos.mobs[mob_id];
      if(!mob) {
        return;
      }

      self.tweens.addCounter({
        from: 0,
        to: 200,
        duration: 2000,
        onStart: function() {
          numero.x = Math.random() > 0.5 ? mob.x * 32 + 8 : mob.x * 32 - 13;
          numero.y = Math.random() > 0.5 ? mob.y * 32 + 2 : mob.y * 32 - 10;
          numero.add(self.add.text(0, 0, datos[2]));
          numero.getAt(0).setColor('#FFD600');
          numero.depth = 99996;
          if(datos[3]) {
            numero.getAt(0).setColor('#B82323');
          }
        },
        onUpdate: function() {
          if(this.getValue() > 25) {
            numero.y += 0.07;
          }
          if(this.getValue() > 100) {
            numero.alpha -= 0.05;
          }
        },
        onComplete: function(){
          numero.destroy();
        }
      });
    });
  }, this);

  this.scene.get('principal').events.on('subirExp', function(exp) {
    var numero = self.add.container(0, 0).setScale(0.5, 0.5);
    var jugador = self.game.datos.jugador;
    self.tweens.addCounter({
      from: 0,
      to: 200,
      duration: 2000,
      onStart: function() {
        numero.x = jugador.x * 32 - 10;
        numero.y = jugador.y * 32 - 35;
        numero.add(self.add.text(0, 0, '+' + exp + 'xp'));
        numero.getAt(0).setColor('#1AFF00');
        numero.depth = 99996;
      },
      onUpdate: function() {
        if(this.getValue() > 25) {
          numero.y -= 0.07;
        }
        if(this.getValue() > 100) {
          numero.alpha -= 0.05;
        }
      },
      onComplete: function() {
        numero.destroy();
      }
    });
  }, this);

  //enviar al servidor que teclas se están pulsando
  setInterval(function() {
    datos_teclas = {
      "arriba": self.tecla_arriba.isDown,
      "abajo": self.tecla_abajo.isDown,
      "izquierda": self.tecla_izquierda.isDown,
      "derecha": self.tecla_derecha.isDown,
    };

    self.game.datos.socket.emit('moverJugador', datos_teclas);
  }, 50);

  //comenzar música
  this.musica_fondo = this.sound.add('cancion', {loop: true, volume: 0.15});
  this.musica_fondo.play();

  //secreto
  var combo = this.input.keyboard.createCombo([38, 38, 40, 40, 37, 39, 37, 39], { resetOnMatch: true });
  this.input.keyboard.on('keycombomatch', function(event) {
    self.game.datos.socket.emit('konami');
  });
}

//actualizar la barra de vida y las sprites de los jugadores y mobs
scenePrincipal.update = function(time, delta) {
  this.updateBarraVidaJugador();
  this.updateSpritesJugadores();
  this.updateSpritesMobs();
}

//crear los tiles y los items del mundo
scenePrincipal.pintarMundo = function() {
  var datos_tiles = [
    {textura: "aire"},
    {textura: "suelo_arriba_izq"},
    {textura: "suelo_arriba_"},
    {textura: "suelo_arriba_drc"},
    {textura: "suelo_medio_izq"},
    {textura: "suelo_medio_"},
    {textura: "suelo_medio_drc"},
    {textura: "suelo_abajo_izq"},
    {textura: "suelo_abajo_"},
    {textura: "suelo_abajo_drc"},
    {textura: "suelo_borde_izq"},
    {textura: "suelo_borde_"},
    {textura: "suelo_borde_drc"},
    {textura: "muro_izq", or: [0.25, 0.75]},
    {textura: "muro_medio", or: [0.25, 0.75]},
    {textura: "muro_drc", or: [0.25, 0.75]}
  ];

  for(var x=0; x<this.size_mundo; x++) {
    for(var y=0; y<this.size_mundo; y++) {
      var coordX = x * 32;
      var coordY = y * 32;
      var or = [0.5, 0.5];
      var rnd = Math.random() > 0.5 ? 0 : 1;

      var tile = this.tiles_mundo[y][x];
      var textura = datos_tiles[tile].textura;
      if(textura.charAt(textura.length - 1) == '_') {
        textura += rnd;
      }
      if(datos_tiles[tile].or) {
        or = datos_tiles[tile].or;
      }

      if(textura != "aire") {
          this.add.image(coordX, coordY, 'dungeon', textura).setOrigin(or[0], or[1]);
      }
    }
  }

  var datos_items = [
    {textura: "aire"},
    {textura: "puente"},
    {textura: "cadena", or: [0.5, 0.75]},
    {textura: "puerta_barras"},
    {textura: "puerta_madera"},
    {textura: "decor_espadas", or: [0.5, 0.75], size:[0.5,0.5]},
    {textura: "decor_lanzas", or: [0.5, 0.75], size:[0.5,0.5]}
  ];

  for(var x=0; x<this.size_mundo; x++) {
    for(var y=0; y<this.size_mundo; y++) {
      var coordX = x*32;
      var coordY = y*32;
      var or = [0.5, 0.5];
      var size = [1, 1];

      var item = this.items_mundo[y][x];
      var dato_item = datos_items[item];
      var textura = dato_item.textura;
      if(dato_item.or) {
        or = dato_item.or;
      }
      if (dato_item.size){
        size = dato_item.size;
      }

      if(textura != "aire") {
        this.add.image(coordX, coordY, 'dungeon', textura).setOrigin(or[0], or[1]).setScale(size[0], size[1]);
      }
    }
  }
}

scenePrincipal.pintarDrops = function() {
  for(var drop_id in this.drops) {
    var drop = this.drops[drop_id];
    this.crearDrop(drop);
  }
}

scenePrincipal.crearDrop = function(drop) {
  drop.sprite = this.add.image(drop.x*32, drop.y*32, 'hud', drop.item).setScale(0.25, 0.25);
  this.drops[drop.id] = drop;
}

scenePrincipal.borrarDrop = function(drop_id) {
  var drop = this.drops[drop_id];
  if(!drop) {
    return;
  }

  drop.sprite.destroy();
  delete this.drops[drop_id];
  this.sonido('coger_item', drop.x, drop.y);
}

scenePrincipal.sonido = function(sonido, x1, y1) {
  if(this.game.datos.mute_sonidos || this.game.datos.mute_pausa) {
    return;
  }
  var x2 = this.game.datos.jugador.x;
  var y2 = this.game.datos.jugador.y;
  var distancia = calcularDistancia({x: x1, y: y1}, {x: x2, y: y2});

  var volumen = Math.max(0, (0.2 - distancia*0.025));
  this.sound.play(sonido, {volume: volumen});
}
