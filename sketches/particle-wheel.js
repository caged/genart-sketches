const canvasSketch = require('canvas-sketch')
const THREE = (global.THREE = require('three'))
const {ParticleCurve} = require('../utils/particle-curve')
const {Power0} = require('gsap')

// Include any additional ThreeJS utilities
require('three/examples/js/controls/OrbitControls')

// Parameters for the sketch
const settings = {
  pixelRatio: devicePixelRatio,
  animate: true, // Ensure we get an animation loop
  context: 'webgl', // Setup WebGL instead of 2D canvas
  attributes: {antialias: false} // Turn on MSAA
}

const frequency = 0.0001

const sketch = ({context, width, height}) => {
  const renderer = new THREE.WebGLRenderer({context})
  const camera = new THREE.PerspectiveCamera(65, width / height, 1, 1000)
  const scene = new THREE.Scene()
  const controls = new THREE.OrbitControls(camera)

  renderer.setClearColor(0x181825)
  camera.position.set(0, 0, 100)
  camera.lookAt(0, 0, 0)

  const ambientLight = new THREE.AmbientLight(0x999999)
  scene.add(ambientLight)

  const sun = new THREE.DirectionalLight(0xffffff, 1)
  sun.position.set(-10, 40, 1)
  scene.add(sun)

  const coreGeom = new THREE.SphereBufferGeometry(3, 32, 32)
  const coreMat = new THREE.MeshLambertMaterial({color: `hsl(1, 100%, 100%)`, wireframe: true})
  const coreSphere = new THREE.Mesh(coreGeom, coreMat)
  scene.add(coreSphere)

  const moonGroup = new THREE.Group()
  scene.add(moonGroup)

  const positions = []
  const numMoons = 25
  const coreRadius = coreGeom.parameters.radius
  const offsetRadius = coreRadius * 10

  for (let i = 0; i < numMoons; i++) {
    const angle = (i / (numMoons / 2)) * Math.PI
    const x1 = coreRadius * Math.cos(angle) + camera.near / 2
    const y1 = coreRadius * Math.sin(angle) + camera.near / 2
    const x2 = offsetRadius * Math.cos(angle) + camera.near / 2
    const y2 = offsetRadius * Math.sin(angle) + camera.near / 2
    const z1 = 0
    const z2 = 0

    const startPosition = new THREE.Vector3(x1, y1, z1)
    const endPosition = new THREE.Vector3(x2, y2, z2)

    const moonGeom = new THREE.SphereBufferGeometry(1, 6, 6)
    const moonMat = new THREE.MeshLambertMaterial({
      wireframe: true,
      color: `hsl(${angle * (180 / Math.PI)}, 50%, 50%)`
    })
    const moonSphere = new THREE.Mesh(moonGeom, moonMat)
    moonSphere.position.set(x2, y2, z2)
    moonGroup.add(moonSphere)
    positions.push({startPosition, endPosition, angle})
  }

  const animGroup = new THREE.Group()
  scene.add(animGroup)
  // positions = positions.slice()

  const range = 10
  for (const {startPosition, endPosition} of positions) {
    const distance = startPosition.distanceTo(endPosition)
    const cPoint = endPosition.clone()
    cPoint.multiplyScalar(0.5)

    const controlRange0 = new THREE.Box3(
      new THREE.Vector3(-cPoint.x, -cPoint.y, -3),
      new THREE.Vector3(cPoint.x, cPoint.y, 3)
    )
    const controlRange1 = new THREE.Box3(
      new THREE.Vector3(cPoint.x - range, cPoint.y - distance / 2, -range),
      new THREE.Vector3(cPoint.x + range, cPoint.y + distance, range)
    )

    const animation = new ParticleCurve({
      particleCount: THREE.Math.randInt(1000, 1000),
      startPosition,
      endPosition,
      controlRange0,
      controlRange1
    })
    animation.animate(20.0, {ease: Power0.easeIn, repeat: -1})
    animGroup.add(animation)
    // console.log(scene)
    // animation.debug(scene)
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
      const {x, z} = camera.position
      camera.position.x = x * Math.cos(time * frequency) + z * Math.sin(time * frequency)
      camera.position.z = z * Math.cos(time * frequency) - x * Math.sin(time * frequency)
      // camera.position.y = y * Math.cos(time * frequency) - x * Math.sin(time * frequency)
      // for (const [i, moon] of moonGroup.children.entries()) {
      //   const angle = (i / (numMoons / 2)) * Math.PI
      //
      //   // moon.position.x = offsetRadius * Math.cos(time * frequency + angle)
      //   // moon.position.y = offsetRadius * Math.sin(time * frequency + angle)
      //   // moon.rotation.y = time * 5 + i
      //   // animGroup.rotation.x = offsetRadius * Math.cos(time * frequency + angle)
      //   // animGroup.rotation.y = offsetRadius * Math.sin(time * frequency + angle)
      // }

      // camera.position.z += Math.sin(time + 10)
      // camera.position.y += Math.sin(time)
      // camera.position.x += Math.cos(time * frequency)

      controls.update()
      renderer.render(scene, camera)
    }
  }
}

canvasSketch(sketch, settings)
