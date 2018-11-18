const canvasSketch = require('canvas-sketch')
const {mapRange, lerp, degToRad} = require('canvas-sketch-util/math')
const {palette} = require('../utils/palette')
const shuffle = require('shuffle-array')

const palettes = palette(10)
const pcolors = palettes.random()
const baseColor = shuffle.pick(pcolors)
let colors = pcolors.filter(c => c !== baseColor)

const settings = {
  dimensions: [1000, 1000],
  pixelRatio: devicePixelRatio
}

const generateStripes = ({
  width = 0,
  height = 0,
  startX = 0,
  startY = 0,
  total = 3,
  notchHeight = 100,
  notchDegrees = 45,
  spaceBetween = 5
}) => {
  const stripeData = []
  const totalHeight = height * total

  for (let i = 0; i < total; i++) {
    const points = []
    const y = mapRange(i, 0, total, startY, startY + totalHeight)
    const x = startX
    const space = i === 0 ? 0 : spaceBetween
    points.push(
      // Top left corner
      [x, y + space],
      // Top right corner
      [x * i + width, y + space],
      // Bottom right corner
      [x * i + width, y + height],
      // Bottom left corner
      [x * i, y + height]
      // Point before notch
    )

    stripeData.push(points)
  }

  return stripeData
}

const sketch = () => {
  return ({context, width}) => {
    const stripeHeight = 100
    const stripes = generateStripes({total: 1, width, height: stripeHeight})
    colors = shuffle(colors)

    for (const [i, s] of stripes.entries()) {
      context.beginPath()
      context.moveTo(...s.shift())

      for (const p of s) {
        context.lineTo(...p)
      }

      context.fillStyle = colors[i]
      context.fill()

      // context.lineTo(degToRad())
    }
  }
}

canvasSketch(sketch, settings)
