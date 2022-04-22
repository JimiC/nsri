/* eslint-disable prefer-arrow-callback */
/* eslint-disable no-unused-expressions */
import { expect } from 'chai';
import { EventEmitter } from 'events';
import readline, { ReadLine } from 'readline';
import sinon from 'sinon';
import { IntegrityOptions } from '../../src';
import { Integrity } from '../../src/app/integrity';
import nsri from '../../src/cli/index';
import { ConfigExplorer } from '../../src/common/configExplorer';
import { Logger } from '../../src/common/logger';
import { YargsParser } from '../../src/common/yargsParser';
import { ParsedArgs } from '../../src/interfaces//parsedArgs';
import { IntegrityObject } from '../../src/interfaces/integrityObject';

describe('CLI: tests', function (): void {

  let sandbox: sinon.SinonSandbox;
  let pargs: ParsedArgs;
  let configExplorerStub: sinon.SinonStub<[], Promise<void>>;
  let ypParseStub: sinon.SinonStub<[], ParsedArgs>;
  let icCreateStub: sinon.SinonStub<[string, (IntegrityOptions | undefined)?], Promise<IntegrityObject>>;
  let icCheckStub: sinon.SinonStub<[string, string, IntegrityOptions?], Promise<boolean>>;
  let isTTY: boolean;

  beforeEach(function (): void {
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
      pretty: false,
      strict: false,
      verbose: false,
    };
    sandbox = sinon.createSandbox();
    ypParseStub = sandbox.stub(YargsParser.prototype, 'parse').returns(pargs);
    configExplorerStub = sandbox.stub(ConfigExplorer.prototype, 'assignArgs').resolves();
    icCreateStub = sandbox.stub(Integrity, 'create');
    icCheckStub = sandbox.stub(Integrity, 'check');
    sandbox.stub(Integrity, 'persist');
    sandbox.stub(Integrity, 'updateManifestIntegrity');
    sandbox.stub(Integrity, 'getManifestIntegrity');
    isTTY = process.stdout.isTTY;
    process.stdout.setMaxListeners(Infinity);
    process.stdin.setMaxListeners(Infinity);
  });

  afterEach(function (): void {
    process.stdout.isTTY = isTTY;
    sandbox.restore();
  });

  context('expects', function (): void {

    context('to log', function (): void {

      context('process messages', function (): void {

        it('when creating an integrity file',
          async function (): Promise<void> {
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
            expect(spinnerLogStartSpy.calledOnce).to.be.true;
            expect(spinnerLogStartSpy.calledBefore(spinnerLogStopSpy)).to.be.true;
            expect(spinnerLogStartSpy.calledWith('Creating integrity hash')).to.be.true;
            const returnValue = spinnerLogStartSpy.returnValues[0];
            expect(spinnerLogStopSpy.calledWith(returnValue, 'Integrity hash file created')).to.be.true;
          });

        it('when creating an integrity property in manifest',
          async function (): Promise<void> {
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
            expect(spinnerLogStartSpy.calledOnce).to.be.true;
            expect(spinnerLogStartSpy.calledBefore(spinnerLogStopSpy)).to.be.true;
            expect(spinnerLogStartSpy.calledWith('Creating integrity hash')).to.be.true;
            const returnValue = spinnerLogStartSpy.returnValues[0];
            expect(spinnerLogStopSpy.calledWith(returnValue, 'Integrity hash created -> Manifest updated')).to.be.true;
          });

        context('when integrity check passes against an integrity', function (): void {

          it('file',
            async function (): Promise<void> {
              pargs.command = 'check';
              pargs.manifest = false;
              icCheckStub.resolves(true);
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
              expect(spinnerLogStartSpy.calledOnce).to.be.true;
              expect(spinnerLogStartSpy.calledBefore(spinnerLogStopSpy)).to.be.true;
              expect(spinnerLogStartSpy.calledWith(`Checking integrity of: '${pargs.inPath}'`)).to.be.true;
              const returnValue = spinnerLogStartSpy.returnValues[0];
              expect(spinnerLogStopSpy.calledWith(returnValue, 'Integrity validated')).to.be.true;
            });

          it('in manifest',
            async function (): Promise<void> {
              pargs.command = 'check';
              pargs.manifest = true;
              icCheckStub.resolves(true);
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
              expect(spinnerLogStartSpy.calledOnce).to.be.true;
              expect(spinnerLogStartSpy.calledBefore(spinnerLogStopSpy)).to.be.true;
              expect(spinnerLogStartSpy.calledWith(`Checking integrity of: '${pargs.inPath}'`)).to.be.true;
              const returnValue = spinnerLogStartSpy.returnValues[0];
              expect(spinnerLogStopSpy.calledWith(returnValue, 'Integrity validated')).to.be.true;
            });

        });

        it('when integrity check fails',
          async function (): Promise<void> {
            pargs.command = 'check';
            icCheckStub.resolves(false);
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
            expect(spinnerLogStartSpy.calledOnce).to.be.true;
            expect(spinnerLogStartSpy.calledBefore(spinnerLogStopSpy)).to.be.true;
            expect(spinnerLogStartSpy.calledWith(`Checking integrity of: '${pargs.inPath}'`)).to.be.true;
            const returnValue = spinnerLogStartSpy.returnValues[0];
            expect(spinnerLogStopSpy.calledWith(returnValue, 'Integrity check failed')).to.be.true;
          });

      });

      it('informative messages',
        async function (): Promise<void> {
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
        async function (): Promise<void> {
          process.stdout.isTTY = true;
          pargs.command = 'check';
          const error = new Error('test');
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

      it('Error',
        async function (): Promise<void> {
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
          expect(loggerUpdateLogSpy.thirdCall.calledWithMatch(error.toString())).to.be.true;
        });

    });

    context('to call', function (): void {

      it(`the ConfigExplorer 'assignArgs' function`,
        async function (): Promise<void> {
          pargs.command = 'check';
          const exitStub = sandbox.stub(process, 'exit');
          const consoleLogStub = sandbox.stub(console, 'log');
          const stdoutStub = sandbox.stub(process.stdout, 'write');
          await nsri();
          stdoutStub.restore();
          consoleLogStub.restore();
          exitStub.restore();
          expect(configExplorerStub.calledOnce).to.be.true;
        });

      it(`the YargsParser 'parse' function`,
        async function (): Promise<void> {
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

      it(`the Integrity 'create' function`,
        async function (): Promise<void> {
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

      it(`the Integrity 'check' function`,
        async function (): Promise<void> {
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

    context('when signaled to exit', function (): void {

      it(`to call 'handleForcedExit'`,
        function (): Promise<void> {
          pargs.command = 'create';
          const exitStub = sandbox.stub(process, 'exit');
          const consoleLogStub = sandbox.stub(console, 'log');
          const stdoutStub = sandbox.stub(process.stdout, 'write');
          const handleForcedExitStub = sandbox.stub(Logger.prototype, 'handleForcedExit');
          const emitter = new EventEmitter();
          sandbox.stub(readline, 'createInterface').returns(emitter as ReadLine);
          const promise = nsri().then((): void => {
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
