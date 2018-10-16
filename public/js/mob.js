//actualizar los atributos de los mobs
scenePrincipal.onUpdateMob = function(mobs) {
  for(var id in mobs) {
    var mob = mobs[id];
    var m = this.game.datos.mobs[id];
    if(!m) {
      continue;
    }
    m.x = mob.x;
    m.y = mob.y;
    m.vida = mob.vida;
    m.dir = mob.dir;
    m.fase = mob.fase;
  }
}

//crear los sprites del mob
scenePrincipal.onNuevoMob = function(mob) {
  if(mob.tipo == 'murcielago') {
    mob.sprite = this.add.sprite(mob.x * 32, mob.y * 32, mob.tipo).play(mob.tipo+"_"+mob.fase);
    mob.sprite.setScale(mob.escala, mob.escala);
    if(mob.tinte) {
      mob.sprite.setTint(mob.tinte);
    }
  }
  var vida_borde = this.add.image(0, 0, 'hud', 'vida_borde');
  var vida_fondo = this.add.image(0, 0, 'hud', 'vida_fondo');
  var vida_color = this.add.rectangle(-15, 2, 1, 5, 0xffffff).setOrigin(0.5, 1);
  mob.barra_vida = this.add.container(0, 0, [vida_fondo, vida_color, vida_borde]).setScale(0.4*mob.escala, 0.4*mob.escala);
  mob.barra_vida.depth = 999989;
  mob.barra_vida.visible = false;
  mob.tweensBarra = 0;

  this.game.datos.mobs[mob.id] = mob;
}

//ejecutar animación para cuando un mob daña a un jugador
scenePrincipal.onMobAtacar = function(mob_id, jugador_id) {
  var mob = this.game.datos.mobs[mob_id];
  var jugador = this.game.datos.jugadores[jugador_id];

  mob.sprite.play(mob.tipo+'_atacar');
  this.sonido('pj_dano', jugador.x, jugador.y);

  this.tweens.addCounter({
    from: 0,
    to: 255,
    yoyo: true,
    duration: 50,
    onUpdate: function (tween) {
        var value = Math.floor(tween.getValue());
        jugador.sprite.setTint(Phaser.Display.Color.GetColor(value, 0, 0));
        jugador.spriteArma.setTint(Phaser.Display.Color.GetColor(value, 0, 0));
    },
    onComplete: function(tween) {
      jugador.sprite.setTint();
      jugador.spriteArma.setTint();
    }
  });
}

//eliminar sprites cuando muere un mob
scenePrincipal.onMatarMob = function(id) {
  var mob = this.game.datos.mobs[id];

  mob.ticksMuerto = 0;
  mob.vida = 0;
  mob.barra_vida.destroy();
  this.sonido('mob_muere', mob.x, mob.y);

  var tile = this.tiles_mundo[Math.round(mob.y)][Math.round(mob.x)];
  if(tiles_barrera.indexOf(tile) > -1) {
    mob.sprite.destroy();
    delete self.game.datos.mobs[id];
  } else {
    mob.sprite.play(mob.tipo+'_morir', true);
  }
}

//actualizar sprites de los mobs
scenePrincipal.updateSpritesMobs = function() {
  var self = this;
  var pj = this.game.datos.jugador;

  var mobs = this.game.datos.mobs;
  Object.keys(mobs).forEach(function(id) {
    var mob_id = id+0;
    var mob = mobs[id];
    mob.sprite.x = mob.x * 32;
    mob.sprite.y = mob.y * 32;
    mob.sprite.depth = mob.sprite.y;

    if(mob.barra_vida.visible && mob.barra_vida.getAt(1)) {
      mob.barra_vida.x = mob.x * 32;
      mob.barra_vida.y = mob.y * 32 - 12*mob.escala;
      mob.barra_vida.getAt(1).width = Math.round(mob.vida / mob.vidaMax * 32);
      if(mob.vida < mob.vidaMax * 0.33) {
        mob.barra_vida.getAt(1).fillColor = 0xff0000;
      } else if(mob.vida < mob.vidaMax * 0.66) {
        mob.barra_vida.getAt(1).fillColor = 0xffff00;
      } else {
        mob.barra_vida.getAt(1).fillColor = 0x00ff00;
      }
    }

    mob.sprite.flipX = (mob.dir == 'izquierda');

    var currentAnim = mob.sprite.anims.currentAnim;
    if(currentAnim && currentAnim.key.includes('_atacar') && mob.sprite.anims.isPlaying) {
      return;
    }

    if(mob.vida > 0) {
      if(mob.fase == 'volar' || mob.fase == 'andar' || mob.fase == 'cargar') {
        mob.sprite.play(mob.tipo+'_'+mob.fase, true);
      }
    } else {
      mob.ticksMuerto++;
      if(mob.ticksMuerto == 75) {
        self.tweens.addCounter({
          from: 0,
          to: 100,
          duration: 500,
          onUpdate: function(tween) {
            var val = Math.round(tween.getValue());
            if(val % 20 == 0) {
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

//crear los sprites de los mobs
scenePrincipal.pintarMobs = function() {
  var mobs = this.game.datos.mobs;
  for(var id in mobs) {
    var mob = mobs[id];
    this.onNuevoMob(mob);
  }
}

var tiles_barrera = [0, 10, 11, 12, 13, 14, 15];
