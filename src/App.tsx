import clsx from 'clsx'
import { parse, stringify } from 'querystring'
import { useEffect, useState } from 'react'
import { boardAfterMove, boardAfterMoves } from './lib/board'
import { last } from './lib/collection'
import { Color, turnColor, enemyColor, pieceColor } from './lib/color'
import { count } from './lib/math'
import { isEnPassant, isPawn, Move, moveFrom, moveTo } from './lib/move'
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
  coordinate,
  column,
} from './lib/tile'
import { deserializeMoves, serializeMoves } from './lib/url-serialization'
import { onlyIf } from './lib/util'
import { unicodePieceMap } from './pieceMap'
import Square from './Square'

type State = {
  selected: number | undefined
  previousMoves: Move[]
}

function App() {
  const [{ selected, previousMoves }, setState] = useState<State>({
    selected: undefined,
    previousMoves: [],
  })
  const [hoverMoves, setHoverMoves] = useState<Move[]>([])
  const [hoverTurn, setHoverTurn] = useState<number>()

  useEffect(() => {
    const initialMoves = deserializeMoves(parse(window.location.search.slice(1)).moves as string)
    if (initialMoves?.length) setState({ previousMoves: initialMoves, selected: undefined })
  }, [])

  useEffect(() => {
    if (previousMoves.length) {
      window.history.replaceState(
        undefined,
        '',
        `${window.location.pathname}?${stringify({
          moves: serializeMoves(previousMoves),
        })}`
      )
    }
  }, [previousMoves])

  const moves = hoverTurn === undefined ? previousMoves : previousMoves.slice(0, hoverTurn)

  const board = boardAfterMoves(moves)
  const player = turnColor(moves.length)

  const playerControlMoves = getPlayerControlMoves(board, player)
  const enemyControlMoves = getPlayerControlMoves(board, enemyColor(player))

  const playerMoves = board.map((piece, tile) =>
    pieceColor(piece) === player ? getTileMoves(board, tile, previousMoves, enemyControlMoves) : []
  )

  const selectedMoves = selected !== undefined ? playerMoves[selected] : []

  const checked = isAttacked(getKing(board, player), enemyControlMoves)
  const noMoves = playerMoves.flat().length === 0

  return (
    <div className="App">
      <div className="info">
        <div>
          Turn: {previousMoves.length + 1} ({turnColor(previousMoves.length)})
        </div>
        {checked ? (
          noMoves ? (
            <div>Checkmate, {enemyColor(player)} wins!</div>
          ) : (
            <div>Checked</div>
          )
        ) : noMoves ? (
          <div>Draw</div>
        ) : undefined}
      </div>
      <div className="row">
        <div className={clsx('game', 'player', player)}>
          <svg viewBox="0 0 8 8" className="control-moves">
            <g className="player ">
              {playerControlMoves.map((m) => (
                <line
                  k={coordinate(m.from) + coordinate(m.to)}
                  x1={column(m.from) + 0.5}
                  y1={row(m.from) + 0.5}
                  x2={column(m.to) + 0.5}
                  y2={row(m.to) + 0.5}
                />
              ))}
            </g>
            <g className="enemy">
              {enemyControlMoves.map((m) => (
                <line
                  k={coordinate(m.from) + coordinate(m.to)}
                  x1={column(m.from) + 0.5}
                  y1={row(m.from) + 0.5}
                  x2={column(m.to) + 0.5}
                  y2={row(m.to) + 0.5}
                />
              ))}
            </g>
          </svg>
          <div className="board">
            {board.map((piece, tile) => (
              <Square
                key={tile}
                piece={piece}
                tile={tile}
                className={clsx(
                  selected === tile
                    ? 'selected'
                    : selectedMoves.some(moveTo(tile))
                    ? isEnemy(board[selected!], piece)
                      ? 'enemy-target'
                      : 'move-target'
                    : playerMoves[tile].length && 'selectable',
                  hoverMoves.length &&
                    hoverMoves.some(moveFrom(tile)) &&
                    (isSupportMove(board, hoverMoves.find(moveFrom(tile))!, player)
                      ? 'defender'
                      : 'attacker')
                )}
                onMouseOver={() =>
                  setHoverMoves([
                    ...playerControlMoves.filter(moveTo(tile)),
                    ...enemyControlMoves.filter(moveTo(tile)),
                  ])
                }
                onMouseLeave={() => setHoverMoves([])}
                onClick={() =>
                  playerMoves[tile].length
                    ? setState({ previousMoves: previousMoves, selected: tile })
                    : selectedMoves.some(moveTo(tile))
                    ? setState({
                        selected: undefined,
                        previousMoves: [...previousMoves, selectedMoves.find(moveTo(tile))!],
                      })
                    : undefined
                }
              >
                {onlyIf(
                  count(playerControlMoves, moveTo(tile)) - count(enemyControlMoves, moveTo(tile)),
                  (amount) => (
                    <span
                      className={clsx(
                        'control',
                        `control-${Math.min(Math.abs(amount), 3)}`,
                        amount > 0 ? player : enemyColor(player)
                      )}
                    />
                  )
                )}
              </Square>
            ))}
          </div>
        </div>
        <div className="moves">
          <div>
            {previousMoves.map(({ from, to, piece }, i) => (
              <button
                key={i}
                className="move"
                onMouseOver={() => setHoverTurn(i + 1)}
                onMouseLeave={() =>
                  document.activeElement?.classList.contains('move')
                    ? setHoverTurn(
                        [...(document.activeElement.parentElement?.children ?? [])].indexOf(
                          document.activeElement
                        ) + 1
                      )
                    : setHoverTurn(undefined)
                }
                onFocus={() => setHoverTurn(i + 1)}
                onBlur={() => setHoverTurn(undefined)}
                onDoubleClick={() =>
                  setState({ selected: undefined, previousMoves: previousMoves.slice(0, i + 1) })
                }
              >
                {unicodePieceMap[piece]} {coordinate(from)} {coordinate(to)}
              </button>
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
    </div>
  )
}

export default App

// State
const isAttacked = (tile: number, enemyMoves: Move[]) => enemyMoves.some(moveTo(tile))
const isSupportMove = (board: string[], move: Move, player: Color) =>
  pieceColor(board[move.from]) === pieceColor(board[move.to]) ||
  (isEmpty(board[move.to]) && pieceColor(move.piece) === player)

// MOVE

const getTileMoves = (
  board: string[],
  tile: number,
  previousMoves: Move[],
  enemyControlMoves: Move[]
) =>
  [
    ...getControlMoves(board, tile).filter(
      (move) =>
        (!isPawn(move.piece) ||
          // Pawn control moves are only valid if there is an enemy or En Passant
          (previousMoves.length && isEnPassant(move, last(previousMoves))) ||
          isEnemy(move.piece, board[move.to])) &&
        !isFriend(move.piece, board[move.to])
    ),
    ...getPawnMoves(board, tile),
    ...getCastleMoves(board, tile, previousMoves, enemyControlMoves),
  ].filter(
    (move) =>
      !playerIsChecked(
        boardAfterMove(board, move, previousMoves.length, [...previousMoves, move]),
        turnColor(previousMoves.length)
      )
  )

const playerIsChecked = (board: string[], player: Color) =>
  isAttacked(getKing(board, player), getPlayerControlMoves(board, enemyColor(player)))

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

/**
 * 1 square forward and 2 if it's the first move.
 */
function* getPawnMoveTiles(board: string[], tile: number): Iterable<number> {
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
function* getControlledTiles(board: string[], tile: number): Iterable<number> {
  switch (board[tile]) {
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