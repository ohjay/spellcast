/*
 * GLOBAL STATE
 * --------------------
 */

var wand        = null;
var wandRoot    = null;
var wandLight   = null;
var lightSphere = null;
var hl          = null;
var sphere      = null;

var lightOn   = false;
var wlActive  = false;
var wlBasePos = null;
var speechRec = null;

var prevAlpha = 0;
var prevBeta  = 0;
var prevGamma = 0;

var baseAlpha = 0;
var baseBeta  = 0;
var baseGamma = 0;

var targetRotX = 0;
var targetRotY = 0;
var targetRotZ = 0;

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
    // Create a basic BJS Scene object
    let scene = new BABYLON.Scene(engine);

    // Create a FreeCamera and set its position
    let camera = new BABYLON.FreeCamera('camera', new BABYLON.Vector3(0, 5, -10), scene);

    // Target the camera to scene origin
    camera.setTarget(BABYLON.Vector3.Zero());

    // Attach the camera to the canvas
    camera.attachControl(canvas, false);

    // Create a light
    let light = new BABYLON.PointLight('pointLight', new BABYLON.Vector3(0, 10, 0), scene);

    // Create a built-in "sphere" shape
    sphere = BABYLON.MeshBuilder.CreateSphere('sphere', {segments: 16, diameter: 1}, scene);
    let sphereMaterial = new BABYLON.StandardMaterial('sphereMaterial', scene);
    sphereMaterial.diffuseColor  = new BABYLON.Color3(1.0, 0.7, 0.0);
    sphereMaterial.ambientColor  = new BABYLON.Color3(1.0, 0.7, 0.0);
    sphere.material = sphereMaterial;

    // Move the sphere upward 1/2 of its height
    sphere.position.y = 1;

    // Create a built-in "ground" shape
    let ground = BABYLON.MeshBuilder.CreateGround('ground', {height: 6, width: 6, subdivisions: 2}, scene);
    let groundMaterial = new BABYLON.StandardMaterial('groundMaterial', scene);
    groundMaterial.diffuseColor  = new BABYLON.Color3(0.82, 0.82, 0.82);
    groundMaterial.ambientColor  = new BABYLON.Color3(0.82, 0.82, 0.82);
    ground.material = groundMaterial;

    // Shadows
    let shadowGenerator = new BABYLON.ShadowGenerator(1024, light);
    shadowGenerator.getShadowMap().renderList.push(sphere);
    ground.receiveShadows = true;

    // Add wand
    BABYLON.SceneLoader.ImportMesh('Cylinder', 'assets/scene/newtwand/', 'newtwand.obj', scene, function(newMeshes) {
      wand = newMeshes[0];
      wandRoot = new BABYLON.Mesh('wandRoot', scene);
      wand.parent = wandRoot;

      wand.scaling = new BABYLON.Vector3(0.1, 0.1, 0.1);
      wand.rotation = new BABYLON.Vector3(Math.PI / 2, 0, 0); // point the wand upward
      prevAlpha = 1.0;

      // Add light at wand tip
      let lightColor = new BABYLON.Color3(1.0, 0.7, 0);
      lightSphere = BABYLON.MeshBuilder.CreateSphere('lightSphere', {diameter: 0.2}, scene);
      lightSphere.material = new BABYLON.StandardMaterial('LED', scene);
      lightSphere.material.emissiveColor = lightColor;
      lightSphere.setPivotPoint(new BABYLON.Vector3(0, 0, 7.2), BABYLON.Space.WORLD);
      let pos = lightSphere.getAbsolutePosition();
      lightSphere.parent = wand;
      lightSphere.setAbsolutePosition(pos);
      wandLight = new BABYLON.SpotLight('wandLight', new BABYLON.Vector3(0, 0, 0),
        new BABYLON.Vector3(0, 0, -Math.PI / 2), Math.PI / 4, 5, scene); // pos, dir, ang, exp
      wandLight.diffuse  = lightColor;
      wandLight.specular = lightColor;
      wandLight.parent   = lightSphere;
      hl = new BABYLON.HighlightLayer('hl', scene);
      hl.addMesh(lightSphere, lightColor);
      wandLight.setEnabled(false);
      lightSphere.setEnabled(false);

      wandRoot.position.y = 0.7;
      wand.setPivotPoint(new BABYLON.Vector3(0, 0, 0), BABYLON.Space.WORLD);
      wand.setAbsolutePosition(new BABYLON.Vector3(1, 4, -8));

      // Define target rotation
      targetRotX = Math.PI;
    });

    // Return the created scene
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

