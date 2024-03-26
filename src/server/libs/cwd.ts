import { dirname } from 'path'
import process from 'process'

export const cwd = dirname(process.argv[1])
