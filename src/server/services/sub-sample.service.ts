import { StateflowClient } from '@ubi/ier-stateflow/dist/stateflow-client'
import { STATEFLOW_ENDPOINT } from '@/server/consts/network'
import { Logger } from '@/server/libs/logger'
import type { Service } from '@/server/libs/service'
import { getStateflowLoggerChannel } from '@/server/libs/stateflow-logger'
import type { StateflowSpecification } from '@/server/types/stateflow'

export class SubSampleService implements Service {
  async main() {
    const stateflow = new StateflowClient<StateflowSpecification>(
      STATEFLOW_ENDPOINT,
    )
    const logger = new Logger('logs/sub-sample')

    stateflow.onLog((action, socketIdentifier, payload) => {
      logger.push(getStateflowLoggerChannel(action), [
        action,
        socketIdentifier || '<null>',
        payload,
      ])
    })

    try {
      await stateflow.initialize('SubSampleService')
    } catch (e) {
      console.error(e)
    }

    // return
    await stateflow.subscribe('ping', (now) => {
      console.log(now)
      //
      // if (now % 10 === 0) {
      //   throw new Error('Error in ping subscription')
      // } else if (now % 10 === 5) {
      //   process.exit(2)
      // }
    })

    // throw new Error('Error in main')
  }
}
