import { router } from "@inertiajs/core"
import { useEffect, useState } from "kaioken"

export const useRemember = <State,>(initialState: State, key?: string): [State, (value: Kaioken.StateSetter<State>) => void] => {
  const rememberedState = router.restore(key) as State
  const [state, setState] = useState(initialState)

  useEffect(() => {
    router.remember(state, key)
  }, [state, key])

  useEffect(() => {
    if (rememberedState !== undefined) {
      setState(rememberedState)
    }
  }, [])

  return [state, setState]
}
