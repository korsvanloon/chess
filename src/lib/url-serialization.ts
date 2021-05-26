import { Move } from './move'
import { coordinate } from './tile'
import { isValue } from './util'

const movePattern = /(\w)(\w\d)(\w\d)/

export const deserializeMoves = (source?: string): Move[] | undefined =>
  source
    ?.split('-')
    .map((s) => s.match(movePattern)?.slice(1))
    .filter(isValue)
    .map(([piece, fromCoordinate, toCoordinate]) => ({
      piece,
      from: tile(fromCoordinate),
      to: tile(toCoordinate),
    }))

const tile = (c: string) => 'abcdefgh'.indexOf(c[0]) + (8 - Number(c[1])) * 8

export const serializeMoves = (moves: Move[]) =>
  moves.map((m) => `${m.piece}${coordinate(m.from)}${coordinate(m.to)}`).join('-')
