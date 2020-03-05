import { HashObject } from './hashObject';
import { IndexedObject } from './indexedObject';

export interface IntegrityObject extends IndexedObject {
  version: string;
  hashes: HashObject;
}
