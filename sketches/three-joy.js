const canvasSketch = require('canvas-sketch')

// Assign THREE to global for the examples/
const THREE = require('three')
global.THREE = THREE

// Include any additional ThreeJS utilities
require('three/examples/js/controls/OrbitControls')

// Parameters for the sketch
const settings = {
  animate: true, // Ensure we get an animation loop
  context: 'webgl', // Setup WebGL instead of 2D canvas
  attributes: {antialias: true} // Turn on MSAA
}

const sSize = 0.3

const sketch = ({context, width, height}) => {
  const renderer = new THREE.WebGLRenderer({
    context
  })
  renderer.shadowMap.enabled = true

  // Setup a 3D perspective camera
  const camera = new THREE.PerspectiveCamera(45, width / height, 0.01, 100)
  camera.position.set(12.524249954559526, 7.5, 11)
  camera.lookAt(0, 0, 0)

  // Orbit controls for click + drag interaction
  const controls = new THREE.OrbitControls(camera)
  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0x333333)

  const ambientLight = new THREE.AmbientLight(0x999999)
  scene.add(ambientLight)

  const sun = new THREE.DirectionalLight(0xffffff, 1)
  sun.position.set(-10, 10, 1)
  sun.castShadow = true

  const d = 25
  sun.shadow.camera.left = -d
  sun.shadow.camera.right = d
  sun.shadow.camera.top = d
  sun.shadow.camera.bottom = -d
  sun.shadow.camera.near = camera.near
  sun.shadow.camera.far = camera.far
  sun.shadow.mapSize.x = 1024 * 2
  sun.shadow.mapSize.y = 1024 * 2
  scene.add(sun)

  const planeGeometry = new THREE.BoxBufferGeometry(100, 0.1, 100)
  const planeMaterial = new THREE.MeshLambertMaterial({color: 0x222222})
  const plane = new THREE.Mesh(planeGeometry, planeMaterial)
  plane.position.y = 0.0
  plane.receiveShadow = true
  scene.add(plane)

  const spheres = []
  for (let i = 0; i < 12; i++) {
    const sphereGeometry = new THREE.SphereBufferGeometry(sSize, 100, 100)
    const sphereMaterial = new THREE.MeshLambertMaterial({color: `hsl(${25 * i}, 90%, 50%)`})
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
    sphere.position.set(i / 3, sSize, 3.5 + -i / 1.5)
    sphere.castShadow = true
    scene.add(sphere)
    spheres.push(sphere)
  }

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
      // Rotate our camera slowly
      camera.position.z = Math.cos(time * 0.5) * 20
      camera.position.x = Math.sin(time * 0.5) * 20

      for (const [i, s] of spheres.entries()) {
        s.position.x = ((Math.cos(time * 5 + i) + 1) / 2) * (2 - 2 * sSize) + sSize
        s.position.y = ((Math.sin(time * 5 + i) + 1) / 2) * (4 - 2 * sSize) + sSize
      }
      controls.update()
      renderer.render(scene, camera)
    }
  }
}

canvasSketch(sketch, settings)
