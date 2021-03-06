import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import resolve from '@rollup/plugin-node-resolve'
import { terser } from 'rollup-plugin-terser'
import babel from '@rollup/plugin-babel'
import sizeCheck from 'rollup-plugin-filesize-check'
const name = 'compromise-counts'

import { version } from './package.json'
const banner = `/* ${name} ${version} MIT */`

export default [
  {
    input: 'src/index.js',
    output: [
      {
        file: `builds/${name}.mjs`,
        format: 'esm',
        banner: banner,
      },
    ],
    plugins: [
      resolve(),
      json(),
      commonjs(),
      babel({
        babelrc: false,
        // https://github.com/rollup/plugins/tree/master/packages/babel#babelhelpers
        babelHelpers: 'bundled',
        presets: ['@babel/preset-env'],
      }),
      sizeCheck(),
    ],
  },
  {
    input: 'src/index.js',
    output: [
      {
        file: `builds/${name}.js`,
        format: 'umd',
        sourcemap: true,
        name: 'compromiseCounts',
        banner: banner,
      },
    ],
    plugins: [
      resolve(),
      json(),
      commonjs(),
      babel({
        babelrc: false,
        babelHelpers: 'bundled',
        presets: ['@babel/preset-env'],
      }),
      sizeCheck(),
    ],
  },
  {
    input: 'src/index.js',
    output: [
      {
        file: `builds/${name}.min.js`,
        format: 'umd',
        name: 'compromiseCounts',
      },
    ],
    plugins: [
      resolve(),
      json(),
      commonjs(),
      babel({
        babelrc: false,
        babelHelpers: 'bundled',
        presets: ['@babel/preset-env'],
      }),
      terser(),
      sizeCheck(),
    ],
  },
]