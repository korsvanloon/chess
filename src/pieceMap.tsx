import { ReactComponent as BB } from './svg/bB.svg'
import { ReactComponent as BK } from './svg/bK.svg'
import { ReactComponent as BN } from './svg/bN.svg'
import { ReactComponent as BP } from './svg/bP.svg'
import { ReactComponent as BQ } from './svg/bQ.svg'
import { ReactComponent as BR } from './svg/bR.svg'
import { ReactComponent as WB } from './svg/wB.svg'
import { ReactComponent as WK } from './svg/wK.svg'
import { ReactComponent as WN } from './svg/wN.svg'
import { ReactComponent as WP } from './svg/wP.svg'
import { ReactComponent as WQ } from './svg/wQ.svg'
import { ReactComponent as WR } from './svg/wR.svg'

export const svgPieceMap: { [c: string]: React.ReactNode } = {
  R: <BR />,
  N: <BN />,
  B: <BB />,
  Q: <BQ />,
  K: <BK />,
  P: <BP />,
  r: <WR />,
  n: <WN />,
  b: <WB />,
  q: <WQ />,
  k: <WK />,
  p: <WP />,
}

export const unicodePieceMap: { [c: string]: React.ReactNode } = {
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
