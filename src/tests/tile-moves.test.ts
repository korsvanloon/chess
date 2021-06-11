import { initialBoard } from '../lib/game/board'
import { getKing } from '../lib/game/tile-moves'

test('getKing', () => {
  const result = getKing(initialBoard, 'white')
  expect(result).toBe(60)
})
