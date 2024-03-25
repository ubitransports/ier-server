import process from 'process'
import type { ServiceName } from '@/server/services'
import services from '@/server/services'

// Usage : node server.js <serviceName>

process.on('unhandledRejection', (reason: string, p: Promise<unknown>) => {
  console.error('Unhandled Rejection at:', p, 'reason:', reason)
  process.exit(1)
})

process.on('uncaughtException', (error: Error) => {
  console.error(
    `Caught exception: ${error}\n` + `Exception origin: ${error.stack}`,
  )
  process.exit(1)
})

if (process.argv.length < 3) {
  console.error('Missing service name argument')
  process.exit(2)
}

const serviceName = process.argv[2]

if (!isValidServiceName(serviceName)) {
  console.error('Unknown service name')
  process.exit(3)
}

const service = new services[serviceName]()

service.main().catch((e) => {
  console.error(e)
  process.exit(1)
})

function isValidServiceName(serviceName: string): serviceName is ServiceName {
  return Object.keys(services).includes(serviceName)
}
