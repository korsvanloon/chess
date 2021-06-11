import { boardAfterMove } from './board'
import { last } from '../collection'
import { controlMovesOn, controlMovesFor } from './control-moves'
import { isEnPassant, toMove, movingTo, movingFrom } from './move'
import { isEnemy, isFriend, isEmpty, isPawn } from './piece'
import { enemyOf, currentPlayer } from './player'
import { down, row, up, right, left } from './tile'
import { Color, Move, Piece } from './types'

export const isChecked = (board: Piece[], player: Color, enemyMoves: Move[]) =>
  isAttacked(getKing(board, player), enemyMoves)

export const isAttacked = (tile: number, enemyMoves: Move[]) => enemyMoves.some(movingTo(tile))

export const getKing = (board: Piece[], player: Color) =>
  board.findIndex((piece) => piece === (player === 'black' ? 'K' : 'k'))

export const tileMoves = (
  board: Piece[],
  tile: number,
  previousMoves: Move[],
  enemyControlMoves: Move[]
) =>
  [
    ...controlMovesOn(board, tile).filter(
      (move) =>
        (!isPawn(move.piece) ||
          // Pawn control moves are only valid if there is an enemy or En Passant
          (previousMoves.length && isEnPassant(move, last(previousMoves))) ||
          isEnemy(move.piece, board[move.to])) &&
        !isFriend(move.piece, board[move.to])
    ),
    ...pawnMoves(board, tile),
    ...castleMoves(board, tile, previousMoves, enemyControlMoves),
  ].filter(
    (move) =>
      !playerIsChecked(
        boardAfterMove(board, move, previousMoves.length, [...previousMoves, move]),
        currentPlayer(previousMoves)
      )
  )

const pawnMoves = (board: Piece[], tile: number): Move[] =>
  [...yieldPawnMoveTiles(board, tile)].map(toMove({ from: tile, board }))

const playerIsChecked = (board: Piece[], player: Color) =>
  isChecked(board, player, controlMovesFor({ player: enemyOf(player), board }))

const castleMoves = (
  board: Piece[],
  tile: number,
  previousMoves: Move[],
  enemyMoves: Move[]
): Move[] =>
  [...yieldCastleMoveTiles(board, tile, previousMoves, enemyMoves)].map(
    toMove({ from: tile, board })
  )

/**
 * 1 square forward and 2 if it's the first move.
 */
function* yieldPawnMoveTiles(board: Piece[], tile: number): Iterable<number> {
  switch (board[tile]) {
    case 'P':
      if (isEmpty(board[down(tile)])) yield down(tile)
      if (row(tile) === 1 && isEmpty(board[down(tile)]) && isEmpty(board[down(tile, 2)]))
        yield down(tile, 2)
      break
    case 'p':
      if (isEmpty(board[up(tile)])) yield up(tile)
      if (row(tile) === 6 && isEmpty(board[up(tile)]) && isEmpty(board[up(tile, 2)]))
        yield up(tile, 2)
      break
  }
}

const BLACK_KING_START = 4
const WHITE_KING_START = 60

function* yieldCastleMoveTiles(
  board: Piece[],
  tile: number,
  previousMoves: Move[],
  enemyMoves: Move[]
): Iterable<number> {
  switch (board[tile]) {
    case 'K':
      if (tile === BLACK_KING_START) {
        if (canCastle(board, tile, previousMoves, 'king', enemyMoves)) yield right(tile, 2)
        if (canCastle(board, tile, previousMoves, 'queen', enemyMoves)) yield left(tile, 2)
      }
      break
    case 'k':
      if (tile === WHITE_KING_START) {
        if (canCastle(board, tile, previousMoves, 'king', enemyMoves)) yield right(tile, 2)
        if (canCastle(board, tile, previousMoves, 'queen', enemyMoves)) yield left(tile, 2)
      }
      break
  }
}

const canCastle = (
  board: Piece[],
  kingStart: number,
  previousMoves: Move[],
  side: 'king' | 'queen',
  enemyMoves: Move[]
) =>
  // * no previous moves for K && R
  !previousMoves.some(movingFrom(kingStart)) &&
  !previousMoves.some(movingFrom(rookStart(side, kingStart))) &&
  // * empty spaces between K && R
  (side === 'queen' ? [-3, -2, -1] : [1, 2]).every((i) => isEmpty(board[kingStart + i])) &&
  // * may not be checked
  !isAttacked(kingStart, enemyMoves) &&
  // * may not result in check
  !isAttacked(side === 'queen' ? left(kingStart, 2) : right(kingStart, 2), enemyMoves)

const rookStart = (side: 'king' | 'queen', kingStart: number) =>
  side === 'queen' ? left(kingStart, 4) : right(kingStart, 3)
