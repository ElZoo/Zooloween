var scenePrincipal = new Phaser.Scene('principal');

scenePrincipal.init = function() {
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
  this.tiles_mundo = [
    [0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0],
    [0, 13,  0, 14,  0, 15,  0,  0, 13,  0, 14,  0, 14, 15,  0,  0],
    [0,  1,  2,  2,  2,  2,  3,  0,  1,  2,  2,  2,  2,  2,  3,  0],
    [0,  4,  5,  5,  5,  5,  6,  0,  4,  5,  5,  5,  5,  5,  6,  0],
    [0,  7,  8,  8,  8,  8,  9,  0,  4,  5,  5,  5,  5,  5,  6,  0],
    [0, 10, 11, 11, 11, 11, 12,  0,  4,  5,  5,  5,  5,  5,  6,  0],
    [0,  0,  0,  0,  0,  0,  0,  0,  4,  5,  5,  5,  5,  5,  6,  0],
    [0,  0,  0,  1,  2,  2,  2,  2,  5,  5,  5,  5,  5,  5,  6,  0],
    [0,  0,  0,  4,  5,  5,  5,  5,  5,  5,  5,  5,  5,  5,  6,  0],
    [0,  0,  0,  7,  8,  8,  8,  8,  8,  8,  8,  8,  8,  8,  9,  0],
    [0,  0,  0, 10, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11,  12,  0],
    [0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0],
    [0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0],
    [0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0],
    [0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0],
    [0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0],
  ];
  this.size_mundo = this.tiles_mundo.length;

  this.items_mundo = [
    [0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0],
    [0,  2,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  2,  0,  0],
    [0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0],
    [0,  0,  0,  0,  0,  0,  0,  1,  0,  0,  0,  0,  0,  0,  0,  0],
    [0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0],
    [0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0],
    [0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0],
    [0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0],
    [0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0],
    [0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0],
    [0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0],
    [0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0],
    [0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0],
    [0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0],
    [0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0],
    [0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0]
  ];
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
  this.cameras.main.setBounds(-32, -32, 544, 544).setZoom(3).centerOn(240, 240);

  controls = new Phaser.Cameras.Controls.SmoothedKeyControl(configControles);
}