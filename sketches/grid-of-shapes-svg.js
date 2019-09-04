const canvasSketch = require('canvas-sketch');
const random = require('canvas-sketch-util/random')
const d3 = require('d3');
const { grid } = require('../utils/grid')
const shuffle = require('shuffle-array')


const settings = {
  scaleToView: true,
  parent: false,
  dimensions: [10 * 72, 10 * 72],
  bleed: 72
}

const CELL_COUNT = 25
const ITEM_COUNT = 12

// const interpolations = [
//   d3.interpolatePRGn,
//   d3.interpolateBrBG,
//   d3.interpolatePiYG,
//   d3.interpolatePuOr,
//   d3.interpolateRdBu,
//   d3.interpolateRdGy,
//   d3.interpolateRdYlBu,
//   d3.interpolateRdYlGn,
//   d3.interpolateSpectral,
//   d3.interpolateViridis,
//   d3.interpolateInferno,
//   d3.interpolateMagma,
//   d3.interpolatePlasma,
//   d3.interpolateWarm,
//   d3.interpolateCool,
//   d3.interpolateCubehelixDefault,
//   d3.interpolateBuGn,
//   d3.interpolateBuPu,
//   d3.interpolateGnBu,
//   d3.interpolateOrRd,
//   d3.interpolatePuBuGn,
//   d3.interpolatePuBu,
//   d3.interpolatePuRd,
//   d3.interpolateRdPu,
//   d3.interpolateYlGnBu,
//   d3.interpolateYlGn,
//   d3.interpolateYlOrBr,
//   d3.interpolateYlOrRd,
//   d3.interpolateRainbow,
//   d3.interpolateSinebow
// ]

const colorScale = d3.scaleSequential(d3.interpolateSpectral).domain([0, ITEM_COUNT - 1])

const symbolBlade = {
  draw: (context, size) => {
    const w = Math.sqrt(size)
    const cpy = w / 2

    context.moveTo(0, 0);
    context.quadraticCurveTo(w / 2, cpy, w, 0)
    context.quadraticCurveTo(w / 2, -cpy, 0, 0)
  }
}

const symbolBladeHalf = {
  draw: (context, size) => {
    const w = Math.sqrt(size)
    const cpy = w / 2

    context.moveTo(0, 0);
    context.quadraticCurveTo(w / 2, cpy, w, 0)
    context.closePath()
  }
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
    const rad = 5 //Math.min(xsize / 4, ysize / 4) * 0.7
    const cellGroups = d3.range(ITEM_COUNT)
      .map((d, i) => {
        const angle = (i * (Math.PI * 2)) / ITEM_COUNT;
        const rotation = angle * (180 / Math.PI);
        const cx = xsize / 2
        const cy = ysize / 2
        return {
          angle,
          rotation,
          x: cx + Math.cos(angle) * rad,
          y: cy + Math.sin(angle) * rad
        }
      })


    drawBleed({ svg, width, height, bwidth, bheight, bx, by })
    const target = svg.append('g')
      .attr('transform', `translate(${bx}, ${by})`)

    const groups = target.selectAll('.cell')
      .data(cells)
      .join('g')
      .attr('class', 'cell')
      .attr('transform', d => `translate(${d.x}, ${d.y})`)
    // .attr('clip-path', (d, i) => `url(#clip-${i})`)

    const sgroup = groups.selectAll('.shape')
      .data(cellGroups)
      .join('g')
      .attr('class', 'shape')
      .attr('transform', d => `translate(${d.x}, ${d.y}) rotate(${d.rotation})`)


    let gindex = 0
    sgroup.append('path')
      .attr('d', d3.symbol().size(3000).type(symbolBlade))
      .each(function (d, i) {

        const e = d3.select(this)
        const cell = d3.select(this.parentNode.parentNode)

        // Use an incrementing offset for each group so we can 
        // rotate the colors to make it a little more interesting 
        let offset = (ITEM_COUNT - 1) - (gindex + i)
        offset = offset < 0 ? ITEM_COUNT + offset : offset

        const color = d3.color(colorScale(offset))
        e.attr('fill', color)

        if (lastItem(i)) {
          gindex++
        } else if (gindex >= ITEM_COUNT) {
          gindex = 0
        }
      })


    if (exporting) {
      const copy = d3.select(svg.node().cloneNode(true))
        .attr('width', width)
        .attr('height', height)

      const data = svgToBlob(copy.node())
      return { data, extension: '.svg' }
    }
  }
}

function lastItem(i) {
  return i === ITEM_COUNT - 1
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