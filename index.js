var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var cors = require('cors');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var PORT = process.env.PORT || 8080;
const md5 = require('md5')
const _ = require('lodash')
var users = [];
console.log(users)
app.use(express.static(__dirname + '/public'));
app.use(cors());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

app.get('/',function(req,res){

	// request : son cabeceras y datos que nos envia el navegador.
	// response : son todo lo que enviamos desde el servidor.
	res.sendFile(__dirname + 'index.html');
});


//
// Function that  checks whether the user with suck name already exist
//
app.get('/isnamefree',function(req,res){
	var user = _.findIndex(users, {name: md5(req.query.user)});
	if (user == -1){
		res.send('ok')
	} else {
		res.send('busy')
	}
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

			if(free[randomInt]){
				if (free[randomInt].id != clientID){
	        partner = free[randomInt]
	      }
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
    io.to(clientID).emit('status', {status: "connected", partner: partner.id, myid: clientID});
    io.to(partner.id).emit('status', {status: "connected", partner: clientID, myid: partner.id});


  } else {

    // If there is not free users to connect - simpy wait untils someone else will connect.
    io.to(clientID).emit('status', {status: "pending"});

  }

}


//Initialise user connection
io.on('connection',function(socket){
  //
  // Block 1 - Add new user to the common list
  //
  var client = {
    id: socket.id,
    busy: false,
		name: md5(socket.handshake.query.user)
  }
  users.push(client)

  // And connect new user to someone else
  connectClients(socket.id)



  //
  // Block 2 - message exchange
  //
  socket.on('message', function (data) {
    io.to(data.partner).emit('message', data);
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



        //Send message to partner that he is disconnected
				if (client.partner!=-1){


					io.to(client.partner).emit('status', {status: "pending"});

					var partnerIndex = -1;
					users.forEach(function(element, index){
						if (element.id == client.partner){
							partnerIndex = index;
						}
					})
					users[partnerIndex].partner = undefined
					users[partnerIndex].busy = false



					// Remove disconnected user from common list
					users.splice(clientIndex, 1);

					// Try to connect disconnected user to somone else
					connectClients(client.partner);


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
