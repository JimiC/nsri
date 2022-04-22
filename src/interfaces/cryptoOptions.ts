import { BinaryToTextEncoding } from 'crypto';

/** @public */
export interface CryptoOptions {
  dirAlgorithm?: string;
  encoding?: BinaryToTextEncoding;
  fileAlgorithm?: string;
}
