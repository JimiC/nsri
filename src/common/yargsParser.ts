import { existsSync, statSync } from 'fs';
import { dirname } from 'path';
import y from 'yargs';
import { Arguments } from '../interfaces/arguments';
import { ParsedArgs } from '../interfaces/parsedArgs';
import { sortObject } from './utils';

/** @internal */
export class YargsParser {
  private readonly commonOptions: { [key: string]: y.Options } = {
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
      description: `The integrity hash gets persisted to, or read from, the project's manifest (package.json)`,
      type: 'boolean',
    },
    source: {
      alias: 's',
      demandOption: true,
      description: 'The path to the file or directory to hash',
      type: 'string',
    },
    strict: {
      alias: 'st',
      default: false,
      description: 'Use directory name in root hash',
      type: 'boolean',
    },
    verbose: {
      alias: 'v',
      default: false,
      description: 'Verbosely create hashes of a directory',
      type: 'boolean',
    },
  };

  private readonly createOptions: { [key: string]: y.Options } = {
    output: {
      alias: 'o',
      description: 'The directory path where to persist the created integrity file' +
        ` (ignored when 'manifest' option specified)`,
      type: 'string',
    },
    pretty: {
      alias: 'p',
      default: false,
      description: 'Prettify the integrity object',
      type: 'boolean',
    },
  };

  private readonly checkOptions: { [key: string]: y.Options } = {
    integrity: {
      alias: 'i',
      conflicts: 'manifest',
      description: 'The integrity hash, JSON, file or directory path, to check against' +
        ` ([required] when 'manifest' option not specified)`,
      type: 'string',
    },
  };

  public constructor() {
    y
      .usage('Usage: $0 {command} [options]')
      .command('create [options]',
        `Creates integrity hash from the provided source (use '--help' for [options] details)`,
        sortObject({ ...this.createOptions, ...this.commonOptions }) as {[key: string]: y.Options})
      .command('check [options]',
        `Checks integrity hash against the provided source (use '--help' for [options] details)`,
        sortObject({ ...this.checkOptions, ...this.commonOptions }) as {[key: string]: y.Options})
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
      .check((argv: y.Arguments<Arguments>): boolean => this.validate(argv))
      .strict();
  }

  public parse(): ParsedArgs {
    const pargs = y.parse(process.argv.slice(2));
    // Set 'output' dir same as 'source' when not provided
    if (!pargs.output) {
      const source = pargs.source as string;
      pargs.output = statSync(source).isFile()
        ? dirname(source)
        : pargs.source;
    }
    return {
      command: pargs._[0],
      dirAlgorithm: pargs.diralgorithm as string,
      encoding: pargs.encoding as string,
      exclude: pargs.exclude as string[],
      fileAlgorithm: pargs.filealgorithm as string,
      inPath: pargs.source as string,
      integrity: pargs.integrity as string,
      manifest: pargs.manifest as boolean,
      outPath: pargs.output as string,
      pretty: pargs.pretty as boolean,
      strict: pargs.strict as boolean,
      verbose: pargs.verbose as boolean,
    };
  }

  private validate(argv: y.Arguments<Arguments>): boolean {
    let errorMsg = '';
    if (!existsSync(argv.source as string)) {
      errorMsg = `ENOENT: no such file or directory, '${argv.source as string}'`;
    }
    if (argv._[0] === 'check' && !argv.manifest && !argv.integrity) {
      errorMsg = 'Missing required argument: integrity';
    }
    if (errorMsg) {
      throw new Error(errorMsg);
    }
    return true;
  }
}
