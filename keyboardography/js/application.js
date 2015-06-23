// application.js

// orbit controls

// goal 0: render a 3d key on the page

// goal 1: make a 3d key next to that key with some non-trivial height

// goal 2: build a function to auto generate a row of those keys

// goal 3: each square should be a little square object, they will have a property called height which is mutable. Change this on event listener

// goal 4:

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
var renderer = new THREE.WebGLRenderer();
var controls = new THREE.OrbitControls( camera );

renderer.setClearColor( 0xffffff, 1);

renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

var geometry = new THREE.BoxGeometry( 1, .1, 1 );
var material = new THREE.MeshBasicMaterial( {color: 0xd3d3d3} );
var cube = new THREE.Mesh( geometry, material );
var cubeEdges = new THREE.EdgesHelper( cube, 0xffffff);

var row1letters = ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"]
var row2letters = ["a", "s", "d", "f", "g", "h", "j", "k", "l"]
var row3letters = ["z", "x", "c", "v", "b", "n", "m"]
var keys = {}

for (var i = 0; i < row1letters.length; i++) {
  var letter = row1letters[i];
  var geometry = new THREE.BoxGeometry( 1, .1, 1 );
  var material = new THREE.MeshBasicMaterial( {color: 0xd3d3d3} );
  var cube = new THREE.Mesh( geometry, material );
  var cubeEdges = new THREE.EdgesHelper( cube, 0xffffff);
  scene.add( cube );
  scene.add( cubeEdges );
  cube.position.x = (i + 0.2 * i) -5.6;
  cube.position.z = -6.5
  keys[letter] = cube
}

for (var i = 0; i < row2letters.length; i++) {
  var letter = row2letters[i];
  var geometry = new THREE.BoxGeometry( 1, .1, 1 );
  var material = new THREE.MeshBasicMaterial( {color: 0xd3d3d3} );
  var cube = new THREE.Mesh( geometry, material );
  var cubeEdges = new THREE.EdgesHelper( cube, 0xffffff);
  scene.add( cube );
  scene.add( cubeEdges );
  cube.position.x = (i + 0.2 * i) -5;
  cube.position.z = -5
  keys[letter] = cube
}

for (var i = 0; i < row3letters.length; i++) {
  var letter = row3letters[i];
  var geometry = new THREE.BoxGeometry( 1, .1, 1 );
  var material = new THREE.MeshBasicMaterial( {color: 0xd3d3d3} );
  var cube = new THREE.Mesh( geometry, material );
  var cubeEdges = new THREE.EdgesHelper( cube, 0xffffff);
  scene.add( cube );
  scene.add( cubeEdges );
  cube.position.x = (i + 0.2 * i) -4.4;
  cube.position.z = -3.5
  console.log(cube)
  keys[letter] = cube
}

$(document).on("keypress", function(e) {
  var letter = String.fromCharCode(e.keyCode);
  var cube = keys[letter]
  if (cube) {
    cube.scale.y += 1
  }
});

camera.position.z = 8;
camera.position.y = 5;

function render() {
  requestAnimationFrame( render );

  renderer.render( scene, camera );
}
render();

