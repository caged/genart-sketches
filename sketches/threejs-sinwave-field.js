const canvasSketch = require('canvas-sketch')
const {lerp} = require('../utils/lerp')

// Assign THREE to global for the examples/
const THREE = (global.THREE = require('three'))

// Include any additional ThreeJS utilities
require('three/examples/js/controls/OrbitControls')
require('three/examples/js/renderers/CanvasRenderer')

// Parameters for the sketch
const settings = {
  pixelRatio: devicePixelRatio,
  animate: true, // Ensure we get an animation loop
  context: 'webgl', // Setup WebGL instead of 2D canvas
  attributes: {antialias: true} // Turn on MSAA
}

const sketch = ({context, width, height}) => {
  const renderer = new THREE.WebGLRenderer({
    context
  })

  const rows = 50
  const cols = 100
  const startHSL = [0.1, 1, 0.5]
  const frequency = 3

  // Setup a 3D perspective camera
  const camera = new THREE.PerspectiveCamera(75, width / height, 0.01, 100)
  camera.position.set(0, 5, 100)
  camera.lookAt(0, 0, 0)

  // Orbit controls for click + drag interaction
  const controls = new THREE.OrbitControls(camera)
  const scene = new THREE.Scene()
  const texLoader = new THREE.TextureLoader()

  const fogColor = new THREE.Color(0x161b20)
  scene.background = fogColor
  scene.fog = new THREE.Fog(fogColor, camera.near, camera.far * 0.8)

  const sprite = texLoader.load('../assets/circle.png')
  const geometry = new THREE.BufferGeometry()
  const vertices = []
  const {near, far} = camera
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      vertices.push(lerp(near, far, i / cols) - camera.far / 2, 0, lerp(near, far, j / rows))
    }
  }

  geometry.addAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
  const material = new THREE.PointsMaterial({
    size: 0.2,
    map: sprite,
    blending: THREE.AdditiveBlending,
    depthTest: false,
    transparent: true
  })
  material.color.setHSL(...startHSL)
  const particles = new THREE.Points(geometry, material)
  scene.add(particles)

  const positions = geometry.attributes.position.array
  return {
    // Handle window resize events
    resize({pixelRatio, viewportWidth, viewportHeight}) {
      renderer.setPixelRatio(pixelRatio)
      renderer.setSize(viewportWidth, viewportHeight)
      camera.aspect = viewportWidth / viewportHeight
      camera.updateProjectionMatrix()
    },
    // Render each frame
    render({time}) {
      let idx = 0
      for (let x = 0; x < cols; x++) {
        for (let y = 0; y < rows; y++) {
          positions[idx * 3 + 1] = Math.sin((y + time * frequency) * 0.25) + Math.sin((x + time * frequency) * 0.2)
          idx++
        }
      }

      geometry.attributes.position.needsUpdate = true

      const hue = ((360 * (startHSL[0] + time) * 0.1) % 360) / 360
      material.color.setHSL(hue, startHSL[1], startHSL[2])
      controls.update()
      renderer.render(scene, camera)
    }
  }
}

canvasSketch(sketch, settings)
