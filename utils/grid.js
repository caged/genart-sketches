const { scaleBand } = require('d3-scale')
const { range } = require('d3-array')

export function* grid(count, width, height) {
  const xys = Math.ceil(Math.sqrt(count))
  const ys = scaleBand()
    .domain(range(xys))
    .range([0, height])
    .padding(0.0, 0.0)

  const xs = scaleBand()
    .domain(range(0, Math.ceil(count / xys)))
    .range([0, width])

  const xsize = xs.bandwidth()
  const ysize = ys.bandwidth()

  let i = 0

  for (const yv of ys.domain()) {
    for (const xv of xs.domain()) {
      yield { x: xs(xv), y: ys(yv), xsize, ysize, i }
      i++
    }
  }
}
