import { StateflowServer } from '@ubi/ier-stateflow/dist/stateflow-server'
import { STATEFLOW_PORT } from '@/server/consts/network'
import type { Service } from '@/server/libs/service'
import type { StateflowSpecification } from '@/server/types/stateflow'

export class StateflowService implements Service {
  async main() {
    const server = new StateflowServer<StateflowSpecification>(
      STATEFLOW_PORT,
      {},
    )

    server.onLog((action, socketIdentifier, payload) => {
      // TODO : Write in files
    })
  }
}
