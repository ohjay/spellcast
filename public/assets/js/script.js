function logInfo(msg) {
  document.getElementById('info').textContent += msg + ' ';
}

function loadScene() {
  var canvas = document.getElementById('renderCanvas');
  var engine = new BABYLON.Engine(canvas, true);
  var createScene = function() {
    // Create a basic BJS Scene object.
    var scene = new BABYLON.Scene(engine);

    // Create a FreeCamera, and set its position to (x: 0, y: 5, z: -10).
    var camera = new BABYLON.FreeCamera('camera', new BABYLON.Vector3(0, 5,-10), scene);

    // Target the camera to scene origin.
    camera.setTarget(BABYLON.Vector3.Zero());

    // Attach the camera to the canvas.
    camera.attachControl(canvas, false);

    // Create a basic light, aiming at 0, 1, 0 - meaning, to the sky.
    var light = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(0,1,0), scene);

    // Create a built-in "sphere" shape.
    var sphere = BABYLON.MeshBuilder.CreateSphere('sphere', {segments: 16, diameter: 2}, scene);

    // Move the sphere upward 1/2 of its height.
    sphere.position.y = 1;

    // Create a built-in "ground" shape.
    var ground = BABYLON.MeshBuilder.CreateGround('ground1', {height:6, width:6, subdivisions: 2}, scene);

    // Return the created scene.
    return scene;
  }
  var scene = createScene();
  engine.runRenderLoop(function() {
    scene.render();
  });
  window.addEventListener('resize', function() {
    engine.resize();
  });
}

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
      if (acceleration.z != null) {
        acceleration.z -= 9.81;
      }
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
      logInfo('Device orientation supported!');
    } else {
      logInfo('Error: device orientation not supported!');
    }
    if (window.DeviceMotionEvent) {
      window.addEventListener('devicemotion', handleMotion);
      logInfo('Device motion supported!');
    } else {
      logInfo('Error: device motion not supported!');
    }
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

  document.getElementById('scene').onclick = function() {
    loadScene();
  };
});
