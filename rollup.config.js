import builtins from 'builtin-modules';
import copy from 'rollup-plugin-copy';
import del from 'rollup-plugin-delete';
import { preserveShebangs } from 'rollup-plugin-preserve-shebangs';
import { terser } from 'rollup-plugin-terser';
import ts from '@rollup/plugin-typescript';
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
        removeComments: true,
      }),
      terser(),
      copy({
        targets: [
          { src: 'src/app/schemas', dest: 'lib' },
          { src: 'dist/lib', dest: '.' }
        ],
        copyOnce: true,
        hook: 'writeBundle'
      }),
      del({
        targets: 'dist/out',
        runOnce: true,
        hook: 'buildEnd'
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
        removeComments: true,
      }),
      preserveShebangs(),
      terser(),
      copy({
        targets: [
          { src: 'src/app/schemas', dest: 'lib' },
          { src: 'dist/lib', dest: '.' }
        ],
        copyOnce: true,
        hook: 'writeBundle'
      }),
      del({
        targets: 'dist/out',
        runOnce: true,
        hook: 'buildEnd'
      })
    ],
  }
]
