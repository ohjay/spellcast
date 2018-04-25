/*
 * wand.js
 * Owen Jow
 *
 * Sender (wand) component of the Spellcast platform.
 * Sends local UI information to the scene component.
 */

function logInfo(msg) {
  document.getElementById('info').textContent += msg + ' ';
}

function getParameterByName(name, url) {
  // Source: https://stackoverflow.com/a/901144
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, "\\$&");
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}

// --------------------

$(function() {
  // Connect to the socket
  let socket = io();

  // Join a channel
  let room = getParameterByName('room');
  socket.emit('join', room);

  /*
   * SENDER
   */

  function handleOrientation(evt) {
    let alpha = evt.alpha;
    let beta = evt.beta;
    let gamma = evt.gamma;
    // Send over socket
    socket.emit('alpha', alpha);
    socket.emit('beta', beta);
    socket.emit('gamma', gamma);
  }

  document.getElementById('calibrate').onclick = function() {
    // Send calibration signal, so that the computer knows the phone is pointed at it
    socket.emit('calibrate');
  };

  $('#incantate').on('touchstart', function() {
    // Send signal to start recording
    socket.emit('recordstart');

    $('#incantate').css({
      'transform': 'scale(1.2)', 'background': '#cd0000'
    }); // (button indication)
  }).on('touchend', function() {
    // Send signal to end recording
    socket.emit('recordend');

    $('#incantate').css({
      'transform': 'scale(1.0)', 'background': ''
    }); // (button indication)
  });

  /*
   * WAND SETUP - MAIN
   */

  // Listen to orientation events
  if (window.DeviceOrientationEvent) {
    window.addEventListener('deviceorientation', handleOrientation, false);
    logInfo('Device orientation supported!');
  } else {
    logInfo('Error: device orientation not supported!');
  }
  socket.emit('connected');
});
