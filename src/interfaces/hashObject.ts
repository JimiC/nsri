import { IVerboseHashObject } from './verboseHashObject';

export interface IHashObject {
  [key: string]: string | IVerboseHashObject;
}
