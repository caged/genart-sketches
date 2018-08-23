const canvasSketch = require('canvas-sketch')
const palettes = require('nice-color-palettes/500.json')
const shuffle = require('shuffle-array')
const {scaleBand} = require('d3-scale')
const {range} = require('d3-array')
const seedrandom = require('seedrandom')

const settings = {
  dimensions: 'A4',
  pixelRatio: devicePixelRatio,
  exportPixelRatio: devicePixelRatio
}

const count = 100

canvasSketch(() => {
  return ({context: ctx, width, height}) => {
    const seed = Date.now()
    /* eslint-disable-next-line */
    console.log(`Generating with seed ${seed}`)
    const rng = seedrandom(seed)
    const xys = Math.ceil(Math.sqrt(count))
    const y = scaleBand()
      .domain(range(0, xys))
      .range([0, height])
      .padding(0.0, 0.0)
      .round(true)
    const x = scaleBand()
      .domain(range(0, count / xys))
      .range([0, width])
      .round(true)

    ctx.clearRect(0, 0, width, height)
    ctx.fillStyle = '#fff'
    ctx.fillRect(0, 0, width, height)

    for (const yv of y.domain()) {
      for (const xv of x.domain()) {
        const cellWidth = x.bandwidth()
        const cellHeight = y.bandwidth()
        const rings = 6
        const step = Math.floor(Math.min(cellWidth, cellHeight) / 2 / rings)
        const colors = shuffle.pick(palettes, {rng})
        let pick = -1

        ctx.lineWidth = step * 0.5

        for (let i = 1; i <= rings; i++) {
          const xsize = cellWidth - step * i * 2
          const ysize = cellHeight - step * i * 2

          const rx = x(xv) + step * i
          const ry = y(yv) + step * i
          ctx.strokeStyle = colors[(pick = ++pick >= colors.length ? 0 : pick)]
          ctx.beginPath()
          ctx.rect(rx, ry, xsize, ysize)
          ctx.stroke()
        }

        // ctx.strokeStyle = '#333'
        // ctx.lineWidth = 1
        // ctx.beginPath()
        // ctx.rect(x(xv), y(yv), x.bandwidth(), y.bandwidth())
        // ctx.stroke()
      }
    }
  }
}, settings)
