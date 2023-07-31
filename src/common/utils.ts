import { getHashes } from 'crypto';
import detectIndent from 'detect-indent';

/** @internal */
export const hexRegexPattern = /^(?:[a-f0-9])+$/;

/** @internal */
export const base64RegexPattern = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;

/** @internal */
export const base64urlRegexPattern = /^(?:[A-Za-z0-9-_]{4})*(?:[A-Za-z0-9-_]{2}|[A-Za-z0-9-_]{3})?$/;

/** @internal */
export function isSupportedHash(algorithm: string): boolean {
  return getHashes().some((hash: string): boolean => hash.toUpperCase() === algorithm.toUpperCase());
}

/** @internal */
export function parseJSONSafe<T>(data: string | Buffer): T {
  try {
    const text = Buffer.isBuffer(data) ? data.toString() : data;
    return JSON.parse(text) as T;
  } catch {
    return {} as T;
  }
}

/** @internal */
export function sortObject(obj: Record<string, unknown>): Record<string, unknown>  {
  return Object.keys(obj)
    .sort()
    .reduce((p: Record<string, unknown>, c: string): Record<string, unknown>  => {
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
