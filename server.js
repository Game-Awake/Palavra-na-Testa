const PORT = process.env.PORT || 3000;
const INDEX = '/index.html';

const express = require('express');
const app = express();
app.use(express.static(__dirname + "/static"));
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

let rooms = [];
for(let i=0;i<10;i++) {
  rooms.push({
    isActive:false,
    password:null,
    words: [],
    playerList:""
  });
}

function hasLogoutUsers(socket,room,player) {
  let hasLogout = false;
    while(room.currentPlayer < room.players.length && player.id == null) {
      player = room.players[++room.currentPlayer];
      hasLogout = true;
    }
    if(room.currentPlayer == room.players.length) {
      room.hasEnded = false;
      socket.emit("end game");
      return true;
    }
    if(hasLogout) {
      room.hasEnded = false;
      nextPlayer(socket);
      return true;
    }
    return false;
}

function sendRoom(room,emitter,data) {
  for(let i=0;i<room.players.length;i++) {
    let id = room.players[i].id;
    if(id != null) {
      io.to(id).emit(emitter,data);
    }
  }
}
function nextPlayer(socket) {
  try {
    let room = rooms[socket.room];
    if(room.players.length <= room.currentPlayer) {
      socket.emit("end game");
    } else {
      let currentPlayer = room.players[room.currentPlayer];
      if(hasLogoutUsers(socket,room,currentPlayer)) {
        return;
      }
      room.timeout = setTimeout(function(){
        room.hasEnded = true;
        clearTimeout(room.timeout);
        sendRoom(room,"timeout",{word:room.words[currentPlayer.word]})
      },60000);
      for(let i=0;i<room.players.length;i++) {
        let player = room.players[i];
        if(player.id == null) {
          continue;
        }        
        let word = "";
        if(currentPlayer.playerName == player.playerName) {
          word = "-".repeat(room.words[currentPlayer.word].length);
        } else {
          word = room.words[currentPlayer.word];
        }
        io.to(player.id).emit("sent player",{
          playerName: currentPlayer.playerName,
          word: word
        });
      }
    }
  } catch(ex) {
    socket.emit("end game");
  }
}

app.get('/', (req, res) => {
  res.sendFile(__dirname + INDEX);
});

app.get('/game', (req, res) => {

});

io.on('connection', (socket) => {
  socket.isMain = false;
  socket.on('disconnect', () => {
    try {
      if(socket.isMain) {
        rooms[socket.room] = {
          isActive:false,
          password:null,
          words:[],
          playerList:""
        };
      } else {
        let room = rooms[socket.room];
        let playerList = "";
        let comma = "";
        for(let i=0;i<room.players.length;i++) {
          if(room.players[i].id == socket.id) {
            room.players[i].id = null;
          } else {
            playerList += comma + room.players[i].playerName;
            comma = ", ";
          }
        }
        room.playerList = playerList;
        sendRoom(room,'refresh player list',{playerList:playerList});
      }
    } catch(ex) {

    }
  });
  socket.on('creator', (msg) => {
    let i;
    if(socket.isMain && typeof socket.room !== "undefined") {
      i = socket.room;
    } else {
      for(i=0;i<rooms.length;i++) {
        if(!rooms[i].isActive) {
          rooms[i].isActive = true;
          break;
        }
      }
    }
    if(i == rooms.length) {
      socket.emit("no rooms");
      return;
    }
    socket.isMain = true;
    socket.room = i;
    rooms[i].password = msg.password;
    rooms[i].players = [];
    rooms[i].currentPlayer = 0;
    socket.emit("on create", {sala:i});
  });
  socket.on('join', (msg) => {
    try {
      if(msg.room) {
        if(msg.room < 0 && msg.room > 9) {
          socket.emit("invalid room");
          return;
        }
      } else {
        socket.emit("invalid room");
        return;
      }
      let room = rooms[msg.room];
      if(!room.isActive) {
        socket.emit("room not active");
        return;
      }
      if(room.password == msg.password) {
        if(socket.room) {
          socket.leave("r"+socket.room);
        }
        socket.room = msg.room;
        socket.join("r"+socket.room);
        socket.playerName = msg.playerName;
        let hasLogout = false;
        for(let i=0;i<room.players.length;i++) {
          if(socket.playerName == room.players[i].playerName && room.players[i].id == null) {
            room.players[i].id = socket.id;
            hasLogout = true;
            break;
          }
        }
        if(room.playerList != "") {
          room.playerList += ", ";
        }
        room.playerList += msg.playerName;

        if(!hasLogout) {
          room.players.push({id:socket.id,playerName:msg.playerName,word:rooms[socket.room].words.length});    
          room.words.push(msg.word);        
        }
        socket.emit("open",{isMain:socket.isMain,playerList:rooms[socket.room].playerList});
        socket.to("r"+socket.room).emit("refresh player list",{playerList:rooms[socket.room].playerList});
      } else {
        socket.emit("wrong password");
      }
    } catch(ex) {
      socket.emit("end game");
    }
  });
  socket.on('start', (msg) => {
    if(socket.isMain) {
      let room = rooms[socket.room];
      let move = Math.floor(Math.random() * (room.players.length-1))+1;
      for(let i=0;i<room.players.length;i++) {
        room.players[i].word = (room.players[i].word + move) % room.players.length;
      }
      nextPlayer(socket);
    }
  });
  socket.on('next player', (msg) => {
    let room = rooms[socket.room];
    if(room.hasEnded) {
      room.currentPlayer++;
      room.hasEnded = false;
    }
    nextPlayer(socket);
  });
  socket.on('chat message', (msg) => {
    let room = rooms[socket.room];

    if(room.currentPlayer == room.players.length) {
      socket.emit("end game");
      return;
    }
    let player = room.players[room.currentPlayer];
    if(hasLogoutUsers(socket,room,player)) {
      return;
    }
    if(socket.id == player.id) {
      if(msg.msg == room.words[player.word]) {
        clearTimeout(room.timeout);
        room.timeout = null;
        room.hasEnded = true;
        sendRoom(room,'sent message',{playerName:socket.playerName,msg:msg.msg,isCorrect:true});
      } else {
        sendRoom(room,'sent message',{playerName:socket.playerName,msg:msg.msg});
      }
    } else {
      sendRoom(room,'sent message',{playerName:socket.playerName,msg:msg.msg});
    }
  });
});

server.listen(PORT, () => {
  console.log('listening on *:'+PORT);
});