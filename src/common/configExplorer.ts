import cc from 'cosmiconfig';

/** @internal */
export class ConfigExplorer {
  private readonly _explorer: cc.Explorer;
  constructor() {
    this._explorer = cc('nsri');
  }

  public async assignArgs(): Promise<void> {
    const _config = await this.getConfig();
    if (!_config) {
      return Promise.resolve();
    }
    if (!this._existsArg(['-m', 'manifest']) && _config.manifest !== undefined) {
      process.argv.push('-m', _config.manifest);
    }
    if (!this._existsArg(['-s', 'source']) && _config.source) {
      process.argv.push('-s', _config.source);
    }
    if (!this._existsArg(['-v', 'verbose']) && _config.verbose !== undefined) {
      process.argv.push('-v', _config.verbose);
    }
    if (!this._existsArg(['-da', 'diralgorithm']) && _config.cryptoOptions && _config.cryptoOptions.dirAlgorithm) {
      process.argv.push('-da', _config.cryptoOptions.dirAlgorithm);
    }
    if (!this._existsArg(['-fa', 'filealgorithm']) && _config.cryptoOptions && _config.cryptoOptions.fileAlgorithm) {
      process.argv.push('-fa', _config.cryptoOptions.fileAlgorithm);
    }
    if (!this._existsArg(['-e', 'encoding']) && _config.cryptoOptions && _config.cryptoOptions.encoding) {
      process.argv.push('-e', _config.cryptoOptions.encoding);
    }
    if (!this._existsArg(['-x', 'exclude']) && _config.exclude) {
      process.argv.push('-x', ..._config.exclude);
    }
    if (!this._existsArg(['-i', 'integrity']) && _config.integrity) {
      process.argv.push('-i', _config.integrity);
    }
    if (!this._existsArg(['-o', 'output']) && _config.output) {
      process.argv.push('-o', _config.output);
    }
  }

  public async getConfig(fromPath?: string): Promise<cc.Config | null> {
    if (!this._explorer) {
      return Promise.reject(new Error('CosmiConfig not initialized'));
    }
    this._explorer.clearSearchCache();
    const _result = await this._explorer.search(fromPath);
    return _result && _result.config;
  }

  private _existsArg(args: string[]): boolean {
    return args.some(arg => process.argv.some(argv => argv === arg));
  }
}
