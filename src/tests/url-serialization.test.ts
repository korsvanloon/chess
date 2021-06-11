import { serializeMoves } from '../lib/game/serialization'

test('serializeMoves', () => {
  const result = serializeMoves([{ from: 8, to: 16, piece: 'P' }])
  expect(result).toBe('Pa7a6')
})
