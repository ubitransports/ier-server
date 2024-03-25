import { StateflowClient } from '@ubi/ier-stateflow/dist/stateflow-client'
import { STATEFLOW_ENDPOINT } from '@/server/consts/network'
import { Logger } from '@/server/libs/logger'
import type { Service } from '@/server/libs/service'
import { getStateflowLoggerChannel } from '@/server/libs/stateflow-logger'
import type { StateflowSpecification } from '@/server/types/stateflow'

export class PubSampleService implements Service {
  async main() {
    const stateflow = new StateflowClient<StateflowSpecification>(
      STATEFLOW_ENDPOINT,
    )

    const logger = new Logger('logs/pub-sample')

    stateflow.onLog((action, socketIdentifier, payload) => {
      logger.push(getStateflowLoggerChannel(action), [
        action,
        socketIdentifier || '<null>',
        payload,
      ])
    })

    await stateflow.initialize('SubSampleService')

    setInterval(async () => {
      await stateflow.publish('ping', Math.ceil(Date.now() / 1000))
    }, 1000)
  }
}
