const canvasSketch = require('canvas-sketch')
const {noise} = require('noised')
const {scaleLinear, scaleQuantile} = require('d3-scale')
const shuffle = require('shuffle-array')
const {palette} = require('./utils/palette')

const settings = {
  dimensions: [250, 250],
  animate: true,
  pixelRatio: devicePixelRatio,
  exportPixelRatio: devicePixelRatio
}

const sketch = ({width, height}) => {
  noise.seed(Math.random())

  const resolution = 5
  const columns = Math.floor(width / resolution) + 1
  const rows = Math.floor(height / resolution) + 1
  const palettes = palette()
  const pcolors = palettes.random()
  const baseColor = shuffle.pick(pcolors)
  const colors = pcolors.filter(c => c !== baseColor)
  const cscale = scaleQuantile()
    .domain([(-360 * Math.PI) / 180, (360 * Math.PI) / 180])
    .range(colors)
  const rscsle = scaleLinear()
    .domain([-1, 1])
    .range([0, resolution * 0.4])

  // TODO: use typed, flat array
  const field = new Array(columns)
  for (let x = 0; x < columns; x++) {
    field[x] = new Array(columns)
    for (let y = 0; y < rows; y++) {
      field[x][y] = [0, 0]
    }
  }

  return ({context: ctx, width, height, time}) => {
    ctx.fillStyle = baseColor
    ctx.fillRect(0, 0, width, height)

    for (let x = 0; x < columns; x++) {
      for (let y = 0; y < rows; y++) {
        const angle = noise.simplex3(x / resolution, y / resolution, time * 0.1) * Math.PI * 2
        const radius = noise.simplex3(x * 0.05, y * 0.05, time * 0.5)
        field[x][y][0] = angle
        field[x][y][1] = radius
      }
    }

    for (let x = 0; x < columns; x++) {
      for (let y = 0; y < rows; y++) {
        const angle = field[x][y][0]
        const radius = rscsle(field[x][y][1])
        ctx.fillStyle = cscale(angle)

        ctx.save()
        ctx.translate(x * resolution, y * resolution)
        ctx.beginPath()
        ctx.moveTo(0, 0)
        ctx.arc(0, 0, radius, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }
    }
  }
}

canvasSketch(sketch, settings)
