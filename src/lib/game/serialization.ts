import { coordinate } from './tile'
import { Move, Piece } from './types'
import { isValue } from '../util'

export const serializeMoves = (moves: Move[]) =>
  moves.map((m) => `${m.piece}${coordinate(m.from)}${coordinate(m.to)}`).join('-')

export const deserializeMoves = (source?: string): Move[] | undefined =>
  source
    ?.split('-')
    .map((s) => s.match(movePattern)?.slice(1))
    .filter(isValue)
    .map(([piece, fromCoordinate, toCoordinate]) => ({
      piece: piece as Piece,
      from: tile(fromCoordinate),
      to: tile(toCoordinate),
    }))

const movePattern = /(\w)(\w\d)(\w\d)/

const tile = (c: string) => 'abcdefgh'.indexOf(c[0]) + (8 - Number(c[1])) * 8
