const canvasSketch = require('canvas-sketch')
const {mapRange, lerp, degToRad, radToDeg} = require('canvas-sketch-util/math')
const {palette} = require('../utils/palette')
const shuffle = require('shuffle-array')

const palettes = palette(10)
const pcolors = palettes.random()
const baseColor = shuffle.pick(pcolors)
const colors = pcolors.filter(c => c !== baseColor)

const settings = {
  dimensions: [1000, 450],
  pixelRatio: devicePixelRatio
}

function intersectionLL([[xa1, ya1], [xa2, ya2]], [[xb1, yb1], [xb2, yb2]]) {
  // inspired by: http://www.kevlindev.com/gui/math/intersection/Intersection.js
  const uaT = (xb2 - xb1) * (ya1 - yb1) - (yb2 - yb1) * (xa1 - xb1)
  const ubT = (xa2 - xa1) * (ya1 - yb1) - (ya2 - ya1) * (xa1 - xb1)
  let ub = (yb2 - yb1) * (xa2 - xa1) - (xb2 - xb1) * (ya2 - ya1)
  if (ub === 0) return 'coincident or parallel'
  const ua = uaT / ub
  ub = ubT / ub
  if (ua < 0 || ua > 1 || ub < 0 || ub > 1) return null
  return [xa1 + ua * (xa2 - xa1), ya1 + ua * (ya2 - ya1)]
}

const generateStripes = ({
  ox = 0 /* origin x */,
  oy = 0 /* origin y */,
  sw = 500 /* width */,
  sh = 100 /* height */,
  nh = 50 /* notch height */,
  num = 3 /* total stripes */,
  sb = 5 /* space between stripes */,
  ang = 45 /* angle of triangle */,
  ctx = null
}) => {
  const stripes = []
  const mid = lerp(0, sw, 0.5)
  const height = sh * num * 2
  const angRad = degToRad(180 - ang)
  const angleLine = [[mid, oy], [mid + height * Math.cos(angRad), oy + height * Math.sin(angRad)]]

  for (let i = 0; i < num; i++) {
    const yt = oy + sh * i
    const yb = oy + sh + sh * i

    // close path by ending at origin point?
    const pa = [
      [ox, yt] /* top left */,
      [mid, yt] /* top right */,
      [mid, yb] /* bottom right */,
      [ox, yb] /* bottom left */
    ]

    const itop = intersectionLL([pa[0], pa[1]], angleLine)
    const ibot = intersectionLL([pa[2], pa[3]], angleLine)

    console.log(itop, ibot)

    if (ibot) {
      pa[1][0] = itop[0]
      pa[2][0] = ibot[0]
    }

    const pb = [
      [itop[0], yt] /* top left */,
      [mid, yt] /* top right */,
      [mid, yb] /* bottom right */,
      [ibot[0], yb] /* bottom left */,
      [itop[0], yt] /* top left */
    ]

    // ctx.arc()

    // const pa = [[ox, yt], [tx, yt], [bx, yb], [ox, yb]]
    // const pb = [[tx, yt], [mid, yt + nh], [mid, sh * i + c + nh], [bx, yt + sh], [tx, yt]]
    //const pb = [[tx, yt], [mid, i === 0 ? 0 : yt + nh], [mid, sh * i + c + nh], [bx, yt + sh - space], [tx, yt]]

    stripes.push([pa, pb])
  }

  return stripes
}

function debugTriangle(ctx, stripe, angle = 45) {
  const height = ctx.canvas.height
  const x1 = stripe[0][0][0]
  const x2 = stripe[0][1][0]
  const oy = stripe[0][1][1]
  const midx = lerp(x1, x2 * 2, 0.5)

  ctx.fillStyle = 'black'
  ctx.beginPath()
  ctx.arc(midx, oy, 5, 0, Math.PI * 2)
  ctx.fill()

  for (const ang of [angle, 180 - angle, 90]) {
    ctx.beginPath()
    ctx.setLineDash([5, 5])
    ctx.moveTo(midx, oy)
    ctx.lineTo(midx + height * Math.cos(degToRad(ang)), oy + height * Math.sin(degToRad(ang)))
    ctx.stroke()
  }
}

const sketch = ({canvasWidth}) => {
  return ({context: ctx, width, height}) => {
    ctx.fillStyle = `hsla(90, 10%, 95%, 1)`
    ctx.rect(0, 0, width, height)
    ctx.fill()

    const stripes = generateStripes({num: 5, sw: width, sh: 75, sb: 20, ctx})
    const lightness = 50
    // Each stripe
    for (const [i, s] of stripes.entries()) {
      const a = s[0]
      const b = s[1]

      ctx.fillStyle = `hsla(${i * 10}, 100%, ${lightness}%, 0.8)`
      ctx.beginPath()
      ctx.moveTo(...a[0])
      ctx.lineTo(...a[1])
      ctx.lineTo(...a[2])
      ctx.lineTo(...a[3])
      ctx.fill()

      if (b) {
        ctx.fillStyle = `hsla(${i * 10}, 100%, ${lightness + 5}%, 0.8)`
        ctx.beginPath()
        ctx.moveTo(...b[0])
        ctx.lineTo(...b[1])
        ctx.lineTo(...b[2])
        ctx.lineTo(...b[3])
        ctx.lineTo(...b[4])
        ctx.fill()
      }

      ctx.save()
      ctx.setTransform(-devicePixelRatio, 0, 0, devicePixelRatio, canvasWidth, 0)

      ctx.fillStyle = `hsla(${i * 10}, 100%, ${lightness}%, 0.8)`
      ctx.beginPath()
      ctx.moveTo(...a[0])
      ctx.lineTo(...a[1])
      ctx.lineTo(...a[2])
      ctx.lineTo(...a[3])
      ctx.fill()

      if (b) {
        ctx.fillStyle = `hsla(${i * 10}, 100%, ${lightness - 15}%, 0.8)`
        ctx.beginPath()
        ctx.moveTo(...b[0])
        ctx.lineTo(...b[1])
        ctx.lineTo(...b[2])
        ctx.lineTo(...b[3])
        ctx.lineTo(...b[4])
        ctx.fill()
      }

      ctx.restore()
    }

    debugTriangle(ctx, stripes[0], 45)
  }
}

canvasSketch(sketch, settings)
