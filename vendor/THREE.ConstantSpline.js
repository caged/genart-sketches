// See License: https://github.com/spite/THREE.ConstantSpline
THREE.ConstantSpline = function() {
  this.p0 = new THREE.Vector3()
  this.p1 = new THREE.Vector3()
  this.p2 = new THREE.Vector3()
  this.p3 = new THREE.Vector3()

  this.tmp = new THREE.Vector3()
  this.res = new THREE.Vector3()
  this.o = new THREE.Vector3()

  this.points = []
  this.lPoints = []
  this.steps = []

  this.inc = 0.01
  this.d = 0

  this.distancesNeedUpdate = false
}

THREE.ConstantSpline.prototype.calculate = function() {
  this.d = 0
  this.points = []

  this.o.copy(this.p0)

  for (let j = 0; j <= 1; j += this.inc) {
    const i = 1 - j
    const ii = i * i
    const iii = ii * i
    const jj = j * j
    const jjj = jj * j

    this.res.set(0, 0, 0)

    this.tmp.copy(this.p0)
    this.tmp.multiplyScalar(iii)
    this.res.add(this.tmp)

    this.tmp.copy(this.p1)
    this.tmp.multiplyScalar(3 * j * ii)
    this.res.add(this.tmp)

    this.tmp.copy(this.p2)
    this.tmp.multiplyScalar(3 * jj * i)
    this.res.add(this.tmp)

    this.tmp.copy(this.p3)
    this.tmp.multiplyScalar(jjj)
    this.res.add(this.tmp)

    this.points.push(this.res.clone())
  }

  this.points.push(this.p3.clone())

  this.distancesNeedUpdate = true
}

THREE.ConstantSpline.prototype.calculateDistances = function() {
  this.steps = []
  this.d = 0

  let from,
    to,
    td = 0

  for (let j = 0; j < this.points.length - 1; j++) {
    this.points[j].distance = td
    this.points[j].ac = this.d
    ;(from = this.points[j]), (to = this.points[j + 1]), (td = to.distanceTo(from))

    this.d += td
  }

  this.points[this.points.length - 1].distance = 0
  this.points[this.points.length - 1].ac = this.d
}

THREE.ConstantSpline.prototype.reticulate = function(settings) {
  if (this.distancesNeedUpdate) {
    this.calculateDistances()
    this.distancesNeedUpdate = false
  }

  this.lPoints = []

  const l = []

  let steps, distancePerStep

  if (settings.steps) {
    steps = settings.steps
    distancePerStep = this.d / steps
  }

  if (settings.distancePerStep) {
    distancePerStep = settings.distancePerStep
    steps = this.d / distancePerStep
  }

  let d = 0,
    p = 0

  this.lPoints = []

  const current = new THREE.Vector3()
  current.copy(this.points[0].clone())
  this.lPoints.push(current.clone())

  function splitSegment(a, b, l) {
    const t = b.clone()
    let d = 0
    t.sub(a)
    const rd = t.length()
    t.normalize()
    t.multiplyScalar(distancePerStep)
    const s = Math.floor(rd / distancePerStep)
    for (let j = 0; j < s; j++) {
      a.add(t)
      l.push(a.clone())
      d += distancePerStep
    }
    return d
  }

  for (let j = 0; j < this.points.length; j++) {
    if (this.points[j].ac - d > distancePerStep) {
      d += splitSegment(current, this.points[j], this.lPoints)
    }
  }
  this.lPoints.push(this.points[this.points.length - 1].clone())
}
