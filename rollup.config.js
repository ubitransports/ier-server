import fs from 'fs'
import { resolve } from 'path'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import { sync as rimraf } from 'rimraf'
import esbuild from 'rollup-plugin-esbuild'

const cwd = process.cwd()

const pkg = JSON.parse(fs.readFileSync(resolve(cwd, 'package.json'), 'utf-8'))

rimraf(resolve(process.cwd(), 'dist'))

const builds = [getTsBuildConfig()]

export default builds

function getBanner() {
  return `/*!
* ${pkg.name} v${pkg.version}
*/`
}

function getTsBuildConfig() {
  return {
    input: `src/demo.ts`,
    output: {
      banner: getBanner(),
      file: `dist/index.mjs`,
      format: 'es',
    },
    external: ['typescript'],
    plugins: [
      nodeResolve({ preferBuiltins: true }),
      commonjs(),
      json(),
      esbuild({ loaders: { '.json': 'json' } }),
    ],
  }
}
