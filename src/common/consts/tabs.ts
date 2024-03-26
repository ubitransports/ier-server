export const tabContexts = [
  'SPLASHSCREEN',
  'MAIN',
  'SCREENSAVER',
  'ERROR',
] as const

export type TabContext = (typeof tabContexts)[number]
