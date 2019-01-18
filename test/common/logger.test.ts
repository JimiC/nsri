// tslint:disable only-arrow-functions
// tslint:disable no-unused-expression
import { expect } from 'chai';
import readline from 'readline';
import sinon from 'sinon';
import { Logger } from '../../src/common/logger';

describe('Logger: tests', function () {

  let sandbox: sinon.SinonSandbox;
  let logger: Logger;

  beforeEach(function () {
    sandbox = sinon.createSandbox();
    logger = new Logger();
    process.stdout.setMaxListeners(Infinity);
    process.stdin.setMaxListeners(Infinity);
  });

  afterEach(function () {
    sandbox.restore();
  });

  context('expects', function () {

    it('to correctly implement BaseLogger',
      function () {
        expect(logger).to.have.deep.property('constructor');
        expect(logger).to.have.deep.property('log');
        expect(logger).to.have.deep.property('error');
        expect(logger).to.have.deep.property('updateLog');
        expect(logger).to.have.deep.property('spinnerLogStart');
        expect(logger).to.have.deep.property('spinnerLogStop');
      });

    it('to have own \'frames\' property',
      function () {
        expect(logger).to.haveOwnProperty('frames');
      });

    it('to have own \'_countLines\' property',
      function () {
        expect(logger).to.haveOwnProperty('_countLines');
      });

    context('when calling', function () {

      let isTTY: true | undefined;
      let timer: sinon.SinonFakeTimers;

      beforeEach(function () {
        isTTY = process.stdout.isTTY;
        timer = sandbox.useFakeTimers();
      });

      afterEach(function () {
        process.stdout.isTTY = isTTY;
        timer.restore();
      });

      context('function \'log\'', function () {

        it('the process stdout write function is called',
          function () {
            const stub = sandbox.stub(process.stdout, 'write');
            logger.log('test');
            stub.restore();
            expect(stub.calledOnce).to.be.true;
            expect(stub.calledWith('test\n')).to.be.true;
          });

        it('the lines count to increase by one',
          function () {
            expect(logger).to.have.property('_countLines', 1);
            const stub = sandbox.stub(process.stdout, 'write');
            logger.log('test');
            stub.restore();
            expect(logger).to.have.property('_countLines', 2);
            expect(stub.calledWith('test\n')).to.be.true;
          });

        it('to display the \'groupId\' when provided',
          function () {
            const stub = sandbox.stub(process.stdout, 'write');
            logger.log('test', 'Mocha');
            stub.restore();
            expect(stub.calledWith('[Mocha]: test\n')).to.be.true;
          });

      });

      context('function \'error\'', function () {

        it('the process stderr write function is called',
          function () {
            const stub = sandbox.stub(process.stderr, 'write');
            logger.error('test');
            stub.restore();
            expect(stub.calledOnce).to.be.true;
            expect(stub.calledWith('test\n')).to.be.true;
          });

        it('the lines count to increase by one',
          function () {
            expect(logger).to.have.property('_countLines', 1);
            const stub = sandbox.stub(process.stderr, 'write');
            logger.error('test');
            stub.restore();
            expect(logger).to.have.property('_countLines', 2);
            expect(stub.calledWith('test\n')).to.be.true;
          });

        it('to display the \'groupId\' when provided',
          function () {
            const stub = sandbox.stub(process.stderr, 'write');
            logger.error('test', 'Mocha');
            stub.restore();
            expect(stub.calledWith('[Mocha]: test\n')).to.be.true;
          });

      });

      context('function \'updateLog\'', function () {

        context('if the terminal', function () {

          context('is TTY', function () {

            it('to display the \'groupId\' when provided',
              function () {
                process.stdout.isTTY = true;
                const stub = sandbox.stub(process.stdout, 'write');
                logger.updateLog('test', 'Mocha');
                stub.restore();
                expect(stub.calledWith('[Mocha]: test')).to.be.true;
              });

            context('the cursor moves', function () {

              it('and returns to the original line',
                function () {
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
                function () {
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
                function () {
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
                function () {
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

          context('is not TTY', function () {

            it('to display the \'groupId\' when provided',
              function () {
                process.stdout.isTTY = undefined;
                const writeStub = sandbox.stub(process.stdout, 'write');
                logger.updateLog('test', 'Mocha');
                writeStub.restore();
                expect(writeStub.calledWith('[Mocha]: test\n')).to.be.true;
              });

            it('the cursor does not move',
              function () {
                process.stdout.isTTY = undefined;
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

      context('function \'spinnerLogStart\'', function () {

        context('if the terminal', function () {

          context('is TTY', function () {

            context('to display the spinner', function () {

              it('before the message',
                function () {
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

              it('and the \'groupId\' when provided',
                function () {
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
                function () {
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

              it('and the \'groupId\' when provided',
                function () {
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

          context('is not TTY', function () {

            it('to not display the spinner',
              function () {
                process.stdout.isTTY = undefined;
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

      context('function \'spinnerLogStop\'', function () {

        context('if the terminal', function () {

          context('is TTY', function () {

            it('the spinner to be stopped',
              function () {
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

            it('to display the \'groupId\' when provided',
              function () {
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

          context('is not TTY', function () {

            it('the cursor indicatior does not change',
              function () {
                process.stdout.isTTY = undefined;
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

      context('function \'moveCursorTo\'', function () {

        context('if the terminal', function () {

          context('is TTY', function () {

            it('moves the cursor',
              function () {
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

          context('is not TTY', function () {

            it('does not move the cursor',
              function () {
                process.stdout.isTTY = undefined;
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

      context('function \'handleForcedExit\'', function () {

        context('if the terminal', function () {

          let moveCursorStub: sinon.SinonStub;
          let clearLineStub: sinon.SinonStub;
          let cursorToStub: sinon.SinonStub;
          let updateLogStub: sinon.SinonStub;
          let cursorShowStub: sinon.SinonStub;

          beforeEach(function () {
            moveCursorStub = sandbox.stub(readline, 'moveCursor');
            clearLineStub = sandbox.stub(readline, 'clearLine');
            cursorToStub = sandbox.stub(readline, 'cursorTo');
            updateLogStub = sandbox.stub(logger, 'updateLog');
            cursorShowStub = sandbox.stub(process.stdout, 'write');
          });

          afterEach(function () {
            moveCursorStub.restore();
            clearLineStub.restore();
            cursorToStub.restore();
            updateLogStub.restore();
            cursorShowStub.restore();
          });

          context('is TTY', function () {

            context('and shows informative messages', function () {

              it('the cursor moves up two lines and the process exits',
                function () {
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

            context('and does not show informative messages', function () {

              it('the cursor moves up one line and the process exits',
                function () {
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

          context('is not TTY', function () {

            context('and shows informative messages', function () {

              it('the cursor does not move and the process exits',
                function () {
                  process.stdout.isTTY = undefined;
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

            context('and does not show informative messages', function () {

              it('the cursor does not move and the process exits',
                function () {
                  process.stdout.isTTY = undefined;
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
