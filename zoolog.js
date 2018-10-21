module.exports.log = function(msg) {
  var amarillo = "\x1b[1;33m";
  var blanco = "\x1b[1;37m";

  var fecha = new Date();
  var hora = fecha.getHours();
  var minutos = fecha.getMinutes();
  var segundos = fecha.getSeconds();

  if(hora < 10) {
    hora = "0"+hora;
  }
  if(minutos < 10) {
    minutos = "0"+minutos;
  }
  if(segundos < 10) {
    segundos = "0"+segundos;
  }

  console.log(`${amarillo}[${hora}:${minutos}:${segundos}] ${blanco}${msg}`);
}
