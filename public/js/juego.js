var config = {
  type: Phaser.AUTO,
  parent: 'juegoDiv',
  width: 1280,
  height: 720,
  render: {
    antialias: false
  },
  banner: false,
  backgroundColor: '#1d1923',
  scene: [
    scenePrecarga,
    scenePrincipal
  ],
}

var game = new Phaser.Game(config);
