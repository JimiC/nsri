import { CryptoOptions } from './cryptoOptions';

/** @internal */
export interface ConfigOptions {
  manifest?: boolean;
  source?: string;
  verbose?: boolean;
  cryptoOptions? : CryptoOptions;
  exclude?: string[];
  integrity?: string;
  output?: string;
  strict?: boolean;
}
