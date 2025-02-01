import { useEffect, useSignal } from "kaioken"
import { usePage } from "./context"

type DeferredProps = Kaioken.FCProps<{
  children: JSX.Children
  fallback: JSX.Children,
  data: string | string[]
}>

export const Deferred = ({ children, data, fallback }: DeferredProps) => {
  if (!data) {
    throw new Error('`<Deferred>` requires a `data` prop')
  }

  const loaded = useSignal(false)
  const pageProps = usePage().props
  const keys = Array.isArray(data) ? data : [data]

  useEffect(() => {
    loaded.value = (keys.every((key) => pageProps[key] !== undefined))
  }, [pageProps, keys])

  return loaded ? children : fallback
}

Deferred.displayName = 'InertiaDeferred'
