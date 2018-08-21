const canvasSketch = require('canvas-sketch')
const {noise} = require('noised')
const {interpolateSinebow} = require('d3-scale-chromatic')
const {scaleSequential} = require('d3-scale')

const settings = {
  dimensions: [1500, 1500],
  animate: true,
  pixelRatio: devicePixelRatio
}

const sketch = ({width, height}) => {
  noise.seed(Math.random())
  const resolution = 20
  const columns = Math.floor(width / resolution) + 1
  const rows = Math.floor(height / resolution) + 1
  const color = scaleSequential(interpolateSinebow).domain([(-360 * Math.PI) / 180, (360 * Math.PI) / 180])
  let noisez = 0

  // TODO: use typed, flat array
  const field = new Array(columns)
  for (let x = 0; x < columns; x++) {
    field[x] = new Array(columns)
    for (let y = 0; y < rows; y++) {
      field[x][y] = [0, 0]
    }
  }

  return ({context: ctx, width, height}) => {
    ctx.fillStyle = 'black'
    ctx.fillRect(0, 0, width, height)

    for (let x = 0; x < columns; x++) {
      for (let y = 0; y < rows; y++) {
        const angle = noise.simplex3(x / (resolution * 2), y / (resolution * 2), noisez) * Math.PI * 2
        const length = noise.simplex3(x * 0.01, y * 0.01, noisez)
        field[x][y][0] = angle
        field[x][y][1] = length
      }
    }

    noisez += 0.004

    for (let x = 0; x < columns; x++) {
      for (let y = 0; y < rows; y++) {
        const angle = field[x][y][0]
        const length = field[x][y][1]
        ctx.strokeStyle = color(angle)
        ctx.save()
        ctx.translate(x * resolution, y * resolution)
        ctx.rotate(angle)
        ctx.beginPath()
        ctx.moveTo(0, 0)
        ctx.lineTo(0, resolution * length)
        ctx.stroke()
        ctx.restore()
      }
    }
  }
}

canvasSketch(sketch, settings)
