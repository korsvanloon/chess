import { initialBoard } from '../lib/game/board'
import { controlMovesFor } from '../lib/game/control-moves'

test('getPlayerControlMoves', () => {
  const result = controlMovesFor({ player: 'white', board: initialBoard })
  expect(result).toHaveLength(38)
})
