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
      const x = step * i + rings
      const y = step * i + rings
      ctx.strokeStyle = colors[(pick = ++pick >= colors.length ? 0 : pick)]
      ctx.save()
      ctx.beginPath()
      ctx.translate(x + width / 2, y + height / 2)
      ctx.rotate((5 * Math.PI) / 180)
      ctx.rect(-width / 2, -height / 2, size, size)
      ctx.stroke()
      ctx.restore()
    }
  }
}

canvasSketch(sketch, settings)
