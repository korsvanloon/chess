import clsx from 'clsx'
import React, { useState } from 'react'
import { count } from './lib/math'

type Move = { from: number; to: number }
type State = {
  selected: number | undefined
  moves: Move[]
}

function App() {
  const [{ selected, moves }, setState] = useState<State>({
    selected: undefined,
    moves: [],
  })

  const board = boardAfterMoves(moves)
  const player = turnColor(moves)

  const enemyMoves = board.flatMap((p, i) =>
    !empty(board, i) && player !== pieceColor(p) ? [...getBasicMoves(board, i)] : []
  )

  console.log(enemyMoves)

  const allowedMoves = selected !== undefined ? [...getBasicMoves(board, selected)] : []

  return (
    <div className="App">
      <div className="board">
        {board.map((p, i) => (
          <div
            key={i}
            className={clsx(
              tileColor(i),
              selected === i
                ? 'selected'
                : selected && allowedMoves.includes(i)
                ? enemy(board, selected, i)
                  ? 'enemy-target'
                  : 'move-target'
                : isSelectable(i, board, moves) && 'selectable'
            )}
            onClick={() =>
              isSelectable(i, board, moves)
                ? setState({ moves, selected: i })
                : allowedMoves.includes(i)
                ? setState({
                    selected: undefined,
                    moves: [...moves, { from: selected!, to: i }],
                  })
                : undefined
            }
          >
            <div className="tile">
              {(player === pieceColor(p) && count(enemyMoves, i)) || undefined}
            </div>
            {pieceMap[p] && <div className="piece">{pieceMap[p]}</div>}
          </div>
        ))}
      </div>
      <pre>
        Turn: {moves.length + 1} ({isWhiteTurn(moves) ? 'white' : 'black'}) Moves:
        {JSON.stringify(moves, null, 2)}
      </pre>
    </div>
  )
}

const boardAfterMove = (board: string[], move: Move) => {
  const newBoard = [...board]
  newBoard[move.from!] = ' '
  newBoard[move.to] = board[move.from!]
  return newBoard
}

const tileColor = (i: number) => ((i + Math.floor(i / 8)) % 2 === 0 ? 'white' : 'black')
const isSelectable = (i: number, board: string[], moves: Move[]) =>
  isWhiteTurn(moves) ? isWhitePiece(board[i]) : isBlackPiece(board[i])
const isBlackPiece = (piece: string) => /[A-Z]/.test(piece)
const isWhitePiece = (piece: string) => /[a-z]/.test(piece)
const isWhiteTurn = (moves: Move[]) => moves.length % 2 === 0
const turnColor = (moves: Move[]) => (moves.length % 2 === 0 ? 'white' : 'black')
const pieceColor = (piece: string) =>
  /[A-Z]/.test(piece) ? 'black' : /[a-z]/.test(piece) ? 'white' : undefined

const boardAfterMoves = (moves: Move[]) => moves.reduce(boardAfterMove, initialBoard.split(''))

export default App

const initialBoard =
  'RNBQKBNR' + //
  'PPPPPPPP' +
  '        ' +
  '        ' +
  '        ' +
  '        ' +
  'pppppppp' +
  'rnbqkbnr'

const pieceMap: { [c: string]: string } = {
  R: '♜',
  N: '♞',
  B: '♝',
  Q: '♛',
  K: '♚',
  P: '♟︎',
  r: '♖',
  n: '♘',
  b: '♗',
  q: '♕',
  k: '♔',
  p: '♙',
}

