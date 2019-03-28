// tslint:disable only-arrow-functions
// tslint:disable no-unused-expression
import { expect } from 'chai';
import sinon from 'sinon';
import { Integrity } from '../../src/app/integrity';

describe('Integrity: function \'getManifestIntegrity\' tests', function (): void {

  context('expects', function (): void {

    context('to return an Error when', function (): void {

      it('the manifest file is not found',
        async function (): Promise<void> {
          // @ts-ignore
          const existsStub = sinon.stub(Integrity, '_exists').returns(false);
          try {
            await Integrity.getManifestIntegrity();
          } catch (error) {
            existsStub.restore();
            expect(existsStub.calledOnce).to.be.true;
            expect(error).to.match(/Error: 'package\.json' not found/);
          }
        });

      it('the manifest is \'null\'',
        async function (): Promise<void> {
          // @ts-ignore
          const existsStub = sinon.stub(Integrity, '_exists').returns(true);
          // @ts-ignore
          const readFileStub = sinon.stub(Integrity, '_readFile').resolves('');
          try {
            await Integrity.getManifestIntegrity();
          } catch (error) {
            existsStub.restore();
            readFileStub.restore();
            expect(existsStub.calledOnce).to.be.true;
            expect(readFileStub.calledOnce).to.be.true;
            expect(error).to.match(/Error: Manifest not found/);
          }
        });

    });

    context('to get the manifest integrity object', function (): void {

      it('and return \'undefined\' when it\'s NOT found',
        async function (): Promise<void> {
          // @ts-ignore
          const existsStub = sinon.stub(Integrity, '_exists').returns(true);
          // @ts-ignore
          const readFileStub = sinon.stub(Integrity, '_readFile').resolves('{\n }');
          const sut = await Integrity.getManifestIntegrity();
          existsStub.restore();
          readFileStub.restore();
          expect(existsStub.calledOnce).to.be.true;
          expect(readFileStub.calledOnce).to.be.true;
          expect(sut).to.be.equal(undefined);
        });

      it('when it\'s found',
        async function (): Promise<void> {
          // @ts-ignore
          const existsStub = sinon.stub(Integrity, '_exists').returns(true);
          // @ts-ignore
          const readFileStub = sinon.stub(Integrity, '_readFile').resolves('{\n  "integrity": {}\n}');
          const sut = await Integrity.getManifestIntegrity();
          existsStub.restore();
          readFileStub.restore();
          expect(existsStub.calledOnce).to.be.true;
          expect(readFileStub.calledOnce).to.be.true;
          expect(sut).to.be.equal('{}');
        });

      it('using the indentation indent',
        async function (): Promise<void> {
          // @ts-ignore
          const getManifestStub = sinon.stub(Integrity, '_getManifestInfo')
            .resolves({ manifest: { integrity: { hash: '' } }, indentation: { indent: '  ' } });
          const sut = await Integrity.getManifestIntegrity();
          getManifestStub.restore();
          expect(getManifestStub.calledOnce).to.be.true;
          expect(sut).to.equal('{\n  "hash": ""\n}');
        });

      it('using the indentation amount',
        async function (): Promise<void> {
          // @ts-ignore
          const getManifestStub = sinon.stub(Integrity, '_getManifestInfo')
            .resolves({ manifest: { integrity: { hash: '' } }, indentation: { amount: 2 } });
          const sut = await Integrity.getManifestIntegrity();
          getManifestStub.restore();
          expect(getManifestStub.calledOnce).to.be.true;
          expect(sut).to.equal('{\n  "hash": ""\n}');
        });

    });

  });

});
