import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const scene = new THREE.Scene();
const marmites = [];
const textureLoader = new THREE.TextureLoader();

function getRandomNumber(min, max) {
  return Math.random() * (max - min) + min;
}

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 15000);
camera.position.x = 300;
camera.position.y = 200;
camera.position.z = 4000;

const container = document.createElement('div');
document.body.appendChild(container);

// Navbar
const openNav = document.createElement('div');
openNav.className = 'open_nav';
openNav.innerHTML = '<a class="open_nav">team marmite</a>';
container.appendChild(openNav);

// Volume control - Swiss style: single line, single bead
const volumeControl = document.createElement('div');
volumeControl.className = 'volume-control';
volumeControl.innerHTML = `
  <div class="volume-track">
    <div class="volume-bead"></div>
  </div>
  <button class="mute-btn" title="Toggle mute">
    <svg class="speaker-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path class="speaker-body" d="M11 5L6 9H2v6h4l5 4V5z"/>
      <path class="speaker-wave-1" d="M15.5 8.5c1.5 1.5 1.5 5.5 0 7"/>
      <path class="speaker-wave-2" d="M19 5c3 3 3 11 0 14"/>
    </svg>
  </button>
`;
container.appendChild(volumeControl);

const navjar = document.createElement('nav');
navjar.style.textAlign = 'center';
navjar.innerHTML = '<p><a href="https://www.linkedin.com/in/sklenars" target="_blank">will</a></p><p><a href="https://github.com/kylesnowschwartz" target="_blank">kyle</a></p><p><a href="https://www.linkedin.com/in/teaihebutler" target="_blank">te aihe</a></p> <p class="close_nav">(close)</p>';
document.body.appendChild(navjar);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setClearColor(0xffffff);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
container.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Spawn distance - how far in front of camera jars appear
const spawnDistance = 2000;

// 3D grid matrix - evenly spaced black points for depth perception
const gridSpacing = 500;
const gridExtent = 6000; // +/- extent on each axis
const gridPoints = [];
for (let x = -gridExtent; x <= gridExtent; x += gridSpacing) {
  for (let y = -gridExtent; y <= gridExtent; y += gridSpacing) {
    for (let z = -gridExtent; z <= gridExtent; z += gridSpacing) {
      gridPoints.push(x, y, z);
    }
  }
}
const gridGeometry = new THREE.BufferGeometry();
gridGeometry.setAttribute('position', new THREE.Float32BufferAttribute(gridPoints, 3));
const gridMaterial = new THREE.PointsMaterial({ color: 0x000000, size: 2, sizeAttenuation: true });
const grid = new THREE.Points(gridGeometry, gridMaterial);
scene.add(grid);

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
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);

  // Spawn jar at fixed distance along the ray direction from camera
  const spawnPoint = new THREE.Vector3();
  raycaster.ray.at(spawnDistance, spawnPoint);

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

  marmite.position.copy(spawnPoint);
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

  marmite.spawnTime = Date.now();

  marmites.push(marmite);
  scene.add(marmite);
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
    const elapsed = Date.now() - marmites[i].spawnTime;

    marmites[i].rotation.x = elapsed * marmites[i].rotationParams[0];
    marmites[i].rotation.y = elapsed * marmites[i].rotationParams[1];
    marmites[i].rotation.z = elapsed * marmites[i].rotationParams[2];

    marmites[i].position.x = Math.sin(elapsed * marmites[i].revolutionParams[0][0]) * marmites[i].revolutionParams[0][1] + marmites[i].initialPosition[0];
    marmites[i].position.y = Math.sin(elapsed * marmites[i].revolutionParams[1][0]) * marmites[i].revolutionParams[1][1] + marmites[i].initialPosition[1];
    marmites[i].position.z = Math.sin(elapsed * marmites[i].revolutionParams[2][0]) * marmites[i].revolutionParams[2][1] + marmites[i].initialPosition[2];
  }

  controls.update();
  renderer.render(scene, camera);
}
render();

// Audio - note: modern browsers require user interaction before autoplay
const audio = new Audio('https://kylesnowschwartz.github.io/marmitegasm/audio/danube.mp3');
audio.loop = true;
audio.volume = 0.5;

// Wire up volume controls
const volumeTrack = document.querySelector('.volume-track');
const volumeBead = document.querySelector('.volume-bead');
const muteBtn = document.querySelector('.mute-btn');
const speakerWave1 = document.querySelector('.speaker-wave-1');
const speakerWave2 = document.querySelector('.speaker-wave-2');
let savedVolume = 0.5;
let isDragging = false;

function updateBeadPosition(vol) {
  // vol is 0-1, position bead from bottom (0) to top (1)
  const trackHeight = volumeTrack.offsetHeight;
  const beadHeight = volumeBead.offsetHeight;
  const maxY = trackHeight - beadHeight;
  volumeBead.style.top = (maxY - (vol * maxY)) + 'px';
}

function updateSpeakerIcon(vol, muted) {
  if (muted || vol === 0) {
    speakerWave1.style.display = 'none';
    speakerWave2.style.display = 'none';
  } else if (vol < 0.5) {
    speakerWave1.style.display = 'block';
    speakerWave2.style.display = 'none';
  } else {
    speakerWave1.style.display = 'block';
    speakerWave2.style.display = 'block';
  }
}

function setVolumeFromY(clientY) {
  const rect = volumeTrack.getBoundingClientRect();
  const y = clientY - rect.top;
  const vol = 1 - Math.max(0, Math.min(1, y / rect.height));
  audio.volume = vol;
  audio.muted = false;
  savedVolume = vol;
  updateBeadPosition(vol);
  updateSpeakerIcon(vol, false);
}

// Initialize bead position
setTimeout(() => updateBeadPosition(0.5), 0);

volumeTrack.addEventListener('mousedown', (e) => {
  e.stopPropagation();
  isDragging = true;
  setVolumeFromY(e.clientY);
});

document.addEventListener('mousemove', (e) => {
  if (isDragging) {
    setVolumeFromY(e.clientY);
  }
});

document.addEventListener('mouseup', () => {
  isDragging = false;
});

// Touch support
volumeTrack.addEventListener('touchstart', (e) => {
  e.stopPropagation();
  e.preventDefault();
  isDragging = true;
  setVolumeFromY(e.touches[0].clientY);
});

document.addEventListener('touchmove', (e) => {
  if (isDragging) {
    setVolumeFromY(e.touches[0].clientY);
  }
});

document.addEventListener('touchend', () => {
  isDragging = false;
});

muteBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  if (audio.muted || audio.volume === 0) {
    audio.muted = false;
    audio.volume = savedVolume || 0.5;
    updateBeadPosition(audio.volume);
    updateSpeakerIcon(audio.volume, false);
  } else {
    savedVolume = audio.volume;
    audio.muted = true;
    updateSpeakerIcon(0, true);
  }
});

muteBtn.addEventListener('mousedown', (e) => e.stopPropagation());
muteBtn.addEventListener('touchstart', (e) => e.stopPropagation());

document.addEventListener('click', () => {
  audio.play().catch(() => {});
}, { once: true });
