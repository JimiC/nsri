import { HashObject } from './hashObject';

/** @public */
export interface IntegrityObject extends Record<string, unknown>  {
  version: string;
  hashes: HashObject;
}
