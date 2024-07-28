import { createHeadManager, Page, PageResolver, router } from "@inertiajs/core"
import { useEffect, useMemo, useState } from "kaioken"
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
      swapComponent: async ({ component, page }) => {
        set(() => ({
          component,
          page,
          key: undefined,
        }))
      }
    })

    return router.on('navigate', () => headManager.forceUpdate())
  }, [])

  {/* const Children = useMemo(() => {
    if (inertiaCtx.component) {
      const Component = inertiaCtx.component as any;
      const Child = () => (
        <Component {...inertiaCtx.page.props} key={inertiaCtx.key} />
      );
      // const child = createElement(inertiaCtx.component as typeof Component, {
      //   key: inertiaCtx.key,
      //   ...inertiaCtx.page.props
      // })

      // @ts-expect-error .layout is not defined on unknown
      if (typeof inertiaCtx.component.layout === "function") {
        return () => (
          // @ts-expect-error .layout is not defined on unknown
          <inertiaCtx.component.layout><Child /></inertiaCtx.component.layout>
        );
      }

      return Child;
    }

    return () => null;
  }, [inertiaCtx.component, inertiaCtx.page, inertiaCtx.key]); */}

    let Children: Kaioken.FC = () => null

    if (inertiaCtx.component) {
      const Component = inertiaCtx.component as any;
      const Child = () => (
        <Component {...inertiaCtx.page.props} key={inertiaCtx.key} />
      );
      // const child = createElement(inertiaCtx.component as typeof Component, {
      //   key: inertiaCtx.key,
      //   ...inertiaCtx.page.props
      // })

      // @ts-expect-error .layout is not defined on unknown
      if (typeof inertiaCtx.component.layout === "function") {
        Children = () => (
          // @ts-expect-error .layout is not defined on unknown
          <inertiaCtx.component.layout><Child /></inertiaCtx.component.layout>
        );
      } else {
        Children = Child
      }
    }

  

  return <PageContext.Provider value={inertiaCtx.page}>
    <HeadContext.Provider value={headManager}>
      <Children />
    </HeadContext.Provider>
  </PageContext.Provider>
}
