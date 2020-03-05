import { cosmiconfig } from 'cosmiconfig';
import { ConfigOptions } from '../interfaces/configOptions';

/** @internal */
type Explorer = ReturnType<typeof cosmiconfig>;

/** @internal */
export class ConfigExplorer {
  private explorer: Explorer;
  public constructor() {
    this.explorer = cosmiconfig('nsri');
  }

  public async assignArgs(): Promise<void> {
    const config = await this.getConfig();
    if (!Object.keys(config).length) {
      return Promise.resolve();
    }
    if (!this.existsArg(['-m', 'manifest']) && config.manifest !== undefined) {
      process.argv.push('-m', config.manifest);
    }
    if (!this.existsArg(['-s', 'source']) && config.source) {
      process.argv.push('-s', config.source);
    }
    if (!this.existsArg(['-v', 'verbose']) && config.verbose !== undefined) {
      process.argv.push('-v', config.verbose);
    }
    if (!this.existsArg(['-da', 'diralgorithm']) && config.cryptoOptions && config.cryptoOptions.dirAlgorithm) {
      process.argv.push('-da', config.cryptoOptions.dirAlgorithm);
    }
    if (!this.existsArg(['-fa', 'filealgorithm']) && config.cryptoOptions && config.cryptoOptions.fileAlgorithm) {
      process.argv.push('-fa', config.cryptoOptions.fileAlgorithm);
    }
    if (!this.existsArg(['-e', 'encoding']) && config.cryptoOptions && config.cryptoOptions.encoding) {
      process.argv.push('-e', config.cryptoOptions.encoding);
    }
    if (!this.existsArg(['-x', 'exclude']) && config.exclude) {
      process.argv.push('-x', ...config.exclude);
    }
    if (!this.existsArg(['-i', 'integrity']) && config.integrity) {
      process.argv.push('-i', config.integrity);
    }
    if (!this.existsArg(['-o', 'output']) && config.output) {
      process.argv.push('-o', config.output);
    }
  }

  public async getConfig(fromPath?: string): Promise<ConfigOptions> {
    if (!this.explorer) {
      return Promise.reject(new Error('CosmiConfig not initialized'));
    }
    this.explorer.clearSearchCache();
    const result = await this.explorer.search(fromPath);
    return result ? result.config : {};
  }

  private existsArg(args: string[]): boolean {
    return args.some((arg: string): boolean =>
      process.argv.some((argv: string): boolean => argv === arg));
  }
}
