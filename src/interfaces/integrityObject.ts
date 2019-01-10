import { IHashObject } from './hashObject';

export interface IntegrityObject {
  version: string;
  hashes: IHashObject;
}
