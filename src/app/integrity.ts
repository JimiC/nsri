// tslint:disable unified-signatures
import ajv from 'ajv';
import { createHash, getHashes, Hash, HexBase64Latin1Encoding } from 'crypto';
import { createReadStream, Stats } from 'fs';
import mm from 'minimatch';
import path from 'path';
import { ConfigExplorer } from '../common/configExplorer';
import * as constants from '../common/constants';
import { CryptoEncoding } from '../common/enums';
import * as pfs from '../common/fsAsync';
import * as utils from '../common/utils';
import { ICryptoOptions } from '../interfaces/cryptoOptions';
import { IHashObject } from '../interfaces/hashObject';
import { IndexedObject } from '../interfaces/indexedObject';
import { IntegrityObject } from '../interfaces/integrityObject';
import { IntegrityOptions } from '../interfaces/integrityOptions';
import { INormalizedCryptoOptions } from '../interfaces/normalizedCryptoOptions';
import { INormalizedIntegrityOptions } from '../interfaces/normalizedIntegrityOptions';
import { IVerboseHashObject } from '../interfaces/verboseHashObject';

export class Integrity {
  public static readonly CurrentSchemaVersion = '1';

  public static async check(fileOrDirPath: string, integrity: string): Promise<boolean>;
  public static async check(fileOrDirPath: string, integrity: string, options: IntegrityOptions): Promise<boolean>;
  public static async check(
    fileOrDirPath: string, integrity: string, options?: IntegrityOptions): Promise<boolean> {
    if (!fileOrDirPath || typeof fileOrDirPath !== 'string' ||
      !integrity || typeof integrity !== 'string') {
      return false;
    }
    const exclude = options ? options.exclude : undefined;
    const verbose = options ? options.verbose : undefined;
    if (!options || !options.cryptoOptions ||
      !options.cryptoOptions.fileAlgorithm ||
      !options.cryptoOptions.dirAlgorithm ||
      !options.cryptoOptions.encoding
    ) {
      options = await this._detectOptions(fileOrDirPath, integrity);
      options.exclude = exclude;
      options.verbose = verbose || options.verbose;
    }
    const _intObj = await Integrity.create(fileOrDirPath, options);
    let _integrityObj: IntegrityObject;
    // 'integrity' is a file or directory path
    if (await pfs.existsAsync(integrity)) {
      integrity = await this._pathCheck(integrity);
      const _content = await pfs.readFileAsync(integrity, 'utf8');
      _integrityObj = utils.parseJSON(_content) as IntegrityObject;
      await this._validate(_integrityObj);
      return this._verify(_intObj, _integrityObj, fileOrDirPath);
    }
    // 'integrity' is a stringified JSON
    _integrityObj = utils.parseJSON(integrity) as IntegrityObject;
    // 'integrity' is a hash
    if (!_integrityObj) {
      _integrityObj = {
        hashes: {
          [path.basename(fileOrDirPath)]: integrity,
        },
        version: this.CurrentSchemaVersion,
      };
    }
    await this._validate(_integrityObj);
    return this._verify(_intObj, _integrityObj);
  }

  public static async create(fileOrDirPath: string, options?: IntegrityOptions): Promise<IntegrityObject> {
    const _ls: Stats = await pfs.lstatAsync(fileOrDirPath);
    const _obj: IntegrityObject = { version: this.CurrentSchemaVersion, hashes: {} };
    if (_ls.isDirectory()) {
      _obj.hashes = await Integrity.createDirHash(fileOrDirPath, options);
    }
    if (_ls.isFile()) {
      const { cryptoOptions } = this._normalizeOptions(options);
      _obj.hashes = await Integrity.createFileHash(fileOrDirPath, cryptoOptions);
    }
    return _obj;
  }

