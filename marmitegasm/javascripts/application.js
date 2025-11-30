import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const scene = new THREE.Scene();
const marmites = [];
const textureLoader = new THREE.TextureLoader();

function getRandomNumber(min, max) {
  return Math.random() * (max - min) + min;
}

// Shared geometry and materials for all jars (massive memory savings)
const sharedGeometry = new THREE.CylinderGeometry(75, 75, 150, 70, 5, false);

const labelTexture = textureLoader.load('images/marmitegasm_label2.jpg');
const topTexture = textureLoader.load('images/cap_red.jpg');
const bottomTexture = textureLoader.load('images/bottom.jpg');
labelTexture.colorSpace = THREE.SRGBColorSpace;
topTexture.colorSpace = THREE.SRGBColorSpace;
bottomTexture.colorSpace = THREE.SRGBColorSpace;

const sharedMaterials = [
  new THREE.MeshBasicMaterial({ map: labelTexture }),
  new THREE.MeshBasicMaterial({ map: topTexture }),
  new THREE.MeshBasicMaterial({ map: bottomTexture })
];

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 100000);
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
      <path class="speaker-mute-x" d="M15 9l6 6M21 9l-6 6" style="display: none;"/>
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
controls.maxDistance = 20000; // Prevent zooming out beyond the point cloud
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Spawn distance - how far in front of camera jars appear
const spawnDistance = 5000;
const shootSpeed = 50; // Units per frame for shot jars
const shootHoldTime = 800; // ms to hold for shooting

// Track mouse state for shoot mechanic
let mouseDownTime = 0;
let mouseDownEvent = null;

// 3D grid matrix - evenly spaced black points for depth perception
const gridSpacing = 1400;
const gridExtent = 30000; // +/- extent on each axis
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
const gridMaterial = new THREE.PointsMaterial({ color: 0x000000, size: 6, sizeAttenuation: true });
const grid = new THREE.Points(gridGeometry, gridMaterial);
scene.add(grid);

document.addEventListener('mousedown', onDocumentMouseDown, false);
document.addEventListener('mouseup', onDocumentMouseUp, false);
document.addEventListener('mousedown', onDocumentMouseDownShift, false);
document.addEventListener('touchstart', onDocumentTouchStart, false);
document.addEventListener('touchend', onDocumentTouchEnd, false);
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

function onDocumentTouchEnd(event) {
  onDocumentMouseUp(event);
}

function onDocumentMouseDown(event) {
  mouseDownTime = Date.now();
  mouseDownEvent = { clientX: event.clientX, clientY: event.clientY };
}

function onDocumentMouseUp(event) {
  if (!mouseDownEvent) return;

  const holdDuration = Date.now() - mouseDownTime;
  const isShot = holdDuration >= shootHoldTime;

  spawnMarmite(mouseDownEvent.clientX, mouseDownEvent.clientY, isShot);
  mouseDownEvent = null;
}

