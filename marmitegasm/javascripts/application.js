import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const scene = new THREE.Scene();
const marmites = [];
const textureLoader = new THREE.TextureLoader();

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 10000);
camera.position.x = 0;
camera.position.y = 0;
camera.position.z = 2050;

const container = document.createElement('div');
document.body.appendChild(container);

// Navbar
const openNav = document.createElement('div');
openNav.className = 'open_nav';
openNav.innerHTML = '<a class="open_nav">team marmite</a>';
container.appendChild(openNav);

const navjar = document.createElement('nav');
navjar.style.textAlign = 'center';
navjar.innerHTML = '<p><a href="https://github.com/SkwynethPaltrow" target="_blank">will</a></p><p><a href="https://github.com/hoanganhdinhtrinh" target="_blank">hoang</a></p><p><a href="https://github.com/kylesnowschwartz" target="_blank">kyle</a></p><p><a href="https://github.com/teaiheb" target="_blank">te aihe</a></p> <p class="close_nav">(close)</p>';
document.body.appendChild(navjar);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setClearColor(0xffffff);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
container.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// The clickable sphere (invisible white background sphere)
const toastGeometry = new THREE.SphereGeometry(7000, 80, 80);
const toastMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, side: THREE.DoubleSide });
const toast = new THREE.Mesh(toastGeometry, toastMaterial);
scene.add(toast);

document.addEventListener('mousedown', onDocumentMouseDown, false);
document.addEventListener('mousedown', onDocumentMouseDownShift, false);
document.addEventListener('touchstart', onDocumentTouchStart, false);
window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function onDocumentTouchStart(event) {
  event.preventDefault();
  event.clientX = event.touches[0].clientX;
  event.clientY = event.touches[0].clientY;
  onDocumentMouseDown(event);
}

function onDocumentMouseDown(event) {
  mouse.x = (event.clientX / renderer.domElement.width) * 2 - 1;
  mouse.y = -(event.clientY / renderer.domElement.height) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObjects([toast]);
  if (intersects.length > 0) {
    // Load textures using modern TextureLoader (relative paths work locally and on GitHub Pages)
    const labelmap = textureLoader.load('images/marmitegasm_label2.jpg');
    const topmap = textureLoader.load('images/cap_red.jpg');
    const bottommap = textureLoader.load('images/bottom.jpg');

    const labelMaterial = new THREE.MeshBasicMaterial({ map: labelmap });
    const topMaterial = new THREE.MeshBasicMaterial({ map: topmap });
    const bottomMaterial = new THREE.MeshBasicMaterial({ map: bottommap });

    // CylinderGeometry material groups in modern Three.js: [side, top, bottom]
    const materials = [labelMaterial, topMaterial, bottomMaterial];

    const geometry = new THREE.CylinderGeometry(75, 75, 150, 70, 5, false);
    const marmite = new THREE.Mesh(geometry, materials);

    marmite.position.copy(intersects[0].point);
    marmite.position.z += getRandomNumber(800, 1500);
    marmite.initialPosition = [marmite.position.x, marmite.position.y, marmite.position.z];

    marmite.scale.set(2, 2, 2);

    // Rotation parameters
    const rotationParams = [];
    for (let i = 0; i < 3; i++) {
      rotationParams.push(getRandomNumber(0.003, 0.0001));
    }
    marmite.rotationParams = rotationParams;

    // Revolution/oscillation parameters
    const revolutionParams = [];
    for (let i = 0; i < 3; i++) {
      revolutionParams.push([getRandomNumber(0.00009, 0.0003), getRandomNumber(500, 1000)]);
    }
    marmite.revolutionParams = revolutionParams;

    marmites.push(marmite);
    scene.add(marmite);
  }
}

function onDocumentMouseDownShift(event) {
  const intersects2 = raycaster.intersectObjects(marmites);
  if (event.shiftKey && intersects2.length > 0) {
    event.preventDefault();
    const intersectedMarmite = intersects2[0].object;
    scene.remove(intersectedMarmite);
    const index = marmites.indexOf(intersectedMarmite);
    if (index > -1) {
      marmites.splice(index, 1);
    }
  }
}

function render() {
  requestAnimationFrame(render);

  for (let i = 0; i < marmites.length; i++) {
    marmites[i].rotation.x = Date.now() * marmites[i].rotationParams[0];
    marmites[i].rotation.y = Date.now() * marmites[i].rotationParams[1];
    marmites[i].rotation.z = Date.now() * marmites[i].rotationParams[2];

    marmites[i].position.x = Math.sin(Date.now() * marmites[i].revolutionParams[0][0]) * marmites[i].revolutionParams[0][1] + marmites[i].initialPosition[0];
    marmites[i].position.y = Math.sin(Date.now() * marmites[i].revolutionParams[1][0]) * marmites[i].revolutionParams[1][1] + marmites[i].initialPosition[1];
    marmites[i].position.z = Math.sin(Date.now() * marmites[i].revolutionParams[2][0]) * marmites[i].revolutionParams[2][1] + marmites[i].initialPosition[2];
  }

  controls.update();
  renderer.render(scene, camera);
}
render();

function getRandomNumber(min, max) {
  return Math.random() * (max - min) + min;
}

// Audio - note: modern browsers require user interaction before autoplay
const audio = new Audio('https://kylesnowschwartz.github.io/marmitegasm/audio/danube.mp3');
document.addEventListener('click', () => {
  audio.play().catch(() => {});
}, { once: true });
