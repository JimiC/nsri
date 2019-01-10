import { ISpinner } from '../interfaces/spinner';

/** @internal */
export abstract class BaseLogger {
  public abstract log(...args: any[]): void;

  public abstract error(...args: any[]): void;

  public abstract updateLog(...args: any[]): void;

  public abstract spinnerLogStart(...args: any[]): ISpinner;

  public abstract spinnerLogStop(spinner: ISpinner, ...args: any[]): void;
}
