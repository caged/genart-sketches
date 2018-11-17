const canvasSketch = require('canvas-sketch')

const SPHERE_SIZE = 1.5
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
  scene.background = new THREE.Color(0x111111)

  // const axesHelper = new THREE.AxesHelper(25)
  // scene.add(axesHelper)

  // Setup lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.2)
  scene.add(ambientLight)

  const l3 = new THREE.HemisphereLight(0x555555, 0x080820, 0.8)
  scene.add(l3)

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6)
  scene.add(directionalLight)

  directionalLight.castShadow = true

  const geometry = new THREE.SphereGeometry(SPHERE_SIZE, 32, 32)
  const material = new THREE.MeshPhongMaterial({shininess: 5})
  landMesh = new THREE.Mesh(geometry, material)

  material.specular = new THREE.Color(0xafd9ff)
  material.bumpScale = 0.03
  material.map = new THREE.TextureLoader().load('../assets/1_earth_8k.jpg')
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
    render({time, deltaTime, frame}) {
      // Rotate our mesh slowly
      landMesh.rotation.y += deltaTime * ((1 * Math.PI) / 180)

      if (frame % 100 === 0) {
        console.log('100')
      }
      controls.update()
      renderer.render(scene, camera)
    }
  }
}

canvasSketch(sketch, settings)
