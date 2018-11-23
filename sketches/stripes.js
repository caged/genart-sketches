const canvasSketch = require('canvas-sketch')
const {mapRange, lerp, degToRad} = require('canvas-sketch-util/math')
const {palette} = require('../utils/palette')
const shuffle = require('shuffle-array')

const palettes = palette(10)
const pcolors = palettes.random()
const baseColor = shuffle.pick(pcolors)
const colors = pcolors.filter(c => c !== baseColor)

const settings = {
  dimensions: [1000, 1000],
  pixelRatio: devicePixelRatio
}

const generateStripes = ({
  ox = 0 /* origin x */,
  oy = 0 /* origin y */,
  sw = 500 /* width */,
  sh = 100 /* height */,
  nh = 50 /* notch height */,
  num = 3 /* total stripes */,
  sb = 5 /* space between stripes */,
  bxs = 0.39 /* where to start the bottom angle */,
  txs = 0.36 /* where to start the top angle */
}) => {
  const stripes = []
  const mid = lerp(0, sw, 0.5)
  const ltx = lerp(0, sw, bxs)
  const lbx = lerp(0, sw, txs)

  for (let i = 0; i < num; i++) {
    const a = ltx - lbx
    const b = 0 - sh
    const c = Math.sqrt(a * a + b * b)

    const space = sb // = i === 0 ? 0 : sb
    const yt = space + oy + sh * i
    const yb = oy + sh + sh * i
    const tx = ltx - a * i
    const bx = lbx - a * i

    const pa = [[ox, yt], [tx, yt], [bx, yb], [ox, yb]]
    const pb = [[tx, yt], [mid, yt + nh], [mid, sh * i + c + nh], [bx, yt + sh - space], [tx, yt]]

    stripes.push([pa, pb])
  }

  return stripes
}

const sketch = ({canvasWidth}) => {
  return ({context: ctx, width}) => {
    const stripes = generateStripes({num: 3, sw: width, sh: 100, sb: 2})

    // Each stripe
    for (const [i, s] of stripes.entries()) {
      const a = s[0]
      const b = s[1]

      ctx.fillStyle = 'hsla(0, 100%, 60%, 0.8)'
      ctx.beginPath()
      ctx.moveTo(...a[0])
      ctx.lineTo(...a[1])
      ctx.lineTo(...a[2])
      ctx.lineTo(...a[3])
      ctx.fill()

      if (b) {
        ctx.fillStyle = 'hsla(0, 100%, 65%, 0.8)'
        ctx.beginPath()
        ctx.moveTo(...b[0])
        ctx.lineTo(...b[1])
        ctx.lineTo(...b[2])
        ctx.lineTo(...b[3])
        ctx.lineTo(...b[4])
        ctx.fill()
      }

      // Draw symetrical side
      // TODO: Move this into a loop to avoid duplication.  While debugging, I like the explicitness of this.
      ctx.save()
      ctx.setTransform(-devicePixelRatio, 0, 0, devicePixelRatio, canvasWidth, 0)

      ctx.fillStyle = 'hsla(0, 100%, 60%, 0.8)'
      ctx.beginPath()
      ctx.moveTo(...a[0])
      ctx.lineTo(...a[1])
      ctx.lineTo(...a[2])
      ctx.lineTo(...a[3])
      ctx.fill()

      if (b) {
        ctx.fillStyle = 'hsla(0, 100%, 45%, 0.8)'
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
  }
}

canvasSketch(sketch, settings)
