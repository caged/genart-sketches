const shuffle = require('shuffle-array')
const seedrandom = require('seedrandom')
const palettes = require('nice-color-palettes/1000.json')

export function palette(top = 500, seed = Date.now()) {
  const rng = seedrandom(seed)

  function random(picks = 1) {
    return shuffle.pick(palettes.slice(0, top), {rng, picks})
  }

  return {
    random
  }
}
