import { exists, lstat, readdir, readFile, writeFile } from 'fs';
import { promisify } from 'util';

/** @internal */
export const existsAsync = promisify(exists);

/** @internal */
export const lstatAsync = promisify(lstat);

/** @internal */
export const readdirAsync = promisify(readdir);

/** @internal */
export const readFileAsync = promisify(readFile);

/** @internal */
export const writeFileAsync = promisify(writeFile);