  public static async createDirHash(dirPath: string, options?: IntegrityOptions)
    : Promise<IHashObject> {
    this._rootDirPath = path.join(dirPath, path.sep);
    const _ls: Stats = await pfs.lstatAsync(dirPath);
    if (!_ls.isDirectory()) {
      throw new Error(`ENOTDIR: not a directory, '${dirPath}'`);
    }
    const _options = this._normalizeOptions(options);
    const _hashes: string | IVerboseHashObject = _options.verbose
      ? await this._computeHashVerbosely(_options, dirPath)
      : await this._computeHash(_options, dirPath);
    const _hasHashes = typeof _hashes === 'string' ? !!_hashes : !!_hashes.hash;
    return _hasHashes ? { [path.basename(dirPath)]: _hashes } : {};
  }

  public static async createFileHash(filePath: string, options?: ICryptoOptions): Promise<IHashObject> {
    const _ls: Stats = await pfs.lstatAsync(filePath);
    if (!_ls.isFile()) {
      throw new Error(`ENOTFILE: not a file, '${path.basename(filePath)}'`);
    }
    if (path.basename(filePath) === constants.integrityFilename) {
      throw new Error(`ENOTALW: file not allowed, '${path.basename(filePath)}'`);
    }
    const { fileAlgorithm, encoding } = this._normalizeCryptoOptions(options);
    const _hash = await this._computeStreamHash(filePath, createHash(fileAlgorithm), fileAlgorithm, encoding);
    return { [path.basename(filePath)]: _hash };
  }

  public static async createFilesHash(filenames: string[], options?: ICryptoOptions): Promise<IHashObject> {
    const _hashObj: IHashObject = {};
    const _callback = async (file: string, _obj: IHashObject): Promise<void> => {
      Object.assign(_obj, await this.createFileHash(file, options));
    };
    for (const file of filenames) {
      await _callback(file, _hashObj);
    }
    return _hashObj;
  }

  public static persist(intObj: IntegrityObject, dirPath = './'): Promise<void> {
    const _filePath = path.resolve(dirPath, constants.integrityFilename);
    return pfs.writeFileAsync(_filePath, JSON.stringify(intObj, null, 2));
  }

  public static async getManifestIntegrity(): Promise<string> {
    const _obj = await this._getManifestInfo();
    const data = JSON.stringify(_obj.manifest.integrity, null, _obj.indentation.indent || _obj.indentation.amount);
    return Promise.resolve(data);
  }

  public static async updateManifestIntegrity(intObj: IntegrityObject): Promise<void> {
    const _obj = await this._getManifestInfo();
    _obj.manifest.integrity = intObj;
    const data = JSON.stringify(_obj.manifest, null, _obj.indentation.indent || _obj.indentation.amount);
    return pfs.writeFileAsync(constants.manifestFile, data);
  }

  public static async getIntegrityOptionsFromConfig(): Promise<IntegrityOptions> {
    const _explorer = new ConfigExplorer();
    const _config = await _explorer.getConfig();
    if (!Object.keys(_config).length) {
      return Promise.resolve({});
    }
    return {
      cryptoOptions: {
        dirAlgorithm: _config.cryptoOptions && _config.cryptoOptions.dirAlgorithm,
        encoding: _config.cryptoOptions && _config.cryptoOptions.encoding,
        fileAlgorithm: _config.cryptoOptions && _config.cryptoOptions.fileAlgorithm,
      },
      exclude: _config.exclude,
      verbose: _config.verbose,
    };
  }

  public static async getExclutionsFromIgnoreFile(): Promise<string[]> {
    const ignoreFileExists = await pfs.existsAsync(constants.ignoreFile);
    if (!ignoreFileExists) {
      return [];
    }
    const ignoreRaw: string = await pfs.readFileAsync(constants.ignoreFile, 'utf8') as string;
    return utils.normalizeEntries(ignoreRaw.split(/[\n\r]/));
  }

  /** @internal */
  // ['hex', 'base64', 'latin1']
  private static readonly _allowedCryptoEncodings = Object.keys(CryptoEncoding)
    .map<string>(k => CryptoEncoding[k as keyof typeof CryptoEncoding]);

  /** @internal */
  private static _rootDirPath = '';

