/* eslint-disable no-unused-expressions */
import { expect } from 'chai';
import { PathLike, WriteFileOptions } from 'fs';
import sinon, { createSandbox, match } from 'sinon';
import { Integrity } from '../../src/app/integrity';
import * as fsAsync from '../../src/common/fsAsync';
import { IntegrityObject } from '../../src/interfaces/integrityObject';

describe(`Integrity: function 'updateManifestIntegrity' tests`, (): void => {

  context('expects', (): void => {

    type WriteFileType = [PathLike | number, string | NodeJS.ArrayBufferView, (WriteFileOptions)?];

    context('to update the manifest with the integrity object', (): void => {

      let sandbox: sinon.SinonSandbox;
      let writeFileAsyncStub: sinon.SinonStub<WriteFileType, Promise<void>>;
      let getManifestStub: sinon.SinonStub;
      let integrityTestObject: IntegrityObject;

      beforeEach((): void => {
        sandbox = createSandbox();
        writeFileAsyncStub = sandbox.stub(fsAsync, 'writeFileAsync');
        // @ts-ignore
        getManifestStub = sandbox.stub(Integrity, 'getManifestInfo');
        integrityTestObject = { hashes: {}, version: '' };
      });

      afterEach((): void => {
        sandbox.restore();
      });

      it('using the indentation indent',
        async (): Promise<void> => {
          getManifestStub.resolves({ manifest: {}, indentation: { indent: '  ' } });
          await Integrity.updateManifestIntegrity(integrityTestObject);
          expect(getManifestStub.calledOnce).to.be.true;
          expect(writeFileAsyncStub.calledOnceWithExactly(match(/package\.json/),
            '{\n  "integrity": {\n    "hashes": {},\n    "version": ""\n  }\n}'))
            .to.be.true;
        });

      it('using the indentation amount',
        async (): Promise<void> => {
          getManifestStub.resolves({ manifest: {}, indentation: { amount: 2 } });
          await Integrity.updateManifestIntegrity(integrityTestObject);
          expect(getManifestStub.calledOnce).to.be.true;
          expect(writeFileAsyncStub.calledOnceWithExactly(match(/package\.json/),
            '{\n  "integrity": {\n    "hashes": {},\n    "version": ""\n  }\n}'))
            .to.be.true;
        });

      it('replacing the existing manifest integrity property',
        async (): Promise<void> => {
          getManifestStub.resolves({ manifest: { integrity: { hash: '' } }, indentation: { amount: 2 } });
          await Integrity.updateManifestIntegrity(integrityTestObject);
          expect(getManifestStub.calledOnce).to.be.true;
          expect(writeFileAsyncStub.calledOnceWithExactly(match(/package\.json/),
            '{\n  "integrity": {\n    "hashes": {},\n    "version": ""\n  }\n}'))
            .to.be.true;
        });
    });

  });

});
