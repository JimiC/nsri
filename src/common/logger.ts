import readline, { ReadLine } from 'readline';
import { BaseLogger } from '../abstractions/baseLogger';
import { ISpinner } from '../interfaces/spinner';

/** @internal */
export class Logger extends BaseLogger {

  public eventEmitter: ReadLine;
  public frames: string[];
  public showSpinnerInFront: boolean;
  public spinnerInterval: number;

  private _countLines: number;

  public constructor() {
    super();
    this.eventEmitter = readline.createInterface(process.stdin, process.stdout);
    this.frames = ['- ', '\\ ', '| ', '/ '];
    this.showSpinnerInFront = true;
    this.spinnerInterval = 80;
    this._countLines = 1;
  }

  public log(message: string, groupId?: string): void {
    process.stdout.write(`${this._getHeader(groupId)}${message}\n`);
    this._countLines++;
  }

  public error(message: string, groupId?: string): void {
    process.stderr.write(`${this._getHeader(groupId)}${message}\n`);
    this._countLines++;
  }

  public updateLog(message: string, groupId?: string): void;
  public updateLog(message: string, line?: number, groupId?: string): void;
  public updateLog(message: string, lineOrGroupId?: number | string, groupId?: string): void {
    groupId = (typeof lineOrGroupId === 'string' && Number.isNaN(Number.parseInt(lineOrGroupId, 10)))
      ? lineOrGroupId as string
      : groupId;

    if (!process.stdout.isTTY) {
      process.stdout.write(`${this._getHeader(groupId)}${message}\n`);
      return;
    }

    const _line = (typeof lineOrGroupId === 'number' && !Number.isNaN(lineOrGroupId))
      ? lineOrGroupId as number
      : 1;
    this.moveCursorTo(-_line);
    readline.clearLine(process.stdout, 0);
    process.stdout.write(`${this._getHeader(groupId)}${message}`);
    this.moveCursorTo(_line);
  }

  public spinnerLogStart(message: string, groupId?: string): ISpinner {
    const _line = this._countLines;
    this.log(message, groupId);
    return { timer: this._spin(message, groupId, _line), line: _line };
  }

  public spinnerLogStop(spinner: ISpinner, message: string, groupId?: string): void {
    clearInterval(spinner.timer);
    this.updateLog(message, this._countLines - spinner.line, groupId);
    if (!process.stdout.isTTY) {
      return;
    }
    this._cursorShow();
  }

  public handleForcedExit(hasInfoLogging: boolean): void {
    if (!process.stdout.isTTY) {
      return process.exit();
    }
    const moveAndClear = (): void => {
      this.moveCursorTo(-1);
      readline.clearLine(process.stdout, 0);
    };
    readline.clearLine(process.stdout, 0);
    this.updateLog('');
    if (hasInfoLogging) {
      this.updateLog('', 2);
      moveAndClear();
    }
    moveAndClear();
    this._cursorShow();
    process.exit();
  }

  public moveCursorTo(line: number): void {
    if (!process.stdout.isTTY) {
      return;
    }
    readline.cursorTo(process.stdout, 0);
    readline.moveCursor(process.stdout, 0, line);
  }

  private _spin(message: string, groupId: string | undefined, line: number): NodeJS.Timer {
    if (!process.stdout.isTTY) {
      return setImmediate((): void => void 0);
    }
    let _index = 0;
    this._cursorHide();
    const iteration = (): void => {
      const _frame = this.frames[_index = ++_index % this.frames.length];
      const _msg = this.showSpinnerInFront
        ? `${this._getHeader(groupId)}${_frame}${message}`
        : `${this._getHeader(groupId)}${message}${_frame}`;
      this.updateLog(_msg, this._countLines - line);
    };
    iteration();
    return setInterval(iteration, this.spinnerInterval);
  }

  private _cursorShow(): void {
    process.stdout.write('\u001B[?25h');
  }

  private _cursorHide(): void {
    process.stdout.write('\u001B[?25l');
  }

  private _getHeader(groupId?: string): string {
    return groupId ? `[${groupId}]: ` : '';
  }
}
