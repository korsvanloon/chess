import { parse, stringify } from 'querystring'
import { useState, useEffect } from 'react'
import { deserializeMoves, serializeMoves } from './lib/game/serialization'
import { Move } from './lib/game/types'

type State = {
  selected: number | undefined
  previousMoves: Move[]
}

const useAppState = () => {
  const [state, setState] = useState<State>({
    selected: undefined,
    previousMoves: [],
  })

  useEffect(() => {
    const initialMoves = deserializeMoves(parse(window.location.search.slice(1)).moves as string)
    if (initialMoves?.length) setState({ previousMoves: initialMoves, selected: undefined })
  }, [])

  useEffect(() => {
    if (state.previousMoves.length) {
      window.history.replaceState(
        undefined,
        '',
        `${window.location.pathname}?${stringify({
          moves: serializeMoves(state.previousMoves),
        })}`
      )
    }
  }, [state.previousMoves])

  return { state, handleState: (state: State) => () => setState(state) }
}
export default useAppState
