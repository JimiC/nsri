import terser from '@rollup/plugin-terser';
import ts from '@rollup/plugin-typescript';
import builtins from 'builtin-modules';
import { apiExtractor } from "rollup-plugin-api-extractor";
import copy from 'rollup-plugin-copy';
import { preserveShebangs } from 'rollup-plugin-preserve-shebangs';
import typescript from 'typescript';
import pkg from './package.json';

export default [
  {
    input: 'src/index.ts',
    output: [
      {
        dir: 'dist',
        entryFileNames: pkg.main,
        format: 'cjs',
      },
      {
        dir: 'dist',
        entryFileNames: pkg.module,
        format: 'es',
      },
    ],
    external: [
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.peerDependencies || {}),
      ...builtins,
    ],
    plugins: [
      ts({
        typescript,
      }),
      terser(),
      copy({
        targets: [
          { src: 'src/app/schemas', dest: 'lib' },
          { src: 'dist/lib', dest: '.' },
        ],
        copyOnce: true,
        hook: 'writeBundle'
      }),
      apiExtractor({
        configuration: {
          projectFolder: ".",
        },
        configFile: "./api-extractor.json",
        cleanUpRollup: false
      })
    ],
  },
  {
    input: 'src/cli.ts',
    output: [
      {
        dir: 'dist',
        entryFileNames: pkg.bin.nsri,
        format: 'cjs',
      }
    ],
    external: [
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.peerDependencies || {}),
      ...builtins,
    ],
    plugins: [
      ts({
        typescript,
      }),
      preserveShebangs(),
      terser(),
      copy({
        targets: [
          { src: 'src/app/schemas', dest: 'lib' },
          { src: 'dist/lib', dest: '.' },
        ],
        copyOnce: true,
        hook: 'writeBundle'
      }),
      apiExtractor({
        configuration: {
          projectFolder: ".",
        },
        configFile: "./api-extractor.json",
        cleanUpRollup: false
      })
    ],
  }
]
