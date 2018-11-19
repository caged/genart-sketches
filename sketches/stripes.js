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
  sw = 0 /* width */,
  sh = 0 /* height */,
  nh = 0 /* notch height */,
  num = 3 /* total stripes */,
  sb = 5 /* space between stripes */,
  bxs = 0.39 /* where to start the bottom angle */,
  txs = 0.36 /* where to start the top angle */
}) => {
  const mid = lerp(0, sw, 0.5)
  const bx = lerp(0, sw, bxs)
  const tx = lerp(0, sw, txs)

  for (let i = 0; i < num; i++) {
    const yb = oy + sh * i
    const yt = oy + sh + sh * i
    const a = [[ox, yb], [bx, yb], [tx, yt], [ox, yt]]
  }
}

const sketch = () => {
  return ({context: ctx, width, canvasWidth}) => {
    const sh = 100
    const sw = width
    const nh = 45
    const mid = lerp(0, sw, 0.5)
    const bx = lerp(0, sw, 0.39)
    const tx = lerp(0, sw, 0.36)

    ctx.fillStyle = 'hsla(0, 100%, 60%, 0.8)'
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(bx, 0)
    ctx.lineTo(tx, sh)
    ctx.lineTo(0, sh)
    ctx.fill()

    const a = bx - tx
    const b = 0 - sh
    const c = Math.sqrt(a * a + b * b)

    ctx.fillStyle = 'hsla(0, 100%, 65%, 0.8)'
    ctx.beginPath()
    ctx.moveTo(bx, 0)
    ctx.lineTo(mid, nh)
    ctx.lineTo(mid, c + nh)
    ctx.lineTo(tx, sh)
    ctx.lineTo(bx, 0)
    ctx.fill()

    ctx.setTransform(-devicePixelRatio, 0, 0, devicePixelRatio, canvasWidth, 0)
    ctx.fillStyle = 'hsla(0, 100%, 60%, 0.8)'
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(bx, 0)
    ctx.lineTo(tx, sh)
    ctx.lineTo(0, sh)
    ctx.fill()

    ctx.fillStyle = 'hsla(0, 100%, 20%, 0.8)'
    ctx.beginPath()
    ctx.moveTo(bx, 0)
    ctx.lineTo(mid, nh)
    ctx.lineTo(mid, c + nh)
    ctx.lineTo(tx, sh)
    ctx.lineTo(bx, 0)
    ctx.fill()
  }
}

canvasSketch(sketch, settings)
