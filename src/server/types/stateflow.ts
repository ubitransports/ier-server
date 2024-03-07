import type { TabContext } from '@/server/consts/tabs'

export type StateflowSpecification = {
  states: {
    currentTab: TabContext
    tabUrls: string[]
  }
  events: {
    chromeTabWarning: string
    ping: number
  }
}
