import { isCastleMove, isEnPassant, isPawnUpgrade, Move } from './move'
import { left, right } from './tile'

export const boardAfterMoves = (moves: Move[]) => moves.reduce(boardAfterMove, initialBoard)
export const boardAfterMove = (board: string[], move: Move, turn: number, allMoves: Move[]) => {
  const newBoard = [...board]
  applyMove(newBoard, move)
  if (isCastleMove(move)) {
    applyCastleRookMove(newBoard, move)
  }
  if (isPawnUpgrade(move)) {
    applyPawnUpgrade(newBoard, move)
  }
  const previousMove = allMoves[turn - 1]
  if (previousMove && isEnPassant(move, previousMove)) {
    applyEnPassant(newBoard, previousMove)
  }
  return newBoard
}

function applyMove(board: string[], move: Move) {
  const piece = board[move.from]
  board[move.from] = ' '
  board[move.to] = piece
}

function applyEnPassant(board: string[], previousMove: Move) {
  board[previousMove.to] = ' '
}

function applyPawnUpgrade(board: string[], move: Move) {
  board[move.to] = move.piece === 'p' ? 'q' : 'Q'
}

function applyCastleRookMove(board: string[], move: Move) {
  if (move.to === right(move.from, 2)) {
    board[right(move.from)] = board[right(move.from, 3)]
    board[right(move.from, 3)] = ' '
  }
  if (move.to === left(move.from, 2)) {
    board[left(move.from, 1)] = board[left(move.from, 4)]
    board[left(move.from, 4)] = ' '
  }
}

const initialBoard = (
  'RNBQKBNR' +
  'PPPPPPPP' +
  '        ' +
  '        ' +
  '        ' +
  '        ' +
  'pppppppp' +
  'rnbqkbnr'
).split('')
