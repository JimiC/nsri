/* eslint-disable prefer-arrow-callback */
/* eslint-disable no-unused-expressions */
import { expect } from 'chai';
import { PathLike } from 'fs';
import path from 'path';
import sinon from 'sinon';
import { Integrity } from '../../src/app/integrity';
import * as fsAsync from '../../src/common/fsAsync';
import { IntegrityObject } from '../../src/interfaces/integrityObject';

describe(`Integrity: function 'persist' tests`, function (): void {

  context('expects', function (): void {

    type WriteFileType = [PathLike | number, {},
      (string | {
        encoding?: string | null | undefined;
        mode?: string | number | undefined;
        floag?: string | undefined;
      } | null | undefined)?];

    let sandbox: sinon.SinonSandbox;
    let writeFileAsyncStub: sinon.SinonStub<WriteFileType, Promise<void>>;
    let integrityTestFilename: string;
    let integrityTestObject: IntegrityObject;
    let fixturesDirPath: string;

    before(function (): void {
      integrityTestFilename = '.integrity.json';
    });

    beforeEach(function (): void {
      sandbox = sinon.createSandbox();
      writeFileAsyncStub = sandbox.stub(fsAsync, 'writeFileAsync');
      fixturesDirPath = path.resolve(__dirname, '../../../test/fixtures');
      integrityTestObject = { hashes: {}, version: '' };
    });

    afterEach(function (): void {
      sandbox.restore();
    });

    context('to persist the created hash file', function (): void {

      it('on the provided path',
        async function (): Promise<void> {
          const dirPath = path.resolve(fixturesDirPath, integrityTestFilename);
          const data = '{\n  "hashes": {},\n  "version": ""\n}';
          await Integrity.persist(integrityTestObject, fixturesDirPath, true);
          expect(writeFileAsyncStub.calledOnceWithExactly(dirPath, data)).to.be.true;
        });

      it('on the default path',
        async function (): Promise<void> {
          const dirPath = path.resolve('./', integrityTestFilename);
          const data = '{\n  "hashes": {},\n  "version": ""\n}';
          await Integrity.persist(integrityTestObject, undefined, true);
          expect(writeFileAsyncStub.calledOnceWithExactly(dirPath, data)).to.be.true;
        });

      it('without prettifying the integrity object',
        async function (): Promise<void> {
          const dirPath = path.resolve(fixturesDirPath, integrityTestFilename);
          const data = '{"hashes":{},"version":""}';
          await Integrity.persist(integrityTestObject, fixturesDirPath);
          expect(writeFileAsyncStub.calledOnceWithExactly(dirPath, data)).to.be.true;
        });
    });

  });

});
