/* eslint-disable no-unused-expressions */
import { expect } from 'chai';
import readline from 'readline';
import sinon, { createSandbox } from 'sinon';
import { Logger } from '../../src/common/logger';

describe('Logger: tests', (): void => {

  let sandbox: sinon.SinonSandbox;
  let logger: Logger;

  beforeEach((): void => {
    sandbox = createSandbox();
    logger = new Logger();
    process.stdout.setMaxListeners(Infinity);
    process.stdin.setMaxListeners(Infinity);
  });

  afterEach((): void => {
    sandbox.restore();
  });

  context('expects', (): void => {

    it('to correctly implement BaseLogger',
      (): void => {
        expect(logger).to.have.deep.property('constructor');
        expect(logger).to.have.deep.property('log');
        expect(logger).to.have.deep.property('error');
        expect(logger).to.have.deep.property('updateLog');
        expect(logger).to.have.deep.property('spinnerLogStart');
        expect(logger).to.have.deep.property('spinnerLogStop');
      });

    it(`to have own 'frames' property`,
      (): void => {
        expect(logger).to.haveOwnProperty('frames');
      });

    it(`to have own 'countLines' property`,
      (): void => {
        expect(logger).to.haveOwnProperty('countLines');
      });

    context('when calling', (): void => {

      let isTTY: boolean;
      let timer: sinon.SinonFakeTimers;

      beforeEach((): void => {
        isTTY = process.stdout.isTTY;
        timer = sandbox.useFakeTimers();
      });

      afterEach((): void => {
        process.stdout.isTTY = isTTY;
        timer.restore();
      });

      context(`function 'log'`, (): void => {

        it('the process stdout write function is called',
          (): void => {
            const stub = sandbox.stub(process.stdout, 'write');
            logger.log('test');
            stub.restore();
            expect(stub.calledOnce).to.be.true;
            expect(stub.calledWith('test\n')).to.be.true;
          });

        it('the lines count to increase by one',
          (): void => {
            expect(logger).to.have.property('countLines', 1);
            const stub = sandbox.stub(process.stdout, 'write');
            logger.log('test');
            stub.restore();
            expect(logger).to.have.property('countLines', 2);
            expect(stub.calledWith('test\n')).to.be.true;
          });

        it(`to display the 'groupId' when provided`,
          (): void => {
            const stub = sandbox.stub(process.stdout, 'write');
            logger.log('test', 'Mocha');
            stub.restore();
            expect(stub.calledWith('[Mocha]: test\n')).to.be.true;
          });

      });

      context(`function 'error'`, (): void => {

        it('the process stderr write function is called',
          (): void => {
            const stub = sandbox.stub(process.stderr, 'write');
            logger.error('test');
            stub.restore();
            expect(stub.calledOnce).to.be.true;
            expect(stub.calledWith('test\n')).to.be.true;
          });

        it('the lines count to increase by one',
          (): void => {
            expect(logger).to.have.property('countLines', 1);
            const stub = sandbox.stub(process.stderr, 'write');
            logger.error('test');
            stub.restore();
            expect(logger).to.have.property('countLines', 2);
            expect(stub.calledWith('test\n')).to.be.true;
          });

        it(`to display the 'groupId' when provided`,
          (): void => {
            const stub = sandbox.stub(process.stderr, 'write');
            logger.error('test', 'Mocha');
            stub.restore();
            expect(stub.calledWith('[Mocha]: test\n')).to.be.true;
          });

      });

      context(`function 'updateLog'`, (): void => {

        context('if the terminal', (): void => {

          context('is TTY', (): void => {

            it(`to display the 'groupId' when provided`,
              (): void => {
                process.stdout.isTTY = true;
                const stub = sandbox.stub(process.stdout, 'write');
                logger.updateLog('test', 'Mocha');
                stub.restore();
                expect(stub.calledWith('[Mocha]: test')).to.be.true;
              });

            context('the cursor moves', (): void => {

              it('and returns to the original line',
                (): void => {
                  process.stdout.isTTY = true;
                  const writeStub = sandbox.stub(process.stdout, 'write');
                  const moveCursorSpy = sandbox.spy(readline, 'moveCursor');
                  const cursorToStub = sandbox.spy(readline, 'cursorTo');
                  const clearLineSpy = sandbox.spy(readline, 'clearLine');
                  logger.updateLog('test');
                  writeStub.restore();
                  expect(clearLineSpy.calledOnce).to.be.true;
                  expect(cursorToStub.called).to.be.true;
                  expect(moveCursorSpy.calledTwice).to.be.true;
                  expect(moveCursorSpy.firstCall.calledWith(process.stdout, 0, -1)).to.be.true;
                  expect(moveCursorSpy.secondCall.calledWith(process.stdout, 0, 1)).to.be.true;
                  expect(writeStub.called).to.be.true;
                });

              it('one line when no line parameter is provided',
                (): void => {
                  process.stdout.isTTY = true;
                  const writeStub = sandbox.stub(process.stdout, 'write');
                  const moveCursorSpy = sandbox.spy(readline, 'moveCursor');
                  const cursorToStub = sandbox.spy(readline, 'cursorTo');
                  logger.updateLog('test');
                  writeStub.restore();
                  expect(cursorToStub.called).to.be.true;
                  expect(moveCursorSpy.calledWith(process.stdout, 0, -1)).to.be.true;
                  expect(moveCursorSpy.calledWith(process.stdout, 0, 1)).to.be.true;
                });

              it('that much lines when line parameter is provided',
                (): void => {
                  process.stdout.isTTY = true;
                  const writeStub = sandbox.stub(process.stdout, 'write');
                  const moveCursorSpy = sandbox.spy(readline, 'moveCursor');
                  const cursorToStub = sandbox.spy(readline, 'cursorTo');
                  logger.updateLog('test', 5);
                  writeStub.restore();
                  expect(cursorToStub.called).to.be.true;
                  expect(moveCursorSpy.calledWith(process.stdout, 0, -5)).to.be.true;
                  expect(moveCursorSpy.calledWith(process.stdout, 0, 5)).to.be.true;
                });

              it('that much lines and groupdId is displayed when both are provided',
                (): void => {
                  process.stdout.isTTY = true;
                  const stub = sandbox.stub(process.stdout, 'write');
                  const moveCursorSpy = sandbox.spy(readline, 'moveCursor');
                  const cursorToStub = sandbox.spy(readline, 'cursorTo');
                  logger.updateLog('test', 5, 'Mocha');
                  stub.restore();
                  expect(stub.calledWith('[Mocha]: test')).to.be.true;
                  expect(cursorToStub.called).to.be.true;
                  expect(moveCursorSpy.calledWith(process.stdout, 0, -5)).to.be.true;
                  expect(moveCursorSpy.calledWith(process.stdout, 0, 5)).to.be.true;
                });

            });

          });

          context('is not TTY', (): void => {

            it(`to display the 'groupId' when provided`,
              (): void => {
                process.stdout.isTTY = false;
                const writeStub = sandbox.stub(process.stdout, 'write');
                logger.updateLog('test', 'Mocha');
                writeStub.restore();
                expect(writeStub.calledWith('[Mocha]: test\n')).to.be.true;
              });

            it('the cursor does not move',
              (): void => {
                process.stdout.isTTY = false;
                const writeStub = sandbox.stub(process.stdout, 'write');
                const moveCursorSpy = sandbox.spy(readline, 'moveCursor');
                const cursorToStub = sandbox.spy(readline, 'cursorTo');
                const clearLineSpy = sandbox.spy(readline, 'clearLine');
                logger.updateLog('test');
                writeStub.restore();
                expect(clearLineSpy.called).to.be.false;
                expect(cursorToStub.called).to.be.false;
                expect(moveCursorSpy.called).to.be.false;
                expect(writeStub.called).to.be.true;
              });

          });

        });

      });

      context(`function 'spinnerLogStart'`, (): void => {

        context('if the terminal', (): void => {

          context('is TTY', (): void => {

            context('to display the spinner', (): void => {

              it('before the message',
                (): void => {
                  process.stdout.isTTY = true;
                  const writeStub = sandbox.stub(process.stdout, 'write');
                  const logSpy = sandbox.spy(logger, 'log');
                  const updateLogSpy = sandbox.spy(logger, 'updateLog');
                  const spinner = logger.spinnerLogStart('test');
                  timer.tick(logger.spinnerInterval);
                  clearInterval(spinner.timer);
                  writeStub.restore();
                  expect(updateLogSpy.calledTwice).to.be.true;
                  expect(updateLogSpy.calledWith('\\ test', 1)).to.be.true;
                  expect(updateLogSpy.calledAfter(logSpy)).to.be.true;
                  expect(logSpy.calledOnce).to.be.true;
                  expect(logSpy.calledWith('test')).to.be.true;
                  expect(writeStub.calledWith('\u001B[?25l')).to.be.true;
                });

              it(`and the 'groupId' when provided`,
                (): void => {
                  process.stdout.isTTY = true;
                  const writeStub = sandbox.stub(process.stdout, 'write');
                  const logSpy = sandbox.spy(logger, 'log');
                  const updateLogSpy = sandbox.spy(logger, 'updateLog');
                  const spinner = logger.spinnerLogStart('test', 'Mocha');
                  timer.tick(logger.spinnerInterval);
                  clearInterval(spinner.timer);
                  writeStub.restore();
                  expect(updateLogSpy.calledTwice).to.be.true;
                  expect(updateLogSpy.calledWith('[Mocha]: \\ test', 1)).to.be.true;
                  expect(updateLogSpy.calledAfter(logSpy)).to.be.true;
                  expect(logSpy.calledOnce).to.be.true;
                  expect(logSpy.calledWith('test', 'Mocha')).to.be.true;
                  expect(writeStub.calledWith('\u001B[?25l')).to.be.true;
                });

              it('after the message',
                (): void => {
                  process.stdout.isTTY = true;
                  logger.showSpinnerInFront = false;
                  const writeStub = sandbox.stub(process.stdout, 'write');
                  const logSpy = sandbox.spy(logger, 'log');
                  const updateLogSpy = sandbox.spy(logger, 'updateLog');
                  const spinner = logger.spinnerLogStart('test');
                  timer.tick(logger.spinnerInterval);
                  clearInterval(spinner.timer);
                  writeStub.restore();
                  expect(updateLogSpy.calledTwice).to.be.true;
                  expect(updateLogSpy.calledWith('test\\ ', 1)).to.be.true;
                  expect(updateLogSpy.calledAfter(logSpy)).to.be.true;
                  expect(logSpy.calledOnce).to.be.true;
                  expect(logSpy.calledWith('test')).to.be.true;
                  expect(writeStub.calledWith('\u001B[?25l')).to.be.true;
                });

              it(`and the 'groupId' when provided`,
                (): void => {
                  process.stdout.isTTY = true;
                  logger.showSpinnerInFront = false;
                  const writeStub = sandbox.stub(process.stdout, 'write');
                  const logSpy = sandbox.spy(logger, 'log');
                  const updateLogSpy = sandbox.spy(logger, 'updateLog');
                  const spinner = logger.spinnerLogStart('test', 'Mocha');
                  timer.tick(logger.spinnerInterval);
                  clearInterval(spinner.timer);
                  writeStub.restore();
                  expect(updateLogSpy.calledTwice).to.be.true;
                  expect(updateLogSpy.calledWith('[Mocha]: test\\ ', 1)).to.be.true;
                  expect(updateLogSpy.calledAfter(logSpy)).to.be.true;
                  expect(logSpy.calledOnce).to.be.true;
                  expect(logSpy.calledWith('test', 'Mocha')).to.be.true;
                  expect(writeStub.calledWith('\u001B[?25l')).to.be.true;
                });

            });
          });

          context('is not TTY', (): void => {

            it('to not display the spinner',
              (): void => {
                process.stdout.isTTY = false;
                const writeStub = sandbox.stub(process.stdout, 'write');
                const logSpy = sandbox.spy(logger, 'log');
                const updateLogSpy = sandbox.spy(logger, 'updateLog');
                const spinner = logger.spinnerLogStart('test');
                timer.tick(logger.spinnerInterval);
                clearInterval(spinner.timer);
                writeStub.restore();
                expect(updateLogSpy.called).to.be.false;
                expect(logSpy.calledWith('test')).to.be.true;
                expect(writeStub.calledWith('\u001B[?25l')).to.be.false;
              });

          });

        });

      });

      context(`function 'spinnerLogStop'`, (): void => {

        context('if the terminal', (): void => {

          context('is TTY', (): void => {

            it('the spinner to be stopped',
              (): void => {
                process.stdout.isTTY = true;
                const writeStub = sandbox.stub(process.stdout, 'write');
                const updateLogSpy = sandbox.spy(logger, 'updateLog');
                const spinner = logger.spinnerLogStart('test start');
                timer.tick(logger.spinnerInterval);
                logger.spinnerLogStop(spinner, 'test end');
                writeStub.restore();
                expect(updateLogSpy.calledThrice).to.be.true;
                expect(updateLogSpy.thirdCall.calledWith('test end', 1)).to.be.true;
                expect(writeStub.calledWith('\u001B[?25h')).to.be.true;
              });

            it(`to display the 'groupId' when provided`,
              (): void => {
                process.stdout.isTTY = true;
                const writeStub = sandbox.stub(process.stdout, 'write');
                const updateLogSpy = sandbox.spy(logger, 'updateLog');
                const spinner = logger.spinnerLogStart('test start');
                timer.tick(logger.spinnerInterval);
                logger.spinnerLogStop(spinner, 'test end', 'Mocha');
                writeStub.restore();
                expect(updateLogSpy.calledThrice).to.be.true;
                expect(updateLogSpy.thirdCall.calledWith('test end', 1, 'Mocha')).to.be.true;
                expect(writeStub.calledWith('\u001B[?25h')).to.be.true;
              });

          });

          context('is not TTY', (): void => {

            it('the cursor indicatior does not change',
              (): void => {
                process.stdout.isTTY = false;
                const writeStub = sandbox.stub(process.stdout, 'write');
                const spinner = logger.spinnerLogStart('test start');
                timer.tick(logger.spinnerInterval);
                logger.spinnerLogStop(spinner, 'test end', 'Mocha');
                writeStub.restore();
                expect(writeStub.calledWith('\u001B[?25l')).to.be.false;
                expect(writeStub.calledWith('\u001B[?25h')).to.be.false;
              });

          });

        });

      });

      context(`function 'moveCursorTo'`, (): void => {

        context('if the terminal', (): void => {

          context('is TTY', (): void => {

            it('moves the cursor',
              (): void => {
                process.stdout.isTTY = true;
                const writeStub = sandbox.stub(process.stdout, 'write');
                const moveCursorSpy = sandbox.spy(readline, 'moveCursor');
                const cursorToStub = sandbox.spy(readline, 'cursorTo');
                logger.moveCursorTo(1);
                writeStub.restore();
                expect(moveCursorSpy.calledOnce).to.be.true;
                expect(cursorToStub.calledOnce).to.be.true;
              });

          });

          context('is not TTY', (): void => {

            it('does not move the cursor',
              (): void => {
                process.stdout.isTTY = false;
                const writeStub = sandbox.stub(process.stdout, 'write');
                const moveCursorSpy = sandbox.spy(readline, 'moveCursor');
                const cursorToStub = sandbox.spy(readline, 'cursorTo');
                logger.moveCursorTo(1);
                writeStub.restore();
                expect(moveCursorSpy.called).to.be.false;
                expect(cursorToStub.called).to.be.false;
              });

          });

        });

      });

      context(`function 'handleForcedExit'`, (): void => {

        context('if the terminal', (): void => {

          type Callback = (err?: Error) => void;

          let moveCursorStub: sinon.SinonStub<[NodeJS.WritableStream, number, number, (Callback)?], boolean>;
          let clearLineStub: sinon.SinonStub<[NodeJS.WritableStream, readline.Direction, (Callback)?], boolean>;
          let cursorToStub: sinon.SinonStub<[NodeJS.WritableStream, number, (number)?, (Callback)?], boolean>;
          let updateLogStub: sinon.SinonStub<[string, (number)?, (string)?], void>;
          let cursorShowStub: sinon.SinonStub<[string | Uint8Array, (BufferEncoding)?, (Callback)?], boolean>;

          beforeEach((): void => {
            moveCursorStub = sandbox.stub(readline, 'moveCursor');
            clearLineStub = sandbox.stub(readline, 'clearLine');
            cursorToStub = sandbox.stub(readline, 'cursorTo');
            updateLogStub = sandbox.stub(logger, 'updateLog');
            cursorShowStub = sandbox.stub(process.stdout, 'write');
          });

          afterEach((): void => {
            moveCursorStub.restore();
            clearLineStub.restore();
            cursorToStub.restore();
            updateLogStub.restore();
            cursorShowStub.restore();
          });

          context('is TTY', (): void => {

            context('and shows informative messages', (): void => {

              it('the cursor moves up two lines and the process exits',
                (): void => {
                  process.stdout.isTTY = true;
                  const exitStub = sandbox.stub(process, 'exit');
                  logger.handleForcedExit(true);
                  expect(updateLogStub.calledTwice).to.be.true;
                  expect(moveCursorStub.calledTwice).to.be.true;
                  expect(cursorToStub.calledTwice).to.be.true;
                  expect(clearLineStub.calledThrice).to.be.true;
                  expect(exitStub.calledOnce).to.be.true;
                  expect(cursorShowStub.callCount).to.be.eq(1);
                  expect(cursorShowStub.calledWith('\u001B[?25h')).to.be.true;
                  exitStub.restore();
                });

            });

            context('and does not show informative messages', (): void => {

              it('the cursor moves up one line and the process exits',
                (): void => {
                  process.stdout.isTTY = true;
                  const exitStub = sandbox.stub(process, 'exit');
                  logger.handleForcedExit(false);
                  expect(updateLogStub.calledOnce).to.be.true;
                  expect(moveCursorStub.calledOnce).to.be.true;
                  expect(cursorToStub.calledOnce).to.be.true;
                  expect(clearLineStub.calledTwice).to.be.true;
                  expect(exitStub.calledOnce).to.be.true;
                  expect(cursorShowStub.callCount).to.be.eq(1);
                  expect(cursorShowStub.calledWith('\u001B[?25h')).to.be.true;
                  exitStub.restore();
                });

            });

          });

          context('is not TTY', (): void => {

            context('and shows informative messages', (): void => {

              it('the cursor does not move and the process exits',
                (): void => {
                  process.stdout.isTTY = false;
                  const exitStub = sandbox.stub(process, 'exit');
                  logger.handleForcedExit(true);
                  exitStub.restore();
                  expect(updateLogStub.called).to.be.false;
                  expect(moveCursorStub.called).to.be.false;
                  expect(clearLineStub.called).to.be.false;
                  expect(cursorToStub.called).to.be.false;
                  expect(exitStub.calledOnce).to.be.true;
                  expect(cursorShowStub.notCalled).to.be.true;
                  expect(cursorShowStub.calledWith('\u001B[?25h')).to.be.false;
                });

            });

            context('and does not show informative messages', (): void => {

              it('the cursor does not move and the process exits',
                (): void => {
                  process.stdout.isTTY = false;
                  const exitStub = sandbox.stub(process, 'exit');
                  logger.handleForcedExit(false);
                  cursorShowStub.restore();
                  exitStub.restore();
                  expect(updateLogStub.called).to.be.false;
                  expect(moveCursorStub.called).to.be.false;
                  expect(clearLineStub.called).to.be.false;
                  expect(cursorToStub.called).to.be.false;
                  expect(exitStub.calledOnce).to.be.true;
                  expect(cursorShowStub.notCalled).to.be.true;
                  expect(cursorShowStub.calledWith('\u001B[?25h')).to.be.false;
                });

            });

          });

        });
      });

    });

  });

});
