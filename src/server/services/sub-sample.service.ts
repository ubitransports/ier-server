import { StateflowClient } from '@ubi/ier-stateflow/dist/stateflow-client'
import { STATEFLOW_ENDPOINT } from '@/server/consts/network'
import type { Service } from '@/server/libs/service'
import type { StateflowSpecification } from '@/server/types/stateflow'

export class SubSampleService implements Service {
  async main() {
    const stateflow = new StateflowClient<StateflowSpecification>(
      STATEFLOW_ENDPOINT,
    )

    stateflow.onLog((action, socketIdentifier, payload) => {
      // TODO : Write in files
    })

    try {
      await stateflow.initialize('SubSampleService')
    } catch (e) {
      console.error(e)
    }

    // return
    await stateflow.subscribe('ping', (now) => {
      console.log(now)

      if (now % 10 === 0) {
        throw new Error('Error in ping subscription')
      } else if (now % 10 === 5) {
        process.exit(2)
      }
    })

    // throw new Error('Error in main')
  }
}
