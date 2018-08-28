const canvasSketch = require('canvas-sketch')
const {noise} = require('noised')
const {MeshLine, MeshLineMaterial} = require('three.meshline')

console.log(MeshLineMaterial)
// Assign THREE to global for the examples/
const THREE = require('three')
global.THREE = THREE

// Include any additional ThreeJS utilities
require('three/examples/js/controls/OrbitControls')

// Parameters for the sketch
const settings = {
  animate: 'true',
  context: 'webgl', // Setup WebGL instead of 2D canvas
  attributes: {antialias: true} // Turn on MSAA
}

const sketch = ({context, width, height}) => {
  const renderer = new THREE.WebGLRenderer({
    context
  })
  renderer.shadowMap.enabled = true

  // Setup a 3D perspective camera
  const camera = new THREE.PerspectiveCamera(45, width / height, 0.01, 100)
  camera.position.set(1, 5, 20)
  camera.lookAt(0, 0, 0)

  // Orbit controls for click + drag interaction
  const controls = new THREE.OrbitControls(camera)
  const scene = new THREE.Scene()
  const group = new THREE.Group()
  scene.background = new THREE.Color(0x333333)

  group.scale.setScalar(1)

  scene.add(group)

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

  const geometry = new THREE.Geometry()
  // noise.seed(Math.random())
  // const inc = 1
  // for (let i = 0; i < 10; i++) {
  //   const x = i * inc
  //   const z = 0
  //   const y = 1 + Math.sin((2 * Math.PI * i) / inc) + noise.simplex3(x, z, i / inc)
  //
  //   geometry.vertices.push(new THREE.Vector3(x, y, z))
  // }
  for (let j = 0; j < Math.PI; j += (2 * Math.PI) / 200) {
    const v = new THREE.Vector3(Math.cos(j), Math.sin(j), 0)
    geometry.vertices.push(v)
  }

  const line = new MeshLine()
  line.setGeometry(geometry)

  const resolution = new THREE.Vector2(width, height)
  const mat = new MeshLineMaterial({
    color: new THREE.Color('hsl(20, 90%, 50%)'),
    opacity: 1,
    sizeAttenuation: 1,
    lineWidth: 0.5,
    resolution,
    near: camera.near,
    far: camera.far,
    depthTest: false,
    side: THREE.DoubleSide
  })

  const mesh = new THREE.Mesh(line.geometry, mat) // this syntax could definitely be improved!
  mesh.castShadow = true
  scene.add(mesh)
  // const vertices = []
  // noise.seed(Math.random())
  // const inc = 1
  // for (let i = 0; i < 10; i++) {
  //   const x = i * inc
  //   const z = 0
  //   const y = 1 + Math.sin((2 * Math.PI * i) / inc) + noise.simplex3(x, z, i / inc)
  //
  //   vertices.push(new THREE.Vector3(x, y, z))
  // }
  //
  // const points = curve.getPoints(50)
  //
  // const cylinderRadius = 0.1
  // const path = new THREE.CatmullRomCurve3(vertices)
  // const geometry = new THREE.TubeGeometry(path, vertices.length, cylinderRadius, 28, false)
  //
  // const mat = new THREE.MeshStandardMaterial({
  //   color: 0xb70000,
  //   metalness: 0.1,
  //   roughness: 0.4,
  //   side: THREE.DoubleSide
  // })
  // const mesh = new THREE.Mesh(geometry, mat)
  // mesh.castShadow = mesh.receiveShadow = true
  // group.add(mesh)

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
      // camera.position.z = Math.cos(time * 0.1) * 20
      // camera.position.x = Math.sin(time * 0.1) * 20

      controls.update()
      renderer.render(scene, camera)
    }
  }
}

canvasSketch(sketch, settings)
