var scenePrincipal = new Phaser.Scene('principal');

scenePrincipal.init = function() {
  this.size_mundo = 16;
  this.tiles_mundo = [];
  this.generarMundo();
}

scenePrincipal.create = function() {
  this.pintarMundo();
  this.crearCamara();
}

scenePrincipal.update = function(time, delta) {
  controls.update(delta);
}

scenePrincipal.generarMundo = function() {
  for(var x=0; x<this.size_mundo; x++) {
    this.tiles_mundo[x] = [];
    for(var y=0; y<this.size_mundo; y++) {
      this.tiles_mundo[x][y] = "aire";

      if(x > 1 && x < 14) {
        if(y == 1) {
          var rnd = Math.random() > 0.5 ? 0 : 1;
          this.tiles_mundo[x][y] = "suelo_arriba_"+rnd;
        } else if(y == 14) {
          var rnd = Math.random() > 0.5 ? 0 : 1;
          this.tiles_mundo[x][y] = "suelo_abajo_"+rnd;
        } else if(y == 15) {
          var rnd = Math.random() > 0.5 ? 0 : 1;
          this.tiles_mundo[x][y] = "suelo_borde_"+rnd;
        } else if(y > 1 && y < 14) {
          var rnd = Math.random() > 0.5 ? 0 : 1;
          this.tiles_mundo[x][y] = "suelo_medio_"+rnd;
        }
      } else if(x == 1) {
        if(y == 1) {
          this.tiles_mundo[x][y] = "suelo_arriba_izq";
        } else if(y == 14) {
          this.tiles_mundo[x][y] = "suelo_abajo_izq";
        } else if(y == 15) {
          this.tiles_mundo[x][y] = "suelo_borde_izq";
        } else if(y > 1 && y < 14) {
          this.tiles_mundo[x][y] = "suelo_medio_izq";
        }
      } else if(x == 14) {
        if(y == 1) {
          this.tiles_mundo[x][y] = "suelo_arriba_drc";
        } else if(y == 14) {
          this.tiles_mundo[x][y] = "suelo_abajo_drc";
        } else if(y == 15) {
          this.tiles_mundo[x][y] = "suelo_borde_drc";
        } else if(y > 1 && y < 14) {
          this.tiles_mundo[x][y] = "suelo_medio_drc";
        }
      }
    }
  }
}

scenePrincipal.pintarMundo = function() {
  for(var x=0; x<this.size_mundo; x++) {
    for(var y=0; y<this.size_mundo; y++) {
      var textura = this.tiles_mundo[x][y];
      var coordX = x*32;
      var coordY = y*32;

      this.add.image(coordX, coordY, 'dungeon', textura);
    }
  }
}

scenePrincipal.crearCamara = function() {
  var self = this;

  var configControles = {
    camera: this.cameras.main,
    left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
    right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
    down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
    acceleration: 0.4,
    drag: 0.5,
    maxSpeed: 3.0
  };
  this.cameras.main.setBounds(0, 0, 512, 512).setZoom(3).centerOn(256, 256);

  controls = new Phaser.Cameras.Controls.SmoothedKeyControl(configControles);
}
