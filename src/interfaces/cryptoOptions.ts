import { HexBase64Latin1Encoding } from 'crypto';

export interface ICryptoOptions {
  dirAlgorithm?: string;
  encoding?: HexBase64Latin1Encoding;
  fileAlgorithm?: string;
}
