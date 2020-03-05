import { CryptoOptions } from './cryptoOptions';

export interface ConfigOptions {
  manifest?: string;
  source?: string;
  verbose?: string;
  cryptoOptions? : CryptoOptions;
  exclude?: string[];
  integrity?: string;
  output?: string;
}
