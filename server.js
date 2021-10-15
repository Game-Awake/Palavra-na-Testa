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

function sendRoom(room,emitter,data) {
  for(let i=0;i<room.players.length;i++) {
    console.log(room.players[i].id);
    console.log(emitter);
    console.log(data);
    io.to(room.players[i].id).emit(emitter,data);
  }
}
function nextPlayer(socket) {
  let room = rooms[socket.room];
  if(room.players.length <= room.currentPlayer) {
    socket.emit("end game");
  } else {
    let currentPlayer = room.players[room.currentPlayer];
    room.timeout = setTimeout(function(){
      room.hasEnded = true;
      clearTimeout(room.timeout);
      sendRoom(room,"timeout",{word:room.words[currentPlayer.word]})
    },60000);
    for(let i=0;i<room.players.length;i++) {
      let player = room.players[i];
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
}

app.get('/', (req, res) => {
  res.sendFile(__dirname + INDEX);
});

app.get('/game', (req, res) => {

});

io.on('connection', (socket) => {
  socket.isMain = false;  
  console.log('a user connected');
  socket.on('disconnect', () => {
    if(socket.isMain) {
      rooms[socket.room] = {
        isActive:false,
        password:null,
        words:[],
        playerList:""
      };
    }
    console.log('user disconnected');
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
    if(msg.room) {
      if(msg.room < 0 && msg.room > 9) {
        socket.emit("invalid room");
        return;
      }
    } else {
      socket.emit("invalid room");
      return;
    }
    if(!rooms[msg.room].isActive) {
      socket.emit("room not active");
      return;
    }
    if(rooms[msg.room].password == msg.password) {
      if(socket.room) {
        socket.leave("r"+socket.room);
      }
      socket.room = msg.room;
      socket.join("r"+socket.room);
      socket.playerName = msg.playerName;
      if(rooms[socket.room].playerList != "") {
        rooms[socket.room].playerList += "\n";
      }
      rooms[socket.room].playerList += msg.playerName;
      rooms[socket.room].players.push({id:socket.id,playerName:msg.playerName,word:rooms[socket.room].words.length});    
      rooms[socket.room].words.push(msg.word);
      socket.emit("open",{isMain:socket.isMain,playerList:rooms[socket.room].playerList});
      socket.to("r"+socket.room).emit("refresh player list",{playerList:rooms[socket.room].playerList});
    } else {
      socket.emit("wrong password");
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
    console.log(room.currentPlayer == room.players.length);
    if(room.currentPlayer == room.players.length) {
      return;
    }
    let player = room.players[room.currentPlayer];
    console.log(socket.playerName);
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