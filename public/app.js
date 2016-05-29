var username = "JamesBond";
var socket;
var partner;

function newUser(){
  username = document.querySelector('#username').value;
  $('.nameinput').hide()
  $('.content').css('display', 'flex');
  socket = io.connect('https://damp-waters-91942.herokuapp.com', {secure: true});

  socket.on('status', function(data){
    if (data.status=='pending'){
      console.log('pendo--')
      $('.messages').hide()
      $('.input-container').hide()
      $('.waiting').css('display', 'flex');
      var myNode = document.querySelector(".messages");
      while (myNode.firstChild) {
        myNode.removeChild(myNode.firstChild);
      }

    }
    if (data.status=='connected'){
      $('.messages').show();
      $('.input-container').css('display', 'flex');
      $('.waiting').hide()
      partner = data.partner;

    }

  })


  socket.on('message', function(data){

    var html = "<li><strong>" + data.partnerName + "</strong> - " + data.message + "</li>";
    $('.messages').append(html)
    $('.messages').animate({scrollTop: $('.messages').get(0).scrollHeight}, 500);


  })
}

$(document).ready(function(){





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
