import { Move } from './move'

export const deserializeMoves = (source?: string): Move[] | undefined =>
  source
    ?.split('-')
    .map((s) => s.split('_'))
    .map(([piece, from, to]) => ({
      piece,
      from: Number(from),
      to: Number(to),
    }))

export const serializeMoves = (moves: Move[]) =>
  moves.map((m) => `${m.piece}_${m.from}_${m.to}`).join('-')
