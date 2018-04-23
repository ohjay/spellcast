/*
 * GLOBAL STATE
 * --------------------
 */

let wand = null;
let prevAlpha = 0;
let prevBeta  = 0;
let prevGamma = 0;

// --------------------

function logInfo(msg) {
  document.getElementById('info').textContent += msg + ' ';
}

function toRadians(angle) {
  return angle * (Math.PI / 180);
}

function loadScene() {
  let canvas = document.getElementById('renderCanvas');
  let engine = new BABYLON.Engine(canvas, true);
  let createScene = function() {
    // Create a basic BJS Scene object.
    let scene = new BABYLON.Scene(engine);

    // Create a FreeCamera, and set its position to (x: 0, y: 5, z: -10).
    let camera = new BABYLON.FreeCamera('camera', new BABYLON.Vector3(0, 5, -10), scene);

    // Target the camera to scene origin.
    camera.setTarget(BABYLON.Vector3.Zero());

    // Attach the camera to the canvas.
    camera.attachControl(canvas, false);

    // Create a basic light, aiming at 0, 1, 0 - meaning, to the sky.
    let light = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(0, 1, 0), scene);

    // Create a built-in "sphere" shape.
    let sphere = BABYLON.MeshBuilder.CreateSphere('sphere', {segments: 16, diameter: 1}, scene);

    // Move the sphere upward 1/2 of its height.
    sphere.position.y = 1;

    // Create a built-in "ground" shape.
    let ground = BABYLON.MeshBuilder.CreateGround('ground1', {height: 6, width: 6, subdivisions: 2}, scene);

    // Add wand.
    BABYLON.SceneLoader.ImportMesh('Cylinder', "assets/scene/newtwand/", "newtwand.obj", scene, function(newMeshes) {
      wand = newMeshes[0];
      wand.scaling = new BABYLON.Vector3(0.5, 0.5, 0.5);
    });

    // Return the created scene.
    return scene;
  };
  let scene = createScene();
  engine.runRenderLoop(function() {
    scene.render();
  });
  window.addEventListener('resize', function() {
    engine.resize();
  });
}

// --------------------

$(function() {
  // Connect to the socket
  let socket = io();
  
  // Join a channel
  let room = 'test';
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

  function handleMotion(evt) {
    let acceleration = evt.acceleration; // contains accel.x, accel.y, accel.z (m/s^2)
    if (acceleration.x == null) {
      acceleration = evt.accelerationIncludingGravity;
      if (acceleration.z != null) {
        acceleration.z -= 9.81;
      }
    }
    let rotationRate = evt.rotationRate; // rotation rate around each axis (deg/s)
    let interval = evt.interval; // ms time interval at which data is obtained from device
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

  socket.on('alpha', function(alpha) {
    document.getElementById('palpha').textContent = 'alpha: ' + alpha.toString();
    alpha = toRadians(alpha);
    if (wand != null) {
      wand.rotation.x = alpha - prevAlpha;
    }
    prevAlpha = alpha;
  });
  socket.on('beta', function(beta) {
    document.getElementById('pbeta').textContent = 'beta: ' + beta.toString();
    beta = toRadians(beta);
    if (wand != null) {
      wand.rotation.y = beta - prevBeta;
    }
    prevBeta = beta;
  });
  socket.on('gamma', function(gamma) {
    document.getElementById('pgamma').textContent = 'gamma: ' + gamma.toString();
    gamma = toRadians(gamma);
    if (wand != null) {
      wand.rotation.z = gamma - prevGamma;
    }
    prevGamma = gamma;
  });
  socket.on('acceleration', function(acceleration) {
    if (acceleration.x != null) {
      document.getElementById('paccelx').textContent = 'acceleration x: ' + acceleration.x.toString();
    }
    if (acceleration.y != null) {
      document.getElementById('paccely').textContent = 'acceleration y: ' + acceleration.y.toString();
    }
    if (acceleration.z != null) {
      document.getElementById('paccelz').textContent = 'acceleration z: ' + acceleration.z.toString();
    }
  });

  document.getElementById('scene').onclick = function() {
    loadScene();
  };
});
