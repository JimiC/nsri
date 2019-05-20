// tslint:disable only-arrow-functions
// tslint:disable no-unused-expression
import { expect } from 'chai';
import path from 'path';
import sinon from 'sinon';
import { Integrity } from '../../src/app/integrity';
import * as utils from '../../src/common/utils';
import { IntegrityOptions } from '../../src/interfaces/integrityOptions';

describe(`Integrity: function 'check' tests`, function (): void {

  context('expects', function (): void {

    let anotherFileToHashFilename: string;
    let fileToHashFilename: string;
    let integrityTestFilename: string;
    let directoryDirPath: string;
    let fixturesDirPath: string;
    let anotherFileToHashFilePath: string;
    let fileToHashFilePath: string;
    let integrityTestFilePath: string;

    before(function (): void {
      anotherFileToHashFilename = 'anotherFileToHash.txt';
      fileToHashFilename = 'fileToHash.txt';
      integrityTestFilename = '.integrity.json';
    });

    let options: IntegrityOptions;
    let sandbox: sinon.SinonSandbox;

    beforeEach(function (): void {
      sandbox = sinon.createSandbox();
      fixturesDirPath = path.resolve(__dirname, '../../../test/fixtures/');
      directoryDirPath = path.resolve(fixturesDirPath, 'directory');
      anotherFileToHashFilePath = path.resolve(directoryDirPath, anotherFileToHashFilename);
      fileToHashFilePath = path.resolve(fixturesDirPath, fileToHashFilename);
      integrityTestFilePath = path.resolve(fixturesDirPath, integrityTestFilename);
      options = {
        cryptoOptions: undefined,
        exclude: undefined,
        verbose: undefined,
      };
    });

    afterEach(function (): void {
      sandbox.restore();
    });

    context(`to throw an Error when 'integrity'`, function (): void {

      it('is a file path and filename is invalid',
        async function (): Promise<void> {
          // @ts-ignore
          const existsStub = sandbox.stub(Integrity, '_exists')
            .returns(true);
          // @ts-ignore
          const lstatStub = sandbox.stub(Integrity, '_lstat')
            .returns({ isDirectory: (): boolean => false, isFile: (): boolean => true });
          try {
            await Integrity.check(fileToHashFilePath, 'package.json');
          } catch (error) {
            expect(existsStub.called).to.be.true;
            expect(lstatStub.called).to.be.true;
            expect(error).to.be.an.instanceof(Error).and.match(/EINVNAME/);
          }
        });

      it('versions differ',
        async function (): Promise<void> {
          const hashObj = '{"version":"2","hashes":{"fileToHash.txt":"7a3d5b475bd07ae9041fab2a133f40c4"}}';
          // @ts-ignore
          sandbox.stub(Integrity, '_validate').resolves();
          try {
            await Integrity.check(fileToHashFilePath, hashObj);
          } catch (error) {
            expect(error).to.be.an.instanceof(Error)
              .and.match(/EINVER/)
              .and.match(/Incompatible versions check/);
          }
        });

      it('schema is not valid',
        function (): void {
          const hashObj = '{"version":"1","fileToHash.txt":"7a3d5b475bd07ae9041fab2a133f40c4"}';
          Integrity.check(fileToHashFilePath, hashObj).catch(err => {
            expect(err).to.be.an.instanceof(Error).and.match(/EVALER/);
          });
        });

      it('path is other than a file or a directory',
        async function (): Promise<void> {
          // @ts-ignore
          const lstatStub = sandbox.stub(Integrity, '_lstat')
            .returns({ isDirectory: (): boolean => false, isFile: (): boolean => false });
          try {
            await Integrity.check(fileToHashFilePath, integrityTestFilePath);
          } catch (error) {
            expect(lstatStub.called).to.be.true;
            expect(error).to.be.an.instanceof(Error).and.match(/ENOSUP/);
          }
        });

    });

    context('to fail integrity check when', function (): void {

      it('input path is an empty string',
        async function (): Promise<void> {
          const sut = await Integrity.check('', integrityTestFilePath);
          expect(sut).to.be.a('boolean').and.to.be.false;
        });

      it('input path is other than a file path or a directory path',
        function (): void {
          // @ts-ignore
          Integrity.check({}, integrityTestFilePath).then(sut =>
            expect(sut).to.be.a('boolean').and.to.be.false);
          // @ts-ignore
          Integrity.check(0, integrityTestFilePath).then(sut =>
            expect(sut).to.be.a('boolean').and.to.be.false);
          // @ts-ignore
          Integrity.check(true, integrityTestFilePath).then(sut =>
            expect(sut).to.be.a('boolean').and.to.be.false);
          // @ts-ignore
          Integrity.check(null, integrityTestFilePath).then(sut =>
            expect(sut).to.be.a('boolean').and.to.be.false);
          // @ts-ignore
          Integrity.check(undefined, integrityTestFilePath).then(sut =>
            expect(sut).to.be.a('boolean').and.to.be.false);
          // @ts-ignore
          Integrity.check(Symbol(), integrityTestFilePath).then(sut =>
            expect(sut).to.be.a('boolean').and.to.be.false);
        });

      it('integrity JSON is empty',
        function (): void {
          Integrity.check(fileToHashFilePath, '{}').catch(err => {
            expect(err).to.be.an.instanceof(Error);
          });
        });

      it('integrity is an empty string',
        async function (): Promise<void> {
          const sut = await Integrity.check(fileToHashFilePath, '');
          expect(sut).to.be.a('boolean').and.to.be.false;
        });

      it('integrity is other than a file path, a directory path, a JSON or a hash string',
        function (): void {
          // @ts-ignore
          Integrity.check(fileToHashFilePath, {}).then(sut =>
            expect(sut).to.be.a('boolean').and.to.be.false);
          // @ts-ignore
          Integrity.check(fileToHashFilePath, 0).then(sut =>
            expect(sut).to.be.a('boolean').and.to.be.false);
          // @ts-ignore
          Integrity.check(fileToHashFilePath, true).then(sut =>
            expect(sut).to.be.a('boolean').and.to.be.false);
          // @ts-ignore
          Integrity.check(fileToHashFilePath, null).then(sut =>
            expect(sut).to.be.a('boolean').and.to.be.false);
          // @ts-ignore
          Integrity.check(fileToHashFilePath, undefined).then(sut =>
            expect(sut).to.be.a('boolean').and.to.be.false);
          // @ts-ignore
          Integrity.check(fileToHashFilePath, Symbol()).then(sut =>
            expect(sut).to.be.a('boolean').and.to.be.false);
        });

      context('integrity file content is', function (): void {

        it('empty',
          async function (): Promise<void> {
            // @ts-ignore
            const readFileStub = sandbox.stub(Integrity, '_readFile').returns('');
            try {
              await Integrity.check(fileToHashFilePath, integrityTestFilePath);
            } catch (error) {
              expect(readFileStub.called).to.be.true;
              expect(error).to.be.an.instanceof(Error);
            }
          });

        it('invalid',
          async function (): Promise<void> {
            // @ts-ignore
            const readFileStub = sandbox.stub(Integrity, '_readFile')
              .returns('invalid integrity object');
            try {
              await Integrity.check(fileToHashFilePath, integrityTestFilePath);
            } catch (error) {
              expect(readFileStub.called).to.be.true;
              expect(error).to.be.an.instanceof(Error);
            }
          });

      });

    });

    context('when the provided input path', function (): void {

      context('is a file', function (): void {

        context('and using root integrity file', function (): void {

          context('to pass integrity check', function (): void {

            it('provided a file path',
              async function (): Promise<void> {
                const sut = await Integrity.check(fileToHashFilePath, integrityTestFilePath);
                expect(sut).to.be.a('boolean').and.to.be.true;
              });

            it('of a subdirectory input file path',
              async function (): Promise<void> {
                const sut = await Integrity.check(anotherFileToHashFilePath, integrityTestFilePath);
                expect(sut).to.be.a('boolean').and.to.be.true;
              });

            it('provided a directory path',
              async function (): Promise<void> {
                const sut = await Integrity.check(fileToHashFilePath, fixturesDirPath);
                expect(sut).to.be.a('boolean').and.to.be.true;
              });

            it('provided a hash object (JSON)',
              async function (): Promise<void> {
                const hashObj = '{"version":"1","hashes":{"fileToHash.txt":"sha1-H58mYNjbMJTkiNvvNfj2YKl3ck0="}}';
                const sut = await Integrity.check(fileToHashFilePath, hashObj);
                expect(sut).to.be.a('boolean').and.to.be.true;
              });

            it('provided a hash string',
              async function (): Promise<void> {
                const hash = 'sha1-H58mYNjbMJTkiNvvNfj2YKl3ck0=';
                const sut = await Integrity.check(fileToHashFilePath, hash);
                expect(sut).to.be.a('boolean').and.to.be.true;
              });

          });

        });

        context('and using the directory\'s integrity file', function (): void {

          let fixturesSubDirPath: string;

          beforeEach(function (): void {
            fixturesSubDirPath = path.join(fixturesDirPath, 'fixtures');
            fileToHashFilePath = path.resolve(fixturesSubDirPath, fileToHashFilename);
            integrityTestFilePath = path.resolve(fixturesSubDirPath, integrityTestFilename);
          });

          context('to pass integrity check', function (): void {

            it('provided a file path',
              async function (): Promise<void> {
                const sut = await Integrity.check(fileToHashFilePath, integrityTestFilePath);
                expect(sut).to.be.a('boolean').and.to.be.true;
              });

            it('of a subdirectory input file path',
              async function (): Promise<void> {
                const directorySubDirPath = path.join(fixturesSubDirPath, 'directory');
                anotherFileToHashFilePath = path.resolve(directorySubDirPath, anotherFileToHashFilename);
                integrityTestFilePath = path.resolve(directorySubDirPath, integrityTestFilename);
                const sut = await Integrity.check(anotherFileToHashFilePath, integrityTestFilePath);
                expect(sut).to.be.a('boolean').and.to.be.true;
              });

            it('provided a directory path',
              async function (): Promise<void> {
                const sut = await Integrity.check(fileToHashFilePath, fixturesSubDirPath);
                expect(sut).to.be.a('boolean').and.to.be.true;
              });

            it('provided a hash object (JSON)',
              async function (): Promise<void> {
                const hashObj = '{"version":"1","hashes":{"fileToHash.txt":"sha1-t56X7IQ267Hza0qjpSpqb9UPcfE="}}';
                const sut = await Integrity.check(fileToHashFilePath, hashObj);
                expect(sut).to.be.a('boolean').and.to.be.true;
              });

            it('provided a hash string',
              async function (): Promise<void> {
                const hash = 'sha1-t56X7IQ267Hza0qjpSpqb9UPcfE=';
                const sut = await Integrity.check(fileToHashFilePath, hash);
                expect(sut).to.be.a('boolean').and.to.be.true;
              });

          });

        });

        context('and using the parent directory integrity file', function (): void {

          let fixturesSubDirPath: string;

          beforeEach(function (): void {
            fixturesSubDirPath = path.join(fixturesDirPath, 'fixtures');
            fileToHashFilePath = path.resolve(fixturesSubDirPath, fileToHashFilename);
          });

          context('to pass integrity check', function (): void {

            it('provided a file path',
              async function (): Promise<void> {
                const sut = await Integrity.check(fileToHashFilePath, integrityTestFilePath);
                expect(sut).to.be.a('boolean').and.to.be.true;
              });

            it('of a subdirectory input file path',
              async function (): Promise<void> {
                const directorySubDirPath = path.join(fixturesSubDirPath, 'directory');
                anotherFileToHashFilePath = path.resolve(directorySubDirPath, anotherFileToHashFilename);
                integrityTestFilePath = path.resolve(fixturesSubDirPath, integrityTestFilename);
                const sut = await Integrity.check(anotherFileToHashFilePath, integrityTestFilePath);
                expect(sut).to.be.a('boolean').and.to.be.true;
              });

            it('provided a directory path',
              async function (): Promise<void> {
                const sut = await Integrity.check(fileToHashFilePath, fixturesDirPath);
                expect(sut).to.be.a('boolean').and.to.be.true;
              });

            it('provided a hash object (JSON)',
              async function (): Promise<void> {
                const hashObj = '{"version":"1","hashes":{"fileToHash.txt":"sha1-t56X7IQ267Hza0qjpSpqb9UPcfE="}}';
                const sut = await Integrity.check(fileToHashFilePath, hashObj);
                expect(sut).to.be.a('boolean').and.to.be.true;
              });

            it('provided a hash string',
              async function (): Promise<void> {
                const hash = 'sha1-t56X7IQ267Hza0qjpSpqb9UPcfE=';
                const sut = await Integrity.check(fileToHashFilePath, hash);
                expect(sut).to.be.a('boolean').and.to.be.true;
              });

          });

        });

      });

      context('is a directory', function (): void {

        context('to pass integrity check', function (): void {

          it('provided a non-verbosely directory hash',
            async function (): Promise<void> {
              options.verbose = false;
              // @ts-ignore
              sandbox.stub(Integrity, '_readFile')
                .returns('{"version":"1","hashes":{"fixtures":"sha512-' +
                  'WlFP+kAPdHyGd9E8SgkFfxuGvz9l/cqjt8gAhrHDdWLBIkkZGxgxxgpWZuARLVD7ACCxq8rVeNbwNL7NKyeWsA=="}}');
              const sut = await Integrity.check(fixturesDirPath, integrityTestFilePath, options);
              expect(sut).to.be.a('boolean').and.to.be.true;
            });

          it('of a subdirectory input directory path, provided a verbosely directory hash',
            async function (): Promise<void> {
              options.verbose = false;
              const hash = '{"version":"1","hashes":{' +
                '"fixtures":{"contents":{"directory":{"contents":{},' +
                '"hash":"sha512-Ze62278vNFKc3izakn2FgyvHIZEbnsuqKogaZ' +
                'LA1ihM1zk95RKlz+z7qk1XEysMaoJlpDNqSWx4PoPp2cFNBPw=="}},' +
                '"hash":"sha512-WlFP+kAPdHyGd9E8SgkFfxuGvz9l/cqjt8gAh' +
                'rHDdWLBIkkZGxgxxgpWZuARLVD7ACCxq8rVeNbwNL7NKyeWsA=="' +
                '}}}';
              // @ts-ignore
              sandbox.stub(Integrity, '_readFile').returns(hash);
              const sut = await Integrity.check(directoryDirPath, './', options);
              expect(sut).to.be.a('boolean').and.to.be.true;
            });

          it('of a subdirectory input directory path, provided a semi-verbosely directory hash',
            async function (): Promise<void> {
              // This is a scenario that can not happen when using the 'create' function,
              // because hash creation is either verbosely or non-verbosely on all nodes.
              // We cover this scenario, in case the user provides a self-created integrity file.

              options.verbose = true;
              const hash = '{"version":"1","hashes":{"fixtures":{' +
                '"contents":{"directory":"sha512-' +
                'Ze62278vNFKc3izakn2FgyvHIZEbnsuqKogaZLA1ihM1zk95RKlz+z7qk1XEysMaoJlpDNqSWx4PoPp2cFNBPw=="},' +
                '"hash":"sha512-' +
                'WlFP+kAPdHyGd9E8SgkFfxuGvz9l/cqjt8gAhrHDdWLBIkkZGxgxxgpWZuARLVD7ACCxq8rVeNbwNL7NKyeWsA=="}}}';
              // @ts-ignore
              sandbox.stub(Integrity, '_readFile').returns(hash);
              const sut = await Integrity.check(directoryDirPath, integrityTestFilePath, options);
              expect(sut).to.be.a('boolean').and.to.be.true;
            });

        });

        context('to fail integrity check of a subdirectory input directory path', function (): void {

          it('provided a semi-verbosely directory hash and subdirectory hash is empty',
            async function (): Promise<void> {
              // This is a scenario that can not happen when using the 'create' function,
              // because hash creation is either verbosely or non-verbosely on all nodes.
              // We cover this scenario, in case the user provides a self-created integrity file.

              options.verbose = true;
              const hash = '{"version":"1","hashes":{"fixtures":{' +
                '"contents":{"directory":""},' +
                '"hash":"sha1-DIjHOBHMnvpJxM4onkxvXbmcdME="}}}';
              // @ts-ignore
              sandbox.stub(Integrity, '_readFile').returns(hash);
              const sut = await Integrity.check(directoryDirPath, integrityTestFilePath, options);
              expect(sut).to.be.a('boolean').and.to.be.false;
            });

          context('using a parent directory integrity file, ' +
            'provided a non-verbosely directory hash', function (): void {

              it('that is valid',
                async function (): Promise<void> {
                  options.verbose = false;
                  const hash = '{"version":"1","hashes":{"fixtures":' +
                    '"sha512-WlFP+kAPdHyGd9E8SgkFfxuGvz9l/cqjt8gAhrHDd' +
                    'WLBIkkZGxgxxgpWZuARLVD7ACCxq8rVeNbwNL7NKyeWsA=="}}';
                  // @ts-ignore
                  sandbox.stub(Integrity, '_readFile').returns(hash);
                  const sut = await Integrity.check(directoryDirPath, integrityTestFilePath, options);
                  expect(sut).to.be.a('boolean').and.to.be.false;
                });

              it('that is invalid',
                async function (): Promise<void> {
                  options.verbose = false;
                  const hash = '{"version":"1","hashes":{"fixtures":' +
                    '"sha512-Ze62278vNFKc3izakn2FgyvHIZEbnsuqKogaZLA1' +
                    'ihM1zk95RKlz+z7qk1XEysMaoJlpDNqSWx4PoPp2cFNBPw=="}}';
                  // @ts-ignore
                  sandbox.stub(Integrity, '_readFile').returns(hash);
                  const sut = await Integrity.check(directoryDirPath, integrityTestFilePath, options);
                  expect(sut).to.be.a('boolean').and.to.be.false;
                });

            });

        });

        context('and using root integrity file', function (): void {

          context('to pass integrity check', function (): void {

            it('provided a file path',
              async function (): Promise<void> {
                const sut = await Integrity.check(fixturesDirPath, integrityTestFilePath);
                expect(sut).to.be.a('boolean').and.to.be.true;
              });

            it('of a subdirectory input directory path',
              async function (): Promise<void> {
                options.verbose = true;
                const sut = await Integrity.check(directoryDirPath, integrityTestFilePath, options);
                expect(sut).to.be.a('boolean').and.to.be.true;
              });

            it('provided a directory path',
              async function (): Promise<void> {
                const sut = await Integrity.check(fixturesDirPath, fixturesDirPath);
                expect(sut).to.be.a('boolean').and.to.be.true;
              });

            it('provided a non-verbosely hash object (JSON)',
              async function (): Promise<void> {
                options.verbose = false;
                const hashObj = '{"version":"1","hashes":{"fixtures":"sha512-' +
                  'WlFP+kAPdHyGd9E8SgkFfxuGvz9l/cqjt8gAhrHDdWLBIkkZGxgxxgpWZuARLVD7ACCxq8rVeNbwNL7NKyeWsA=="}}';
                const sut = await Integrity.check(fixturesDirPath, hashObj, options);
                expect(sut).to.be.a('boolean').and.to.be.true;
              });

            it('provided a hash string',
              async function (): Promise<void> {
                options.verbose = false;
                const hash = 'sha512-' +
                  'WlFP+kAPdHyGd9E8SgkFfxuGvz9l/cqjt8gAhrHDdWLBIkkZGxgxxgpWZuARLVD7ACCxq8rVeNbwNL7NKyeWsA==';
                const sut = await Integrity.check(fixturesDirPath, hash, options);
                expect(sut).to.be.a('boolean').and.to.be.true;
              });

          });

          context('to fail integrity check', function (): void {

            it('provided a non-verbosely hash object (JSON), against a verbosely created hash',
              async function (): Promise<void> {
                options.verbose = true;
                const hashObj = '{"version":"1","hashes":{"fixtures":"sha512-' +
                  'WlFP+kAPdHyGd9E8SgkFfxuGvz9l/cqjt8gAhrHDdWLBIkkZGxgxxgpWZuARLVD7ACCxq8rVeNbwNL7NKyeWsA=="}}';
                const sut = await Integrity.check(fixturesDirPath, hashObj, options);
                expect(sut).to.be.a('boolean').and.to.be.false;
              });

            it('provided a hash string against a verbosely created hash',
              async function (): Promise<void> {
                options.verbose = true;
                const hash = 'sha512-' +
                  'WlFP+kAPdHyGd9E8SgkFfxuGvz9l/cqjt8gAhrHDdWLBIkkZGxgxxgpWZuARLVD7ACCxq8rVeNbwNL7NKyeWsA==';
                const sut = await Integrity.check(fixturesDirPath, hash, options);
                expect(sut).to.be.a('boolean').and.to.be.false;
              });

          });

        });

        context('and using the directory\'s integrity file', function (): void {

          let fixturesSubDirPath: string;

          beforeEach(function (): void {
            fixturesSubDirPath = path.join(fixturesDirPath, 'fixtures');
            integrityTestFilePath = path.resolve(fixturesSubDirPath, integrityTestFilename);
          });

          context('to pass integrity check', function (): void {

            it('provided a file path',
              async function (): Promise<void> {
                const sut = await Integrity.check(fixturesSubDirPath, integrityTestFilePath);
                expect(sut).to.be.a('boolean').and.to.be.true;
              });

            it('of a subdirectory input file path',
              async function (): Promise<void> {
                const directorySubDirPath = path.join(fixturesSubDirPath, 'directory');
                integrityTestFilePath = path.resolve(directorySubDirPath, integrityTestFilename);
                const sut = await Integrity.check(directorySubDirPath, integrityTestFilePath);
                expect(sut).to.be.a('boolean').and.to.be.true;
              });

            it('provided a directory path',
              async function (): Promise<void> {
                const sut = await Integrity.check(fixturesSubDirPath, fixturesSubDirPath);
                expect(sut).to.be.a('boolean').and.to.be.true;
              });

            it('provided a non-verbosely hash object (JSON)',
              async function (): Promise<void> {
                options.verbose = false;
                const hashObj = '{"version":"1","hashes":{"fixtures":"sha512-' +
                  'rDNKFYBCOuaCzpomiZEGyRLAmc3+IU/HoNj7NiKXqLG90rNko74LwpZ1DYKx+/aJptGTKCr/9mP8ggnl4QVNNw=="}}';
                const sut = await Integrity.check(fixturesSubDirPath, hashObj, options);
                expect(sut).to.be.a('boolean').and.to.be.true;
              });

            it('provided a hash string',
              async function (): Promise<void> {
                options.verbose = false;
                const hash = 'sha512-' +
                  'rDNKFYBCOuaCzpomiZEGyRLAmc3+IU/HoNj7NiKXqLG90rNko74LwpZ1DYKx+/aJptGTKCr/9mP8ggnl4QVNNw==';
                const sut = await Integrity.check(fixturesSubDirPath, hash, options);
                expect(sut).to.be.a('boolean').and.to.be.true;
              });

          });

          context('to fail integrity check', function (): void {

            it('provided a non-verbosely hash object (JSON), against a verbosely created hash',
              async function (): Promise<void> {
                options.verbose = true;
                const hashObj = '{"version":"1","hashes":{"fixtures":"sha512-' +
                  'rDNKFYBCOuaCzpomiZEGyRLAmc3+IU/HoNj7NiKXqLG90rNko74LwpZ1DYKx+/aJptGTKCr/9mP8ggnl4QVNNw=="}}';
                const sut = await Integrity.check(fixturesSubDirPath, hashObj, options);
                expect(sut).to.be.a('boolean').and.to.be.false;
              });

            it('provided a hash string against a verbosely created hash',
              async function (): Promise<void> {
                options.verbose = true;
                const hash = 'sha512-' +
                  'rDNKFYBCOuaCzpomiZEGyRLAmc3+IU/HoNj7NiKXqLG90rNko74LwpZ1DYKx+/aJptGTKCr/9mP8ggnl4QVNNw==';
                const sut = await Integrity.check(fixturesSubDirPath, hash, options);
                expect(sut).to.be.a('boolean').and.to.be.false;
              });

          });

        });

        context('and using the parent directory integrity file', function (): void {

          let fixturesSubDirPath: string;

          beforeEach(function (): void {
            fixturesSubDirPath = path.join(fixturesDirPath, 'fixtures');
          });

          context('to pass integrity check', function (): void {

            it('provided a file path',
              async function (): Promise<void> {
                const sut = await Integrity.check(fixturesSubDirPath, integrityTestFilePath);
                expect(sut).to.be.a('boolean').and.to.be.true;
              });

            it('of a subdirectory input file path',
              async function (): Promise<void> {
                options.verbose = true;
                const directorySubDirPath = path.join(fixturesSubDirPath, 'directory');
                integrityTestFilePath = path.resolve(fixturesSubDirPath, integrityTestFilename);
                const sut = await Integrity.check(directorySubDirPath, integrityTestFilePath, options);
                expect(sut).to.be.a('boolean').and.to.be.true;
              });

            it('provided a directory path',
              async function (): Promise<void> {
                const sut = await Integrity.check(fixturesSubDirPath, fixturesDirPath);
                expect(sut).to.be.a('boolean').and.to.be.true;
              });

            it('provided a non-verbosely hash object (JSON)',
              async function (): Promise<void> {
                options.verbose = false;
                const hashObj = '{"version":"1","hashes":{"fixtures":"sha512-' +
                  'rDNKFYBCOuaCzpomiZEGyRLAmc3+IU/HoNj7NiKXqLG90rNko74LwpZ1DYKx+/aJptGTKCr/9mP8ggnl4QVNNw=="}}';
                const sut = await Integrity.check(fixturesSubDirPath, hashObj, options);
                expect(sut).to.be.a('boolean').and.to.be.true;
              });

            it('provided a hash string',
              async function (): Promise<void> {
                options.verbose = false;
                const hash = 'sha512-' +
                  'rDNKFYBCOuaCzpomiZEGyRLAmc3+IU/HoNj7NiKXqLG90rNko74LwpZ1DYKx+/aJptGTKCr/9mP8ggnl4QVNNw==';
                const sut = await Integrity.check(fixturesSubDirPath, hash, options);
                expect(sut).to.be.a('boolean').and.to.be.true;
              });

          });

          context('to fail integrity check', function (): void {

            it('provided a non-verbosely hash object (JSON), against a verbosely created hash',
              async function (): Promise<void> {
                options.verbose = true;
                const hashObj = '{"version":"1","hashes":{"fixtures":"074e46454b567069ab80df4302605df2"}}';
                const sut = await Integrity.check(fixturesSubDirPath, hashObj, options);
                expect(sut).to.be.a('boolean').and.to.be.false;
              });

            it('provided a hash string against a verbosely created hash',
              async function (): Promise<void> {
                options.verbose = true;
                const hash = '074e46454b567069ab80df4302605df2';
                const sut = await Integrity.check(fixturesSubDirPath, hash, options);
                expect(sut).to.be.a('boolean').and.to.be.false;
              });

          });

        });

      });

    });

    context('when detecting options', function (): void {

      it(`to preserve 'exclude' option`,
        async function (): Promise<void> {
          options.exclude = [fileToHashFilename];
          const sut = await Integrity.check(fixturesDirPath, integrityTestFilePath, options);
          expect(sut).to.be.a('boolean').and.to.be.false;
        });

      it('to bypass detection when all crypto options are provided',
        async function (): Promise<void> {
          options.cryptoOptions = { dirAlgorithm: 'sha512', fileAlgorithm: 'sha1', encoding: 'base64' };
          options.verbose = true;
          const sut = await Integrity.check(fixturesDirPath, integrityTestFilePath, options);
          expect(sut).to.be.a('boolean').and.to.be.true;
        });

      context('to succesfully detect', function (): void {

        it('the options when NOT provided',
          async function (): Promise<void> {
            const sut = await Integrity.check(fixturesDirPath, integrityTestFilePath);
            expect(sut).to.be.a('boolean').and.to.be.true;
          });

        it('the crypto options when NOT provided',
          async function (): Promise<void> {
            options.cryptoOptions = undefined;
            const sut = await Integrity.check(fixturesDirPath, integrityTestFilePath, options);
            expect(sut).to.be.a('boolean').and.to.be.true;
          });

        it('the crypto encoding when NOT provided',
          async function (): Promise<void> {
            options.cryptoOptions = { fileAlgorithm: 'md5' };
            const sut = await Integrity.check(fixturesDirPath, integrityTestFilePath, options);
            expect(sut).to.be.a('boolean').and.to.be.true;
          });

        it('the crypto algorithm when NOT provided',
          async function (): Promise<void> {
            options.cryptoOptions = { encoding: 'latin1' };
            const sut = await Integrity.check(fixturesDirPath, integrityTestFilePath, options);
            expect(sut).to.be.a('boolean').and.to.be.true;
          });

        it(`no 'fileAlgorithm'`,
          async function (): Promise<void> {
            const hashObj = '{"version":"1","hashes":{"fixtures":{' +
              '"contents":{"directory":{' +
              '"contents":{"directory":"md5-123456"},' +
              '"hash":"sha1-123456"},' +
              '"hash":"sha1-123456"},' +
              '"hash":"sha1-123456"}}}';
            const sut = await Integrity.check(fixturesDirPath, hashObj);
            expect(sut).to.be.a('boolean').and.to.be.false;
          });

      });

      context('to fail detection when', function (): void {

        it('the integrity object contains an existing directory/file but has invalid hash object',
          async function (): Promise<void> {
            // This is a scenario that can not happen when using the 'create' function,
            // because hash creation produces a hash string for files.
            // We cover this scenario, in case the user provides a self-created integrity file.

            const hashObj = '{"version":"1","hashes":{"fixtures":{' +
              '"contents":{"fileToHash.txt":{' +
              '"contents":{"anotherFileToHash.txt":"md5123456"},"hash":"sha1-123456"},' +
              '"hash":"sha1-123456"},' +
              '"hash":"sha1-123456"}}}';
            const sut = await Integrity.check(fixturesDirPath, hashObj);
            expect(sut).to.be.a('boolean').and.to.be.false;
          });

        it('provided a file path, the integrity object can not be determined',
          async function (): Promise<void> {
            options.cryptoOptions = { encoding: 'latin1' };
            const resolvedHashObj = await Integrity.create(fixturesDirPath, options);
            const parseStub = sandbox.stub(utils, 'parseJSON')
              .onCall(0).returns(null)
              .returns(resolvedHashObj);
            const sut = await Integrity.check(fixturesDirPath, integrityTestFilePath);
            expect(parseStub.called).to.be.true;
            expect(sut).to.be.a('boolean').and.to.be.false;
          });

        it('it is a file with invalid hash',
          async function (): Promise<void> {
            const hashObj = '{"version":"1","hashes":{"fixtures":{' +
              '"contents":{"directory":{' +
              '"contents":{"anotherFileToHash.txt":"md5123456"},"hash":"sha1-123456"},' +
              '"hash":"sha1-123456"},' +
              '"hash":"sha1-123456"}}}';
            const sut = await Integrity.check(fixturesDirPath, hashObj);
            expect(sut).to.be.a('boolean').and.to.be.false;
          });

        it('the integrity object has no hash',
          async function (): Promise<void> {
            const hashObj = '{"version":"1","hashes":{"fixtures":{"contents":{},"hash":""}}}';
            const sut = await Integrity.check(fixturesDirPath, hashObj);
            expect(sut).to.be.a('boolean').and.to.be.false;
          });

      });

      context('to fail integrity check', function (): void {

        context('when the creation of the hash object', function (): void {

          it('throws an error',
            async function (): Promise<void> {
              const createStub = sandbox.stub(Integrity, 'create').throws();
              const hashObj = '{"version":"1","hashes":{"fixtures":"sha1-\\fÇ8\\u0011ÌúIÄÎ(Lo]¹tÁ"}}';

              try {
                await Integrity.check(fixturesDirPath, hashObj);
              } catch (error) {
                expect(createStub.called).to.be.true;
                expect(error).to.be.an.instanceof(Error).and.to.match(/Error/);
              }
            });

          it('returns nothing',
            async function (): Promise<void> {
              const createStub = sandbox.stub(Integrity, 'create').resolves(undefined);
              const hashObj = '{"version":"1","hashes":{"fixtures":"sha1-\\fÇ8\\u0011ÌúIÄÎ(Lo]¹tÁ"}}';
              const sut = await Integrity.check(fixturesDirPath, hashObj);
              expect(createStub.called).to.be.true;
              expect(sut).to.be.a('boolean').and.to.be.false;
            });

        });

      });

      context('provided a hash object (JSON)', function (): void {

        context('it detects the usage of', function (): void {

          it('unknown encoding',
            async function (): Promise<void> {
              const hashObj = '{"version":"1","hashes":{"fixtures":"sha1-\\u010A,F\\u0032«+{@/="}}';
              const sut = await Integrity.check(fixturesDirPath, hashObj);
              expect(sut).to.be.a('boolean').and.to.be.false;
            });

          it('no encoding',
            async function (): Promise<void> {
              const hashObj = '{"version":"1","hashes":{"fixtures":"sha1"}}';
              const sut = await Integrity.check(fixturesDirPath, hashObj);
              expect(sut).to.be.a('boolean').and.to.be.false;
            });

          it('unknown algorithm',
            async function (): Promise<void> {
              const hashObj = '{"version":"1","hashes":{"fixtures":"ddt-12A468C211G95"}}';
              const sut = await Integrity.check(fixturesDirPath, hashObj);
              expect(sut).to.be.a('boolean').and.to.be.false;
            });

          it('no algorithm',
            async function (): Promise<void> {
              const hashObj = '{"version":"1","hashes":{"fixtures":"DIjHOBHMnvpJxM4onkxvXbmcdME="}}';
              const sut = await Integrity.check(fixturesDirPath, hashObj);
              expect(sut).to.be.a('boolean').and.to.be.false;
            });

          it('invalid type',
            async function (): Promise<void> {
              const hashObj = '{"version":"1","hashes":{"fixtures":function(){}}';
              const sut = await Integrity.check(fixturesDirPath, hashObj);
              expect(sut).to.be.a('boolean').and.to.be.false;
            });

          it('function injection',
            async function (): Promise<void> {
              const hashObj = function (): void { void 0; } as any;
              const sut = await Integrity.check(fixturesDirPath, hashObj());
              expect(sut).to.be.a('boolean').and.to.be.false;
            });

          it(`invalid 'array' type`,
            async function (): Promise<void> {
              const hashObj = '{"version":"1","hashes":{"fixtures":[]}}';
              try {
                await Integrity.check(fixturesDirPath, hashObj);
              } catch (error) {
                expect(error).to.be.an.instanceof(Error).and.to.match(/EVALER/);
              }
            });

          it(`invalid 'number' type`,
            async function (): Promise<void> {
              const hashObj = '{"version":"1","hashes":{"fixtures":0}}';
              try {
                await Integrity.check(fixturesDirPath, hashObj);
              } catch (error) {
                expect(error).to.be.an.instanceof(Error).and.to.match(/EVALER/);
              }
            });

          it(`invalid 'boolean' type`,
            async function (): Promise<void> {
              const hashObj = '{"version":"1","hashes":{"fixtures":true}}';
              try {
                await Integrity.check(fixturesDirPath, hashObj);
              } catch (error) {
                expect(error).to.be.an.instanceof(Error).and.to.match(/EVALER/);
              }
            });

          it(`invalid 'null' type`,
            async function (): Promise<void> {
              const hashObj = '{"version":"1","hashes":{"fixtures":null}}';
              try {
                await Integrity.check(fixturesDirPath, hashObj);
              } catch (error) {
                expect(error).to.be.an.instanceof(Error).and.to.match(/EVALER/);
              }
            });

          it('non-verbose creation',
            async function (): Promise<void> {
              const hashObj = '{"version":"1","hashes":{"fixtures":"sha512-' +
                'WlFP+kAPdHyGd9E8SgkFfxuGvz9l/cqjt8gAhrHDdWLBIkkZGxgxxgpWZuARLVD7ACCxq8rVeNbwNL7NKyeWsA=="}}';
              const sut = await Integrity.check(fixturesDirPath, hashObj);
              expect(sut).to.be.a('boolean').and.to.be.true;
            });

          it('verbose creation',
            async function (): Promise<void> {
              const sut = await Integrity.check(fixturesDirPath, integrityTestFilePath);
              expect(sut).to.be.a('boolean').and.to.be.true;
            });

          it('\'md5\' algorithm',
            async function (): Promise<void> {
              const hashObj = '{"version":"1","hashes":{"fixtures":"md5-03a3d76b2c52d62ce63502b85100575f"}}';
              const sut = await Integrity.check(fixturesDirPath, hashObj);
              expect(sut).to.be.a('boolean').and.to.be.true;
            });

          it('\'RSA-SHA1-2\' algorithm',
            async function (): Promise<void> {
              const hashObj = '{"version":"1","hashes":{"fixtures":"RSA-SHA1-2-DIjHOBHMnvpJxM4onkxvXbmcdME="}}';
              const sut = await Integrity.check(fixturesDirPath, hashObj);
              expect(sut).to.be.a('boolean').and.to.be.true;
            });

          it('\'sha1\' algorithm',
            async function (): Promise<void> {
              const hashObj = '{"version":"1","hashes":{"fixtures":"sha1-0c88c73811cc9efa49c4ce289e4c6f5db99c74c1"}}';
              const sut = await Integrity.check(fixturesDirPath, hashObj);
              expect(sut).to.be.a('boolean').and.to.be.true;
            });

          it('\'hex\' encoding',
            async function (): Promise<void> {
              const hashObj = '{"version":"1","hashes":{"fixtures":"sha1-0c88c73811cc9efa49c4ce289e4c6f5db99c74c1"}}';
              const sut = await Integrity.check(fixturesDirPath, hashObj);
              expect(sut).to.be.a('boolean').and.to.be.true;
            });

          it('\'base64\' encoding',
            async function (): Promise<void> {
              const hashObj = '{"version":"1","hashes":{"fixtures":"sha1-DIjHOBHMnvpJxM4onkxvXbmcdME="}}';
              const sut = await Integrity.check(fixturesDirPath, hashObj);
              expect(sut).to.be.a('boolean').and.to.be.true;
            });

          it('\'latin1\' encoding',
            async function (): Promise<void> {
              const hashObj = '{"version":"1","hashes":{"fixtures":"sha1-\\fÇ8\\u0011ÌúIÄÎ(Lo]¹tÁ"}}';
              const sut = await Integrity.check(fixturesDirPath, hashObj);
              expect(sut).to.be.a('boolean').and.to.be.true;
            });

        });

      });

      context('provided a hash string', function (): void {

        context('it detects the usage of', function (): void {

          it('unknown encoding',
            async function (): Promise<void> {
              const hash = 'sha1-\u010A,F\u0032«+{@/=';
              const sut = await Integrity.check(fixturesDirPath, hash);
              expect(sut).to.be.a('boolean').and.to.be.false;
            });

          it('unknown algorithm',
            async function (): Promise<void> {
              const hash = 'ddt-12A468C211G95';
              const sut = await Integrity.check(fixturesDirPath, hash);
              expect(sut).to.be.a('boolean').and.to.be.false;
            });

          it('non-verbose hash',
            async function (): Promise<void> {
              const hash = 'sha512-' +
                'WlFP+kAPdHyGd9E8SgkFfxuGvz9l/cqjt8gAhrHDdWLBIkkZGxgxxgpWZuARLVD7ACCxq8rVeNbwNL7NKyeWsA==';
              const sut = await Integrity.check(fixturesDirPath, hash);
              expect(sut).to.be.a('boolean').and.to.be.true;
            });

          it('verbose hash',
            async function (): Promise<void> {
              const sut = await Integrity.check(fixturesDirPath, integrityTestFilePath);
              expect(sut).to.be.a('boolean').and.to.be.true;
            });

          it('\'md5\' algorithm',
            async function (): Promise<void> {
              const hash = 'md5-03a3d76b2c52d62ce63502b85100575f';
              const sut = await Integrity.check(fixturesDirPath, hash);
              expect(sut).to.be.a('boolean').and.to.be.true;
            });

          it('\'sha1\' algorithm',
            async function (): Promise<void> {
              const hashObj = 'sha1-0c88c73811cc9efa49c4ce289e4c6f5db99c74c1';
              const sut = await Integrity.check(fixturesDirPath, hashObj);
              expect(sut).to.be.a('boolean').and.to.be.true;
            });

          it('\'hex\' encoding',
            async function (): Promise<void> {
              const hash = 'sha1-0c88c73811cc9efa49c4ce289e4c6f5db99c74c1';
              const sut = await Integrity.check(fixturesDirPath, hash);
              expect(sut).to.be.a('boolean').and.to.be.true;
            });

          it('\'base64\' encoding',
            async function (): Promise<void> {
              const hash = 'sha512-' +
                'WlFP+kAPdHyGd9E8SgkFfxuGvz9l/cqjt8gAhrHDdWLBIkkZGxgxxgpWZuARLVD7ACCxq8rVeNbwNL7NKyeWsA==';
              const sut = await Integrity.check(fixturesDirPath, hash);
              expect(sut).to.be.a('boolean').and.to.be.true;
            });

          it('\'latin1\' encoding',
            async function (): Promise<void> {
              const hash = 'sha1-\fÇ8\u0011ÌúIÄÎ(Lo]¹tÁ';
              const sut = await Integrity.check(fixturesDirPath, hash);
              expect(sut).to.be.a('boolean').and.to.be.true;
            });

        });

      });

    });

  });

});
