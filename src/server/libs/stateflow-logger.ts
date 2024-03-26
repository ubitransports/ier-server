export function getStateflowLoggerChannel(action: string) {
  if (action.includes('.Warn.')) {
    return 'WARN'
  }

  if (action.includes('.Error.')) {
    return 'ERROR'
  }

  return 'LOG'
}