function spawnMarmite(clientX, clientY, isShot) {
  mouse.x = (clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);

  // Spawn jar at fixed distance along the ray direction from camera
  const spawnPoint = new THREE.Vector3();
  raycaster.ray.at(spawnDistance, spawnPoint);

  // Use shared geometry and materials for all jars
  const marmite = new THREE.Mesh(sharedGeometry, sharedMaterials);

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

  // If shot, give it velocity along the ray direction (away from camera)
  if (isShot) {
    const direction = raycaster.ray.direction.clone();
    marmite.velocity = direction.multiplyScalar(shootSpeed);
  } else {
    marmite.velocity = null;
  }

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

// Jar collision radius (cylinder is 75 radius * 2 scale = 150, use slightly less for visual overlap)
const jarCollisionRadius = 280;

function render() {
  requestAnimationFrame(render);

  // Update positions first
  for (let i = 0; i < marmites.length; i++) {
    const marmite = marmites[i];
    const elapsed = Date.now() - marmite.spawnTime;

    marmite.rotation.x = elapsed * marmite.rotationParams[0];
    marmite.rotation.y = elapsed * marmite.rotationParams[1];
    marmite.rotation.z = elapsed * marmite.rotationParams[2];

    // Shot jars fly away, regular jars oscillate
    if (marmite.velocity) {
      marmite.initialPosition[0] += marmite.velocity.x;
      marmite.initialPosition[1] += marmite.velocity.y;
      marmite.initialPosition[2] += marmite.velocity.z;

      // Bounce off grid boundaries
      if (marmite.initialPosition[0] > gridExtent || marmite.initialPosition[0] < -gridExtent) {
        marmite.velocity.x *= -1;
        marmite.initialPosition[0] = Math.max(-gridExtent, Math.min(gridExtent, marmite.initialPosition[0]));
      }
      if (marmite.initialPosition[1] > gridExtent || marmite.initialPosition[1] < -gridExtent) {
        marmite.velocity.y *= -1;
        marmite.initialPosition[1] = Math.max(-gridExtent, Math.min(gridExtent, marmite.initialPosition[1]));
      }
      if (marmite.initialPosition[2] > gridExtent || marmite.initialPosition[2] < -gridExtent) {
        marmite.velocity.z *= -1;
        marmite.initialPosition[2] = Math.max(-gridExtent, Math.min(gridExtent, marmite.initialPosition[2]));
      }
    }

    marmite.position.x = Math.sin(elapsed * marmite.revolutionParams[0][0]) * marmite.revolutionParams[0][1] + marmite.initialPosition[0];
    marmite.position.y = Math.sin(elapsed * marmite.revolutionParams[1][0]) * marmite.revolutionParams[1][1] + marmite.initialPosition[1];
    marmite.position.z = Math.sin(elapsed * marmite.revolutionParams[2][0]) * marmite.revolutionParams[2][1] + marmite.initialPosition[2];
  }

  // Check jar-to-jar collisions (only between moving jars)
  for (let i = 0; i < marmites.length; i++) {
    for (let j = i + 1; j < marmites.length; j++) {
      const a = marmites[i];
      const b = marmites[j];

      // Skip if neither jar is moving
      if (!a.velocity && !b.velocity) continue;

      const dx = a.position.x - b.position.x;
      const dy = a.position.y - b.position.y;
      const dz = a.position.z - b.position.z;
      const distSq = dx * dx + dy * dy + dz * dz;
      const minDist = jarCollisionRadius * 2;

      if (distSq < minDist * minDist) {
        const dist = Math.sqrt(distSq);
        // Normalize collision axis
        const nx = dx / dist;
        const ny = dy / dist;
        const nz = dz / dist;

        // If one jar is stationary, give it velocity from the collision
        if (a.velocity && !b.velocity) {
          // Transfer momentum to stationary jar
          const speed = Math.sqrt(a.velocity.x ** 2 + a.velocity.y ** 2 + a.velocity.z ** 2);
          b.velocity = new THREE.Vector3(nx * speed * -0.8, ny * speed * -0.8, nz * speed * -0.8);
          a.velocity.x *= -0.8;
          a.velocity.y *= -0.8;
          a.velocity.z *= -0.8;
        } else if (!a.velocity && b.velocity) {
          // Transfer momentum to stationary jar
          const speed = Math.sqrt(b.velocity.x ** 2 + b.velocity.y ** 2 + b.velocity.z ** 2);
          a.velocity = new THREE.Vector3(nx * speed * 0.8, ny * speed * 0.8, nz * speed * 0.8);
          b.velocity.x *= -0.8;
          b.velocity.y *= -0.8;
          b.velocity.z *= -0.8;
        } else {
          // Both moving - swap velocity components along collision axis
          const aVelDotN = a.velocity.x * nx + a.velocity.y * ny + a.velocity.z * nz;
          const bVelDotN = b.velocity.x * nx + b.velocity.y * ny + b.velocity.z * nz;

          a.velocity.x += (bVelDotN - aVelDotN) * nx;
          a.velocity.y += (bVelDotN - aVelDotN) * ny;
          a.velocity.z += (bVelDotN - aVelDotN) * nz;

          b.velocity.x += (aVelDotN - bVelDotN) * nx;
          b.velocity.y += (aVelDotN - bVelDotN) * ny;
          b.velocity.z += (aVelDotN - bVelDotN) * nz;
        }

        // Separate jars so they don't stick together
        const overlap = minDist - dist;
        a.initialPosition[0] += nx * overlap * 0.5;
        a.initialPosition[1] += ny * overlap * 0.5;
        a.initialPosition[2] += nz * overlap * 0.5;
        b.initialPosition[0] -= nx * overlap * 0.5;
        b.initialPosition[1] -= ny * overlap * 0.5;
        b.initialPosition[2] -= nz * overlap * 0.5;
      }
    }
  }

  controls.update();
  renderer.render(scene, camera);
}
render();

// Audio - note: modern browsers require user interaction before autoplay
const audio = new Audio('https://kylesnowschwartz.github.io/marmitegasm/audio/danube.mp3');
audio.loop = true;

// Load persisted audio preferences
const storedVolume = localStorage.getItem('marmite-volume');
const storedMuted = localStorage.getItem('marmite-muted');
const initialVolume = storedVolume !== null ? parseFloat(storedVolume) : 0.5;
const initialMuted = storedMuted === 'true';

audio.volume = initialVolume;
audio.muted = initialMuted;

// Wire up volume controls
const volumeTrack = document.querySelector('.volume-track');
const volumeBead = document.querySelector('.volume-bead');
const muteBtn = document.querySelector('.mute-btn');
const speakerWave1 = document.querySelector('.speaker-wave-1');
const speakerWave2 = document.querySelector('.speaker-wave-2');
const speakerMuteX = document.querySelector('.speaker-mute-x');
let savedVolume = initialVolume;
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
    speakerMuteX.style.display = 'block';
  } else if (vol < 0.5) {
    speakerWave1.style.display = 'block';
    speakerWave2.style.display = 'none';
    speakerMuteX.style.display = 'none';
  } else {
    speakerWave1.style.display = 'block';
    speakerWave2.style.display = 'block';
    speakerMuteX.style.display = 'none';
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
  localStorage.setItem('marmite-volume', vol);
  localStorage.setItem('marmite-muted', 'false');
}

// Initialize UI to reflect stored state
setTimeout(() => {
  updateBeadPosition(initialVolume);
  updateSpeakerIcon(initialVolume, initialMuted);
}, 0);

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
    localStorage.setItem('marmite-muted', 'false');
  } else {
    savedVolume = audio.volume;
    audio.muted = true;
    updateSpeakerIcon(0, true);
    localStorage.setItem('marmite-muted', 'true');
  }
});

muteBtn.addEventListener('mousedown', (e) => e.stopPropagation());
muteBtn.addEventListener('touchstart', (e) => e.stopPropagation());

document.addEventListener('click', () => {
  audio.play().catch(() => {});
}, { once: true });
