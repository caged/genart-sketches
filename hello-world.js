const canvasSketch = require('canvas-sketch')

const settings = {
  dimensions: [500, 500],
  pixelRatio: devicePixelRatio,
  exportPixelRatio: 2
}

function hdpi(canvas, ctx, width, height) {
  canvas.width = width * devicePixelRatio
  canvas.height = height * devicePixelRatio
  canvas.style.width = `${width}px`
  canvas.style.height = `${height}px`
  ctx.scale(devicePixelRatio, devicePixelRatio)
}

const sketch = () => {
  return ({context: ctx, width, height}) => {
    ctx.clearRect(0, 0, width, height)
    // hdpi(ctx.canvas, ctx, width, height)
    ctx.fillStyle = 'white'
    ctx.strokeStyle = 'black'
    ctx.lineWidth = 1

    const rings = width / 50
    const step = 25
    for (let i = 0; i < rings; i++) {
      const size = width - step * i * 2
      ctx.beginPath()
      ctx.rect(step * i, step * i, size, size)
      ctx.stroke()
    }
  }
}

canvasSketch(sketch, settings)
