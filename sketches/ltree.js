const canvasSketch = require('canvas-sketch')
const LSystem = require('lindenmayer')
const shuffle = require('shuffle-array')
const {palette} = require('./utils/palette')

const settings = {
  dimensions: 'A3',
  pixelRatio: devicePixelRatio,
  exportPixelRatio: devicePixelRatio
}

const lineIncrement = 100
const palettes = palette()
const pcolors = palettes.random()
const baseColor = shuffle.pick(pcolors)
const colors = pcolors.filter(c => c !== baseColor)

const sketch = ({context: ctx, width}) => {
  let linelength = lineIncrement
  const tree = new LSystem({
    productions: {
      X: {
        successors: [
          {weight: 0.05, successor: 'F[+X]FF-[X+FF-X]+X'},
          {weight: 0.45, successor: 'F[-X]FF+[X-FF+X]-X'},
          {weight: 0.05, successor: 'FF-[[X]+X]+F[+FX]-X'},
          {weight: 0.45, successor: 'FF-[X+]+FF[-FX]-XF[X-]'}
        ]
      },
      F: {
        successors: [{weight: 0.8, successor: 'F'}, {weight: 0.1, successor: 'FFF'}, {weight: 0.1, successor: 'FF+'}]
      }
    },
    finals: {
      F: () => {
        ctx.lineWidth += Math.random() * 1
        ctx.beginPath()
        ctx.moveTo(0, 0)
        ctx.lineTo(0, linelength / (tree.iterations + 1))
        ctx.stroke()
        ctx.translate(0, linelength / (tree.iterations + 1))
      },
      '+': () => {
        ctx.strokeStyle = shuffle.pick(colors)
        ctx.rotate((Math.PI / 180) * 45)
      },
      '-': () => {
        ctx.strokeStyle = shuffle.pick(colors)
        ctx.rotate((Math.PI / 180) * -45)
      },
      '[': () => {
        ctx.save()
        ctx.lineWidth *= 0.5
        ctx.globalAlpha *= Math.random() * (1.0 - 0.5) + 0.5
        linelength -= lineIncrement
      },
      ']': () => {
        ctx.restore()
        ctx.lineWidth *= 0.5
        linelength += lineIncrement
      }
    }
  })

  tree.setAxiom('X')
  tree.iterate(6)

  return ({context: ctx, canvasWidth, canvasHeight}) => {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight)

    ctx.strokeStyle = colors[0]
    ctx.fillStyle = baseColor
    ctx.fillRect(0, 0, canvasWidth, canvasHeight)
    ctx.fill()

    ctx.translate(width / 2, width / 1.5)
    ctx.rotate((Math.PI / 180) * shuffle.pick([90, -90, 180, -180]))
    tree.final()
  }
}

canvasSketch(sketch, settings)
