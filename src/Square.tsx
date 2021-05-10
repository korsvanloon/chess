import clsx from 'clsx'
import { tileColor, pieceColor } from './lib/color'
import { coordinate } from './lib/tile'
import { svgPieceMap } from './pieceMap'

type Props = {
  tile: number
  piece: string
  className?: string
  onClick?: () => void
  onMouseOver?: () => void
  onMouseLeave?: () => void
  children?: React.ReactNode
}

const Square = ({
  tile,
  piece,
  className,
  onClick,
  onMouseOver,
  onMouseLeave,
  children,
}: Props) => (
  <div
    key={tile}
    title={`${tile.toString()} ${coordinate(tile)}`}
    className={className}
    onMouseOver={onMouseOver}
    onMouseLeave={onMouseLeave}
    onClick={onClick}
  >
    <div className={clsx('tile', tileColor(tile))}></div>
    {svgPieceMap[piece] && (
      <div className={clsx('piece', pieceColor(piece))}>{svgPieceMap[piece]}</div>
    )}
    <div>{children}</div>
  </div>
)

export default Square
