import { createHeadManager, Page } from "@inertiajs/core";
import { createContext, useContext } from "kaioken";

export const PageContext = createContext<Page | null>(null)
export const usePage = () => {
  return useContext(PageContext)!
}

export const HeadContext = createContext<ReturnType<typeof createHeadManager> | null>(null)
export const useHead = () => {
  return useContext(HeadContext)!
}
