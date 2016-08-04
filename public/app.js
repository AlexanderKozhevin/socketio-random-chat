
// Our username
var username = "JamesBond";

// just a global variable to store data
var socket;

// Parner id in case of connection
var partner;


// A function after username input
function newUser(){

  // Lets store the usrename andhide the input box
  username = document.querySelector('#username').value;
  $('.nameinput').hide()
  $('.content').css('display', 'flex');

  // Initialise connection to server
  socket = io.connect('https://damp-waters-91942.herokuapp.com', {secure: true});


  // Status message from server
  socket.on('status', function(data){
    console.log(data.status)
    // if There are not partners
    if (data.status=='pending'){
      $('.messages').hide()
      $('.input-container').hide()
      $('.waiting').css('display', 'flex');

      // remote all messages
      var myNode = document.querySelector(".messages");
      while (myNode.firstChild) {
        myNode.removeChild(myNode.firstChild);
      }

    }

    // when a new partner
    if (data.status=='connected'){
      $('.messages').show();
      $('.input-container').css('display', 'flex');
      $('.waiting').hide()
      partner = data.partner;

    }

  })

  // message receiving
  socket.on('message', function(data){

    var html = "<li><strong>" + data.partnerName + "</strong> - " + data.message + "</li>";
    $('.messages').append(html)
    $('.messages').animate({scrollTop: $('.messages').get(0).scrollHeight}, 500);


  })
}



// When you press enter in message input box
function pressEvent(event){

  if (event.keyCode==13){

    // Add new message to the box
    var html = "<li><strong>" + username + "</strong> - " + document.querySelector("#messageinput").value + "</li>";
    $('.messages').append(html)
    $('.messages').animate({scrollTop: $('.messages').get(0).scrollHeight}, 500);

    // send messge to the server
    var data = {
      partnerName: username,
      message: document.querySelector("#messageinput").value,
      partner: partner
    }
    socket.emit('message', data)

    // remote inputed value
    document.querySelector("#messageinput").value = ""
  }
}
