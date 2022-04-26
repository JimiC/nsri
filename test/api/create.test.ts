/* eslint-disable no-unused-expressions */
import Ajv from 'ajv';
import { expect } from 'chai';
import fs from 'fs';
import path from 'path';
import sinon, { createSandbox } from 'sinon';
import { Integrity } from '../../src/app/integrity';
import * as fsAsync from '../../src/common/fsAsync';
import { IntegrityOptions } from '../../src/interfaces/integrityOptions';
import * as schema from '../../src/app/schemas/v1/schema.json';

describe(`Integrity: function 'create' tests`, (): void => {

  context('expects', (): void => {

    let fileToHashFilename: string;
    let fixturesDirPath: string;
    let fileToHashFilePath: string;
    let schemaValidator: Ajv;
    let sandbox: sinon.SinonSandbox;
    let fsStatsMock: sinon.SinonStubbedInstance<fs.Stats>;

    before((): void => {
      schemaValidator = new Ajv({ allowUnionTypes: true });
      fileToHashFilename = 'fileToHash.txt';
    });

    let options: IntegrityOptions;

    beforeEach((): void => {
      sandbox = createSandbox();
      fsStatsMock = sandbox.createStubInstance(fs.Stats);
      fixturesDirPath = path.resolve(__dirname, '../../../test/fixtures');
      fileToHashFilePath = path.resolve(fixturesDirPath, fileToHashFilename);
      options = {
        cryptoOptions: undefined,
        exclude: undefined,
        verbose: undefined,
      };
    });

    afterEach((): void => {
      sandbox.restore();
    });

    it('to return an empty object when path is not a file or directory',
      async (): Promise<void> => {
        fsStatsMock.isDirectory.returns(false);
        fsStatsMock.isFile.returns(false);
        const lstatStub = sandbox.stub(fsAsync, 'lstatAsync')
          .resolves(fsStatsMock);
        const sut = await Integrity.create(fixturesDirPath);
        lstatStub.restore();
        expect(lstatStub.calledOnce).to.be.true;
        expect(sut).to.be.an('object');
        expect(sut).to.haveOwnProperty('hashes').that.is.empty;
        expect(sut).to.haveOwnProperty('version').that.matches(/\d/);
      });

    context('to produce a valid schema when hashing', (): void => {

      it('a directory non-verbosely',
        async (): Promise<void> => {
          options.verbose = false;
          const sut = await Integrity.create(fixturesDirPath, options);
          expect(schemaValidator.validate(schema, sut)).to.be.true;
          expect(schemaValidator.errors).to.be.null;
        });

      it('a directory verbosely',
        async (): Promise<void> => {
          const sut = await Integrity.create(fixturesDirPath);
          expect(schemaValidator.validate(schema, sut)).to.be.true;
          expect(schemaValidator.errors).to.be.null;
        });

      it('a file',
        async (): Promise<void> => {
          const sut = await Integrity.create(fileToHashFilePath);
          expect(schemaValidator.validate(schema, sut)).to.be.true;
          expect(schemaValidator.errors).to.be.null;
        });

    });

  });

});
