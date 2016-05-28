var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var PORT = process.env.PORT || 8080;

var users = [];

app.use(express.static(__dirname + '/public'));

app.get('/',function(req,res){

	// request : son cabeceras y datos que nos envia el navegador.
	// response : son todo lo que enviamos desde el servidor.
	res.sendFile(__dirname + 'index.html');
});


function connectClients(clientID) {

  var filtered = users.filter((item) => return !item.busy);
  if (filtered.length){

    let partner = undefined;
    while (!partner){
      let randomInt = Math.round(Math.random()*filtered.length);
      if (filtered[randomInt].id != clientID){
        partner = filtered[randomInt]
      }
    }

    let firstClientIndex = users.findIndex((element, index)=>{
      if (element.id == clientID){
        return index;
      }
    })
    users[firstClientIndex].busy = true;
    users[firstClientIndex].partner = partner.id;


    let secondClientIndex = users.findIndex((element, index)=>{
      if (element.id == partner.id){
        return index;
      }
    })
    users[secondClientIndex].busy = true;
    users[secondClientIndex].partner = clientID;


    io.sockets.socket(clientID).emit('status', {status: "connected", partner: partner.id});
    io.sockets.socket(partner.id).emit('status', {status: "connected", partner: clientID});


  } else {

    io.sockets.socket(clientID).emit('status', {status: "pending"});

  }

}

io.on('connection',function(socket){

  //
  // Block 1 - Here we manage connect event
  //
  let client = {
    id: socket.id,
    busy: false
  }
  users.push(client)

  connectClients(socket.id)


  //
  // End of Block 1
  //

  //
  // Block 2 - message exchange
  //
  socket.on('message', function (data) {
    io.sockets.socket(data.partner).emit('message', data);
  });
  //
  // End of block2
  //



  //
  // Block 3 - if user disconnect
  //
  socket.on('disconnect', function() {
    let clientIndex = users.findIndex((element, index)=>{
      if (element.id == socket.id){
        return index;
      }
    })

    let client = users[clientIndex]
    // Check if user connected to any user
    if (client.partner){
      let parnerIndex = users.findIndex((element, index)=>{
        if (element.id == socket.id){
          return index;
        }
      })
      io.sockets.socket(users[parnerIndex].id).emit('status', {status: "pending"});
      users[parnerIndex].busy = false;
      users[parnerIndex].partner = undefined;

      users.splice(clientIndex, 1);
      connectClients(users[parnerIndex].id);

    }

  });


});


http.listen(PORT,function(){
	console.log('el servidor esta escuchando el puerto %s',PORT);
});
