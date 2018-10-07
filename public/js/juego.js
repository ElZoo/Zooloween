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
    scenePrincipal,
    sceneHud,
    sceneFinal
  ],
}

var game = new Phaser.Game(config);

function calcularDistancia(ent1, ent2) {
  return Math.sqrt(Math.pow(ent1.x - ent2.x, 2) + Math.pow(ent1.y - ent2.y, 2));
}
