// tslint:disable only-arrow-functions
// tslint:disable no-unused-expression
import { expect } from 'chai';
import { resolve } from 'path';
import sinon from 'sinon';
import { Integrity } from '../../src/app/integrity';
import * as constants from '../../src/common/constants';

describe(`Integrity: function 'getExclusionsFromIgnoreFile' tests`, function (): void {

  context('expects', function (): void {

    let sandbox: sinon.SinonSandbox;
    let baseIgnoreFilePath: string;

    beforeEach(function (): void {
      sandbox = sinon.createSandbox();
      baseIgnoreFilePath = resolve(__dirname, '../../../test/ignoreFile', constants.ignoreFile);
    });

    afterEach(function (): void {
      sandbox.restore();
    });

    it('to return an empty array, when failing to find an ignore file',
      async function (): Promise<void> {
        const exclusions = await Integrity.getExclusionsFromIgnoreFile();
        expect(exclusions).to.be.an('array').and.to.be.empty;
      });

    it('to return an array of exclution entries',
      async function (): Promise<void> {
        sandbox.stub(constants, 'ignoreFile').value(baseIgnoreFilePath);
        const expectedEntries = ['*', '*/', '!dist'];
        const exclusions = await Integrity.getExclusionsFromIgnoreFile();
        expect(exclusions).to.be.an('array').and.to.eql(expectedEntries);
      });

  });

});
