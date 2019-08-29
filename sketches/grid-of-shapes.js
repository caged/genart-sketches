const canvasSketch = require('canvas-sketch')
const random = require('canvas-sketch-util/random')
const { grid } = require('../utils/grid')
const { palette } = require('../utils/palette')
const shuffle = require('shuffle-array')
const palettes = require('nice-color-palettes/100.json')

const settings = {
  dimensions: [12, 12],
  pixelsPerInch: 300,
  units: 'in',
  bleed: 1
}

const CELL_COUNT = 12

const circleArcs = ({ x, y, xsize, ysize, context, bleed }) => {
  const radius = Math.min(xsize / 2, ysize / 2) * 0.9
  const lineWidth = radius / 12
  const tau = Math.PI * 2
  const colors = shuffle.pick(palettes, { random })
  context.save()
  context.translate(x + bleed + (xsize / 2), y + bleed + (ysize / 2))
  for (let i = 0; i < radius - lineWidth / 2; i += lineWidth) {

    context.lineWidth = lineWidth
    for (let k = 0; k < 3; k++) {
      context.beginPath()
      context.strokeStyle = random.pick(colors)
      context.arc(0, 0, i, random.range(-tau, tau + 1), random.range(-tau, tau + 1))
      context.stroke()
    }

    context.beginPath()
    context.strokeStyle = 'white'
    context.lineWidth = 0.01
    context.arc(0, 0, i, 0, tau)
    context.stroke()

  }
  context.restore()
}

const fans = ({ x, y, xsize, ysize, context, bleed }) => {
  const leafCount = 6
  const radius = Math.min(xsize, ysize) / 2
  const lineWidth = 0.02
  const colors = shuffle.pick(palettes, { random })

  const cx = x + bleed + (xsize / 2)
  const cy = y + bleed + (ysize / 2)

  context.save()
  context.translate(cx, cy)
  context.beginPath()
  context.fillStyle = 'rgba(100, 100, 100, 0.1)'
  context.arc(0, 0, radius, 0, Math.PI * 2)
  context.fill()

  context.lineWidth = lineWidth
  for (let i = 0; i < leafCount; i++) {
    const angle = (i / leafCount) * Math.PI * 2
    context.save()
    context.beginPath()
    context.strokeStyle = 'red'
    context.moveTo(0, 0)
    context.rotate(angle)
    context.lineTo(ysize / 2.8, ysize / 2.8)
    context.stroke()
    context.restore()
  }
  context.restore()
}

const debugDraw = ({ context, bleed, trimWidth, trimHeight, cells }) => {
  context.save()
  context.beginPath()
  context.strokeStyle = 'red'
  context.lineWidth = 1 / 64
  context.setLineDash([0.1, 0.1])
  context.rect(bleed, bleed, trimWidth, trimHeight)
  context.stroke()

  context.strokeStyle = 'rgba(255, 100, 0, 0.5)'
  for (const cell of cells) {
    const { x, y, xsize, ysize } = cell
    context.beginPath()
    context.rect(x + bleed, y + bleed, xsize, ysize)
    context.stroke()
  }
  context.restore()
}


const sketch = () => {
  return props => {
    const seed = random.getRandomSeed()
    random.setSeed(seed)
    console.log(`Generating with seed ${seed}`);

    const { context, width, height, trimWidth, trimHeight, bleed } = props
    context.fillStyle = '#fff'
    context.fillRect(0, 0, width, height)

    const cells = Array.from(grid(CELL_COUNT, trimWidth, trimHeight))
    debugDraw({ context, bleed, trimWidth, trimHeight, cells })
    for (const cell of cells) {
      fans({ context, ...cell, bleed, seed })

      // circleArcs({ context, ...cell, bleed, seed })
      // const { x, y, xsize, ysize } = cell
      // context.beginPath()
      // context.fillStyle = 'red'
      // context.fillRect(x + bleed, y + bleed, xsize, ysize)
    }
  }
}

canvasSketch(sketch, settings)