  /** @internal */
  private static async _getManifestInfo(): Promise<IndexedObject> {
    if (!(await pfs.existsAsync(constants.manifestFile))) {
      return Promise.reject(`Error: '${constants.manifestFile}' not found
  Ensure the process is done on the project's root directory`);
    }
    const _content = await pfs.readFileAsync(constants.manifestFile, 'utf8') as string;
    const _manifest: IndexedObject | null = utils.parseJSON(_content);
    if (!_manifest) {
      return Promise.reject('Error: Manifest not found');
    }
    return {
      indentation: utils.getIndentation(_content),
      manifest: _manifest,
    };
  }

  /** @internal */
  private static async _detectOptions(inPath: string, integrity: string): Promise<IntegrityOptions> {
    // get the integrity object
    let _integrityObj: IntegrityObject;
    // 'integrity' is a file or directory path
    if (await pfs.existsAsync(integrity)) {
      integrity = await this._pathCheck(integrity);
      const _content = await pfs.readFileAsync(integrity, 'utf8');
      _integrityObj = utils.parseJSON(_content) as IntegrityObject;
    } else {
      // 'integrity' is a stringified JSON
      _integrityObj = utils.parseJSON(integrity) as IntegrityObject;
      // 'integrity' is a hash
      if (!_integrityObj) {
        _integrityObj = {
          hashes: {
            [path.basename(inPath)]: integrity,
          },
          version: this.CurrentSchemaVersion,
        };
      }
    }
    const _options: IntegrityOptions = {};
    if (!_integrityObj || !_integrityObj.hashes) { return _options; }
    await this._validate(_integrityObj);
    const _first: string | IVerboseHashObject = _integrityObj.hashes[path.basename(inPath)];
    if (!_first) { return _options; }
    // detect verbosity
    _options.verbose = typeof _first !== 'string';
    // detect options
    _options.cryptoOptions = await this._detectCryptoOptions(_first, inPath);
    return _options;
  }

  private static async _detectCryptoOptions(_first: string | IVerboseHashObject, inPath: string)
    : Promise<ICryptoOptions> {
    const _cryptoOptions: ICryptoOptions = {};
    // find integrity members
    const _getIntegrityMembers = (hash: string): RegExpMatchArray | null =>
      hash ? hash.match(/^([a-zA-Z0-9-]*)-([\s\S]*)/) : null;
    const _fHash: string = typeof _first === 'string' ? _first : _first.hash;
    const _integrityMembers = _getIntegrityMembers(_fHash);
    if (!_integrityMembers || !_integrityMembers.length) { return _cryptoOptions; }
    // detect encoding
    const _enc = _integrityMembers[2];
    const _encoding: HexBase64Latin1Encoding | undefined =
      utils.hexRegexPattern.test(_enc)
        ? CryptoEncoding.Hex
        : utils.base64RegexPattern.test(_enc)
          ? CryptoEncoding.Base64
          : utils.latin1RegexPattern.test(_enc)
            ? CryptoEncoding.Latin1
            : undefined;
    if (!_encoding) { return _cryptoOptions; }
    _cryptoOptions.encoding = _encoding;
    // detect dirAlgorithm
    const _cryptoHashes = getHashes();
    const stat = await pfs.lstatAsync(inPath);
    _cryptoOptions.dirAlgorithm = stat.isDirectory()
      ? _cryptoHashes.find(algorithm => algorithm === _integrityMembers[1])
      : undefined;
    // detect fileAlgorithm
    const findFileAlgorithm = async (
      content: IHashObject,
      pathTo: string,
    ): Promise<string | undefined> => {
      for (const key of Object.keys(content)) {
        const _hash: string | IVerboseHashObject = content[key];
        const _path: string = path.join(pathTo, key);
        if (!await pfs.existsAsync(_path)) { continue; }
        // it's a directory
        if (typeof _hash !== 'string') {
          return (await pfs.lstatAsync(_path)).isDirectory()
            ? findFileAlgorithm(_hash.contents, _path)
            : undefined;
        }
        // it's a file
        const _im = _getIntegrityMembers(_hash);
        if (!_im || !_im.length) { return undefined; }
        return _im[1];
      }
      return undefined;
    };
    _cryptoOptions.fileAlgorithm = stat.isFile() || typeof _first === 'string'
      ? _cryptoHashes.find(algorithm => algorithm === _integrityMembers[1])
      : await findFileAlgorithm(_first.contents, inPath);
    return _cryptoOptions;
  }

