export const tabContexts = [
  'SPLASHCREEN',
  'MAIN',
  'SCREENSAVER',
  'ERROR',
] as const

export type TabContext = (typeof tabContexts)[number]
