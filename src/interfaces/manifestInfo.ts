import detectIndent from 'detect-indent';

/** @internal */
export interface ManifestInfo {
  indentation: detectIndent.Indent;
  manifest: Record<string, unknown> ;
}
