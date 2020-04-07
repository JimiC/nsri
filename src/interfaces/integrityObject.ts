import { HashObject } from './hashObject';
import { IndexedObject } from './indexedObject';

/** @public */
export interface IntegrityObject extends IndexedObject {
  version: string;
  hashes: HashObject;
}
