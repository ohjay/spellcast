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
    var alpha = evt.alpha;
    var beta = evt.beta;
    var gamma = evt.gamma;
    // Send over socket
    socket.emit('alpha', alpha);
    socket.emit('beta', beta);
    socket.emit('gamma', gamma);
  }

  function handleMotion(evt) {
    var acceleration = evt.acceleration; // contains accel.x, accel.y, accel.z (m/s^2)
    if (acceleration.x == null) {
      acceleration = evt.accelerationIncludingGravity;
      acceleration.z -= 9.81;
    }
    var rotationRate = evt.rotationRate; // rotation rate around each axis (deg/s)
    var interval = evt.interval; // ms time interval at which data is obtained from device
    // Send over socket
    socket.emit('acceleration', acceleration);
  }

  document.getElementById('wand').onclick = function() {
    // Listen to orientation and motion events
    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleOrientation, false);
      document.getElementById('info').textContent += 'Device orientation supported! ';
    } else {
      document.getElementById('info').textContent += 'Error: device orientation not supported! ';
    }
    if (window.DeviceMotionEvent) {
      window.addEventListener('devicemotion', handleMotion);
      document.getElementById('info').textContent += 'Device motion supported! ';
    } else {
      document.getElementById('info').textContent += 'Error: device motion not supported! ';
    }
    isWand = true;
  };

  /*
   * RECEIVER
   */

  var keys = ['alpha', 'beta', 'gamma'];
  var numKeys = keys.length;
  for (var i = 0; i < numKeys; ++i) {
    !function(k) {
      socket.on(k, function(v) {
        document.getElementById('p' + k).textContent = k + ': ' + v.toString();
      });
    }(keys[i]);
  }
  socket.on('acceleration', function(v) {
    document.getElementById('paccelx').textContent = 'acceleration x: ' + v.x.toString();
    document.getElementById('paccely').textContent = 'acceleration y: ' + v.y.toString();
    document.getElementById('paccelz').textContent = 'acceleration z: ' + v.z.toString();
  });
});
