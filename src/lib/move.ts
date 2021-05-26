import { moveColor } from './color'
import { row, column, left, right } from './tile'

export type Move = { piece: string; from: number; to: number }

export const moveTo =
  (tile: number) =>
  ({ to }: Move) =>
    to === tile
export const moveFrom =
  (tile: number) =>
  ({ from }: Move) =>
    from === tile

/**
 * Move must be a pawn attack.
 * Previous move must be a double step.
 */
export const isEnPassant = (move: Move, previousMove: Move) =>
  isPawn(move.piece) &&
  isDoublePawnMove(previousMove) &&
  row(move.from) === row(previousMove.to) &&
  column(previousMove.to) === column(move.to)

export const isDoublePawnMove = (move: Move) =>
  isPawn(move.piece) &&
  row(move.from) === (moveColor(move) === 'white' ? 6 : 1) &&
  row(move.to) === (moveColor(move) === 'white' ? 4 : 3)

export const isPawn = (piece: string) => piece.toLowerCase() === 'p'

export const isPawnUpgrade = (move: Move) =>
  isPawn(move.piece) && row(move.to) === (moveColor(move) === 'white' ? 0 : 7)

export const isCastleMove = (move: Move) =>
  move.piece.toLowerCase() === 'k' &&
  (move.from === left(move.to, 2) || move.from === right(move.to, 2))
