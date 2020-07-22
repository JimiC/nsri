/* eslint-disable @typescript-eslint/unified-signatures */
import ajv from 'ajv';
import { createHash, getHashes, Hash, HexBase64Latin1Encoding } from 'crypto';
import { createReadStream, Stats } from 'fs';
import mm from 'minimatch';
import * as path from 'path';
import { ConfigExplorer } from '../common/configExplorer';
import * as constants from '../common/constants';
import { CryptoEncoding } from '../common/enums';
import * as pfs from '../common/fsAsync';
import * as utils from '../common/utils';
import { CryptoOptions } from '../interfaces/cryptoOptions';
import { HashObject } from '../interfaces/hashObject';
import { IndexedObject } from '../interfaces/indexedObject';
import { IntegrityObject } from '../interfaces/integrityObject';
import { IntegrityOptions } from '../interfaces/integrityOptions';
import { ManifestInfo } from '../interfaces/manifestInfo';
import { NormalizedCryptoOptions } from '../interfaces/normalizedCryptoOptions';
import { NormalizedIntegrityOptions } from '../interfaces/normalizedIntegrityOptions';
import { VerboseHashObject } from '../interfaces/verboseHashObject';

/** @public */
const CURRENT_SCHEMA_VERSION = '1';

/** @public */
export class Integrity {

  /** @internal */
  // ['hex', 'base64', 'latin1']
  private static readonly allowedCryptoEncodings = Object.keys(CryptoEncoding)
    .map<string>((k: string): string => CryptoEncoding[k as keyof typeof CryptoEncoding]);

