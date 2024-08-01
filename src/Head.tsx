import { renderToString, useEffect, useMemo } from "kaioken"
import { useHead } from "./context"

type HeadProps = {
  title?: string
}
export const Head: Kaioken.FC<HeadProps> = (props) => {
  const headManager = useHead()
  const provider = useMemo(() => headManager.createProvider(), [headManager])
  
  useEffect(() => {
    return () => {
      provider.disconnect()
    }
  }, [provider])

  console.log(props.children)
  const childrens = [...((props.children ?? []) as Kaioken.VNode[])].map(
    el => renderToString(() => ({
      ...el,
      props: {
        ...el.props,
        inertia: true,
      }
    }))
  )

  if (props.title) {
    childrens.splice(0, 0, `<title inertia="true">${props.title}</title>`)
  }

  provider.update(childrens)
  return null
}
