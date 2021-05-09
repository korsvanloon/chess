export type Move = { piece: string; from: number; to: number }

export const moveTo = (tile: number) => ({ to }: Move) => to === tile
export const moveFrom = (tile: number) => ({ from }: Move) => from === tile
