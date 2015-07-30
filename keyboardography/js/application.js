// application.js

// orbit controls

// goal 0: render a 3d key on the page

// goal 1: make a 3d key next to that key with some non-trivial height

// goal 2: build a function to auto generate a row of those keys

// goal 3: each square should be a little square object, they will have a property called height which is mutable. Change this on event listener

// goal 4:

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 1000 );
var renderer = new THREE.WebGLRenderer();
var controls = new THREE.OrbitControls( camera );

renderer.setClearColor( 0xffffff, 1);

renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

// var geometry = new THREE.BoxGeometry( 1, .1, 1 );
// var material = new THREE.MeshBasicMaterial( {color: 0xd3d3d3} );
// var cube = new THREE.Mesh( geometry, material );
// var cubeEdges = new THREE.EdgesHelper( cube, 0xffffff);


var $1234 = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "="]
var qwerty = ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", "[", "]"]
var asdf = ["A", "S", "D", "F", "G", "H", "J", "K", "L", ";", "'"]
var zxcv = ["Z", "X", "C", "V", "B", "N", "M", ",", ".", "/"]
var keys = {}


for (var i = 0; i < $1234.length; i++) {
  var letter = $1234[i];
  var letterimage = THREE.ImageUtils.loadTexture('./assets/images/computer_key_' + $1234[i] + '.png');
  var geometry = new THREE.BoxGeometry( 1, .1, 1 );
  // var material = new THREE.MeshBasicMaterial( {color: 0xd3d3d3} );
  var material = new THREE.MeshBasicMaterial( {map: letterimage} );
  var cube = new THREE.Mesh( geometry, material );
  var cubeEdges = new THREE.EdgesHelper( cube, 0xffffff);
  scene.add( cube );
  scene.add( cubeEdges );
  cube.position.x = (i + 0.2 * i) -6.2;
  cube.position.z = -6.0
  keys[letter] = cube
}

for (var i = 0; i < qwerty.length; i++) {
  var letter = qwerty[i];
  var letterimage = THREE.ImageUtils.loadTexture('./assets/images/computer_key_' + qwerty[i] + '.png');
  var material = new THREE.MeshBasicMaterial( {map: letterimage} );
  var geometry = new THREE.BoxGeometry( 1, .1, 1 );
  // var material = new THREE.MeshBasicMaterial( {color: 0xd3d3d3} );
  var cube = new THREE.Mesh( geometry, material );
  var cubeEdges = new THREE.EdgesHelper( cube, 0xffffff);
  scene.add( cube );
  scene.add( cubeEdges );
  cube.position.x = (i + 0.2 * i) -5.6;
  cube.position.z = -4.5
  keys[letter] = cube
}

for (var i = 0; i < asdf.length; i++) {
  var letter = asdf[i];
  var geometry = new THREE.BoxGeometry( 1, .1, 1 );
  var letterimage = THREE.ImageUtils.loadTexture('./assets/images/computer_key_' + asdf[i] + '.png');
  var material = new THREE.MeshBasicMaterial( {map: letterimage} );
  // var material = new THREE.MeshBasicMaterial( {color: 0xd3d3d3} );
  var cube = new THREE.Mesh( geometry, material );
  var cubeEdges = new THREE.EdgesHelper( cube, 0xffffff);
  scene.add( cube );
  scene.add( cubeEdges );
  cube.position.x = (i + 0.2 * i) -5;
  cube.position.z = -3
  keys[letter] = cube
}

for (var i = 0; i < zxcv.length; i++) {
  var letter = zxcv[i];
  var geometry = new THREE.BoxGeometry( 1, .1, 1 );
  var letterimage = THREE.ImageUtils.loadTexture('./assets/images/computer_key_' + zxcv[i] + '.png');
  var material = new THREE.MeshBasicMaterial( {map: letterimage} );
  // var material = new THREE.MeshBasicMaterial( {color: 0xd3d3d3} );
  var cube = new THREE.Mesh( geometry, material );
  var cubeEdges = new THREE.EdgesHelper( cube, 0xffffff);
  scene.add( cube );
  scene.add( cubeEdges );
  cube.position.x = (i + 0.2 * i) -4.4;
  cube.position.z = -1.5
  console.log(cube)
  keys[letter] = cube
}

$(document).on("keypress", function(e) {
  var letter = String.fromCharCode(e.keyCode);
  var cube = keys[letter]
  if (cube) {
    cube.scale.y += 1
    cube.position.y += 0.05 
  }
});


camera.position.z = 4;
camera.position.y = 7;
camera.position.x = 1;
// camera.position.set(0,0,10);
// camera.up = new THREE.Vector3(2,1,20);
// camera.lookAt(new THREE.Vector3(0,0,0));

console.log(camera)
camera.rotation.x = -1 
camera.rotation.y = 0.0 
camera.rotation.z = 0.0 

function render() {
  requestAnimationFrame( render );

  // cube.rotation.x += 0.1;
  // cube.rotation.y += 0.1;

  renderer.render( scene, camera );
}
render();

