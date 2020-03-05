import { Spinner } from '../interfaces/spinner';

/** @internal */
export abstract class BaseLogger {
  public abstract log(...args: unknown[]): void;

  public abstract error(...args: unknown[]): void;

  public abstract updateLog(...args: unknown[]): void;

  public abstract spinnerLogStart(...args: unknown[]): Spinner;

  public abstract spinnerLogStop(spinner: Spinner, ...args: unknown[]): void;
}