  /** @internal */
  private static _normalizeCryptoOptions(options?: ICryptoOptions): INormalizedCryptoOptions {
    const _check = (_options?: ICryptoOptions): INormalizedCryptoOptions | undefined => {
      if (!_options) { return _options; }
      if (_options.fileAlgorithm && !utils.isSupportedHash(_options.fileAlgorithm)) {
        throw new Error(`ENOSUP: Hash algorithm not supported: '${_options.fileAlgorithm}'`);
      }
      if (_options.dirAlgorithm && !utils.isSupportedHash(_options.dirAlgorithm)) {
        throw new Error(`ENOSUP: Hash algorithm not supported: '${_options.dirAlgorithm}'`);
      }
      if (_options.encoding && this._allowedCryptoEncodings.indexOf(_options.encoding.toLowerCase()) === -1) {
        throw new Error(`ENOSUP: Hash encoding not supported: '${_options.encoding}'`);
      }
      return {
        dirAlgorithm: _options.dirAlgorithm || constants.defaultDirCryptoAlgorithm,
        encoding: _options.encoding || constants.defaultCryptoEncoding,
        fileAlgorithm: _options.fileAlgorithm || constants.defaultFileCryptoAlgorithm,
      };
    };
    return _check(options) || {
      dirAlgorithm: constants.defaultDirCryptoAlgorithm,
      encoding: constants.defaultCryptoEncoding,
      fileAlgorithm: constants.defaultFileCryptoAlgorithm,
    };
  }

  /** @internal */
  private static _normalizeOptions(options?: IntegrityOptions): INormalizedIntegrityOptions {
    const _getExclusions = (exclusions: string[]): { include: string[], exclude: string[] } => {
      const commentsPattern = /^\s*#/;
      let _exclude = exclusions.filter(excl => !!excl && !commentsPattern.test(excl));
      const directoryPattern = /(^|\/)[^/]*\*[^/]*$/;
      _exclude = [..._exclude, ..._exclude
        .filter(excl => !directoryPattern.test(excl))
        .map(excl => /\/$/.test(excl) ? `${excl}**` : `${excl}/**`)];
      const negatePattern = /^\s*!/;
      const _include = _exclude.filter(excl => negatePattern.test(excl)).map(excl => excl.slice(1));
      _exclude = [
        ..._exclude.filter(excl => !negatePattern.test(excl)),
        ...constants.defaultExclutions,
      ];
      return {
        exclude: _exclude,
        include: _include,
      };
    };
    const _cryptoOptions = this._normalizeCryptoOptions(options && options.cryptoOptions);
    const { exclude, include } = _getExclusions((options && options.exclude) || []);
    const _verbose = options && options.verbose !== undefined
      ? options.verbose
      : false;
    return {
      cryptoOptions: _cryptoOptions,
      exclude,
      include,
      verbose: _verbose,
    };
  }

  /** @internal */
  private static async _pathCheck(integrityPath: string): Promise<string> {
    const _ls: Stats = await pfs.lstatAsync(integrityPath);
    if (_ls.isDirectory()) {
      return path.join(integrityPath, constants.integrityFilename);
    }
    if (_ls.isFile()) {
      if (path.basename(integrityPath) !== constants.integrityFilename) {
        throw new Error(`EINVNAME: filename must be '${constants.integrityFilename}'`);
      }
      return integrityPath;
    }
    throw new Error(`ENOSUP: path not supported: '${integrityPath}'`);
  }

