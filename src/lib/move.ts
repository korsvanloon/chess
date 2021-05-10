import { moveColor } from './color'
import { row, column, left, right } from './tile'

export type Move = { piece: string; from: number; to: number }

export const moveTo = (tile: number) => ({ to }: Move) => to === tile
export const moveFrom = (tile: number) => ({ from }: Move) => from === tile

/**
 * Move must be a pawn attack.
 * Previous move must be a double step.
 */
export const isEnPassant = (move: Move, previousMove: Move) =>
  move.piece.toLowerCase() === 'p' &&
  previousMove.piece.toLowerCase() === 'p' &&
  row(move.from) === (moveColor(move) === 'white' ? 3 : 4) &&
  row(move.to) === (moveColor(move) === 'white' ? 2 : 5) &&
  row(previousMove.from) === (moveColor(move) === 'white' ? 1 : 6) &&
  column(move.to) === column(previousMove.to)

export const isPawnUpgrade = (move: Move) =>
  move.piece.toLowerCase() === 'p' && row(move.to) === (moveColor(move) === 'white' ? 0 : 7)

export const isCastleMove = (move: Move) =>
  move.piece.toLowerCase() === 'k' &&
  (move.from === left(move.to, 2) || move.from === right(move.to, 2))
