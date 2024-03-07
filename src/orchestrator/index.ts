import { spawn } from 'child_process'
import { dirname } from 'path'
import process from 'process'
import { objectKeys } from '@ubi/js-utils/dist/utils'
import services from '@/server/services'
import type { ServiceName } from '@/server/services'

const cwd = dirname(process.argv[1])

const servicePad = Math.max(
  ...objectKeys(services).map((serviceName) => serviceName.length),
)

for (const serviceName of objectKeys(services)) {
  const startService = () => {
    const childProcess = spawn('node', ['server.mjs', serviceName], { cwd })

    log('START', serviceName, `PID=${childProcess.pid}`)

    childProcess.stdout.on('data', (data) => {
      log('LOG', serviceName, data.toString().trimEnd())
    })

    childProcess.stderr.on('data', (data) => {
      log('ERROR', serviceName, data.toString().trimEnd())
    })

    childProcess.on('close', (code) => {
      log('EXIT', serviceName, code)
      setTimeout(startService)
    })
  }

  startService()
}

function log(
  action: 'START' | 'EXIT' | 'LOG' | 'ERROR',
  serviceName: ServiceName,
  data?: unknown,
) {
  const time = new Date().toISOString()

  const args: unknown[] = [
    time,
    action.padEnd(5),
    serviceName.padEnd(servicePad),
  ]

  if (data !== undefined) {
    args.push(data)
  }

  ;(['ERROR', 'EXIT'].includes(action) ? console.error : console.log)(...args)
}
