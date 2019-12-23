// tslint:disable only-arrow-functions
// tslint:disable no-unused-expression
import { expect } from 'chai';
import { PathLike } from 'fs';
import sinon from 'sinon';
import { Integrity } from '../../src/app/integrity';
import * as fsAsync from '../../src/common/fsAsync';

describe(`Integrity: function 'getManifestIntegrity' tests`, function (): void {

  context('expects', function (): void {

    type ReadFileType = [PathLike | number,
      (string | { encoding?: string | null | undefined; flag?: string | undefined; } | null | undefined)?];

    let sandbox: sinon.SinonSandbox;
    let existsAsyncStub: sinon.SinonStub<[PathLike], Promise<boolean>>;
    let readFileAsyncStub: sinon.SinonStub<ReadFileType, Promise<string | Buffer>>;

    beforeEach(function (): void {
      sandbox = sinon.createSandbox();
      existsAsyncStub = sandbox.stub(fsAsync, 'existsAsync');
      readFileAsyncStub = sandbox.stub(fsAsync, 'readFileAsync');
    });

    afterEach(function (): void {
      sandbox.restore();
    });

    context('to return an Error when', function (): void {

      it('the manifest file is not found',
        async function (): Promise<void> {
          try {
            await Integrity.getManifestIntegrity('../');
          } catch (error) {
            expect(existsAsyncStub.calledOnce).to.be.true;
            expect(error).to.match(/Error: 'package\.json' not found/);
          }
        });

      it(`the manifest is 'null'`,
        async function (): Promise<void> {
          existsAsyncStub.resolves(true);
          readFileAsyncStub.resolves('');
          try {
            await Integrity.getManifestIntegrity();
          } catch (error) {
            expect(existsAsyncStub.calledOnce).to.be.true;
            expect(readFileAsyncStub.calledOnce).to.be.true;
            expect(error).to.match(/Error: Manifest not found/);
          }
        });

    });

    context('to get the manifest integrity object', function (): void {
      let getManifestStub: sinon.SinonStub;

      beforeEach(function (): void {
        // @ts-ignore
        getManifestStub = sandbox.stub(Integrity, '_getManifestInfo');
      });

      it(`and return 'undefined' when it's NOT found`,
        async function (): Promise<void> {
          getManifestStub.restore();
          existsAsyncStub.resolves(true);
          readFileAsyncStub.resolves('{\n }');
          const sut = await Integrity.getManifestIntegrity();
          expect(existsAsyncStub.calledOnce).to.be.true;
          expect(readFileAsyncStub.calledOnce).to.be.true;
          expect(sut).to.be.equal(undefined);
        });

      it(`when it's found`,
        async function (): Promise<void> {
          getManifestStub.restore();
          existsAsyncStub.resolves(true);
          readFileAsyncStub.resolves('{\n  "integrity": {}\n}');
          const sut = await Integrity.getManifestIntegrity();
          expect(existsAsyncStub.calledOnce).to.be.true;
          expect(readFileAsyncStub.calledOnce).to.be.true;
          expect(sut).to.be.equal('{}');
        });

      it('using the indentation indent',
        async function (): Promise<void> {
          getManifestStub.resolves({ manifest: { integrity: { hash: '' } }, indentation: { indent: '  ' } });
          const sut = await Integrity.getManifestIntegrity();
          getManifestStub.restore();
          expect(getManifestStub.calledOnce).to.be.true;
          expect(sut).to.equal('{\n  "hash": ""\n}');
        });

      it('using the indentation amount',
        async function (): Promise<void> {
          // @ts-ignore
          getManifestStub.resolves({ manifest: { integrity: { hash: '' } }, indentation: { amount: 2 } });
          const sut = await Integrity.getManifestIntegrity();
          getManifestStub.restore();
          expect(getManifestStub.calledOnce).to.be.true;
          expect(sut).to.equal('{\n  "hash": ""\n}');
        });

    });

  });

});
