const canvasSketch = require('canvas-sketch')

const SPHERE_SIZE = 1.0
let landMesh, cloudMesh, boundariesMesh
const THREE = require('three')
global.THREE = THREE

// Include any additional ThreeJS utilities
require('three/examples/js/controls/OrbitControls')

// Parameters for the sketch
const settings = {
  animate: true,
  context: 'webgl',
  attributes: {antialias: true} // Turn on MSAA
}

const sketch = ({context, width, height}) => {
  const renderer = new THREE.WebGLRenderer({
    context
  })

  // Setup a 3D perspective camera
  const camera = new THREE.PerspectiveCamera(45, width / height, 0.01, 100)
  camera.position.set(2, 2, -4)
  camera.lookAt(new THREE.Vector3())

  // Orbit controls for click + drag interaction
  const controls = new THREE.OrbitControls(camera)
  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0x171921)

  const axesHelper = new THREE.AxesHelper(25)
  scene.add(axesHelper)

  // Setup lights
  const ambientLight = new THREE.AmbientLight(0xffd28b)
  scene.add(ambientLight)

  const l3 = new THREE.HemisphereLight(0xffffbb, 0x080820, 3)
  scene.add(l3)

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5)
  scene.add(directionalLight)

  directionalLight.castShadow = true
  const scamera = directionalLight.shadow.camera
  scamera.near = camera.near
  scamera.far = camera.near
  scamera.fov = camera.fov
  scamera.left = -1
  scamera.right = 1
  scamera.top = 1
  scamera.bottom = -1
  directionalLight.shadow.bias = 0.001
  directionalLight.shadow.darkness = 0.2
  directionalLight.shadow.mapSize.width = 512
  directionalLight.shadow.mapSize.height = 512

  const geometry = new THREE.SphereGeometry(SPHERE_SIZE, 32, 32)
  const material = new THREE.MeshPhongMaterial({shininess: 5})
  landMesh = new THREE.Mesh(geometry, material)

  material.specular = new THREE.Color(0xafd9ff)
  material.bumpScale = 0.05
  material.map = new THREE.TextureLoader().load('../assets/5_night_8k.jpg')
  material.bumpMap = new THREE.TextureLoader().load('../assets/elev_bump_8k.jpg')
  material.specularMap = new THREE.TextureLoader().load('../assets/water_8k.png')
  scene.add(landMesh)

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
      for (const mesh of [landMesh, boundariesMesh, cloudMesh]) {
        if (mesh) mesh.rotation.y += deltaTime * ((5 * Math.PI) / 180)
      }

      controls.update()
      renderer.render(scene, camera)
    }
  }
}

canvasSketch(sketch, settings)
