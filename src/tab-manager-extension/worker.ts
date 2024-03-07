import { StateflowClient } from '@ubi/ier-stateflow/dist/stateflow-client'
import { objectEntries } from '@ubi/js-utils/dist/utils'
import { STATEFLOW_ENDPOINT } from '@/server/consts/network'
import type { TabContext } from '@/server/consts/tabs'
import { tabContexts } from '@/server/consts/tabs'
import type { StateflowSpecification } from '@/server/types/stateflow'

let currentTab: TabContext = 'SPLASHCREEN'
let tabUrls: string[] = []

const tabIdByContext: Record<TabContext, chrome.tabs.Tab['id']> = {
  SPLASHCREEN: undefined,
  MAIN: undefined,
  SCREENSAVER: undefined,
  ERROR: undefined,
}

async function setup() {
  // Clean tabs
  for (const tab of await chrome.tabs.query({})) {
    if ((tab.url || '').startsWith('chrome://')) {
      continue
    }

    if (tab.id) {
      await chrome.tabs.remove(tab.id)
    }
  }

  // Create context tabs
  for (let i = 0; i < tabContexts.length; i++) {
    const tabContext = tabContexts[i]

    const tab = await chrome.tabs.create({})
    tabIdByContext[tabContext] = tab.id
  }

  // Recreated closed tab
  chrome.tabs.onRemoved.addListener(async (tabId) => {
    const entry = objectEntries(tabIdByContext).find(
      ([, _tabId]) => _tabId === tabId,
    )

    if (!entry) {
      return
    }

    const [tabContext] = entry

    const url = tabUrls[tabContexts.indexOf(tabContext)] || ''

    const tab = await chrome.tabs.create({ url })
    tabIdByContext[tabContext] = tab.id

    await focusCurrentTab()
  })

  await focusCurrentTab()

  setInterval(focusCurrentTab, 2000)
}

async function focusCurrentTab() {
  const [activeTab] = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  })

  if (activeTab?.url?.startsWith('chrome://')) {
    return
  }

  const currentTabId = tabIdByContext[currentTab]
  if (currentTabId !== undefined) {
    await chrome.tabs.update(currentTabId, { active: true })
  } else {
    await warn('Unable to retrieve the current tab id')
  }
}

let stateflow: StateflowClient<StateflowSpecification>

async function trackCurrentTab() {
  stateflow = new StateflowClient(STATEFLOW_ENDPOINT)

  try {
    await stateflow.initialize('TabManagerExtension')
  } catch (e) {
    setTimeout(trackCurrentTab, 1000)
    return
  }

  stateflow.keepAlive() // Generate WebSocket activity to avoid Chrome to pause the extension service worker

  stateflow.onConnectionError((e) => {
    setTimeout(trackCurrentTab)
    console.warn(e)
  })
  stateflow.onConnectionClose((e) => {
    setTimeout(trackCurrentTab)
    console.warn(e)
  })
  stateflow.onMessageError((e) => {
    setTimeout(trackCurrentTab)
    console.warn(e)
  })

  await stateflow.watch(
    ['currentTab', 'tabUrls'],
    async (newSates, _, mutatedKey) => {
      currentTab = newSates.currentTab
      tabUrls = newSates.tabUrls

      const isImmediate = mutatedKey === null

      for (let i = 0; i < tabContexts.length; i++) {
        const tabContext = tabContexts[i]

        let tabId = tabIdByContext[tabContext]

        if (tabId !== undefined) {
          try {
            await chrome.tabs.get(tabId)
          } catch {
            tabId = undefined
          }
        }

        if (tabId === undefined) {
          await warn(`No succeed to get a tab id for ${tabContext} context`)
          continue
        }

        const tabUrl = tabUrls[i]

        if (tabUrl === undefined) {
          await warn(`No succeed to get a tab url for ${tabContext} context`)
          continue
        }

        const url = tabUrls[i]
        const active = currentTab === tabContext

        if (isImmediate || mutatedKey === 'tabUrls') {
          await chrome.tabs.update(tabId, { url })
        }

        if (isImmediate || mutatedKey === 'currentTab') {
          await chrome.tabs.update(tabId, { active })
        }
      }
    },
    { immediate: true },
  )
}

async function warn(message: string) {
  console.warn(message)
  if (stateflow) {
    await stateflow.publish('chromeTabWarning', message)
  }
}
setup()
  .catch((e) => console.error(e))
  .finally(() => {
    trackCurrentTab().catch((e) => console.error(e))
  })
