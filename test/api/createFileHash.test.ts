/* eslint-disable no-unused-expressions */
import { expect } from 'chai';
import { BinaryToTextEncoding } from 'crypto';
import fs, { ReadStream } from 'fs';
import path from 'path';
import sinon, { createSandbox } from 'sinon';
import { Integrity } from '../../src/app/integrity';
import * as utils from '../../src/common/utils';
import { CryptoOptions } from '../../src/interfaces/cryptoOptions';
import { checker } from '../helper';

describe(`Integrity: function 'createFileHash' tests`, (): void => {

  context('expects', (): void => {

    let sandbox: sinon.SinonSandbox;
    let fileToHashFilename: string;
    let integrityTestFilename: string;
    let fixturesDirPath: string;
    let fileToHashFilePath: string;
    let integrityTestFilePath: string;
    let md5Length: number;
    let sha1Length: number;

    before((): void => {
      fileToHashFilename = 'fileToHash.txt';
      integrityTestFilename = '.integrity.json';

      md5Length = 32;
      sha1Length = 40;
    });

    beforeEach((): void => {
      sandbox = createSandbox();
      fixturesDirPath = path.resolve(__dirname, '../../../test/fixtures');
      fileToHashFilePath = path.resolve(fixturesDirPath, fileToHashFilename);
      integrityTestFilePath = path.resolve(fixturesDirPath, integrityTestFilename);
    });

    afterEach((): void => {
      sandbox.restore();
    });

    context('to throw an Error when', (): void => {

      it('the provided algorithm is not supported',
        async (): Promise<void> => {
          const cryptoOptions = { fileAlgorithm: 'md1' };
          try {
            await Integrity.createFileHash(fileToHashFilePath, cryptoOptions);
          } catch (error) {
            expect(error).to.be.an.instanceof(Error).that.matches(/ENOSUP:/);
          }
        });

      it('the provided encoding is not supported',
        async (): Promise<void> => {
          const cryptoOptions: CryptoOptions = { encoding: 'ascii' as BinaryToTextEncoding };
          try {
            await Integrity.createFileHash(fileToHashFilePath, cryptoOptions);
          } catch (error) {
            expect(error).to.be.an.instanceof(Error).that.matches(/ENOSUP:/);
          }
        });

      it('the provided path is not a file',
        async (): Promise<void> => {
          try {
            await Integrity.createFileHash(fixturesDirPath);
          } catch (error) {
            expect(error).to.be.an.instanceof(Error).that.matches(/ENOTFILE:/);
          }
        });

      it('the provided path is not allowed',
        async (): Promise<void> => {
          try {
            await Integrity.createFileHash(integrityTestFilePath);
          } catch (error) {
            expect(error).to.be.an.instanceof(Error).that.matches(/ENOTALW:/);
          }
        });

      it('the file can not be read',
        async (): Promise<void> => {
          sandbox.stub(fs, 'createReadStream').returns({
            pipe: sandbox.stub().returnsThis(),
            on: sandbox.stub().callsFake((_, cb: (err: Error) => void) =>
              cb(new Error('Failed reading file'))),
          } as unknown as ReadStream);
          try {
            await Integrity.createFileHash(fileToHashFilePath);
          } catch (error) {
            expect(error).to.be.an.instanceof(Error).and.match(/Failed reading file/);
          }
        });

    });

    it(`to return by default an 'sha1' and 'base64' encoded hash string`,
      async (): Promise<void> => {
        const sut = await Integrity.createFileHash(fileToHashFilePath);
        expect(sut).to.be.an('object')
          .and.to.haveOwnProperty(fileToHashFilename)
          .and.to.satisfy((hash: string): boolean =>
            checker(hash, utils.base64RegexPattern, 'H58mYNjbMJTkiNvvNfj2YKl3ck0='));
      });

    it(`to return a 'sha1' and 'hex' encoded hash string`,
      async (): Promise<void> => {
        const sut = await Integrity.createFileHash(fileToHashFilePath, { encoding: 'hex' });
        expect(sut).to.be.an('object')
          .and.to.haveOwnProperty(fileToHashFilename)
          .and.to.satisfy((hash: string): boolean =>
            checker(hash, utils.hexRegexPattern,
              '1f9f2660d8db3094e488dbef35f8f660a977724d',
              'sha1', sha1Length));
      });

    it(`to return a 'sha1' and 'base64url' encoded hash string`,
      async (): Promise<void> => {
        const sut = await Integrity.createFileHash(fileToHashFilePath, { encoding: 'base64url' });
        expect(sut).to.be.an('object')
          .and.to.haveOwnProperty(fileToHashFilename)
          .and.to.satisfy((hash: string): boolean =>
            checker(hash, utils.base64urlRegexPattern,
              'H58mYNjbMJTkiNvvNfj2YKl3ck0',
              'sha1'));
      });

    it(`to return an 'md5' and 'base64' encoded hash string`,
      async (): Promise<void> => {
        const sut = await Integrity.createFileHash(fileToHashFilePath, { fileAlgorithm: 'md5' });
        expect(sut).to.be.an('object')
          .and.to.haveOwnProperty(fileToHashFilename)
          .and.to.satisfy((hash: string): boolean =>
            checker(hash, utils.base64RegexPattern, 'ej1bR1vQeukEH6sqEz9AxA==', 'md5'));
      });

    it(`to return an 'md5' and 'hex' encoded hash string`,
      async (): Promise<void> => {
        const sut = await Integrity.createFileHash(
          fileToHashFilePath,
          { fileAlgorithm: 'md5', encoding: 'hex' });
        expect(sut).to.be.an('object')
          .and.to.haveOwnProperty(fileToHashFilename)
          .and.to.satisfy((hash: string): boolean =>
            checker(hash, utils.base64RegexPattern, '7a3d5b475bd07ae9041fab2a133f40c4', 'md5', md5Length));
      });

    it(`to support relative paths`,
      async (): Promise<void> => {
        const sut = await Integrity.createFileHash('test/fixtures/fileToHash.txt');

        expect(sut).to.be.an('object')
          .and.to.haveOwnProperty(fileToHashFilename)
          .and.to.satisfy((hash: string): boolean =>
            checker(hash, utils.base64RegexPattern, 'H58mYNjbMJTkiNvvNfj2YKl3ck0='));
      });

  });

});
