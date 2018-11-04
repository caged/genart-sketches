const THREE = (global.THREE = require('three'))
const BAS = require('three-bas')
const {TweenMax} = require('gsap')

export class ParticleSpline extends THREE.Mesh {
  constructor({particleCount = 10000, particleGeometry = new THREE.PlaneGeometry(2, 2), totalDuration = 10.0, points}) {
    const material = new BAS.PhongAnimationMaterial({
      flatShading: true,
      vertexColors: THREE.VertexColors,
      side: THREE.DoubleSide,
      // defines act as static, immutable values
      defines: {
        // we need integer representation of path length
        PATH_LENGTH: points.length,
        // we also need a max index float for the catmull-rom interpolation
        // adding .toFixed(1) will set value as {{length}}.0, which will identify it as a float
        PATH_MAX: (points.length - 1).toFixed(1)
      },
      uniforms: {
        uTime: {value: 0},
        // the path from the constructor (array of Vector4's)
        uPath: {value: points},
        // this is an optional argument for the spline interpolation function
        // 0.5, 0.5 is the default, 0.0, 0.0 will create a jagged spline, other values can make it go c r a z y
        uSmoothness: {value: new THREE.Vector2(0.5, 0.5)}
      },
      uniformValues: {
        specular: new THREE.Color(0xff0000),
        shininess: 20
      },
      vertexFunctions: [
        // catmull_rom_spline defines the catmullRomSpline and getCatmullRomSplineIndices functions used in the vertexPosition chunk
        // it also defines getCatmullRomSplineIndicesClosed, which is not used in this example
        BAS.ShaderChunk['catmull_rom_spline'],
        BAS.ShaderChunk['quaternion_rotation']
      ],
      // note we do not have to define 'color' as a uniform because THREE.js will do this for us
      // trying to define it here will throw a duplicate declaration error
      vertexParameters: [
        'uniform float uTime;',
        // this is how you define an array in glsl
        // you need both a type and a length
        // the length cannot be dynamic, and must be set at compile time
        // here the length will be replaced by the define above
        'uniform vec4 uPath[PATH_LENGTH];',
        'uniform vec2 uSmoothness;',

        'attribute vec2 aDelayDuration;',
        'attribute float aPivotScale;',
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
        // getting the progress along the spline is more involved than a bezier curve

        // first we need get the progress relative to the path length
        'float pathProgress = tProgress * PATH_MAX;',
        // getCatmullRomSplineIndices returns an integer vector with 4 indices based on pathProgress
        'ivec4 indices = getCatmullRomSplineIndices(PATH_MAX, pathProgress);',
        // use these indices to get the four points that will influence the position
        'vec4 p0 = uPath[indices[0]];', // max(0, floor(pathProgress) - 1)
        'vec4 p1 = uPath[indices[1]];', // floor(pathProgress)
        'vec4 p2 = uPath[indices[2]];', // min(length, floor(pathProgress) + 1)
        'vec4 p3 = uPath[indices[3]];', // min(length, floor(pathProgress) + 2)

        // we only care about the fractal part of the pathProgress float (what comes after the .)
        'float pathProgressFract = fract(pathProgress);',

        // get the pivot distance by using catmull-rom interpolation on the fourth component of the vector (w)
        // each prefab has its own pivotScale, which we use to spread them out
        // this translation is performed BEFORE the rotation
        'transformed += catmullRomSpline(p0.w, p1.w, p2.w, p3.w, pathProgressFract) * aPivotScale;',

        // rotate the vertex
        'transformed = rotateVector(tQuat, transformed);',

        // finally add the actual spline position
        // uSmoothness is an optional argument that controls how the spline looks.
        'transformed += catmullRomSpline(p0.xyz, p1.xyz, p2.xyz, p3.xyz, pathProgressFract, uSmoothness);'
      ]
    })

    const geometry = new BAS.PrefabBufferGeometry(particleGeometry, particleCount)
    super(geometry, material)

    // The total time in seconds it takes a particle to travel from
    // the startPosition to the endPosition
    this.totalDuration = totalDuration

    this.points = points

    this.createAttributes()
    this.frustumCulled = false
  }

  createAttributes() {
    // TODO: Look into storing attributes as uniforms in places where all particles
    // share the same value.  For example, start and end positions
    this.geometry.createAttribute('aDelayDuration', 2, (data, i, count) => {
      data[0] = (i / count) * this.totalDuration
      data[1] = this.totalDuration
    })

    this.geometry.createAttribute('aPivotScale', 1, data => {
      data[0] = Math.random()
    })

    const axis = new THREE.Vector3()
    let angle = 0

    this.geometry.createAttribute('aAxisAngle', 4, data => {
      axis.x = THREE.Math.randFloatSpread(2)
      axis.y = THREE.Math.randFloatSpread(2)
      axis.z = THREE.Math.randFloatSpread(2)
      axis.normalize()

      angle = Math.PI * THREE.Math.randFloat(4, 8)

      data[0] = axis.x
      data[1] = axis.y
      data[2] = axis.z
      data[3] = angle
    })

    // each prefab will get a psudo-random vertex color
    const color = new THREE.Color()
    let h, s, l

    // we will use the built in VertexColors to give each prefab its own color
    // note you have to set Material.vertexColors to THREE.VertexColors for this to work
    this.geometry.createAttribute('color', 3, (data, i, count) => {
      // modulate the hue
      h = i / count
      s = THREE.Math.randFloat(0.5, 0.8)
      l = THREE.Math.randFloat(0.4, 0.6)

      color.setHSL(h, s, l)
      color.toArray(data)
    })
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
    const debug = new THREE.Group()
    scene.add(debug)

    const curve = new THREE.CatmullRomCurve3(
      this.points.map(function(p) {
        return new THREE.Vector3(p.x, p.y, p.z)
      })
    )
    curve.type = 'catmullrom'

    debug.add(
      new LineHelper(curve.getPoints(400), {
        color: 0xff0000,
        depthTest: false,
        depthWrite: false
      })
    )

    for (const p of this.points) {
      debug.add(new PointHelper(0xff0000, p.w, new THREE.Vector3(p.x, p.y, p.z)))
    }
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
