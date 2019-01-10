// tslint:disable only-arrow-functions
// tslint:disable no-unused-expression
import { expect } from 'chai';
import * as sinon from 'sinon';
import { Integrity } from '../../src/app/integrity';
import { IntegrityObject } from '../../src/interfaces/integrityObject';

describe('Integrity: function \'updateManifestIntegrity\' tests', function () {

  context('expects', function () {

    context('to update the manifest with the integrity object', function () {

      let integrityTestObject: IntegrityObject;

      beforeEach(function () {
        integrityTestObject = { hashes: {}, version: '' };
      });

      it('using the indentation indent',
        async function () {
          // @ts-ignore
          const writeFileStub = sinon.stub(Integrity, '_writeFile');
          // @ts-ignore
          const getManifestStub = sinon.stub(Integrity, '_getManifestInfo')
            .resolves({ manifest: {}, indentation: { indent: '  ' } });
          await Integrity.updateManifestIntegrity(integrityTestObject);
          getManifestStub.restore();
          writeFileStub.restore();
          expect(getManifestStub.calledOnce).to.be.true;
          expect(writeFileStub.calledOnce).to.be.true;
          expect(writeFileStub.calledWith('package.json',
            '{\n  "integrity": {\n    "hashes": {},\n    "version": ""\n  }\n}'))
            .to.be.true;
        });

      it('using the indentation amount',
        async function () {
          // @ts-ignore
          const writeFileStub = sinon.stub(Integrity, '_writeFile');
          // @ts-ignore
          const getManifestStub = sinon.stub(Integrity, '_getManifestInfo')
            .resolves({ manifest: {}, indentation: { amount: 2 } });
          await Integrity.updateManifestIntegrity(integrityTestObject);
          getManifestStub.restore();
          writeFileStub.restore();
          expect(getManifestStub.calledOnce).to.be.true;
          expect(writeFileStub.calledOnce).to.be.true;
          expect(writeFileStub.calledWith('package.json',
            '{\n  "integrity": {\n    "hashes": {},\n    "version": ""\n  }\n}'))
            .to.be.true;
        });

      it('replacing the existing manifest integrity property',
        async function () {
          // @ts-ignore
          const writeFileStub = sinon.stub(Integrity, '_writeFile');
          // @ts-ignore
          const getManifestStub = sinon.stub(Integrity, '_getManifestInfo')
            .resolves({ manifest: { integrity: { hash: '' } }, indentation: { amount: 2 } });
          await Integrity.updateManifestIntegrity(integrityTestObject);
          getManifestStub.restore();
          writeFileStub.restore();
          expect(getManifestStub.calledOnce).to.be.true;
          expect(writeFileStub.calledOnce).to.be.true;
          expect(writeFileStub.calledWith('package.json',
            '{\n  "integrity": {\n    "hashes": {},\n    "version": ""\n  }\n}'))
            .to.be.true;
        });
    });

  });

});
