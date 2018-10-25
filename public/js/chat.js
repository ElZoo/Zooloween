scenePrincipal.crearChat = function() {
  var self = this;
  var juegoDiv = document.getElementById("juegoDiv");

  var chat = document.createElement("div");
  chat.id = "chat";
  juegoDiv.appendChild(chat);

  var cajaChat = document.createElement("div");
  cajaChat.id = "cajaChat";
  chat.appendChild(cajaChat);

  var inputChat = document.createElement("div");
  inputChat.id = "inputChat";
  chat.appendChild(inputChat);

  var input = document.createElement("input");
  input.maxLength = 64;
  inputChat.appendChild(input);
  var button = document.createElement("button");
  button.innerText = ">";
  inputChat.appendChild(button);

  input.addEventListener("keydown", function(event) {
    event.stopPropagation();
    if(event.key === "Enter") {
      self.enviarChat(input);
      return false;
    }
  }, true);
  button.addEventListener("mouseup", function(event) {
    self.enviarChat(input);
  });

  juegoDiv.addEventListener("mousedown", function(event) {
    input.blur();
  });

  //document.addEventListener('contextmenu', event => event.preventDefault());
}

scenePrincipal.enviarChat = function(el) {
  this.crearMensaje(this.game.datos.jugador.nick, el.value.trim(), true);
  this.game.datos.socket.emit('enviarChat', el.value.trim());

  el.value = "";
}

scenePrincipal.crearMensaje = function(nick, msg, propio=false) {
  if(!msg || msg.lenght == 0) {
    return;
  }

  var cajaChat = document.getElementById("cajaChat");

  var el_mensaje = document.createElement("div");
  el_mensaje.className = "mensaje";
  cajaChat.appendChild(el_mensaje);

  var el_nick = document.createElement("div");
  el_nick.className = "nick";
  el_nick.innerText = nick+":";
  el_mensaje.appendChild(el_nick);

  if(propio) {
    el_nick.className += " propio";
  }

  var el_txt = document.createElement("div");
  el_txt.className = "txt";
  el_txt.innerText = msg.substring(0, 64);
  el_mensaje.appendChild(el_txt);

  cajaChat.scrollTop = cajaChat.scrollHeight;
}
