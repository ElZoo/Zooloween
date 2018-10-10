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
  }
}

//crear los sprites del mob
scenePrincipal.onNuevoMob = function(mob) {
  if(mob.tipo == 'murcielago') {
    mob.sprite = this.add.sprite(mob.x * 32, mob.y * 32, 'murcielago', 'volar_0').play('murcielago_volar');
  }
  var vida_borde = this.add.image(0, 0, 'hud', 'vida_borde');
  var vida_fondo = this.add.image(0, 0, 'hud', 'vida_fondo');
  var vida_color = this.add.rectangle(-15, 2, 1, 5, 0xffffff).setOrigin(0.5, 1);
  mob.barra_vida = this.add.container(0, 0, [vida_fondo, vida_color, vida_borde]).setScale(0.4, 0.4);
  mob.barra_vida.depth = 999989;
  mob.barra_vida.visible = false;

  this.game.datos.mobs[mob.id] = mob;
}

//ejecutar animación para cuando un mob daña a un jugador
scenePrincipal.onMobAtacar = function(mob_id, jugador_id) {
  var mob = this.game.datos.mobs[mob_id];
  var jugador = this.game.datos.jugadores[jugador_id];

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
  this.game.datos.mobs[id].ticksMuerto = 0;
  this.game.datos.mobs[id].vida = 0;
  this.game.datos.mobs[id].sprite.play('murcielago_morir', true);
  this.game.datos.mobs[id].barra_vida.destroy();
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
      mob.barra_vida.y = mob.y * 32 - 12;
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

//crear los sprites de los mobs
scenePrincipal.pintarMobs = function() {
  var mobs = this.game.datos.mobs;
  for(var id in mobs) {
    var mob = mobs[id];
    this.onNuevoMob(mob);
  }
}
