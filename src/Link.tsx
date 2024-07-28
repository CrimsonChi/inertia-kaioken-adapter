import { router, shouldIntercept, VisitOptions } from '@inertiajs/core'
import { createElement, useEffect, useMemo } from 'kaioken'
import { ElementProps } from 'kaioken'

type LinkProps<T extends keyof JSX.IntrinsicElements> = VisitOptions & { 
  as?: T, 
  href: string, 
} & ElementProps<T>

const getVisitOptions = <T extends keyof JSX.IntrinsicElements = 'a',>(props: LinkProps<T>): VisitOptions => {
  return {
    method: props.method,
    data: props.data,
    replace: props.replace,
    preserveScroll: props.preserveScroll,
    preserveState: props.preserveState,
    only: props.only,
    except: props.except,
    headers: props.headers,
    errorBag: props.errorBag,
    forceFormData: props.forceFormData,
    queryStringArrayFormat: props.queryStringArrayFormat,
    onCancelToken: props.onCancelToken,
    onBefore: props.onBefore,
    onStart: props.onStart,
    onProgress: props.onProgress,
    onFinish: props.onFinish,
    onCancel: props.onCancel,
    onSuccess: props.onSuccess,
    onError: props.onError,
  }
}

export const Link: Kaioken.FC<LinkProps<'a'>> = (props) => {
  const as = props.as ?? 'a'
  const method = props.method ?? 'get'
  const visitOptions = useMemo(() => getVisitOptions(props), Object.values(props))
  const elmProps = useMemo(() => {
    const copy = { ...props } as Partial<typeof props>
    for (const [key] of Object.entries(visitOptions)) {
      // @ts-expect-error this is an unsafe operation
      delete copy[key]
    }

    delete copy['as']
    if (copy.href) {
      delete copy['href']
    }

    return copy
  }, Object.values(visitOptions))

  useEffect(() => {
    if (as === 'a' && method !== 'get') {
      console.warn(
        `Creating POST/PUT/PATCH/DELETE <a> links is discouraged as it causes "Open Link in New Tab/Window" accessibility issues.\n\nPlease specify a more appropriate element using the "as" attribute. For example:\n\n<Link href="${props.href}" method="${method}" as="button">...</Link>`
      )
    }
  }, [as, props.href, method])

  const onClick = (self: GlobalEventHandlers, event: MouseEvent) => {
    props.onclick?.bind(self)?.(event)
    if (shouldIntercept(event as unknown as KeyboardEvent)) {
      event.preventDefault();

      router.visit(props.href, visitOptions)
    }
  }

  return createElement(
    props.as ?? 'a',
    {
      ...elmProps,
      onclick: onClick,
      href: as === 'a' ? props.href : undefined,
    },
    [props.children]
  )
}
