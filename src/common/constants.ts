import { HexBase64Latin1Encoding } from 'crypto';
import { CryptoEncoding } from './enums';

/** @internal */
export const integrityFilename = '.integrity.json';

/** @internal */
export const manifestFile = 'package.json';

/** @internal */
export const defaultFileCryptoAlgorithm = 'sha1';

/** @internal */
export const defaultDirCryptoAlgorithm = 'sha512';

/** @internal */
export const defaultCryptoEncoding: HexBase64Latin1Encoding = CryptoEncoding.Base64;

/** @internal */
export const defaultExclutions = [
  `${integrityFilename}`,
  '.git*',
  '.hg*',
  '.svn*',
  'node_modules',
];