function* getBasicMoves(board: string[], i: number): Iterable<number> {
  switch (board[i]) {
    case 'R':
    case 'r':
      yield* continuous(board, i, up, hasUp)
      yield* continuous(board, i, down, hasDown)
      yield* continuous(board, i, left, hasLeft)
      yield* continuous(board, i, right, hasRight)
      break
    case 'N':
    case 'n':
      if (hasUpLeft(up(i)) && !friend(board, i, up(upLeft(i)))) yield up(upLeft(i))
      if (hasUpRight(up(i)) && !friend(board, i, up(upRight(i)))) yield up(upRight(i))
      if (hasDownLeft(down(i)) && !friend(board, i, down(downLeft(i)))) yield down(downLeft(i))
      if (hasDownRight(down(i)) && !friend(board, i, down(downRight(i)))) yield down(downRight(i))
      if (hasUpLeft(left(i)) && !friend(board, i, left(upLeft(i)))) yield left(upLeft(i))
      if (hasDownLeft(left(i)) && !friend(board, i, left(downLeft(i)))) yield left(downLeft(i))
      if (hasUpRight(right(i)) && !friend(board, i, right(upRight(i)))) yield right(upRight(i))
      if (hasDownRight(down(i)) && !friend(board, i, right(downRight(i)))) yield right(downRight(i))
      break
    case 'B':
    case 'b':
      yield* continuous(board, i, upLeft, hasUpLeft)
      yield* continuous(board, i, upRight, hasUpRight)
      yield* continuous(board, i, downLeft, hasDownLeft)
      yield* continuous(board, i, downRight, hasDownRight)
      break
    case 'K':
    case 'k':
      if (!friend(board, i, up(i))) yield up(i)
      if (!friend(board, i, down(i))) yield down(i)
      if (!friend(board, i, left(i))) yield left(i)
      if (!friend(board, i, right(i))) yield right(i)
      if (!friend(board, i, upLeft(i))) yield upLeft(i)
      if (!friend(board, i, upRight(i))) yield upRight(i)
      if (!friend(board, i, downLeft(i))) yield downLeft(i)
      if (!friend(board, i, downRight(i))) yield downRight(i)
      break
    case 'Q':
    case 'q':
      yield* continuous(board, i, up, hasUp)
      yield* continuous(board, i, down, hasDown)
      yield* continuous(board, i, left, hasLeft)
      yield* continuous(board, i, right, hasRight)
      yield* continuous(board, i, upLeft, hasUpLeft)
      yield* continuous(board, i, upRight, hasUpRight)
      yield* continuous(board, i, downLeft, hasDownLeft)
      yield* continuous(board, i, downRight, hasDownRight)
      break
    case 'P':
      if (empty(board, down(i))) yield down(i)
      if (row(i) === 1 && empty(board, down(i)) && empty(board, down(down(i)))) yield down(down(i))
      if (enemy(board, i, downLeft(i))) yield downLeft(i)
      if (enemy(board, i, downRight(i))) yield downRight(i)
      break
    case 'p':
      if (empty(board, up(i))) yield up(i)
      if (row(i) === 6 && empty(board, up(i)) && empty(board, up(up(i)))) yield up(up(i))
      if (enemy(board, i, upLeft(i))) yield upLeft(i)
      if (enemy(board, i, upRight(i))) yield upRight(i)
      break
    default:
      break
  }
}
/** 0..7 */
const row = (i: number) => Math.floor(i / 8)
/** 0..7 */
const column = (i: number) => i % 8

const left = (i: number) => i - 1
const right = (i: number) => i + 1
const up = (i: number) => i - 8
const down = (i: number) => i + 8

const upLeft = (i: number) => up(left(i))
const upRight = (i: number) => up(right(i))
const downLeft = (i: number) => down(left(i))
const downRight = (i: number) => down(right(i))

const hasLeft = (i: number) => column(i) > 0
const hasRight = (i: number) => column(i) < 7
const hasUp = (i: number) => row(i) > 0
const hasDown = (i: number) => row(i) < 7

const hasUpLeft = (i: number) => hasUp(i) && hasLeft(i)
const hasUpRight = (i: number) => hasUp(i) && hasRight(i)
const hasDownLeft = (i: number) => hasDown(i) && hasLeft(i)
const hasDownRight = (i: number) => hasDown(i) && hasRight(i)

const empty = (board: string[], index: number) => board[index] === ' '
const enemy = (board: string[], index: number, target: number) =>
  !empty(board, target) && pieceColor(board[index]) !== pieceColor(board[target])
const friend = (board: string[], index: number, target: number) =>
  !empty(board, target) && pieceColor(board[index]) === pieceColor(board[target])

const enemyOf = (player: 'white' | 'black', piece: string) => player !== pieceColor(piece)

function* continuous(
  board: string[],
  from: number,
  next: (from: number) => number,
  hasNext: (index: number) => boolean
): Iterable<number> {
  let current = from
  while (hasNext(current) && !friend(board, from, next(current))) {
    current = next(current)

    yield current
    if (enemy(board, from, current)) break
  }
}
