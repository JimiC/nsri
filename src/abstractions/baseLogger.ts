import { Spinner } from '../interfaces/spinner';

/** @internal */
export abstract class BaseLogger {
  public abstract log(...args: any[]): void;

  public abstract error(...args: any[]): void;

  public abstract updateLog(...args: any[]): void;

  public abstract spinnerLogStart(...args: any[]): Spinner;

  public abstract spinnerLogStop(spinner: Spinner, ...args: any[]): void;
}
