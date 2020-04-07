// eslint-disable-next-line import/default
import detectIndent from 'detect-indent';
import { IndexedObject } from './indexedObject';

/** @internal */
export interface ManifestInfo {
  indentation: detectIndent.Indent;
  manifest: IndexedObject;
}
