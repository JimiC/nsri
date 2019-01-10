// tslint:disable only-arrow-functions
// tslint:disable no-unused-expression
import { expect } from 'chai';
import { EventEmitter } from 'events';
import readline, { ReadLine } from 'readline';
import * as sinon from 'sinon';
import { Integrity } from '../../src/app/integrity';
import nsri from '../../src/cli/index';
import { Logger } from '../../src/common/logger';
import { YargsParser } from '../../src/common/yargsParser';
import { IParsedArgs } from '../../src/interfaces//parsedArgs';

describe('CLI: tests', function () {

  let sandbox: sinon.SinonSandbox;
  let pargs: IParsedArgs;
  let ypParseStub: sinon.SinonStub;
  let icCreateStub: sinon.SinonStub;
  let icCheckStub: sinon.SinonStub;
  let isTTY: true | undefined;

  beforeEach(function () {
    pargs = {
      command: '',
      dirAlgorithm: 'md5',
      encoding: 'hex',
      exclude: [],
      fileAlgorithm: 'md5',
      inPath: '',
      integrity: '',
      manifest: false,
      outPath: './',
      verbose: false,
    };
    sandbox = sinon.createSandbox();
    ypParseStub = sandbox.stub(YargsParser.prototype, 'parse').returns(pargs);
    icCreateStub = sandbox.stub(Integrity, 'create');
    icCheckStub = sandbox.stub(Integrity, 'check');
    sandbox.stub(Integrity, 'persist');
    sandbox.stub(Integrity, 'updateManifestIntegrity');
    sandbox.stub(Integrity, 'getManifestIntegrity');
    isTTY = process.stdout.isTTY;
    process.stdout.setMaxListeners(Infinity);
    process.stdin.setMaxListeners(Infinity);
  });

  afterEach(function () {
    process.stdout.isTTY = isTTY;
    sandbox.restore();
  });

  context('expects', function () {

    context('to log', function () {

      context('process messages', function () {

        it('when creating an integrity file',
          async function () {
            pargs.command = 'create';
            pargs.manifest = false;
            const exitStub = sandbox.stub(process, 'exit');
            const consoleLogStub = sandbox.stub(console, 'log');
            const stdoutStub = sandbox.stub(process.stdout, 'write');
            const spinnerLogStartSpy = sandbox.spy(Logger.prototype, 'spinnerLogStart');
            const spinnerLogStopSpy = sandbox.spy(Logger.prototype, 'spinnerLogStop');
            await nsri();
            stdoutStub.restore();
            consoleLogStub.restore();
            exitStub.restore();
            expect(spinnerLogStopSpy.calledOnce).to.be.true;
            expect(spinnerLogStopSpy.calledOnce).to.be.true;
            expect(spinnerLogStartSpy.calledBefore(spinnerLogStopSpy)).to.be.true;
            expect(spinnerLogStartSpy.calledWith('Creating integrity hash')).to.be.true;
            const returnValue = spinnerLogStartSpy.returnValues[0];
            expect(spinnerLogStopSpy.calledWith(returnValue, 'Integrity hash file created')).to.be.true;
          });

        it('when creating an integrity property in manifest',
          async function () {
            pargs.command = 'create';
            pargs.manifest = true;
            const exitStub = sandbox.stub(process, 'exit');
            const consoleLogStub = sandbox.stub(console, 'log');
            const stdoutStub = sandbox.stub(process.stdout, 'write');
            const spinnerLogStartSpy = sandbox.spy(Logger.prototype, 'spinnerLogStart');
            const spinnerLogStopSpy = sandbox.spy(Logger.prototype, 'spinnerLogStop');
            await nsri();
            stdoutStub.restore();
            consoleLogStub.restore();
            exitStub.restore();
            expect(spinnerLogStopSpy.calledOnce).to.be.true;
            expect(spinnerLogStopSpy.calledOnce).to.be.true;
            expect(spinnerLogStartSpy.calledBefore(spinnerLogStopSpy)).to.be.true;
            expect(spinnerLogStartSpy.calledWith('Creating integrity hash')).to.be.true;
            const returnValue = spinnerLogStartSpy.returnValues[0];
            expect(spinnerLogStopSpy.calledWith(returnValue, 'Integrity hash created -> Manifest updated')).to.be.true;
          });

        context('when integrity check passes against an integrity', function () {

          it('file',
            async function () {
              pargs.command = 'check';
              pargs.manifest = false;
              icCheckStub.returns(true);
              const exitStub = sandbox.stub(process, 'exit');
              const consoleLogStub = sandbox.stub(console, 'log');
              const stdoutStub = sandbox.stub(process.stdout, 'write');
              const spinnerLogStartSpy = sandbox.spy(Logger.prototype, 'spinnerLogStart');
              const spinnerLogStopSpy = sandbox.spy(Logger.prototype, 'spinnerLogStop');
              await nsri();
              stdoutStub.restore();
              consoleLogStub.restore();
              exitStub.restore();
              expect(spinnerLogStopSpy.calledOnce).to.be.true;
              expect(spinnerLogStopSpy.calledOnce).to.be.true;
              expect(spinnerLogStartSpy.calledBefore(spinnerLogStopSpy)).to.be.true;
              expect(spinnerLogStartSpy.calledWith(`Checking integrity of: '${pargs.inPath}'`)).to.be.true;
              const returnValue = spinnerLogStartSpy.returnValues[0];
              expect(spinnerLogStopSpy.calledWith(returnValue, 'Integrity validated')).to.be.true;
            });

          it('in manifest',
            async function () {
              pargs.command = 'check';
              pargs.manifest = true;
              icCheckStub.returns(true);
              const exitStub = sandbox.stub(process, 'exit');
              const consoleLogStub = sandbox.stub(console, 'log');
              const stdoutStub = sandbox.stub(process.stdout, 'write');
              const spinnerLogStartSpy = sandbox.spy(Logger.prototype, 'spinnerLogStart');
              const spinnerLogStopSpy = sandbox.spy(Logger.prototype, 'spinnerLogStop');
              await nsri();
              stdoutStub.restore();
              consoleLogStub.restore();
              exitStub.restore();
              expect(spinnerLogStopSpy.calledOnce).to.be.true;
              expect(spinnerLogStopSpy.calledOnce).to.be.true;
              expect(spinnerLogStartSpy.calledBefore(spinnerLogStopSpy)).to.be.true;
              expect(spinnerLogStartSpy.calledWith(`Checking integrity of: '${pargs.inPath}'`)).to.be.true;
              const returnValue = spinnerLogStartSpy.returnValues[0];
              expect(spinnerLogStopSpy.calledWith(returnValue, 'Integrity validated')).to.be.true;
            });

        });

        it('when integrity check fails',
          async function () {
            pargs.command = 'check';
            icCheckStub.returns(false);
            const exitStub = sandbox.stub(process, 'exit');
            const consoleLogStub = sandbox.stub(console, 'log');
            const stdoutStub = sandbox.stub(process.stdout, 'write');
            const spinnerLogStartSpy = sandbox.spy(Logger.prototype, 'spinnerLogStart');
            const spinnerLogStopSpy = sandbox.spy(Logger.prototype, 'spinnerLogStop');
            await nsri();
            stdoutStub.restore();
            consoleLogStub.restore();
            exitStub.restore();
            expect(spinnerLogStopSpy.calledOnce).to.be.true;
            expect(spinnerLogStopSpy.calledOnce).to.be.true;
            expect(spinnerLogStartSpy.calledBefore(spinnerLogStopSpy)).to.be.true;
            expect(spinnerLogStartSpy.calledWith(`Checking integrity of: '${pargs.inPath}'`)).to.be.true;
            const returnValue = spinnerLogStartSpy.returnValues[0];
            expect(spinnerLogStopSpy.calledWith(returnValue, 'Integrity check failed')).to.be.true;
          });

      });

      it('informative messages',
        async function () {
          process.stdout.isTTY = true;
          pargs.command = 'check';
          const exitStub = sandbox.stub(process, 'exit');
          const consoleLogStub = sandbox.stub(console, 'log');
          const stdoutStub = sandbox.stub(process.stdout, 'write');
          const loggerLogSpy = sandbox.spy(Logger.prototype, 'log');
          const loggerUpdateLogSpy = sandbox.spy(Logger.prototype, 'updateLog');
          await nsri();
          stdoutStub.restore();
          consoleLogStub.restore();
          exitStub.restore();
          expect(loggerLogSpy.called).to.be.true;
          expect(loggerUpdateLogSpy.callCount).to.equal(2);
        });

      it('Error messages',
        async function () {
          process.stdout.isTTY = true;
          pargs.command = 'check';
          const error = new Error();
          icCheckStub.throws(error);
          const exitStub = sandbox.stub(process, 'exit');
          const consoleLogStub = sandbox.stub(console, 'log');
          const stdoutStub = sandbox.stub(process.stdout, 'write');
          const loggerSpinnerLogStopSpy = sandbox.spy(Logger.prototype, 'spinnerLogStop');
          const loggerUpdateLogSpy = sandbox.spy(Logger.prototype, 'updateLog');
          await nsri();
          stdoutStub.restore();
          consoleLogStub.restore();
          exitStub.restore();
          expect(loggerSpinnerLogStopSpy.calledOnce).to.be.true;
          expect(loggerUpdateLogSpy.callCount).to.equal(3);
          expect(loggerUpdateLogSpy.thirdCall.calledWithMatch(error.message)).to.be.true;
        });

    });

    context('to call', function () {

      it('the YargsParser \'parse\' function',
        async function () {
          pargs.command = 'check';
          const exitStub = sandbox.stub(process, 'exit');
          const consoleLogStub = sandbox.stub(console, 'log');
          const stdoutStub = sandbox.stub(process.stdout, 'write');
          await nsri();
          stdoutStub.restore();
          consoleLogStub.restore();
          exitStub.restore();
          expect(ypParseStub.calledOnce).to.be.true;
        });

      it('the Integrity \'create\' function',
        async function () {
          pargs.command = 'create';
          const exitStub = sandbox.stub(process, 'exit');
          const consoleLogStub = sandbox.stub(console, 'log');
          const stdoutStub = sandbox.stub(process.stdout, 'write');
          await nsri();
          stdoutStub.restore();
          consoleLogStub.restore();
          exitStub.restore();
          expect(icCreateStub.calledOnce).to.be.true;
        });

      it('the Integrity \'check\' function',
        async function () {
          pargs.command = 'check';
          const exitStub = sandbox.stub(process, 'exit');
          const consoleLogStub = sandbox.stub(console, 'log');
          const stdoutStub = sandbox.stub(process.stdout, 'write');
          await nsri();
          stdoutStub.restore();
          consoleLogStub.restore();
          exitStub.restore();
          expect(icCheckStub.calledOnce).to.be.true;
        });

    });

    context('when signaled to exit', function () {

      it('to call \'handleForcedExit\'',
        function () {
          pargs.command = 'create';
          const exitStub = sandbox.stub(process, 'exit');
          const consoleLogStub = sandbox.stub(console, 'log');
          const stdoutStub = sandbox.stub(process.stdout, 'write');
          const handleForcedExitStub = sandbox.stub(Logger.prototype, 'handleForcedExit');
          const emitter = new EventEmitter();
          sandbox.stub(readline, 'createInterface').returns(emitter as ReadLine);
          const promise = nsri().then(() => {
            consoleLogStub.restore();
            stdoutStub.restore();
            exitStub.restore();
            expect(handleForcedExitStub.called).to.be.true;
          });
          emitter.emit('SIGINT');
          return promise;
        });

    });

  });

});
