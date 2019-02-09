const canvasSketch = require('canvas-sketch')
const random = require('canvas-sketch-util/random')
const {lerp} = require('canvas-sketch-util/math')
const palettes = require('nice-color-palettes')
// Assign THREE to global for the examples/
const THREE = (global.THREE = require('three'))

// Include any additional ThreeJS utilities
require('three/examples/js/controls/OrbitControls')

// Parameters for the sketch
const settings = {
  dimensions: [1500, 1500],
  fps: 24,
  animate: true, // Ensure we get an animation loop
  context: 'webgl', // Setup WebGL instead of 2D canvas
  attributes: {antialias: true} // Turn on MSAA
}

const sketch = ({context}) => {
  const renderer = new THREE.WebGLRenderer({
    context
  })

  renderer.setClearColor('hsl(0, 0%, 5%)')
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap // default

  // Setup a 3D perspective camera
  const camera = new THREE.OrthographicCamera(-100, 100)

  // Orbit controls for click + drag interaction
  const scene = new THREE.Scene()
  const geom = new THREE.BoxGeometry(1, 1, 1)
  const palette = random.pick(palettes)
  const group = new THREE.Group()
  for (let i = 0; i < 2500; i++) {
    const material = new THREE.MeshStandardMaterial({
      color: random.pick(palette)
    })

    // Add a basic ThreeJS mesh
    const mesh = new THREE.Mesh(geom, material)
    mesh.castShadow = true //default is false
    mesh.receiveShadow = true //default
    const y = random.range(-1, 1)
    const n = random.noise3D(i, Math.random(), y)
    const v = y * 0.5 + 0.5
    const x = random.range(-v, v) * n
    const z = random.range(-v, v) * n

    mesh.position.set(x * 1.5, y, z * 1.5)
    mesh.scale.set(random.range(-1, 1), random.range(-1, 1), random.range(-1, 1))
    mesh.scale.multiplyScalar(0.05)
    group.add(mesh)
  }

  scene.add(group)
  scene.add(new THREE.AmbientLight('hsl(0, 0%, 90%)'))
  const light = new THREE.DirectionalLight('white', 1)
  light.castShadow = true

  light.position.set(2, 3, 4)
  scene.add(light)

  // scene.add(new THREE.AmbientLight('#c00'))
  // const light = new THREE.PointLight('#ddd', 1, 15.5)
  // light.position.set(2, 2, -5).multiplyScalar(1.5)
  // scene.add(light)

  return {
    // Handle window resize events
    resize({pixelRatio, viewportWidth, viewportHeight}) {
      renderer.setPixelRatio(pixelRatio)
      renderer.setSize(viewportWidth, viewportHeight)

      const aspect = viewportWidth / viewportHeight

      // Ortho zoom
      const zoom = 2

      // Bounds
      camera.left = -zoom * aspect
      camera.right = zoom * aspect
      camera.top = zoom
      camera.bottom = -zoom

      // Set position & look at world center
      camera.position.set(zoom, zoom, zoom)
      camera.lookAt(new THREE.Vector3())

      // Update the camera
      camera.updateProjectionMatrix()
    },
    // Render each frame
    render({time, playhead, deltaTime}) {
      const pos = new THREE.Vector3()
      // scene.rotation.y = playhead * Math.PI * 2
      // scene.rotation.z += deltaTime * ((1 * Math.PI) / 180)

      for (const [i, m] of group.children.entries()) {
        pos.copy(m.position)
        const st = Math.sin(deltaTime)
        const ct = Math.cos(deltaTime)
        const {x, z} = pos
        //
        m.position.x = x * ct - z * st
        m.position.z = x * st + z * ct
        m.rotation.x += deltaTime * ((random.range(10, 500) * Math.PI) / 180)
        m.rotation.y += deltaTime * ((random.range(10, 500) * Math.PI) / 180)
        m.rotation.z += deltaTime * ((random.range(10, 500) * Math.PI) / 180)

        // m.rotation.z += Math.sin(deltaTime + i)
        // m.position.z -= Math.sin(playhead)
        // m.position.x -= Math.sin(playhead)
        // m.position.z = Math.sin(playhead * Math.PI * 2 + i)
      }
      // Rotate our mesh slowly
      // mesh.rotation.y += deltaTime * ((10 * Math.PI) / 180)

      renderer.render(scene, camera)
    }
  }
}

canvasSketch(sketch, settings)
