import { CryptoOptions } from './cryptoOptions';

/** @public */
export interface IntegrityOptions {
  cryptoOptions?: CryptoOptions;
  verbose?: boolean;
  strict?: boolean;
  exclude?: string[];
}
