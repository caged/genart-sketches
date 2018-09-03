const canvasSketch = require('canvas-sketch')

// Assign THREE to global for the examples/
const THREE = (global.THREE = require('three'))

// Include any additional ThreeJS utilities
require('three/examples/js/controls/OrbitControls')

// Parameters for the sketch
const settings = {
  animate: true, // Ensure we get an animation loop
  context: 'webgl', // Setup WebGL instead of 2D canvas
  attributes: {antialias: false} // Turn on MSAA
}

const sketch = ({context}) => {
  const renderer = new THREE.WebGLRenderer({context})
  const camera = new THREE.PerspectiveCamera(45, 1, 0.01, 100)
  const scene = new THREE.Scene()
  const controls = new THREE.OrbitControls(camera)

  camera.position.set(2, 2, -4)
  camera.lookAt(new THREE.Vector3())

  return {
    // Handle window resize events
    resize({pixelRatio, viewportWidth, viewportHeight}) {
      renderer.setPixelRatio(pixelRatio)
      renderer.setSize(viewportWidth, viewportHeight)
      camera.aspect = viewportWidth / viewportHeight
      camera.updateProjectionMatrix()
    },
    // Render each frame
    render() {
      controls.update()
      renderer.render(scene, camera)
    }
  }
}

canvasSketch(sketch, settings)
