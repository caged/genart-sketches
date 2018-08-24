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

const sketch = ({context, width, height}) => {
  const renderer = new THREE.WebGLRenderer({
    context
  })

  // Setup a 3D perspective camera
  const camera = new THREE.PerspectiveCamera(45, 1, 0.01, 100)
  camera.position.set(2, 2, -4)
  camera.lookAt(new THREE.Vector3())

  // Orbit controls for click + drag interaction
  const controls = new THREE.OrbitControls(camera)
  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0x111111)

  const alight = new THREE.AmbientLight(0x444444)
  scene.add(alight)

  const light = new THREE.DirectionalLight(0xffffff, 0.5)
  light.position.set(width / 2, height / 2, 0.5)
  scene.add(light)

  light.castShadow = true
  light.shadowCameraNear = 0.01
  light.shadowCameraFar = 15
  light.shadowCameraFov = 45
  light.shadowCameraLeft = -1
  light.shadowCameraRight = 1
  light.shadowCameraTop = 1
  light.shadowCameraBottom = -1
  // light.shadowCameraVisible	= true
  light.shadowBias = 0.001
  light.shadowDarkness = 0.2
  light.shadowMapWidth = width
  light.shadowMapHeight = height

  // const helper = new THREE.CameraHelper(light.shadow.camera)
  // scene.add(helper)

  // Add a basic ThreeJS mesh
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.9, 32, 32), new THREE.MeshPhongMaterial({wireframe: true}))
  scene.add(mesh)

  return {
    // Handle window resize events
    resize({pixelRatio, viewportWidth, viewportHeight}) {
      renderer.setPixelRatio(pixelRatio)
      renderer.setSize(viewportWidth, viewportHeight)
      camera.aspect = viewportWidth / viewportHeight
      camera.updateProjectionMatrix()
    },
    // Render each frame
    render({deltaTime}) {
      // Rotate our mesh slowly
      mesh.rotation.y += deltaTime * ((10 * Math.PI) / 180)
      controls.update()
      renderer.render(scene, camera)
    }
  }
}

canvasSketch(sketch, settings)
