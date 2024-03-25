import { createWriteStream, type WriteStream } from 'fs'
import { mkdirSync } from 'fs'
import { dirname, resolve } from 'path'
import { cwd } from '@/server/libs/cwd'

type Channel = 'LOG' | 'ERROR' | 'WARN'
export class Logger {
  #streams: Record<Channel, WriteStream | null>

  #output: string
  #verbose: boolean

  constructor(output: string, options = { verbose: false }) {
    this.#output = output
    this.#verbose = options.verbose
    this.#streams = {
      LOG: null,
      ERROR: null,
      WARN: null,
    }
  }

  #openStream(channel: Channel) {
    let stream = this.#streams[channel]

    if (!stream) {
      let prefix = ''

      if (channel !== 'LOG') {
        prefix = '.' + channel.toLowerCase()
      }

      const path = resolve(cwd, this.#output + prefix + '.log')
      mkdirSync(dirname(path), { recursive: true })
      stream = createWriteStream(path, { flags: 'a' })
    }

    return stream
  }

  push(channel: Channel, data: unknown[]) {
    const datetime = new Date().toISOString()

    const line = [
      datetime,
      channel,
      ...data.map((d) => (typeof d === 'string' ? d : JSON.stringify(d))),
    ].join('\t')

    if (this.#verbose) {
      if (channel === 'LOG') {
        console.log(line)
      } else if (channel === 'WARN') {
        console.warn(line)
      } else {
        console.error(line)
      }
    }

    this.#write(channel, line)
  }

  #write(channel: Channel, line: string) {
    this.#openStream(channel).write(line + '\n', (err) => {
      if (err) {
        console.error('Error writing to file', err)
      }
    })
  }
}
