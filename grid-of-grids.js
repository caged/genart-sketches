const canvasSketch = require('canvas-sketch')
const palettes = require('nice-color-palettes/100.json')
const shuffle = require('shuffle-array')
const {scaleBand} = require('d3-scale')
const {range} = require('d3-array')
const seedrandom = require('seedrandom')

const settings = {
  dimensions: [1000, 1000],
  pixelRatio: devicePixelRatio,
  exportPixelRatio: 2
}

canvasSketch(() => {
  return ({context: ctx, width, height}) => {
    const seed = Date.now()
    /* eslint-disable-next-line */
    console.log(`Generating with seed ${seed}`)

    const rng = seedrandom(seed)
    const xys = Math.ceil(Math.sqrt(palettes.length))
    const y = scaleBand()
      .domain(range(0, xys))
      .range([0, height])
      .padding(0.0, 0.0)
      .round(true)

    const x = scaleBand()
      .domain(range(0, palettes.length / xys))
      .range([0, width])
      .padding(0.0, 0.0)

      .round(true)

    ctx.clearRect(0, 0, width, height)

    for (const yv of y.domain()) {
      for (const xv of x.domain()) {
        const cellWidth = x.bandwidth()
        const rings = 5
        // cellWidth -= rings * 2
        const step = Math.floor(cellWidth / 2 / rings)
        const colors = shuffle.pick(palettes)
        const colors = shuffle.pick(palettes, {rng})
        let pick = -1

        ctx.lineWidth = step * 0.5

        for (let i = 1; i <= rings; i++) {
          const size = cellWidth - step * i * 2
          const rx = x(xv) + step * i
          const ry = y(yv) + step * i
          ctx.strokeStyle = colors[(pick = ++pick >= colors.length ? 0 : pick)]
          ctx.beginPath()
          ctx.rect(rx, ry, size, size)
          ctx.stroke()
        }

        // ctx.strokeStyle = '#333'
        // ctx.beginPath()
        // ctx.rect(x(xv), y(yv), x.bandwidth(), y.bandwidth())
        // ctx.stroke()
      }
    }

    // const rings = 25
    // width -= rings * 2
    // height -= rings * 2
    // const step = Math.floor(width / 2 / rings)
    // const colors = shuffle.pick(palettes)
    // let pick = -1
    //
    // ctx.clearRect(0, 0, width, height)
    // ctx.lineWidth = step * 0.5
    //
    // for (let i = 1; i <= rings; i++) {
    //   const size = width - step * i * 2
    //   const x = step * i
    //   const y = step * i
    //   ctx.strokeStyle = colors[(pick = ++pick >= colors.length ? 0 : pick)]
    //   ctx.beginPath()
    //   ctx.rect(x, y, size, size)
    //   ctx.stroke()
    // }
  }
}, settings)
