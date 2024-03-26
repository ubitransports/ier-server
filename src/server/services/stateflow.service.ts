import { StateflowServer } from '@ubi/ier-stateflow/dist/stateflow-server'
import { STATEFLOW_PORT } from '@/common/consts/network'
import type { StateflowSpecification } from '@/common/types/stateflow'
import { Logger } from '@/server/libs/logger'
import type { Service } from '@/server/libs/service'
import { getStateflowLoggerChannel } from '@/server/libs/stateflow-logger'

export class StateflowService implements Service {
  async main() {
    const server = new StateflowServer<StateflowSpecification>(STATEFLOW_PORT, {
      currentTabContext: 'SPLASHSCREEN',
      tabUrls: [
        'http://example.com/splashscreen',
        'http://example.com/main',
        'http://example.com/screensaver',
        'http://example.com/error',
      ],
    })

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
