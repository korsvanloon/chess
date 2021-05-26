/** Returns a number between 0..7, where 0 is the top row. */
export const row = (tile: number) => Math.floor(tile / 8)
/** Returns a number between 0..7, where 0 is the most left column. */
export const column = (tile: number) => tile % 8

export const left = (tile: number, amount = 1) => tile - amount
export const right = (tile: number, amount = 1) => tile + amount
export const up = (tile: number, amount = 1) => tile - 8 * amount
export const down = (tile: number, amount = 1) => tile + 8 * amount

export const upLeft = (tile: number) => up(left(tile))
export const upRight = (tile: number) => up(right(tile))
export const downLeft = (tile: number) => down(left(tile))
export const downRight = (tile: number) => down(right(tile))

export const hasLeft = (tile: number) => column(tile) > 0
export const hasRight = (tile: number) => column(tile) < 7
export const hasUp = (tile: number) => row(tile) > 0
export const hasDown = (tile: number) => row(tile) < 7

export const hasUpLeft = (tile: number) => hasUp(tile) && hasLeft(tile)
export const hasUpRight = (tile: number) => hasUp(tile) && hasRight(tile)
export const hasDownLeft = (tile: number) => hasDown(tile) && hasLeft(tile)
export const hasDownRight = (tile: number) => hasDown(tile) && hasRight(tile)

/** Converts a tile to a o */
export const coordinate = (tile: number) => 'abcdefgh'[column(tile)] + (8 - row(tile))
