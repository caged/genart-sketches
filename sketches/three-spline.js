const canvasSketch = require('canvas-sketch')
const {MeshLine, MeshLineMaterial} = require('three.meshline')
const {randomSpline} = require('../utils/spline')
const shuffle = require('shuffle-array')
const d3c = require('d3-color')

// Assign THREE to global for the examples/
const THREE = require('three')
global.THREE = THREE

// Include any additional ThreeJS utilities
require('three/examples/js/controls/OrbitControls')
require('../vendor/THREE.ConstantSpline')

// Parameters for the sketch
const settings = {
  dimensions: [640 * 3, 360 * 3],
  pixelRatio: devicePixelRatio,
  animate: 'true',
  context: 'webgl', // Setup WebGL instead of 2D canvas
  attributes: {antialias: true} // Turn on MSAA
}

const frequency = 5
const palettes = [
  ['#413d3d', '#040004', '#c8ff00', '#fa023c', '#4b000f'],
  ['#e8ddcb', '#cdb380', '#036564', '#033649', '#020e22'],
  ['#d1e751', '#ffffff', '#000000', '#4dbce9', '#26ade4'],
  ['#1c0113', '#6b0103', '#a30006', '#c21a01', '#f03c02'],
  ['#0f1c37', '#9cc4e4', '#e9f2f9', '#3a89c9', '#f26c4f'],
  ['#0a0310', '#49007e', '#ff005b', '#ff7d10', '#ffb238']
]
const pcolors = shuffle.pick(palettes)
let baseColor = d3c.hsl(0, 0, 1)
const hsls = []
for (const c of pcolors) {
  const hsl = d3c.hsl(c)
  hsls.push(hsl.l, baseColor.l)
  if (hsl.l < baseColor.l) baseColor = hsl
}
baseColor = baseColor.hex()
const colors = pcolors.filter(c => c !== baseColor)

function parabolic(x, k) {
  return Math.pow(10 * x * (1 - x), k)
}

const sketch = ({context, width, height}) => {
  const resolution = new THREE.Vector2(width, height)

  const renderer = new THREE.WebGLRenderer({
    context
  })

  // Setup a 3D perspective camera
  const camera = new THREE.PerspectiveCamera(45, width / height, 0.01, 100)
  camera.position.set(1, 15, 20)
  camera.lookAt(0, 0, 0)

  // Orbit controls for click + drag interaction
  const controls = new THREE.OrbitControls(camera)
  const scene = new THREE.Scene()
  const group = new THREE.Group()
  scene.background = new THREE.Color(baseColor)

  group.scale.setScalar(1)

  scene.add(group)

  const ambientLight = new THREE.AmbientLight(0xffffff)
  scene.add(ambientLight)

  const sgeom = new THREE.SphereBufferGeometry(50, 25, 25)
  const smat = new THREE.MeshLambertMaterial({
    color: `hsla(100, 0%, 100%)`,
    wireframe: true,
    transparent: true,
    opacity: 0.1,
    side: THREE.DoubleSide
  })
  const sphere = new THREE.Mesh(sgeom, smat)
  sphere.position.set(0, 0, 0)
  scene.add(sphere)

  const ccolor = shuffle.pick(colors)
  const cgeom = new THREE.SphereBufferGeometry(0.25, 25, 25)
  const cmat = new THREE.MeshLambertMaterial({
    color: ccolor
  })
  const csphere = new THREE.Mesh(cgeom, cmat)
  csphere.position.set(0, 0, 0)
  scene.add(csphere)

  const glowMaterial = new THREE.ShaderMaterial({
    uniforms: {
      c: {type: 'f', value: 0.5},
      p: {type: 'f', value: 0.4},
      glowColor: {type: 'c', value: new THREE.Color(ccolor)},
      viewVector: {type: 'v3', value: camera.position}
    },
    vertexShader: `
      uniform vec3 viewVector;
      uniform float c;
      uniform float p;
      varying float intensity;
      void main()
      {
        vec3 vNormal = normalize(normalMatrix * normal);
        vec3 vNormel = normalize(normalMatrix * viewVector);
        intensity = pow(c - dot(vNormal, vNormel), p);
        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 glowColor;
      varying float intensity;
      void main()
      {
        vec3 glow = glowColor * intensity;
        gl_FragColor = vec4(glow, 1.0);
      }
    `,
    side: THREE.FrontSide,
    blending: THREE.AdditiveBlending,
    transparent: true
  })

  const gmesh = new THREE.Mesh(cgeom.clone(), glowMaterial)
  gmesh.position = csphere.position
  gmesh.scale.multiplyScalar(2.0)
  scene.add(gmesh)

  for (let i = 0; i < 800; i++) {
    const spline = randomSpline(Math.sin(i) * 5, Math.cos(i) * 8)
    const ml = new MeshLine()

    // ml.setGeometry(spline, p => 1 - p)
    ml.setGeometry(spline, p => 1 * parabolic(p, 1))

    const material = new MeshLineMaterial({
      color: new THREE.Color(shuffle.pick(colors)),
      opacity: 1,
      resolution,
      sizeAttenuation: false,
      lineWidth: 5,
      near: camera.near,
      far: camera.far,
      depthWrite: true,
      depthTest: true,
      alphaTest: 0,
      transparent: true,
      side: THREE.DoubleSide
    })

    const mesh = new THREE.Mesh(ml.geometry, material)
    mesh.castShadow = true
    mesh.receiveShadow = true
    group.add(mesh)
  }

  return {
    // Handle window resize events
    resize({pixelRatio, viewportWidth, viewportHeight}) {
      renderer.setPixelRatio(pixelRatio)
      renderer.setSize(viewportWidth, viewportHeight)
      // resolution.set(viewportWidth, viewportHeight)
      camera.aspect = viewportWidth / viewportHeight
      camera.updateProjectionMatrix()
    },
    // Render each frame
    render({time, deltaTime, frame}) {
      // Rotate our camera slowly
      if (frame < 500) camera.position.z = time * 2
      // camera.position.x = ((Math.sin(time * 2) - 1.1) / 2) * 10
      // camera.position.y = ((Math.sin(time * 2) - 1.1) / 2) * 10

      // sphere.rotation.x = Math.sin(time * 0.1) * 10
      // sphere.rotation.y = Math.sin(time * 0.1) * 10
      group.rotation.y += deltaTime * ((15 * Math.PI) / 180)
      for (const [i, mesh] of group.children.entries()) {
        // console.log(mesh)
        mesh.material.uniforms.visibility.value = (Math.sin(time + i * frequency * 10) + 1.1) / 2
      }

      controls.update()
      renderer.render(scene, camera)
    }
  }
}

canvasSketch(sketch, settings)
