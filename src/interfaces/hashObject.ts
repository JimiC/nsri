import { VerboseHashObject } from './verboseHashObject';

export interface HashObject {
  [key: string]: string | VerboseHashObject;
}
