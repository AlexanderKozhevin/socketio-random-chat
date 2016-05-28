
var bodyParser = require('body-parser');
var cors = require('cors');
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);



app.set('port', (process.env.PORT || 80));

//We don't really need this line, but it allows to send
//requests from different domains
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));



app.get('/', function(request, response) {
  response.sendfile('index.html');
});



app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});


io.on('connection', function (socket) {
  socket.on('hello', function (data) {
    console.log(data);
  });
});
