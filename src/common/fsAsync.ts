import fs from 'fs';
import { promisify } from 'util';

/** @internal */
export const existsAsync = promisify(fs.exists);

/** @internal */
export const lstatAsync = promisify(fs.lstat);

/** @internal */
export const readdirAsync = promisify(fs.readdir);

/** @internal */
export const readFileAsync = promisify(fs.readFile);

/** @internal */
export const writeFileAsync = promisify(fs.writeFile);
