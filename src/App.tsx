import { createHeadManager, Page, PageResolver, router } from "@inertiajs/core"
import { Component, createElement, useEffect, useMemo, useState } from "kaioken"
import { HeadContext, PageContext } from "./context"

type AppProps = {
  initialPage: Page,
  resolveComponent: PageResolver,
  initialComponent: Kaioken.FC,
  titleCallBack?: (title: string) => string,
  onHeadUpdate?: (elements: string[]) => void,
}

export const App: Kaioken.FC<AppProps> = (props) => {
  const [inertiaCtx, set] = useState({
    component: props.initialComponent as unknown,
    page: props.initialPage as Page,
    key: undefined as number | undefined,
  })

  const headManager = useMemo(() => {
    return createHeadManager(
      typeof window === 'undefined',
      props.titleCallBack || ((title: string) => title),
      props.onHeadUpdate || (() => {})
    )
  }, [])

  useEffect(() => {
    router.init({
      initialPage: props.initialPage,
      resolveComponent: props.resolveComponent,
      swapComponent: async ({ component, page, preserveState }) => {
        set(() => ({
          component,
          page,
          key: preserveState ? inertiaCtx.key : Date.now(),
        }))
      }
    })

    router.on('navigate', () => headManager.forceUpdate())
  }, [])

  const renderChildren = useMemo(() => {
    if (inertiaCtx.component) {
      const child = createElement(inertiaCtx.component as typeof Component, {
        key: inertiaCtx.key,
        ...inertiaCtx.page.props
      })

      // @ts-expect-error .layout is not defined on unknown
      if (typeof inertiaCtx.component.layout === 'function') {
        // @ts-expect-error .layout is not defined on unknown
        return createElement(inertiaCtx.component.layout, {
          children: child,
        })
      }

      return child
    }

    return undefined
  }, [inertiaCtx.component, inertiaCtx.key, inertiaCtx.page])

  return <PageContext.Provider value={inertiaCtx.page}>
    <HeadContext.Provider value={headManager}>
      {renderChildren}
    </HeadContext.Provider>
  </PageContext.Provider>
}

App.displayName = 'InertiaApp'
