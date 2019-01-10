// tslint:disable only-arrow-functions
// tslint:disable no-unused-expression
import { expect } from 'chai';
import path from 'path';
import { Integrity } from '../../src/app/integrity';

describe('Integrity: behavior tests', function () {

  context('expects', function () {

    let anotherFileToHashFilename: string;
    let fileToHashFilename: string;
    let directoryDirPath: string;
    let directoryOneDirPath: string;
    let fixturesDirPath: string;
    let anotherFileToHashFilePath: string;
    let fileToHashFilePath: string;

    before(function () {
      anotherFileToHashFilename = 'anotherFileToHash.txt';
      fileToHashFilename = 'fileToHash.txt';
    });

    beforeEach(function () {
      fixturesDirPath = path.resolve(__dirname, '../../../test/fixtures');
      directoryDirPath = path.resolve(fixturesDirPath, 'directory');
      directoryOneDirPath = path.resolve(fixturesDirPath, 'directory.1');
      anotherFileToHashFilePath = path.resolve(directoryDirPath, anotherFileToHashFilename);
      fileToHashFilePath = path.resolve(fixturesDirPath, fileToHashFilename);
    });

    context('to pass integrity check when', function () {

      it('files have the same name and the same content',
        async function () {
          const sutFilePath = path.resolve(fixturesDirPath, './fixtures/directory/anotherFileToHash.txt');
          const hash = await Integrity.create(sutFilePath);
          const sut = await Integrity.check(anotherFileToHashFilePath, JSON.stringify(hash));
          expect(hash.hashes).to.haveOwnProperty(anotherFileToHashFilename);
          expect(sut).to.be.a('boolean').and.to.be.true;
        });

      it('directories have the same name and the same content',
        async function () {
          const sutDirPath = path.resolve(fixturesDirPath, './fixtures/directory.1');
          const hash = await Integrity.create(sutDirPath);
          const sut = await Integrity.check(directoryOneDirPath, JSON.stringify(hash));
          expect(hash.hashes).to.haveOwnProperty('directory.1');
          expect(sut).to.be.a('boolean').and.to.be.true;
        });

    });

    context('to fail integrity check when', function () {

      it('files have the same content but different names',
        async function () {
          const sutFilePath = path.resolve(fixturesDirPath, './sameContentWithFileToHash.txt');
          const hash = await Integrity.create(sutFilePath);
          const sut = await Integrity.check(fileToHashFilePath, JSON.stringify(hash));
          expect(hash.hashes).to.haveOwnProperty('sameContentWithFileToHash.txt');
          expect(sut).to.be.a('boolean').and.to.be.false;
        });

      it('files have the same name but different content',
        async function () {
          const sutFilePath = path.resolve(fixturesDirPath, './fixtures/fileToHash.txt');
          const hash = await Integrity.create(sutFilePath);
          const sut = await Integrity.check(fileToHashFilePath, JSON.stringify(hash));
          expect(hash.hashes).to.haveOwnProperty(fileToHashFilename);
          expect(sut).to.be.a('boolean').and.to.be.false;
        });

      it('directories have the same name but different content',
        async function () {
          const sutDirPath = path.resolve(fixturesDirPath, './fixtures/directory');
          const hash = await Integrity.create(sutDirPath);
          const sut = await Integrity.check(directoryDirPath, JSON.stringify(hash));
          expect(hash.hashes).to.haveOwnProperty('directory');
          expect(sut).to.be.a('boolean').and.to.be.false;
        });

      it('directories have the same content but different names',
        async function () {
          const sutDirPath = path.resolve(fixturesDirPath, './directory.1');
          const hash = await Integrity.create(sutDirPath);
          const sut = await Integrity.check(directoryDirPath, JSON.stringify(hash));
          expect(hash.hashes).to.haveOwnProperty('directory.1');
          expect(sut).to.be.a('boolean').and.to.be.false;
        });

    });

  });

});
