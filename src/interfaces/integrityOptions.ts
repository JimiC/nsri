import { ICryptoOptions } from './cryptoOptions';

export interface IntegrityOptions {
  cryptoOptions?: ICryptoOptions;
  verbose?: boolean;
  exclude?: string[];
}
