/** @internal */
export interface Arguments {
  _: Array<(string | number)>;
  $0: string;
  diralgorithm?: string;
  source?: string;
  encoding?: string;
  exclude?: string[];
  filealgorithm?: string;
  integrity?: string;
  manifest?: boolean;
  output?: string;
  pretty?: boolean;
  strict?: boolean;
  verbose?: boolean;
}
