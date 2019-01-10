import { ICryptoOptions } from './cryptoOptions';

/** @internal */
export interface INormalizedIntegrityOptions {
  cryptoOptions: ICryptoOptions;
  verbose: boolean;
  exclude: string[];
  include: string[];
}