  /** @internal */
  private static async _verify(intObj: IntegrityObject, integrity: IntegrityObject, inPath?: string): Promise<boolean> {
    if (!intObj) { return false; }
    if (intObj.version !== integrity.version) {
      throw new Error('EINVER: Incompatible versions check');
    }
    const _equals = (obj1: IntegrityObject, obj2: IntegrityObject): boolean => {
      return JSON.stringify(utils.sortObject(obj1)) === JSON.stringify(utils.sortObject(obj2));
    };
    const _deepEquals = async (_path?: string): Promise<boolean> => {
      if (!_path) { return false; }
      let _has = false;
      const _filenameOrDirectory = path.basename(_path);
      const _hashes: IHashObject = integrity.hashes;
      const _dirList = path.dirname(_path).split(path.sep).filter(pt => pt);
      const _findHash = (_array: string[], _hashObj: IHashObject): void => {
        if (!_array.length) {
          const _integrityHash: string | IVerboseHashObject = _hashObj[_filenameOrDirectory];
          const _hashedObjHash: string | IVerboseHashObject = intObj.hashes[_filenameOrDirectory];
          _has = typeof _integrityHash === 'string'
            ? typeof _hashedObjHash === 'string'
              ? _integrityHash === _hashedObjHash
              : _integrityHash === _hashedObjHash.hash
            : typeof _hashedObjHash === 'string'
              ? _integrityHash.hash === _hashedObjHash
              : _integrityHash.hash === _hashedObjHash.hash;
          return;
        }
        const _rootHash = _hashObj[_array[0]];
        // non-verbosely directory hash
        if (typeof _rootHash === 'string') {
          _has = _rootHash === intObj.hashes[_array[0]];
          return;
        }
        // verbosely directory hash
        const _subDir: string | undefined = Object.keys(_rootHash.contents).find(key => key === _array[1]);
        _array = _subDir ? _array.splice(1) : [];
        return _findHash(_array, _rootHash.contents);
      };
      const _findRootIndex = async (_array: string[], _index: number): Promise<number> => {
        const _dirPath: string = utils.getAbsolutePath(_array, _index);
        const _dirHashObj: IHashObject = await this.createDirHash(_dirPath, { verbose: true });
        const _integrityDirHash: string | IVerboseHashObject = _hashes[_array[_index]];
        const _dirHashes = _dirHashObj[_array[_index]] as IVerboseHashObject;
        if (_integrityDirHash && _dirHashes) {
          const _hash: string = typeof _integrityDirHash === 'string'
            // non-verbose
            ? _integrityDirHash
            // verbose
            : _integrityDirHash.hash;
          return _hash === _dirHashes.hash
            ? _index
            : _findRootIndex(_array, _index + 1);
        }
        return -1;
      };
      const _potentialRootIndex: number = _dirList.findIndex(dir => !!_hashes[dir]);
      if (_potentialRootIndex === -1) { return false; }
      const _rootIndex: number = await _findRootIndex(_dirList, _potentialRootIndex);
      if (_rootIndex === -1) { return false; }
      _findHash(_dirList.splice(_rootIndex), _hashes);
      return _has;
    };
    const _isEqual: boolean = _equals(intObj, integrity);
    const _isDeepEqual: boolean = await _deepEquals(inPath);
    return _isEqual || _isDeepEqual;
  }

  /** @internal */
  private static _match = (target: string, pattern: string): boolean =>
    mm(target, pattern, { dot: true })

  /** @internal */
  private static _excludePath(curPath: string, options: INormalizedIntegrityOptions): boolean {
    return options.exclude.some(excl => this._match(curPath, excl))
      && !options.include.some(incl => this._match(curPath, incl));
  }

  /** @internal */
  private static _computeStreamHash(filePath: string, hash: Hash, algorithm: string, encoding?: HexBase64Latin1Encoding)
    : Promise<string> {
    return new Promise((res, rej): void => {
      const _result = (): void => res(encoding
        ? `${algorithm}-${hash.digest(encoding)}`
        : '');
      hash.update(path.basename(filePath));
      createReadStream(filePath)
        .on('error', (error: any) => rej(error))
        .on('data', (chunk: any) => hash.update(chunk))
        .on('end', _result);
    });
  }

