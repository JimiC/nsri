// tslint:disable only-arrow-functions
// tslint:disable no-unused-expression
import { expect } from 'chai';
import * as utils from '../../src/common/utils';

describe('Utils: tests', function (): void {

  context('expects', function (): void {

    context(`function 'parseJSON'`, function (): void {

      context('to return a JSON when passed parameter is of type', function (): void {

        it('string',
          function (): void {
            const data = '{"some": "valid JSON"}';
            expect(utils.parseJSON(data)).to.eql({ some: 'valid JSON' });
          });

        it('Buffer',
          function (): void {
            const data = Buffer.from('{"some": "valid JSON"}');
            expect(utils.parseJSON(data)).to.eql({ some: 'valid JSON' });
          });

      });

      it(`to return 'null' when provided text is not a valid JSON`,
        function (): void {
          const text = 'some invalid json';
          expect(utils.parseJSON(text)).to.be.null;
        });

    });

    context(`function 'sortObject'`, function (): void {

      it('to sort the object properties',
        function (): void {
          const sut = { c: [], a: '', d: {}, b: 0 };
          const expectedObj = { a: '', b: 0, c: [], d: {} };
          expect(utils.sortObject(sut)).to.eql(expectedObj);
        });

    });

    context(`function 'getIndentation'`, function (): void {

      it('to return indent info',
        function (): void {
          const info = utils.getIndentation('  ');
          expect(info.amount).to.equal(2);
          expect(info.indent).to.equal('  ');
          expect(info.type).to.equal('space');
        });

    });

    context(`function 'normalizeEntries'`, function (): void {

      it('to return the provided entries normalized',
        function (): void {
          const entries = [
            [' *', '#comment', ' # another comment', '*/ ', ' !dist', ' ', ''],
            ['*', '*/', '!dist'],
          ];
          const normalEntries = utils.normalizeEntries(entries[0]);
          expect(normalEntries).to.eql(entries[1]);
        });

      context(`function 'unique'`, function (): void {

        it('to return unique entries',
          function (): void {
            const entries = [
              ['one', 'two', 'one'],
              ['one', 'two'],
            ];

            const uniqueEntries = utils.unique(entries[0]);
            expect(uniqueEntries).to.eql(entries[1]);
          });

      });
    });

  });

});
