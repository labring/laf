import { acceptHMRUpdate, defineStore } from 'pinia'

export const useMenuStore = defineStore('appMenu', () => {
  let appMenus = $ref<any>([])

  const generateMenus = (routes: any[], appid: string) => {
    const flatMenus = routes.map((route: any) => {
      const { path, children } = route
      const { meta, name, hidden } = children[0]
      return {
        path: path.replace('/app/:appid/', `/app/${appid}/`),
        name,
        hidden,
        meta,
      }
    })

    const names: string[] = []
    for (const menu of flatMenus) {
      const { path } = menu
      const name = path.split(`/app/${appid}/`)[1].split('/')[0]

      if (names.includes(name))
        continue

      names.push(name)
    }

    const menus = names
      .map((_: string) => {
        const children = flatMenus
          .filter((menu: any) => !menu.hidden)
          .filter((menu: any) => {
            const { path } = menu
            const name = path.split(`/app/${appid}/`)[1].split('/')[0]
            return name === _
          })
          .sort((a: any, b: any) => {
            const { index: aIndex } = a.meta
            const { index: bIndex } = b.meta
            const aIndexNum = aIndex ? Number(aIndex.split('-')[1]) : 0
            const bIndexNum = bIndex ? Number(bIndex.split('-')[1]) : 0
            return aIndexNum - bIndexNum
          })

        return {
          name: _,
          children,
          index: children[0].meta.index ? children[0].meta.index?.split('-')[0] : 0,
        }
      })
      .sort((a: any, b: any) => {
        const { index: aIndex } = a
        const { index: bIndex } = b
        const aIndexNum = aIndex ? Number(aIndex) : 0
        const bIndexNum = bIndex ? Number(bIndex) : 0
        return aIndexNum - bIndexNum
      })

    appMenus = menus
  }

  return { appMenus: $$(appMenus), generateMenus }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useMenuStore, import.meta.hot))
