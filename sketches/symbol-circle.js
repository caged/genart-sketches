const canvasSketch = require('canvas-sketch')
const {scaleSequential} = require('d3-scale')
const {range, max} = require('d3-array')
const sc = require('d3-scale-chromatic')
const d3c = require('d3-color')
const d3shape = require('d3-shape')
const random = require('canvas-sketch-util/random')
const Poisson = require('poisson-disk-sampling')
const {Delaunay} = require('d3-delaunay')

const settings = {
  dimensions: [12, 12],
  pixelRatio: devicePixelRatio,
  units: 'in'
}

var gco = [
  'lighter',
  'xor',
  'multiply',
  'screen',
  'overlay',
  'darken',
  'lighten',
  'color-dodge',
  'color-burn',
  'hard-light',
  'soft-light',
  'difference',
  'exclusion',
  'hue',
  'saturation',
  'color',
  'luminosity'
]

const total = 10
const outerRadius = 1
const circleRadius = 40
const itteration = 0.1
const compositeOp = 'overlay'
const opacity = 0.4

function randomint(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomf(min, max) {
  return Math.random() * (max - min) + min
}

function radians(angle) {
  return angle * (Math.PI / 180)
}

function degrees(angle) {
  return angle * (180 / Math.PI)
}

function randomshade({min = 10, max = 100, alpha = 1.0}) {
  return `hsla(0, 0%, ${randomint(min, max)}%, ${alpha})`
}

const sym = d3shape.symbol().type(d3shape.symbolStar)
function draw({ctx, x, y, cx, cy, rad, angle, fill}) {
  const {r, g, b} = fill
  const radi = radians(angle)
  const deg = degrees(angle)
  sym.size(rad).context(ctx)

  ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.8)`

  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(radians(deg - 90))

  ctx.beginPath()
  sym()
  ctx.fill()

  ctx.restore()
}

const sketch = ({width, height, context}) => {
  const [cx, cy] = [width / 2, height / 2]
  const data = range(0, total)
  const radius = (Math.min(width, height) / 2) * outerRadius
  const color = scaleSequential(sc.interpolateSpectral).domain([0, max(data)])
  context.globalCompositeOperation = compositeOp
  context.lineWidth = 0.01

  // const n = random.noise2D(cx, cy, (frequency = 1), (amplitude = 1))

  context.save()
  context.translate(cx, cy)

  for (var i = 0; i < total; i++) {
    const angle = (i / (total / 2)) * Math.PI
    const x = Math.cos(angle) * radius
    const y = Math.sin(angle) * radius
    const fill = d3c.color(color(i))
    draw({ctx: context, x, y, cx, cy, rad: circleRadius, angle, fill})
  }

  context.restore()
  context.globalCompositeOperation = 'overlay'
  const psize = 0.04
  const pds = new Poisson([width + 2, width + 2], psize * 4, psize * 4, 10)
  const pdspoints = pds.fill()
  // context.beginPath()
  // context.fillStyle = `rgba(20, 20, 20, 0.5)`
  // context.strokeStyle = `rgba(255, 255, 255, 1)`
  // context.lineWidth = 1
  context.strokeStyle = `rgba(255, 255, 255, 0.4)`
  const delaunay = Delaunay.from(pdspoints)
  delaunay.render(context)
  context.stroke()

  context.fillStyle = `rgba(255, 255, 255, 0.8)`
  for (const p of pdspoints) {
    const preal = random.range(0.01, psize)
    context.beginPath()
    context.moveTo(p[0] + preal, p[1])
    context.arc(...p, preal, 0, 2 * Math.PI)
    context.fill()
  }
}

canvasSketch(sketch, settings)
