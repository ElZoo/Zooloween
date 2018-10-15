var sceneFinal = new Phaser.Scene('final');

sceneFinal.preload = function() {
  var self = this;
  this.scene.get('principal').events.on('topTen', function(lineas) {
    console.log("TOP TEN FINAL");
    self.game.datos.topTen = lineas;
    self.crearTopTen();
  });
}

sceneFinal.create = function() {
  var self = this;

  this.scene.stop('hud');
  this.scene.stop('precarga');
  this.scene.stop('principal');

  this.contenedor = this.add.container(0,0);
  this.contenedor.add(this.add.text(0, -200, 'Has perdido :(', {align: 'center'}).setOrigin(0.5, 0.5));

  var boton = this.add.sprite(0, 200, 'hud', 'boton_ancho').setScale(4, 4).setOrigin(0.5, 0.5).setInteractive();
  this.contenedor.add(boton);
  this.contenedor.add(this.add.text(0, 200, '¿Reinciar?', {align: 'center'}).setOrigin(0.5, 0.5));

  Phaser.Display.Align.In.Center(this.contenedor, this.add.zone(this.game.config.width*0.5, this.game.config.height*0.5, this.game.config.width, this.game.config.height));

  boton.on('pointerdown', function(pointer) {
    location.reload();
  });
  boton.on('pointerin', function(pointer) {
    this.setFrame('boton_ancho_sel');
  });
  boton.on('pointerout', function(pointer) {
    this.setFrame('boton_ancho');
  });

  this.crearTopTen();
}

sceneFinal.crearTopTen = function() {
  var lineas = this.game.datos.topTen;
  console.log("CREAR TOP TEN");
  console.log(lineas)
  if(!lineas) {
    return;
  }

  this.contenedor.add(this.add.sprite(0, 0, 'hud', 'boton_grande').setScale(8, 8).setOrigin(0.5, 0.5));
  for(var i=0; i<10; i++) {
    var nick = lineas[i] ? lineas[i].nick : '';
    var nivel = lineas[i] ? lineas[i].nivel : '';
    this.contenedor.add(this.add.text(-75, -75 + i*20, (i+1)+". "+nick+" "+nivel, {align: 'left'}).setOrigin(0, 0.5));
  }
}
