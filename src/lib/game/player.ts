import { Color, Move } from './types'

export const currentPlayer = (previousMoves: Move[]): Color =>
  previousMoves.length % 2 === 0 ? 'white' : 'black'

export const enemyOf = (player: Color): Color => (player === 'black' ? 'white' : 'black')
