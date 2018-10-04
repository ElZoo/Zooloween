var config = {
  type: Phaser.AUTO,
  parent: 'juegoDiv',
  width: 1280,
  height: 720,
  render: {
    antialias: false
  },
  banner: false,
  scene: [
    scenePrecarga,
    scenePrincipal
  ],
}

var game = new Phaser.Game(config);
