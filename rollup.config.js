import fs from 'fs'
import { resolve } from 'path'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import { tsResolve } from '@ubi/plugin-rollup-typescript-resolve'
import { sync as rimraf } from 'rimraf'
import { chromeExtension, simpleReloader } from 'rollup-plugin-chrome-extension'
import esbuild from 'rollup-plugin-esbuild'

const cwd = process.cwd()

const pkg = JSON.parse(fs.readFileSync(resolve(cwd, 'package.json'), 'utf-8'))

rimraf(resolve(process.cwd(), 'dist'))

const builds = [
  getTsBuildConfig('orchestrator'),
  getTsBuildConfig('server'),
  getChromeExtensionBuildConfig('tab-manager-extension'),
]

export default builds

function getBanner() {
  return `/*!
* ${pkg.name} v${pkg.version}
*/`
}

function getTsBuildConfig(target) {
  return {
    input: `src/${target}/index.ts`,
    output: {
      banner: getBanner(),
      file: `dist/${target}.js`,
      format: 'es',
    },
    external: ['typescript'],
    plugins: [
      tsResolve(),
      nodeResolve({ preferBuiltins: true }),
      commonjs(),
      json(),
      esbuild({ loaders: { '.json': 'json' } }),
    ],
  }
}

function getChromeExtensionBuildConfig(target) {
  return {
    input: `src/${target}/manifest.json`,
    output: {
      dir: `dist/${target}`,
      format: 'esm',
    },
    plugins: [
      chromeExtension(),
      simpleReloader(),
      tsResolve(),
      nodeResolve({ browser: true }),
      commonjs(),
      json(),
      esbuild({ loaders: { '.json': 'json' } }),
    ],
  }
}
