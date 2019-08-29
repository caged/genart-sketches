const canvasSketch = require('canvas-sketch');
const d3 = require('d3');
const { grid } = require('../utils/grid')

const CELL_COUNT = 16
const ITEM_COUNT = 12

const settings = {
  scaleToView: true,
  parent: false,
  dimensions: [10 * 72, 10 * 72],
  bleed: 72
}

const sketch = ({ width, height, canvasWidth, canvasHeight, styleWidth, styleHeight }) => {
  // console.log(width, height, canvasWidth, canvasHeight, styleWidth, styleHeight, 12 * 72)
  const svg = d3.select('body')
    .append('svg')

  return ({ exporting, width, height, styleWidth, styleHeight, canvasWidth, canvasHeight, bleed }) => {
    svg.attr('width', styleWidth)
      .attr('height', styleHeight)
      .attr('viewBox', `0 0 ${width}, ${height}`)

    // Bleed is added to the width and height by canvas-sketch when using SVG
    // Recalc actual drawing boundaries and origin x,y
    const bwidth = width - (bleed * 2)
    const bheight = height - (bleed * 2)
    const bx = by = bleed

    const cells = Array.from(grid(CELL_COUNT, bwidth, bheight))
    const { xsize, ysize } = cells[0]
    const rad = Math.min(xsize / 2, ysize / 2) * 0.8
    const cellGroups = d3.range(ITEM_COUNT)
      .map((d, i) => {
        const angle = (i * (Math.PI * 2)) / ITEM_COUNT;
        const rotation = angle * (180 / Math.PI);
        const cx = xsize / 2
        const cy = ysize / 2
        return { angle, rotation, x: cx + Math.cos(angle) * rad, y: cy + Math.sin(angle) * rad }
      })


    drawBleed({ svg, width, height, bwidth, bheight, bx, by })

    const target = svg.append('g')
      .attr('transform', `translate(${bx}, ${by})`)

    const groups = target.selectAll('.cell')
      .data(cells)
      .join('g')
      .attr('transform', d => `translate(${d.x}, ${d.y})`)

    groups.append('rect')
      .attr('width', d => d.xsize)
      .attr('height', d => d.ysize)
      .attr('fill', 'none')
      .attr('stroke', 'red')

    const sgroup = groups.selectAll('.shape')
      .data(cellGroups)
      .join('g')
      .attr('transform', d => `translate(${d.x}, ${d.y}) rotate(${d.rotation - 90})`)

    sgroup.append('path')
      .attr('d', d3.symbol().size(rad * 2).type(d3.symbolStar))
      .attr('fill', 'none')
      .attr('stroke', 'green')

    // sgroup.append('rect')
    //   .attr('width', 10)
    //   .attr('height', 10)


    // groups.append('path')
    //   .attr('d', d3.symbol().type(d3.symbolTriangle))


    if (exporting) {
      const copy = d3.select(svg.node().cloneNode(true))
        .attr('width', width)
        .attr('height', height)

      const data = svgToBlob(copy.node())
      return { data, extension: '.svg' }
    }
  }
}

canvasSketch(sketch, settings);

// Draw the bleed area and drawing area
function drawBleed({ svg, width, height, bwidth, bheight, bx, by }) {
  const h = 10
  svg.append('defs')
    .append('pattern')
    .attr('id', 'hatch')
    .attr('patternUnits', 'userSpaceOnUse')
    .attr('width', h)
    .attr('height', h)
    .append('path')
    .attr('d', `M-1,1 l${h / 2},-${h / 2} M0,${h} l${h},-${h} M${h - 1},${h + 1} l${h / 2},-${h / 2}`)
    .style('stroke', '#ddd')
    .style('stroke-width', 1)

  svg.append('rect')
    .attr('width', width)
    .attr('height', height)
    .attr('fill', 'url(#hatch)')

  svg.append('rect')
    .attr('width', bwidth)
    .attr('height', bheight)
    .attr('x', bx)
    .attr('y', by)
    .attr('fill', '#fff')
}

function svgToBlob(svg) {
  const svgAsXML = new XMLSerializer().serializeToString(svg)
  return new Blob([svgAsXML], { type: 'image/svg+xml' })
}