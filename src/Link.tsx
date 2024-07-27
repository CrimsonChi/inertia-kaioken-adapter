import { router, shouldIntercept, VisitOptions } from '@inertiajs/core'
import { createElement, useEffect } from 'kaioken'

type LinkProps = VisitOptions & { 
  as?: string, 
  href: string, 
  onClick?: (event: MouseEvent | KeyboardEvent) => void 
}

const getVisitOptions = (props: LinkProps): VisitOptions => {
  const copy: Partial<LinkProps> = { ...props }
  if (copy.href) delete copy.href
  if (copy.as) delete copy.as
  if (copy.onClick) delete copy.onClick

  return copy as VisitOptions
}

export const Link: Kaioken.FC<LinkProps> = (props) => {
  const as = props.as ?? 'a'
  const method = props.method ?? 'get'
  useEffect(() => {
    if (as === 'a' && method !== 'get') {
      console.warn(
        `Creating POST/PUT/PATCH/DELETE <a> links is discouraged as it causes "Open Link in New Tab/Window" accessibility issues.\n\nPlease specify a more appropriate element using the "as" attribute. For example:\n\n<Link href="${props.href}" method="${method}" as="button">...</Link>`
      )
    }
  }, [as, props.href, method])

  const onClick = (event: KeyboardEvent) => {
    props.onClick?.(event)
    if (shouldIntercept(event)) {
      event.preventDefault();

      router.visit(props.href, getVisitOptions(props))
    }
  }

  return createElement(
    props.as ?? 'a',
    {
      onclick: onClick,
      href: as === 'a' ? props.href : undefined,
    },
    [props.children]
  )
}
