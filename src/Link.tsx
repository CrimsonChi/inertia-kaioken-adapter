import { FormDataConvertible, LinkPrefetchOption, Method, mergeDataIntoQueryString, router, shouldIntercept, VisitOptions } from '@inertiajs/core'
import { createElement, ElementProps, useEffect, useMemo, useRef, useSignal } from 'kaioken'
import { noop } from './utils'

type BaseInertiaLinkProps = {
  as?: keyof JSX.IntrinsicElements
  data?: Record<string, FormDataConvertible>
  href: string
  method?: VisitOptions['method']
  headers?: VisitOptions['headers']
  onclick?: GlobalEventHandlers['onclick']
  preserveScroll?: VisitOptions['preserveScroll']
  preserveState?: VisitOptions['preserveState']
  replace?: VisitOptions['replace']
  only?: VisitOptions['only']
  except?: VisitOptions['except']
  onCancelToken?: VisitOptions['onCancelToken']
  onBefore?: VisitOptions['onBefore']
  onStart?: VisitOptions['onStart']
  onProgress?: VisitOptions['onProgress']
  onFinish?: VisitOptions['onFinish']
  onCancel?: VisitOptions['onCancel']
  onSuccess?: VisitOptions['onSuccess']
  onError?: VisitOptions['onError']
  queryStringArrayFormat?: VisitOptions['queryStringArrayFormat']
  async?: VisitOptions['async']
  cacheFor?: number | string
  prefetch?: boolean | LinkPrefetchOption | LinkPrefetchOption[]
}

export type InertiaLinkProps<T extends keyof JSX.IntrinsicElements = 'a'> = BaseInertiaLinkProps &
  Omit<ElementProps<T>, keyof BaseInertiaLinkProps>


export const Link = <T extends keyof JSX.IntrinsicElements = 'a'>({
  children,
  as = 'a',
  data = {},
  href,
  method = 'get',
  preserveScroll = false,
  preserveState = undefined,
  replace = false,
  only = [],
  except = [],
  headers = {},
  queryStringArrayFormat = 'brackets',
  async = false,
  onclick = noop,
  onCancelToken = noop,
  onBefore = noop,
  onStart = noop,
  onProgress = noop,
  onFinish = noop,
  onCancel = noop,
  onSuccess = noop,
  onError = noop,
  prefetch = false,
  cacheFor = 0,
  ...props
}: Kaioken.FCProps<InertiaLinkProps<T>>) => {
  const inFlightCount = useSignal(0)
  const hoverTimeout = useRef<number | null>(null)

  as = as.toLowerCase() as keyof JSX.IntrinsicElements
  method = method.toLowerCase() as Method
  const [_href, _data] = mergeDataIntoQueryString(method, href || '', data, queryStringArrayFormat)
  href = _href
  data = _data

  const baseParams = {
    data,
    method,
    preserveScroll,
    preserveState: preserveState ?? method !== 'get',
    replace,
    only,
    except,
    headers,
    async,
  }

  const visitParams = {
    ...baseParams,
    onCancelToken,
    onBefore,
    onStart(event) {
      inFlightCount.value += 1
      onStart(event)
    },
    onProgress,
    onFinish(event) {
      inFlightCount.value -= 1
      onFinish(event)
    },
    onCancel,
    onSuccess,
    onError,
  } satisfies VisitOptions

  const prefetchModes: LinkPrefetchOption[] = useMemo(
    () => {
      if (prefetch === true) {
        return ['hover']
      }

      if (prefetch === false) {
        return []
      }

      if (Array.isArray(prefetch)) {
        return prefetch
      }

      return [prefetch]
    },
    Array.isArray(prefetch) ? prefetch : [prefetch],
  )

  const cacheForValue = useMemo(() => {
    if (cacheFor !== 0) {
      // from: https://github.com/inertiajs/inertia/blob/master/packages/react/src/Link.ts
      // If they've provided a value, respect it
      return cacheFor
    }

    if (prefetchModes.length === 1 && prefetchModes[0] === 'click') {
      // from: https://github.com/inertiajs/inertia/blob/master/packages/react/src/Link.ts
      // If they've only provided a prefetch mode of 'click',
      // we should only prefetch for the next request but not keep it around
      return 0
    }

    // from: https://github.com/inertiajs/inertia/blob/master/packages/react/src/Link.ts
    // Otherwise, default to 30 seconds
    return 30_000
  }, [cacheFor, prefetchModes])

  const doPrefetch = () => {
    router.prefetch(href, baseParams, { cacheFor: cacheForValue })
  }

  useEffect(() => {
    return () => {
      if (hoverTimeout.current) {
        clearTimeout(hoverTimeout.current)
      }
    }
  }, [])

  useEffect(() => {
    if (prefetchModes.includes('mount')) {
      setTimeout(() => doPrefetch())
    }
  }, prefetchModes)

  const regularEvents: Partial<GlobalEventHandlers> = {
    onclick: (event) => {
      // @ts-expect-error idk how to do define this
      onclick(event)

      if (shouldIntercept(event)) {
        event.preventDefault()

        router.visit(href, visitParams)
      }
    },
  }

  const prefetchHoverEvents: Partial<GlobalEventHandlers> = {
    onmouseenter: () => {
      hoverTimeout.current = window.setTimeout(() => {
        doPrefetch()
      }, 75)
    },
    onmouseleave: () => {
      if (hoverTimeout.current) {
        clearTimeout(hoverTimeout.current)
      }
    },
    onclick: regularEvents.onclick,
  }

  const prefetchClickEvents: Partial<GlobalEventHandlers> = {
    onmousedown: (event) => {
      if (shouldIntercept(event)) {
        event.preventDefault()
        doPrefetch()
      }
    },
    onmouseup: (event) => {
      event.preventDefault()
      router.visit(href, visitParams)
    },
    onclick: (event) => {
      // @ts-expect-error idk how to do define this
      onclick(event)

      if (shouldIntercept(event)) {
        // Let the mouseup event handle the visit
        event.preventDefault()
      }
    },
  }

  if (method !== 'get') {
    as = 'button'
  }

  const elProps = {
    a: { href },
    button: { type: 'button' },
  }

  return createElement(
    as,
    {
      ...props,
      // @ts-expect-error we use GlobalEventHandlers here instead of the proper type for convention  
      ...(elProps[as] || {}),
      ...(() => {
        if (prefetchModes.includes('hover')) {
          return prefetchHoverEvents
        }

        if (prefetchModes.includes('click')) {
          return prefetchClickEvents
        }

        return regularEvents
      })(),
      'data-loading': inFlightCount.value > 0 ? '' : undefined,
    },
    children,
  )
}

Link.displayName = 'InertiaLink'