  /** @internal */
  private static async _computeHash(
    options: INormalizedIntegrityOptions,
    rootDirPath: string,
    dirPath?: string,
  ): Promise<string> {
    const { dirAlgorithm, encoding }: INormalizedCryptoOptions = this._normalizeCryptoOptions(options.cryptoOptions);
    const _recurse = async (_dirPath: string, _algorithm: string, _hash?: Hash): Promise<Hash | undefined> => {
      const _callback = async (filename: string): Promise<void> => {
        const _curPath = path.join(_dirPath, filename);
        const _curPathStats: Stats = await pfs.lstatAsync(_curPath);
        if (_curPathStats.isDirectory()) {
          await _recurse(_curPath, _algorithm, _hash);
        }
        if (_curPathStats.isFile()) {
          if (this._excludePath(this._pathFromRoot(_curPath), options)) {
            return;
          }
          await this._computeStreamHash(_curPath, _hash!, _algorithm);
        }
      };
      const _collectedAllFilePaths = async (_dPath: string): Promise<string[]> => {
        const _subDirs: string[] = await pfs.readdirAsync(_dPath);
        const _iterator = async (subDir: string): Promise<string[]> => {
          const _resolvedPath = path.resolve(_dPath, subDir);
          const _ls = await pfs.lstatAsync(_resolvedPath);
          return _ls.isDirectory()
            ? _collectedAllFilePaths(_resolvedPath)
            : [_resolvedPath];
        };
        const _promises: Array<Promise<string[]>> = _subDirs.map(_iterator);
        const _filePaths: string[][] = await Promise.all(_promises);
        return _filePaths.reduce((collection: string[], filePath: string[]) => [...collection, ...filePath], []);
      };
      const _allFilePaths = await _collectedAllFilePaths(_dirPath);
      const _includedFilePaths = _allFilePaths
        .filter((fPath: string) => !this._excludePath(this._pathFromRoot(fPath), options));
      if (!_includedFilePaths.length) {
        return;
      }
      _hash = _hash || createHash(dirAlgorithm);
      _hash.update(path.basename(_dirPath));
      const _files = await pfs.readdirAsync(_dirPath);
      for (const file of _files) {
        await _callback(file);
      }
      return _hash;
    };
    const _finalHash = await _recurse(dirPath || rootDirPath, dirAlgorithm);
    return _finalHash ? `${dirAlgorithm}-${_finalHash.digest(encoding)}` : '';
  }

  /** @internal */
  private static async _computeHashVerbosely(options: INormalizedIntegrityOptions, rootDirPath: string)
    : Promise<IVerboseHashObject> {
    const _recurseVerbosely = async (dirPath: string): Promise<IVerboseHashObject> => {
      const _callback = async (filename: string, contents: IHashObject): Promise<void> => {
        const _curPath = path.join(dirPath, filename);
        const _curPathStats: Stats = await pfs.lstatAsync(_curPath);
        if (_curPathStats.isDirectory()) {
          const _hashObj = await _recurseVerbosely(_curPath);
          if (!Reflect.ownKeys(_hashObj.contents).length) {
            return;
          }
          Object.assign(contents, { [path.basename(_curPath)]: _hashObj });
        }
        if (_curPathStats.isFile()) {
          if (this._excludePath(this._pathFromRoot(_curPath), options)) {
            return;
          }
          Object.assign(contents, await this.createFileHash(_curPath, options.cryptoOptions));
        }
      };
      const _verbHashObj: IVerboseHashObject = { contents: {}, hash: '' };
      const _files = await pfs.readdirAsync(dirPath);
      for (const file of _files) {
        await _callback(file, _verbHashObj.contents);
      }
      if (Reflect.ownKeys(_verbHashObj.contents).length) {
        _verbHashObj.hash = await this._computeHash(options, rootDirPath, dirPath);
      }
      return _verbHashObj;
    };
    return _recurseVerbosely(rootDirPath);
  }

  /** @internal */
  private static _pathFromRoot(directory: string): string {
    return directory.replace(this._rootDirPath, '');
  }

  /** @internal */
  private static async _validate(data: IntegrityObject): Promise<void> {
    const _path = path.resolve(__dirname, `../schemas/v${data.version}/schema.json`);
    if (!(await pfs.existsAsync(_path))) {
      throw new Error(`EINVER: Invalid schema version, 'version: ${data.version}'`);
    }
    const _schema = await pfs.readFileAsync(_path, 'utf8') as string;
    const _validator = new ajv();
    _validator.validate(utils.parseJSON(_schema) as object, data);
    if (_validator.errors) {
      throw new Error(`EVALER: ${_validator.errorsText()}`);
    }
  }
}
