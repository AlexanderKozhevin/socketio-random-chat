$(document).ready(function(){

  var socket = io.connect('https://damp-waters-91942.herokuapp.com/');
  socket.emit('hello', { my: 'super test 1' });

})
