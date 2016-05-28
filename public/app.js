var username = undefined;
var socket;
function newUser(){
  username = document.querySelector('#username').value;
  $('.nameinput').hide()
}

$(document).ready(function(){
  socket = io.connect('https://damp-waters-91942.herokuapp.com', {secure: true});
})
