// tslint:disable only-arrow-functions
// tslint:disable no-unused-expression
import ajv from 'ajv';
import { expect } from 'chai';
import path from 'path';
import sinon from 'sinon';
import { Integrity } from '../../src/app/integrity';
import { IntegrityOptions } from '../../src/interfaces/integrityOptions';
import * as schema from '../../src/schemas/v1/schema.json';

describe('Integrity: function \'create\' tests', function (): void {

  context('expects', function (): void {

    let fileToHashFilename: string;
    let fixturesDirPath: string;
    let fileToHashFilePath: string;
    let schemaValidator: ajv.Ajv;

    before(function (): void {
      schemaValidator = new ajv();
      fileToHashFilename = 'fileToHash.txt';
    });

    let options: IntegrityOptions;

    beforeEach(function (): void {
      fixturesDirPath = path.resolve(__dirname, '../../../test/fixtures');
      fileToHashFilePath = path.resolve(fixturesDirPath, fileToHashFilename);
      options = {
        cryptoOptions: undefined,
        exclude: undefined,
        verbose: undefined,
      };
    });

    it('to return an empty object when path is not a file or directory',
      async function (): Promise<void> {
        // @ts-ignore
        const lstatStub = sinon.stub(Integrity, '_lstat')
          .returns({ isDirectory: (): boolean => false, isFile: (): boolean => false });
        const sut = await Integrity.create(fixturesDirPath);
        lstatStub.restore();
        expect(lstatStub.calledOnce).to.be.true;
        expect(sut).to.be.an('object');
        expect(sut).to.haveOwnProperty('hashes').that.is.empty;
        expect(sut).to.haveOwnProperty('version').that.matches(/\d/);
  });

    context('to produce a valid schema when hashing', function (): void {

      it('a directory non-verbosely',
        async function (): Promise<void> {
          options.verbose = false;
          const sut = await Integrity.create(fixturesDirPath, options);
          expect(schemaValidator.validate(schema, sut)).to.be.true;
          expect(schemaValidator.errors).to.be.null;
        });

      it('a directory verbosely',
        async function (): Promise<void> {
          const sut = await Integrity.create(fixturesDirPath);
          expect(schemaValidator.validate(schema, sut)).to.be.true;
          expect(schemaValidator.errors).to.be.null;
        });

      it('a file',
        async function (): Promise<void> {
          const sut = await Integrity.create(fileToHashFilePath);
          expect(schemaValidator.validate(schema, sut)).to.be.true;
          expect(schemaValidator.errors).to.be.null;
        });

    });

  });

});
