/* eslint-disable prefer-arrow-callback */
/* eslint-disable no-unused-expressions */
import { expect } from 'chai';
import fs, { ReadStream } from 'fs';
import path from 'path';
import sinon from 'sinon';
import { Integrity } from '../../src/app/integrity';
import * as utils from '../../src/common/utils';
import { IntegrityOptions } from '../../src/interfaces/integrityOptions';
import { VerboseHashObject } from '../../src/interfaces/verboseHashObject';
import { checker } from '../helper';

describe(`Integrity: function 'createDirHash' tests`, function (): void {

  context('expects', function (): void {

    let sandbox: sinon.SinonSandbox;
    let otherFileToHashFilename: string;
    let fileToHashFilename: string;
    let fixturesDirPath: string;
    let fileToHashFilePath: string;
    let md5Length: number;
    let sha1Length: number;
    let sha512Length: number;

    before(function (): void {
      otherFileToHashFilename = 'otherFileToHash.txt';
      fileToHashFilename = 'fileToHash.txt';

      md5Length = 32;
      sha1Length = 40;
      sha512Length = 128;
    });

    let options: IntegrityOptions;

    beforeEach(function (): void {
      sandbox = sinon.createSandbox();
      fixturesDirPath = path.resolve(__dirname, '../../../test/fixtures');
      fileToHashFilePath = path.resolve(fixturesDirPath, fileToHashFilename);
      options = {
        cryptoOptions: undefined,
        exclude: undefined,
        strict: true,
        verbose: undefined,
      };
    });

    afterEach(function (): void {
      sandbox.restore();
    });

    context('to throw an Error when', function (): void {

      it(`the provided 'algorithm' is not supported`,
        async function (): Promise<void> {
          options.cryptoOptions = { dirAlgorithm: 'md1' };

          try {
            await Integrity.createDirHash(fixturesDirPath, options);
          } catch (error) {
            expect(error).to.be.an.instanceof(Error).that.matches(/ENOSUP:/);
          }
        });

      it(`the provided 'encoding' is not supported`,
        async function (): Promise<void> {
          // @ts-ignore
          options.cryptoOptions = { encoding: 'ascii' };

          try {
            await Integrity.createDirHash(fixturesDirPath, options);
          } catch (error) {
            expect(error).to.be.an.instanceof(Error).that.matches(/ENOSUP:/);
          }
        });

      it(`the provided 'path' is not a directory`,
        async function (): Promise<void> {
          options.verbose = false;

          try {
            await Integrity.createDirHash(fileToHashFilePath, options);
          } catch (error) {
            expect(error).to.be.an.instanceof(Error).that.matches(/ENOTDIR:/);
          }
        });

      it('a file can not be read',
        async function (): Promise<void> {
          options.verbose = false;
          sandbox.stub(fs, 'createReadStream').returns({
            pipe: sinon.stub().returnsThis(),
            on: sinon.stub().callsFake((_, cb: (err: Error) => void) =>
              cb(new Error('Failed reading directory'))),
          } as unknown as ReadStream);
          try {
            await Integrity.createDirHash(fixturesDirPath, options);
          } catch (error) {
            expect(error).to.be.an.instanceof(Error).and.match(/Failed reading directory/);
          }
        });

    });

    it(`to return by default an 'sha512' and 'base64' encoded hash string`,
      async function (): Promise<void> {
        options.verbose = false;
        const sut = await Integrity.createDirHash(fixturesDirPath, options);
        expect(sut).to.be.an('object')
          .and.to.haveOwnProperty('fixtures')
          .and.to.satisfy((hash: string): boolean =>
            checker(hash, utils.base64RegexPattern,
              'WlFP+kAPdHyGd9E8SgkFfxuGvz9l/cqjt8gAhrHDdWLB' +
              'IkkZGxgxxgpWZuARLVD7ACCxq8rVeNbwNL7NKyeWsA==',
              'sha512'));
      });

    it(`to return a 'sha512' and 'hex' encoded hash string`,
      async function (): Promise<void> {
        options.cryptoOptions = { encoding: 'hex' };
        options.verbose = false;
        const sut = await Integrity.createDirHash(fixturesDirPath, options);
        expect(sut).to.be.an('object')
          .and.to.haveOwnProperty('fixtures')
          .and.to.satisfy((hash: string): boolean =>
            checker(hash, utils.hexRegexPattern,
              '5a514ffa400f747c8677d13c4a09057f1b86bf3f65fdcaa3b7c80086b1c37562' +
              'c12249191b1831c60a5666e0112d50fb0020b1abcad578d6f034becd2b2796b0',
              'sha512', sha512Length));
      });

    it(`to return a 'sha512' and 'base64url' encoded hash string`,
      async function (): Promise<void> {
        options.cryptoOptions = { encoding: 'base64url' };
        options.verbose = false;
        const sut = await Integrity.createDirHash(fixturesDirPath, options);
        expect(sut).to.be.an('object')
          .and.to.haveOwnProperty('fixtures')
          .and.to.satisfy((hash: string): boolean =>
            checker(hash, utils.base64urlRegexPattern,
              'WlFP-kAPdHyGd9E8SgkFfxuGvz9l_cqjt8gAhrHDdWL' +
              'BIkkZGxgxxgpWZuARLVD7ACCxq8rVeNbwNL7NKyeWsA',
              'sha512'));
      });

    it(`to return an 'md5' and 'base64' encoded hash string`,
      async function (): Promise<void> {
        options.cryptoOptions = { dirAlgorithm: 'md5' };
        options.verbose = false;
        const sut = await Integrity.createDirHash(fixturesDirPath, options);
        expect(sut).to.be.an('object')
          .and.to.haveOwnProperty('fixtures')
          .and.to.satisfy((hash: string): boolean =>
            checker(hash, utils.base64RegexPattern,
              'A6PXayxS1izmNQK4UQBXXw==',
              'md5'));
      });

    it(`to return an 'md5' and 'hex' encoded hash string`,
      async function (): Promise<void> {
        options.cryptoOptions = { dirAlgorithm: 'md5', encoding: 'hex' };
        options.verbose = false;
        const sut = await Integrity.createDirHash(fixturesDirPath, options);
        expect(sut).to.be.an('object')
          .and.to.haveOwnProperty('fixtures')
          .and.to.satisfy((hash: string): boolean =>
            checker(hash, utils.hexRegexPattern,
              '03a3d76b2c52d62ce63502b85100575f',
              'md5', md5Length));
      });

    context('to verbosely compute a hash JSON', function (): void {

      beforeEach(function (): void {
        options.verbose = true;
      });

      it(`with 'sha1' and 'base64' encoding by default`,
        async function (): Promise<void> {
          const sut = await Integrity.createDirHash(fixturesDirPath, options);
          expect(sut).to.be.an('object')
            .and.to.haveOwnProperty('fixtures')
            .and.that.to.haveOwnProperty('contents')
            .and.that.to.haveOwnProperty(fileToHashFilename)
            .and.to.satisfy((hash: string): boolean =>
              checker(hash, utils.base64RegexPattern, 'H58mYNjbMJTkiNvvNfj2YKl3ck0='));
        });

      it(`with 'sha1' and 'hex' encoding`,
        async function (): Promise<void> {
          options.cryptoOptions = { encoding: 'hex' };
          const sut = await Integrity.createDirHash(fixturesDirPath, options);
          expect(sut).to.be.an('object')
            .to.haveOwnProperty('fixtures')
            .and.to.haveOwnProperty('contents');
          const fixtures = sut.fixtures as VerboseHashObject;
          expect(fixtures.contents).to.haveOwnProperty(fileToHashFilename)
            .and.to.satisfy((hash: string): boolean =>
              checker(hash, utils.hexRegexPattern,
                '1f9f2660d8db3094e488dbef35f8f660a977724d',
                'sha1', sha1Length));
        });

      it(`with 'sha1' and 'base64url' encoding`,
        async function (): Promise<void> {
          options.cryptoOptions = { encoding: 'base64url' };
          const sut = await Integrity.createDirHash(fixturesDirPath, options);
          expect(sut).to.be.an('object')
            .to.haveOwnProperty('fixtures')
            .and.to.haveOwnProperty('contents');
          const fixtures = sut.fixtures as VerboseHashObject;
          expect(fixtures.contents).to.haveOwnProperty(fileToHashFilename)
            .and.to.satisfy((hash: string): boolean =>
              checker(hash, utils.base64urlRegexPattern,
                'H58mYNjbMJTkiNvvNfj2YKl3ck0',
                'sha1'));
        });

      it(`with 'md5' and 'base64' encoding`,
        async function (): Promise<void> {
          options.cryptoOptions = { fileAlgorithm: 'md5' };
          const sut = await Integrity.createDirHash(fixturesDirPath, options);
          expect(sut).to.be.an('object')
            .and.to.haveOwnProperty('fixtures');
          const fixtures = sut.fixtures as VerboseHashObject;
          expect(fixtures).to.haveOwnProperty('contents');
          expect(fixtures.contents).to.haveOwnProperty(fileToHashFilename)
            .and.to.satisfy((hash: string): boolean =>
              checker(hash, utils.base64RegexPattern,
                'ej1bR1vQeukEH6sqEz9AxA==',
                'md5'));
        });

      it(`with 'md5' and 'hex' encoding`,
        async function (): Promise<void> {
          options.cryptoOptions = { fileAlgorithm: 'md5', encoding: 'hex' };
          const sut = await Integrity.createDirHash(fixturesDirPath, options);
          expect(sut).to.be.an('object')
            .and.to.haveOwnProperty('fixtures');
          expect(sut.fixtures)
            .to.haveOwnProperty('contents')
            .and.that.to.haveOwnProperty(fileToHashFilename)
            .and.to.satisfy((hash: string): boolean =>
              checker(hash, utils.hexRegexPattern,
                '7a3d5b475bd07ae9041fab2a133f40c4',
                'md5', md5Length));
        });

    });

    context('to exclude', function (): void {

      context('in non-verbosely computation', function (): void {

        it('the provided root file',
          async function (): Promise<void> {
            options.exclude = [fileToHashFilename];
            options.verbose = false;
            const sut = await Integrity.createDirHash(fixturesDirPath, options);
            expect(sut).to.be.an('object')
              .and.to.haveOwnProperty('fixtures')
              .and.to.satisfy((hash: string): boolean =>
                checker(hash, utils.base64RegexPattern,
                  'yTngky0kneOY4JOKvrbfRDk3VNWhDs90Gp7rlNpbQPy0' +
                  'Gfw9Qo7dBFT+yqZieA5HYeOKULyPBOUQrMng/pfzkw==',
                  'sha512'));
          });

        it('the provided file (leading glob pattern)',
          async function (): Promise<void> {
            options.exclude = [`**/${fileToHashFilename}`];
            options.verbose = false;
            const sut = await Integrity.createDirHash(fixturesDirPath, options);
            expect(sut).to.be.an('object')
              .and.to.haveOwnProperty('fixtures')
              .and.to.satisfy((hash: string): boolean =>
                checker(hash, utils.base64RegexPattern,
                  'Sh3ed4hhzI8eSodzoJphpTle3D9uimG+srSpn0g8OLqW' +
                  '5F2GTp2az4L5iE/haYpFRCv1pHqP4LoFXJc+0dtgaQ==',
                  'sha512'));
          });

        it('the provided files',
          async function (): Promise<void> {
            options.exclude = [fileToHashFilename, `**/${otherFileToHashFilename}`];
            options.verbose = false;
            const sut = await Integrity.createDirHash(fixturesDirPath, options);
            expect(sut).to.be.an('object')
              .and.to.haveOwnProperty('fixtures')
              .and.to.satisfy((hash: string): boolean =>
                checker(hash, utils.base64RegexPattern,
                  'Wk6BW5uO0UZfXTgY7wLqoY9bNzA+PyyE9j6n63QpXu9J' +
                  'hZW01gpxczrAqOXWaSf137c5VUYhQSbviRtDRAGOeg==',
                  'sha512'));
          });

        it('the provided files (leading glob pattern)',
          async function (): Promise<void> {
            options.exclude = [`**/${fileToHashFilename}`, `**/${otherFileToHashFilename}`];
            options.verbose = false;
            const sut = await Integrity.createDirHash(fixturesDirPath, options);
            expect(sut).to.be.an('object')
              .and.to.haveOwnProperty('fixtures')
              .and.to.satisfy((hash: string): boolean =>
                checker(hash, utils.base64RegexPattern,
                  'D5JDvAmGPhnjGqzANq7d1PyuAcamcOUeZnTW8ziOQ8YI' +
                  'KT27zUArHQfkI0sro+62AQPr/GzVa5MBqDh0GiabrQ==',
                  'sha512'));
          });

        it(`all root 'txt' files (glob pattern)`,
          async function (): Promise<void> {
            options.exclude = ['*.txt'];
            options.verbose = false;
            const sut = await Integrity.createDirHash(fixturesDirPath, options);
            expect(sut).to.be.an('object')
              .and.to.haveOwnProperty('fixtures')
              .and.to.satisfy((hash: string): boolean =>
                checker(hash, utils.base64RegexPattern,
                  'VegLTUIJV6ET06h8wMXtf+VF2BDVEHd8n2NngoubqzhR' +
                  'i5LLGhJ8bljcSstaEV6CcH2qqz7G4IOJAlOXSqca4A==',
                  'sha512'));
          });

        it(`all 'txt' files (leading glob pattern)`,
          async function (): Promise<void> {
            options.exclude = ['**/*.txt'];
            options.verbose = false;
            const sut = await Integrity.createDirHash(fixturesDirPath, options);
            expect(sut).to.be.an('object').that.is.empty;
          });

        it('all root files (glob pattern)',
          async function (): Promise<void> {
            options.exclude = ['*.*'];
            options.verbose = false;
            const sut = await Integrity.createDirHash(fixturesDirPath, options);
            expect(sut).to.be.an('object')
              .and.to.haveOwnProperty('fixtures')
              .and.to.satisfy((hash: string): boolean =>
                checker(hash, utils.base64RegexPattern,
                  'VegLTUIJV6ET06h8wMXtf+VF2BDVEHd8n2NngoubqzhR' +
                  'i5LLGhJ8bljcSstaEV6CcH2qqz7G4IOJAlOXSqca4A==',
                  'sha512'));
          });

        it('all dotted root directories (glob pattern)',
          async function (): Promise<void> {
            options.exclude = ['*.*/'];
            options.verbose = false;
            const sut = await Integrity.createDirHash(fixturesDirPath, options);
            expect(sut).to.be.an('object')
              .and.to.haveOwnProperty('fixtures')
              .and.to.satisfy((hash: string): boolean =>
                checker(hash, utils.base64RegexPattern,
                  'YO+lMzZetbscCuJcmQ+Gvawbkm2qb4AXPxYXge62cSZB' +
                  'fVUuC8FDZ96VvqDB/SSIQO0tPDhGzxa1ueshcpy/bw==',
                  'sha512'));
          });

        it('all files (leading glob pattern)',
          async function (): Promise<void> {
            options.exclude = ['**/*.*'];
            options.verbose = false;
            const sut = await Integrity.createDirHash(fixturesDirPath, options);
            expect(sut).to.be.an('object').that.is.empty;
          });

        it('everything',
          async function (): Promise<void> {
            options.exclude = ['**'];
            options.verbose = false;
            const sut = await Integrity.createDirHash(fixturesDirPath, options);
            expect(sut).to.be.an('object').that.is.empty;
          });

        it('everything (leading glob pattern)',
          async function (): Promise<void> {
            options.exclude = ['**/'];
            options.verbose = false;
            const sut = await Integrity.createDirHash(fixturesDirPath, options);
            expect(sut).to.be.an('object').that.is.empty;
          });

        it('everything (leading / trailing glob pattern)',
          async function (): Promise<void> {
            options.exclude = ['**/*'];
            options.verbose = false;
            const sut = await Integrity.createDirHash(fixturesDirPath, options);
            expect(sut).to.be.an('object').that.is.empty;
          });

        it('the provided subdirectory',
          async function (): Promise<void> {
            options.exclude = ['fixtures'];
            options.verbose = false;
            const sut = await Integrity.createDirHash(fixturesDirPath, options);
            expect(sut).to.be.an('object')
              .and.to.haveOwnProperty('fixtures')
              .and.to.satisfy((hash: string): boolean =>
                checker(hash, utils.base64RegexPattern,
                  'l+RFq7YS2sKbzyhXAzmpiKF3YdDLkORqI3YQiFZzcPN8' +
                  'Qi7QGADl3AvE53yS4vPJGaEGVOTwx/hPkei+Ttr7jQ==',
                  'sha512'));
          });

        it('the provided subdirectory (leading glob pattern)',
          async function (): Promise<void> {
            options.exclude = ['**/fixtures'];
            options.verbose = false;
            const sut = await Integrity.createDirHash(fixturesDirPath, options);
            expect(sut).to.be.an('object')
              .and.to.haveOwnProperty('fixtures')
              .and.to.satisfy((hash: string): boolean =>
                checker(hash, utils.base64RegexPattern,
                  'l+RFq7YS2sKbzyhXAzmpiKF3YdDLkORqI3YQiFZzcPN8' +
                  'Qi7QGADl3AvE53yS4vPJGaEGVOTwx/hPkei+Ttr7jQ==',
                  'sha512'));
          });

        it('the provided subdirectory',
          async function (): Promise<void> {
            options.exclude = ['fixtures/'];
            options.verbose = false;
            const sut = await Integrity.createDirHash(fixturesDirPath, options);
            expect(sut).to.be.an('object')
              .and.to.haveOwnProperty('fixtures')
              .and.to.satisfy((hash: string): boolean =>
                checker(hash, utils.base64RegexPattern,
                  'l+RFq7YS2sKbzyhXAzmpiKF3YdDLkORqI3YQiFZzcPN8' +
                  'Qi7QGADl3AvE53yS4vPJGaEGVOTwx/hPkei+Ttr7jQ==',
                  'sha512'));
          });

        it('the provided subdirectory (trailing glob pattern)',
          async function (): Promise<void> {
            options.exclude = ['fixtures/**'];
            options.verbose = false;
            const sut = await Integrity.createDirHash(fixturesDirPath, options);
            expect(sut).to.be.an('object')
              .and.to.haveOwnProperty('fixtures')
              .and.to.satisfy((hash: string): boolean =>
                checker(hash, utils.base64RegexPattern,
                  'l+RFq7YS2sKbzyhXAzmpiKF3YdDLkORqI3YQiFZzcPN8' +
                  'Qi7QGADl3AvE53yS4vPJGaEGVOTwx/hPkei+Ttr7jQ==',
                  'sha512'));
          });

        it('the provided directory (glob pattern)',
          async function (): Promise<void> {
            options.exclude = ['**/fixtures/**'];
            options.verbose = false;
            const sut = await Integrity.createDirHash(fixturesDirPath, options);
            expect(sut).to.be.an('object')
              .and.to.haveOwnProperty('fixtures')
              .and.to.satisfy((hash: string): boolean =>
                checker(hash, utils.base64RegexPattern,
                  'l+RFq7YS2sKbzyhXAzmpiKF3YdDLkORqI3YQiFZzcPN8' +
                  'Qi7QGADl3AvE53yS4vPJGaEGVOTwx/hPkei+Ttr7jQ==',
                  'sha512'));
          });

        it('the provided subdirectory',
          async function (): Promise<void> {
            options.exclude = ['directory'];
            options.verbose = false;
            const sut = await Integrity.createDirHash(fixturesDirPath, options);
            expect(sut).to.be.an('object')
              .and.to.haveOwnProperty('fixtures')
              .and.to.satisfy((hash: string): boolean =>
                checker(hash, utils.base64RegexPattern,
                  'dI656yTlMZ7dYYmsYo4m6P+xxPsNHhMHANEupJhy61i6' +
                  'PqB5H2EUQVWk/ZwDB/djqvc9E+5WV8di/zl5jihFXw==',
                  'sha512'));
          });

        it('the provided subdirectory (leading glob pattern)',
          async function (): Promise<void> {
            options.exclude = ['**/directory'];
            options.verbose = false;
            const sut = await Integrity.createDirHash(fixturesDirPath, options);
            expect(sut).to.be.an('object')
              .and.to.haveOwnProperty('fixtures')
              .and.to.satisfy((hash: string): boolean =>
                checker(hash, utils.base64RegexPattern,
                  'Mxema7+o7uDni/0O3OCjsr+CeG05csSon2FK8yYVJkaM' +
                  'WbRoh3Grh6OGuA+zwYqwLjef3w8c0ei8svO5AVQPFw==',
                  'sha512'));
          });

        it('the provided subdirectory (leading / trailing glob pattern)',
          async function (): Promise<void> {
            options.exclude = ['**/directory/**'];
            options.verbose = false;
            const sut = await Integrity.createDirHash(fixturesDirPath, options);
            expect(sut).to.be.an('object')
              .and.to.haveOwnProperty('fixtures')
              .and.to.satisfy((hash: string): boolean =>
                checker(hash, utils.base64RegexPattern,
                  'Mxema7+o7uDni/0O3OCjsr+CeG05csSon2FK8yYVJkaM' +
                  'WbRoh3Grh6OGuA+zwYqwLjef3w8c0ei8svO5AVQPFw==',
                  'sha512'));
          });

      });

      context('in verbosely computation', function (): void {

        beforeEach(function (): void {
          options.verbose = true;
        });

        it(`everything but the negated`, async function (): Promise<void> {
          options.exclude = ['*', '*/', '!fixtures'];

          const sut = await Integrity.createDirHash('./test', options);

          expect(sut).to.be.an('object')
            .and.to.haveOwnProperty('test');
          const root = sut.test as VerboseHashObject;
          expect(root.hash).to.satisfy((hash: string): boolean =>
            checker(hash, utils.base64RegexPattern,
              'sH3FNHzynm2mQIN1RxoJ1RdKgJvZhyEjJ9amF4sO24mh' +
              'Siye/zr0DbLwEL+XN/BS7gbI3YlqWx60Q2pTQzW75g==',
              'sha512'));
        });

        it('the provided root file',
          async function (): Promise<void> {
            options.exclude = [fileToHashFilename];
            const sut = await Integrity.createDirHash(fixturesDirPath, options);
            expect(sut).to.be.an('object').and.to.haveOwnProperty('fixtures');
            const fixtures = sut.fixtures as VerboseHashObject;
            expect(fixtures.contents).to.not.haveOwnProperty(fileToHashFilename);
            const fcfixtures = fixtures.contents.fixtures as VerboseHashObject;
            expect(fcfixtures.contents).to.haveOwnProperty(fileToHashFilename);
            expect(fixtures.hash)
              .to.satisfy((hash: string): boolean =>
                checker(hash, utils.base64RegexPattern,
                  'yTngky0kneOY4JOKvrbfRDk3VNWhDs90Gp7rlNpbQPy0' +
                  'Gfw9Qo7dBFT+yqZieA5HYeOKULyPBOUQrMng/pfzkw==',
                  'sha512'));
          });

        it('the provided file (leading glob pattern)',
          async function (): Promise<void> {
            options.exclude = [`**/${fileToHashFilename}`];
            const sut = await Integrity.createDirHash(fixturesDirPath, options);
            expect(sut).to.be.an('object').and.to.haveOwnProperty('fixtures');
            const fixtures = sut.fixtures as VerboseHashObject;
            expect(fixtures.contents).to.not.haveOwnProperty(fileToHashFilename);
            const fcfixtures = fixtures.contents.fixtures as VerboseHashObject;
            expect(fcfixtures.contents).to.not.haveOwnProperty(fileToHashFilename);
            expect(fixtures.hash)
              .to.satisfy((hash: string): boolean =>
                checker(hash, utils.base64RegexPattern,
                  'Sh3ed4hhzI8eSodzoJphpTle3D9uimG+srSpn0g8OLqW' +
                  '5F2GTp2az4L5iE/haYpFRCv1pHqP4LoFXJc+0dtgaQ==',
                  'sha512'));
          });

        it('the provided files',
          async function (): Promise<void> {
            options.exclude = [fileToHashFilename, `**/${otherFileToHashFilename}`];
            const sut = await Integrity.createDirHash(fixturesDirPath, options);
            expect(sut).to.be.an('object').and.to.haveOwnProperty('fixtures');
            const fixtures = sut.fixtures as VerboseHashObject;
            expect(fixtures.contents).to.not.haveOwnProperty(fileToHashFilename);
            const fcdirectorydot1 = fixtures.contents['directory.1'] as VerboseHashObject;
            expect(fcdirectorydot1.contents).to.not.haveOwnProperty(otherFileToHashFilename);
            const fcdirectory = fixtures.contents.directory as VerboseHashObject;
            expect(fcdirectory.contents).to.not.haveOwnProperty(otherFileToHashFilename);
            const fcfixtures = fixtures.contents.fixtures as VerboseHashObject;
            expect(fcfixtures.contents).to.haveOwnProperty(fileToHashFilename);
            const fcfcdirectorydot1 = fcfixtures.contents['directory.1'] as VerboseHashObject;
            expect(fcfcdirectorydot1.contents).to.not.haveOwnProperty(otherFileToHashFilename);
            const fcfcdirectory = fcfixtures.contents.directory as VerboseHashObject;
            expect(fcfcdirectory.contents).to.not.haveOwnProperty(otherFileToHashFilename);
            expect(fixtures.hash)
              .to.satisfy((hash: string): boolean =>
                checker(hash, utils.base64RegexPattern,
                  'Wk6BW5uO0UZfXTgY7wLqoY9bNzA+PyyE9j6n63QpXu9J' +
                  'hZW01gpxczrAqOXWaSf137c5VUYhQSbviRtDRAGOeg==',
                  'sha512'));
          });

        it('the provided files (leading glob pattern)',
          async function (): Promise<void> {
            options.exclude = [`**/${fileToHashFilename}`, `**/${otherFileToHashFilename}`];
            const sut = await Integrity.createDirHash(fixturesDirPath, options);
            expect(sut).to.be.an('object').and.to.haveOwnProperty('fixtures');
            const fixtures = sut.fixtures as VerboseHashObject;
            expect(fixtures.contents).to.not.haveOwnProperty(fileToHashFilename);
            const fcfixtures = fixtures.contents.fixtures as VerboseHashObject;
            expect(fcfixtures.contents).to.not.haveOwnProperty(fileToHashFilename);
            expect(fixtures.hash)
              .to.satisfy((hash: string): boolean =>
                checker(hash, utils.base64RegexPattern,
                  'D5JDvAmGPhnjGqzANq7d1PyuAcamcOUeZnTW8ziOQ8YI' +
                  'KT27zUArHQfkI0sro+62AQPr/GzVa5MBqDh0GiabrQ==',
                  'sha512'));
          });

        it(`all root 'txt' files (glob pattern)`,
          async function (): Promise<void> {
            options.exclude = ['*.txt'];
            const sut = await Integrity.createDirHash(fixturesDirPath, options);
            expect(sut).to.be.an('object').and.to.haveOwnProperty('fixtures');
            const fixtures = sut.fixtures as VerboseHashObject;
            expect(fixtures.contents).to.not.haveOwnProperty(fileToHashFilename);
            expect(fixtures.contents).to.not.haveOwnProperty('sameContentWithFileToHash.txt');
            const fcfixtures = fixtures.contents.fixtures as VerboseHashObject;
            expect(fcfixtures.contents).to.haveOwnProperty(fileToHashFilename);
            expect(fixtures.hash)
              .to.satisfy((hash: string): boolean =>
                checker(hash, utils.base64RegexPattern,
                  'VegLTUIJV6ET06h8wMXtf+VF2BDVEHd8n2NngoubqzhR' +
                  'i5LLGhJ8bljcSstaEV6CcH2qqz7G4IOJAlOXSqca4A==',
                  'sha512'));
          });

        it(`all 'txt' files (leading glob pattern)`,
          async function (): Promise<void> {
            options.exclude = ['**/*.txt'];
            const sut = await Integrity.createDirHash(fixturesDirPath, options);
            expect(sut).to.be.an('object').that.is.empty;
          });

        it('all root files (glob pattern)',
          async function (): Promise<void> {
            options.exclude = ['*.*'];
            const sut = await Integrity.createDirHash(fixturesDirPath, options);
            expect(sut).to.be.an('object')
              .and.to.haveOwnProperty('fixtures');
            const fixtures = sut.fixtures as VerboseHashObject;
            expect(fixtures.contents).to.not.haveOwnProperty(fileToHashFilename);
            expect(fixtures.contents).to.not.haveOwnProperty('sameContentWithFileToHash.txt');
            expect(fixtures.contents).to.haveOwnProperty('directory.1');
            expect(fixtures.contents).to.haveOwnProperty('directory');
            expect(fixtures.contents).to.haveOwnProperty('fixtures');
            expect(fixtures.hash)
              .to.satisfy((hash: string): boolean =>
                checker(hash, utils.base64RegexPattern,
                  'VegLTUIJV6ET06h8wMXtf+VF2BDVEHd8n2NngoubqzhR' +
                  'i5LLGhJ8bljcSstaEV6CcH2qqz7G4IOJAlOXSqca4A==',
                  'sha512'));
          });

        it('all dotted root directories (glob pattern)',
          async function (): Promise<void> {
            options.exclude = ['*.*/'];
            const sut = await Integrity.createDirHash(fixturesDirPath, options);
            expect(sut).to.be.an('object')
              .and.to.haveOwnProperty('fixtures');
            const fixtures = sut.fixtures as VerboseHashObject;
            expect(fixtures.contents).to.haveOwnProperty(fileToHashFilename);
            expect(fixtures.contents).to.haveOwnProperty('sameContentWithFileToHash.txt');
            expect(fixtures.contents).to.not.haveOwnProperty('directory.1');
            expect(fixtures.contents).to.haveOwnProperty('directory');
            expect(fixtures.contents).to.haveOwnProperty('fixtures');
            const ffixtures = fixtures.contents.fixtures as VerboseHashObject;
            expect(ffixtures.contents).to.haveOwnProperty('directory.1');
            expect(fixtures.hash)
              .to.satisfy((hash: string): boolean =>
                checker(hash, utils.base64RegexPattern,
                  'YO+lMzZetbscCuJcmQ+Gvawbkm2qb4AXPxYXge62cSZB' +
                  'fVUuC8FDZ96VvqDB/SSIQO0tPDhGzxa1ueshcpy/bw==',
                  'sha512'));
          });

        it('all files (leading glob pattern)',
          async function (): Promise<void> {
            options.exclude = ['**/*.*'];
            const sut = await Integrity.createDirHash(fixturesDirPath, options);
            expect(sut).to.be.an('object').that.is.empty;
          });

        it('everything',
          async function (): Promise<void> {
            options.exclude = ['**'];
            const sut = await Integrity.createDirHash(fixturesDirPath, options);
            expect(sut).to.be.an('object').that.is.empty;
          });

        it('everything (leading glob pattern)',
          async function (): Promise<void> {
            options.exclude = ['**/'];
            const sut = await Integrity.createDirHash(fixturesDirPath, options);
            expect(sut).to.be.an('object').that.is.empty;
          });

        it('everything (leading / trailing glob pattern)',
          async function (): Promise<void> {
            options.exclude = ['**/*'];
            const sut = await Integrity.createDirHash(fixturesDirPath, options);
            expect(sut).to.be.an('object').that.is.empty;
          });

        it('the provided directory',
          async function (): Promise<void> {
            options.exclude = ['fixtures'];
            const sut = await Integrity.createDirHash(fixturesDirPath, options);
            expect(sut).to.be.an('object')
              .and.to.haveOwnProperty('fixtures');
            const fixtures = sut.fixtures as VerboseHashObject;
            expect(fixtures.contents).to.haveOwnProperty(fileToHashFilename);
            expect(fixtures.contents).to.haveOwnProperty('sameContentWithFileToHash.txt');
            expect(fixtures.contents).to.haveOwnProperty('directory');
            expect(fixtures.contents).to.haveOwnProperty('directory.1');
            expect(fixtures.contents).to.not.haveOwnProperty('fixtures');
            expect(fixtures.hash)
              .to.satisfy((hash: string): boolean =>
                checker(hash, utils.base64RegexPattern,
                  'l+RFq7YS2sKbzyhXAzmpiKF3YdDLkORqI3YQiFZzcPN8' +
                  'Qi7QGADl3AvE53yS4vPJGaEGVOTwx/hPkei+Ttr7jQ==',
                  'sha512'));
          });

        it('the provided subdirectory (leading glob pattern)',
          async function (): Promise<void> {
            options.exclude = ['**/fixtures'];
            const sut = await Integrity.createDirHash(fixturesDirPath, options);
            expect(sut).to.be.an('object')
              .and.to.haveOwnProperty('fixtures');
            const fixtures = sut.fixtures as VerboseHashObject;
            expect(fixtures.contents).to.haveOwnProperty(fileToHashFilename);
            expect(fixtures.contents).to.haveOwnProperty('sameContentWithFileToHash.txt');
            expect(fixtures.contents).to.haveOwnProperty('directory');
            expect(fixtures.contents).to.haveOwnProperty('directory.1');
            expect(fixtures.contents).to.not.haveOwnProperty('fixtures');
            expect(fixtures.hash)
              .to.satisfy((hash: string): boolean =>
                checker(hash, utils.base64RegexPattern,
                  'l+RFq7YS2sKbzyhXAzmpiKF3YdDLkORqI3YQiFZzcPN8' +
                  'Qi7QGADl3AvE53yS4vPJGaEGVOTwx/hPkei+Ttr7jQ==',
                  'sha512'));
          });

        it('the provided subdirectory',
          async function (): Promise<void> {
            options.exclude = ['fixtures/'];
            const sut = await Integrity.createDirHash(fixturesDirPath, options);
            expect(sut).to.be.an('object')
              .and.to.haveOwnProperty('fixtures');
            const fixtures = sut.fixtures as VerboseHashObject;
            expect(fixtures.contents).to.haveOwnProperty(fileToHashFilename);
            expect(fixtures.contents).to.haveOwnProperty('sameContentWithFileToHash.txt');
            expect(fixtures.contents).to.haveOwnProperty('directory');
            expect(fixtures.contents).to.haveOwnProperty('directory.1');
            expect(fixtures.contents).to.not.haveOwnProperty('fixtures');
            expect(fixtures.hash)
              .to.satisfy((hash: string): boolean =>
                checker(hash, utils.base64RegexPattern,
                  'l+RFq7YS2sKbzyhXAzmpiKF3YdDLkORqI3YQiFZzcPN8' +
                  'Qi7QGADl3AvE53yS4vPJGaEGVOTwx/hPkei+Ttr7jQ==',
                  'sha512'));
          });

        it('the provided directory contents (glob pattern)',
          async function (): Promise<void> {
            options.exclude = ['**/fixtures/**'];
            const sut = await Integrity.createDirHash(fixturesDirPath, options);
            expect(sut).to.be.an('object')
              .and.to.haveOwnProperty('fixtures');
            const fixtures = sut.fixtures as VerboseHashObject;
            expect(fixtures.contents).to.haveOwnProperty(fileToHashFilename);
            expect(fixtures.contents).to.haveOwnProperty('sameContentWithFileToHash.txt');
            expect(fixtures.contents).to.haveOwnProperty('directory');
            expect(fixtures.contents).to.haveOwnProperty('directory.1');
            expect(fixtures.contents).to.not.haveOwnProperty('fixtures');
            expect(fixtures.hash)
              .to.satisfy((hash: string): boolean =>
                checker(hash, utils.base64RegexPattern,
                  'l+RFq7YS2sKbzyhXAzmpiKF3YdDLkORqI3YQiFZzcPN8' +
                  'Qi7QGADl3AvE53yS4vPJGaEGVOTwx/hPkei+Ttr7jQ==',
                  'sha512'));
          });

        it('the provided subdirectory',
          async function (): Promise<void> {
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
              .and.that.to.haveOwnProperty('directory');
            const fixtures = sut.fixtures as VerboseHashObject;
            expect(fixtures.hash)
              .to.satisfy((hash: string): boolean =>
                checker(hash, utils.base64RegexPattern,
                  'dI656yTlMZ7dYYmsYo4m6P+xxPsNHhMHANEupJhy61i6' +
                  'PqB5H2EUQVWk/ZwDB/djqvc9E+5WV8di/zl5jihFXw==',
                  'sha512'));
          });

        it('the provided subdirectory (leading glob pattern)',
          async function (): Promise<void> {
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
            const fixtures = sut.fixtures as VerboseHashObject;
            expect(fixtures.hash)
              .and.to.satisfy((hash: string): boolean =>
                checker(hash, utils.base64RegexPattern,
                  'Mxema7+o7uDni/0O3OCjsr+CeG05csSon2FK8yYVJkaM' +
                  'WbRoh3Grh6OGuA+zwYqwLjef3w8c0ei8svO5AVQPFw==',
                  'sha512'));
          });

        it('the provided subdirectory (leading / trailing glob pattern)',
          async function (): Promise<void> {
            options.exclude = ['**/directory/**'];
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
            const fixtures = sut.fixtures as VerboseHashObject;
            expect(fixtures.hash)
              .and.to.satisfy((hash: string): boolean =>
                checker(hash, utils.base64RegexPattern,
                  'Mxema7+o7uDni/0O3OCjsr+CeG05csSon2FK8yYVJkaM' +
                  'WbRoh3Grh6OGuA+zwYqwLjef3w8c0ei8svO5AVQPFw==',
                  'sha512'));
          });

      });

    });

    context('to include', function (): void {

      context('in verbosely computation', function (): void {

        beforeEach(function (): void {
          options.verbose = true;
        });

        it('the provided root file (glob pattern)',
          async function (): Promise<void> {
            options.exclude = ['*', '*/', '!fileToHash.txt'];
            const sut = await Integrity.createDirHash(fixturesDirPath, options);
            expect(sut).to.be.an('object')
              .and.to.haveOwnProperty('fixtures');
            const fixtures = sut.fixtures as VerboseHashObject;
            expect(fixtures).and.that.to.haveOwnProperty('contents');
            expect(fixtures.contents)
              .to.haveOwnProperty(fileToHashFilename)
              .and.to.satisfy((hash: string): boolean =>
                checker(hash, utils.base64RegexPattern, 'H58mYNjbMJTkiNvvNfj2YKl3ck0='));
            expect(fixtures.hash)
              .and.to.satisfy((hash: string): boolean =>
                checker(hash, utils.base64RegexPattern,
                  'jU0ENm52s6vv8Qk4naKzQ+ldqOTpVnpla7bHLN7gkrlB' +
                  'Qn58ORW+wjpFQmrxnqsDjqlvIFjTuNrq8UzKYRT4SQ==',
                  'sha512'));
          });

        it('only the provided subdirectory file (leading glob pattern)',
          async function (): Promise<void> {
            options.exclude = ['*', '*/', '!fixtures/fileToHash.txt'];
            const sut = await Integrity.createDirHash(fixturesDirPath, options);
            expect(sut).to.be.an('object');
            expect(sut)
              .to.haveOwnProperty('fixtures')
              .and.that.to.haveOwnProperty('contents');
            const fixtures = sut.fixtures as VerboseHashObject;
            expect(fixtures.contents).to.haveOwnProperty('fixtures');
            expect(fixtures.contents).to.not.haveOwnProperty('directory');
            expect(fixtures.contents).to.not.haveOwnProperty('directory.1');
            expect(fixtures.contents).to.not.haveOwnProperty(fileToHashFilename);
            expect(fixtures.contents).to.not.haveOwnProperty('sameContentWithFileToHash.txt');
            const fcfixtures = fixtures.contents.fixtures as VerboseHashObject;
            expect(fcfixtures.contents)
              .to.haveOwnProperty(fileToHashFilename)
              .and.to.satisfy((hash: string): boolean =>
                checker(hash, utils.base64RegexPattern, 't56X7IQ267Hza0qjpSpqb9UPcfE='));
            expect(fcfixtures.hash)
              .and.to.satisfy((hash: string): boolean =>
                checker(hash, utils.base64RegexPattern,
                  'xsFFG6BuNpe8Q9hxyOCgGPY1ZXSnd7uEPG0LfmjSz/g8' +
                  '8weE01dXScfFEy5ItkDDqYioR75treREV2yMT6dUoQ==',
                  'sha512'));
            expect(fixtures.hash)
              .and.to.satisfy((hash: string): boolean =>
                checker(hash, utils.base64RegexPattern,
                  'i066+5P7XKubRVkelKvC9+cNxMe9uPA3cgkre24Tp5+l' +
                  'CUSdeHGtkgsYi6Obhe30gTiv3wMpXsl1pCCEofVTWw==',
                  'sha512'));
          });

        it('only the provided subdirectory file (leading glob pattern)',
          async function (): Promise<void> {
            options.exclude = ['*', '*/', '!**/fixtures/fileToHash.txt'];
            const sut = await Integrity.createDirHash(fixturesDirPath, options);
            expect(sut).to.be.an('object').and.to.haveOwnProperty('fixtures');
            const fixtures = sut.fixtures as VerboseHashObject;
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
              .and.to.satisfy((hash: string): boolean =>
                checker(hash, utils.base64RegexPattern, 't56X7IQ267Hza0qjpSpqb9UPcfE='));
            const fcfixtures = fixtures.contents.fixtures as VerboseHashObject;
            expect(fcfixtures.hash)
              .and.to.satisfy((hash: string): boolean =>
                checker(hash, utils.base64RegexPattern,
                  'xsFFG6BuNpe8Q9hxyOCgGPY1ZXSnd7uEPG0LfmjSz/g8' +
                  '8weE01dXScfFEy5ItkDDqYioR75treREV2yMT6dUoQ==',
                  'sha512'));
            expect(fixtures.hash)
              .and.to.satisfy((hash: string): boolean =>
                checker(hash, utils.base64RegexPattern,
                  'i066+5P7XKubRVkelKvC9+cNxMe9uPA3cgkre24Tp5+l' +
                  'CUSdeHGtkgsYi6Obhe30gTiv3wMpXsl1pCCEofVTWw==',
                  'sha512'));
          });

        it('only the provided root directory contents (glob pattern)',
          async function (): Promise<void> {
            options.exclude = ['*', '*/', '!*.txt'];
            const sut = await Integrity.createDirHash(fixturesDirPath, options);
            expect(sut).to.be.an('object');
            expect(sut)
              .to.haveOwnProperty('fixtures')
              .and.that.to.haveOwnProperty('contents');
            const fixtures = sut.fixtures as VerboseHashObject;
            expect(fixtures.contents).not.to.haveOwnProperty('fixtures');
            expect(fixtures.contents).not.to.haveOwnProperty('directory');
            expect(fixtures.contents).not.to.haveOwnProperty('directory.1');
            expect(fixtures.contents)
              .to.haveOwnProperty('sameContentWithFileToHash.txt')
              .and.to.satisfy((hash: string): boolean =>
                checker(hash, utils.base64RegexPattern, 'l5sOr3meWkHyZWPi2Ln4GM7/lrg='));
            expect(fixtures.contents)
              .to.haveOwnProperty(fileToHashFilename)
              .and.to.satisfy((hash: string): boolean =>
                checker(hash, utils.base64RegexPattern, 'H58mYNjbMJTkiNvvNfj2YKl3ck0='));
            expect(fixtures.hash)
              .and.to.satisfy((hash: string): boolean =>
                checker(hash, utils.base64RegexPattern,
                  'SUoveyMtTFO5zEKmSjLk9nFOGBezDdqpD5DJiNYasQ17' +
                  'E4fV58BuSRM0jbQhw6iG6Iq4rnZ53Aaw3vzFWaLHWA==',
                  'sha512'));
          });

        it('only the provided subdirectory contents (glob pattern)',
          async function (): Promise<void> {
            options.exclude = ['*', '*/', '!directory/*.txt'];
            const sut = await Integrity.createDirHash(fixturesDirPath, options);
            expect(sut).to.be.an('object');
            expect(sut)
              .to.haveOwnProperty('fixtures')
              .and.that.to.haveOwnProperty('contents')
              .and.that.to.haveOwnProperty('directory')
              .and.that.to.haveOwnProperty('contents');
            const fixtures = sut.fixtures as VerboseHashObject;
            expect(fixtures.contents).not.to.haveOwnProperty('fixtures');
            expect(fixtures.contents).not.to.haveOwnProperty('directory.1');
            expect(fixtures.contents).not.to.haveOwnProperty(fileToHashFilename);
            expect(fixtures.contents).not.to.haveOwnProperty('sameContentWithFileToHash.txt');
            const fcdirectory = fixtures.contents.directory as VerboseHashObject;
            expect(fcdirectory.contents)
              .to.haveOwnProperty('anotherFileToHash.txt')
              .and.to.satisfy((hash: string): boolean =>
                checker(hash, utils.base64RegexPattern, 'EZ2w0rsSmXBOddIoz2IoOIuxGaQ='));
            expect(fcdirectory.contents)
              .to.haveOwnProperty(otherFileToHashFilename)
              .and.to.satisfy((hash: string): boolean =>
                checker(hash, utils.base64RegexPattern, 'B8FJ4uKgHESSgMvJUyrj3ix2uG8='));
            expect(fcdirectory.hash)
              .and.to.satisfy((hash: string): boolean =>
                checker(hash, utils.base64RegexPattern,
                  'Ze62278vNFKc3izakn2FgyvHIZEbnsuqKogaZLA1ihM1' +
                  'zk95RKlz+z7qk1XEysMaoJlpDNqSWx4PoPp2cFNBPw==',
                  'sha512'));
            expect(fixtures.hash)
              .and.to.satisfy((hash: string): boolean =>
                checker(hash, utils.base64RegexPattern,
                  'wfY0H0xgB1h2jlkg11q56mX6EgiGEpEpGFxpspUGjG+G' +
                  'WZlgdfY26wFIdZh7+XP0lD82aZQ+femT4DL7yb82vQ==',
                  'sha512'));
          });

        it('only the provided sub-subdirectory contents (glob pattern)',
          async function (): Promise<void> {
            options.exclude = ['*', '*/', '!fixtures/directory/*.txt'];
            const sut = await Integrity.createDirHash(fixturesDirPath, options);
            expect(sut).to.be.an('object');
            expect(sut)
              .to.haveOwnProperty('fixtures')
              .and.that.to.haveOwnProperty('contents')
              .and.that.to.haveOwnProperty('fixtures')
              .and.that.to.haveOwnProperty('contents')
              .and.that.to.haveOwnProperty('directory')
              .and.that.to.haveOwnProperty('contents');
            const fixtures = sut.fixtures as VerboseHashObject;
            expect(fixtures.contents).not.to.haveOwnProperty('directory');
            expect(fixtures.contents).not.to.haveOwnProperty('directory.1');
            expect(fixtures.contents).not.to.haveOwnProperty(fileToHashFilename);
            expect(fixtures.contents).not.to.haveOwnProperty('sameContentWithFileToHash.txt');
            const fcfixtures = fixtures.contents.fixtures as VerboseHashObject;
            const fcfcdirectory = fcfixtures.contents.directory as VerboseHashObject;
            expect(fcfcdirectory.contents)
              .to.haveOwnProperty('anotherFileToHash.txt')
              .and.to.satisfy((hash: string): boolean =>
                checker(hash, utils.base64RegexPattern, 'EZ2w0rsSmXBOddIoz2IoOIuxGaQ='));
            expect(fcfcdirectory.hash)
              .to.satisfy((hash: string): boolean =>
                checker(hash, utils.base64RegexPattern,
                  'a7F1/1x1ZVAWMdcx7X9Dnzd9M4TY9wU21vNCt3ALW0+0' +
                  'npq85MKn7uhz8yGqjDbSmAUDf14uxgqjk2tMtkjK9w==',
                  'sha512'));
            expect(fcfixtures.hash)
              .to.satisfy((hash: string): boolean =>
                checker(hash, utils.base64RegexPattern,
                  '7W3X/cw2xfp4tzXjZnSXMazukk05OUOBiH19fQRzTTh4' +
                  'He7Iw7j5ixw8NJlE2Z0+Pm689Bma7C1QjGCG2rpzQQ==',
                  'sha512'));
            expect(fixtures.hash)
              .to.satisfy((hash: string): boolean =>
                checker(hash, utils.base64RegexPattern,
                  '5mlonOfv9vOYfhLbrc0ftNGl7nySaYSkhjYuQ2tUgj6p' +
                  'lSzRfkz2+RtSxw6LzMhYJ1HILFTSy5Guc1ruhMsPKQ==',
                  'sha512'));
          });
      });

    });

  });

});
