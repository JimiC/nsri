import { ICryptoOptions } from './cryptoOptions';

export interface IntegrityOptions {
  cryptoOptions?: ICryptoOptions;
  verbose?: boolean;
  strict?: boolean;
  exclude?: string[];
}
