/* eslint-disable no-unused-expressions */
import { expect } from 'chai';
import * as utils from '../../src/common/utils';

describe('Utils: tests', (): void => {

  context('expects', (): void => {

    context(`function 'parseJSONSafe'`, (): void => {

      context('to return a JSON when passed parameter is of type', (): void => {

        it('string',
          (): void => {
            const data = '{"some": "valid JSON"}';
            expect(utils.parseJSONSafe(data)).to.eql({ some: 'valid JSON' });
          });

        it('Buffer',
          (): void => {
            const data = Buffer.from('{"some": "valid JSON"}');
            expect(utils.parseJSONSafe(data)).to.eql({ some: 'valid JSON' });
          });

      });

      it(`to return an empty JSON when provided text is not a valid JSON`,
        (): void => {
          const text = 'some invalid json';
          expect(utils.parseJSONSafe(text)).to.be.empty;
        });

    });

    context(`function 'sortObject'`, (): void => {

      it('to sort the object properties',
        (): void => {
          const sut = { c: [], a: '', d: {}, b: 0 };
          const expectedObj = { a: '', b: 0, c: [], d: {} };
          expect(utils.sortObject(sut)).to.eql(expectedObj);
        });

    });

    context(`function 'getIndentation'`, (): void => {

      it('to return indent info',
        (): void => {
          const info = utils.getIndentation('  ');
          expect(info.amount).to.equal(2);
          expect(info.indent).to.equal('  ');
          expect(info.type).to.equal('space');
        });

    });

    context(`function 'normalizeEntries'`, (): void => {

      it('to return the provided entries normalized',
        (): void => {
          const entries = [
            [' *', '#comment', ' # another comment', '*/ ', ' !dist', ' ', ''],
            ['*', '*/', '!dist'],
          ];
          const normalEntries = utils.normalizeEntries(entries[0]);
          expect(normalEntries).to.eql(entries[1]);
        });

      context(`function 'unique'`, (): void => {

        it('to return unique entries',
          (): void => {
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
