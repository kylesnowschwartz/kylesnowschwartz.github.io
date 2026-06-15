// Background Marmite Jars
// Spawns 3D jars on background clicks that bounce around the viewport.
// Two canvases: one behind content (z-index 0), one in front (z-index 2).
// Uses Three.js layers system so both renderers share one scene.

import * as THREE from 'three';

// Bail entirely if the user prefers reduced motion
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  // No jars, no canvases, no animation loop
} else {
  init();
}

function init() {
  const MAX_JARS = 50;
  const BEHIND_LAYER = 0;
  const FRONT_LAYER = 1;
  const BEHIND_CHANCE = 0.4;
  const MIGRATE_CHANCE = 0.3;
  const CAMERA_Z = 800;
  const SPAWN_Z = 0;

  // -- Canvases --
  const canvasBack = createCanvas(0);
  const canvasFront = createCanvas(2);
  document.body.appendChild(canvasBack);
  document.body.appendChild(canvasFront);

  // -- Scene --
  const scene = new THREE.Scene();

  // -- Cameras (one per layer) --
  const cameraBack = makeCamera();
  cameraBack.layers.set(BEHIND_LAYER);
  const cameraFront = makeCamera();
  cameraFront.layers.set(FRONT_LAYER);

  // -- Renderers --
  const rendererBack = makeRenderer(canvasBack);
  const rendererFront = makeRenderer(canvasFront);

  // -- Shared geometry + textures --
  const geometry = new THREE.CylinderGeometry(0.75, 0.75, 1.5, 32);

  const loader = new THREE.TextureLoader();
  const labelTex = loader.load('/marmiteroids/images/marmiteroids_label2.jpg');
  const topTex = loader.load('/marmiteroids/images/cap_red.jpg');
  const bottomTex = loader.load('/marmiteroids/images/bottom.jpg');
  labelTex.colorSpace = THREE.SRGBColorSpace;
  topTex.colorSpace = THREE.SRGBColorSpace;
  bottomTex.colorSpace = THREE.SRGBColorSpace;

  // Front-layer materials (opaque, full size)
  const frontMaterials = [
    new THREE.MeshBasicMaterial({ map: labelTex }),
    new THREE.MeshBasicMaterial({ map: topTex }),
    new THREE.MeshBasicMaterial({ map: bottomTex }),
  ];

  // Behind-layer materials (semi-transparent for depth cue)
  const behindMaterials = [
    new THREE.MeshBasicMaterial({ map: labelTex, transparent: true, opacity: 0.5 }),
    new THREE.MeshBasicMaterial({ map: topTex, transparent: true, opacity: 0.5 }),
    new THREE.MeshBasicMaterial({ map: bottomTex, transparent: true, opacity: 0.5 }),
  ];

  // -- State --
  const jars = [];

  // -- World bounds (computed from camera frustum) --
  let boundsX = 0;
  let boundsY = 0;
  computeBounds();

  // -- Click handler --
  // Spawn a jar anywhere EXCEPT on genuinely interactive controls. We only
  // guard things a click is meant to *operate* (links, buttons, form fields) --
  // not structural containers, so clicks on text/empty content still spawn.
  const INTERACTIVE_SELECTORS = 'a, button, summary, label, input, select, textarea, [role="button"], [role="link"]';

  document.addEventListener('click', (e) => {
    if (e.target.closest(INTERACTIVE_SELECTORS)) return;

    const worldPos = screenToWorld(e.clientX, e.clientY);
    spawnJar(worldPos.x, worldPos.y);
  });

  // -- Resize --
  window.addEventListener('resize', () => {
    const w = window.innerWidth;
    const h = window.innerHeight;

    cameraBack.aspect = w / h;
    cameraBack.updateProjectionMatrix();
    cameraFront.aspect = w / h;
    cameraFront.updateProjectionMatrix();

    rendererBack.setSize(w, h);
    rendererFront.setSize(w, h);

    computeBounds();
  });

  // -- Animation loop --
  const startTime = Date.now();

  function animate() {
    requestAnimationFrame(animate);
    const elapsed = Date.now() - startTime;

    for (const jar of jars) {
      const t = elapsed + jar.timeOffset;

      // Linear drift + bounce
      jar.baseX += jar.vx;
      jar.baseY += jar.vy;

      let bounced = false;
      if (jar.baseX < -boundsX || jar.baseX > boundsX) {
        jar.vx *= -1;
        jar.baseX = Math.max(-boundsX, Math.min(boundsX, jar.baseX));
        bounced = true;
      }
      if (jar.baseY < -boundsY || jar.baseY > boundsY) {
        jar.vy *= -1;
        jar.baseY = Math.max(-boundsY, Math.min(boundsY, jar.baseY));
        bounced = true;
      }

      // Random chance to migrate between layers on bounce
      if (bounced && Math.random() < MIGRATE_CHANCE) {
        migrateJar(jar);
      }

      // Wobble oscillation layered on top of drift (matches sidebar jar motion)
      jar.mesh.position.x = jar.baseX + Math.sin(t * jar.wobble[0][0]) * jar.wobble[0][1];
      jar.mesh.position.y = jar.baseY + Math.sin(t * jar.wobble[1][0]) * jar.wobble[1][1];
      jar.mesh.position.z = Math.sin(t * jar.wobble[2][0]) * jar.wobble[2][1];

      // Chaotic tumble rotation
      jar.mesh.rotation.x = t * jar.rotSpeeds[0];
      jar.mesh.rotation.y = t * jar.rotSpeeds[1];
      jar.mesh.rotation.z = t * jar.rotSpeeds[2];

      // Breathing scale pulse
      const s = jar.baseScale + Math.sin(t * jar.scalePulse.freq) * jar.scalePulse.amount;
      jar.mesh.scale.setScalar(s);
    }

    rendererBack.render(scene, cameraBack);
    rendererFront.render(scene, cameraFront);
  }

  animate();

  // -- Helpers --

  function createCanvas(zIndex) {
    const c = document.createElement('canvas');
    Object.assign(c.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      zIndex: String(zIndex),
    });
    return c;
  }

  function makeCamera() {
    const cam = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      0.1,
      2000,
    );
    cam.position.z = CAMERA_Z;
    return cam;
  }

  function makeRenderer(canvas) {
    const r = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    r.setSize(window.innerWidth, window.innerHeight);
    r.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    return r;
  }

  function computeBounds() {
    // Visible width/height at z=0 for a perspective camera
    const vFov = (cameraBack.fov * Math.PI) / 180;
    const height = 2 * Math.tan(vFov / 2) * CAMERA_Z;
    const width = height * cameraBack.aspect;
    // Pad inward by jar radius so jars don't clip halfway off-screen
    boundsX = width / 2 - 40;
    boundsY = height / 2 - 40;
  }

  function screenToWorld(clientX, clientY) {
    // NDC: [-1, 1]
    const ndcX = (clientX / window.innerWidth) * 2 - 1;
    const ndcY = -(clientY / window.innerHeight) * 2 + 1;

    const ndc = new THREE.Vector3(ndcX, ndcY, 0.5);
    ndc.unproject(cameraBack);

    // Ray from camera to unprojected point, intersect with z=0 plane
    const dir = ndc.sub(cameraBack.position).normalize();
    const t = -cameraBack.position.z / dir.z;
    return new THREE.Vector3(
      cameraBack.position.x + dir.x * t,
      cameraBack.position.y + dir.y * t,
      SPAWN_Z,
    );
  }

  function migrateJar(jar) {
    const isBehind = jar.mesh.layers.mask === (1 << BEHIND_LAYER);
    const newLayer = isBehind ? FRONT_LAYER : BEHIND_LAYER;
    const newBehind = !isBehind;
    const newScale = newBehind ? 12.5 : 17.5;
    const newRotSpeed = newBehind ? 0.0005 : 0.001;

    // Swap layer and materials
    jar.mesh.layers.set(newLayer);
    jar.mesh.material = newBehind ? behindMaterials : frontMaterials;

    // Rescale wobble amplitudes proportionally
    const scaleRatio = newScale / jar.baseScale;
    for (const w of jar.wobble) {
      w[1] *= scaleRatio;
    }

    jar.baseScale = newScale;
    jar.scalePulse.amount = newScale * (0.03 + Math.random() * 0.07);
    jar.rotSpeeds = [
      newRotSpeed * (0.5 + Math.random()),
      newRotSpeed * (0.5 + Math.random()),
      newRotSpeed * (0.5 + Math.random()),
    ];
  }

  function spawnJar(x, y) {
    const isBehind = Math.random() < BEHIND_CHANCE;
    const layer = isBehind ? BEHIND_LAYER : FRONT_LAYER;
    const baseScale = isBehind ? 12.5 : 17.5;
    const rotSpeed = isBehind ? 0.0005 : 0.001;

    const mesh = new THREE.Mesh(
      geometry,
      isBehind ? behindMaterials : frontMaterials,
    );
    mesh.position.set(x, y, SPAWN_Z);
    mesh.scale.setScalar(baseScale);
    mesh.layers.set(layer);
    scene.add(mesh);

    // Random velocity (world units per frame)
    const angle = Math.random() * Math.PI * 2;
    const speed = 0.8 + Math.random() * 1.2;

    jars.push({
      mesh,
      baseX: x,
      baseY: y,
      baseScale,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      rotSpeeds: [
        rotSpeed * (0.5 + Math.random()),
        rotSpeed * (0.5 + Math.random()),
        rotSpeed * (0.5 + Math.random()),
      ],
      // Sinusoidal wobble per axis: [frequency, amplitude]
      // Matches the sidebar jar wobble pattern from index.astro
      wobble: [
        [0.0001 + Math.random() * 0.0002, (0.2 + Math.random() * 0.4) * baseScale],
        [0.0001 + Math.random() * 0.0002, (0.2 + Math.random() * 0.4) * baseScale],
        [0.0001 + Math.random() * 0.0002, (0.2 + Math.random() * 0.3) * baseScale],
      ],
      // Breathing scale pulse
      scalePulse: {
        freq: 0.0005 + Math.random() * 0.001,
        amount: baseScale * (0.03 + Math.random() * 0.07),
      },
      timeOffset: Math.random() * 10000,
    });

    // Evict oldest jar if over limit
    if (jars.length > MAX_JARS) {
      const old = jars.shift();
      scene.remove(old.mesh);
    }
  }
}
