import { CryptoOptions } from './cryptoOptions';

/** @internal */
export interface NormalizedIntegrityOptions {
  cryptoOptions: CryptoOptions;
  verbose: boolean;
  strict: boolean;
  exclude: string[];
  include: string[];
}
