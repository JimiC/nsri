import { BinaryToTextEncoding } from 'crypto';
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
export const defaultCryptoEncoding: BinaryToTextEncoding = CryptoEncoding.base64;

/** @internal */
export const ignoreFile = '.nsriignore';

/** @internal */
export const defaultExclusions = [
  `**/${integrityFilename}`,
  '**/.git*',
  '**/.hg*',
  '**/.svn*',
  '**/node_modules/**',
];
