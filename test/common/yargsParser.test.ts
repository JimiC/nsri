// tslint:disable only-arrow-functions
// tslint:disable no-unused-expression
import { expect } from 'chai';
import fs from 'fs';
import path from 'path';
import sinon from 'sinon';
import { YargsParser } from '../../src/common/yargsParser';

describe('YargsParser: tests', function (): void {

  let sandbox: sinon.SinonSandbox;
  let argv: sinon.SinonStub;
  let parser: YargsParser;
  let args: string[];

  beforeEach(function (): void {
    sandbox = sinon.createSandbox();
    argv = sandbox.stub(process, 'argv');
    parser = new YargsParser();
    args = ['node', 'nsri', 'create', '-s', '.'];
  });

  afterEach(function (): void {
    sandbox.restore();
  });

  context('expects', function (): void {

    it('the returned parsed arguments object to have the correct properties',
      function (): void {
        argv.value([...args]);
        const sut = parser.parse();
        const props = ['dirAlgorithm', 'fileAlgorithm', 'command', 'encoding',
          'exclude', 'inPath', 'integrity', 'manifest', 'outPath', 'verbose'];
        expect(sut).to.be.an('object');
        props.forEach(prop => expect(sut).to.be.haveOwnProperty(prop));
        expect(Object.keys(sut)).with.length(props.length);
      });

    it('that the \'fileAlgorithm\' option gets parsed correctly',
      function (): void {
        args = [...args, '--fa', 'sha'];
        argv.value(args);
        expect(parser.parse()).to.be.have.property('fileAlgorithm', args[6]);
      });

    it('that the \'dirAlgorithm\' option gets parsed correctly',
      function (): void {
        args = [...args, '--da', 'sha'];
        argv.value(args);
        expect(parser.parse()).to.be.have.property('dirAlgorithm', args[6]);
      });

    it('that the \'command\' gets parsed correctly',
      function (): void {
        argv.value([...args]);
        expect(parser.parse()).to.be.have.property('command', args[2]);
      });

    it('that the \'encoding\' option gets parsed correctly',
      function (): void {
        args = [...args, '-e', 'base64'];
        argv.value(args);
        expect(parser.parse()).to.be.have.property('encoding', args[6]);
      });

    it('that the \'exclude\' option gets parsed correctly',
      function (): void {
        args = [...args, '-x', 'some/path'];
        argv.value(args);
        expect(parser.parse()).to.be.have.property('exclude').with.members([args[6]]);
      });

    it('that the \'inPath\' option gets parsed correctly',
      function (): void {
        args = [...args];
        argv.value(args);
        expect(parser.parse()).to.be.have.property('inPath', args[4]);
      });

    it('that the \'integrity\' option gets parsed correctly',
      function (): void {
        args.splice(2, 1, 'check');
        args = [...args, '-i', '123456789'];
        argv.value(args);
        expect(parser.parse()).to.be.have.property('integrity', args[6]);
      });

    it('that the \'manifest\' option gets parsed correctly',
      function (): void {
        args = [...args, '-m', 'true'];
        argv.value(args);
        expect(parser.parse()).to.be.have.property('manifest', true);
      });

    it('that the \'outPath\' option gets parsed correctly',
      function (): void {
        args = [...args, '-o', './out'];
        argv.value(args);
        expect(parser.parse()).to.be.have.property('outPath', args[6]);
      });

    it('that the \'verbose\' option gets parsed correctly',
      function (): void {
        args = [...args, '-v', 'true'];
        argv.value(args);
        expect(parser.parse()).to.be.have.property('verbose', true);
      });

    it('to throw an Error on invalid file path',
      function (): void {
        const consoleErrorStub = sandbox.stub(console, 'error');
        const stderrStub = sandbox.stub(process.stderr, 'write');
        const exitStub = sandbox.stub(process, 'exit');
        const statStub = sandbox.stub(fs, 'statSync').returns({ isFile: (): boolean => true } as any);
        args.pop();
        args.push('file.io');
        argv.value(args);
        parser.parse();
        expect(consoleErrorStub.called).to.be.true;
        expect(consoleErrorStub.thirdCall
          .calledWithExactly('ENOENT: no such file or directory, \'file.io\''))
          .to.be.true;
        expect(exitStub.called).to.be.true;
        statStub.restore();
        stderrStub.restore();
        consoleErrorStub.restore();
        exitStub.restore();
      });

    it('to throw an Error on invalid use of ' +
      '\'manifest\' and \'integrity\' options with the \'check\' command',
      function (): void {
        const consoleErrorStub = sandbox.stub(console, 'error');
        const stderrStub = sandbox.stub(process.stderr, 'write');
        const exitStub = sandbox.stub(process, 'exit');
        const statStub = sandbox.stub(fs, 'statSync').returns({ isFile: (): boolean => true } as any);
        args.splice(2, 1, 'check');
        args.push(...['-m', '-i', '.']);
        argv.value(args);
        parser.parse();
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

    it('to throw an Error on invalid use of ' +
      '\'integrity\' options with the \'check\' command',
      function (): void {
        const consoleErrorStub = sandbox.stub(console, 'error');
        const stderrStub = sandbox.stub(process.stderr, 'write');
        const exitStub = sandbox.stub(process, 'exit');
        const statStub = sandbox.stub(fs, 'statSync').returns({ isFile: (): boolean => true } as any);
        args.splice(2, 1, 'check');
        argv.value(args);
        parser.parse();
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

    context('that the \'outPath\' gets assigned to', function (): void {

      it('the input directory when \'input\' is a file',
        function (): void {
          const filePath = path.resolve(__dirname, '../../../test/fixtures/fileToHash.txt');
          args.pop();
          args.push(filePath);
          argv.value(args);
          expect(parser.parse().outPath).to.equal(path.dirname(filePath));
        });

      it('the input when \'input\' is a directory',
        function (): void {
          const dirPath = path.resolve(__dirname, '../../../test/fixtures');
          args.pop();
          args.push(dirPath);
          argv.value(args);
          expect(parser.parse().outPath).to.equal(dirPath);
        });

    });

  });

});
