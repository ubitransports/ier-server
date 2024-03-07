import { PubSampleService } from '@/server/services/pub-sample.service'
import { StateflowService } from '@/server/services/stateflow.service'
import { SubSampleService } from '@/server/services/sub-sample.service'

const services = {
  StateflowService,
  PubSampleService,
  SubSampleService,
}

export type ServiceName = keyof typeof services
export default services
