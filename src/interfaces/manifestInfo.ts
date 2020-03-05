import detectIndent = require('detect-indent');
import { IndexedObject } from './indexedObject';

/** @internal */
export interface ManifestInfo {
  indentation: detectIndent.Indent;
  manifest: IndexedObject;
}
