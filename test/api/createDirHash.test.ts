// tslint:disable only-arrow-functions
// tslint:disable no-unused-expression
import { expect } from 'chai';
import fs from 'fs';
import path from 'path';
import sinon from 'sinon';
import { Readable } from 'stream';
import { Integrity } from '../../src/app/integrity';
import * as utils from '../../src/common/utils';
import { IntegrityOptions } from '../../src/interfaces/integrityOptions';
import { IVerboseHashObject } from '../../src/interfaces/verboseHashObject';
import { checker } from '../helper';

describe('Integrity: function \'createDirHash\' tests', function () {

  context('expects', function () {

    let otherFileToHashFilename: string;
    let fileToHashFilename: string;
    let fixturesDirPath: string;
    let fileToHashFilePath: string;
    let md5Length: number;
    let sha1Length: number;
    let sha512Length: number;

    before(function () {
      otherFileToHashFilename = 'otherFileToHash.txt';
      fileToHashFilename = 'fileToHash.txt';

      md5Length = 32;
      sha1Length = 40;
      sha512Length = 128;
    });

    let options: IntegrityOptions;

    beforeEach(function () {
      fixturesDirPath = path.resolve(__dirname, '../../../test/fixtures');
      fileToHashFilePath = path.resolve(fixturesDirPath, fileToHashFilename);
      options = {
        cryptoOptions: undefined,
        exclude: undefined,
        verbose: undefined,
      };
    });

    context('to throw an Error when', function () {

      it('the provided algorithm is not supported',
        function () {
          options.cryptoOptions = { dirAlgorithm: 'md1' };
          Integrity.createDirHash(fixturesDirPath, options)
            .catch(error => expect(error).to.be.an.instanceof(Error).that.matches(/ENOSUP:/));
        });

      it('the provided encoding is not supported',
        function () {
          // @ts-ignore
          options.cryptoOptions = { encoding: 'ascii' };
          Integrity.createDirHash(fixturesDirPath, options)
            .catch((error: any) => expect(error).to.be.an.instanceof(Error).that.matches(/ENOSUP:/));
        });

      it('the provided path is not a directory',
        function () {
          options.verbose = false;
          Integrity.createDirHash(fileToHashFilePath, options)
            .catch(error => expect(error).to.be.an.instanceof(Error).that.matches(/ENOTDIR:/));
        });

      it('a file can not be read',
        function () {
          options.verbose = false;
          const createReadStreamStub = sinon.stub(fs, 'createReadStream').returns(new Readable() as fs.ReadStream);
          Integrity.createDirHash(fixturesDirPath, options)
            .catch(error => {
              createReadStreamStub.restore();
              expect(error).to.be.an.instanceof(Error);
            });
        });

    });

    it('to return by default an \'sha512\' and \'base64\' encoded hash string',
      async function () {
        options.verbose = false;
        const sut = await Integrity.createDirHash(fixturesDirPath, options);
        expect(sut).to.be.an('object')
          .and.to.haveOwnProperty('fixtures')
          .and.to.satisfy((hash: string) =>
            checker(hash, utils.base64RegexPattern,
              'WlFP+kAPdHyGd9E8SgkFfxuGvz9l/cqjt8gAhrHDdWLB' +
              'IkkZGxgxxgpWZuARLVD7ACCxq8rVeNbwNL7NKyeWsA==',
              'sha512'));
      });

    it('to return an \'sha512\' and \'hex\' encoded hash string',
      async function () {
        options.cryptoOptions = { encoding: 'hex' };
        options.verbose = false;
        const sut = await Integrity.createDirHash(fixturesDirPath, options);
        expect(sut).to.be.an('object')
          .and.to.haveOwnProperty('fixtures')
          .and.to.satisfy((hash: string) =>
            checker(hash, utils.hexRegexPattern,
              '5a514ffa400f747c8677d13c4a09057f1b86bf3f65fdcaa3b7c80086b1c37562' +
              'c12249191b1831c60a5666e0112d50fb0020b1abcad578d6f034becd2b2796b0',
              'sha512', sha512Length));
      });

    it('to return an \'sha512\' and \'latin1\' encoded hash string',
      async function () {
        options.cryptoOptions = { encoding: 'latin1' };
        options.verbose = false;
        const sut = await Integrity.createDirHash(fixturesDirPath, options);
        expect(sut).to.be.an('object')
          .and.to.haveOwnProperty('fixtures')
          .and.to.satisfy((hash: string) =>
            checker(hash, utils.latin1RegexPattern,
              // tslint:disable-next-line:max-line-length
              'ZQOú@\u000ft|wÑ<J\t\u0005\u001b¿?eýÊ£·È\u0000±ÃubÁ"I\u0019\u001b\u00181Æ\nVfà\u0011-Pû\u0000 ±«ÊÕxÖð4¾Í+\'°',
              'sha512'));
      });

    it('to return an \'md5\' and \'base64\' encoded hash string',
      async function () {
        options.cryptoOptions = { dirAlgorithm: 'md5' };
        options.verbose = false;
        const sut = await Integrity.createDirHash(fixturesDirPath, options);
        expect(sut).to.be.an('object')
          .and.to.haveOwnProperty('fixtures')
          .and.to.satisfy((hash: string) =>
            checker(hash, utils.base64RegexPattern,
              'A6PXayxS1izmNQK4UQBXXw==',
              'md5'));
      });

    it('to return an \'md5\' and \'hex\' encoded hash string',
      async function () {
        options.cryptoOptions = { dirAlgorithm: 'md5', encoding: 'hex' };
        options.verbose = false;
        const sut = await Integrity.createDirHash(fixturesDirPath, options);
        expect(sut).to.be.an('object')
          .and.to.haveOwnProperty('fixtures')
          .and.to.satisfy((hash: string) =>
            checker(hash, utils.hexRegexPattern,
              '03a3d76b2c52d62ce63502b85100575f',
              'md5', md5Length));
      });

    context('to verbosely compute a hash JSON', function () {

      beforeEach(function () {
        options.verbose = true;
      });

      it('with \'sha1\' and \'base64\' encoding by default',
        async function () {
          const sut = await Integrity.createDirHash(fixturesDirPath, options);
          expect(sut).to.be.an('object')
            .and.to.haveOwnProperty('fixtures')
            .and.that.to.haveOwnProperty('contents')
            .and.that.to.haveOwnProperty(fileToHashFilename)
            .and.to.satisfy((hash: string) =>
              checker(hash, utils.base64RegexPattern, 'H58mYNjbMJTkiNvvNfj2YKl3ck0='));
        });

      it('with \'sha1\' and \'hex\' encoding',
        async function () {
          options.cryptoOptions = { encoding: 'hex' };
          const sut = await Integrity.createDirHash(fixturesDirPath, options);
          expect(sut).to.be.an('object').and.to.haveOwnProperty('fixtures');
          expect(sut.fixtures).to.haveOwnProperty('contents');
          const fixtures = sut.fixtures as IVerboseHashObject;
          expect(fixtures.contents).to.haveOwnProperty(fileToHashFilename)
            .and.to.satisfy((hash: string) =>
              checker(hash, utils.hexRegexPattern,
                '1f9f2660d8db3094e488dbef35f8f660a977724d',
                'sha1', sha1Length));
        });

      it('with \'sha1\' and \'latin1\' encoding',
        async function () {
          options.cryptoOptions = { encoding: 'latin1' };
          const sut = await Integrity.createDirHash(fixturesDirPath, options);
          expect(sut).to.be.an('object').and.to.haveOwnProperty('fixtures');
          expect(sut.fixtures).to.haveOwnProperty('contents');
          const fixtures = sut.fixtures as IVerboseHashObject;
          expect(fixtures.contents).to.haveOwnProperty(fileToHashFilename)
            .and.to.satisfy((hash: string) =>
              checker(hash, utils.latin1RegexPattern, '\u001f&`ØÛ0äÛï5øö`©wrM'));
        });

      it('with \'md5\' and \'base64\' encoding',
        async function () {
          options.cryptoOptions = { fileAlgorithm: 'md5' };
          const sut = await Integrity.createDirHash(fixturesDirPath, options);
          expect(sut).to.be.an('object').and.to.haveOwnProperty('fixtures');
          const fixtures = sut.fixtures as IVerboseHashObject;
          expect(fixtures).to.haveOwnProperty('contents');
          expect(fixtures.contents).to.haveOwnProperty(fileToHashFilename)
            .and.to.satisfy((hash: string) =>
              checker(hash, utils.base64RegexPattern,
                'ej1bR1vQeukEH6sqEz9AxA==',
                'md5'));
        });

      it('with \'md5\' and \'hex\' encoding',
        async function () {
          options.cryptoOptions = { fileAlgorithm: 'md5', encoding: 'hex' };
          const sut = await Integrity.createDirHash(fixturesDirPath, options);
          expect(sut).to.be.an('object').and.to.haveOwnProperty('fixtures');
          expect(sut.fixtures)
            .to.haveOwnProperty('contents')
            .and.that.to.haveOwnProperty(fileToHashFilename)
            .and.to.satisfy((hash: string) =>
              checker(hash, utils.hexRegexPattern,
                '7a3d5b475bd07ae9041fab2a133f40c4',
                'md5', md5Length));
        });

    });

    context('to exclude', function () {

      context('in non-verbosely computation', function () {

        it('the provided file',
          async function () {
            options.exclude = [fileToHashFilename];
            options.verbose = false;
            const sut = await Integrity.createDirHash(fixturesDirPath, options);
            expect(sut).to.be.an('object')
              .and.to.haveOwnProperty('fixtures')
              .and.to.satisfy((hash: string) =>
                checker(hash, utils.base64RegexPattern,
                  'Sh3ed4hhzI8eSodzoJphpTle3D9uimG+srSpn0g8OLqW' +
                  '5F2GTp2az4L5iE/haYpFRCv1pHqP4LoFXJc+0dtgaQ==',
                  'sha512'));
          });

        it('the provided file (glob pattern)',
          async function () {
            options.exclude = ['**/fileToHash.txt'];
            options.verbose = false;
            const sut = await Integrity.createDirHash(fixturesDirPath, options);
            expect(sut).to.be.an('object')
              .and.to.haveOwnProperty('fixtures')
              .and.to.satisfy((hash: string) =>
                checker(hash, utils.base64RegexPattern,
                  'Sh3ed4hhzI8eSodzoJphpTle3D9uimG+srSpn0g8OLqW' +
                  '5F2GTp2az4L5iE/haYpFRCv1pHqP4LoFXJc+0dtgaQ==',
                  'sha512'));
          });

        it('the provided files',
          async function () {
            options.exclude = [fileToHashFilename, otherFileToHashFilename];
            options.verbose = false;
            const sut = await Integrity.createDirHash(fixturesDirPath, options);
            expect(sut).to.be.an('object')
              .and.to.haveOwnProperty('fixtures')
              .and.to.satisfy((hash: string) =>
                checker(hash, utils.base64RegexPattern,
                  'D5JDvAmGPhnjGqzANq7d1PyuAcamcOUeZnTW8ziOQ8YI' +
                  'KT27zUArHQfkI0sro+62AQPr/GzVa5MBqDh0GiabrQ==',
                  'sha512'));
          });

        it('the provided files (glob pattern)',
          async function () {
            options.exclude = ['**/fileToHash.txt', '**/otherFileToHash.txt'];
            options.verbose = false;
            const sut = await Integrity.createDirHash(fixturesDirPath, options);
            expect(sut).to.be.an('object')
              .and.to.haveOwnProperty('fixtures')
              .and.to.satisfy((hash: string) =>
                checker(hash, utils.base64RegexPattern,
                  'D5JDvAmGPhnjGqzANq7d1PyuAcamcOUeZnTW8ziOQ8YI' +
                  'KT27zUArHQfkI0sro+62AQPr/GzVa5MBqDh0GiabrQ==',
                  'sha512'));
          });

        it('the provided files (glob pattern)',
          async function () {
            options.exclude = ['**/*.txt'];
            options.verbose = false;
            const sut = await Integrity.createDirHash(fixturesDirPath, options);
            expect(sut).to.be.an('object')
              .and.to.haveOwnProperty('fixtures')
              .and.to.satisfy((hash: string) =>
                checker(hash, utils.base64RegexPattern,
                  'zhTA6hn1p6hmlSU3I1VT1zbtS/xwB7VU2Y+EOgd3n2bj' +
                  '0nsAJEJdmp1yw41cO23JnB92oDrZUOI2UcnN3k9c7A==',
                  'sha512'));
          });

        it('the provided files (glob pattern)',
          async function () {
            options.exclude = ['**/*.*'];
            options.verbose = false;
            const sut = await Integrity.createDirHash(fixturesDirPath, options);
            expect(sut).to.be.an('object')
              .and.to.haveOwnProperty('fixtures')
              .and.to.satisfy((hash: string) =>
                checker(hash, utils.base64RegexPattern,
                  'S3Hwm/DiUVVrGKpl/mWimwLKL2buJyDd9YzQj/ZS2ykH' +
                  'UaVStToOAc30OZx0H2gWwYqJjZoVquZWVN4A/WGVhg==',
                  'sha512'));
          });

        it('the provided directory',
          async function () {
            options.exclude = ['fixtures'];
            options.verbose = false;
            const sut = await Integrity.createDirHash(fixturesDirPath, options);
            expect(sut).to.be.an('object').that.is.empty;
          });

        it('the provided directory (glob pattern)',
          async function () {
            options.exclude = ['**/fixtures'];
            options.verbose = false;
            const sut = await Integrity.createDirHash(fixturesDirPath, options);
            expect(sut).to.be.an('object').that.is.empty;
          });

        it('the provided directory (glob pattern)',
          async function () {
            options.exclude = ['**/fixtures/**'];
            options.verbose = false;
            const sut = await Integrity.createDirHash(fixturesDirPath, options);
            expect(sut).to.be.an('object')
              .and.to.haveOwnProperty('fixtures')
              .and.to.satisfy((hash: string) =>
                checker(hash, utils.base64RegexPattern,
                  'VS0vn1tFpwFNeOnneQ2kuMyXkTxgm1zBS76hApwMFVHh' +
                  'WoHUg+A0zF3WxCqTys2GR2GPUvbCnvLUb48IsOPNGQ==',
                  'sha512'));
          });

        it('the provided directory (glob pattern)',
          async function () {
            options.exclude = ['**/*'];
            options.verbose = false;
            const sut = await Integrity.createDirHash(fixturesDirPath, options);
            expect(sut).to.be.an('object').that.is.empty;
          });

        it('the provided subdirectory',
          async function () {
            options.exclude = ['directory'];
            options.verbose = false;
            const sut = await Integrity.createDirHash(fixturesDirPath, options);
            expect(sut).to.be.an('object')
              .and.to.haveOwnProperty('fixtures')
              .and.to.satisfy((hash: string) =>
                checker(hash, utils.base64RegexPattern,
                  'Mxema7+o7uDni/0O3OCjsr+CeG05csSon2FK8yYVJkaM' +
                  'WbRoh3Grh6OGuA+zwYqwLjef3w8c0ei8svO5AVQPFw==',
                  'sha512'));
          });

        it('the provided subdirectory (glob pattern)',
          async function () {
            options.exclude = ['**/directory'];
            options.verbose = false;
            const sut = await Integrity.createDirHash(fixturesDirPath, options);
            expect(sut).to.be.an('object')
              .and.to.haveOwnProperty('fixtures')
              .and.to.satisfy((hash: string) =>
                checker(hash, utils.base64RegexPattern,
                  'Mxema7+o7uDni/0O3OCjsr+CeG05csSon2FK8yYVJkaM' +
                  'WbRoh3Grh6OGuA+zwYqwLjef3w8c0ei8svO5AVQPFw==',
                  'sha512'));
          });

        it('the provided subdirectory (glob pattern)',
          async function () {
            options.exclude = ['**/directory/**'];
            options.verbose = false;
            const sut = await Integrity.createDirHash(fixturesDirPath, options);
            expect(sut).to.be.an('object')
              .and.to.haveOwnProperty('fixtures')
              .and.to.satisfy((hash: string) =>
                checker(hash, utils.base64RegexPattern,
                  '0W+w+kRaPwvCI5ykMarvTPG90y/w+g5Qa0hbstaRaOsC' +
                  'lgXpJ11z38wdsXHkD1KMQ2ofl7nIvGBRoSv7WQcU9Q==',
                  'sha512'));
          });

      });

      context('in verbosely computation', function () {

        beforeEach(function () {
          options.verbose = true;
        });

        it('the provided file',
          async function () {
            options.exclude = [fileToHashFilename];
            const sut = await Integrity.createDirHash(fixturesDirPath, options);
            expect(sut).to.be.an('object').and.to.haveOwnProperty('fixtures');
            const fixtures = sut.fixtures as IVerboseHashObject;
            expect(fixtures.contents).to.not.haveOwnProperty(fileToHashFilename);
            const fcfixtures = fixtures.contents.fixtures as IVerboseHashObject;
            expect(fcfixtures.contents).to.not.haveOwnProperty(fileToHashFilename);
            expect(fixtures.hash)
              .and.to.satisfy((hash: string) =>
                checker(hash, utils.base64RegexPattern,
                  'Sh3ed4hhzI8eSodzoJphpTle3D9uimG+srSpn0g8OLqW' +
                  '5F2GTp2az4L5iE/haYpFRCv1pHqP4LoFXJc+0dtgaQ==',
                  'sha512'));
          });

        it('the provided file (glob pattern)',
          async function () {
            options.exclude = ['**/fileToHash.txt'];
            const sut = await Integrity.createDirHash(fixturesDirPath, options);
            expect(sut).to.be.an('object').and.to.haveOwnProperty('fixtures');
            const fixtures = sut.fixtures as IVerboseHashObject;
            expect(fixtures.contents).to.not.haveOwnProperty(fileToHashFilename);
            const fcfixtures = fixtures.contents.fixtures as IVerboseHashObject;
            expect(fcfixtures.contents).to.not.haveOwnProperty(fileToHashFilename);
            expect(fixtures.hash)
              .and.to.satisfy((hash: string) =>
                checker(hash, utils.base64RegexPattern,
                  'Sh3ed4hhzI8eSodzoJphpTle3D9uimG+srSpn0g8OLqW' +
                  '5F2GTp2az4L5iE/haYpFRCv1pHqP4LoFXJc+0dtgaQ==',
                  'sha512'));
          });

        it('the provided files',
          async function () {
            options.exclude = [fileToHashFilename, otherFileToHashFilename];
            const sut = await Integrity.createDirHash(fixturesDirPath, options);
            expect(sut).to.be.an('object').and.to.haveOwnProperty('fixtures');
            const fixtures = sut.fixtures as IVerboseHashObject;
            expect(fixtures.contents).to.not.haveOwnProperty(fileToHashFilename);
            const fcdirectorydot1 = fixtures.contents['directory.1'] as IVerboseHashObject;
            expect(fcdirectorydot1.contents).to.not.haveOwnProperty(otherFileToHashFilename);
            const fcdirectory = fixtures.contents.directory as IVerboseHashObject;
            expect(fcdirectory.contents).to.not.haveOwnProperty(otherFileToHashFilename);
            const fcfixtures = fixtures.contents.fixtures as IVerboseHashObject;
            expect(fcfixtures.contents).to.not.haveOwnProperty(fileToHashFilename);
            const fcfcdirectorydot1 = fcfixtures.contents['directory.1'] as IVerboseHashObject;
            expect(fcfcdirectorydot1.contents).to.not.haveOwnProperty(otherFileToHashFilename);
            const fcfcdirectory = fcfixtures.contents.directory as IVerboseHashObject;
            expect(fcfcdirectory.contents).to.not.haveOwnProperty(otherFileToHashFilename);
            expect(fixtures.hash)
              .and.to.satisfy((hash: string) =>
                checker(hash, utils.base64RegexPattern,
                  'D5JDvAmGPhnjGqzANq7d1PyuAcamcOUeZnTW8ziOQ8YI' +
                  'KT27zUArHQfkI0sro+62AQPr/GzVa5MBqDh0GiabrQ==',
                  'sha512'));
          });

        it('the provided files (glob pattern)',
          async function () {
            options.exclude = ['**/fileToHash.txt', '**/otherFileToHash.txt'];
            const sut = await Integrity.createDirHash(fixturesDirPath, options);
            expect(sut).to.be.an('object').and.to.haveOwnProperty('fixtures');
            const fixtures = sut.fixtures as IVerboseHashObject;
            expect(fixtures.contents).to.not.haveOwnProperty(fileToHashFilename);
            const fcfixtures = fixtures.contents.fixtures as IVerboseHashObject;
            expect(fcfixtures.contents).to.not.haveOwnProperty(fileToHashFilename);
            expect(fixtures.hash)
              .and.to.satisfy((hash: string) =>
                checker(hash, utils.base64RegexPattern,
                  'D5JDvAmGPhnjGqzANq7d1PyuAcamcOUeZnTW8ziOQ8YI' +
                  'KT27zUArHQfkI0sro+62AQPr/GzVa5MBqDh0GiabrQ==',
                  'sha512'));
          });

        it('the provided \'txt\' files (glob pattern)',
          async function () {
            options.exclude = ['**/*.txt'];
            const sut = await Integrity.createDirHash(fixturesDirPath, options);
            expect(sut).to.be.an('object').and.to.haveOwnProperty('fixtures');
            const fixtures = sut.fixtures as IVerboseHashObject;
            expect(fixtures.contents).to.not.haveOwnProperty(fileToHashFilename);
            const fcfixtures = fixtures.contents.fixtures as IVerboseHashObject;
            expect(fcfixtures.contents).to.not.haveOwnProperty(fileToHashFilename);
            expect(fixtures.hash)
              .and.to.satisfy((hash: string) =>
                checker(hash, utils.base64RegexPattern,
                  'zhTA6hn1p6hmlSU3I1VT1zbtS/xwB7VU2Y+EOgd3n2bj' +
                  '0nsAJEJdmp1yw41cO23JnB92oDrZUOI2UcnN3k9c7A==',
                  'sha512'));
          });

        it('all files (glob pattern)',
          async function () {
            options.exclude = ['**/*.*'];
            const sut = await Integrity.createDirHash(fixturesDirPath, options);
            expect(sut).to.be.an('object').and.to.haveOwnProperty('fixtures');
            const fixtures = sut.fixtures as IVerboseHashObject;
            expect(fixtures.contents).to.not.haveOwnProperty(fileToHashFilename);
            const fcfixtures = fixtures.contents.fixtures as IVerboseHashObject;
            expect(fcfixtures.contents).to.not.haveOwnProperty(fileToHashFilename);
            expect(fixtures.hash)
              .and.to.satisfy((hash: string) =>
                checker(hash, utils.base64RegexPattern,
                  'S3Hwm/DiUVVrGKpl/mWimwLKL2buJyDd9YzQj/ZS2ykH' +
                  'UaVStToOAc30OZx0H2gWwYqJjZoVquZWVN4A/WGVhg==',
                  'sha512'));
          });

        it('the provided directory',
          async function () {
            options.exclude = ['fixtures'];
            const sut = await Integrity.createDirHash(fixturesDirPath, options);
            expect(sut).to.be.an('object');
            const fixtures = sut.fixtures as IVerboseHashObject;
            expect(fixtures.contents).to.be.empty;
            expect(fixtures.hash).to.be.empty;
          });

        it('the provided directory (glob pattern)',
          async function () {
            options.exclude = ['**/fixtures'];
            const sut = await Integrity.createDirHash(fixturesDirPath, options);
            expect(sut).to.be.an('object');
            const fixtures = sut.fixtures as IVerboseHashObject;
            expect(fixtures.contents).to.be.empty;
            expect(fixtures.hash).to.be.empty;
          });

        it('the provided directory contents (glob pattern)',
          async function () {
            options.exclude = ['**/fixtures/**'];
            const sut = await Integrity.createDirHash(fixturesDirPath, options);
            expect(sut).to.be.an('object');
            expect(sut)
              .to.haveOwnProperty('fixtures')
              .and.that.to.haveOwnProperty('contents')
              .and.that.to.be.empty;
            const fixtures = sut.fixtures as IVerboseHashObject;
            expect(fixtures.hash)
              .and.to.satisfy((hash: string) =>
                checker(hash, utils.base64RegexPattern,
                  'VS0vn1tFpwFNeOnneQ2kuMyXkTxgm1zBS76hApwMFVHh' +
                  'WoHUg+A0zF3WxCqTys2GR2GPUvbCnvLUb48IsOPNGQ==',
                  'sha512'));
          });

        it('everything (glob pattern)',
          async function () {
            options.exclude = ['**/*'];
            const sut = await Integrity.createDirHash(fixturesDirPath, options);
            expect(sut).to.be.an('object');
            const fixtures = sut.fixtures as IVerboseHashObject;
            expect(fixtures.contents).to.be.empty;
            expect(fixtures.hash).to.be.empty;
          });

        it('the provided subdirectory',
          async function () {
            options.exclude = ['directory'];
            const sut = await Integrity.createDirHash(fixturesDirPath, options);
            expect(sut).to.be.an('object');
            expect(sut)
              .and.to.haveOwnProperty('fixtures')
              .and.that.to.haveOwnProperty('contents')
              .and.that.to.not.haveOwnProperty('directory');
            expect(sut)
              .and.to.haveOwnProperty('fixtures')
              .and.that.to.haveOwnProperty('contents')
              .and.that.to.haveOwnProperty('fixtures')
              .and.that.to.haveOwnProperty('contents')
              .and.that.to.not.haveOwnProperty('directory');
            const fixtures = sut.fixtures as IVerboseHashObject;
            expect(fixtures.hash)
              .and.to.satisfy((hash: string) =>
                checker(hash, utils.base64RegexPattern,
                  'Mxema7+o7uDni/0O3OCjsr+CeG05csSon2FK8yYVJkaM' +
                  'WbRoh3Grh6OGuA+zwYqwLjef3w8c0ei8svO5AVQPFw==',
                  'sha512'));
          });

        it('the provided subdirectory (glob pattern)',
          async function () {
            options.exclude = ['**/directory'];
            const sut = await Integrity.createDirHash(fixturesDirPath, options);
            expect(sut).to.be.an('object');
            expect(sut)
              .and.to.haveOwnProperty('fixtures')
              .and.that.to.haveOwnProperty('contents')
              .and.that.to.not.haveOwnProperty('directory');
            expect(sut)
              .and.to.haveOwnProperty('fixtures')
              .and.that.to.haveOwnProperty('contents')
              .and.that.to.haveOwnProperty('fixtures')
              .and.that.to.haveOwnProperty('contents')
              .and.that.to.not.haveOwnProperty('directory');
            const fixtures = sut.fixtures as IVerboseHashObject;
            expect(fixtures.hash)
              .and.to.satisfy((hash: string) =>
                checker(hash, utils.base64RegexPattern,
                  'Mxema7+o7uDni/0O3OCjsr+CeG05csSon2FK8yYVJkaM' +
                  'WbRoh3Grh6OGuA+zwYqwLjef3w8c0ei8svO5AVQPFw==',
                  'sha512'));
          });

        it('the provided subdirectory contents (glob pattern)',
          async function () {
            options.exclude = ['**/directory/**'];
            const sut = await Integrity.createDirHash(fixturesDirPath, options);
            expect(sut).to.be.an('object');
            expect(sut)
              .to.haveOwnProperty('fixtures')
              .and.that.to.haveOwnProperty('contents')
              .and.that.to.haveOwnProperty('directory')
              .and.that.to.haveOwnProperty('contents')
              .and.that.to.be.empty;
            const fixtures = sut.fixtures as IVerboseHashObject;
            expect(fixtures.hash)
              .and.to.satisfy((hash: string) =>
                checker(hash, utils.base64RegexPattern,
                  '0W+w+kRaPwvCI5ykMarvTPG90y/w+g5Qa0hbstaRaOsC' +
                  'lgXpJ11z38wdsXHkD1KMQ2ofl7nIvGBRoSv7WQcU9Q==',
                  'sha512'));
          });

      });

    });

    context('to include', function () {

      context('in verbosely computation', function () {

        beforeEach(function () {
          options.verbose = true;
        });

        it('the provided file (glob pattern)',
          async function () {
            options.exclude = ['!**/fixtures', '!**/fileToHash.txt'];
            const sut = await Integrity.createDirHash(fixturesDirPath, options);
            expect(sut).to.be.an('object');
            expect(sut)
              .to.haveOwnProperty('fixtures')
              .and.that.to.haveOwnProperty('contents')
              .and.that.to.haveOwnProperty('fixtures')
              .and.that.to.haveOwnProperty('contents')
              .and.that.to.haveOwnProperty(fileToHashFilename)
              .and.to.satisfy((hash: string) =>
                checker(hash, utils.base64RegexPattern, 't56X7IQ267Hza0qjpSpqb9UPcfE='));
            const fixtures = sut.fixtures as IVerboseHashObject;
            expect(fixtures.contents)
              .to.haveOwnProperty(fileToHashFilename)
              .and.to.satisfy((hash: string) =>
                checker(hash, utils.base64RegexPattern, 'H58mYNjbMJTkiNvvNfj2YKl3ck0='));
            const fcfixtures = fixtures.contents.fixtures as IVerboseHashObject;
            expect(fcfixtures.hash)
              .and.to.satisfy((hash: string) =>
                checker(hash, utils.base64RegexPattern,
                  'xsFFG6BuNpe8Q9hxyOCgGPY1ZXSnd7uEPG0LfmjSz/g8' +
                  '8weE01dXScfFEy5ItkDDqYioR75treREV2yMT6dUoQ==',
                  'sha512'));
            expect(fixtures.hash)
              .and.to.satisfy((hash: string) =>
                checker(hash, utils.base64RegexPattern,
                  'fdgmzQQJNKpYGOU1tANBRFexht90qgRY+5CEuJ8vdTwM' +
                  'k1CHI74s0eqqIime7fpH5LkCbi5JmFp8SOjs2kaNlQ==',
                  'sha512'));
          });

        it('only the provided root directory file (glob pattern)',
          async function () {
            options.exclude = ['**/fixtures/', '!**/fileToHash.txt'];
            const sut = await Integrity.createDirHash(fixturesDirPath, options);
            expect(sut).to.be.an('object');
            expect(sut)
              .to.haveOwnProperty('fixtures')
              .and.that.to.haveOwnProperty('contents');
            const fixtures = sut.fixtures as IVerboseHashObject;
            expect(fixtures.contents).not.to.haveOwnProperty('fixtures');
            expect(fixtures.contents).not.to.haveOwnProperty('directory');
            expect(fixtures.contents).not.to.haveOwnProperty('directory.1');
            expect(fixtures.contents).not.to.haveOwnProperty('sameContentWithFileToHash.txt');
            expect(fixtures.contents)
              .to.haveOwnProperty(fileToHashFilename)
              .and.to.satisfy((hash: string) =>
                checker(hash, utils.base64RegexPattern, 'H58mYNjbMJTkiNvvNfj2YKl3ck0='));
            expect(fixtures.hash)
              .and.to.satisfy((hash: string) =>
                checker(hash, utils.base64RegexPattern,
                  'jU0ENm52s6vv8Qk4naKzQ+ldqOTpVnpla7bHLN7gkrlB' +
                  'Qn58ORW+wjpFQmrxnqsDjqlvIFjTuNrq8UzKYRT4SQ==',
                  'sha512'));
          });

        it('only the provided subdirectory file (glob pattern)',
          async function () {
            options.exclude = ['!**/fixtures', '!**/fixtures/fixtures/fileToHash.txt'];
            const sut = await Integrity.createDirHash(fixturesDirPath, options);
            expect(sut).to.be.an('object');
            const fixtures = sut.fixtures as IVerboseHashObject;
            expect(fixtures.contents).not.to.haveOwnProperty('directory');
            expect(fixtures.contents).not.to.haveOwnProperty('directory.1');
            expect(fixtures.contents).not.to.haveOwnProperty(fileToHashFilename);
            expect(fixtures.contents).not.to.haveOwnProperty('sameContentWithFileToHash.txt');
            expect(sut)
              .to.haveOwnProperty('fixtures')
              .and.that.to.haveOwnProperty('contents')
              .and.that.to.haveOwnProperty('fixtures')
              .and.that.to.haveOwnProperty('contents')
              .and.that.to.haveOwnProperty(fileToHashFilename)
              .and.to.satisfy((hash: string) =>
                checker(hash, utils.base64RegexPattern, 't56X7IQ267Hza0qjpSpqb9UPcfE='));
            const fcfixtures = fixtures.contents.fixtures as IVerboseHashObject;
            expect(fcfixtures.hash)
              .and.to.satisfy((hash: string) =>
                checker(hash, utils.base64RegexPattern,
                  'xsFFG6BuNpe8Q9hxyOCgGPY1ZXSnd7uEPG0LfmjSz/g88weE01dXScfFEy5ItkDDqYioR75treREV2yMT6dUoQ==',
                  'sha512'));
            expect(fixtures.hash)
              .and.to.satisfy((hash: string) =>
                checker(hash, utils.base64RegexPattern,
                  'i066+5P7XKubRVkelKvC9+cNxMe9uPA3cgkre24Tp5+l' +
                  'CUSdeHGtkgsYi6Obhe30gTiv3wMpXsl1pCCEofVTWw==',
                  'sha512'));
          });

        it('only the provided root directory contents (glob pattern)',
          async function () {
            options.exclude = ['!**/fixtures/*.txt'];
            const sut = await Integrity.createDirHash(fixturesDirPath, options);
            expect(sut).to.be.an('object');
            expect(sut)
              .to.haveOwnProperty('fixtures')
              .and.that.to.haveOwnProperty('contents');
            const fixtures = sut.fixtures as IVerboseHashObject;
            expect(fixtures.contents).not.to.haveOwnProperty('fixtures');
            expect(fixtures.contents).not.to.haveOwnProperty('directory');
            expect(fixtures.contents).not.to.haveOwnProperty('directory.1');
            expect(fixtures.contents)
              .to.haveOwnProperty('sameContentWithFileToHash.txt')
              .and.to.satisfy((hash: string) =>
                checker(hash, utils.base64RegexPattern, 'l5sOr3meWkHyZWPi2Ln4GM7/lrg='));
            expect(fixtures.contents)
              .to.haveOwnProperty(fileToHashFilename)
              .and.to.satisfy((hash: string) =>
                checker(hash, utils.base64RegexPattern, 'H58mYNjbMJTkiNvvNfj2YKl3ck0='));
            expect(fixtures.hash)
              .and.to.satisfy((hash: string) =>
                checker(hash, utils.base64RegexPattern,
                  'SUoveyMtTFO5zEKmSjLk9nFOGBezDdqpD5DJiNYasQ17' +
                  'E4fV58BuSRM0jbQhw6iG6Iq4rnZ53Aaw3vzFWaLHWA==',
                  'sha512'));
          });

        it('only the provided subdirectory contents (glob pattern)',
          async function () {
            options.exclude = ['!**/fixtures',
              '**/fixtures/fixtures',
              '!**/fixtures/directory',
              '!**/fixtures/directory/*.txt'];
            const sut = await Integrity.createDirHash(fixturesDirPath, options);
            expect(sut).to.be.an('object');
            expect(sut)
              .to.haveOwnProperty('fixtures')
              .and.that.to.haveOwnProperty('contents')
              .and.that.to.haveOwnProperty('directory')
              .and.that.to.haveOwnProperty('contents');
            const fixtures = sut.fixtures as IVerboseHashObject;
            expect(fixtures.contents).not.to.haveOwnProperty('fixtures');
            expect(fixtures.contents).not.to.haveOwnProperty('directory.1');
            expect(fixtures.contents).not.to.haveOwnProperty(fileToHashFilename);
            expect(fixtures.contents).not.to.haveOwnProperty('sameContentWithFileToHash.txt');
            const fcdirectory = fixtures.contents.directory as IVerboseHashObject;
            expect(fcdirectory.contents)
              .to.haveOwnProperty('anotherFileToHash.txt')
              .and.to.satisfy((hash: string) =>
                checker(hash, utils.base64RegexPattern, 'EZ2w0rsSmXBOddIoz2IoOIuxGaQ='));
            expect(fcdirectory.contents)
              .to.haveOwnProperty('otherFileToHash.txt')
              .and.to.satisfy((hash: string) =>
                checker(hash, utils.base64RegexPattern, 'B8FJ4uKgHESSgMvJUyrj3ix2uG8='));
            expect(fcdirectory.hash)
              .and.to.satisfy((hash: string) =>
                checker(hash, utils.base64RegexPattern,
                  'Ze62278vNFKc3izakn2FgyvHIZEbnsuqKogaZLA1ihM1' +
                  'zk95RKlz+z7qk1XEysMaoJlpDNqSWx4PoPp2cFNBPw==',
                  'sha512'));
            expect(fixtures.hash)
              .and.to.satisfy((hash: string) =>
                checker(hash, utils.base64RegexPattern,
                  'wfY0H0xgB1h2jlkg11q56mX6EgiGEpEpGFxpspUGjG+G' +
                  'WZlgdfY26wFIdZh7+XP0lD82aZQ+femT4DL7yb82vQ==',
                  'sha512'));
          });

      });

    });

  });

});
