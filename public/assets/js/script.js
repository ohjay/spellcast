// This is temporary
var isWand = true;

$(function() {
  // Connect to the socket
  var socket = io();
  
  // Get DOM elements
  var input = document.getElementById('input');
  var output = document.getElementById('output');
  
  // Join a channel
  var room = 'test';
  socket.emit('join', room);

  /*
   * SENDER
   */

  function handleOrientation(evt) {
    var absolute = evt.absolute;
    var alpha = evt.alpha;
    var beta = evt.beta;
    var gamma = evt.gamma;
    // Send over socket
    socket.emit('absolute', absolute);
    socket.emit('alpha', alpha);
    socket.emit('beta', beta);
    socket.emit('gamma', gamma);
  }

  function handleMotion(evt) {
    var acceleration = evt.acceleration;
    // Send over socket
    socket.emit('acceleration', acceleration);
  }

  document.getElementById('wand').onclick = function() {
    // Listen to orientation and motion events
    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleOrientation, false);
    } else {
      log('Error: device orientation not supported!');
    }
    if (window.DeviceMotionEvent) {
      window.addEventListener('devicemotion', handleMotion, true);
    } else {
      log('Error: device motion not supported!');
    }
    isWand = true;
  };

  /*
   * RECEIVER
   */

  var keys = ['absolute', 'alpha', 'beta', 'gamma', 'acceleration'];
  var numKeys = keys.length;
  for (var i = 0; i < numKeys; ++i) {
    var k = keys[i];
    socket.on(k, function(v) {
      document.getElementById('p').textContent += k + ': ' + v.toString() + '\n';
    });
  }
});
