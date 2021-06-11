import { isEmpty, isPawn, pieceColor } from './piece'
import { row, column, left, right } from './tile'
import { Move, Color, Piece } from './types'

export const moveColor = (move: Move) => pieceColor(move.piece)!

export const toMove = ({ from, board }: { from: number; board: Piece[] }) => (to: number) => ({
  piece: board[from],
  from,
  to,
})

export const movingTo = (tile: number) => ({ to }: Move) => to === tile

export const movingFrom = (tile: number) => ({ from }: Move) => from === tile

/**
 * Move must be a pawn attack.
 * Previous move must be a double move.
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

export const isPawnUpgrade = (move: Move) =>
  isPawn(move.piece) && row(move.to) === (moveColor(move) === 'white' ? 0 : 7)

export const isCastleMove = (move: Move) =>
  move.piece.toLowerCase() === 'k' &&
  (move.from === left(move.to, 2) || move.from === right(move.to, 2))

export const isSupportMove = (board: Piece[], move: Move, player: Color) =>
  // move to friendly piece
  pieceColor(board[move.from]) === pieceColor(board[move.to]) ||
  // or an empty space
  (isEmpty(board[move.to]) && pieceColor(move.piece) === player)
