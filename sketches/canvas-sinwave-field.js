const canvasSketch = require('canvas-sketch')
const {lerp} = require('../utils/lerp')
const shuffle = require('shuffle-array')
const {palette} = require('../utils/palette')

const settings = {
  dimensions: [1000, 1000],
  animate: true,
  pixelRatio: devicePixelRatio,
  exportPixelRatio: 1
}

const frequency = 5
const palettes = palette(10)
const pcolors = palettes.random()
const baseColor = shuffle.pick(pcolors)
const colors = pcolors.filter(c => c !== baseColor)
const fill = shuffle.pick(colors)

const sketch = ({width, height}) => {
  const radius = 6
  const rows = 25
  const cols = 50
  const rwidth = width / cols
  const rheight = height / rows
  const points = []

  let offset = false
  for (let i = 0; i < cols; i++) {
    offset = !offset
    for (let j = 0; j < rows; j++) {
      points.push({
        x: lerp(0, width, i / cols) + rwidth / 2,
        y: lerp(0, height, j / rows) + rheight / 2 + (offset ? rwidth : 0),
        z: j,
        r: radius
      })
    }
  }

  return ({context, width, height, time}) => {
    context.fillStyle = baseColor
    context.fillRect(0, 0, width, height)
    context.fillStyle = fill
    for (const [i, p] of points.entries()) {
      let r = ((Math.sin(time * frequency + p.z) + 1) / 2) * (radius - 2 * radius) + radius
      r = lerp(1, r, p.z / rows)

      const x = 0 //((Math.sin(time * frequency + i) + 1) / 2) * (20 - 2 * r) + r
      const y = ((Math.sin(time * frequency + i) + 1) / 2) * (20 - 2 * r) + r

      context.beginPath()
      context.arc(p.x + x, p.y + y, r, 0, Math.PI * 2)
      context.fill()
    }
  }
}

canvasSketch(sketch, settings)
