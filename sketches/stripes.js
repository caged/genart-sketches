const canvasSketch = require('canvas-sketch')
const {mapRange, lerp, degToRad, radToDeg} = require('canvas-sketch-util/math')
const {palette} = require('../utils/palette')
const shuffle = require('shuffle-array')

const palettes = palette(10)
const pcolors = palettes.random()
const baseColor = shuffle.pick(pcolors)
const colors = pcolors.filter(c => c !== baseColor)

const settings = {
  dimensions: [1000, 550],
  pixelRatio: devicePixelRatio
}

function intersectionLL([[xa1, ya1], [xa2, ya2]], [[xb1, yb1], [xb2, yb2]]) {
  // inspired by: http://www.kevlindev.com/gui/math/intersection/Intersection.js
  const uaT = (xb2 - xb1) * (ya1 - yb1) - (yb2 - yb1) * (xa1 - xb1)
  const ubT = (xa2 - xa1) * (ya1 - yb1) - (ya2 - ya1) * (xa1 - xb1)
  let ub = (yb2 - yb1) * (xa2 - xa1) - (xb2 - xb1) * (ya2 - ya1)
  // coincident or parallel
  if (ub === 0) return null
  const ua = uaT / ub
  ub = ubT / ub
  // doesn't intersect
  if (ua < 0 || ua > 1 || ub < 0 || ub > 1) return null
  return [xa1 + ua * (xa2 - xa1), ya1 + ua * (ya2 - ya1)]
}

const generateStripes = ({
  ox = 0 /* origin x */,
  oy = 0 /* origin y */,
  sw = 500 /* width */,
  sh = 100 /* height */,
  num = 3 /* total stripes */,
  sb = 5 /* space between stripes */,
  oang = 45 /* outer angle of pyramid */,
  iang = oang / 2 /* inner angle of pyramid */,
  ctx = null
}) => {
  const stripes = []
  const mid = lerp(0, sw, 0.5)
  const height = sh * num * 2
  const oAngRad = degToRad(180 - oang)
  const iAngRad = degToRad(iang)
  const oAngleLine = [[mid, oy], [mid + height * Math.cos(oAngRad), oy + height * Math.sin(oAngRad)]]

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

    const itop = intersectionLL([pa[0], pa[1]], oAngleLine)
    const ibot = intersectionLL([pa[2], pa[3]], oAngleLine)

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

    const iAngleTopLine = [[itop[0], yt], [itop[0] + height * Math.cos(iAngRad), yt + height * Math.sin(iAngRad)]]
    const iAngleBotLine = [[ibot[0], yb], [ibot[0] + height * Math.cos(iAngRad), yb + height * Math.sin(iAngRad)]]
    const midLine = [[mid, oy], [mid, height]]

    const itopB = intersectionLL(midLine, iAngleTopLine)
    const ibotB = intersectionLL(midLine, iAngleBotLine)
    console.log(itopB, ibotB)

    if (itopB) {
      // ctx.beginPath()
      // ctx.strokeStyle = 'black'
      // ctx.moveTo(...iAngleTopLine[0])
      // ctx.lineTo(...iAngleTopLine[1])
      // ctx.stroke()
      //
      // ctx.beginPath()
      // ctx.strokeStyle = 'green'
      // ctx.moveTo(...iAngleBotLine[0])
      // ctx.lineTo(...iAngleBotLine[1])
      // ctx.stroke()
      //
      // ctx.beginPath()
      // ctx.fillStyle = 'black'
      // ctx.arc(itopB[0], itopB[1], 3, 0, Math.PI * 2)
      // ctx.fill()
      //
      // ctx.beginPath()
      // ctx.fillStyle = 'black'
      // ctx.arc(ibotB[0], ibotB[1], 3, 0, Math.PI * 2)
      // ctx.fill()

      // console.log(itopB, ibotB)
      // pb[2] = ibotB
      pb[1] = itopB
      pb[2] = ibotB
    }

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
    const opacity = 0.9
    // Each stripe
    for (const [i, s] of stripes.entries()) {
      const a = s[0]
      const b = s[1]

      ctx.fillStyle = `hsla(${i * 10}, 100%, ${lightness}%, ${opacity})`
      ctx.beginPath()
      ctx.moveTo(...a[0])
      ctx.lineTo(...a[1])
      ctx.lineTo(...a[2])
      ctx.lineTo(...a[3])
      ctx.fill()

      if (b) {
        ctx.fillStyle = `hsla(${i * 10}, 100%, ${lightness + 5}%, ${opacity})`
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

      ctx.fillStyle = `hsla(${i * 10}, 100%, ${lightness}%, ${opacity})`
      ctx.beginPath()
      ctx.moveTo(...a[0])
      ctx.lineTo(...a[1])
      ctx.lineTo(...a[2])
      ctx.lineTo(...a[3])
      ctx.fill()

      if (b) {
        ctx.fillStyle = `hsla(${i * 10}, 100%, ${lightness - 15}%, ${opacity})`
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

    // debugTriangle(ctx, stripes[0], 45)
  }
}

canvasSketch(sketch, settings)
