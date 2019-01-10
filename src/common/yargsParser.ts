import fs from 'fs';
import path from 'path';
import * as y from 'yargs';
import { IParsedArgs } from '../interfaces/parsedArgs';
import { sortObject } from './utils';

/** @internal */
export class YargsParser {
  private readonly _commonOptions: { [key: string]: y.Options } = {
    diralgorithm: {
      alias: 'da',
      default: 'sha512',
      description: 'The algorithm to use for directory hashing',
      type: 'string',
    },
    encoding: {
      alias: 'e',
      default: 'base64',
      description: 'The encoding to use for hashing',
      type: 'string',
    },
    exclude: {
      alias: 'x',
      default: [],
      description: 'Files and/or directories paths to exclude',
      type: 'array',
    },
    filealgorithm: {
      alias: 'fa',
      default: 'sha1',
      description: 'The algorithm to use for file hashing',
      type: 'string',
    },
    manifest: {
      alias: 'm',
      default: undefined,
      description: 'The integrity hash gets persisted to, or read from, the project\'s manifest (package.json)',
      type: 'boolean',
    },
    source: {
      alias: 's',
      demandOption: true,
      description: 'The path to the file or directory to hash',
      type: 'string',
    },
    verbose: {
      alias: 'v',
      default: false,
      description: 'Verbosely create hashes of a directory',
      type: 'boolean',
    },
  };

  private readonly _createOptions: { [key: string]: y.Options } = {
    output: {
      alias: 'o',
      description: 'The directory path where to persist the created integrity file' +
        '(ignored when \'manifest\' option specified)',
      type: 'string',
    },
  };

  private readonly _checkOptions: { [key: string]: y.Options } = {
    integrity: {
      alias: 'i',
      conflicts: 'manifest',
      description: 'The integrity hash, JSON, file or directory path, to check against' +
        ' ([required] when \'manifest\' option not specified)',
      type: 'string',
    },
  };

  constructor() {
    y
      .usage('Usage: $0 {command} [options]')
      .command('create [options]',
        'Creates integrity hash from the provided source (use \'--help\' for [options] details)',
        sortObject({ ...this._createOptions, ...this._commonOptions }))
      .command('check [options]',
        'Checks integrity hash against the provided source (use \'--help\' for [options] details)',
        sortObject({ ...this._checkOptions, ...this._commonOptions }))
      .demandCommand(1, 'Missing command')
      .recommendCommands()
      .options({
        help: {
          alias: 'h',
          description: 'Show help',
          global: true,
        },
        version: {
          alias: 'V',
          description: 'Show version number',
          global: false,
        },
      })
      .check((argv: y.Arguments) => this._validate(argv))
      .strict();
  }

  public parse(): IParsedArgs {
    const _pargs = y.parse(process.argv.slice(2));
    // Set 'output' dir same as 'source' when not provided
    if (!_pargs.output) {
      _pargs.output = fs.statSync(_pargs.source).isFile()
        ? path.dirname(_pargs.source)
        : _pargs.source;
    }
    return {
      command: _pargs._[0],
      dirAlgorithm: _pargs.diralgorithm,
      encoding: _pargs.encoding,
      exclude: _pargs.exclude,
      fileAlgorithm: _pargs.filealgorithm,
      inPath: _pargs.source,
      integrity: _pargs.integrity,
      manifest: _pargs.manifest,
      outPath: _pargs.output,
      verbose: _pargs.verbose,
    };
  }

  private _validate(argv: y.Arguments): boolean {
    let _errorMsg = '';
    if (!fs.existsSync(argv.source)) {
      _errorMsg = `ENOENT: no such file or directory, '${argv.source}'`;
    }
    if (argv._[0] === 'check' && !argv.manifest && !argv.integrity) {
      _errorMsg = 'Missing required argument: integrity';
    }
    if (_errorMsg) {
      throw new Error(_errorMsg);
    }
    return true;
  }
}
