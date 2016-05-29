var express = require('express');
var app = express();
var cors = require('cors');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var PORT = process.env.PORT || 8080;

var users = [];

app.use(express.static(__dirname + '/public'));
app.use(cors());

app.get('/',function(req,res){

	// request : son cabeceras y datos que nos envia el navegador.
	// response : son todo lo que enviamos desde el servidor.
	res.sendFile(__dirname + 'index.html');
});



function connectClients(clientID) {

  // Let's find free users to chat with
	var free = []
	users.forEach(function(item){
		if (!item.busy){
			free.push(item)
		}
	})

  // If there is someone else one website except you
  if (free.length>1){


    // Lets find in randomly select partner
    var partner = undefined;

    // This block is to prevent connecting to yourself
    while (!partner){
      var randomInt = Math.round(Math.random()*free.length-1);

      if (free[randomInt].id != clientID){
        partner = free[randomInt]
      }
    }


    // Find myself in users list and set up proper values
		var firstClientIndex = -1;
		users.forEach(function(element, index){
			if (element.id == clientID){
				firstClientIndex = index;
			}
		})

    users[firstClientIndex].busy = true;
    users[firstClientIndex].partner = partner.id;


    // Find partner in users list and set up proper values
		var secondClientIndex = -1;
		users.forEach(function(element, index){
			if (element.id == partner.id){
				secondClientIndex = index;
			}
		})

    users[secondClientIndex].busy = true;
    users[secondClientIndex].partner = clientID;

    // Send messages to the clients that they are connected
    io.sockets.connected[clientID].emit('status', {status: "connected", partner: partner.id});
    io.sockets.connected[partner.id].emit('status', {status: "connected", partner: clientID});


  } else {

    // If there is not free users to connect - simpy wait untils someone else will connect.
    io.sockets.connected[clientID].emit('status', {status: "pending"});

  }

}


//Initialise user connection
io.on('connection',function(socket){

  //
  // Block 1 - Add new user to the common list
  //
  var client = {
    id: socket.id,
    busy: false
  }
  users.push(client)

  // And connect new user to someone else
  connectClients(socket.id)




  //
  // Block 2 - message exchange
  //
  socket.on('message', function (data) {
    io.sockets.connected[data.partner].emit('message', data);
  });
  //
  // End of block2
  //



  //
  // Block 3 - if user disconnect
  //
  socket.on('disconnect', function() {

    // Find disconnected user Index in list
    var clientIndex = -1;
		users.forEach(function(element, index){
      if (element.id == socket.id){
	      clientIndex = index;
      }
    })


    if (clientIndex!=-1){
      var client = users[clientIndex]
      // Check if user connected to any user
      if (client.partner){

				var parnerIndex = -1;
				users.forEach(function(element, index){
					if (element.id == socket.id){
						parnerIndex = index;
					}
				})

        //Send message to partner that he is disconnected
				if (parnerIndex!=-1){
					io.sockets.connected[users[parnerIndex].id].emit('status', {status: "pending"});
	        users[parnerIndex].busy = false;
	        users[parnerIndex].partner = undefined;


	        // Try to connect disconnected user to somone else
	        connectClients(users[parnerIndex].id);
					// Remove disconnected user from common list
	        users.splice(clientIndex, 1);
				}



      } else {
        // Remove disconnected user from common list
        users.splice(clientIndex, 1);
      }
    }




  });


});


http.listen(PORT,function(){
	console.log('el servidor esta escuchando el puerto %s',PORT);
});
