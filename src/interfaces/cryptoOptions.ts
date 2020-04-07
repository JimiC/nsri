import { HexBase64Latin1Encoding } from 'crypto';

/** @public */
export interface CryptoOptions {
  dirAlgorithm?: string;
  encoding?: HexBase64Latin1Encoding;
  fileAlgorithm?: string;
}
