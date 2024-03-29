/* eslint-disable no-unused-expressions */
import { expect } from 'chai';
import { resolve } from 'path';
import sinon, { createSandbox } from 'sinon';
import { Integrity } from '../../src/app/integrity';

describe(`Integrity: function 'getExclusionsFromIgnoreFile' tests`, (): void => {

  context('expects', (): void => {

    let sandbox: sinon.SinonSandbox;
    let baseIgnoreFilePath: string;

    beforeEach((): void => {
      sandbox = createSandbox();
      baseIgnoreFilePath = resolve(__dirname, '../../../test/ignoreFile');
    });

    afterEach((): void => {
      sandbox.restore();
    });

    it('to return an empty array, when failing to find the ignore file',
      async (): Promise<void> => {
        const exclusions = await Integrity.getExclusionsFromIgnoreFile();
        expect(exclusions).to.be.an('array').and.to.be.empty;
      });

    it('to return an array of exclution entries',
      async (): Promise<void> => {
        const expectedEntries = ['*', '*/', '!dist'];
        const exclusions = await Integrity.getExclusionsFromIgnoreFile(baseIgnoreFilePath);
        expect(exclusions).to.be.an('array').and.to.eql(expectedEntries);
      });

  });

});
