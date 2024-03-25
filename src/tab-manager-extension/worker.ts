import { StateflowClient } from '@ubi/ier-stateflow/dist/stateflow-client'
import { objectEntries } from '@ubi/js-utils/dist/utils'
import { STATEFLOW_ENDPOINT } from '@/common/consts/network'
import type { TabContext } from '@/common/consts/tabs'
import { tabContexts } from '@/common/consts/tabs'
import type { StateflowSpecification } from '@/common/types/stateflow'

let currentTabContext: TabContext = 'SPLASHSCREEN'
let tabUrls: string[] = []

const tabIdByContext: Record<TabContext, chrome.tabs.Tab['id']> = {
  SPLASHSCREEN: undefined,
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

  const currentTabId = tabIdByContext[currentTabContext]
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
    ['currentTabContext', 'tabUrls'],
    async (newSates, _, mutatedKey) => {
      currentTabContext = newSates.currentTabContext
      tabUrls = newSates.tabUrls

      const isImmediate = mutatedKey === null

      for (let i = 0; i < tabContexts.length; i++) {
        const tabContext = tabContexts[i]

        const tabId = await getTabIdByContext(tabContext)
        if (tabId === undefined) {
          await warn(`No succeed to get a tab id for ${tabContext} context`)
          continue
        }

        if (isImmediate || mutatedKey === 'tabUrls') {
          const url = tabUrls[i]
          if (!url) {
            await warn(`No succeed to get a tab url for ${tabContext} context`)
            continue
          }
          await chrome.tabs.update(tabId, { url })
        }

        if (isImmediate || mutatedKey === 'currentTabContext') {
          const active = currentTabContext === tabContext
          await chrome.tabs.update(tabId, { active })
        }
      }
    },
    { immediate: true },
  )
}

async function getTabIdByContext(tabContext: TabContext) {
  let tabId = tabIdByContext[tabContext]

  if (tabId !== undefined) {
    try {
      await chrome.tabs.get(tabId)
    } catch {
      tabId = undefined
    }
  }

  return tabId
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
