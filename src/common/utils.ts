import { getHashes } from 'crypto';
import detectIndent = require('detect-indent');
import { IndexedObject } from '../interfaces/indexedObject';

/** @internal */
export const hexRegexPattern = /^(?:[a-f0-9])+$/;

/** @internal */
export const base64RegexPattern = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;

/** @internal */
export const latin1RegexPattern = /^(?:[\x00-\xFF])+$/;

/** @internal */
export function isSupportedHash(algorithm: string): boolean {
  return getHashes().some((hash: string): boolean => hash.toUpperCase() === algorithm.toUpperCase());
}

/** @internal */
export function parseJSON(data: string | Buffer): IndexedObject | null {
  try {
    const text = Buffer.isBuffer(data) ? data.toString() : data as string;
    return JSON.parse(text);
  } catch (err) {
    return null;
  }
}

/** @internal */
export function sortObject(obj: IndexedObject): IndexedObject {
  return Object.keys(obj)
    .sort()
    .reduce((p: IndexedObject, c: string): IndexedObject => {
      p[c] = obj[c];
      return p;
    }, {});
}

/** @internal */
export function getIndentation(text: string): detectIndent.Indent {
  return detectIndent(text);
}

/** @internal */
export function normalizeEntries(entries: string[]): string[] {
  return entries
    .map((entry: string): string => entry.trim())
    .filter((entry: string): boolean => !!entry && !/^\s*#/.test(entry));
}

/** @internal */
export function unique(entries: string[]): string[] {
  return entries.filter((entry: string, index: number, array: string[]): boolean =>
    array.indexOf(entry) === index);
}
