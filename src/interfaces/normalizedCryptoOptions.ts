import { BinaryToTextEncoding } from 'crypto';

/** @internal */
export interface NormalizedCryptoOptions {
  dirAlgorithm: string;
  encoding: BinaryToTextEncoding;
  fileAlgorithm: string;
}
