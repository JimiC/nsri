import { VerboseHashObject } from './verboseHashObject';

/** @public */
export interface HashObject {
  [key: string]: string | VerboseHashObject;
}
