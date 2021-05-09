import clsx from 'clsx'
import { parse, stringify } from 'querystring'
import { useEffect, useState } from 'react'
import { last } from './lib/collection'
import { Color, turnColor, enemyColor, tileColor, pieceColor, moveColor } from './lib/color'
import { count } from './lib/math'
import { Move, moveFrom, moveTo } from './lib/move'
import {
  row,
  up,
  down,
  left,
  right,
  hasUp,
  hasDown,
  hasLeft,
  hasRight,
  hasUpLeft,
  upLeft,
  hasUpRight,
  upRight,
  hasDownLeft,
  downLeft,
  hasDownRight,
  downRight,
  column,
} from './lib/tile'
import { onlyIf } from './lib/util'

type State = {
  selected: number | undefined
  previousMoves: Move[]
}

function App() {
  const [{ selected, previousMoves }, setState] = useState<State>({
    selected: undefined,
    previousMoves: [],
  })
  useEffect(() => {
    const { moves } = parse(window.location.search)
    const initialMoves = (moves as string)
      ?.split('-')
      .map((s) => s.split('_'))
      .map(([piece, from, to]) => ({
        piece,
        from: Number(from),
        to: Number(to),
      }))
    // console.log(moves, initialMoves)
    if (initialMoves?.length) setState({ previousMoves: initialMoves, selected: undefined })
  }, [])
  useEffect(() => {
    const moveString = previousMoves.map((m) => `${m.piece}_${m.from}_${m.to}`).join('-')
    const queryParams = stringify({
      moves: moveString,
    })
    const url = `${window.location.pathname}${moveString ? '?' + queryParams : ''}`
    window.history.replaceState(undefined, '', url)
  }, [previousMoves])

  const [hoverPlayer, setHoverPlayer] = useState<Color>()
  const [hoverMoves, setHoverMoves] = useState<Move[]>([])

  const board = boardAfterMoves(previousMoves)
  const player = turnColor(previousMoves)

  const playerMoves = getPlayerControlMoves(board, player)
  const enemyMoves = getPlayerControlMoves(board, enemyColor(player))

  const tilesMoves = board.map((piece, tile) =>
    pieceColor(piece) === player ? getTileMoves(board, tile, previousMoves, enemyMoves) : []
  )

  const selectedMoves = selected ? tilesMoves[selected] : []

  const checkMate = tilesMoves.flat().length === 0

  // console.log({ playerMoves, enemyMoves })
  return (
    <div className="App">
      <div className={clsx('game', hoverPlayer && `hover-${hoverPlayer}`)}>
        <div className="board">
          {board.map((piece, tile) => (
            <div
              key={tile}
              title={`${tile.toString()} ${coordinate(tile)}`}
              className={clsx(
                selected === tile
                  ? 'selected'
                  : selected && selectedMoves.some(moveTo(tile))
                  ? isEnemy(board[selected], piece)
                    ? 'enemy-target'
                    : 'move-target'
                  : tilesMoves[tile].length && 'selectable',
                hoverMoves.length && hoverMoves.some(moveFrom(tile)) && 'attacker'
                // (moveColor(hoverMoves[0]) !== pieceColor(piece) ? 'attacker' : 'defender')
              )}
              onMouseOver={() => setHoverPlayer(pieceColor(piece))}
              onClick={() =>
                tilesMoves[tile].length
                  ? setState({ previousMoves: previousMoves, selected: tile })
                  : selected && selectedMoves.some(moveTo(tile))
                  ? setState({
                      selected: undefined,
                      previousMoves: [...previousMoves, selectedMoves.find(moveTo(tile))!],
                    })
                  : undefined
              }
            >
              <div className={clsx('tile', tileColor(tile))}></div>
              {pieceMap[piece] && (
                <div className={clsx('piece', pieceColor(piece))}>{pieceMap[piece]}</div>
              )}
              <div>
                {onlyIf(count(playerMoves, moveTo(tile)), (amount) => (
                  <span
                    className={clsx('control', player)}
                    onMouseOver={() => setHoverMoves(playerMoves.filter(moveTo(tile)))}
                    onMouseLeave={() => setHoverMoves([])}
                  >
                    {amount}
                  </span>
                ))}
                {onlyIf(count(enemyMoves, moveTo(tile)), (amount) => (
                  <span
                    className={clsx('control', enemyColor(player))}
                    onMouseOver={() => setHoverMoves(enemyMoves.filter(moveTo(tile)))}
                    onMouseLeave={() => setHoverMoves([])}
                  >
                    {amount}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="info">
        <div>
          Turn: {previousMoves.length + 1} ({turnColor(previousMoves)})
        </div>
        {checkMate ? (
          <div>Checkmate</div>
        ) : (
          isAttacked(getKing(board, player), enemyMoves) && <div>Checked</div>
        )}
        <div>
          {previousMoves.map(({ from, to, piece }, i) => (
            <div key={i} className="move">
              <code>
                {pieceMap[piece]} {coordinate(from)} {'=>'} {coordinate(to)}
              </code>
            </div>
          ))}
          <div className="actions">
            <button
              onClick={() =>
                setState({
                  selected: undefined,
                  previousMoves: previousMoves.slice(0, previousMoves.length - 1),
                })
              }
            >
              undo
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App

// State
const isAttacked = (tile: number, enemyMoves: Move[]) => enemyMoves.some(moveTo(tile))

// MOVE
const boardAfterMoves = (moves: Move[]) => moves.reduce(boardAfterMove, initialBoard)
const boardAfterMove = (board: string[], move: Move, turn: number, allMoves: Move[]) => {
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
    console.log({ previousMove, move })
    applyEnPassant(newBoard, previousMove)
  }
  return newBoard
}

const applyMove = (board: string[], move: Move) => {
  const piece = board[move.from]
  board[move.from] = ' '
  board[move.to] = piece
}

/**
 * Move must be a pawn attack.
 * Previous move must be a double step.
 */
const isEnPassant = (move: Move, previousMove: Move) =>
  move.piece.toLowerCase() === 'p' &&
  previousMove.piece.toLowerCase() === 'p' &&
  row(move.from) === (moveColor(move) === 'white' ? 3 : 4) &&
  row(move.to) === (moveColor(move) === 'white' ? 2 : 5) &&
  row(previousMove.from) === (moveColor(move) === 'white' ? 1 : 6) &&
  column(move.to) === column(previousMove.to)

function applyEnPassant(board: string[], previousMove: Move) {
  board[previousMove.to] = ' '
}

const isPawnUpgrade = (move: Move) =>
  move.piece.toLowerCase() === 'p' && row(move.to) === (moveColor(move) === 'white' ? 0 : 7)

function applyPawnUpgrade(board: string[], move: Move) {
  board[move.to] = move.piece === 'p' ? 'q' : 'Q'
}

const isCastleMove = (move: Move) =>
  move.piece.toLowerCase() === 'k' &&
  (move.from === left(move.to, 2) || move.from === right(move.to, 2))

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

const getTileMoves = (
  board: string[],
  tile: number,
  previousMoves: Move[],
  enemyControlMoves: Move[]
) =>
  [
    ...getControlMoves(board, tile).filter(
      (move) =>
        (move.piece.toLowerCase() !== 'p' ||
          (previousMoves.length && isEnPassant(move, last(previousMoves))) ||
          isEnemy(move.piece, board[move.to])) &&
        !isFriend(move.piece, board[move.to])
    ),
    ...getPawnMoves(board, tile),
    ...getCastleMoves(board, tile, previousMoves, enemyControlMoves),
  ].filter((move) => !resultsInCheck(board, move, previousMoves))

const resultsInCheck = (board: string[], move: Move, previousMoves: Move[]) => {
  //   const newMoves = [...previousMoves, move]
  //   const newBoard = boardAfterMove(board, move, previousMoves.length, newMoves)
  //   const player = turnColor(previousMoves)
  //   const nextPlayer = turnColor(newMoves)
  // return isAttacked(getKing(newBoard, player), getPlayerControlMoves(newBoard, nextPlayer))
  return false
}

const getPlayerControlMoves = (board: string[], player: Color) =>
  board.flatMap((piece, tile) =>
    !isEmpty(piece) && player === pieceColor(piece) ? [...getControlMoves(board, tile)] : []
  )

const getKing = (board: string[], player: Color) =>
  board.findIndex((piece) => piece === (player === 'black' ? 'K' : 'k'))

const getControlMoves = (board: string[], tile: number): Move[] =>
  [...getControlledTiles(board, tile)].map(createMove(board, tile))

const getPawnMoves = (board: string[], tile: number): Move[] =>
  [...getPawnMoveTiles(board, tile)].map(createMove(board, tile))

const getCastleMoves = (
  board: string[],
  tile: number,
  historicMoves: Move[],
  enemyMoves: Move[]
): Move[] =>
  [...getCastleMoveTiles(board, tile, historicMoves, enemyMoves)].map(createMove(board, tile))

const createMove = (board: string[], from: number) => (to: number) => ({
  piece: board[from],
  from,
  to,
})

function* getPawnMoveTiles(board: string[], tile: number): Iterable<number> {
  const piece = board[tile]
  switch (piece) {
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
function* getControlledTiles(board: string[], tile: number): Iterable<number> {
  const piece = board[tile]
  switch (piece) {
    case 'R':
    case 'r':
      yield* continuous(board, tile, up, hasUp)
      yield* continuous(board, tile, down, hasDown)
      yield* continuous(board, tile, left, hasLeft)
      yield* continuous(board, tile, right, hasRight)
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
      yield* continuous(board, tile, upLeft, hasUpLeft)
      yield* continuous(board, tile, upRight, hasUpRight)
      yield* continuous(board, tile, downLeft, hasDownLeft)
      yield* continuous(board, tile, downRight, hasDownRight)
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
      yield* continuous(board, tile, up, hasUp)
      yield* continuous(board, tile, down, hasDown)
      yield* continuous(board, tile, left, hasLeft)
      yield* continuous(board, tile, right, hasRight)
      yield* continuous(board, tile, upLeft, hasUpLeft)
      yield* continuous(board, tile, upRight, hasUpRight)
      yield* continuous(board, tile, downLeft, hasDownLeft)
      yield* continuous(board, tile, downRight, hasDownRight)
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

function* getCastleMoveTiles(
  board: string[],
  tile: number,
  historicMoves: Move[],
  enemyMoves: Move[]
): Iterable<number> {
  const piece = board[tile]
  switch (piece) {
    case 'K':
      if (tile === BLACK_KING_START) {
        if (canCastle(board, tile, historicMoves, 'king', enemyMoves)) yield right(tile, 2)
        if (canCastle(board, tile, historicMoves, 'queen', enemyMoves)) yield left(tile, 2)
      }
      break
    case 'k':
      if (tile === WHITE_KING_START) {
        if (canCastle(board, tile, historicMoves, 'king', enemyMoves)) yield right(tile, 2)
        if (canCastle(board, tile, historicMoves, 'queen', enemyMoves)) yield left(tile, 2)
      }
      break
  }
}

const BLACK_KING_START = 4
const WHITE_KING_START = 60
/**
 * no previous moves for K && R
 * empty spaces between K && R
 * may not be checked
 * may not result in check
 */
const canCastle = (
  board: string[],
  kingStart: number,
  historicMoves: Move[],
  side: 'king' | 'queen',
  enemyMoves: Move[]
) =>
  !historicMoves.some(
    ({ from }) =>
      from === kingStart || from === (side === 'queen' ? left(kingStart, 4) : right(kingStart, 3))
  ) &&
  (side === 'queen' ? [-3, -2, -1] : [1, 2]).every((i) => isEmpty(board[kingStart + i])) &&
  !isAttacked(kingStart, enemyMoves) &&
  !isAttacked(side === 'queen' ? left(kingStart, 2) : right(kingStart, 2), enemyMoves)

// Positions

const isEmpty = (piece: string) => piece === ' '
const isEnemy = (piece: string, other: string) =>
  !isEmpty(other) && pieceColor(piece) !== pieceColor(other)
const isFriend = (piece: string, other: string) =>
  !isEmpty(piece) && pieceColor(piece) === pieceColor(other)

function* continuous(
  board: string[],
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

const coordinate = (tile: number) => 'abcdefgh'[column(tile)] + (8 - row(tile))

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
