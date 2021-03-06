//actualizar atributos de cada jugador
scenePrincipal.onUpdateJugador = function(jugadores) {
  var pj = jugadores[this.game.datos.jugador.id];
  if(pj && pj.arma != this.game.datos.jugador.arma) {
    this.events.emit('cambio_de_arma', jugadores[this.game.datos.jugador.id].arma);
  }
  if(pj && pj.armadura != this.game.datos.jugador.armadura) {
    this.events.emit('cambio_de_armadura', jugadores[this.game.datos.jugador.id].armadura);
  }

  for(var id in jugadores) {
    var jugador = jugadores[id];
    var j = this.game.datos.jugadores[id];
    j.x = jugador.x;
    j.y = jugador.y;
    j.vida = jugador.vida;
    j.vidaMax = jugador.vidaMax;
    j.dirX = jugador.dirX;
    j.dirY = jugador.dirY;
    j.lastDir = jugador.lastDir;
    j.arma = jugador.arma;
    j.armadura = jugador.armadura;
    j.delayAtaque = jugador.delayAtaque;
    j.nivel = jugador.nivel;
    j.defensa = jugador.defensa;
    j.alt = jugador.alt;
  }
}

//crear sprites del jugador y el texto con el nivel
scenePrincipal.crearJugador = function(jugador) {
  if(jugador.alt && (jugador.armadura == 'pj_tela' || jugador.armadura == 'pj_cuero' || jugador.armadura == 'pj_chain')) {
    jugador.sprite = this.add.sprite(jugador.x * 32, jugador.y * 32, jugador.armadura+'_alt', 'abajo_0').setOrigin(0.5, 0.9).setScale(0.5, 0.5).setFrame('quieto_abajo');
  } else {
    jugador.sprite = this.add.sprite(jugador.x * 32, jugador.y * 32, jugador.armadura, 'abajo_0').setOrigin(0.5, 0.9).setScale(0.5, 0.5).setFrame('quieto_abajo');
  }

  jugador.spriteArma = this.add.sprite(jugador.x * 32, jugador.y * 32, jugador.arma, 'abajo_0').setOrigin(0.5, 0.9).setScale(0.5, 0.5).setFrame('abajo_0');
  this.game.datos.jugadores[jugador.id] = jugador;

  jugador.texto_nivel = this.add.text(0, 0, 'Lvl ' + jugador.nivel, {align: 'center'}).setScale(0.3, 0.3).setOrigin(0.5, 0.5);
  jugador.texto_nick = this.add.text(0, 0, jugador.nick, {align: 'center'}).setScale(0.3, 0.3).setOrigin(0.5, 0.5);
  jugador.texto_nivel.depth = 99996;
  jugador.texto_nick.depth = 99996;
  this.events.emit('nuevoJugador') ;
}

//eliminar los sprites y el texto y borrarlo del array de jugadores
scenePrincipal.onDisconnectJugador = function(id) {
  var self = this;

  var jugador = this.game.datos.jugadores[id];
  if(!jugador) {
    return;
  }

  if(jugador.alt && (jugador.armadura == 'pj_tela' || jugador.armadura == 'pj_cuero' || jugador.armadura == 'pj_chain')) {
    var spriteMuerte = this.add.sprite(jugador.x * 32, jugador.y * 32, jugador.armadura+'_alt').setOrigin(0.5, 0.9).setScale(0.5, 0.5);
  } else {
    var spriteMuerte = this.add.sprite(jugador.x * 32, jugador.y * 32, jugador.armadura).setOrigin(0.5, 0.9).setScale(0.5, 0.5);
  }
  spriteMuerte.depth = spriteMuerte.y;
  spriteMuerte.on('animationcomplete', function() {
    self.tweens.addCounter({
      from: 0,
      to: 100,
      duration: 1000,
      onUpdate: function(tween) {
        var val = Math.round(tween.getValue());
        if(val % 20 == 0) {
          spriteMuerte.setVisible(spriteMuerte.visible != true);
        }
      },
      onComplete: function(tween) {
        spriteMuerte.destroy();
      }
    });
  }, this);
  spriteMuerte.play(jugador.armadura+"_morir");

  jugador.sprite.destroy();
  jugador.spriteArma.destroy();
  jugador.texto_nivel.destroy();
  jugador.texto_nick.destroy();
  delete this.game.datos.jugadores[id];

  this.events.emit('matarJugador');

}

//si es el pj principal, ver la pantalla final, si no, borrar sus datos
scenePrincipal.onMatarJugador = function(id) {
  if(id == this.game.datos.jugador.id) {
    this.borrarChat();
    this.musica_fondo.stop();
    this.scene.launch('final');
  } else {
    this.onDisconnectJugador(id);
  }
}

