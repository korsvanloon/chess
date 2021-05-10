import clsx from 'clsx'
import { Color, enemyColor, pieceColor, tileColor } from '../lib/color'
import { count } from '../lib/math'
import { Move, moveTo } from '../lib/move'
import { coordinate } from '../lib/tile'
import { onlyIf } from '../lib/util'
import { svgPieceMap } from '../pieceMap'

type Props = {
  board: string[]
  player: Color
  playerControlMoves: Move[]
  enemyControlMoves: Move[]
  squareClassName?: (tile: number, piece: string) => string
  onClick?: (tile: number, piece: string) => void
  onMouseOver?: (tile: number, piece: string) => void
  onMouseLeave?: (tile: number, piece: string) => void
}

const Board = ({
  board,
  player,
  playerControlMoves,
  enemyControlMoves,
  squareClassName,
  onClick,
  onMouseOver,
  onMouseLeave,
}: Props) => (
  <div className="board">
    {board.map((piece, tile) => (
      <div
        key={tile}
        title={`${tile.toString()} ${coordinate(tile)}`}
        className={squareClassName?.(tile, piece)}
        onMouseOver={() => onMouseOver?.(tile, piece)}
        onMouseLeave={() => onMouseLeave?.(tile, piece)}
        onClick={() => onClick?.(tile, piece)}
      >
        <div className={clsx('tile', tileColor(tile))}></div>
        {svgPieceMap[piece] && (
          <div className={clsx('piece', pieceColor(piece))}>{svgPieceMap[piece]}</div>
        )}
        <div>
          {onlyIf(count(playerControlMoves, moveTo(tile)), (amount) => (
            <span className={clsx('control', player)}>{amount}</span>
          ))}
          {onlyIf(count(enemyControlMoves, moveTo(tile)), (amount) => (
            <span className={clsx('control', enemyColor(player))}>{amount}</span>
          ))}
        </div>
      </div>
    ))}
  </div>
)
export default Board
