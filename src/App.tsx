import clsx from 'clsx'
import { useState } from 'react'
import { boardAfterMoves } from './lib/game/board'
import { controlMovesFor } from './lib/game/control-moves'
import { count } from './lib/math'
import { isSupportMove, movingFrom, movingTo } from './lib/game/move'
import { isEnemy, pieceColor } from './lib/game/piece'
import { currentPlayer, enemyOf } from './lib/game/player'
import { row, coordinate, column } from './lib/game/tile'
import { tileMoves, isChecked } from './lib/game/tile-moves'
import { Move } from './lib/game/types'
import { onlyIf } from './lib/util'
import { unicodePieceMap } from './pieceMap'
import Square from './Square'
import useAppState from './useState'

function App() {
  const {
    state: { selected, previousMoves },
    handleState,
  } = useAppState()

  const [hoverMoves, setHoverMoves] = useState<Move[]>([])
  const [hoverTurn, setHoverTurn] = useState<number>()

  const moves = hoverTurn === undefined ? previousMoves : previousMoves.slice(0, hoverTurn)

  const board = boardAfterMoves(moves)
  const player = currentPlayer(moves)

  const playerControlMoves = controlMovesFor({ player, board })
  const enemyControlMoves = controlMovesFor({ player: enemyOf(player), board })

  const possibleMoves = board.map((piece, tile) =>
    pieceColor(piece) === player ? tileMoves(board, tile, previousMoves, enemyControlMoves) : []
  )

  const selectedMoves = selected !== undefined ? possibleMoves[selected] : []

  const noMoves = possibleMoves.flat().length === 0

  return (
    <div className="App">
      <div className="info">
        <div>
          Turn: {previousMoves.length + 1} ({player})
        </div>
        <div>
          {isChecked(board, player, enemyControlMoves) ? (
            noMoves ? (
              <span className={clsx('won', enemyOf(player))}>
                Checkmate {enemyOf(player)} wins!
              </span>
            ) : (
              <span className={clsx('checked', player)}>Checked</span>
            )
          ) : noMoves ? (
            <span className={clsx('draw', player)}>Draw</span>
          ) : undefined}
        </div>
      </div>
      <div className="row">
        <div className={clsx('game', 'player', player)}>
          <svg className="control-moves" viewBox="0 0 8 8">
            <g className="player">
              {playerControlMoves.map((m) => (
                <line key={m.from + m.to} {...lineProps(m)} />
              ))}
            </g>
            <g className="enemy">
              {enemyControlMoves.map((m) => (
                <line key={m.from + m.to} {...lineProps(m)} />
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
                    : selected && selectedMoves.some(movingTo(tile))
                    ? isEnemy(board[selected], piece)
                      ? 'enemy-target'
                      : 'move-target'
                    : possibleMoves[tile].length && 'selectable',
                  onlyIf(hoverMoves.find(movingFrom(tile)), (hoverMove) =>
                    isSupportMove(board, hoverMove, player) ? 'defender' : 'attacker'
                  )
                )}
                onMouseOver={() =>
                  setHoverMoves([
                    ...playerControlMoves.filter(movingTo(tile)),
                    ...enemyControlMoves.filter(movingTo(tile)),
                  ])
                }
                onMouseLeave={() => setHoverMoves([])}
                onClick={
                  possibleMoves[tile].length
                    ? handleState({ previousMoves, selected: tile })
                    : onlyIf(selectedMoves.find(movingTo(tile)), (selectedMove) =>
                        handleState({
                          selected: undefined,
                          previousMoves: [...previousMoves, selectedMove],
                        })
                      )
                }
              >
                {onlyIf(
                  count(playerControlMoves, movingTo(tile)) -
                    count(enemyControlMoves, movingTo(tile)),
                  (amount) => (
                    <span
                      className={clsx(
                        'control',
                        `control-${Math.min(Math.abs(amount), 3)}`,
                        amount > 0 ? player : enemyOf(player)
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
                  setHoverTurn(
                    document.activeElement?.classList.contains('move')
                      ? [...(document.activeElement.parentElement?.children ?? [])].indexOf(
                          document.activeElement
                        ) + 1
                      : undefined
                  )
                }
                onFocus={() => setHoverTurn(i + 1)}
                onBlur={() => setHoverTurn(undefined)}
                onDoubleClick={handleState({
                  selected: undefined,
                  previousMoves: previousMoves.slice(0, i + 1),
                })}
              >
                {unicodePieceMap[piece]} {coordinate(from)} {coordinate(to)}
              </button>
            ))}
            <div className="actions">
              <button
                onClick={handleState({
                  selected: undefined,
                  previousMoves: previousMoves.slice(0, previousMoves.length - 1),
                })}
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

const lineProps = (move: Move) => ({
  k: coordinate(move.from) + coordinate(move.to),
  x1: column(move.from) + 0.5,
  y1: row(move.from) + 0.5,
  x2: column(move.to) + 0.5,
  y2: row(move.to) + 0.5,
})
