import { CryptoOptions } from './cryptoOptions';

export interface IntegrityOptions {
  cryptoOptions?: CryptoOptions;
  verbose?: boolean;
  strict?: boolean;
  exclude?: string[];
}