  /** @internal */
  private static rootDirPath = '';

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
    const strict = options ? options.strict : undefined;
    if (!options || !options.cryptoOptions ||
      !options.cryptoOptions.fileAlgorithm ||
      !options.cryptoOptions.dirAlgorithm ||
      !options.cryptoOptions.encoding
    ) {
      options = await this.detectOptions(fileOrDirPath, integrity, strict);
      options.exclude = exclude;
      options.strict = strict || options.strict;
      options.verbose = verbose || options.verbose;
    }
    const intObj = await Integrity.create(fileOrDirPath, options);
    let integrityObj: IntegrityObject;
    // 'integrity' is a file or directory path
    if (await pfs.existsAsync(integrity)) {
      integrity = await this.pathCheck(integrity);
      const content = await pfs.readFileAsync(integrity, 'utf8');
      integrityObj = utils.parseJSONSafe<IntegrityObject>(content);
      await this.validate(integrityObj);
      return this.verify(intObj, integrityObj, fileOrDirPath, path.dirname(integrity));
    }
    // 'integrity' is a stringified JSON
    integrityObj = utils.parseJSONSafe<IntegrityObject>(integrity);
    // 'integrity' is a hash
    if (!integrityObj || !Object.keys(integrityObj).length) {
      const ls = await pfs.lstatAsync(fileOrDirPath);
      const basename = ls.isFile() || options.strict ? path.basename(fileOrDirPath) : '.';
      integrityObj = {
        hashes: {
          [basename]: integrity,
        },
        version: CURRENT_SCHEMA_VERSION,
      };
    }
    await this.validate(integrityObj);
    return this.verify(intObj, integrityObj);
  }

  public static async create(fileOrDirPath: string, options?: IntegrityOptions): Promise<IntegrityObject> {
    const ls: Stats = await pfs.lstatAsync(fileOrDirPath);
    const obj: IntegrityObject = { version: CURRENT_SCHEMA_VERSION, hashes: {} };
    if (ls.isDirectory()) {
      obj.hashes = await Integrity.createDirHash(fileOrDirPath, options);
    }
    if (ls.isFile()) {
      const { cryptoOptions } = this.normalizeOptions(options);
      obj.hashes = await Integrity.createFileHash(fileOrDirPath, cryptoOptions);
    }
    return obj;
  }

  public static async createDirHash(dirPath: string, options?: IntegrityOptions): Promise<HashObject> {
    dirPath = path.isAbsolute(dirPath) ? dirPath : path.resolve(dirPath);
    this.rootDirPath = dirPath;
    const ls: Stats = await pfs.lstatAsync(dirPath);
    if (!ls.isDirectory()) {
      throw new Error(`ENOTDIR: not a directory, '${dirPath}'`);
    }
    const nomOptions = this.normalizeOptions(options);
    const hashes: string | VerboseHashObject = nomOptions.verbose
      ? await this.computeHashVerbosely(nomOptions, dirPath)
      : await this.computeHash(nomOptions, dirPath);
    const hasHashes = typeof hashes === 'string' ? !!hashes : !!hashes.hash;
    const dirName = options && options.strict ? path.basename(dirPath) : '.';
    return hasHashes ? { [dirName]: hashes } : {};
  }

  public static async createFileHash(filePath: string, options?: CryptoOptions): Promise<HashObject> {
    filePath = path.isAbsolute(filePath) ? filePath : path.resolve(filePath);
    const ls: Stats = await pfs.lstatAsync(filePath);
    if (!ls.isFile()) {
      throw new Error(`ENOTFILE: not a file, '${path.basename(filePath)}'`);
    }
    if (path.basename(filePath) === constants.integrityFilename) {
      throw new Error(`ENOTALW: file not allowed, '${path.basename(filePath)}'`);
    }
    const { fileAlgorithm, encoding } = this.normalizeCryptoOptions(options);
    const hash = await this.computeStreamHash(filePath, createHash(fileAlgorithm), fileAlgorithm, encoding);
    return { [path.basename(filePath)]: hash };
  }

  public static async createFilesHash(filenames: string[], options?: CryptoOptions): Promise<HashObject> {
    const hashObj: HashObject = {};
    const callback = async (file: string, obj: HashObject): Promise<void> => {
      Object.assign(obj, await this.createFileHash(file, options));
    };
    for (const file of filenames) {
      await callback(file, hashObj);
    }
    return hashObj;
  }

  public static persist(intObj: IntegrityObject, dirPath = './', prettify = false): Promise<void> {
    const filePath = path.resolve(dirPath, constants.integrityFilename);
    return pfs.writeFileAsync(filePath, JSON.stringify(intObj, null, prettify ? 2 : 0));
  }

  public static async getManifestIntegrity(dirPath = './'): Promise<string> {
    const obj = await this.getManifestInfo(dirPath);
    const data = JSON.stringify(obj.manifest.integrity, null, obj.indentation.indent || obj.indentation.amount);
    return Promise.resolve(data);
  }

  public static async updateManifestIntegrity(intObj: IntegrityObject, dirPath = './'): Promise<void> {
    const obj = await this.getManifestInfo(dirPath);
    obj.manifest.integrity = intObj;
    const data = JSON.stringify(obj.manifest, null, obj.indentation.indent || obj.indentation.amount);
    const manifestFilePath = path.resolve(dirPath, constants.manifestFile);
    return pfs.writeFileAsync(manifestFilePath, data);
  }

  public static async getIntegrityOptionsFromConfig(): Promise<IntegrityOptions> {
    const explorer = new ConfigExplorer();
    const config = await explorer.getConfig();
    if (!Object.keys(config).length) {
      return Promise.resolve({});
    }
    return {
      cryptoOptions: {
        dirAlgorithm: config.cryptoOptions && config.cryptoOptions.dirAlgorithm,
        encoding: config.cryptoOptions && config.cryptoOptions.encoding,
        fileAlgorithm: config.cryptoOptions && config.cryptoOptions.fileAlgorithm,
      },
      exclude: config.exclude,
      verbose: config.verbose,
      strict: config.strict,
    };
  }

  public static async getExclusionsFromIgnoreFile(dirPath = './'): Promise<string[]> {
    const ignoreFilePath = path.resolve(dirPath, constants.ignoreFile);
    const ignoreFileExists = await pfs.existsAsync(ignoreFilePath);
    if (!ignoreFileExists) {
      return [];
    }
    const ignoreRaw: string = await pfs.readFileAsync(ignoreFilePath, 'utf8');
    return utils.normalizeEntries(ignoreRaw.split(/[\n\r]/));
  }

  /** @internal */
  private static async getManifestInfo(dirPath: string): Promise<ManifestInfo> {
    const manifestFilePath = path.resolve(dirPath, constants.manifestFile);
    if (!(await pfs.existsAsync(manifestFilePath))) {
      return Promise.reject(`Error: '${constants.manifestFile}' not found.`);
    }
    const content = await pfs.readFileAsync(manifestFilePath, 'utf8');
    const manifest = utils.parseJSONSafe<IndexedObject>(content);
    if (!manifest || !Object.keys(manifest).length) {
      return Promise.reject('Error: Manifest not found');
    }
    return {
      indentation: utils.getIndentation(content),
      manifest,
    };
  }

  /** @internal */
  private static async detectOptions(
    inPath: string,
    integrity: string,
    strict: boolean | undefined,
  ): Promise<IntegrityOptions> {
    const ls = await pfs.lstatAsync(inPath);
    // get the integrity object
    let integrityObj: IntegrityObject;
    const basename = ls.isFile() || strict ? path.basename(inPath) : '.';
    // 'integrity' is a file or directory path
    if (await pfs.existsAsync(integrity)) {
      integrity = await this.pathCheck(integrity);
      const content = await pfs.readFileAsync(integrity, 'utf8');
      integrityObj = utils.parseJSONSafe<IntegrityObject>(content);
    } else {
      // 'integrity' is a stringified JSON
      integrityObj = utils.parseJSONSafe<IntegrityObject>(integrity);
      // 'integrity' is a hash
      if (!integrityObj || !Object.keys(integrityObj).length) {
        integrityObj = {
          hashes: {
            [basename]: integrity,
          },
          version: CURRENT_SCHEMA_VERSION,
        };
      }
    }
    const options: IntegrityOptions = {};
    if (!integrityObj || !integrityObj.hashes) {
      return options;
    }
    await this.validate(integrityObj);
    const first: string | VerboseHashObject = integrityObj.hashes[basename];
    if (!first) {
      return options;
    }
    // detect strict
    options.strict = basename !== '.';
    // detect verbosity
    options.verbose = typeof first !== 'string';
    // detect options
    options.cryptoOptions = await this.detectCryptoOptions(first, inPath);
    return options;
  }

  /** @internal */
  private static async detectCryptoOptions(
    firstElement: string | VerboseHashObject,
    inPath: string): Promise<CryptoOptions> {
    const cryptoOptions: CryptoOptions = {};
    // find integrity members
    const getIntegrityMembers = (hash: string): RegExpMatchArray | null =>
      hash ? /^([a-zA-Z0-9-]*)-([\s\S]*)/.exec(hash) : null;
    const firstHash: string = typeof firstElement === 'string' ? firstElement : firstElement.hash;
    const integrityMembers = getIntegrityMembers(firstHash);
    if (!integrityMembers || !integrityMembers.length) {
      return cryptoOptions;
    }
    // detect encoding
    const enc = integrityMembers[2];
    const encoding: HexBase64Latin1Encoding | undefined =
      utils.hexRegexPattern.test(enc)
        ? CryptoEncoding.hex
        : utils.base64RegexPattern.test(enc)
          ? CryptoEncoding.base64
          : utils.latin1RegexPattern.test(enc)
            ? CryptoEncoding.latin1
            : undefined;
    if (!encoding) {
      return cryptoOptions;
    }
    cryptoOptions.encoding = encoding;
    // detect dirAlgorithm
    const cryptoHashes = getHashes();
    const stat = await pfs.lstatAsync(inPath);
    cryptoOptions.dirAlgorithm = stat.isDirectory()
      ? cryptoHashes.find((algorithm: string): boolean => algorithm === integrityMembers[1])
      : undefined;
    // detect fileAlgorithm
    const findFileAlgorithm = async (
      content: HashObject,
      pathTo: string,
    ): Promise<string | undefined> => {
      for (const key of Object.keys(content)) {
        const hash: string | VerboseHashObject = content[key];
        const pathToContent: string = path.join(pathTo, key);
        if (!await pfs.existsAsync(pathToContent)) {
          continue;
        }
        // it's a directory
        if (typeof hash !== 'string') {
          return (await pfs.lstatAsync(pathToContent)).isDirectory()
            ? findFileAlgorithm(hash.contents, pathToContent)
            : undefined;
        }
        // it's a file
        const integrityMember = getIntegrityMembers(hash);
        if (!integrityMember) {
          return undefined;
        }
        return integrityMember[1];
      }
      return undefined;
    };
    cryptoOptions.fileAlgorithm = stat.isFile() || typeof firstElement === 'string'
      ? cryptoHashes.find((algorithm: string): boolean => algorithm === integrityMembers[1])
      : await findFileAlgorithm(firstElement.contents, inPath);
    return cryptoOptions;
  }

  /** @internal */
  private static normalizeCryptoOptions(options?: CryptoOptions): NormalizedCryptoOptions {
    const check = (cryptoOptions?: CryptoOptions): NormalizedCryptoOptions | undefined => {
      if (!cryptoOptions) {
        return cryptoOptions;
      }
      if (cryptoOptions.fileAlgorithm && !utils.isSupportedHash(cryptoOptions.fileAlgorithm)) {
        throw new Error(`ENOSUP: Hash algorithm not supported: '${cryptoOptions.fileAlgorithm}'`);
      }
      if (cryptoOptions.dirAlgorithm && !utils.isSupportedHash(cryptoOptions.dirAlgorithm)) {
        throw new Error(`ENOSUP: Hash algorithm not supported: '${cryptoOptions.dirAlgorithm}'`);
      }
      if (cryptoOptions.encoding && !this.allowedCryptoEncodings.includes(cryptoOptions.encoding.toLowerCase())) {
        throw new Error(`ENOSUP: Hash encoding not supported: '${cryptoOptions.encoding}'`);
      }
      return {
        dirAlgorithm: cryptoOptions.dirAlgorithm || constants.defaultDirCryptoAlgorithm,
        encoding: cryptoOptions.encoding || constants.defaultCryptoEncoding,
        fileAlgorithm: cryptoOptions.fileAlgorithm || constants.defaultFileCryptoAlgorithm,
      };
    };
    return check(options) || {
      dirAlgorithm: constants.defaultDirCryptoAlgorithm,
      encoding: constants.defaultCryptoEncoding,
      fileAlgorithm: constants.defaultFileCryptoAlgorithm,
    };
  }

  /** @internal */
  private static normalizeOptions(options?: IntegrityOptions): NormalizedIntegrityOptions {
    const getExclusions = (exclusions: string[]): { include: string[]; exclude: string[] } => {
      const commentsPattern = /^\s*#/;
      let filteredExclude = exclusions.filter((excl: string): boolean => !!excl && !commentsPattern.test(excl));
      const directoryPattern = /(^|\/)[^/]*\*[^/]*$/;
      filteredExclude = [...filteredExclude, ...filteredExclude
        .filter((excl: string): boolean => !directoryPattern.test(excl))
        .map((excl: string): string => excl.endsWith('/') ? `${excl}**` : `${excl}/**`)];
      const negatePattern = /^\s*!/;
      const filteredInclude = filteredExclude
        .filter((excl: string): boolean => negatePattern.test(excl))
        .map((excl: string): string => excl.slice(1));
      filteredExclude = [
        ...filteredExclude.filter((excl: string): boolean => !negatePattern.test(excl)),
        ...constants.defaultExclusions,
      ];
      return {
        exclude: filteredExclude,
        include: filteredInclude,
      };
    };
    const cryptoOptions = this.normalizeCryptoOptions(options && options.cryptoOptions);
    const { exclude, include } = getExclusions((options && options.exclude) || []);
    const verbose = options && options.verbose !== undefined
      ? options.verbose
      : false;
    const strict = options && options.strict !== undefined
      ? options.strict
      : false;
    return {
      cryptoOptions,
      exclude,
      include,
      strict,
      verbose,
    };
  }

  /** @internal */
  private static async pathCheck(integrityPath: string): Promise<string> {
    const ls: Stats = await pfs.lstatAsync(integrityPath);
    if (ls.isDirectory()) {
      return path.join(integrityPath, constants.integrityFilename);
    }
    if (ls.isFile()) {
      if (path.basename(integrityPath) !== constants.integrityFilename) {
        throw new Error(`EINVNAME: filename must be '${constants.integrityFilename}'`);
      }
      return integrityPath;
    }
    throw new Error(`ENOSUP: path not supported: '${integrityPath}'`);
  }

  /** @internal */
  private static verify(
    intObj: IntegrityObject,
    integrity: IntegrityObject,
    sourceDirPath?: string,
    integrityDirPath?: string,
  ): boolean {
    if (!intObj) {
      return false;
    }
    if (intObj.version !== integrity.version) {
      throw new Error('EINVER: Incompatible versions check');
    }
    const equals = (obj1: IntegrityObject, obj2: IntegrityObject): boolean =>
      !!obj1 && !!obj2 && JSON.stringify(utils.sortObject(obj1)) === JSON.stringify(utils.sortObject(obj2));
    const getNodeOrDefault = (obj: HashObject, element: string): string | VerboseHashObject =>
      obj[element] || obj[Object.keys(obj)[0]] || '';
    const findHash = (array: string[], hashObj: HashObject): boolean => {
      if (array.length === 1) {
        const integrityHash: string | VerboseHashObject = getNodeOrDefault(hashObj, array[0]);
        const hashedObjHash: string | VerboseHashObject = getNodeOrDefault(intObj.hashes, array[0]);
        return typeof integrityHash === 'string'
          ? typeof hashedObjHash === 'string'
            ? integrityHash === hashedObjHash
            : integrityHash === hashedObjHash.hash
          : typeof hashedObjHash === 'string'
            ? integrityHash.hash === hashedObjHash
            : integrityHash.hash === hashedObjHash.hash;
      }
      const rootHash: string | VerboseHashObject = getNodeOrDefault(hashObj, array[0]);
      // non-verbosely directory hash
      if (typeof rootHash === 'string') {
        return rootHash === getNodeOrDefault(intObj.hashes, array[0]);
      }
      // verbosely directory hash
      const subDir: string | undefined =
        Object.keys(rootHash.contents).find((key: string): boolean => key === array[1]);
      array = subDir ? array.splice(1) : [];
      return array.length ? findHash(array, rootHash.contents) : false;
    };
    const dirNameList = `.${path.sep}${path.relative(integrityDirPath || '', sourceDirPath || '')}`
      .split(path.sep)
      .filter((dir: string): string => dir);
    const deepEquals = (): boolean =>
      sourceDirPath && integrityDirPath ? findHash(dirNameList, integrity.hashes) : false;
    const isEqual: boolean = equals(intObj, integrity);
    const isDeepEqual: boolean = deepEquals();
    return isEqual || isDeepEqual;
  }

  /** @internal */
  private static match = (target: string, pattern: string): boolean =>
    mm(target, pattern, { dot: true });

  /** @internal */
  private static excludePath(curPath: string, options: NormalizedIntegrityOptions): boolean {
    const exclude = options.exclude.some((excl: string): boolean => this.match(curPath, excl));
    const include = options.include.some((incl: string): boolean => this.match(curPath, incl));
    const defaultExclude = constants.defaultExclusions.some((excl: string): boolean => this.match(curPath, excl));
    const result = exclude && (!include || defaultExclude);
    return result;
  }

  /** @internal */
  private static computeStreamHash(
    filePath: string,
    hash: Hash,
    algorithm: string,
    encoding?: HexBase64Latin1Encoding): Promise<string> {
    return new Promise((res, rej): void => {
      const result = (): void => res(encoding
        ? `${algorithm}-${hash.digest(encoding)}`
        : '');
      hash.update(path.basename(filePath));
      createReadStream(filePath)
        .on('error', (error: unknown): void => rej(error))
        .on('data', (chunk: string): Hash => hash.update(chunk))
        .on('end', result);
    });
  }

  /** @internal */
  private static async computeHash(
    options: NormalizedIntegrityOptions,
    rootDirPath: string,
    dirPath?: string,
  ): Promise<string> {
    const { dirAlgorithm, encoding }: NormalizedCryptoOptions = this.normalizeCryptoOptions(options.cryptoOptions);
    const recurse = async (currDirPath: string, algorithm: string, hash?: Hash): Promise<Hash | undefined> => {
      const callback = async (filename: string): Promise<void> => {
        const curPath = path.join(currDirPath, filename);
        const curPathStats: Stats = await pfs.lstatAsync(curPath);
        if (curPathStats.isDirectory()) {
          await recurse(curPath, algorithm, hash);
        }
        if (curPathStats.isFile()) {
          if (this.excludePath(this.pathFromRoot(curPath), options)) {
            return;
          }
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          await this.computeStreamHash(curPath, hash!, algorithm);
        }
      };
      const collectedAllFilePaths = async (directoryPath: string): Promise<string[]> => {
        const subDirs: string[] = await pfs.readdirAsync(directoryPath);
        const iterator = async (subDir: string): Promise<string[]> => {
          const resolvedPath = path.resolve(directoryPath, subDir);
          const ls = await pfs.lstatAsync(resolvedPath);
          return ls.isDirectory()
            ? collectedAllFilePaths(resolvedPath)
            : [resolvedPath];
        };
        const promises: Array<Promise<string[]>> = subDirs.map(iterator);
        const filePaths: string[][] = await Promise.all(promises);
        return filePaths.reduce((
          collection: string[],
          filePath: string[]): string[] => [...collection, ...filePath], []);
      };
      const allFilePaths = await collectedAllFilePaths(currDirPath);
      const includedFilePaths = allFilePaths
        .filter((filePath: string): boolean => !this.excludePath(this.pathFromRoot(filePath), options));
      if (!includedFilePaths.length) {
        return;
      }
      hash = hash || createHash(dirAlgorithm);
      const dirName = options.strict || this.rootDirPath !== currDirPath ? path.basename(currDirPath) : '.';
      hash.update(dirName);
      const files: string[] = (await pfs.readdirAsync(currDirPath)).sort();
      for (const file of files) {
        await callback(file);
      }
      return hash;
    };
    const finalHash = await recurse(dirPath || rootDirPath, dirAlgorithm);
    return finalHash ? `${dirAlgorithm}-${finalHash.digest(encoding)}` : '';
  }

  /** @internal */
  private static async computeHashVerbosely(
    options: NormalizedIntegrityOptions,
    rootDirPath: string): Promise<VerboseHashObject> {
    const recurseVerbosely = async (dirPath: string): Promise<VerboseHashObject> => {
      const callback = async (filename: string, contents: HashObject): Promise<void> => {
        const curPath = path.join(dirPath, filename);
        const curPathStats: Stats = await pfs.lstatAsync(curPath);
        if (curPathStats.isDirectory()) {
          const hashObj = await recurseVerbosely(curPath);
          if (!Reflect.ownKeys(hashObj.contents).length) {
            return;
          }
          Object.assign(contents, { [path.basename(curPath)]: hashObj });
        }
        if (curPathStats.isFile()) {
          if (this.excludePath(this.pathFromRoot(curPath), options)) {
            return;
          }
          Object.assign(contents, await this.createFileHash(curPath, options.cryptoOptions));
        }
      };
      const verbHashObj: VerboseHashObject = { contents: {}, hash: '' };
      const files: string[] = (await pfs.readdirAsync(dirPath)).sort();
      for (const file of files) {
        await callback(file, verbHashObj.contents);
      }
      if (Reflect.ownKeys(verbHashObj.contents).length) {
        verbHashObj.hash = await this.computeHash(options, rootDirPath, dirPath);
      }
      return verbHashObj;
    };
    return recurseVerbosely(rootDirPath);
  }

  /** @internal */
  private static pathFromRoot(directory: string): string {
    return directory.replace(`${this.rootDirPath}${path.sep}`, '');
  }

  /** @internal */
  private static async validate(data: IntegrityObject): Promise<void> {
    let schema: Record<string, unknown>;
    try {
      schema = await import(`./schemas/v${data.version}/schema.json`) as Record<string, unknown>;
    } catch {
      throw new Error(`EINVER: Invalid schema version: '${data.version}'`);
    }
    const validator = new ajv();
    await validator.validate(schema, data);
    if (validator.errors) {
      throw new Error(`EVALER: ${validator.errorsText()}`);
    }
  }
}
