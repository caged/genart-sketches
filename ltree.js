const canvasSketch = require('canvas-sketch')
const LSystem = require('lindenmayer')
const shuffle = require('shuffle-array')
const {palette} = require('./utils/palette')

const settings = {
  dimensions: [2048, 2048]
}

const lineIncrement = 2

const palettes = palette()
const pcolors = palettes.random()
const baseColor = shuffle.pick(pcolors)
const colors = pcolors.filter(c => c !== baseColor)

const sketch = ({context: ctx, width, height}) => {
  let linelength = 180
  const tree = new LSystem({
    productions: {
      X: {
        successors: [
          {
            weight: 0.5,
            successor: 'FFF-[[X]+X]+F[+FX]-X'
          },
          {
            weight: 0.5,
            successor: 'FF-[X+]+FF[-FX]-XF[X-]'
          }
        ]
      },
      F: {
        successors: [
          {
            weight: 0.8,
            successor: 'F'
          },
          {
            weight: 0.1,
            successor: 'FFF'
          },
          {
            weight: 0.01,
            successor: 'FF+'
          }
        ]
      }
    },
    finals: {
      F: () => {
        ctx.lineWidth += Math.random() - 0.2
        ctx.beginPath()
        ctx.moveTo(0, 0)
        ctx.lineTo(0, linelength / (tree.iterations + 1))
        ctx.stroke()
        ctx.translate(0, linelength / (tree.iterations + 1))
      },
      '+': () => {
        ctx.strokeStyle = colors[0]
        ctx.rotate((Math.PI / 180) * 90)
      },
      '-': () => {
        ctx.strokeStyle = colors[1]
        ctx.rotate((Math.PI / 180) * -90)
      },
      '[': () => {
        ctx.save()
        ctx.lineWidth *= 0.5
        ctx.globalAlpha *= Math.random() * (1.0 - 0.5) + 0.5
        linelength -= lineIncrement
      },
      ']': () => {
        ctx.restore()
        ctx.lineWidth *= 0.7
        linelength += lineIncrement
      }
    }
  })

  tree.setAxiom('X')
  tree.iterate(7)

  return ({context: ctx}) => {
    ctx.clearRect(0, 0, width, height)
    ctx.fillStyle = baseColor
    ctx.strokeStyle = colors[0]
    ctx.fillRect(0, 0, width, height)
    ctx.translate(width / 2, height / 1.5)
    ctx.rotate(Math.PI)
    tree.final()
  }
}

canvasSketch(sketch, settings)
