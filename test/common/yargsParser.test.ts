/* eslint-disable prefer-arrow-callback */
/* eslint-disable no-unused-expressions */
import { expect } from 'chai';
import fs from 'fs';
import path from 'path';
import sinon, { createSandbox } from 'sinon';
import { YargsParser } from '../../src/common/yargsParser';

describe('YargsParser: tests', function (): void {

  let sandbox: sinon.SinonSandbox;
  let argv: sinon.SinonStub;
  let parser: YargsParser;
  let args: string[];
  let fsStatsMock: sinon.SinonStubbedInstance<fs.Stats>;

  beforeEach(function (): void {
    sandbox = createSandbox();
    argv = sandbox.stub(process, 'argv');
    fsStatsMock = sandbox.createStubInstance(fs.Stats);
    parser = new YargsParser();
    args = ['node', 'nsri', 'create', '-s', '.'];
  });

  afterEach(function (): void {
    sandbox.restore();
  });

  context('expects', function (): void {

    it('the returned parsed arguments object to have the correct properties',
      async function (): Promise<void> {
        argv.value([...args]);
        const sut = await parser.parse();
        const props = ['dirAlgorithm', 'fileAlgorithm', 'command', 'encoding',
          'exclude', 'inPath', 'integrity', 'manifest', 'outPath', 'pretty',
          'strict', 'verbose'];
        expect(sut).to.be.an('object');
        props.forEach((prop: string): Chai.Assertion => expect(sut).to.be.haveOwnProperty(prop));
        expect(Object.keys(sut)).with.length(props.length);
      });

    it(`that the 'fileAlgorithm' option gets parsed correctly`,
      async function (): Promise<void> {
        args = [...args, '--fa', 'sha'];
        argv.value(args);
        const pargs = await parser.parse();
        expect(pargs).to.be.have.property('fileAlgorithm', args[6]);
      });

    it(`that the 'dirAlgorithm' option gets parsed correctly`,
      async function (): Promise<void> {
        args = [...args, '--da', 'sha'];
        argv.value(args);
        const pargs = await parser.parse();
        expect(pargs).to.be.have.property('dirAlgorithm', args[6]);
      });

    it(`that the 'command' gets parsed correctly`,
      async function (): Promise<void> {
        argv.value([...args]);
        const pargs = await parser.parse();
        expect(pargs).to.be.have.property('command', args[2]);
      });

    it(`that the 'encoding' option gets parsed correctly`,
      async function (): Promise<void> {
        args = [...args, '-e', 'base64'];
        argv.value(args);
        const pargs = await parser.parse();
        expect(pargs).to.be.have.property('encoding', args[6]);
      });

    it(`that the 'exclude' option gets parsed correctly`,
      async function (): Promise<void> {
        args = [...args, '-x', 'some/path'];
        argv.value(args);
        const pargs = await parser.parse();
        expect(pargs).to.be.have.property('exclude').with.members([args[6]]);
      });

    it(`that the 'inPath' option gets parsed correctly`,
      async function (): Promise<void> {
        args = [...args];
        argv.value(args);
        const pargs = await parser.parse();
        expect(pargs).to.be.have.property('inPath', args[4]);
      });

    it(`that the 'integrity' option gets parsed correctly`,
      async function (): Promise<void> {
        args.splice(2, 1, 'check');
        args = [...args, '-i', '123456789'];
        argv.value(args);
        const pargs = await parser.parse();
        expect(pargs).to.be.have.property('integrity', args[6]);
      });

    it(`that the 'manifest' option gets parsed correctly`,
      async function (): Promise<void> {
        args = [...args, '-m', 'true'];
        argv.value(args);
        const pargs = await parser.parse();
        expect(pargs).to.be.have.property('manifest', true);
      });

    it(`that the 'outPath' option gets parsed correctly`,
      async function (): Promise<void> {
        args = [...args, '-o', './out'];
        argv.value(args);
        const pargs = await parser.parse();
        expect(pargs).to.be.have.property('outPath', args[6]);
      });

    it(`that the 'pretty' option gets parsed correctly`,
      async function (): Promise<void> {
        args = [...args, '-p', 'true'];
        argv.value(args);
        const pargs = await parser.parse();
        expect(pargs).to.be.have.property('pretty', true);
      });

    it(`that the 'strict' option gets parsed correctly`,
      async function (): Promise<void> {
        args = [...args, '--st', 'true'];
        argv.value(args);
        const pargs = await parser.parse();
        expect(pargs).to.be.have.property('strict', true);
      });

    it(`that the 'verbose' option gets parsed correctly`,
      async function (): Promise<void> {
        args = [...args, '-v', 'true'];
        argv.value(args);
        const pargs = await parser.parse();
        expect(pargs).to.be.have.property('verbose', true);
      });

    it('to throw an Error on invalid file path',
      async function (): Promise<void> {
        const consoleErrorStub = sandbox.stub(console, 'error');
        const stderrStub = sandbox.stub(process.stderr, 'write');
        const exitStub = sandbox.stub(process, 'exit');
        fsStatsMock.isFile.returns(true);
        const statStub = sandbox.stub(fs, 'statSync').returns(fsStatsMock);
        args.pop();
        args.push('file.io');
        argv.value(args);
        await parser.parse();
        expect(consoleErrorStub.called).to.be.true;
        expect(consoleErrorStub.thirdCall
          .calledWithExactly(`ENOENT: no such file or directory, 'file.io'`))
          .to.be.true;
        expect(exitStub.called).to.be.true;
        statStub.restore();
        stderrStub.restore();
        consoleErrorStub.restore();
        exitStub.restore();
      });

    it(`to throw an Error on invalid use of 'manifest' and 'integrity' options with the 'check' command`,
      async function (): Promise<void> {
        const consoleErrorStub = sandbox.stub(console, 'error');
        const stderrStub = sandbox.stub(process.stderr, 'write');
        const exitStub = sandbox.stub(process, 'exit');
        fsStatsMock.isFile.returns(true);
        const statStub = sandbox.stub(fs, 'statSync').returns(fsStatsMock);
        args.splice(2, 1, 'check');
        args.push(...['-m', '-i', '.']);
        argv.value(args);
        await parser.parse();
        expect(consoleErrorStub.called).to.be.true;
        expect(consoleErrorStub.thirdCall
          .calledWithExactly('Arguments integrity and manifest are mutually exclusive'))
          .to.be.true;
        expect(exitStub.called).to.be.true;
        statStub.restore();
        stderrStub.restore();
        consoleErrorStub.restore();
        exitStub.restore();
      });

    it(`to throw an Error on invalid use of 'integrity' options with the 'check' command`,
      async function (): Promise<void> {
        const consoleErrorStub = sandbox.stub(console, 'error');
        const stderrStub = sandbox.stub(process.stderr, 'write');
        const exitStub = sandbox.stub(process, 'exit');
        fsStatsMock.isFile.returns(true);
        const statStub = sandbox.stub(fs, 'statSync').returns(fsStatsMock);
        args.splice(2, 1, 'check');
        argv.value(args);
        await parser.parse();
        expect(consoleErrorStub.called).to.be.true;
        expect(consoleErrorStub.thirdCall
          .calledWithExactly('Missing required argument: integrity'))
          .to.be.true;
        expect(exitStub.called).to.be.true;
        statStub.restore();
        stderrStub.restore();
        consoleErrorStub.restore();
        exitStub.restore();
      });

    context(`that the 'outPath' gets assigned to`, function (): void {

      it(`the input directory when 'input' is a file`,
        async function (): Promise<void> {
          const filePath = path.resolve(__dirname, '../../../test/fixtures/fileToHash.txt');
          args.pop();
          args.push(filePath);
          argv.value(args);
          const pargs = await parser.parse();
          expect(pargs.outPath).to.equal(path.dirname(filePath));
        });

      it(`the input when 'input' is a directory`,
        async function (): Promise<void> {
          const dirPath = path.resolve(__dirname, '../../../test/fixtures');
          args.pop();
          args.push(dirPath);
          argv.value(args);
          const pargs = await parser.parse();
          expect(pargs.outPath).to.equal(dirPath);
        });

    });

  });

});
