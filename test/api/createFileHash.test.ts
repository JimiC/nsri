/* eslint-disable prefer-arrow-callback */
/* eslint-disable no-unused-expressions */
import { expect } from 'chai';
import fs from 'fs';
import path from 'path';
import sinon from 'sinon';
import { Readable } from 'stream';
import { Integrity } from '../../src/app/integrity';
import * as utils from '../../src/common/utils';
import { checker } from '../helper';

describe(`Integrity: function 'createFileHash' tests`, function (): void {

  context('expects', function (): void {

    let sandbox: sinon.SinonSandbox;
    let fileToHashFilename: string;
    let integrityTestFilename: string;
    let fixturesDirPath: string;
    let fileToHashFilePath: string;
    let integrityTestFilePath: string;
    let md5Length: number;
    let sha1Length: number;

    before(function (): void {
      fileToHashFilename = 'fileToHash.txt';
      integrityTestFilename = '.integrity.json';

      md5Length = 32;
      sha1Length = 40;
    });

    beforeEach(function (): void {
      sandbox = sinon.createSandbox();
      fixturesDirPath = path.resolve(__dirname, '../../../test/fixtures');
      fileToHashFilePath = path.resolve(fixturesDirPath, fileToHashFilename);
      integrityTestFilePath = path.resolve(fixturesDirPath, integrityTestFilename);
    });

    afterEach(function (): void {
      sandbox.restore();
    });

    context('to throw an Error when', function (): void {

      it('the provided algorithm is not supported',
        async function (): Promise<void> {
          const cryptoOptions = { fileAlgorithm: 'md1' };
          try {
            await Integrity.createFileHash(fileToHashFilePath, cryptoOptions);
          } catch (error) {
            expect(error).to.be.an.instanceof(Error).that.matches(/ENOSUP:/);
          }
        });

      it('the provided encoding is not supported',
        async function (): Promise<void> {
          const cryptoOptions: any = { encoding: 'ascii' };
          try {
            await Integrity.createFileHash(fileToHashFilePath, cryptoOptions);
          } catch (error) {
            expect(error).to.be.an.instanceof(Error).that.matches(/ENOSUP:/);
          }
        });

      it('the provided path is not a file',
        async function (): Promise<void> {
          try {
            await Integrity.createFileHash(fixturesDirPath);
          } catch (error) {
            expect(error).to.be.an.instanceof(Error).that.matches(/ENOTFILE:/);
          }
        });

      it('the provided path is not allowed',
        async function (): Promise<void> {
          try {
            await Integrity.createFileHash(integrityTestFilePath);
          } catch (error) {
            expect(error).to.be.an.instanceof(Error).that.matches(/ENOTALW:/);
          }
        });

      it('the file can not be read',
        async function (): Promise<void> {
          sandbox.stub(fs, 'createReadStream').returns(new Readable() as fs.ReadStream);
          try {
            await Integrity.createFileHash(fileToHashFilePath);
          } catch (error) {
            expect(error).to.be.an.instanceof(Error);
          }
        });

    });

    it(`to return by default an 'sha1' and 'base64' encoded hash string`,
      async function (): Promise<void> {
        const sut = await Integrity.createFileHash(fileToHashFilePath);
        expect(sut).to.be.an('object')
          .and.to.haveOwnProperty(fileToHashFilename)
          .and.to.satisfy((hash: string): boolean =>
            checker(hash, utils.base64RegexPattern, 'H58mYNjbMJTkiNvvNfj2YKl3ck0='));
      });

    it(`to return an 'sha1' and 'hex' encoded hash string`,
      async function (): Promise<void> {
        const sut = await Integrity.createFileHash(fileToHashFilePath, { encoding: 'hex' });
        expect(sut).to.be.an('object')
          .and.to.haveOwnProperty(fileToHashFilename)
          .and.to.satisfy((hash: string): boolean =>
            checker(hash, utils.hexRegexPattern, '1f9f2660d8db3094e488dbef35f8f660a977724d', 'sha1', sha1Length));
      });

    it(`to return an 'sha1' and 'latin1' encoded hash string`,
      async function (): Promise<void> {
        const sut = await Integrity.createFileHash(fileToHashFilePath, { encoding: 'latin1' });
        expect(sut).to.be.an('object')
          .and.to.haveOwnProperty(fileToHashFilename)
          .and.to.satisfy((hash: string): boolean =>
            checker(hash, utils.latin1RegexPattern, '\u001f&`ØÛ0äÛï5øö`©wrM'));
      });

    it(`to return an 'md5' and 'base64' encoded hash string`,
      async function (): Promise<void> {
        const sut = await Integrity.createFileHash(fileToHashFilePath, { fileAlgorithm: 'md5' });
        expect(sut).to.be.an('object')
          .and.to.haveOwnProperty(fileToHashFilename)
          .and.to.satisfy((hash: string): boolean =>
            checker(hash, utils.base64RegexPattern, 'ej1bR1vQeukEH6sqEz9AxA==', 'md5'));
      });

    it(`to return an 'md5' and 'hex' encoded hash string`,
      async function (): Promise<void> {
        const sut = await Integrity.createFileHash(
          fileToHashFilePath,
          { fileAlgorithm: 'md5', encoding: 'hex' });
        expect(sut).to.be.an('object')
          .and.to.haveOwnProperty(fileToHashFilename)
          .and.to.satisfy((hash: string): boolean =>
            checker(hash, utils.base64RegexPattern, '7a3d5b475bd07ae9041fab2a133f40c4', 'md5', md5Length));
      });

    it(`to support relative paths`,
      async function (): Promise<void> {
        const sut = await Integrity.createFileHash('test/fixtures/fileToHash.txt');

        expect(sut).to.be.an('object')
          .and.to.haveOwnProperty(fileToHashFilename)
          .and.to.satisfy((hash: string): boolean =>
            checker(hash, utils.base64RegexPattern, 'H58mYNjbMJTkiNvvNfj2YKl3ck0='));
      });

  });

});
