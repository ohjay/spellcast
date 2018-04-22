$(function() {
  // Connect to the socket
  var socket = io();
  
  // Get DOM elements
  var input = document.getElementById('input');
  var output = document.getElementById('output');
  
  // Join a channel
  var room = 'test';
  socket.emit('join', room);
  
  // Listen to file input events
  document.getElementById('input').addEventListener('change', function(evt) {
    var file = evt.target.files[0];
    var fileReader = new FileReader();
    fileReader.onloadend = function(evt) {
      var image = evt.target.result;
      output.src = image;
      socket.emit('image', image);
    };
    fileReader.readAsDataURL(file);
  })
  socket.on('image', function(image) {
    output.src = image;
  });
});
