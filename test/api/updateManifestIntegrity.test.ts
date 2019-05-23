// tslint:disable only-arrow-functions
// tslint:disable no-unused-expression
import { expect } from 'chai';
import sinon from 'sinon';
import { Integrity } from '../../src/app/integrity';
import * as fsAsync from '../../src/common/fsAsync';
import { IntegrityObject } from '../../src/interfaces/integrityObject';

describe(`Integrity: function 'updateManifestIntegrity' tests`, function (): void {

  context('expects', function (): void {

    context('to update the manifest with the integrity object', function (): void {

      let sandbox: sinon.SinonSandbox;
      let writeFileAsyncStub: sinon.SinonStub<any[], Promise<any>>;
      let getManifestStub: sinon.SinonStub;
      let integrityTestObject: IntegrityObject;

      beforeEach(function (): void {
        sandbox = sinon.createSandbox();
        writeFileAsyncStub = sandbox.stub(fsAsync, 'writeFileAsync');
        // @ts-ignore
        getManifestStub = sandbox.stub(Integrity, '_getManifestInfo');
        integrityTestObject = { hashes: {}, version: '' };
      });

      afterEach(function (): void {
        sandbox.restore();
      });

      it('using the indentation indent',
        async function (): Promise<void> {
          getManifestStub.resolves({ manifest: {}, indentation: { indent: '  ' } });
          await Integrity.updateManifestIntegrity(integrityTestObject);
          expect(getManifestStub.calledOnce).to.be.true;
          expect(writeFileAsyncStub.calledOnceWithExactly('package.json',
            '{\n  "integrity": {\n    "hashes": {},\n    "version": ""\n  }\n}'))
            .to.be.true;
        });

      it('using the indentation amount',
        async function (): Promise<void> {
          getManifestStub.resolves({ manifest: {}, indentation: { amount: 2 } });
          await Integrity.updateManifestIntegrity(integrityTestObject);
          expect(getManifestStub.calledOnce).to.be.true;
          expect(writeFileAsyncStub.calledOnceWithExactly('package.json',
            '{\n  "integrity": {\n    "hashes": {},\n    "version": ""\n  }\n}'))
            .to.be.true;
        });

      it('replacing the existing manifest integrity property',
        async function (): Promise<void> {
          getManifestStub.resolves({ manifest: { integrity: { hash: '' } }, indentation: { amount: 2 } });
          await Integrity.updateManifestIntegrity(integrityTestObject);
          expect(getManifestStub.calledOnce).to.be.true;
          expect(writeFileAsyncStub.calledOnceWithExactly('package.json',
            '{\n  "integrity": {\n    "hashes": {},\n    "version": ""\n  }\n}'))
            .to.be.true;
        });
    });

  });

});
