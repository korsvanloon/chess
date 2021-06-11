import { toMove } from './move'
import { isEmpty, pieceColor } from './piece'
import {
  up,
  hasUp,
  down,
  hasDown,
  left,
  hasLeft,
  right,
  hasRight,
  hasUpLeft,
  upLeft,
  hasUpRight,
  upRight,
  hasDownLeft,
  downLeft,
  hasDownRight,
  downRight,
} from './tile'
import { Color, Move, Piece } from './types'

// player control moves
export const controlMovesFor = ({ player, board }: { board: Piece[]; player: Color }) =>
  board.flatMap((piece, tile) =>
    !isEmpty(piece) && player === pieceColor(piece) ? [...controlMovesOn(board, tile)] : []
  )

// control moves
export const controlMovesOn = (board: Piece[], tile: number): Move[] =>
  [...yieldControlledTiles(board, tile)].map(toMove({ from: tile, board }))

function* yieldControlledTiles(board: Piece[], tile: number): Iterable<number> {
  switch (board[tile]) {
    case 'R':
    case 'r':
      yield* yieldLine(board, tile, up, hasUp)
      yield* yieldLine(board, tile, down, hasDown)
      yield* yieldLine(board, tile, left, hasLeft)
      yield* yieldLine(board, tile, right, hasRight)
      break
    case 'N':
    case 'n':
      if (hasUpLeft(up(tile))) yield up(upLeft(tile))
      if (hasUpRight(up(tile))) yield up(upRight(tile))
      if (hasDownLeft(down(tile))) yield down(downLeft(tile))
      if (hasDownRight(down(tile))) yield down(downRight(tile))
      if (hasUpLeft(left(tile))) yield left(upLeft(tile))
      if (hasDownLeft(left(tile))) yield left(downLeft(tile))
      if (hasUpRight(right(tile))) yield right(upRight(tile))
      if (hasDownRight(right(tile))) yield right(downRight(tile))
      break
    case 'B':
    case 'b':
      yield* yieldLine(board, tile, upLeft, hasUpLeft)
      yield* yieldLine(board, tile, upRight, hasUpRight)
      yield* yieldLine(board, tile, downLeft, hasDownLeft)
      yield* yieldLine(board, tile, downRight, hasDownRight)
      break
    case 'K':
    case 'k':
      if (hasUp(tile)) yield up(tile)
      if (hasDown(tile)) yield down(tile)
      if (hasLeft(tile)) yield left(tile)
      if (hasRight(tile)) yield right(tile)
      if (hasUpLeft(tile)) yield upLeft(tile)
      if (hasUpRight(tile)) yield upRight(tile)
      if (hasDownLeft(tile)) yield downLeft(tile)
      if (hasDownRight(tile)) yield downRight(tile)
      break
    case 'Q':
    case 'q':
      yield* yieldLine(board, tile, up, hasUp)
      yield* yieldLine(board, tile, down, hasDown)
      yield* yieldLine(board, tile, left, hasLeft)
      yield* yieldLine(board, tile, right, hasRight)
      yield* yieldLine(board, tile, upLeft, hasUpLeft)
      yield* yieldLine(board, tile, upRight, hasUpRight)
      yield* yieldLine(board, tile, downLeft, hasDownLeft)
      yield* yieldLine(board, tile, downRight, hasDownRight)
      break
    case 'P':
      if (hasDownLeft(tile)) yield downLeft(tile)
      if (hasDownRight(tile)) yield downRight(tile)
      break
    case 'p':
      if (hasUpLeft(tile)) yield upLeft(tile)
      if (hasUpRight(tile)) yield upRight(tile)
      break
    default:
      break
  }
}

function* yieldLine(
  board: Piece[],
  from: number,
  next: (from: number) => number,
  hasNext: (index: number) => boolean
): Iterable<number> {
  let current = from
  while (hasNext(current)) {
    current = next(current)
    yield current
    if (!isEmpty(board[current])) break
  }
}
