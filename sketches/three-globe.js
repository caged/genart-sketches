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
  scamera.near = 0.1
  scamera.far = 15
  scamera.fov = 45
  scamera.left = -1
  scamera.right = 1
  scamera.top = 1
  scamera.bottom = -1
  directionalLight.shadow.bias = 0.001
  directionalLight.shadow.darkness = 0.2
  directionalLight.shadow.mapSize.width = width
  directionalLight.shadow.mapSize.height = height

  // const helper = new THREE.CameraHelper(light.shadow.camera)
  // scene.add(helper)

  // const p1 = new THREE.PointLight(0xff00ff, 10, 100)
  // p1.position.set(0, 0, -50)
  // scene.add(p1)

  // const backLight = new THREE.DirectionalLight(0xffffff, 4)
  // backLight.position.set(-0.5, -1, 1)
  // backLight.lookAt(scene.position)
  // scene.add(backLight)
  // const helper = new THREE.DirectionalLightHelper(backLight, 2)
  // scene.add(helper)

  // const helper = new THREE.CameraHelper(backLight.shadow.camera)
  // scene.add(helper)

  // const pointLightHelper = new THREE.PointLightHelper(p1, 250)
  // scene.add(pointLightHelper)

  const geometry = new THREE.SphereGeometry(SPHERE_SIZE, 32, 32)
  const material = new THREE.MeshPhongMaterial({shininess: 5})
  landMesh = new THREE.Mesh(geometry, material)

  material.specular = new THREE.Color(0xafd9ff)
  material.bumpScale = 0.05
  material.map = new THREE.TextureLoader().load('../assets/5_night_8k.jpg')
  material.bumpMap = new THREE.TextureLoader().load('../assets/elev_bump_8k.jpg')
  material.specularMap = new THREE.TextureLoader().load('../assets/water_8k.png')
  scene.add(landMesh)

  // const cloudMesh = new THREE.Mesh(
  //   new THREE.SphereGeometry(SPHERE_SIZE + 0.005, 32, 32),
  //   new THREE.MeshPhongMaterial({
  //     map: new THREE.TextureLoader().load('../assets/fair_clouds_8k.png'),
  //     transparent: true,
  //     side: THREE.DoubleSide,
  //     opacity: 0.8
  //   })
  // )
  // scene.add(cloudMesh)

  // const startField = new THREE.Mesh(
  //   new THREE.SphereGeometry(SPHERE_SIZE * 3, 32, 32),
  //   new THREE.MeshBasicMaterial({
  //     map: new THREE.TextureLoader().load('../assets/starfield.jpg'),
  //     side: THREE.BackSide
  //   })
  // )
  //
  // scene.add(startField)

  // const boundariesMesh = new THREE.Mesh(
  //   new THREE.SphereGeometry(SPHERE_SIZE, 32, 32),
  //   new THREE.MeshPhongMaterial({
  //     map: new THREE.TextureLoader().load('../assets/boundaries_transparent_8k.png'),
  //     transparent: true,
  //     side: THREE.DoubleSide,
  //     opacity: 0.2
  //   })
  // )
  //
  // scene.add(boundariesMesh)

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
