import { CryptoOptions } from './cryptoOptions';

/** @public */
export interface IntegrityOptions {
  cryptoOptions?: CryptoOptions;
  verbose?: boolean;
  exclude?: string[];
  strict?: boolean;
}