function wingardiumLeviosa() {
  if (!wlActive) {
    // Highlight target object
    hl.addMesh(sphere, BABYLON.Color3.Green());
    wlBasePos = lightSphere.getAbsolutePosition();

    // Update target position at interval
    let updateId = setInterval(function() {
      // Translate object according to difference in wand target
      let currPos = lightSphere.getAbsolutePosition();
      let delta   = currPos - wlBasePos;
      sphere.translate(BABYLON.Axis.X, delta.x, BABYLON.Space.WORLD);
      sphere.translate(BABYLON.Axis.Y, delta.y, BABYLON.Space.WORLD);
      sphere.translate(BABYLON.Axis.Z, delta.z, BABYLON.Space.WORLD);
    }, 100); // ms

    // Set timeout for effect expiration
    setTimeout(function() {
      hl.removeMesh(sphere);
      clearInterval(updateId);
      wlActive = false;
    }, 20000); // ms
    wlActive = true;
  }
}

function lumos() {
  if (!lightOn && !wlActive) {
    lightSphere.setEnabled(true);
    wandLight.setEnabled(true);
    lightOn = true;
  }
}

function nox() {
  if (lightOn && !wlActive) {
    wandLight.setEnabled(false);
    lightSphere.setEnabled(false);
    lightOn = false;
  }
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

  document.getElementById('wand').onclick = function() {
    // Listen to orientation events
    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleOrientation, false);
      logInfo('Device orientation supported!');
    } else {
      logInfo('Error: device orientation not supported!');
    }
  };

  document.getElementById('calibrate').onclick = function() {
    // Send calibration signal, so that the computer knows the phone is pointed at it
    socket.emit('calibrate');
  };

  $('#incantate').on('touchstart', function() {
    // Send signal to start recording
    socket.emit('recordstart');

    // (Button indication)
    $('#incantate').css({
      'transform': 'scale(1.2)',
      'background': '#cd0000'
    });
  }).on('touchend', function() {
    // Send signal to end recording
    socket.emit('recordend');

    // (Button indication)
    $('#incantate').css({
      'transform': 'scale(1.0)',
      'background': ''
    });
  });

  /*
   * RECEIVER
   */

  socket.on('alpha', function(alpha) {
    alpha = toRadians(alpha);
    if (wand != null) {
      wand.rotation.y = targetRotY - (alpha - baseAlpha);
    }
    prevAlpha = alpha;
  });
  socket.on('beta', function(beta) {
    beta = toRadians(beta);
    if (wand != null) {
      wand.rotation.x = targetRotX - (beta - baseBeta);
    }
    prevBeta = beta;
  });
  socket.on('gamma', function(gamma) {
    gamma = toRadians(gamma);
    if (wand != null) {
      wand.rotation.z = targetRotZ + (gamma - baseGamma);
    }
    prevGamma = gamma;
  });
  socket.on('calibrate', function() {
    // The phone is currently pointed at the screen
    baseAlpha = prevAlpha;
    baseBeta  = prevBeta;
    baseGamma = prevGamma;
  });
  socket.on('recordstart', function() {
    if (!speechRec.isRecording()) {
      speechRec.startRecognitionRecording();
    }
  });
  socket.on('recordend', function() {
    if (speechRec.isRecording()) {
      speechRec.stopRecording();
      let spell = speechRec.getTopRecognitionHypotheses(1)[0].match;
      if (spell === 'wingardium') {
        wingardiumLeviosa(); // perform "Wingardium Leviosa"
      } else if (spell === 'lumos') {
        lumos(); // perform "Lumos"
      } else {
        nox(); // perform "Nox"
      }
    }
  });

  document.getElementById('scene').onclick = function() {
    loadScene();
    speechRec = new JsSpeechRecognizer();
    speechRec.openMic();
  };
});
