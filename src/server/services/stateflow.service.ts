import { StateflowServer } from '@ubi/ier-stateflow/dist/stateflow-server'
import { STATEFLOW_PORT } from '@/server/consts/network'
import { Logger } from '@/server/libs/logger'
import type { Service } from '@/server/libs/service'
import { getStateflowLoggerChannel } from '@/server/libs/stateflow-logger'
import type { StateflowSpecification } from '@/server/types/stateflow'

export class StateflowService implements Service {
  async main() {
    const server = new StateflowServer<StateflowSpecification>(
      STATEFLOW_PORT,
      {},
    )

    const globalStateflowLogger = new Logger('logs/stateflow.global')
    const stateStateflowLogger = new Logger('logs/stateflow.state')
    const eventStateflowLogger = new Logger('logs/stateflow.event')

    server.onLog((action, socketIdentifier, payload) => {
      globalStateflowLogger.push(getStateflowLoggerChannel(action), [
        action,
        socketIdentifier || '<null>',
        payload,
      ])
      if (action === 'Stateflow.Log.SetState') {
        stateStateflowLogger.push(getStateflowLoggerChannel(action), [
          action,
          socketIdentifier || '<null>',
          payload,
        ])
      }
      if (action === 'Stateflow.Log.PublishEvent') {
        eventStateflowLogger.push(getStateflowLoggerChannel(action), [
          action,
          socketIdentifier || '<null>',
          payload,
        ])
      }
    })
  }
}
