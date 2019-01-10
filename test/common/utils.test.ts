// tslint:disable only-arrow-functions
// tslint:disable no-unused-expression
import { expect } from 'chai';
import * as sinon from 'sinon';
import * as utils from '../../src/common/utils';
import { IndexedObject } from '../../src/interfaces/indexedObject';

describe('Utils: tests', function () {

  context('expects', function () {

    context('function \'getAbsolutePath\'', function () {

      let platformStub: sinon.SinonStub;

      beforeEach(function () {
        platformStub = sinon.stub(process, 'platform');
      });

      afterEach(function () {
        platformStub.restore();
      });

      context('to return an absolute path', function () {

        context('when provided array elements', function () {

          context('do not include the root path', function () {

            context('and the platform is', function () {

              it('*nix',
                function () {
                  platformStub.value('free-bsd');
                  const array = ['path', 'to'];
                  expect(utils.getAbsolutePath(array, array.length - 1)).to.equal('/path/to');
                });

              it('linux',
                function () {
                  platformStub.value('linux');
                  const array = ['path', 'to'];
                  expect(utils.getAbsolutePath(array, array.length - 1)).to.equal('/path/to');
                });

              it('darwin (macos)',
                function () {
                  platformStub.value('darwin');
                  const array = ['path', 'to'];
                  expect(utils.getAbsolutePath(array, array.length - 1)).to.equal('/path/to');
                });

            });

          });

          context('include the root path', function () {

            context('and the platform is', function () {

              it('win32',
                function () {
                  platformStub.value('win32');
                  const array = ['d:', 'path', 'to'];
                  expect(utils.getAbsolutePath(array, array.length - 1)).to.equal('d:/path/to');
                });

              it('*nix',
                function () {
                  platformStub.value('free-bsd');
                  const array = ['/', 'path', 'to'];
                  expect(utils.getAbsolutePath(array, array.length - 1)).to.equal('/path/to');
                });

              it('linux',
                function () {
                  platformStub.value('linux');
                  const array = ['/', 'path', 'to'];
                  expect(utils.getAbsolutePath(array, array.length - 1)).to.equal('/path/to');
                });

              it('darwin (macos)',
                function () {
                  platformStub.value('darwin');
                  const array = ['/', 'path', 'to'];
                  expect(utils.getAbsolutePath(array, array.length - 1)).to.equal('/path/to');
                });

            });

          });

        });

      });

    });

    context('function \'parseJSON\'', function () {

      context('to return a JSON when passed parameter is of type', function () {

        it('string',
          function () {
            const data = '{"some": "valid JSON"}';
            expect(utils.parseJSON(data)).to.eql({ some: 'valid JSON' });
          });

        it('Buffer',
          function () {
            const data = Buffer.from('{"some": "valid JSON"}');
            expect(utils.parseJSON(data)).to.eql({ some: 'valid JSON' });
          });

      });

      it('to return \'null\' when provided text is not a valid JSON',
        function () {
          const text = 'some invalid json';
          expect(utils.parseJSON(text)).to.be.null;
        });

    });

    context('function \'sortObject\'', function () {

      it('to sort the object properties',
        function () {
          const sut = { c: [], a: '', d: {}, b: 0 };
          const expectedObj = { a: '', b: 0, c: [], d: {} };
          expect(utils.sortObject(sut)).to.eql(expectedObj);
        });

    });

    context('function \'asyncForEach\'', function () {

      it('to return a Promise',
        function () {
          expect(utils.asyncForEach([1], () => void 0)).to.be.a('promise');
        });

      it('to call the callback function',
        function () {
          const spy = sinon.spy();
          utils.asyncForEach([1], spy);
          expect(spy.called).to.be.true;
          expect(spy.calledOnce).to.be.true;
          expect(spy.calledWith(1, 0, [1])).to.be.true;
        });

    });

    context('function \'promisify\'', function () {

      it('to throw a TypeError when passed parameter is not a function',
        function () {
          expect(utils.promisify.bind(utils, [] as any)).to.throw(TypeError);
        });

      it('to return a Promise',
        function () {
          expect(utils.promisify(() => void 0)()).to.be.a('promise');
        });

      it('to return an Error when the passed function throws one',
        async function () {
          const stub = sinon.stub().callsFake(cb => cb(new Error()));
          try {
            await utils.promisify(stub)();
          } catch (error) {
            expect(error).to.be.an.instanceof(Error);
          }
        });

      it('to correctly handle a \'true\' response',
        async function () {
          const stub = sinon.stub().callsFake(cb => cb(true));
          const response = await utils.promisify(stub)();
          return expect(response).to.be.true;
        });

      it('to correctly handle a \'false\' response',
        async function () {
          const stub = sinon.stub().callsFake(cb => cb(false));
          const response = await utils.promisify(stub)();
          expect(response).to.be.false;
        });

      it('to return all named arguments of the passed function',
        async function () {
          const stub = sinon.stub().callsFake(cb => cb(null, 1, 2, 3));
          (stub as IndexedObject)[typeof utils.promisifyArgumentNames] = ['one', 'two', 'three'];
          const response = await utils.promisify(stub)();
          return expect(response).to.eql({ one: 1, two: 2, three: 3 });
        });

      it('to return named arguments of the passed function',
        async function () {
          const stub = sinon.stub().callsFake(cb => cb(null, 1, 2, 3));
          (stub as IndexedObject)[typeof utils.promisifyArgumentNames] = ['one', 'two'];
          const response = await utils.promisify(stub)();
          return expect(response).to.eql({ one: 1, two: 2 });
        });

    });

    context('function \'getIndentation\'', function () {

      it('to return indent info',
        function () {
          const info = utils.getIndentation('  ');
          expect(info.amount).to.equal(2);
          expect(info.indent).to.equal('  ');
          expect(info.type).to.equal('space');
        });

    });

  });

});
