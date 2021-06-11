import { Color, Piece } from './types'

export const pieceColor = (piece: Piece): Color | undefined =>
  /[A-Z]/.test(piece) ? 'black' : /[a-z]/.test(piece) ? 'white' : undefined

export const isEmpty = (piece: Piece) => piece === ' '

export const isEnemy = (piece: Piece, other: Piece) =>
  !isEmpty(other) && pieceColor(piece) !== pieceColor(other)

export const isFriend = (piece: Piece, other: Piece) =>
  !isEmpty(piece) && pieceColor(piece) === pieceColor(other)

export const isPawn = (piece: Piece) => piece.toLowerCase() === 'p'
