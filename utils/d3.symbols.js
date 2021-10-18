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

export { symbolBlade, symbolBladeHalf }