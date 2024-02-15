import path from 'path'
import typescript from '@rollup/plugin-typescript'
import { sync as rmSync } from 'rimraf'

rmSync(path.join(process.cwd(), './dist'))

export default {
    input: 'src/index.ts',
    output: {
        dir: 'dist',
        format: 'es',
    },
    plugins: [typescript()],
}
