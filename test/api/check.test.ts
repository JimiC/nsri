/* eslint-disable no-unused-expressions */
import { expect } from 'chai';
import { ObjectEncodingOptions, PathLike, Stats } from 'fs';
import path from 'path';
import sinon, { createSandbox } from 'sinon';
import { Integrity } from '../../src/app/integrity';
import * as fsAsync from '../../src/common/fsAsync';
import * as utils from '../../src/common/utils';
import { IntegrityOptions } from '../../src/interfaces/integrityOptions';

describe(`Integrity: function 'check' tests`, (): void => {

  context('expects', (): void => {

    type ReadFileType = [PathLike | number,
      (ObjectEncodingOptions & { flag?: string | undefined } | BufferEncoding | null)?];

    let anotherFileToHashFilename: string;
    let fileToHashFilename: string;
    let integrityTestFilename: string;
    let directoryDirPath: string;
    let fixturesDirPath: string;
    let anotherFileToHashFilePath: string;
    let fileToHashFilePath: string;
    let integrityTestFilePath: string;

    before((): void => {
      anotherFileToHashFilename = 'anotherFileToHash.txt';
      fileToHashFilename = 'fileToHash.txt';
      integrityTestFilename = '.integrity.json';
    });

    let options: IntegrityOptions;
    let sandbox: sinon.SinonSandbox;
    let fsStatsMock: sinon.SinonStubbedInstance<Stats>;

    beforeEach((): void => {
      sandbox = createSandbox();
      fixturesDirPath = path.resolve(__dirname, '../../../test/fixtures/');
      directoryDirPath = path.resolve(fixturesDirPath, 'directory');
      anotherFileToHashFilePath = path.resolve(directoryDirPath, anotherFileToHashFilename);
      fileToHashFilePath = path.resolve(fixturesDirPath, fileToHashFilename);
      integrityTestFilePath = path.resolve(fixturesDirPath, integrityTestFilename);
      options = {
        cryptoOptions: undefined,
        exclude: undefined,
        strict: true,
        verbose: undefined,
      };
      fsStatsMock = sandbox.createStubInstance(Stats);
    });

    afterEach((): void => {
      sandbox.restore();
    });

    context(`to throw an Error when 'integrity'`, (): void => {

      it('is a file path and filename is invalid',
        async (): Promise<void> => {
          const existsAsyncStub = sandbox.stub(fsAsync, 'existsAsync').resolves(true);
          fsStatsMock.isDirectory.returns(false);
          fsStatsMock.isFile.returns(true);
          const lstatAsyncStub = sandbox.stub(fsAsync, 'lstatAsync').resolves(fsStatsMock);
          try {
            await Integrity.check(fileToHashFilePath, 'package.json');
          } catch (error) {
            expect(existsAsyncStub.calledOnce).to.be.true;
            expect(lstatAsyncStub.calledTwice).to.be.true;
            expect(error).to.be.an.instanceof(Error).and.match(/EINVNAME/);
          }
        });

      it('versions differ',
        async (): Promise<void> => {
          const hashObj = '{"version":"2","hashes":{"fileToHash.txt":"7a3d5b475bd07ae9041fab2a133f40c4"}}';
          // @ts-ignore
          sandbox.stub(Integrity, 'validate').resolves();
          try {
            await Integrity.check(fileToHashFilePath, hashObj);
          } catch (error) {
            expect(error).to.be.an.instanceof(Error)
              .and.match(/EINVER/)
              .and.match(/Incompatible versions check/);
          }
        });

      it('version schema missing',
        async (): Promise<void> => {
          const hashObj = '{"version":"2","hashes":{"fileToHash.txt":"7a3d5b475bd07ae9041fab2a133f40c4"}}';
          try {
            await Integrity.check(fileToHashFilePath, hashObj);
          } catch (error) {
            expect(error).to.be.an.instanceof(Error)
              .and.match(/EINVER/)
              .and.match(/Invalid schema version: '2'/);
          }
        });

      it('schema is not valid',
        async (): Promise<void> => {
          const hashObj = '{"version":"1","fileToHash.txt":"7a3d5b475bd07ae9041fab2a133f40c4"}';
          try {
            await Integrity.check(fileToHashFilePath, hashObj);
          } catch (error) {
            expect(error).to.be.an.instanceof(Error).and.match(/EVALER/);
          }
        });

      it('path is other than a file or a directory',
        async (): Promise<void> => {
          fsStatsMock.isDirectory.returns(false);
          fsStatsMock.isFile.returns(false);
          const lstatAsyncStub = sandbox.stub(fsAsync, 'lstatAsync').resolves(fsStatsMock);
          try {
            await Integrity.check(fileToHashFilePath, integrityTestFilePath);
          } catch (error) {
            expect(lstatAsyncStub.calledTwice).to.be.true;
            expect(error).to.be.an.instanceof(Error).and.match(/ENOSUP/);
          }
        });

    });

    context('to fail integrity check when', (): void => {

      it('input path is an empty string',
        async (): Promise<void> => {
          const sut = await Integrity.check('', integrityTestFilePath);
          expect(sut).to.be.a('boolean').and.to.be.false;
        });

      it('input path is other than a file path or a directory path',
        (): void => {
          // @ts-ignore
          void Integrity.check({}, integrityTestFilePath).then((sut: boolean): Chai.Assertion =>
            expect(sut).to.be.a('boolean').and.to.be.false);
          // @ts-ignore
          void Integrity.check(0, integrityTestFilePath).then((sut: boolean): Chai.Assertion =>
            expect(sut).to.be.a('boolean').and.to.be.false);
          // @ts-ignore
          void Integrity.check(true, integrityTestFilePath).then((sut: boolean): Chai.Assertion =>
            expect(sut).to.be.a('boolean').and.to.be.false);
          // @ts-ignore
          void Integrity.check(null, integrityTestFilePath).then((sut: boolean): Chai.Assertion =>
            expect(sut).to.be.a('boolean').and.to.be.false);
          // @ts-ignore
          void Integrity.check(undefined, integrityTestFilePath).then((sut: boolean): Chai.Assertion =>
            expect(sut).to.be.a('boolean').and.to.be.false);
          // @ts-ignore
          void Integrity.check(Symbol(), integrityTestFilePath).then((sut: boolean): Chai.Assertion =>
            expect(sut).to.be.a('boolean').and.to.be.false);
        });

      it('integrity JSON is empty',
        async (): Promise<void> => {
          const sut = await Integrity.check(fileToHashFilePath, '{}');
          expect(sut).to.be.a('boolean').and.to.be.false;
        });

      it('integrity is an empty string',
        async (): Promise<void> => {
          const sut = await Integrity.check(fileToHashFilePath, '');
          expect(sut).to.be.a('boolean').and.to.be.false;
        });

      it('integrity is other than a file path, a directory path, a JSON or a hash string',
        (): void => {
          // @ts-ignore
          void Integrity.check(fileToHashFilePath, {}).then((sut: boolean): Chai.Assertion =>
            expect(sut).to.be.a('boolean').and.to.be.false);
          // @ts-ignore
          void Integrity.check(fileToHashFilePath, 0).then((sut: boolean): Chai.Assertion =>
            expect(sut).to.be.a('boolean').and.to.be.false);
          // @ts-ignore
          void Integrity.check(fileToHashFilePath, true).then((sut: boolean): Chai.Assertion =>
            expect(sut).to.be.a('boolean').and.to.be.false);
          // @ts-ignore
          void Integrity.check(fileToHashFilePath, null).then((sut: boolean): Chai.Assertion =>
            expect(sut).to.be.a('boolean').and.to.be.false);
          // @ts-ignore
          void Integrity.check(fileToHashFilePath, undefined).then((sut: boolean): Chai.Assertion =>
            expect(sut).to.be.a('boolean').and.to.be.false);
          // @ts-ignore
          void Integrity.check(fileToHashFilePath, Symbol()).then((sut: boolean): Chai.Assertion =>
            expect(sut).to.be.a('boolean').and.to.be.false);
        });

      context('integrity file content is', (): void => {

        let readFileAsyncStub: sinon.SinonStub<ReadFileType, Promise<string | Buffer>>;

        beforeEach((): void => {
          readFileAsyncStub = sandbox.stub(fsAsync, 'readFileAsync');
        });

        it('empty',
          async (): Promise<void> => {
            readFileAsyncStub.resolves('');
            try {
              await Integrity.check(fileToHashFilePath, integrityTestFilePath);
            } catch (error) {
              expect(readFileAsyncStub.calledTwice).to.be.true;
              expect(error).to.be.an.instanceof(Error);
            }
          });

        it('invalid',
          async (): Promise<void> => {
            readFileAsyncStub.resolves('invalid integrity object');
            try {
              await Integrity.check(fileToHashFilePath, integrityTestFilePath);
            } catch (error) {
              expect(readFileAsyncStub.calledTwice).to.be.true;
              expect(error).to.be.an.instanceof(Error);
            }
          });

      });

    });

    context('when the provided input path', (): void => {

      context('is a file', (): void => {

        context('and using root integrity file', (): void => {

          context('to pass integrity check', (): void => {

            it('provided a file path',
              async (): Promise<void> => {
                const sut = await Integrity.check(fileToHashFilePath, integrityTestFilePath);
                expect(sut).to.be.a('boolean').and.to.be.true;
              });

            it('of a subdirectory input file path',
              async (): Promise<void> => {
                const sut = await Integrity.check(anotherFileToHashFilePath, integrityTestFilePath);
                expect(sut).to.be.a('boolean').and.to.be.true;
              });

            it('provided a directory path',
              async (): Promise<void> => {
                const sut = await Integrity.check(fileToHashFilePath, fixturesDirPath);
                expect(sut).to.be.a('boolean').and.to.be.true;
              });

            it('provided a hash object (JSON)',
              async (): Promise<void> => {
                const hashObj = '{"version":"1","hashes":{"fileToHash.txt":"sha1-H58mYNjbMJTkiNvvNfj2YKl3ck0="}}';
                const sut = await Integrity.check(fileToHashFilePath, hashObj);
                expect(sut).to.be.a('boolean').and.to.be.true;
              });

            it('provided a hash string',
              async (): Promise<void> => {
                const hash = 'sha1-H58mYNjbMJTkiNvvNfj2YKl3ck0=';
                const sut = await Integrity.check(fileToHashFilePath, hash);
                expect(sut).to.be.a('boolean').and.to.be.true;
              });

          });

        });

        context(`and using the directory's integrity file`, (): void => {

          let fixturesSubDirPath: string;

          beforeEach((): void => {
            fixturesSubDirPath = path.join(fixturesDirPath, 'fixtures');
            fileToHashFilePath = path.resolve(fixturesSubDirPath, fileToHashFilename);
            integrityTestFilePath = path.resolve(fixturesSubDirPath, integrityTestFilename);
          });

          context('to pass integrity check', (): void => {

            it('provided a file path',
              async (): Promise<void> => {
                const sut = await Integrity.check(fileToHashFilePath, integrityTestFilePath);
                expect(sut).to.be.a('boolean').and.to.be.true;
              });

            it('of a subdirectory input file path',
              async (): Promise<void> => {
                const directorySubDirPath = path.join(fixturesSubDirPath, 'directory');
                anotherFileToHashFilePath = path.resolve(directorySubDirPath, anotherFileToHashFilename);
                integrityTestFilePath = path.resolve(directorySubDirPath, integrityTestFilename);
                const sut = await Integrity.check(anotherFileToHashFilePath, integrityTestFilePath);
                expect(sut).to.be.a('boolean').and.to.be.true;
              });

            it('provided a directory path',
              async (): Promise<void> => {
                const sut = await Integrity.check(fileToHashFilePath, fixturesSubDirPath);
                expect(sut).to.be.a('boolean').and.to.be.true;
              });

            it('provided a hash object (JSON)',
              async (): Promise<void> => {
                const hashObj = '{"version":"1","hashes":{"fileToHash.txt":"sha1-t56X7IQ267Hza0qjpSpqb9UPcfE="}}';
                const sut = await Integrity.check(fileToHashFilePath, hashObj);
                expect(sut).to.be.a('boolean').and.to.be.true;
              });

            it('provided a hash string',
              async (): Promise<void> => {
                const hash = 'sha1-t56X7IQ267Hza0qjpSpqb9UPcfE=';
                const sut = await Integrity.check(fileToHashFilePath, hash);
                expect(sut).to.be.a('boolean').and.to.be.true;
              });

          });

        });

        context('and using the parent directory integrity file', (): void => {

          let fixturesSubDirPath: string;

          beforeEach((): void => {
            fixturesSubDirPath = path.join(fixturesDirPath, 'fixtures');
            fileToHashFilePath = path.resolve(fixturesSubDirPath, fileToHashFilename);
          });

          context('to pass integrity check', (): void => {

            it('provided a file path',
              async (): Promise<void> => {
                const sut = await Integrity.check(fileToHashFilePath, integrityTestFilePath);
                expect(sut).to.be.a('boolean').and.to.be.true;
              });

            it('of a subdirectory input file path',
              async (): Promise<void> => {
                const directorySubDirPath = path.join(fixturesSubDirPath, 'directory');
                anotherFileToHashFilePath = path.resolve(directorySubDirPath, anotherFileToHashFilename);
                integrityTestFilePath = path.resolve(fixturesSubDirPath, integrityTestFilename);
                const sut = await Integrity.check(anotherFileToHashFilePath, integrityTestFilePath);
                expect(sut).to.be.a('boolean').and.to.be.true;
              });

            it('provided a directory path',
              async (): Promise<void> => {
                const sut = await Integrity.check(fileToHashFilePath, fixturesDirPath);
                expect(sut).to.be.a('boolean').and.to.be.true;
              });

            it('provided a hash object (JSON)',
              async (): Promise<void> => {
                const hashObj = '{"version":"1","hashes":{"fileToHash.txt":"sha1-t56X7IQ267Hza0qjpSpqb9UPcfE="}}';
                const sut = await Integrity.check(fileToHashFilePath, hashObj);
                expect(sut).to.be.a('boolean').and.to.be.true;
              });

            it('provided a hash string',
              async (): Promise<void> => {
                const hash = 'sha1-t56X7IQ267Hza0qjpSpqb9UPcfE=';
                const sut = await Integrity.check(fileToHashFilePath, hash);
                expect(sut).to.be.a('boolean').and.to.be.true;
              });

          });

        });

      });

      context('is a directory', (): void => {

        let readFileAsyncStub: sinon.SinonStub<ReadFileType, Promise<string | Buffer>>;

        beforeEach((): void => {
          readFileAsyncStub = sandbox.stub(fsAsync, 'readFileAsync');
        });

        context('to pass integrity check', (): void => {

          context('provided a verbosely root directory hash', (): void => {

            it('with literal directory name',
              async (): Promise<void> => {
                options.verbose = false;
                const hash = '{"version":"1","hashes":{' +
                  '"fixtures":{"contents":{"directory":{"contents":{},' +
                  '"hash":"sha512-Ze62278vNFKc3izakn2FgyvHIZEbnsuqKogaZ' +
                  'LA1ihM1zk95RKlz+z7qk1XEysMaoJlpDNqSWx4PoPp2cFNBPw=="}},' +
                  '"hash":"sha512-WlFP+kAPdHyGd9E8SgkFfxuGvz9l/cqjt8gAh' +
                  'rHDdWLBIkkZGxgxxgpWZuARLVD7ACCxq8rVeNbwNL7NKyeWsA=="' +
                  '}}}';
                readFileAsyncStub.resolves(hash);

                const sut = await Integrity.check(fixturesDirPath, integrityTestFilePath, options);
                expect(sut).to.be.a('boolean').and.to.be.true;
              });

            it(`with 'dot' directory name`,
              async (): Promise<void> => {
                options.verbose = false;
                const hash = '{"version":"1","hashes":{' +
                  '".":{"contents":{"directory":{"contents":{},' +
                  '"hash":"sha512-Ze62278vNFKc3izakn2FgyvHIZEbnsuqKogaZ' +
                  'LA1ihM1zk95RKlz+z7qk1XEysMaoJlpDNqSWx4PoPp2cFNBPw=="}},' +
                  '"hash":"sha512-WlFP+kAPdHyGd9E8SgkFfxuGvz9l/cqjt8gAh' +
                  'rHDdWLBIkkZGxgxxgpWZuARLVD7ACCxq8rVeNbwNL7NKyeWsA=="' +
                  '}}}';
                readFileAsyncStub.resolves(hash);

                const sut = await Integrity.check(fixturesDirPath, integrityTestFilePath, options);
                expect(sut).to.be.a('boolean').and.to.be.true;
              });

          });

          it('provided a non-verbosely root directory hash',
            async (): Promise<void> => {
              options.verbose = false;
              const hash = '{"version":"1","hashes":{' +
                '".":"sha512-WlFP+kAPdHyGd9E8SgkFfxuGvz9l/cqjt8gAhr' +
                'HDdWLBIkkZGxgxxgpWZuARLVD7ACCxq8rVeNbwNL7NKyeWsA=="' +
                '}}';
              readFileAsyncStub.resolves(hash);

              const sut = await Integrity.check(fixturesDirPath, integrityTestFilePath, options);
              expect(sut).to.be.a('boolean').and.to.be.true;
            });

          context('of a subdirectory input directory path', (): void => {

            it('provided a non-verbosely directory hash',
              async (): Promise<void> => {
                options.verbose = false;
                const hash = '{"version":"1","hashes":{' +
                  '".":"sha512-Ze62278vNFKc3izakn2FgyvHIZEbnsuqKogaZ' +
                  'LA1ihM1zk95RKlz+z7qk1XEysMaoJlpDNqSWx4PoPp2cFNBPw=="' +
                  '}}';
                readFileAsyncStub.resolves(hash);
                const sut = await Integrity.check(directoryDirPath, integrityTestFilePath, options);
                expect(sut).to.be.a('boolean').and.to.be.true;
              });

            it('provided a verbosely directory hash',
              async (): Promise<void> => {
                options.verbose = false;
                const hash = '{"version":"1","hashes":{' +
                  '".":{"contents":{"directory":{"contents":{},' +
                  '"hash":"sha512-Ze62278vNFKc3izakn2FgyvHIZEbnsuqKogaZ' +
                  'LA1ihM1zk95RKlz+z7qk1XEysMaoJlpDNqSWx4PoPp2cFNBPw=="}},' +
                  '"hash":"sha512-WlFP+kAPdHyGd9E8SgkFfxuGvz9l/cqjt8gAh' +
                  'rHDdWLBIkkZGxgxxgpWZuARLVD7ACCxq8rVeNbwNL7NKyeWsA=="' +
                  '}}}';
                readFileAsyncStub.resolves(hash);
                const sut = await Integrity.check(directoryDirPath, fixturesDirPath, options);
                expect(sut).to.be.a('boolean').and.to.be.true;
              });

            it('provided a semi-verbosely directory hash',
              async (): Promise<void> => {
                // This is a scenario that can not happen when using the 'create' function,
                // because hash creation is either verbosely or non-verbosely on all nodes.
                // We cover this scenario, in case the user provides a self-created integrity file.

                options.verbose = true;
                const hash = '{"version":"1","hashes":{".":{' +
                  '"contents":{"directory":"sha512-' +
                  'Ze62278vNFKc3izakn2FgyvHIZEbnsuqKogaZLA1ihM1zk95RKlz+z7qk1XEysMaoJlpDNqSWx4PoPp2cFNBPw=="},' +
                  '"hash":"sha512-' +
                  'WlFP+kAPdHyGd9E8SgkFfxuGvz9l/cqjt8gAhrHDdWLBIkkZGxgxxgpWZuARLVD7ACCxq8rVeNbwNL7NKyeWsA=="}}}';
                readFileAsyncStub.resolves(hash);
                const sut = await Integrity.check(directoryDirPath, integrityTestFilePath, options);
                expect(sut).to.be.a('boolean').and.to.be.true;
              });

          });

        });

        context('to fail integrity check of a subdirectory input directory path', (): void => {

          context('using a parent directory integrity file', (): void => {

            it('provided a verbosely directory hash with non-existing directory',
              async (): Promise<void> => {
                options.verbose = false;
                const hash = '{"version":"1","hashes":{".":{' +
                  '"contents":{"directiry":"sha512-Ze62278vNFKc3izakn2FgyvHIZEbns' +
                  'uqKogaZLA1ihM1zk95RKlz+z7qk1XEysMaoJlpDNqSWx4PoPp2cFNBPw=="},' +
                  '"hash":"sha512-WlFP+kAPdHyGd9E8SgkFfxuGvz9l/cqjt8gAhrHDdWLBI' +
                  'kkZGxgxxgpWZuARLVD7ACCxq8rVeNbwNL7NKyeWsA=="}}}';
                readFileAsyncStub.resolves(hash);
                const sut = await Integrity.check(directoryDirPath, integrityTestFilePath, options);
                expect(sut).to.be.a('boolean').and.to.be.false;
              });

            it('provided a semi-verbosely directory hash and subdirectory hash is empty',
              async (): Promise<void> => {
                // This is a scenario that can not happen when using the 'create' function,
                // because hash creation is either verbosely or non-verbosely on all nodes.
                // We cover this scenario, in case the user provides a self-created integrity file.

                options.verbose = true;
                const hash = '{"version":"1","hashes":{".":{' +
                  '"contents":{"directory":""},' +
                  '"hash":"sha1-DIjHOBHMnvpJxM4onkxvXbmcdME="}}}';
                readFileAsyncStub.resolves(hash);
                const sut = await Integrity.check(directoryDirPath, integrityTestFilePath, options);
                expect(sut).to.be.a('boolean').and.to.be.false;
              });

            context('provided a non-verbosely directory hash', (): void => {

              it('that is valid',
                async (): Promise<void> => {
                  options.verbose = false;
                  const hash = '{"version":"1","hashes":{".":' +
                    '"sha512-WlFP+kAPdHyGd9E8SgkFfxuGvz9l/cqjt8gAhrHDd' +
                    'WLBIkkZGxgxxgpWZuARLVD7ACCxq8rVeNbwNL7NKyeWsA=="}}';
                  readFileAsyncStub.resolves(hash);
                  const sut = await Integrity.check(directoryDirPath, integrityTestFilePath, options);
                  expect(sut).to.be.a('boolean').and.to.be.false;
                });

              it('that is invalid',
                async (): Promise<void> => {
                  options.verbose = false;
                  const hash = '{"version":"1","hashes":{".":' +
                    '"sha384-Ze62278vNFKc3izakn2FgyvHIZEbnsuqKogaZLA1' +
                    'ihM1zk95RKlz+z7qk1XEysMaoJlpDNqSWx4PoPp2cFNBPw=="}}';
                  readFileAsyncStub.resolves(hash);
                  const sut = await Integrity.check(directoryDirPath, integrityTestFilePath, options);
                  expect(sut).to.be.a('boolean').and.to.be.false;
                });

            });

          });

        });

        context('and using root integrity file', (): void => {

          beforeEach((): void => {
            readFileAsyncStub.restore();
          });

          context('to pass integrity check', (): void => {

            it('provided a file path',
              async (): Promise<void> => {
                const sut = await Integrity.check(fixturesDirPath, integrityTestFilePath, options);
                expect(sut).to.be.a('boolean').and.to.be.true;
              });

            it('of a subdirectory input directory path',
              async (): Promise<void> => {
                options.verbose = true;
                const sut = await Integrity.check(directoryDirPath, integrityTestFilePath, options);
                expect(sut).to.be.a('boolean').and.to.be.true;
              });

            it('provided a directory path',
              async (): Promise<void> => {
                const sut = await Integrity.check(fixturesDirPath, fixturesDirPath, options);
                expect(sut).to.be.a('boolean').and.to.be.true;
              });

            it('provided a non-verbosely hash object (JSON)',
              async (): Promise<void> => {
                options.verbose = false;
                const hashObj = '{"version":"1","hashes":{"fixtures":"sha512-' +
                  'WlFP+kAPdHyGd9E8SgkFfxuGvz9l/cqjt8gAhrHDdWLBIkkZGxgxxgpWZuARLVD7ACCxq8rVeNbwNL7NKyeWsA=="}}';
                const sut = await Integrity.check(fixturesDirPath, hashObj, options);
                expect(sut).to.be.a('boolean').and.to.be.true;
              });

            it('provided a hash string',
              async (): Promise<void> => {
                options.verbose = false;
                const hash = 'sha512-' +
                  'WlFP+kAPdHyGd9E8SgkFfxuGvz9l/cqjt8gAhrHDdWLBIkkZGxgxxgpWZuARLVD7ACCxq8rVeNbwNL7NKyeWsA==';
                const sut = await Integrity.check(fixturesDirPath, hash, options);
                expect(sut).to.be.a('boolean').and.to.be.true;
              });

          });

          context('to fail integrity check', (): void => {

            it('provided a non-verbosely hash object (JSON), against a verbosely created hash',
              async (): Promise<void> => {
                options.verbose = true;
                const hashObj = '{"version":"1","hashes":{".":"sha512-' +
                  'WlFP+kAPdHyGd9E8SgkFfxuGvz9l/cqjt8gAhrHDdWLBIkkZGxgxxgpWZuARLVD7ACCxq8rVeNbwNL7NKyeWsA=="}}';
                const sut = await Integrity.check(fixturesDirPath, hashObj, options);
                expect(sut).to.be.a('boolean').and.to.be.false;
              });

            it('provided a hash string against a verbosely created hash',
              async (): Promise<void> => {
                options.verbose = true;
                const hash = 'sha512-' +
                  'WlFP+kAPdHyGd9E8SgkFfxuGvz9l/cqjt8gAhrHDdWLBIkkZGxgxxgpWZuARLVD7ACCxq8rVeNbwNL7NKyeWsA==';
                const sut = await Integrity.check(fixturesDirPath, hash, options);
                expect(sut).to.be.a('boolean').and.to.be.false;
              });

          });

        });

        context(`and using the directory's integrity file`, (): void => {

          let fixturesSubDirPath: string;

          beforeEach((): void => {
            readFileAsyncStub.restore();
            fixturesSubDirPath = path.join(fixturesDirPath, 'fixtures');
            integrityTestFilePath = path.resolve(fixturesSubDirPath, integrityTestFilename);
          });

          context('to pass integrity check', (): void => {

            it('provided a file path',
              async (): Promise<void> => {
                const sut = await Integrity.check(fixturesSubDirPath, integrityTestFilePath, options);
                expect(sut).to.be.a('boolean').and.to.be.true;
              });

            it('of a subdirectory input file path',
              async (): Promise<void> => {
                const directorySubDirPath = path.join(fixturesSubDirPath, 'directory');
                integrityTestFilePath = path.resolve(directorySubDirPath, integrityTestFilename);
                const sut = await Integrity.check(directorySubDirPath, integrityTestFilePath, options);
                expect(sut).to.be.a('boolean').and.to.be.true;
              });

            it('provided a directory path',
              async (): Promise<void> => {
                const sut = await Integrity.check(fixturesSubDirPath, fixturesSubDirPath, options);
                expect(sut).to.be.a('boolean').and.to.be.true;
              });

            it('provided a non-verbosely hash object (JSON)',
              async (): Promise<void> => {
                options.verbose = false;
                const hashObj = '{"version":"1","hashes":{"fixtures":"sha512-' +
                  'rDNKFYBCOuaCzpomiZEGyRLAmc3+IU/HoNj7NiKXqLG90rNko74LwpZ1DYKx+/aJptGTKCr/9mP8ggnl4QVNNw=="}}';
                const sut = await Integrity.check(fixturesSubDirPath, hashObj, options);
                expect(sut).to.be.a('boolean').and.to.be.true;
              });

            it('provided a hash string',
              async (): Promise<void> => {
                options.verbose = false;
                const hash = 'sha512-' +
                  'rDNKFYBCOuaCzpomiZEGyRLAmc3+IU/HoNj7NiKXqLG90rNko74LwpZ1DYKx+/aJptGTKCr/9mP8ggnl4QVNNw==';
                const sut = await Integrity.check(fixturesSubDirPath, hash, options);
                expect(sut).to.be.a('boolean').and.to.be.true;
              });

          });

          context('to fail integrity check', (): void => {

            it('provided a non-verbosely hash object (JSON), against a verbosely created hash',
              async (): Promise<void> => {
                options.verbose = true;
                const hashObj = '{"version":"1","hashes":{".":"sha512-' +
                  'rDNKFYBCOuaCzpomiZEGyRLAmc3+IU/HoNj7NiKXqLG90rNko74LwpZ1DYKx+/aJptGTKCr/9mP8ggnl4QVNNw=="}}';
                const sut = await Integrity.check(fixturesSubDirPath, hashObj, options);
                expect(sut).to.be.a('boolean').and.to.be.false;
              });

            it('provided a hash string against a verbosely created hash',
              async (): Promise<void> => {
                options.verbose = true;
                const hash = 'sha512-' +
                  'rDNKFYBCOuaCzpomiZEGyRLAmc3+IU/HoNj7NiKXqLG90rNko74LwpZ1DYKx+/aJptGTKCr/9mP8ggnl4QVNNw==';
                const sut = await Integrity.check(fixturesSubDirPath, hash, options);
                expect(sut).to.be.a('boolean').and.to.be.false;
              });

          });

        });

        context('and using the parent directory integrity file', (): void => {

          let fixturesSubDirPath: string;

          beforeEach((): void => {
            readFileAsyncStub.restore();
            fixturesSubDirPath = path.join(fixturesDirPath, 'fixtures');
          });

          context('to pass integrity check', (): void => {

            it('provided a file path',
              async (): Promise<void> => {
                const sut = await Integrity.check(fixturesSubDirPath, integrityTestFilePath, options);
                expect(sut).to.be.a('boolean').and.to.be.true;
              });

            it('of a subdirectory input file path',
              async (): Promise<void> => {
                options.verbose = true;
                const directorySubDirPath = path.join(fixturesSubDirPath, 'directory');
                integrityTestFilePath = path.resolve(fixturesSubDirPath, integrityTestFilename);
                const sut = await Integrity.check(directorySubDirPath, integrityTestFilePath, options);
                expect(sut).to.be.a('boolean').and.to.be.true;
              });

            it('provided a directory path',
              async (): Promise<void> => {
                const sut = await Integrity.check(fixturesSubDirPath, fixturesDirPath, options);
                expect(sut).to.be.a('boolean').and.to.be.true;
              });

            it('provided a non-verbosely hash object (JSON)',
              async (): Promise<void> => {
                options.verbose = false;
                const hashObj = '{"version":"1","hashes":{"fixtures":"sha512-' +
                  'rDNKFYBCOuaCzpomiZEGyRLAmc3+IU/HoNj7NiKXqLG90rNko74LwpZ1DYKx+/aJptGTKCr/9mP8ggnl4QVNNw=="}}';
                const sut = await Integrity.check(fixturesSubDirPath, hashObj, options);
                expect(sut).to.be.a('boolean').and.to.be.true;
              });

            it('provided a hash string',
              async (): Promise<void> => {
                options.verbose = false;
                const hash = 'sha512-' +
                  'rDNKFYBCOuaCzpomiZEGyRLAmc3+IU/HoNj7NiKXqLG90rNko74LwpZ1DYKx+/aJptGTKCr/9mP8ggnl4QVNNw==';
                const sut = await Integrity.check(fixturesSubDirPath, hash, options);
                expect(sut).to.be.a('boolean').and.to.be.true;
              });

          });

          context('to fail integrity check', (): void => {

            it('provided a non-verbosely hash object (JSON), against a verbosely created hash',
              async (): Promise<void> => {
                options.verbose = true;
                const hashObj = '{"version":"1","hashes":{".":"074e46454b567069ab80df4302605df2"}}';
                const sut = await Integrity.check(fixturesSubDirPath, hashObj, options);
                expect(sut).to.be.a('boolean').and.to.be.false;
              });

            it('provided a hash string against a verbosely created hash',
              async (): Promise<void> => {
                options.verbose = true;
                const hash = '074e46454b567069ab80df4302605df2';
                const sut = await Integrity.check(fixturesSubDirPath, hash, options);
                expect(sut).to.be.a('boolean').and.to.be.false;
              });

          });

        });

      });

    });

    context('when detecting options', (): void => {

      it(`to preserve 'exclude' option`,
        async (): Promise<void> => {
          options.exclude = [fileToHashFilename];
          const sut = await Integrity.check(fixturesDirPath, integrityTestFilePath, options);
          expect(sut).to.be.a('boolean').and.to.be.false;
        });

      it('to bypass detection when all crypto options are provided',
        async (): Promise<void> => {
          options.cryptoOptions = { dirAlgorithm: 'sha512', fileAlgorithm: 'sha1', encoding: 'base64' };
          options.verbose = true;
          const sut = await Integrity.check(fixturesDirPath, integrityTestFilePath, options);
          expect(sut).to.be.a('boolean').and.to.be.true;
        });

      context('to succesfully detect', (): void => {

        it('the options when NOT provided',
          async (): Promise<void> => {
            const sut = await Integrity.check(fixturesDirPath, integrityTestFilePath, options);
            expect(sut).to.be.a('boolean').and.to.be.true;
          });

        it('the crypto options when NOT provided',
          async (): Promise<void> => {
            options.cryptoOptions = undefined;
            const sut = await Integrity.check(fixturesDirPath, integrityTestFilePath, options);
            expect(sut).to.be.a('boolean').and.to.be.true;
          });

        it('the crypto encoding when NOT provided',
          async (): Promise<void> => {
            options.cryptoOptions = { fileAlgorithm: 'md5' };
            const sut = await Integrity.check(fixturesDirPath, integrityTestFilePath, options);
            expect(sut).to.be.a('boolean').and.to.be.true;
          });

        it('the crypto algorithm when NOT provided',
          async (): Promise<void> => {
            options.cryptoOptions = { encoding: 'base64' };
            const sut = await Integrity.check(fixturesDirPath, integrityTestFilePath, options);
            expect(sut).to.be.a('boolean').and.to.be.true;
          });

        it(`no 'fileAlgorithm'`,
          async (): Promise<void> => {
            const hashObj = '{"version":"1","hashes":{".":{' +
              '"contents":{"directory":{' +
              '"contents":{"directory":"md5-123456"},' +
              '"hash":"sha1-123456"},' +
              '"hash":"sha1-123456"},' +
              '"hash":"sha1-123456"}}}';
            const sut = await Integrity.check(fixturesDirPath, hashObj);
            expect(sut).to.be.a('boolean').and.to.be.false;
          });

        it(`a 'fileAlgorithm'`,
          async (): Promise<void> => {
            const hashObj = '{"version":"1","hashes":{".":{' +
              '"contents":{"directory":{' +
              '"contents":{"anotherFileToHash.txt":"md5-123456"},"hash":"sha1-123456"},' +
              '"hash":"sha1-123456"},' +
              '"hash":"sha1-123456"}}}';
            const sut = await Integrity.check(fixturesDirPath, hashObj);
            expect(sut).to.be.a('boolean').and.to.be.false;
          });

      });

      context('to fail detection when', (): void => {

        it('the integrity object contains an existing directory/file but has invalid hash object',
          async (): Promise<void> => {
            // This is a scenario that can not happen when using the 'create' function,
            // because hash creation produces a hash string for files.
            // We cover this scenario, in case the user provides a self-created integrity file.

            const hashObj = '{"version":"1","hashes":{".":{' +
              '"contents":{"fileToHash.txt":{' +
              '"contents":{"anotherFileToHash.txt":"md5123456"},"hash":"sha1-123456"},' +
              '"hash":"sha1-123456"},' +
              '"hash":"sha1-123456"}}}';
            const sut = await Integrity.check(fixturesDirPath, hashObj);
            expect(sut).to.be.a('boolean').and.to.be.false;
          });

        it('provided a file path, the integrity object can not be determined',
          async (): Promise<void> => {
            options.cryptoOptions = { encoding: 'base64' };
            const resolvedHashObj = await Integrity.create(fixturesDirPath, options);
            const parseStub = sandbox.stub(utils, 'parseJSONSafe')
              .onCall(0).returns(null)
              .returns(resolvedHashObj);
            const sut = await Integrity.check(fixturesDirPath, integrityTestFilePath);
            expect(parseStub.called).to.be.true;
            expect(sut).to.be.a('boolean').and.to.be.false;
          });

        it('it is a file with invalid hash',
          async (): Promise<void> => {
            const hashObj = '{"version":"1","hashes":{".":{' +
              '"contents":{"directory":{' +
              '"contents":{"anotherFileToHash.txt":"md5123456"},"hash":"sha1-123456"},' +
              '"hash":"sha1-123456"},' +
              '"hash":"sha1-123456"}}}';
            const sut = await Integrity.check(fixturesDirPath, hashObj);
            expect(sut).to.be.a('boolean').and.to.be.false;
          });

        it('the integrity object has no hash',
          async (): Promise<void> => {
            const hashObj = '{"version":"1","hashes":{".":{"contents":{},"hash":""}}}';
            const sut = await Integrity.check(fixturesDirPath, hashObj);
            expect(sut).to.be.a('boolean').and.to.be.false;
          });

      });

      context('to fail integrity check', (): void => {

        context('when the creation of the hash object', (): void => {

          it('throws an error',
            async (): Promise<void> => {
              const createStub = sandbox.stub(Integrity, 'create').throws();
              const hashObj = '{"version":"1","hashes":{".":"sha1-\\fÇ8\\u0011ÌúIÄÎ(Lo]¹tÁ"}}';

              try {
                await Integrity.check(fixturesDirPath, hashObj);
              } catch (error) {
                expect(createStub.called).to.be.true;
                expect(error).to.be.an.instanceof(Error).and.to.match(/Error/);
              }
            });

          it('returns nothing',
            async (): Promise<void> => {
              const createStub = sandbox.stub(Integrity, 'create').resolves(undefined);
              const hashObj = '{"version":"1","hashes":{".":"sha1-\\fÇ8\\u0011ÌúIÄÎ(Lo]¹tÁ"}}';
              const sut = await Integrity.check(fixturesDirPath, hashObj);
              expect(createStub.called).to.be.true;
              expect(sut).to.be.a('boolean').and.to.be.false;
            });

        });

      });

      context('provided a hash object (JSON)', (): void => {

        context('it detects the usage of', (): void => {

          it('unknown encoding',
            async (): Promise<void> => {
              const hashObj = '{"version":"1","hashes":{".":"sha1-\\u010A,F\\u0032«+{@/="}}';
              const sut = await Integrity.check(fixturesDirPath, hashObj);
              expect(sut).to.be.a('boolean').and.to.be.false;
            });

          it('no encoding',
            async (): Promise<void> => {
              const hashObj = '{"version":"1","hashes":{".":"sha1"}}';
              const sut = await Integrity.check(fixturesDirPath, hashObj);
              expect(sut).to.be.a('boolean').and.to.be.false;
            });

          it('unknown algorithm',
            async (): Promise<void> => {
              const hashObj = '{"version":"1","hashes":{".":"ddt-12A468C211G95"}}';
              const sut = await Integrity.check(fixturesDirPath, hashObj);
              expect(sut).to.be.a('boolean').and.to.be.false;
            });

          it('no algorithm',
            async (): Promise<void> => {
              const hashObj = '{"version":"1","hashes":{".":"DIjHOBHMnvpJxM4onkxvXbmcdME="}}';
              const sut = await Integrity.check(fixturesDirPath, hashObj);
              expect(sut).to.be.a('boolean').and.to.be.false;
            });

          it('invalid type',
            async (): Promise<void> => {
              const hashObj = '{"version":"1","hashes":{".":function(){}}';
              const sut = await Integrity.check(fixturesDirPath, hashObj);
              expect(sut).to.be.a('boolean').and.to.be.false;
            });

          it('function injection',
            async (): Promise<void> => {
              const hashObj = (): string => '';
              const sut = await Integrity.check(fixturesDirPath, hashObj());
              expect(sut).to.be.a('boolean').and.to.be.false;
            });

          it(`invalid 'array' type`,
            async (): Promise<void> => {
              const hashObj = '{"version":"1","hashes":{".":[]}}';
              try {
                await Integrity.check(fixturesDirPath, hashObj);
              } catch (error) {
                expect(error).to.be.an.instanceof(Error).and.to.match(/EVALER/);
              }
            });

          it(`invalid 'number' type`,
            async (): Promise<void> => {
              const hashObj = '{"version":"1","hashes":{".":0}}';
              try {
                await Integrity.check(fixturesDirPath, hashObj);
              } catch (error) {
                expect(error).to.be.an.instanceof(Error).and.to.match(/EVALER/);
              }
            });

          it(`invalid 'boolean' type`,
            async (): Promise<void> => {
              const hashObj = '{"version":"1","hashes":{".":true}}';
              try {
                await Integrity.check(fixturesDirPath, hashObj);
              } catch (error) {
                expect(error).to.be.an.instanceof(Error).and.to.match(/EVALER/);
              }
            });

          it(`invalid 'null' type`,
            async (): Promise<void> => {
              const hashObj = '{"version":"1","hashes":{".":null}}';
              try {
                await Integrity.check(fixturesDirPath, hashObj);
              } catch (error) {
                expect(error).to.be.an.instanceof(Error).and.to.match(/EVALER/);
              }
            });

          it('non-verbose creation',
            async (): Promise<void> => {
              const hashObj = '{"version":"1","hashes":{"fixtures":"sha512-' +
                'WlFP+kAPdHyGd9E8SgkFfxuGvz9l/cqjt8gAhrHDdWLBIkkZGxgxxgpWZuARLVD7ACCxq8rVeNbwNL7NKyeWsA=="}}';
              const sut = await Integrity.check(fixturesDirPath, hashObj, options);
              expect(sut).to.be.a('boolean').and.to.be.true;
            });

          it('verbose creation',
            async (): Promise<void> => {
              const sut = await Integrity.check(fixturesDirPath, integrityTestFilePath, options);
              expect(sut).to.be.a('boolean').and.to.be.true;
            });

          it(`'md5' algorithm`,
            async (): Promise<void> => {
              const hashObj = '{"version":"1","hashes":{"fixtures":"md5-03a3d76b2c52d62ce63502b85100575f"}}';
              const sut = await Integrity.check(fixturesDirPath, hashObj, options);
              expect(sut).to.be.a('boolean').and.to.be.true;
            });

          it(`'RSA-SHA1-2' algorithm`,
            async (): Promise<void> => {
              const hashObj = '{"version":"1","hashes":{"fixtures":"RSA-SHA1-2-DIjHOBHMnvpJxM4onkxvXbmcdME="}}';
              const sut = await Integrity.check(fixturesDirPath, hashObj, options);
              expect(sut).to.be.a('boolean').and.to.be.true;
            });

          it(`'sha1' algorithm`,
            async (): Promise<void> => {
              const hashObj = '{"version":"1","hashes":{"fixtures":"sha1-0c88c73811cc9efa49c4ce289e4c6f5db99c74c1"}}';
              const sut = await Integrity.check(fixturesDirPath, hashObj, options);
              expect(sut).to.be.a('boolean').and.to.be.true;
            });

          it(`'hex' encoding`,
            async (): Promise<void> => {
              const hashObj = '{"version":"1","hashes":{"fixtures":"sha1-0c88c73811cc9efa49c4ce289e4c6f5db99c74c1"}}';
              const sut = await Integrity.check(fixturesDirPath, hashObj, options);
              expect(sut).to.be.a('boolean').and.to.be.true;
            });

          it(`'base64' encoding`,
            async (): Promise<void> => {
              const hashObj = '{"version":"1","hashes":{"fixtures":"sha1-DIjHOBHMnvpJxM4onkxvXbmcdME="}}';
              const sut = await Integrity.check(fixturesDirPath, hashObj, options);
              expect(sut).to.be.a('boolean').and.to.be.true;
            });

          it(`'base64url' encoding`,
            async (): Promise<void> => {
              const hashObj = '{"version":"1","hashes":{"fixtures":"sha1-DIjHOBHMnvpJxM4onkxvXbmcdME"}}';
              const sut = await Integrity.check(fixturesDirPath, hashObj, options);
              expect(sut).to.be.a('boolean').and.to.be.true;
            });

        });

      });

      context('provided a hash string', (): void => {

        context('it detects the usage of', (): void => {

          it('unknown encoding',
            async (): Promise<void> => {
              const hash = 'sha1-\u010A,F\u0032«+{@/=';
              const sut = await Integrity.check(fixturesDirPath, hash);
              expect(sut).to.be.a('boolean').and.to.be.false;
            });

          it('unknown algorithm',
            async (): Promise<void> => {
              const hash = 'ddt-12A468C211G95';
              const sut = await Integrity.check(fixturesDirPath, hash);
              expect(sut).to.be.a('boolean').and.to.be.false;
            });

          it('non-verbose hash',
            async (): Promise<void> => {
              const hash = 'sha512-' +
                'WlFP+kAPdHyGd9E8SgkFfxuGvz9l/cqjt8gAhrHDdWLBIkkZGxgxxgpWZuARLVD7ACCxq8rVeNbwNL7NKyeWsA==';
              const sut = await Integrity.check(fixturesDirPath, hash, { strict: true });
              expect(sut).to.be.a('boolean').and.to.be.true;
            });

          it('verbose hash',
            async (): Promise<void> => {
              const sut = await Integrity.check(fixturesDirPath, integrityTestFilePath, { strict: true });
              expect(sut).to.be.a('boolean').and.to.be.true;
            });

          it(`md5' algorithm`,
            async (): Promise<void> => {
              const hash = 'md5-03a3d76b2c52d62ce63502b85100575f';
              const sut = await Integrity.check(fixturesDirPath, hash, { strict: true });
              expect(sut).to.be.a('boolean').and.to.be.true;
            });

          it(`sha1' algorithm`,
            async (): Promise<void> => {
              const hashObj = 'sha1-0c88c73811cc9efa49c4ce289e4c6f5db99c74c1';
              const sut = await Integrity.check(fixturesDirPath, hashObj, { strict: true });
              expect(sut).to.be.a('boolean').and.to.be.true;
            });

          it(`hex' encoding`,
            async (): Promise<void> => {
              const hash = 'sha1-0c88c73811cc9efa49c4ce289e4c6f5db99c74c1';
              const sut = await Integrity.check(fixturesDirPath, hash, { strict: true });
              expect(sut).to.be.a('boolean').and.to.be.true;
            });

          it(`'base64' encoding`,
            async (): Promise<void> => {
              const hash = 'sha512-' +
                'WlFP+kAPdHyGd9E8SgkFfxuGvz9l/cqjt8gAhrHDdWLBIkkZGxgxxgpWZuARLVD7ACCxq8rVeNbwNL7NKyeWsA==';
              const sut = await Integrity.check(fixturesDirPath, hash, { strict: true });
              expect(sut).to.be.a('boolean').and.to.be.true;
            });

          it(`base64url' encoding`,
            async (): Promise<void> => {
              const hash = 'sha1-DIjHOBHMnvpJxM4onkxvXbmcdME';
              const sut = await Integrity.check(fixturesDirPath, hash, { strict: true });
              expect(sut).to.be.a('boolean').and.to.be.true;
            });

        });

      });

    });

  });

});
