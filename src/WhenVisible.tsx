import { ReloadOptions, router } from '@inertiajs/core'
import { createElement, useCallback, useEffect, useRef, useSignal } from 'kaioken'

type WhenVisibleProps = {
  children: JSX.Children
  fallback: JSX.Children
  data?: string | string[]
  params?: ReloadOptions
  buffer?: number
  as?: string
  always?: boolean
} 

export const WhenVisible = ({ children, data, params, buffer, as = 'div', always = false, fallback = null }: WhenVisibleProps) => {
  const loaded = useSignal(false)
  const hasFetched = useRef(false)
  const fetching = useRef(false)
  const ref = useRef<HTMLDivElement>(null)

  const getReloadParams = useCallback<() => Partial<ReloadOptions>>(() => {
    if (data) {
      return {
        only: (Array.isArray(data) ? data : [data]) as string[],
      }
    }

    if (!params) {
      throw new Error('You must provide either a `data` or `params` prop.')
    }

    return params
  }, [params, data])

  useEffect(() => {
    if (!ref.current) {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) {
          return
        }

        if (!always && hasFetched.current) {
          observer.disconnect()
        }

        if (fetching.current) {
          return
        }

        hasFetched.current = true
        fetching.current = true

        const reloadParams = getReloadParams()

        router.reload({
          ...reloadParams,
          onStart: (e) => {
            fetching.current = true
            reloadParams.onStart?.(e)
          },
          onFinish: (e) => {
            loaded.value = true;
            fetching.current = false
            reloadParams.onFinish?.(e)

            if (!always) {
              observer.disconnect()
            }
          },
        })
      },
      {
        rootMargin: `${buffer || 0}px`,
      },
    )

    observer.observe(ref.current)

    return () => {
      observer.disconnect()
    }
  }, [ref, getReloadParams, buffer])

  
  if (always || !loaded.value) {
    return createElement(
      as,
      {
        props: null,
        ref,
      },
      loaded ? children : fallback,
    )
  }

  return loaded.value ? children : null
}

WhenVisible.displayName = 'InertiaWhenVisible'
