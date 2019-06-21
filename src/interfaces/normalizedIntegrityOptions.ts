import { ICryptoOptions } from './cryptoOptions';

/** @internal */
export interface INormalizedIntegrityOptions {
  cryptoOptions: ICryptoOptions;
  verbose: boolean;
  strict: boolean;
  exclude: string[];
  include: string[];
}
