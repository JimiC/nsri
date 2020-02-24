import { HexBase64Latin1Encoding } from 'crypto';

/** @internal */
export interface NormalizedCryptoOptions {
  dirAlgorithm: string;
  encoding: HexBase64Latin1Encoding;
  fileAlgorithm: string;
}
