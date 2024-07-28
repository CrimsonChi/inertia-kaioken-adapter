import { renderToString, useEffect, useMemo } from "kaioken"
import { useHead } from "./context"
import { getCurrentNode } from "kaioken/dist/utils"

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

  
  const currentNode = getCurrentNode()
  console.log(currentNode, currentNode?.ctx)
  const childrens = [...(props.children as Kaioken.VNode[])].map(
    el => renderToString(() => ({
      ...el,
      props: {
        ...el.props,
        inertia: true,
      }
    }))
  )

  provider.update(childrens)

  return null
}
