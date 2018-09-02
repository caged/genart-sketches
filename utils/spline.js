require('seedrandom')
const THREE = require('three')
global.THREE = THREE

require('../vendor/THREE.ConstantSpline')

export function randomSpline(min, max, steps = 500, seed = Date.now()) {
  const rng = new Math.seedrandom(seed)
  const geometry = new THREE.Geometry()
  const spline = new THREE.ConstantSpline()

  spline.p0 = new THREE.Vector3(0.5 - rng(), 0.5 - rng(), 0.5 - rng())
  spline.p0.set(0, 0, 0)
  spline.p1 = spline.p0.clone().add(new THREE.Vector3(0.5 - rng(), 0.5 - rng(), 0.5 - rng()))
  spline.p2 = spline.p1.clone().add(new THREE.Vector3(0.5 - rng(), 0.5 - rng(), 0.5 - rng()))
  spline.p3 = spline.p2.clone().add(new THREE.Vector3(0.5 - rng(), 0.5 - rng(), 0.5 - rng()))
  spline.p1.multiplyScalar(min + rng() * max)
  spline.p2.multiplyScalar(min + rng() * max)
  spline.p3.multiplyScalar(min + rng() * max)

  spline.calculate()
  spline.reticulate({steps})

  for (const point of spline.lPoints) {
    geometry.vertices.push(point.clone())
  }

  return geometry
}
