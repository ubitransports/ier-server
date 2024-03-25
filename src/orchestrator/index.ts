import { spawn } from 'child_process'
import { objectKeys } from '@ubi/js-utils/dist/utils'
import { cwd } from '@/server/libs/cwd'
import { Logger } from '@/server/libs/logger'
import services from '@/server/services'

const logger = new Logger('logs/orchestrator', { verbose: true })

for (const serviceName of objectKeys(services)) {
  const startService = () => {
    const childProcess = spawn('node', ['server.js', serviceName], { cwd })

    logger.push('LOG', [serviceName, 'Start', `PID=${childProcess.pid}`])

    childProcess.stdout.on('data', (data) => {
      logger.push('LOG', [serviceName, 'StdOut', data.toString().trimEnd()])
    })

    childProcess.stderr.on('data', (data) => {
      logger.push('ERROR', [serviceName, 'StdErr', data.toString().trimEnd()])
    })

    childProcess.on('close', (code) => {
      logger.push('ERROR', [
        serviceName,
        'Stop',
        `PID=${childProcess.pid} Code=${code}`,
      ])
      setTimeout(startService)
    })
  }

  startService()
}
