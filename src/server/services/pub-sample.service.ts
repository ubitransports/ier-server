import { StateflowClient } from '@ubi/ier-stateflow/dist/stateflow-client'
import { STATEFLOW_ENDPOINT } from '@/server/consts/network'
import type { Service } from '@/server/libs/service'
import type { StateflowSpecification } from '@/server/types/stateflow'

export class PubSampleService implements Service {
  async main() {
    const stateflow = new StateflowClient<StateflowSpecification>(
      STATEFLOW_ENDPOINT,
    )

    stateflow.onLog((action, socketIdentifier, payload) => {
      // TODO : Write in files
    })

    await stateflow.initialize('SubSampleService')

    setInterval(async () => {
      await stateflow.publish('ping', Math.ceil(Date.now() / 1000))
    }, 1000)
  }
}
