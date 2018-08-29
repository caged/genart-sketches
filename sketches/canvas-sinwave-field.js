const canvasSketch = require('canvas-sketch')
const {lerp} = require('../utils/lerp')
const settings = {
  dimensions: [1000, 1000],
  animate: true,
  pixelRatio: devicePixelRatio
  // dimensions: [2048, 2048]
}

const frequency = 4

const sketch = ({width, height}) => {
  const radius = 6
  const rows = 20
  const cols = 40
  const rwidth = width / cols
  const rheight = height / rows
  const points = []
  let taperw = width
  let taperh = height
  let offset = false
  for (let i = 0; i < cols; i++) {
    offset = !offset
    for (let j = 0; j < rows; j++) {
      taperw = lerp(width / 1.5, width, j / rows)
      taperh = lerp(height / 3, height / 2, j / rows)

      points.push({
        x: lerp(0, taperw, i / cols) + rwidth / 2 + (width - taperw) / 2,
        y: lerp(0, taperh, j / rows) + rheight / 2 + (offset ? rwidth : 0) + height / 2,
        z: j,
        r: radius
      })
    }
  }

  return ({context, width, height, time}) => {
    context.fillStyle = '#000000'
    context.fillRect(0, 0, width, height)
    context.fillStyle = '#afffff'
    for (const [i, p] of points.entries()) {
      let r = ((Math.sin(time * frequency + p.z) + 1) / 2) * (radius - 2 * radius) + radius
      r = lerp(1, r, p.z / rows)

      // const x = ((Math.sin(time * frequency + i) + 1) / 2) * (20 - 2 * r) + r
      const y = ((Math.sin(time * frequency + i) + 1) / 2) * (20 - 2 * r) + r

      context.beginPath()
      context.arc(p.x, p.y + y, r, 0, Math.PI * 2)
      context.fill()
    }
  }
}

canvasSketch(sketch, settings)