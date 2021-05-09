import { Move } from './move'

export type Color = 'black' | 'white'

export const tileColor = (tile: number): Color =>
  (tile + Math.floor(tile / 8)) % 2 === 0 ? 'white' : 'black'
export const turnColor = (moves: Move[]): Color => (moves.length % 2 === 0 ? 'white' : 'black')
export const pieceColor = (piece: string): Color | undefined =>
  /[A-Z]/.test(piece) ? 'black' : /[a-z]/.test(piece) ? 'white' : undefined
export const enemyColor = (player: Color): Color => (player === 'black' ? 'white' : 'black')
export const moveColor = (move: Move) => pieceColor(move.piece)!
