var username = "JamesBond";
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
      while (myNode.firstChild) {
        myNode.removeChild(myNode.firstChild);
      }
    }
    if (data.status=='connected'){
      $('.messages').show()
      $('.input-container').show()
      $('.waiting').hide()
      partner = data.partner;
      var myNode = document.getElementById("messages");
    }

  })


  socket.on('message', function(data){

    var html = "<li><strong>" + data.partnerName + "</strong> - " + data.message + "</li>";
    $('.messages').append(html)
    $('.messages').animate({scrollTop: $('.messages').get(0).scrollHeight}, 500);


  })




})


function pressEvent(event){
  if (event.keyCode==13){


    var html = "<li><strong>" + username + "</strong> - " + document.querySelector("#messageinput").value + "</li>";
    $('.messages').append(html)
    $('.messages').animate({scrollTop: $('.messages').get(0).scrollHeight}, 500);


    var data = {
      partnerName: username,
      message: document.querySelector("#messageinput").value,
      partner: partner
    }
    socket.emit('message', data)

    document.querySelector("#messageinput").value = ""
  }
}
