import { getHashes } from 'crypto';
import detectIndent = require('detect-indent');
import { posix } from 'path';
import { IndexedObject } from '../interfaces/indexedObject';

/** @internal */
export const hexRegexPattern = /^(?:[a-f0-9])+$/;

/** @internal */
export const base64RegexPattern = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;

/** @internal */
export const latin1RegexPattern = /^(?:[\x00-\xFF])+$/;

/** @internal */
export function isSupportedHash(algorithm: string): boolean {
  return getHashes().some(hash => hash.toUpperCase() === algorithm.toUpperCase());
}

/** @internal */
export function getAbsolutePath(array: string[], index: number): string {
  const _root = process.platform !== 'win32' && array[0] !== '/' ? '/' : '';
  return posix.join(_root, ...array.slice(0, index + 1));
}

/** @internal */
export function parseJSON(data: string | Buffer): IndexedObject | null {
  try {
    const _text = Buffer.isBuffer(data) ? data.toString() : data as string;
    return JSON.parse(_text);
  } catch (err) {
    return null;
  }
}

/** @internal */
export function sortObject(obj: IndexedObject): IndexedObject {
  return Object.keys(obj)
    .sort()
    .reduce((p: IndexedObject, c: string) => {
      p[c] = obj[c];
      return p;
    }, {});
}

/** @internal */
export async function asyncForEach(array: any[], callback: (...args: any[]) => any): Promise<void> {
  for (let _index = 0; _index < array.length; _index++) {
    await callback(array[_index], _index, array);
  }
}

/** @internal */
export const promisifyArgumentNames = Symbol('__CUSTOM-ARGUMENTS__');

/** @internal */
export function promisify<T>(func: (...args: any[]) => any): (...args: any[]) => Promise<T> {
  if (!(typeof func === 'function')) {
    throw new TypeError('Argument to promisify must be a function');
  }
  const _argumentNames = (func as IndexedObject)[typeof promisifyArgumentNames];
  return (...args: any[]): Promise<T> => {
    return new Promise((res, rej): void => {
      const _cb = (err: any, ...values: any[]): void => {
        if (err instanceof Error) { return rej(err); }
        if (typeof err === 'boolean') { values = [err, ...values]; }
        if (values.length === 1 || !_argumentNames) { return res(values[0]); }
        const obj: IndexedObject = {};
        values.forEach((value, index) => {
          const _name = _argumentNames[index];
          if (_name) { obj[_name] = value; }
        });
        res(obj as T);
      };
      args.push(_cb);
      func(...args);
    });
  };
}

/** @internal */
export function getIndentation(text: string): detectIndent.Indent {
  return detectIndent(text);
}