//actualizar la barra de vida del jugador principal
scenePrincipal.updateBarraVidaJugador = function() {
  var pj = this.game.datos.jugador;
  pj.barra_vida.x = pj.x * 32;
  pj.barra_vida.y = pj.y * 32 - 24;
  pj.barra_vida.getAt(1).width = Math.round(pj.vida / pj.vidaMax * 32);
  if(pj.vida < pj.vidaMax * 0.33) {
    pj.barra_vida.getAt(1).fillColor = 0xff0000;
  } else if(pj.vida < pj.vidaMax * 0.66) {
    pj.barra_vida.getAt(1).fillColor = 0xffff00;
  } else {
    pj.barra_vida.getAt(1).fillColor = 0x00ff00;
  }
}

//actualizar los sprites de los jugadores
scenePrincipal.updateSpritesJugadores = function() {
  var jugadores = this.game.datos.jugadores;
  for(var id in jugadores) {
    var jugador = jugadores[id];

    jugador.sprite.x = jugador.x * 32;
    jugador.sprite.y = jugador.y * 32;
    jugador.sprite.depth = jugador.sprite.y;

    jugador.spriteArma.x = jugador.x * 32;
    jugador.spriteArma.y = jugador.y * 32;
    jugador.spriteArma.depth = jugador.spriteArma.y;

    jugador.texto_nivel.x = Math.floor(jugador.x * 32);
    jugador.texto_nivel.y = Math.floor(jugador.y * 32 - 28);
    jugador.texto_nivel.text = 'Lvl ' + jugador.nivel;

    jugador.texto_nick.x = Math.floor(jugador.x * 32);
    jugador.texto_nick.y = Math.floor(jugador.y * 32 - 34);

    if(jugador.efecto_subir) {
      jugador.efecto_subir.x = jugador.x * 32 + 1;
      jugador.efecto_subir.y = jugador.y * 32;
    }
    if(jugador.spriteCurar) {
      jugador.spriteCurar.x = jugador.x * 32;
      jugador.spriteCurar.y = jugador.y * 32;
    }

    var currentAnim = jugador.sprite.anims.currentAnim
    if(currentAnim && (currentAnim.key.includes(jugador.armadura+'_atacar') || currentAnim.key.includes(jugador.armadura+'_lanza')) && jugador.sprite.anims.isPlaying) {
      continue;
    }
    if(jugador.alt && (jugador.armadura == 'pj_tela' || jugador.armadura == 'pj_cuero' || jugador.armadura == 'pj_chain') && currentAnim && (currentAnim.key.includes(jugador.armadura+'_alt_atacar') || currentAnim.key.includes(jugador.armadura+'_alt_lanza')) && jugador.sprite.anims.isPlaying) {
      continue;
    }
    switch (jugador.dirX) {
      case 'izquierda':
        jugador.sprite.anims.play(jugador.armadura+(jugador.alt && (jugador.armadura == 'pj_tela' || jugador.armadura == 'pj_cuero' || jugador.armadura == 'pj_chain') ? '_alt' : '')+'_izquierda', true);
        jugador.spriteArma.anims.play(jugador.arma+'_izquierda', true);
        break;
      case 'derecha':
        jugador.sprite.anims.play(jugador.armadura+(jugador.alt && (jugador.armadura == 'pj_tela' || jugador.armadura == 'pj_cuero' || jugador.armadura == 'pj_chain') ? '_alt' : '')+'_derecha', true);
        jugador.spriteArma.anims.play(jugador.arma+'_derecha', true);
        break;
      default:
        switch(jugador.dirY) {
          case 'arriba':
            jugador.sprite.anims.play(jugador.armadura+(jugador.alt && (jugador.armadura == 'pj_tela' || jugador.armadura == 'pj_cuero' || jugador.armadura == 'pj_chain') ? '_alt' : '')+'_arriba', true);
            jugador.spriteArma.anims.play(jugador.arma+'_arriba', true);
            break;
          case 'abajo':
            jugador.sprite.anims.play(jugador.armadura+(jugador.alt && (jugador.armadura == 'pj_tela' || jugador.armadura == 'pj_cuero' || jugador.armadura == 'pj_chain') ? '_alt' : '')+'_abajo', true);
            jugador.spriteArma.anims.play(jugador.arma+'_abajo', true);
            break;
          default:
            jugador.sprite.anims.stop();
            jugador.sprite.setFrame(jugador.lastDir);
            jugador.spriteArma.anims.stop();
            jugador.spriteArma.setFrame(jugador.lastDir);
            break;
        }
    }
  }
}

