const canvasSketch = require('canvas-sketch')
const palettes = require('nice-color-palettes')
const shuffle = require('shuffle-array')

const settings = {
  dimensions: [1000, 1000],
  pixelRatio: devicePixelRatio,
  exportPixelRatio: 2
}

const sketch = () => {
  return ({context: ctx, width, height}) => {
    const rings = 25
    width -= rings * 2
    height -= rings * 2
    const step = Math.floor(width / 2 / rings)
    const colors = shuffle.pick(palettes)
    let pick = -1

    ctx.clearRect(0, 0, width, height)
    ctx.lineWidth = step * 0.5

    for (let i = 1; i <= rings; i++) {
      const size = width - step * i * 2
      const x = step * i
      const y = step * i
      ctx.strokeStyle = colors[(pick = ++pick >= colors.length ? 0 : pick)]
      ctx.beginPath()
      ctx.rect(x, y, size, size)
      ctx.stroke()
    }
  }
}

canvasSketch(sketch, settings)
