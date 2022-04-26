/* eslint-disable no-unused-expressions */
import { expect } from 'chai';
import { PathLike, WriteFileOptions } from 'fs';
import path from 'path';
import sinon, { createSandbox } from 'sinon';
import { Integrity } from '../../src/app/integrity';
import * as fsAsync from '../../src/common/fsAsync';
import { IntegrityObject } from '../../src/interfaces/integrityObject';

describe(`Integrity: function 'persist' tests`, (): void => {

  context('expects', (): void => {

    type WriteFileType = [PathLike | number, string | NodeJS.ArrayBufferView, (WriteFileOptions)?];

    let sandbox: sinon.SinonSandbox;
    let writeFileAsyncStub: sinon.SinonStub<WriteFileType, Promise<void>>;
    let integrityTestFilename: string;
    let integrityTestObject: IntegrityObject;
    let fixturesDirPath: string;

    before((): void => {
      integrityTestFilename = '.integrity.json';
    });

    beforeEach((): void => {
      sandbox = createSandbox();
      writeFileAsyncStub = sandbox.stub(fsAsync, 'writeFileAsync');
      fixturesDirPath = path.resolve(__dirname, '../../../test/fixtures');
      integrityTestObject = { hashes: {}, version: '' };
    });

    afterEach((): void => {
      sandbox.restore();
    });

    context('to persist the created hash file', (): void => {

      it('on the provided path',
        async (): Promise<void> => {
          const dirPath = path.resolve(fixturesDirPath, integrityTestFilename);
          const data = '{\n  "hashes": {},\n  "version": ""\n}';
          await Integrity.persist(integrityTestObject, fixturesDirPath, true);
          expect(writeFileAsyncStub.calledOnceWithExactly(dirPath, data)).to.be.true;
        });

      it('on the default path',
        async (): Promise<void> => {
          const dirPath = path.resolve('./', integrityTestFilename);
          const data = '{\n  "hashes": {},\n  "version": ""\n}';
          await Integrity.persist(integrityTestObject, undefined, true);
          expect(writeFileAsyncStub.calledOnceWithExactly(dirPath, data)).to.be.true;
        });

      it('without prettifying the integrity object',
        async (): Promise<void> => {
          const dirPath = path.resolve(fixturesDirPath, integrityTestFilename);
          const data = '{"hashes":{},"version":""}';
          await Integrity.persist(integrityTestObject, fixturesDirPath);
          expect(writeFileAsyncStub.calledOnceWithExactly(dirPath, data)).to.be.true;
        });
    });

  });

});
