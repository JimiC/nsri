import { HexBase64Latin1Encoding } from 'crypto';

export interface CryptoOptions {
  dirAlgorithm?: string;
  encoding?: HexBase64Latin1Encoding;
  fileAlgorithm?: string;
}
