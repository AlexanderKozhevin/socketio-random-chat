$(document).ready(function(){
  console.log('superman3');
  var socket = io.connect('https://damp-waters-91942.herokuapp.com', {secure: true});
  io.set('transports', ['xhr-polling']);
  io.set('polling duration', 10);
  console.log('superman2');
  socket.on('connect', function () {
    console.log('superman');
    socket.emit('hello', { my: 'super test 1' });
  });
})
