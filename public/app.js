var username = undefined;
var socket;
var partner;
function newUser(){
  username = document.querySelector('#username').value;
  $('.nameinput').hide()
  $('.content').show()
}

$(document).ready(function(){
  socket = io.connect('https://damp-waters-91942.herokuapp.com', {secure: true});

  socket.on('status', function(data){
    console.log('alskdjflajsklj')
    if (data.status=='pending'){
      $('.messages').hide()
      $('.input-container').hide()
      $('.waiting').show()
    }
    if (data.status=='connected'){
      $('.messages').show()
      $('.input-container').show()
      $('.waiting').hide()
      partner = data.partner;
    }

  })

  function send(){

  }
})
