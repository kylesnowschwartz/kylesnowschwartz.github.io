# Marmiteroids

Interactive 3D art piece - floating Marmite jars in an infinite space.

## Tech Stack

- **Three.js** via ES6 module imports (CDN)
- **OrbitControls** for camera manipulation
- Vanilla JS, no build step
- GitHub Pages deployment (push to master = live)

## Local Development

```bash
# From repo root, run:
python3 -m http.server 8080

# Then visit: http://localhost:8080/marmiteroids/
```

## Architecture

```
marmiteroids/
  index.html          # Entry point with importmap for Three.js
  javascripts/
    application.js    # Main Three.js scene, nav, audio - all logic
  stylesheets/
    application.css   # Swiss-style minimal CSS
  images/             # Jar textures (label, cap, bottom)
  audio/              # Background music (danube_compressed.mp3)
```

## Key Concepts

### Scene Setup
- White background, black 3D point grid for depth perception
- Grid: 60k cube (gridExtent=30000), spacing=1400
- Camera far plane: 100000, max zoom: 20000

### Jar Spawning
- Click spawns jar at fixed distance (5000) along camera ray
- Hold 800ms+ then release to "shoot" jar with velocity
- Shared geometry/materials across all jars for memory efficiency

### Physics
- Shot jars bounce off grid boundaries (±30000)
- Jar-to-jar collision with elastic response
- Stationary jars get knocked loose on impact
- O(n^2) collision - fine for hundreds, may slow at 500+ moving jars

### Audio
- Volume/mute persisted to localStorage
- Swiss-style vertical slider (black bead on black line)
- Speaker icon reflects volume level and mute state

## Interactions

| Action | Result |
|--------|--------|
| Click | Spawn stationary jar |
| Hold 800ms + release | Shoot jar into space |
| Shift + click jar | Delete jar |
| Scroll/drag | OrbitControls camera |

## Performance Notes

- Textures loaded once at startup, shared across all jars
- Geometry shared - each jar is just a Mesh reference (~5-10KB)
- Can handle 3000+ jars without memory issues
- Collision detection is the bottleneck for many moving jars
