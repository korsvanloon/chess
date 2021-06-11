import { boardAfterMoves } from '../lib/game/board'

test('boardAfterMoves', () => {
  const result = boardAfterMoves([{ from: 8, to: 16, piece: 'P' }])
  expect(result[8]).toBe(' ')
  expect(result[16]).toBe('P')
})
