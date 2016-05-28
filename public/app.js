$(document).ready(function(){
  console.log('superman3');
  var socket = io.connect('http://damp-waters-91942.herokuapp.com');
  console.log('superman2');
  socket.on('connect', function () {
    console.log('superman');
    socket.emit('hello', { my: 'super test 1' });
  });
})
