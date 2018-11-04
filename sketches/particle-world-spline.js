const canvasSketch = require('canvas-sketch')
const THREE = (global.THREE = require('three'))
const {ParticleSpline} = require('../utils/particle-spline')
const {Power0} = require('gsap')

// Include any additional ThreeJS utilities
require('three/examples/js/controls/OrbitControls')
require('../utils/postprocessing')

// Parameters for the sketch
const settings = {
  pixelRatio: devicePixelRatio,
  animate: true, // Ensure we get an animation loop
  context: 'webgl', // Setup WebGL instead of 2D canvas
  attributes: {antialias: false} // Turn on MSAA
}

const particleCount = 1000

const sketch = ({context, width, height, canvasWidth, canvasHeight}) => {
  const renderer = new THREE.WebGLRenderer({context})
  const camera = new THREE.PerspectiveCamera(65, width / height, 1, 1000)
  const scene = new THREE.Scene()
  const controls = new THREE.OrbitControls(camera)

  // Postprocessing
  const composer = new THREE.EffectComposer(
    renderer,
    new THREE.WebGLRenderTarget(canvasWidth, canvasHeight, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      stencilBuffer: false
    })
  )

  const renderPass = new THREE.RenderPass(scene, camera)
  composer.addPass(renderPass)
  renderer.autoClear = false

  const bloomPass = new THREE.UnrealBloomPass(new THREE.Vector2(canvasWidth, canvasHeight), 8.5, 0.4, 0.5)
  // Draw particle trails
  const afterimagePass = new THREE.AfterimagePass(0.75)
  const copyPass = new THREE.ShaderPass(THREE.CopyShader)
  const passes = [bloomPass, afterimagePass, copyPass]

  for (let i = 0; i < passes.length; i++) {
    const pass = passes[i]
    pass.renderToScreen = i === passes.length - 1
    composer.addPass(pass)
  }

  // End post processing

  renderer.setClearColor(0x181825)
  camera.position.set(0, 0, 1000)
  camera.lookAt(0, 0, 0)

  // const fogColor = new THREE.Color(0x181825)
  // scene.background = fogColor
  // scene.fog = new THREE.Fog(fogColor, camera.near, camera.far * 0.8)

  const ambientLight = new THREE.AmbientLight(0x999999, 1)
  scene.add(ambientLight)

  const sun = new THREE.DirectionalLight(0xffffff, 2)
  sun.position.set(-10, 40, 1)
  scene.add(sun)

  const positions = []
  const numPoints = 6

  for (let i = 0; i < numPoints; i++) {
    const x = THREE.Math.mapLinear(i, 0, numPoints - 1, -camera.far * 0.8, camera.far * 0.8)
    // alternate y so the spline becomes wavy
    const y = THREE.Math.randFloat(50, 150) * (i % 2 ? 1 : -1)
    const z = THREE.Math.randFloat(0, 100)
    // the first and last point will have a pivot distance of 0, the others will be randomized
    const pivotDistance = i === 0 || i === numPoints - 1 ? 0 : THREE.Math.randFloat(10, 100.0)

    positions.push(new THREE.Vector4(x, y, z, pivotDistance))
  }

  const animation = new ParticleSpline({
    particleCount,
    points: positions
  })
  animation.animate(20.0, {ease: Power0.easeIn, repeat: -1})
  scene.add(animation)
  // animation.debug(scene)

  return {
    // Handle window resize events
    resize({pixelRatio, viewportWidth, viewportHeight}) {
      renderer.setPixelRatio(pixelRatio)
      renderer.setSize(viewportWidth, viewportHeight)
      composer.setSize(viewportWidth * pixelRatio, viewportHeight * pixelRatio)
      camera.aspect = viewportWidth / viewportHeight
      camera.updateProjectionMatrix()
    },

    // Render each frame
    render() {
      controls.update()
      renderer.clear()
      composer.render()
    }
  }
}

canvasSketch(sketch, settings)
