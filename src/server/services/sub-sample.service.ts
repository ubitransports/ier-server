import { StateflowClient } from '@ubi/ier-stateflow/dist/stateflow-client'
import { STATEFLOW_ENDPOINT } from '@/common/consts/network'
import type { StateflowSpecification } from '@/common/types/stateflow'
import { Logger } from '@/server/libs/logger'
import type { Service } from '@/server/libs/service'
import { getStateflowLoggerChannel } from '@/server/libs/stateflow-logger'

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

    // stateflow.onLog((action, socket, payload) => {
    //   fs.writeFileSync('sub-sample-service.log')
    // })

    // return
    await stateflow.subscribe('ping', () => {
      // console.log(now)
      // if (now % 10 === 0) {
      //   throw new Error('Error in ping subscription')
      // } else if (now % 10 === 5) {
      //   process.exit(2)
      // }
    })

    // throw new Error('Error in main')
  }
}
