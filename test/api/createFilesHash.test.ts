// tslint:disable only-arrow-functions
// tslint:disable no-unused-expression
import { expect } from 'chai';
import path from 'path';
import { Integrity } from '../../src/app/integrity';
import * as utils from '../../src/common/utils';
import { checker } from '../helper';

describe('Integrity: function \'createFilesHash\' tests', function () {

  context('expects', function () {

    let anotherFileToHashFilename: string;
    let otherFileToHashFilename: string;
    let fileToHashFilename: string;
    let directoryDirPath: string;
    let fixturesDirPath: string;
    let anotherFileToHashFilePath: string;
    let otherFileToHashFilePath: string;
    let fileToHashFilePath: string;
    let md5Length: number;
    let sha1Length: number;

    before(function () {
      anotherFileToHashFilename = 'anotherFileToHash.txt';
      otherFileToHashFilename = 'otherFileToHash.txt';
      fileToHashFilename = 'fileToHash.txt';

      md5Length = 32;
      sha1Length = 40;
    });

    beforeEach(function () {
      fixturesDirPath = path.resolve(__dirname, '../../../test/fixtures');
      directoryDirPath = path.resolve(fixturesDirPath, 'directory');
      anotherFileToHashFilePath = path.resolve(directoryDirPath, anotherFileToHashFilename);
      otherFileToHashFilePath = path.resolve(directoryDirPath, otherFileToHashFilename);
      fileToHashFilePath = path.resolve(fixturesDirPath, fileToHashFilename);
    });

    context('to throw an Error when', function () {

      it('the provided algorithm is not supported',
        function () {
          const cryptoOptions = { fileAlgorithm: 'md1' };
          Integrity.createFilesHash([fileToHashFilePath], cryptoOptions)
            .catch(error => expect(error).to.be.an.instanceof(Error).that.matches(/ENOSUP:/));
        });

      it('the provided encoding is not supported',
        function () {
          const cryptoOptions = { encoding: 'ascii' };
          // @ts-ignore
          Integrity.createFilesHash([fileToHashFilePath], cryptoOptions)
            .catch((error: any) => expect(error).to.be.an.instanceof(Error).that.matches(/ENOSUP:/));
        });

    });

    it('to return by default an \'sha1\' and \'base64\' encoded hash JSON',
      async function () {
        const files = [anotherFileToHashFilePath, otherFileToHashFilePath];
        const sut = await Integrity.createFilesHash(files);
        expect(sut).to.be.an('object');
        expect(sut).to.haveOwnProperty(anotherFileToHashFilename)
          .and.to.satisfy((hash: string) =>
            checker(hash, utils.base64RegexPattern, 'EZ2w0rsSmXBOddIoz2IoOIuxGaQ='));
        expect(sut).to.haveOwnProperty(otherFileToHashFilename)
          .and.to.satisfy((hash: string) =>
            checker(hash, utils.base64RegexPattern, 'B8FJ4uKgHESSgMvJUyrj3ix2uG8='));
      });

    it('to return an \'sha1\' and \'hex\' encoded hash JSON',
      async function () {
        const files = [anotherFileToHashFilePath, otherFileToHashFilePath];
        const sut = await Integrity.createFilesHash(files, { encoding: 'hex' });
        expect(sut).to.be.an('object');
        expect(sut).to.haveOwnProperty(anotherFileToHashFilename)
          .and.to.satisfy((hash: string) =>
            checker(hash, utils.hexRegexPattern,
              '119db0d2bb1299704e75d228cf6228388bb119a4',
              'sha1', sha1Length));
        expect(sut).to.haveOwnProperty(otherFileToHashFilename)
          .and.to.satisfy((hash: string) =>
            checker(hash, utils.hexRegexPattern,
              '07c149e2e2a01c449280cbc9532ae3de2c76b86f',
              'sha1', sha1Length));
      });

    it('to return an \'sha1\' and \'latin1\' encoded hash JSON',
      async function () {
        const files = [anotherFileToHashFilePath, otherFileToHashFilePath];
        const sut = await Integrity.createFilesHash(files, { encoding: 'latin1' });
        expect(sut).to.be.an('object');
        expect(sut).to.haveOwnProperty(anotherFileToHashFilename)
          .and.to.satisfy((hash: string) =>
            checker(hash, utils.latin1RegexPattern, '\u0011°Ò»\u0012pNuÒ(Ïb(8±\u0019¤'));
        expect(sut).to.haveOwnProperty(otherFileToHashFilename)
          .and.to.satisfy((hash: string) =>
            checker(hash, utils.latin1RegexPattern, '\u0007ÁIââ \u001cDËÉS*ãÞ,v¸o'));
      });

    it('to return an \'md5\' and \'base64\' encoded hash JSON',
      async function () {
        const files = [anotherFileToHashFilePath, otherFileToHashFilePath];
        const sut = await Integrity.createFilesHash(files, { fileAlgorithm: 'md5' });
        expect(sut).to.be.an('object');
        expect(sut).to.haveOwnProperty(anotherFileToHashFilename)
          .and.to.satisfy((hash: string) =>
            checker(hash, utils.base64RegexPattern, '6FwJAV4629O2chl9ZbDgEQ==', 'md5'));
        expect(sut).to.haveOwnProperty(otherFileToHashFilename)
          .and.to.satisfy((hash: string) =>
            checker(hash, utils.base64RegexPattern, 'qrJbDxeJ/oiVXO5tI3Dntw==', 'md5'));
      });

    it('to return an \'md5\' and \'hex\' encoded hash JSON',
      async function () {
        const files = [anotherFileToHashFilePath, otherFileToHashFilePath];
        const sut = await Integrity.createFilesHash(files, { fileAlgorithm: 'md5', encoding: 'hex' });
        expect(sut).to.be.an('object');
        expect(sut).to.haveOwnProperty(anotherFileToHashFilename)
          .and.to.satisfy((hash: string) =>
            checker(hash, utils.hexRegexPattern, 'e85c09015e3adbd3b672197d65b0e011', 'md5', md5Length));
        expect(sut).to.haveOwnProperty(otherFileToHashFilename)
          .and.to.satisfy((hash: string) =>
            checker(hash, utils.hexRegexPattern, 'aab25b0f1789fe88955cee6d2370e7b7', 'md5', md5Length));
      });

  });

});
