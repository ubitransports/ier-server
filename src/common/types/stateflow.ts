import type { TabContext } from '@/common/consts/tabs'

export type StateflowSpecification = {
  states: {
    currentTabContext: TabContext
    tabUrls: string[]
  }
  events: {
    chromeTabWarning: string
    ping: number
  }
}