//crear sprite de los jugadores y la barra de vida el pj principal
scenePrincipal.pintarJugadores = function() {
  var jugadores = this.game.datos.jugadores;
  for(var id in jugadores) {
    var jugador = jugadores[id];
    this.crearJugador(jugador);

    //si es el pj principal, crear la cámara, los controles y la barra de vida
    if(id == this.game.datos.socket.id) {
      jugador.texto_nivel.visible = false;
      jugador.texto_nick.visible = false;
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

//animaciones de cuando un jugador ataca a unos mobs
scenePrincipal.ataque_player = function(player_id, mob_ids) {
  var self = this;

  if(player_id == this.game.datos.jugador.id) {
    this.events.emit('ataque_principal');
  }

  var jugador = this.game.datos.jugadores[player_id];
  var spr_arm = "atacar";
  var spr_atc = "ataque";
  if(jugador.arma == "item_lanza" || jugador.arma == "item_tridente") {
    spr_arm = "lanza";
    spr_atc = "lanza";
  }
  switch (jugador.lastDir) {
    case 'quieto_abajo':
      jugador.sprite.play(jugador.armadura+(jugador.alt && (jugador.armadura == 'pj_tela' || jugador.armadura == 'pj_cuero' || jugador.armadura == 'pj_chain') ? '_alt' : '')+'_'+spr_arm+'_abajo');
      jugador.spriteArma.play(jugador.arma+'_'+spr_atc+'_abajo');
      break;
    case 'quieto_arriba':
      jugador.sprite.play(jugador.armadura+(jugador.alt && (jugador.armadura == 'pj_tela' || jugador.armadura == 'pj_cuero' || jugador.armadura == 'pj_chain') ? '_alt' : '')+'_'+spr_arm+'_arriba');
      jugador.spriteArma.play(jugador.arma+'_'+spr_atc+'_arriba');
      break;
    case 'quieto_derecha':
      jugador.sprite.play(jugador.armadura+(jugador.alt && (jugador.armadura == 'pj_tela' || jugador.armadura == 'pj_cuero' || jugador.armadura == 'pj_chain') ? '_alt' : '')+'_'+spr_arm+'_derecha');
      jugador.spriteArma.play(jugador.arma+'_'+spr_atc+'_derecha');
      break;
    case 'quieto_izquierda':
      jugador.sprite.play(jugador.armadura+(jugador.alt && (jugador.armadura == 'pj_tela' || jugador.armadura == 'pj_cuero' || jugador.armadura == 'pj_chain') ? '_alt' : '')+'_'+spr_arm+'_izquierda');
      jugador.spriteArma.play(jugador.arma+'_'+spr_atc+'_izquierda');
      break;
  }

  mob_ids.forEach(function(mob_id) {
    var mob = this.game.datos.mobs[mob_id];
    if(!mob) {
      return;
    }
    self.sonido('mob_dano', mob.x, mob.y);

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
        if(mob.tinte) {
          mob.sprite.setTint(mob.tinte);
        }
      }
    });

    self.tweens.addCounter({
      from: 0,
      to: 1,
      duration: 1000,
      onStart: function (tween) {
        if(!mob) {
          return;
        }
        mob.tweensBarra++;
        mob.barra_vida.visible = true;
      },
      onComplete: function(tween) {
        if(!mob) {
          return;
        }
        mob.tweensBarra--;
        if(mob.tweensBarra <= 0) {
          mob.tweensBarra = 0;
          mob.barra_vida.visible = false;
        }
      }
    });
  });
}

//evento de subir el nivel al jugador
scenePrincipal.onSubirLvl = function(id, lvl, exp) {
  var pj = this.game.datos.jugadores[id];
  pj.nivel = lvl;
  pj.exp = exp;
  pj.efecto_subir = this.add.sprite(0, 0, 'efecto_subir_lvl').setOrigin(0.5, 0.75);
  pj.efecto_subir.depth = 99999;
  pj.efecto_subir.on('animationcomplete', function() {
    pj.efecto_subir.destroy();
  }, this);
  pj.efecto_subir.play('efecto_subir_lvl');
  this.sonido('subir_lvl', pj.x, pj.y);

  if(id == this.game.datos.jugador.id) {
    this.events.emit('subirLvl', lvl);
  }
}

scenePrincipal.onSubirExp = function(exp) {
  this.game.datos.jugador.exp += exp;
  this.events.emit('subirExp', exp);
}

scenePrincipal.onBoost = function(player_id, item) {
  var jugador = this.game.datos.jugadores[player_id];
  var ef = 'efecto_curar';
  if(item != 'pocion') {
    ef = item;
  }

  jugador.spriteCurar = this.add.sprite(0, 0, ef).setOrigin(0.5, 0.75);
  jugador.spriteCurar.depth = 99999;
  jugador.spriteCurar.on('animationcomplete', function() {
    if(!jugador.spriteCurar) {
      return;
    }
    jugador.spriteCurar.destroy();
    delete jugador.spriteCurar;
  }, this);
  jugador.spriteCurar.play(ef);

  this.sonido('beber_pocion', jugador.x, jugador.y);
}
