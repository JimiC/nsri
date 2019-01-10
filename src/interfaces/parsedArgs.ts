/** @internal */
export interface IParsedArgs {
  command: string;
  dirAlgorithm: string;
  encoding: string;
  exclude: string[];
  fileAlgorithm: string;
  inPath: string;
  integrity: string;
  manifest: boolean;
  outPath: string;
  verbose: boolean;
}
