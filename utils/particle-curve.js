const THREE = (global.THREE = require('three'))
const BAS = require('three-bas')

export class ParticleCurve extends THREE.Mesh {
  constructor({
    particleCount = 10000,
    particleGeometry = new THREE.PlaneGeometry(0.1, 0.1),
    totalDuration = 25.0,
    startPosition,
    endPosition,
    controlRange0,
    controlRange1
  }) {
    const material = new BAS.PhongAnimationMaterial({
      flatShading: true,
      vertexColors: THREE.VertexColors,
      side: THREE.DoubleSide,
      uniforms: {
        uTime: {type: 'f', value: 0}
      },
      uniformValues: {
        specular: new THREE.Color(0xf8a5ff),
        shininess: 20
      },
      vertexFunctions: [
        // cubic_bezier defines the cubicBezier function used in the vertexPosition chunk
        BAS.ShaderChunk['cubic_bezier'],
        BAS.ShaderChunk['quaternion_rotation']
      ],
      // note we do not have to define 'color' as a uniform because THREE.js will do this for us
      // trying to define it here will throw a duplicate declaration error
      vertexParameters: [
        'uniform float uTime;',
        'attribute vec2 aDelayDuration;',
        'attribute vec3 aStartPosition;',
        'attribute vec3 aEndPosition;',
        'attribute vec3 aControl0;',
        'attribute vec3 aControl1;',
        'attribute vec4 aAxisAngle;'
      ],
      vertexInit: [
        // tProgress is in range 0.0 to 1.0
        // we want each prefab to restart at 0.0 if the progress is < 1.0, creating a continuous motion
        // the delay is added to the time uniform to spread the prefabs over the path
        'float tProgress = mod((uTime + aDelayDuration.x), aDelayDuration.y) / aDelayDuration.y;',

        'vec4 tQuat = quatFromAxisAngle(aAxisAngle.xyz, aAxisAngle.w * tProgress);'
      ],
      vertexPosition: [
        'transformed = rotateVector(tQuat, transformed);',
        // cubicBezier will return a vec3 on a cubic bezier curve defined by four points
        'transformed += cubicBezier(aStartPosition, aControl0, aControl1, aEndPosition, tProgress);'
      ]
    })

    const geometry = new BAS.PrefabBufferGeometry(particleGeometry, particleCount)
    super(geometry, material)

    // The number of prefab particles continously animating
    this.particleCount = particleCount

    // The geometry or shape of each individual particle
    this.particleGeometry = particleGeometry

    // The total time in seconds it takes a particle to travel from
    // the startPosition to the endPosition
    this.totalDuration = totalDuration

    // The position each particle starts
    this.startPosition = startPosition

    // The position each particle ends
    this.endPosition = endPosition

    // The first control range in the bezier path traveled by particles
    this.controlRange0 = controlRange0

    // The second control range in the bezier path traveled by particles
    this.controlRange1 = controlRange1

    this.createAttributes()
  }

  createAttributes() {
    // TODO: Look into storing attributes as uniforms in places where all particles
    // share the same value.  For example, start and end positions
    this.geometry.createAttribute('aDelayDuration', 2, (data, i, count) => {
      data[0] = (i / count) * this.totalDuration
      data[1] = this.totalDuration
    })

    this.geometry.createAttribute('aStartPosition', 3, data => {
      const {x, y, z} = this.startPosition
      data[0] = x
      data[1] = y
      data[2] = z
    })

    this.geometry.createAttribute('aEndPosition', 3, data => {
      const {x, y, z} = this.endPosition
      data[0] = x
      data[1] = y
      data[2] = z
    })

    const point = new THREE.Vector3()

    this.geometry.createAttribute('aControl0', 3, data => {
      BAS.Utils.randomInBox(this.controlRange0, point).toArray(data)
    })

    this.geometry.createAttribute('aControl1', 3, data => {
      BAS.Utils.randomInBox(this.controlRange1, point).toArray(data)
    })

    const axis = new THREE.Vector3()
    let angle = 0

    this.geometry.createAttribute('aAxisAngle', 4, data => {
      axis.x = THREE.Math.randFloatSpread(2)
      axis.y = THREE.Math.randFloatSpread(2)
      axis.z = THREE.Math.randFloatSpread(2)
      axis.normalize()

      angle = Math.PI * THREE.Math.randInt(16, 32)

      data[0] = axis.x
      data[1] = axis.y
      data[2] = axis.z
      data[3] = angle
    })

    // each prefab will get a psudo-random vertex color
    const color = new THREE.Color()
    let h, s, l

    this.geometry.createAttribute('color', 3, (data, i, count) => {
      // modulate the hue
      h = i / count
      s = THREE.Math.randFloat(0.4, 0.6)
      l = THREE.Math.randFloat(0.4, 0.6)

      color.setHSL(h, s, l)
      color.toArray(data)
    })
  }

  createMaterial() {
    // THREE.Mesh.call(this, this.geometry, material)
    this.frustumCulled = false
  }

  get time() {
    return this.material.uniforms['uTime'].value
  }

  set time(value) {
    this.material.uniforms['uTime'].value = value
  }

  animate(duration, options = {}) {
    options.time = this.totalDuration

    return TweenMax.fromTo(this, duration, {time: 0.0}, options)
  }

  debug(scene) {
    // debug helpers / visuals
    const debug = new THREE.Group()
    const control0RangeCenter = this.controlRange0.center()
    const control1RangeCenter = this.controlRange1.center()

    debug.add(new PointHelper(0xff0000, 1.0, this.startPosition))
    debug.add(new PointHelper(0x00ff00, 1.0, this.endPosition))
    debug.add(new THREE.Box3Helper(this.controlRange0, 0xff0000))
    debug.add(new THREE.Box3Helper(this.controlRange1, 0x00ff00))
    debug.add(new PointHelper(0x0ac099, 1.0, control1RangeCenter))
    debug.add(new PointHelper(0x0000ff, 1.0, control0RangeCenter))

    const curve = new THREE.CubicBezierCurve3(
      this.startPosition,
      control0RangeCenter,
      control1RangeCenter,
      this.endPosition
    )
    debug.add(
      new LineHelper(curve.getPoints(100), {
        color: 0xffff00,
        depthTest: false,
        depthWrite: false
      })
    )

    debug.add(
      new LineHelper([this.startPosition, control0RangeCenter], {
        color: 0xff0000,
        depthTest: false,
        depthWrite: false
      })
    )
    debug.add(
      new LineHelper([this.endPosition, control1RangeCenter], {
        color: 0x00ff00,
        depthTest: false,
        depthWrite: false
      })
    )
    scene.add(debug)
  }
}

export function PointHelper(color, size, position) {
  THREE.Mesh.call(
    this,
    new THREE.SphereGeometry(size || 1.0, 16, 16),
    new THREE.MeshBasicMaterial({
      color: color || 0xff0000,
      wireframe: true
    })
  )

  position && this.position.copy(position)
}
PointHelper.prototype = Object.create(THREE.Mesh.prototype)
PointHelper.prototype.constructor = PointHelper

export function LineHelper(points, params) {
  const g = new THREE.Geometry()
  const m = new THREE.LineBasicMaterial(params)

  g.vertices = points

  THREE.Line.call(this, g, m)
}
LineHelper.prototype = Object.create(THREE.Line.prototype)
LineHelper.prototype.constructor = LineHelper
