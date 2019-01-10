import { HexBase64Latin1Encoding } from 'crypto';

/** @internal */
export interface INormalizedCryptoOptions {
  dirAlgorithm: string;
  encoding: HexBase64Latin1Encoding;
  fileAlgorithm: string;
}
